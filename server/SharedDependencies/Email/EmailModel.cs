namespace SharedDependencies.Email;

public record VerificationEmailModel(string VerificationLink, string Password);

public record PasswordResetEmailModel(string Code, int ExpiresInMinutes);

public record EmailChangeVerificationEmailModel(string OldEmail, string NewEmail, string VerificationLink);

public record EmailChangeNotificationEmailModel(string OldEmail, string NewEmail);