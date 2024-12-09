using System.Security.Claims;
using System.Security.Cryptography;
using DataAccess;
using DataAccess.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Service.Device;
using Service.Exceptions;

namespace Service.Security;

public interface ITokenService
{
    Task<string> GetAccessTokenAsync(User user, UserDevice device);
    Task<string> GetRefreshTokenAsync(User user, UserDevice device);
    Task<string> RotateRefreshTokenAsync(User user, UserDevice device);
}

public class JwtTokenService(IOptions<AppOptions> options, 
                             UserManager<User> userManager, 
                             AppDbContext dbContext,
                             ILogger<JwtTokenService> logger,
                             TimeProvider timeProvider,
                             IHttpContextAccessor httpContextAccessor) : ITokenService
{
    private const int RefreshTokenBytes = 32;
    private const string SignatureAlgorithm = SecurityAlgorithms.HmacSha512;

    public async Task<string> GetAccessTokenAsync(User user, UserDevice device)
    {
        var roles = await userManager.GetRolesAsync(user);
         
        var jwtSecret = Environment.GetEnvironmentVariable(options.Value.EnvVar.JwtSecret) ?? options.Value.Token.JwtSecret; 
        byte[] key = Convert.FromBase64String(jwtSecret);
        
        var claims = user.ToClaims(roles).ToList();
        claims.Add(new Claim("device_id", device.DeviceId));
        
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SignatureAlgorithm
            ),
            Subject = new ClaimsIdentity(claims),
            Expires = timeProvider.GetUtcNow().UtcDateTime.AddMinutes(options.Value.Token.AccessTokenLifetimeMinutes),
            Issuer = options.Value.Urls.Address,
            Audience = options.Value.Urls.Address
        };
        
        string token = new JsonWebTokenHandler().CreateToken(tokenDescriptor);
        logger.LogInformation("Security: Access token generated for user: {UserId}, device: {DeviceId}", user.Id, device.DeviceId);
            
        return token;
    }
    
    public async Task<string> GetRefreshTokenAsync(User user, UserDevice device)
    {
        var refreshToken = new RefreshToken
        {
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(RefreshTokenBytes)),
            UserId = user.Id,
            DeviceId = device.Id,
            CreatedAt = timeProvider.GetUtcNow().UtcDateTime,
            ExpiresAt = timeProvider.GetUtcNow().UtcDateTime.AddDays(options.Value.Token.RefreshTokenLifetimeDays),
            CreatedByIp = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString()
        };

        try 
        {
            await dbContext.RefreshTokens.AddAsync(refreshToken);
            await dbContext.SaveChangesAsync();

            logger.LogInformation("Security: New refresh token created for user: {UserId}, device: {DeviceId}, expires: {ExpiresAt}", user.Id, device.DeviceId, refreshToken.ExpiresAt); 
            
            return refreshToken.Token;
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Security: Failed to create refresh token for user: {UserId}, device: {DeviceId}", user.Id, device.DeviceId);
            throw;
        }
    }

    public async Task<string> RotateRefreshTokenAsync(User user, UserDevice device)
    {
        var oldToken = await dbContext.RefreshTokens.OrderByDescending(rt => rt.CreatedAt)
                                                    .FirstOrDefaultAsync(rt => rt.UserId == user.Id &&
                                                                               rt.DeviceId == device.Id &&
                                                                               rt.RevokedAt == null);
        
        if (oldToken is not { RevokedAt: null } || oldToken.ExpiresAt <= timeProvider.GetUtcNow().UtcDateTime)
        {
            logger.LogWarning("Security: Token rotation failed - Invalid or expired refresh token for user: {UserId}, device: {DeviceId}", user.Id, device.DeviceId);
            throw new UnauthorizedException("Invalid or expired refresh token.");
        }
        
        var refreshToken = new RefreshToken
        {
            Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(RefreshTokenBytes)),
            UserId = user.Id,
            CreatedAt = timeProvider.GetUtcNow().UtcDateTime,
            ExpiresAt = oldToken.ExpiresAt,
            DeviceId = device.Id
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
                
                logger.LogInformation("Security: Refresh token rotated for user: {UserId}, device {DeviceId}. New token ID: {NewTokenId}, expires: {ExpiresAt}", user.Id, device.Id, refreshToken.Id, refreshToken.ExpiresAt);
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                logger.LogError(ex, "Security: Failed to rotate refresh token for user: {UserId}, device {DeviceId}. Transaction rolled back", user.Id, device.Id);
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