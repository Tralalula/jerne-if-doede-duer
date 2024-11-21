using System.Security.Claims;
using DataAccess;
using DataAccess.Models;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Service.Exceptions;
using Service.Security;

namespace Service.Auth;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
    Task<RegisterResponse> RegisterAsync(RegisterRequest request); 
    Task LogoutAsync();
    Task<UserInfoResponse> UserInfoAsync(ClaimsPrincipal principal);
    Task<RefreshResponse> RefreshAsync(RefreshRequest request);
}

public class AuthService(SignInManager<User> signInManager,
                         UserManager<User> userManager,
                         ITokenClaimService tokenClaimService,
                         AppDbContext dbContext) : IAuthService
{
    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var user = await userManager.FindByEmailAsync(request.Email);
        if (user == null || !await userManager.CheckPasswordAsync(user, request.Password)) throw new UnauthorizedException("Invalid login credentials");
        
        string accessToken = await tokenClaimService.GetAccessTokenAsync(user);
        string refreshToken = await tokenClaimService.GetRefreshTokenAsync(user);
        
        return new LoginResponse(AccessToken: accessToken, RefreshToken: refreshToken);
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

    public async Task LogoutAsync()
    {
        await signInManager.SignOutAsync();
    }

    public async Task<UserInfoResponse> UserInfoAsync(ClaimsPrincipal principal)
    {
        var user = await userManager.FindByIdAsync(principal.GetUserId()) ?? throw new UnauthorizedException();
        var roles = await userManager.GetRolesAsync(user);
        bool isAdmin = roles.Contains(Role.Admin);
        
        return new UserInfoResponse(user.Email!, isAdmin);
    }

    public async Task<RefreshResponse> RefreshAsync(RefreshRequest request)
    {
        var oldToken = await dbContext.RefreshTokens.FirstOrDefaultAsync(rt => rt.Token == request.RefreshToken);
        
        if (oldToken is not { RevokedAt: null } || oldToken.ExpiresAt <= DateTime.UtcNow)
        {
            throw new UnauthorizedException("Invalid or expired refresh token.");
        }
        
        var user = await userManager.FindByIdAsync(oldToken.UserId.ToString());
        if (user == null) throw new UnauthorizedException("Invalid user.");
        
        var newAccessToken = await tokenClaimService.GetAccessTokenAsync(user);
        var newRefreshToken = await tokenClaimService.RotateRefreshTokenAsync(user);
        
        return new RefreshResponse(AccessToken: newAccessToken, RefreshToken: newRefreshToken);
    }
}