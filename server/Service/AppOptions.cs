using System.ComponentModel.DataAnnotations;

namespace Service;

public sealed class AppOptions
{
    public string AspNetCoreEnvironment { get; set; } = "";
    
    public EnvironmentVariables EnvVar { get; set; } = new();
    public DatabaseSettings Database { get; set; } = new();
    public UrlSettings Urls { get; set; } = new();
    public TokenSettings Token { get; set; } = new();
    public PasswordResetSettings PasswordReset { get; set; } = new();
    public EmailSettings Email { get; set; } = new();
}

public class EnvironmentVariables
{
    public string DatabaseUrl { get; set; } = "DATABASE_URL";
    public string JwtSecret { get; set; } = "JWT_SECRET";
}

public class DatabaseSettings
{
    public string LocalDbConn { get; set; } = "";
}

public class UrlSettings
{
    public string Address { get; set; } = "";
    public string ClientUrl { get; set; } = "";
    public string SeqUrl { get; set; } = "";
}

public class TokenSettings
{
    public int AccessTokenLifetimeMinutes { get; set; } = 15;
    public int RefreshTokenLifetimeDays { get; set; } = 7;
    public string JwtSecret { get; set; } = "";
}

public class PasswordResetSettings
{
    public int CodeMaxAttempts { get; set; } = 5;
    public int CodeExpirationMinutes { get; set; } = 15;
    
    public int MaxResetAttemptsIp { get; set; } = 5;
    public int MaxResetAttemptsEmail { get; set; } = 3;
    public int RetryAfterMinutes { get; set; } = 60; 
}

public class EmailSettings
{
    public string From { get; set; } = "";
    public string Sender { get; set; } = "";
    public string Host { get; set; } = "";
    public int Port { get; set; }
}