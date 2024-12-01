using System.Net;
using System.Net.Http.Headers;
using ApiIntegrationTests.Common;
using DataAccess;
using DataAccess.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PgCtx;
using Service;
using User = DataAccess.Models.User;

namespace ApiIntegrationTests;

public class ApiTestBase : WebApplicationFactory<Program>
{
    private readonly CookieContainer _cookieContainer;
    protected readonly TestTimeProvider TimeProvider;
    public readonly PgCtxSetup<AppDbContext> PgCtxSetup; 
    public readonly HttpClient TestHttpClient;
    public readonly string JwtSecret = "dfKDL0Rq26AEQhdHBcQkOvMNjj9S8/thdKhTVzm3UDWXfJ0gePCuWyf48VK9/hk1ID4VHqZjXpYhinms1r+Khg==";
    public readonly IServiceProvider ServiceProvider;

    protected ApiTestBase()
    {
        _cookieContainer = new CookieContainer();
        TimeProvider = new TestTimeProvider(DateTimeOffset.UtcNow);
        PgCtxSetup = new PgCtxSetup<AppDbContext>();
        Environment.SetEnvironmentVariable($"{nameof(AppOptions)}:{nameof(AppOptions.Database.LocalDbConn)}", PgCtxSetup._postgres.GetConnectionString());
        Environment.SetEnvironmentVariable($"{nameof(AppOptions)}:{nameof(AppOptions.AspNetCoreEnvironment)}", "Test");
 
        ServiceProvider = base.Services.CreateScope().ServiceProvider;
        
        TestHttpClient = CreateNewClient(); 
        
        SetAccessToken(JwtSecret);
        
        SeedAsync().GetAwaiter().GetResult();
    }
    
    public HttpClient CreateNewClient()
    {
        return CreateClient(new WebApplicationFactoryClientOptions
        {
            AllowAutoRedirect = false,
            BaseAddress = new Uri("http://localhost:5009"),
            HandleCookies = true
        });
    }
    
    public HttpClient CreateNewClient(string userAgent)
    {
        var client = CreateNewClient();
        client.DefaultRequestHeaders.Remove("User-Agent");
        client.DefaultRequestHeaders.Add("User-Agent", userAgent);
        return client;
    }
    
    public void SetAccessToken(string token)
    {
        TestHttpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }
    
    public void SetAccessToken(HttpClient client, string token)
    {
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }
    
    public void SetRefreshTokenCookie(IEnumerable<string> cookieHeaders)
    {
        foreach (var header in cookieHeaders)
        {
            if (!header.StartsWith("refreshToken=")) continue;
            
            var parts = header.Split(';');
            var cookieValue = parts[0].Split('=')[1];
            _cookieContainer.Add(new Uri("http://localhost:5009"), new Cookie("refreshToken", cookieValue, "/", "localhost"));
            break;
        }
        
        var cookies = _cookieContainer.GetCookieHeader(new Uri("http://localhost:5009"));
        
        if (string.IsNullOrEmpty(cookies)) return;
        
        TestHttpClient.DefaultRequestHeaders.Remove("Cookie");
        TestHttpClient.DefaultRequestHeaders.Add("Cookie", cookies);
    }
    
    public void SetRefreshTokenCookie(HttpClient client, IEnumerable<string> cookieHeaders)
    {
        foreach (var header in cookieHeaders)
        {
            if (!header.StartsWith("refreshToken=")) continue;
            
            var parts = header.Split(';');
            var cookieValue = parts[0].Split('=')[1];
            _cookieContainer.Add(new Uri("http://localhost:5009"), new Cookie("refreshToken", cookieValue, "/", "localhost"));
            break;
        }
        
        var cookies = _cookieContainer.GetCookieHeader(new Uri("http://localhost:5009"));
        
        if (string.IsNullOrEmpty(cookies)) return;
        
        client.DefaultRequestHeaders.Remove("Cookie");
        client.DefaultRequestHeaders.Add("Cookie", cookies); 
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
            
            services.AddSingleton<TimeProvider>(TimeProvider);
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