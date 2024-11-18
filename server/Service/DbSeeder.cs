using DataAccess;
using DataAccess.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Service;

public class DbSeeder(
    ILogger<DbSeeder> logger,
    AppDbContext context,
    UserManager<User> userManager,
    RoleManager<Role> roleManager)
{
    public async Task SeedAsync()
    {
        await context.Database.EnsureDeletedAsync();
        await context.Database.EnsureCreatedAsync();
        
        await CreateRoles(Role.All);
        await CreateUser(email: "admin@example.com", password: "Kakao1234!", role: Role.Admin);
        await CreateUser(email: "player@example.com", password: "Pepsitwist69!", role: Role.Player);
    }
    
    private async Task CreateRoles(params string[] roles)
    {
        foreach (string role in roles)
        {
            if (await roleManager.RoleExistsAsync(role)) continue;
            
            await roleManager.CreateAsync(new Role(role));
        }
    }
    
    private async Task CreateUser(string email, string password, string role)
    {
        if (await userManager.FindByEmailAsync(email) != null) return;
        
        var user = new User
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true
        };
        
        var result = await userManager.CreateAsync(user, password);
        
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                logger.LogWarning("{Code}: {Description}", error.Code, error.Description);
            }
        }
        
        await userManager.AddToRoleAsync(user, role);
    }
}