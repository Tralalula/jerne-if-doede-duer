using System.Security.Cryptography;
using System.Text;

namespace Service.Logging;

public static class LoggingExtensions
{
    public static string MaskEmail(this string email)
    {
        if (string.IsNullOrEmpty(email)) return email;
        var parts = email.Split('@');
        if (parts.Length != 2) return "[MASKED]";
        
        var username = parts[0];
        var maskedUsername = username.Length <= 2 
            ? username[0] + "***" 
            : username[0] + "***" + username[^1];
            
        return $"{maskedUsername}@{parts[1]}";
    }

    public static string GetUserTraceId(this string email)
    {
        if (string.IsNullOrEmpty(email)) return string.Empty;
        var hash = SHA256.HashData(Encoding.UTF8.GetBytes(email.ToLowerInvariant()));
        return $"USR_{Convert.ToHexString(hash)[..8]}";
    }
}