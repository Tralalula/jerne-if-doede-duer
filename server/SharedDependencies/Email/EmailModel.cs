namespace SharedDependencies.Email;

public record VerificationEmailModel(string VerificationLink);

public record PasswordResetEmailModel(string Code, int ExpiresInMinutes);