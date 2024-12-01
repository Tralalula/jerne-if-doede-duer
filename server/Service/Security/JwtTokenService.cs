using System.Security.Claims;
using System.Security.Cryptography;
using DataAccess;
using DataAccess.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Service.Exceptions;

namespace Service.Security;

public interface ITokenService
{
    Task<string> GetAccessTokenAsync(User user);
    Task<string> GetRefreshTokenAsync(User user);
    Task<string> RotateRefreshTokenAsync(User user);
}

public class JwtTokenService(IOptions<AppOptions> options, 
                             UserManager<User> userManager, 
                             AppDbContext dbContext,
                             ILogger<JwtTokenService> log) : ITokenService
{
    private const int RefreshTokenBytes = 32;
    private const string SignatureAlgorithm = SecurityAlgorithms.HmacSha512;

    public async Task<string> GetAccessTokenAsync(User user)
    {
        var roles = await userManager.GetRolesAsync(user);
         
        var jwtSecret = Environment.GetEnvironmentVariable(options.Value.EnvVar.JwtSecret) ?? options.Value.Token.JwtSecret; 
        byte[] key = Convert.FromBase64String(jwtSecret);
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SignatureAlgorithm
            ),
            Subject = new ClaimsIdentity(user.ToClaims(roles)),
            Expires = DateTime.UtcNow.AddMinutes(options.Value.Token.AccessTokenLifetimeMinutes),
            Issuer = options.Value.Urls.Address,
            Audience = options.Value.Urls.Address
        };
        
        string token = new JsonWebTokenHandler().CreateToken(tokenDescriptor);
        log.LogInformation("Security: Access token generated for user: {UserId}", user.Id);
            
        return token;
    }
    
    public async Task<string> GetRefreshTokenAsync(User user)
    {
        var refreshToken = new RefreshToken
        {
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(RefreshTokenBytes)),
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(options.Value.Token.RefreshTokenLifetimeDays) 
        };

        try 
        {
            await dbContext.RefreshTokens.AddAsync(refreshToken);
            await dbContext.SaveChangesAsync();

            log.LogInformation("Security: New refresh token created for user: {UserId}, expires: {ExpiresAt}", user.Id, refreshToken.ExpiresAt);
            
            return refreshToken.Token;
        }
        catch (Exception ex)
        {
            log.LogError(ex, "Security: Failed to create refresh token for user: {UserId}", user.Id);
            throw;
        }
    }

    public async Task<string> RotateRefreshTokenAsync(User user)
    {
        var oldToken = await dbContext.RefreshTokens.OrderByDescending(rt => rt.CreatedAt)
                                                    .FirstOrDefaultAsync(rt => rt.UserId == user.Id && rt.RevokedAt == null);
        
        if (oldToken is not { RevokedAt: null } || oldToken.ExpiresAt <= DateTime.UtcNow)
        {
            log.LogWarning("Security: Token rotation failed - Invalid or expired refresh token for user: {UserId}", user.Id);
            throw new UnauthorizedException("Invalid or expired refresh token.");
        }
        
        var refreshToken = new RefreshToken
        {
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(RefreshTokenBytes)),
            UserId = user.Id,
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = oldToken.ExpiresAt
        };
        
        await using (var transaction = await dbContext.Database.BeginTransactionAsync())
        {
            try
            {
                await dbContext.RefreshTokens.AddAsync(refreshToken);
                await dbContext.SaveChangesAsync();

                oldToken.RevokedAt = refreshToken.CreatedAt; 
                oldToken.ReplacedByTokenId = refreshToken.Id;
                
                await dbContext.SaveChangesAsync();
                await transaction.CommitAsync();
                
                log.LogInformation("Security: Refresh token rotated for user: {UserId}. New token ID: {NewTokenId}, expires: {ExpiresAt}", user.Id, refreshToken.Id, refreshToken.ExpiresAt);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                log.LogError(ex, "Security: Failed to rotate refresh token for user: {UserId}. Transaction rolled back", user.Id);
                throw;
            }
        }
        
        return await Task.FromResult(refreshToken.Token);
    }

    public static TokenValidationParameters ValidationParameters(AppOptions options)
    {
        var jwtSecret = Environment.GetEnvironmentVariable(options.EnvVar.JwtSecret) ?? options.Token.JwtSecret; 
        var key = Convert.FromBase64String(jwtSecret);
        return new TokenValidationParameters
        {
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidAlgorithms = [SignatureAlgorithm],
            
            // Important for validating tokens from a different system
            ValidIssuer = options.Urls.Address,
            ValidAudience = options.Urls.Address,
            
            // Set to 0 when validating on the same system that created the token
            ClockSkew = TimeSpan.FromSeconds(0),
            
            // Default value is true already; just here to emphasize importance
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true
        };
    }
}