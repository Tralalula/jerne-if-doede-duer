using API.ExceptionHandler;
using API.Extensions;
using DataAccess;
using DataAccess.Models;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Converters;
using NSwag;
using NSwag.Generation.Processors.Security;
using Serilog;
using Service;
using Service.Auth;
using Service.Security;

Log.Logger = new LoggerConfiguration().Enrich.FromLogContext().WriteTo.Console().CreateBootstrapLogger();

Log.Information("Starting up!");

try {
    var builder = WebApplication.CreateBuilder(args);

    // Configuration
    builder.Services.AddOptions<AppOptions>()
                    .Bind(builder.Configuration.GetSection(nameof(AppOptions)))
                    .ValidateDataAnnotations()
                    .ValidateOnStart();
                    
    #region Logging
    builder.Services.AddSerilog((services, lc) => lc
                    .ReadFrom.Configuration(builder.Configuration)
                    .ReadFrom.Services(services)
                    .Enrich.FromLogContext()
                    .WriteTo.Console());
    #endregion

    #region Data Access
    builder.Services.AddDbContext<AppDbContext>((serviceProvider, options) =>
    {
        var appOptions = serviceProvider.GetRequiredService<IOptions<AppOptions>>().Value;
        options.UseNpgsql(Environment.GetEnvironmentVariable("LocalDbConn") ?? appOptions.LocalDbConn);
    });

    builder.Services.AddScoped<DbSeeder>();
    #endregion

    #region Authentication & Authorization
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

    builder.Services.AddAuthorization(options =>
    {
        options.FallbackPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
    });
    #endregion
        
    #region Services
    builder.Services.AddValidatorsFromAssemblyContaining<ServiceAssembly>();
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<ITokenClaimService, JwtTokenClaimService>();
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
        
        configure.AddSecurity("JWT", [], new OpenApiSecurityScheme
        {
            Type = OpenApiSecuritySchemeType.ApiKey,
            Scheme = "Bearer ",
            Name = "Authorization",
            In = OpenApiSecurityApiKeyLocation.Header,
            Description = "Type into the textbox: Bearer {your JWT token}."
        });
        
        configure.OperationProcessors.Add(new AspNetCoreOperationSecurityScopeProcessor("JWT"));
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
    app.UseSerilogRequestLogging(options =>
    {
        options.MessageTemplate = "Handled {RequestMethod} {RequestPath} in {Elapsed:0.0000} ms";
        options.EnrichDiagnosticContext = (diagnosticContext, httpContext) => 
        {
            diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
            diagnosticContext.Set("UserAgent", httpContext.Request.Headers.UserAgent.ToString());
        };
    });

    app.UseStaticFiles();

    if (app.Environment.IsDevelopment())
    {
        app.UseOpenApi();
        app.UseSwaggerUi(settings =>
        {
            settings.DocumentTitle = "Jerne IF API";
            settings.DocExpansion = "list";
            settings.CustomStylesheetPath = "/swagger-ui/universal-dark.css";
        });
        
        app.Lifetime.ApplicationStarted.Register(() =>
        {
            var addresses = app.Urls;
            if (addresses.Count != 0)
            {
                Log.Information("Swagger UI available at: {SwaggerUrl}/swagger", addresses.First());
            }
        });
    }
    app.UseStatusCodePages();
    app.UseExceptionHandler();

    app.UseCors(config => config.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin());

    app.UseHttpsRedirection();

    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();

    app.Run();
    
    Log.Information("Stopped cleanly");
    return 0; // Termination 
}
catch (Exception ex)
{
    Log.Fatal(ex, "An unhandled exception occurred during bootstrapping");
    return 1; // Error
}
finally
{
    Log.CloseAndFlush();
}
public partial class Program;