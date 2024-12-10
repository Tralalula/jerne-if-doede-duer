namespace Service.Auth;

public record LoginResponse(string AccessToken);

public record RegisterResponse(string Email, string FullName);

public record UserInfoResponse(string Email, bool IsAdmin);

public record RefreshResponse(string AccessToken);