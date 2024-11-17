using DataAccess;
using DataAccess.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;

namespace Service;

public class DbSeeder
{
    private readonly ILogger<DbSeeder> _logger;
    private readonly AppDbContext _context;
    private readonly UserManager<User> _userManager;
    private readonly RoleManager<Role> _roleManager;
    
    public DbSeeder(ILogger<DbSeeder> logger,
                    AppDbContext context, 
                    UserManager<User> userManager,
                    RoleManager<Role> roleManager)
    {
        _logger = logger;
        _context = context;
        _userManager = userManager;
        _roleManager = roleManager;
    }
    
    public async Task SeedAsync()
    {
        await _context.Database.EnsureDeletedAsync();
        await _context.Database.EnsureCreatedAsync();
        
        await CreateRoles(Role.All);
        await CreateUser(email: "admind@example.com", password: "Kakao1234!", role: Role.Admin);
        await CreateUser(email: "player@example.com", password: "Pepsitwist69!", role: Role.Player);
    }
    
    private async Task CreateRoles(params string[] roles)
    {
        foreach (string role in roles)
        {
            if (await _roleManager.RoleExistsAsync(role)) continue;
            
            await _roleManager.CreateAsync(new Role(role));
        }
    }
    
    private async Task CreateUser(string email, string password, string role)
    {
        if (await _userManager.FindByEmailAsync(email) != null) return;
        
        var user = new User
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true
        };
        
        var result = await _userManager.CreateAsync(user, password);
        
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                _logger.LogWarning("{Code}: {Description}", error.Code, error.Description);
            }
        }
        
        await _userManager.AddToRoleAsync(user, role);
    }
}