using DataAccess.Models;

namespace Service.Users;

public static class UserExtensions
{
    public static string ToDbString(this RoleType role) => role switch
    {
        RoleType.Admin => Role.Admin,
        RoleType.Player => Role.Player,
        _ => throw new ArgumentOutOfRangeException(nameof(role))
    };

    public static RoleType ToRoleType(this string role) => role switch
    {
        Role.Admin => RoleType.Admin,
        Role.Player => RoleType.Player,
        _ => throw new ArgumentException($"Invalid role: {role}")
    };
}