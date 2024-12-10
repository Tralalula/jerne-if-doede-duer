namespace Service.Auth;

public record VerifyEmailQuery(string Token, string Email);

public record VerifyEmailChangeQuery(string OldEmail, string NewEmail, string Token);
