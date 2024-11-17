using DataAccess.Models;
using Microsoft.AspNetCore.Identity;
using Service.Exceptions;

namespace Service.Auth;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
}

public class AuthService(SignInManager<User> signInManager) : IAuthService
{
    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        SignInResult result = await signInManager.PasswordSignInAsync(request.Email, request.Password, isPersistent: false, lockoutOnFailure: true);
        
        if (!result.Succeeded) throw new UnauthorizedException("Invalid login credentials.");
        
        return new LoginResponse();
    }
}