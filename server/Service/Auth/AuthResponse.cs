namespace Service.Auth;

public record LoginResponse(string AccessToken, string RefreshToken);

public record RegisterResponse(string Email);

public record UserInfoResponse(string Email, bool IsAdmin);

public record RefreshResponse(string AccessToken, string RefreshToken);