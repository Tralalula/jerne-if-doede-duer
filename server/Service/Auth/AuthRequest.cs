namespace Service.Auth;

public record LoginRequest(string Email, string Password, string? DeviceName = null);

public record RegisterRequest(string Email, string Password);

public record ForgotPasswordRequest(string Email);

public record VerifyResetCodeRequest(string Email, string Code);

public record CompletePasswordResetRequest(string Email, string Code, string NewPassword);