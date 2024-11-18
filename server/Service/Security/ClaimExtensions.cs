using System.Security.Claims;
using DataAccess.Models;

namespace Service.Security;

public static class ClaimExtensions
{
    public static IEnumerable<Claim> ToClaims(this User user, IEnumerable<string> roles)
    {
        return [
            new(ClaimTypes.Email, user.Email!),
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            .. roles.Select(role => new Claim(ClaimTypes.Role, role))
        ];
    }

    public static IEnumerable<Claim> ToClaims(this User user, params string[] roles) => ToClaims(user, roles.AsEnumerable());
}