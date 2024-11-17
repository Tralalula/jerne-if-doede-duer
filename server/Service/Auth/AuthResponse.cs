namespace Service.Auth;

public record LoginResponse();

public record RegisterResponse(string Email);

public record UserInfoResponse(string Email, bool IsAdmin);