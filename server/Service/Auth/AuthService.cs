using System.Security.Claims;
using DataAccess;
using DataAccess.Models;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
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
}

public class AuthService(UserManager<User> userManager,
                         ITokenClaimService tokenClaimService,
                         AppDbContext dbContext) : IAuthService
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
        IdentityResult result = await userManager.CreateAsync(user, request.Password);
        
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(error => new ValidationFailure(
                propertyName: error.Code,
                errorMessage: error.Description
            )).ToList();
            
            throw new ValidationException("Validation failed during user registration.", errors);
        }
        
        await userManager.AddToRoleAsync(user, Role.Player);
        
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
}