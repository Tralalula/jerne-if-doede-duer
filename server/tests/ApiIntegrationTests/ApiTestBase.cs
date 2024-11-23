using System.Net.Http.Headers;
using DataAccess;
using DataAccess.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PgCtx;
using Service;

namespace ApiIntegrationTests;

public class ApiTestBase : WebApplicationFactory<Program>
{
    public readonly PgCtxSetup<AppDbContext> PgCtxSetup; 
    public readonly HttpClient TestHttpClient;
    public readonly string JwtSecret = "dfKDL0Rq26AEQhdHBcQkOvMNjj9S8/thdKhTVzm3UDWXfJ0gePCuWyf48VK9/hk1ID4VHqZjXpYhinms1r+Khg==";
    public readonly IServiceProvider ServiceProvider;

    protected ApiTestBase()
    {
        PgCtxSetup = new PgCtxSetup<AppDbContext>();
        Environment.SetEnvironmentVariable($"{nameof(AppOptions)}:{nameof(AppOptions.LocalDbConn)}", PgCtxSetup._postgres.GetConnectionString());
        Environment.SetEnvironmentVariable($"{nameof(AppOptions)}:{nameof(AppOptions.AspNetCoreEnvironment)}", "Test");
 
        ServiceProvider = base.Services.CreateScope().ServiceProvider;
        
        TestHttpClient = CreateClient();
        SetAccessToken(JwtSecret);
        
        SeedAsync().GetAwaiter().GetResult();
    }
    
    public void SetAccessToken(string token)
    {
        TestHttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }
    
    protected override IHost CreateHost(IHostBuilder builder)
    {

        builder.ConfigureServices(services =>
        {
            var descriptor = services.SingleOrDefault(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            
            if (descriptor != null) services.Remove(descriptor);
            
            services.AddDbContext<AppDbContext>(options =>
            {   
                options.UseNpgsql(PgCtxSetup._postgres.GetConnectionString());
                options.EnableSensitiveDataLogging(false);
                options.LogTo(_ => { });
            });
        });
        
        return base.CreateHost(builder);
    }
    
    private async Task SeedAsync()
    {
        var context = ServiceProvider.GetRequiredService<AppDbContext>();
        
        var roleManager = ServiceProvider.GetRequiredService<RoleManager<Role>>();
        var userManager = ServiceProvider.GetRequiredService<UserManager<User>>();
        
        await CreateRoles(roleManager, Role.All);
        await CreateUser(userManager, email: "admin@example.com", password: "Kakao1234!", role: Role.Admin);
        await CreateUser(userManager, email: "player@example.com", password: "Pepsitwist69!", role: Role.Player);
        
        await context.SaveChangesAsync();
    }
    
    private static async Task CreateRoles(RoleManager<Role> roleManager, params string[] roles)
    {
        foreach (string role in roles)
        {
            if (await roleManager.RoleExistsAsync(role)) continue;
            
            await roleManager.CreateAsync(new Role(role));
        }
    }
    
    private static async Task CreateUser(UserManager<User> userManager, string email, string password, string role)
    {
        if (await userManager.FindByEmailAsync(email) != null) return;
        
        var user = new User
        {
            UserName = email,
            Email = email,
            EmailConfirmed = true
        };
        
        await userManager.CreateAsync(user, password);
        
        await userManager.AddToRoleAsync(user, role);
    }
}