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
}

public class AuthService(ILogger<AuthService> logger,
                         UserManager<User> userManager,
                         ITokenClaimService tokenClaimService,
                         AppDbContext dbContext,
                         IFluentEmail fluentMail) : IAuthService
{
    public async Task<LoginResponse> LoginAsync(IResponseCookies cookies, LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user == null || !await userManager.CheckPasswordAsync(user, request.Password)) throw new UnauthorizedException("Invalid login credentials");
        
        string accessToken = await tokenClaimService.GetAccessTokenAsync(user);
        string refreshToken = await tokenClaimService.GetRefreshTokenAsync(user);
        
        cookies.Append("refreshToken", refreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(7)
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
        
        var verificationLink = $"http://localhost:5009/api/auth/verify-email?token={encodedToken}&email={Uri.EscapeDataString(user.Email)}";
        
        await fluentMail.To(user.Email)
                        .Subject("Velkommen til Jerne IF døde duer")
                        .Body($"For at verificere din email adresse <a href='{verificationLink}'>klik her</a>", isHtml: true)
                        .SendAsync();
        
        return new RegisterResponse(Email: user.Email);
    }

    public async Task LogoutAsync(IRequestCookieCollection requestCookies, IResponseCookies responseCookies)
    {
        var refreshToken = requestCookies["refreshToken"];
        
        if (string.IsNullOrEmpty(refreshToken)) return;
        
        var token = await dbContext.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == refreshToken);
        if (token != null)
        {
            token.RevokedAt = DateTime.UtcNow;
            await dbContext.SaveChangesAsync();
        }
        
        responseCookies.Delete("refreshToken");
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
        var refreshToken = requestCookies["refreshToken"];
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
        
        responseCookies.Append("refreshToken", newRefreshToken, new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.None,
            Expires = DateTime.UtcNow.AddDays(7)
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
}