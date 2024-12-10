namespace Service.Auth;

public record LoginResponse(string AccessToken);

public record RegisterResponse(Guid Id, string Email, string FullName);

public record UserInfoResponse(string Email, bool IsAdmin);

public record RefreshResponse(string AccessToken);