namespace Service.Auth;

public record LoginResponse(string Jwt);

public record RegisterResponse(string Email);

public record UserInfoResponse(string Email, bool IsAdmin);