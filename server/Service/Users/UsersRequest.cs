namespace Service.Users;

public record UpdateUserRequest(string FirstName, string LastName, string? PhoneNumber = null, string? NewEmail = null);