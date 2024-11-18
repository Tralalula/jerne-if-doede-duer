using API.ExceptionHandler;
using API.Extensions;
using DataAccess;
using DataAccess.Models;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Converters;
using Service;
using Service.Auth;
using Service.Security;

var builder = WebApplication.CreateBuilder(args);

// Configuration
builder.Services.AddOptions<AppOptions>()
                .Bind(builder.Configuration.GetSection(nameof(AppOptions)))
                .ValidateDataAnnotations()
                .ValidateOnStart();
                
#region Data Access
builder.Services.AddDbContext<AppDbContext>((serviceProvider, options) =>
{
    var appOptions = serviceProvider.GetRequiredService<IOptions<AppOptions>>().Value;
    options.UseNpgsql(Environment.GetEnvironmentVariable("LocalDbConn") ?? appOptions.LocalDbConn);
});

builder.Services.AddScoped<DbSeeder>();
#endregion

#region Authentication
// Identity
builder.Services.AddIdentityApiEndpoints<User>()
                .AddRoles<Role>()
                .AddEntityFrameworkStores<AppDbContext>();

// Password hashing
builder.Services.AddSingleton<IPasswordHasher<User>, Argon2idPasswordHasher<User>>();

// JWT
var appOptions = builder.Configuration.GetSection(nameof(AppOptions)).Get<AppOptions>()!;
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultSignInScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options => options.TokenValidationParameters = JwtTokenClaimService.ValidationParameters(appOptions));
builder.Services.AddScoped<ITokenClaimService, JwtTokenClaimService>();
#endregion
    
#region Services
builder.Services.AddValidatorsFromAssemblyContaining<ServiceAssembly>();
builder.Services.AddScoped<IAuthService, AuthService>();
#endregion
    
builder.Services.AddControllers()
                .AddNewtonsoftJson(options =>
                {
                    options.SerializerSettings.Converters.Add(new StringEnumConverter());
                });

builder.Services.AddOpenApiDocument(configure =>
{
    configure.Title = "Jerne IF API";
    configure.Version = "v1";
    configure.Description = "API til Jerne IF døde duer";
    configure.DocumentProcessors.Add(new MakeAllPropertiesRequiredProcessor());
});

builder.Services.AddRouting(options =>
{
    options.LowercaseUrls = true;
    //options.AppendTrailingSlash = true;
});

builder.Services.AddProblemDetails(options =>
options.CustomizeProblemDetails = ctx =>
{
    ctx.ProblemDetails.Extensions.Add("instance", $"{ctx.HttpContext.Request.Method} {ctx.HttpContext.Request.Path}");
});

builder.Services.AddExceptionHandler<ExceptionToProblemDetailsHandler>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    scope.ServiceProvider.GetRequiredService<DbSeeder>().SeedAsync().Wait();
    //context.Database.EnsureDeleted();
    //context.Database.EnsureCreated();
   // File.WriteAllText("../DataAccess/JerneIFDbSchema.sql", context.Database.GenerateCreateScript());
}

// Middleware
app.UseStaticFiles();

app.UseOpenApi();
app.UseSwaggerUi(settings =>
{
    settings.DocumentTitle = "Jerne IF API";
    settings.DocExpansion = "list";
    settings.CustomStylesheetPath = "/swagger-ui/universal-dark.css";
});
app.UseStatusCodePages();
app.UseExceptionHandler();

app.UseCors(config => config.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());
app.MapControllers();

app.UseHttpsRedirection();

app.Run();

public partial class Program;