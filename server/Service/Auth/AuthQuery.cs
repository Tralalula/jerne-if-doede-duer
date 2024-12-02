namespace Service.Auth;

public record VerifyEmailQuery(string Token, string Email);