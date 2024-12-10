namespace Service.Auth;

public record LoginRequest(string Email, string Password, string? DeviceName = null);

public record RegisterRequest(string Email, string FirstName, string LastName, string? PhoneNumber = null);

public record ForgotPasswordRequest(string Email);

public record VerifyResetCodeRequest(string Email, string Code);

public record CompletePasswordResetRequest(string Email, string Code, string NewPassword);