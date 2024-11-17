using Microsoft.AspNetCore.Identity;

namespace DataAccess.Models;

public class Role : IdentityRole<Guid>
{
    public const string Admin = "Admin";
    public const string Player = "Player";
    
    public static string[] All => [Admin, Player];

    public Role() : base() { }
    
    public Role(string roleName) : base(roleName) { }
}