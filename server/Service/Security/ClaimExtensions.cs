using System.Security.Claims;
using DataAccess.Models;
using Service.Exceptions;

namespace Service.Security;

public static class ClaimExtensions
{
    public static Guid GetUserId(this ClaimsPrincipal principal)
    {
        var userIdClaim = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? throw new UnauthorizedException("User ID claim not found");
            
        return Guid.Parse(userIdClaim);
    }
    
    public static IEnumerable<Claim> ToClaims(this User user, IEnumerable<string> roles)
    {
        return [
            new Claim(ClaimTypes.Email, user.Email!),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            .. roles.Select(role => new Claim(ClaimTypes.Role, role))
        ];
    }

    public static IEnumerable<Claim> ToClaims(this User user, params string[] roles) => ToClaims(user, roles.AsEnumerable());
    
    public static ClaimsPrincipal ToPrincipal(this User user, IEnumerable<string> roles) => 
        new ClaimsPrincipal(new ClaimsIdentity(user.ToClaims(roles)));
        
    public static ClaimsPrincipal ToPrincipal(this User user, params string[] roles) =>
        new ClaimsPrincipal(new ClaimsIdentity(user.ToClaims(roles.AsEnumerable())));
}