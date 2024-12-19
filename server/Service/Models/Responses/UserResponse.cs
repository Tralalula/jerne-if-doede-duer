using DataAccess.Models;

namespace Service.Models.Responses;

public class UserResponse
{
    public Guid Id { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }

    public static UserResponse FromEntity(User user)
    {
        var newResponse = new UserResponse
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName
        };
        return newResponse;
    }
}