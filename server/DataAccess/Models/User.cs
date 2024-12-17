using System.ComponentModel.DataAnnotations;
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
    [NotMapped]
    public string FullName => $"{FirstName} {LastName}".Trim();
    
    [StringLength(50)] 
    public string FirstName { get; set; } = string.Empty;
    
    [StringLength(50)] 
    public string LastName { get; set; } = string.Empty;
    
    public int Credits { get; set; } = 0;
    public UserStatus Status { get; set; } = UserStatus.Active;
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}