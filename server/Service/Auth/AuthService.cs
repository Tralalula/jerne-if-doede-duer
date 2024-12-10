using System.Security.Claims;
using DataAccess;
using DataAccess.Models;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Service.Device;
using Service.Email;
using Service.Exceptions;
using Service.Logging;
using Service.Security;

namespace Service.Auth;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(IResponseCookies cookies, LoginRequest request);
    Task<RegisterResponse> RegisterAsync(RegisterRequest request); 
    Task LogoutAsync(IRequestCookieCollection requestCookies, IResponseCookies responseCookies);
    Task<UserInfoResponse> UserInfoAsync(ClaimsPrincipal principal);
    Task<RefreshResponse> RefreshAsync(IRequestCookieCollection requestCookies, IResponseCookies responseCookies);
    Task<bool> VerifyEmailAsync(string token, string email);
    Task<bool> InitiatePasswordResetAsync(string email);
    Task<bool> VerifyPasswordResetAsync(VerifyResetCodeRequest request);
    Task<bool> CompletePasswordResetAsync(CompletePasswordResetRequest request);
}

public class AuthService(IOptions<AppOptions> options,
                         ILogger<AuthService> logger,
                         UserManager<User> userManager,
                         ITokenService tokenService,
                         AppDbContext dbContext,
                         IEmailService emailService,
                         IHttpContextAccessor httpContextAccessor,
                         TimeProvider timeProvider,
                         IDeviceService deviceService) : IAuthService
{
    private const string RefreshTokenCookieName = "refreshToken";

    public async Task<LoginResponse> LoginAsync(IResponseCookies cookies, LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user == null || !await userManager.CheckPasswordAsync(user, request.Password))
        { 
            logger.LogWarning("Security: Invalid login credentials. TraceId: {TraceId}, IP: {IpAddress}", request.Email.GetUserTraceId(), httpContextAccessor.HttpContext?.Connection.RemoteIpAddress);
            throw new UnauthorizedException("Invalid login credentials");
        }
        
        var userAgent = httpContextAccessor.HttpContext?.Request.Headers.UserAgent.ToString();
        var deviceName = DeviceService.GetDeviceName(request.DeviceName, userAgent);
        var device = await deviceService.GetOrCreateDeviceAsync(user, deviceName, userAgent);
        
        logger.LogInformation("Security: Successful login. UserId: {UserId}, DeviceId: {DeviceId}, IP: {IpAddress}", user.Id, device.DeviceId, httpContextAccessor.HttpContext?.Connection.RemoteIpAddress);
        
        string accessToken = await tokenService.GetAccessTokenAsync(user, device);
        string refreshToken = await tokenService.GetRefreshTokenAsync(user, device);
        
        cookies.Append(RefreshTokenCookieName, refreshToken, GetRefreshTokenCookieOptions());
        
        return new LoginResponse(AccessToken: accessToken);
    }

    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request)
    {
        var user = new User { Email = request.Email, UserName = request.Email, FirstName = request.FirstName, LastName = request.LastName, PhoneNumber = request.PhoneNumber };
        var password = DanishPasswordGenerator.GeneratePassword();
        var result = await userManager.CreateAsync(user, password);
        
        
        if (!result.Succeeded)
        {
            logger.LogWarning("Registration failed. TraceId: {TraceId}", request.Email.GetUserTraceId());
            var errors = result.Errors.Select(error => new ValidationFailure(
                propertyName: error.Code,
                errorMessage: error.Description
            )).ToList();
            
            throw new ValidationException("Validation failed during user registration.", errors);
        }
        
        await userManager.AddToRoleAsync(user, Role.Player);
       
        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token); 
        
        var verificationLink = $"{options.Value.Urls.Address}/api/auth/verify-email?token={encodedToken}&email={Uri.EscapeDataString(user.Email)}";
        
        await emailService.SendWelcomeEmailAsync(user.Email, verificationLink, password);
        
        logger.LogInformation("New user registered. UserId: {UserId}, TraceId: {TraceId}", user.Id, request.Email.GetUserTraceId());
        return new RegisterResponse(Email: user.Email, FullName: user.FullName);
    }

    public async Task LogoutAsync(IRequestCookieCollection requestCookies, IResponseCookies responseCookies)
    {
        var refreshToken = requestCookies[RefreshTokenCookieName];
        
        if (string.IsNullOrEmpty(refreshToken)) return;
        
        var token = await dbContext.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == refreshToken);
        if (token != null)
        {
            token.RevokedAt = timeProvider.GetUtcNow().UtcDateTime;
            var device = await dbContext.UserDevices.FirstOrDefaultAsync(d => d.Id == token.DeviceId);
            if (device != null) await deviceService.RevokeDeviceAsync(token.UserId, device.DeviceId);
            await dbContext.SaveChangesAsync();
            logger.LogInformation("User logged out and refresh token revoked. UserId: {UserId}, DeviceId: {DeviceId}", token.UserId, device?.DeviceId);
        }
        
        responseCookies.Delete(RefreshTokenCookieName);
    }

    public async Task<UserInfoResponse> UserInfoAsync(ClaimsPrincipal principal)
    {
        var user = await userManager.FindByIdAsync(principal.GetUserId().ToString()) ?? throw new UnauthorizedException();
        var roles = await userManager.GetRolesAsync(user);
        bool isAdmin = roles.Contains(Role.Admin);
        
        return new UserInfoResponse(user.Email!, isAdmin);
    }

    public async Task<RefreshResponse> RefreshAsync(IRequestCookieCollection requestCookies, IResponseCookies responseCookies)
    {
        var refreshToken = requestCookies[RefreshTokenCookieName];
        if (string.IsNullOrEmpty(refreshToken)) throw new UnauthorizedException("Refresh token is missing");
        
        var oldToken = await dbContext.RefreshTokens.Include(rt => rt.Device)
                                                    .FirstOrDefaultAsync(rt => rt.Token == refreshToken);
        
        if (oldToken is not { RevokedAt: null } || oldToken.ExpiresAt <= timeProvider.GetUtcNow().UtcDateTime)
        {
            logger.LogWarning("Security: Invalid refresh token used. TokenId: {TokenId}, UserId: {UserId}, DeviceId: {DeviceId}", oldToken?.Id, oldToken?.UserId, oldToken?.Device?.DeviceId);
            throw new UnauthorizedException("Invalid or expired refresh token.");
        }
        
        if (oldToken.Device == null)
        {
            logger.LogWarning("Security: Refresh token used for deleted device. TokenId: {TokenId}, UserId: {UserId}", oldToken.Id, oldToken.UserId);
            throw new UnauthorizedException("Device has been logged out.");
        }
        
        var user = await userManager.FindByIdAsync(oldToken.UserId.ToString());
        if (user == null) throw new UnauthorizedException("Invalid user.");

        var newAccessToken = await tokenService.GetAccessTokenAsync(user, oldToken.Device);
        var newRefreshToken = await tokenService.RotateRefreshTokenAsync(user, oldToken.Device);
        
        responseCookies.Append(RefreshTokenCookieName, newRefreshToken, GetRefreshTokenCookieOptions());
        
        logger.LogInformation("Security: Token refreshed. UserId: {UserId}, OldTokenId: {OldTokenId}, DeviceId: {DeviceId}", oldToken.UserId, oldToken.Id, oldToken.Device.DeviceId);
        return new RefreshResponse(AccessToken: newAccessToken);
    }
    
    public async Task<bool> VerifyEmailAsync(string token, string email)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user == null)
        { 
            logger.LogWarning("Email verification attempted for non-existent user. TraceId: {TraceId}", email.GetUserTraceId());
            return false;
        }
        
        var result = await userManager.ConfirmEmailAsync(user, token);
        
        if (result.Succeeded) logger.LogInformation("Email verified successfully. UserId: {UserId}, TraceId: {TraceId}", user.Id, email.GetUserTraceId());
        else logger.LogWarning("Email verification failed. UserId: {UserId}, TraceId: {TraceId}", user.Id, email.GetUserTraceId());
        
        return result.Succeeded;
    }

    public async Task<bool> InitiatePasswordResetAsync(string email)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user == null) return true; // Sikkerhed; vi viser ikke om en email eksisterer eller ej
        
        var ipAddress = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
        logger.LogInformation("Password reset initiated. TraceId: {TraceId}, IP: {IpAddress}, Email: {MaskedEmail}", email.GetUserTraceId(), ipAddress, email.MaskEmail());
        
        var cutoffTime = timeProvider.GetUtcNow().UtcDateTime.AddMinutes(-options.Value.PasswordReset.RetryAfterMinutes);
        
        var recentAttemptsFromIp = await dbContext.PasswordResetCodes.CountAsync(x => x.IpAddress == ipAddress && x.CreatedAt > cutoffTime);
        if (recentAttemptsFromIp >= options.Value.PasswordReset.MaxResetAttemptsIp) 
        {
            logger.LogWarning("Security: Password reset rate limit exceeded for IP: {IpAddress}. Attempts: {AttemptCount}", ipAddress, recentAttemptsFromIp);
            throw new TooManyRequestsException("Too many reset attempts from this IP", retryAfterSeconds: options.Value.PasswordReset.RetryAfterMinutes * 60);
        }
        
        var recentAttemptsForEmail = await dbContext.PasswordResetCodes.CountAsync(x => x.Email == email && x.CreatedAt > cutoffTime);
        if (recentAttemptsForEmail >= options.Value.PasswordReset.MaxResetAttemptsEmail)
        {
            logger.LogWarning("Security: Password reset rate limit exceeded for TraceId: {TraceId}. Attempts: {AttemptCount}", email.GetUserTraceId(), recentAttemptsForEmail);
            throw new TooManyRequestsException("Too many reset attempts for this email", retryAfterSeconds:  options.Value.PasswordReset.RetryAfterMinutes * 60);
        }
        
        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var sixDigitCode = Random.Shared.Next(100000, 999999).ToString();

        
        var now = timeProvider.GetUtcNow().UtcDateTime;
        var resetCode = new PasswordResetCode
        {
            Email = email,
            Code = sixDigitCode,
            Token = token,
            CreatedAt = now,
            ExpiresAt = now.AddMinutes(options.Value.PasswordReset.CodeExpirationMinutes),
            IpAddress = ipAddress
        };
        
        await dbContext.PasswordResetCodes.AddAsync(resetCode);
        await dbContext.SaveChangesAsync();
        
        await emailService.SendPasswordResetCodeAsync(email, sixDigitCode, TimeSpan.FromMinutes(options.Value.PasswordReset.CodeExpirationMinutes)); 
                        
        logger.LogInformation("Password reset initiated for user: {UserId}, from IP: {IpAddress}, TraceID: {TraceId}", user.Id, ipAddress, email.GetUserTraceId());
        return true;
    }

    public async Task<bool> VerifyPasswordResetAsync(VerifyResetCodeRequest request)
    {
        var resetCode = await VerifyAndUpdateResetCodeAsync(request.Email, request.Code);
        if (resetCode == null) logger.LogWarning("Security: Invalid reset code attempt. TraceId: {TraceId}, IP: {IpAddress}", request.Email.GetUserTraceId(), httpContextAccessor.HttpContext?.Connection.RemoteIpAddress);
        return resetCode != null;
    }

    public async Task<bool> CompletePasswordResetAsync(CompletePasswordResetRequest request)
    {
        var resetCode = await VerifyAndUpdateResetCodeAsync(request.Email, request.Code);
        if (resetCode == null) return false;
        
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user == null) return false;
        
        var result = await userManager.ResetPasswordAsync(user, resetCode.Token, request.NewPassword);
        if (!result.Succeeded) return false;
        
        resetCode.IsUsed = true;
        await dbContext.SaveChangesAsync();
        
        logger.LogInformation("Password reset completed successfully. UserId: {UserId}, TraceId: {TraceId}", user.Id, request.Email.GetUserTraceId());
        return true;
    }
    
    private CookieOptions GetRefreshTokenCookieOptions() => new()
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.None,
        Expires = timeProvider.GetUtcNow().UtcDateTime.AddDays(options.Value.Token.RefreshTokenLifetimeDays)
    };
    
    private async Task<PasswordResetCode?> VerifyAndUpdateResetCodeAsync(string email, string code)
    {
        var resetCode = await dbContext.PasswordResetCodes.FirstOrDefaultAsync(rc => rc.Email == email && 
                                                                                     rc.Code == code &&
                                                                                     rc.ExpiresAt > timeProvider.GetUtcNow().UtcDateTime &&
                                                                                     !rc.IsUsed);
        if (resetCode != null)
        {
            resetCode.AttemptCount++;
            if (resetCode.AttemptCount >= options.Value.PasswordReset.CodeMaxAttempts)
            {
                logger.LogWarning("Security: Reset code max attempts reached. TraceId: {TraceId}, AttemptCount: {AttemptCount}", email.GetUserTraceId(), resetCode.AttemptCount);
                resetCode.IsUsed = true;
            }
            await dbContext.SaveChangesAsync();
            return resetCode.IsUsed ? null : resetCode;
        }
        
        // Kig efter eksisterende kode hvis reset kode ikke findes
        var existingCode = await dbContext.PasswordResetCodes.FirstOrDefaultAsync(rc => rc.Email == email && 
                                                                                        !rc.IsUsed && 
                                                                                        rc.ExpiresAt > timeProvider.GetUtcNow().UtcDateTime);
        if (existingCode == null) return null;
        
        existingCode.AttemptCount++;
        if (existingCode.AttemptCount >= options.Value.PasswordReset.CodeMaxAttempts) existingCode.IsUsed = true;
        await dbContext.SaveChangesAsync();
        
        return null;
    }
}