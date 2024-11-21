namespace Service.Auth;

public record LoginRequest(string Email, string Password);

public record RegisterRequest(string Email, string Password);

public record RefreshRequest(string RefreshToken);