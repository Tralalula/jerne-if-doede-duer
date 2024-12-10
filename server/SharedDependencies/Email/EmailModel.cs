namespace SharedDependencies.Email;

public record VerificationEmailModel(string VerificationLink, string Password);

public record PasswordResetEmailModel(string Code, int ExpiresInMinutes);