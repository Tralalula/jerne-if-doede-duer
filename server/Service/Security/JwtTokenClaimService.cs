using System.Security.Claims;
using DataAccess.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Service.Exceptions;

namespace Service.Security;

public interface ITokenClaimService
{
    Task<string> GetTokenAsync(string email);
}

public class JwtTokenClaimService(IOptions<AppOptions> options, UserManager<User> userManager) : ITokenClaimService
{
    private const string SignatureAlgorithm = SecurityAlgorithms.HmacSha512;

    public async Task<string> GetTokenAsync(string email)
    {
        var user = await userManager.FindByEmailAsync(email) ?? throw new NotFoundException($"User with email: {email} not found");
        var roles = await userManager.GetRolesAsync(user);
        
        byte[] key = Convert.FromBase64String(options.Value.JwtSecret);
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SignatureAlgorithm
            ),
            Subject = new ClaimsIdentity(user.ToClaims(roles)),
            Expires = DateTime.UtcNow.AddDays(7),
            Issuer = options.Value.Address,
            Audience = options.Value.Address
        };
        
        string token = new JsonWebTokenHandler().CreateToken(tokenDescriptor);
        
        return token;
    }
    
    public static TokenValidationParameters ValidationParameters(AppOptions options)
    {
        var key = Convert.FromBase64String(options.JwtSecret);
        return new TokenValidationParameters
        {
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidAlgorithms = [SignatureAlgorithm],
            
            // Important for validating tokens from a different system
            ValidIssuer = options.Address,
            ValidAudience = options.Address,
            
            // Set to 0 when validating on the same system that created the token
            ClockSkew = TimeSpan.FromSeconds(0),
            
            // Default value is true already; just here to emphasize importance
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true
        };
    }
}