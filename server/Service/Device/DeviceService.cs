using System.Security.Cryptography;
using System.Text;
using DataAccess;
using DataAccess.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Service.Exceptions;

namespace Service.Device;

public interface IDeviceService
{
    Task<List<UserDevice>> GetUserDevicesAsync(Guid userId);
    Task<UserDevice> GetOrCreateDeviceAsync(User user, string deviceName, string? userAgent);
    Task RevokeDeviceAsync(Guid userId, string deviceId);
    Task ValidateDeviceLimitAsync(Guid userId);
}

public class DeviceService(AppDbContext dbContext,
                           IHttpContextAccessor httpContextAccessor,
                           TimeProvider timeProvider) : IDeviceService
{
    private const int MaxDevices = 5;

    public async Task<List<UserDevice>> GetUserDevicesAsync(Guid userId)
    {
        return await dbContext.UserDevices.Where(d => d.UserId == userId)
                                          .OrderByDescending(d => d.LastUsedAt)
                                          .ToListAsync();
                                            
    }

    public async Task<UserDevice> GetOrCreateDeviceAsync(User user, string deviceName, string? userAgent)
    {
        var deviceId = GenerateDeviceId(user.Id, deviceName, userAgent);
        
        var device = await dbContext.UserDevices.FirstOrDefaultAsync(d => d.DeviceId == deviceId && d.UserId == user.Id);
        
        if (device != null)
        {
            device.LastUsedAt = timeProvider.GetUtcNow().UtcDateTime;
            device.UserAgent = userAgent;
            return device;
        }
        
        await ValidateDeviceLimitAsync(user.Id);
        
        device = new UserDevice
        {
            UserId = user.Id,
            DeviceId = deviceId,
            DeviceName = deviceName,
            CreatedAt = timeProvider.GetUtcNow().UtcDateTime,
            LastUsedAt = timeProvider.GetUtcNow().UtcDateTime,
            CreatedByIp = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString(),
            UserAgent = userAgent
        };
        
        await dbContext.UserDevices.AddAsync(device);
        await dbContext.SaveChangesAsync();

        return device;
    }

    public async Task RevokeDeviceAsync(Guid userId, string deviceId)
    {
        var device = await dbContext.UserDevices.Include(d => d.RefreshTokens)
                                                .FirstOrDefaultAsync(d => d.DeviceId == deviceId && d.UserId == userId);
        
        if (device == null) return;
        
        var now = timeProvider.GetUtcNow().UtcDateTime;
        var revokedByIp = httpContextAccessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
        
        await dbContext.RefreshTokens.Where(rt => rt.DeviceId == device.Id)
                                     .ExecuteUpdateAsync(s => s.SetProperty(b => b.RevokedAt, now).SetProperty(b => b.RevokedByIp, revokedByIp));
        
        dbContext.UserDevices.Remove(device);
        await dbContext.SaveChangesAsync();
    }

    public async Task ValidateDeviceLimitAsync(Guid userId)
    {
        var devices = await dbContext.UserDevices.Include(d => d.RefreshTokens).Where(d => d.UserId == userId).ToListAsync();
        
        foreach (var device in devices)
        {
            bool hasValidToken = device.RefreshTokens.Any(rt => rt.RevokedAt == null && rt.ExpiresAt > timeProvider.GetUtcNow().UtcDateTime);
            if (!hasValidToken) dbContext.UserDevices.Remove(device);
        }
        
        await dbContext.SaveChangesAsync();
        
        var deviceCount = await dbContext.UserDevices.CountAsync(d => d.UserId == userId);
        if (deviceCount >= MaxDevices) throw new BadRequestException("Maximum number of devices reached. Please remove an existing device before adding a new one.");
    }
    
    private static string GenerateDeviceId(Guid userId, string deviceName, string? userAgent)
    {
        var input = $"{userId}-{deviceName}-{userAgent}";
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return Convert.ToBase64String(hash);
    }
    
    public static string GetDeviceName(string? providedName, string? userAgent)
    {
        if (!string.IsNullOrWhiteSpace(providedName)) return providedName;
        if (string.IsNullOrWhiteSpace(userAgent)) return "Unknown Device";
        
        if (userAgent.Contains("Mobile") || userAgent.Contains("Android") || userAgent.Contains("iPhone"))
        {
            if (userAgent.Contains("iPhone")) return "iPhone";
            if (userAgent.Contains("Android")) return "Android Device";
            return "Mobile Device";
        }
        
        if (userAgent.Contains("Windows")) return "Windows PC";
        if (userAgent.Contains("Mac")) return "Mac";
        if (userAgent.Contains("Linux")) return "Linux PC";
    
        return "Desktop Browser";
    }
}