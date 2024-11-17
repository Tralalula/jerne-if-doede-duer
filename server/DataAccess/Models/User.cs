using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.AspNetCore.Identity;

namespace DataAccess.Models;

public enum UserStatus
{
    Active,
    Inactive
}

public partial class User : IdentityUser<Guid>
{
    public int Credits { get; set; } = 0;
    public UserStatus Status { get; set; } = UserStatus.Active;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}