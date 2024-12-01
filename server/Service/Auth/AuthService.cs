using System.Net;
using System.Security.Claims;
using DataAccess;
using DataAccess.Models;
using FluentEmail.Core;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Service.Exceptions;
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
                         ITokenClaimService tokenClaimService,
                         AppDbContext dbContext,
                         IFluentEmail fluentMail,
                         IHttpContextAccessor httpContextAccessor) : IAuthService
{
    private const string RefreshTokenCookieName = "refreshToken";

    public async Task<LoginResponse> LoginAsync(IResponseCookies cookies, LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user == null || !await userManager.CheckPasswordAsync(user, request.Password)) throw new UnauthorizedException("Invalid login credentials");
        
        string accessToken = await tokenClaimService.GetAccessTokenAsync(user);
        string refreshToken = await tokenClaimService.GetRefreshTokenAsync(user);
        
        cookies.Append(RefreshTokenCookieName, refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(options.Value.Token.RefreshTokenLifetimeDays)
        });
        
        return new LoginResponse(AccessToken: accessToken);
    }

    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request)
    {
        var user = new User { Email = request.Email, UserName = request.Email };
        var result = await userManager.CreateAsync(user, request.Password);
        
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(error => new ValidationFailure(
                propertyName: error.Code,
                errorMessage: error.Description
            )).ToList();
            
            throw new ValidationException("Validation failed during user registration.", errors);
        }
        
        await userManager.AddToRoleAsync(user, Role.Player);
       
        var token = await userManager.GenerateEmailConfirmationTokenAsync(user);
        var encodedToken = Uri.EscapeDataString(token); 
        
        // skal ændres i Produktion, men mangler løsning for mail i produktion først.
        var verificationLink = $"http://localhost:5009/api/auth/verify-email?token={encodedToken}&email={Uri.EscapeDataString(user.Email)}";
        
        await fluentMail.To(user.Email)
                        .Subject("Velkommen til Jerne IF døde duer")
                        .Body($"For at verificere din email adresse <a href='{verificationLink}'>klik her</a>", isHtml: true)
                        .SendAsync();
        
        return new RegisterResponse(Email: user.Email);
    }

    public async Task LogoutAsync(IRequestCookieCollection requestCookies, IResponseCookies responseCookies)
    {
        var refreshToken = requestCookies[RefreshTokenCookieName];
        
        if (string.IsNullOrEmpty(refreshToken)) return;
        
        var token = await dbContext.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == refreshToken);
        if (token != null)
        {
            token.RevokedAt = DateTime.UtcNow;
            await dbContext.SaveChangesAsync();
        }
        
        responseCookies.Delete(RefreshTokenCookieName);
    }

    public async Task<UserInfoResponse> UserInfoAsync(ClaimsPrincipal principal)
    {
        var user = await userManager.FindByIdAsync(principal.GetUserId()) ?? throw new UnauthorizedException();
        var roles = await userManager.GetRolesAsync(user);
        bool isAdmin = roles.Contains(Role.Admin);
        
        return new UserInfoResponse(user.Email!, isAdmin);
    }

    public async Task<RefreshResponse> RefreshAsync(IRequestCookieCollection requestCookies, IResponseCookies responseCookies)
    {
        var refreshToken = requestCookies[RefreshTokenCookieName];
        if (string.IsNullOrEmpty(refreshToken)) throw new UnauthorizedException("Refresh token is missing");
        
        var oldToken = await dbContext.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == refreshToken);
        
        if (oldToken is not { RevokedAt: null } || oldToken.ExpiresAt <= DateTime.UtcNow)
        {
            throw new UnauthorizedException("Invalid or expired refresh token.");
        }
        
        var user = await userManager.FindByIdAsync(oldToken.UserId.ToString());
        if (user == null) throw new UnauthorizedException("Invalid user.");
        
        var newAccessToken = await tokenClaimService.GetAccessTokenAsync(user);
        var newRefreshToken = await tokenClaimService.RotateRefreshTokenAsync(user);
        
        responseCookies.Append(RefreshTokenCookieName, newRefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(options.Value.Token.RefreshTokenLifetimeDays)
        });
        
        return new RefreshResponse(AccessToken: newAccessToken);
    }
    
    public async Task<bool> VerifyEmailAsync(string token, string email)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user == null)
        { 
            return false;
        }
        
        var result = await userManager.ConfirmEmailAsync(user, token);
        return result.Succeeded;
    }

    public async Task<bool> InitiatePasswordResetAsync(string email)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user == null) return true; // Sikkerhed; vi viser ikke om en email eksisterer eller ej
        
        var ipAddress = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
        logger.LogInformation($"IP address {ipAddress} initiated password reset for email {email}");
        
        var cutoffTime = DateTime.UtcNow.AddMinutes(-options.Value.PasswordReset.RetryAfterMinutes);
        
        var recentAttemptsFromIp = await dbContext.PasswordResetCodes.CountAsync(x => x.IpAddress == ipAddress && 
                                                                                 x.CreatedAt > cutoffTime);
                                                                                 
        if (recentAttemptsFromIp >= options.Value.PasswordReset.MaxResetAttemptsIp) throw new TooManyRequestsException("Too many reset attempts from this IP", retryAfterSeconds: options.Value.PasswordReset.RetryAfterMinutes * 60);
        
        var recentAttemptsForEmail = await dbContext.PasswordResetCodes.CountAsync(x => x.Email == email &&
                                                                                   x.CreatedAt > cutoffTime);
        
        if (recentAttemptsForEmail >= options.Value.PasswordReset.MaxResetAttemptsEmail) throw new TooManyRequestsException("Too many reset attempts for this email", retryAfterSeconds:  options.Value.PasswordReset.RetryAfterMinutes * 60);
        
        var token = await userManager.GeneratePasswordResetTokenAsync(user);
        var sixDigitCode = Random.Shared.Next(100000, 999999).ToString();

        
        var now = DateTime.UtcNow;
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
        
        await fluentMail.To(email)
                        .Subject("Password Reset Code")
                        .Body($"Your password reset code is: {sixDigitCode}<br>This code will expire in 15 minutes.", isHtml: true)
                        .SendAsync();
        
        return true;
    }

    public async Task<bool> VerifyPasswordResetAsync(VerifyResetCodeRequest request)
    {
        var resetCode = await VerifyAndUpdateResetCodeAsync(request.Email, request.Code);
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
        return true;
    }
    
    private async Task<PasswordResetCode?> VerifyAndUpdateResetCodeAsync(string email, string code)
    {
        var resetCode = await dbContext.PasswordResetCodes.FirstOrDefaultAsync(rc => rc.Email == email && 
                                                                                     rc.Code == code &&
                                                                                     rc.ExpiresAt > DateTime.UtcNow &&
                                                                                     !rc.IsUsed);
        if (resetCode != null)
        {
            resetCode.AttemptCount++;
            if (resetCode.AttemptCount >= options.Value.PasswordReset.CodeMaxAttempts) resetCode.IsUsed = true;
            await dbContext.SaveChangesAsync();
            return resetCode.IsUsed ? null : resetCode;
        }
        
        // Kig efter eksisterende kode hvis reset kode ikke findes
        var existingCode = await dbContext.PasswordResetCodes.FirstOrDefaultAsync(rc => rc.Email == email && 
                                                                                        !rc.IsUsed && 
                                                                                        rc.ExpiresAt > DateTime.UtcNow);
        if (existingCode == null) return null;
        
        existingCode.AttemptCount++;
        if (existingCode.AttemptCount >= options.Value.PasswordReset.CodeMaxAttempts) existingCode.IsUsed = true;
        await dbContext.SaveChangesAsync();
        
        return null;
    }
}