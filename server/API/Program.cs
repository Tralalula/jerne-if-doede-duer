using API.ExceptionHandler;
using API.Extensions;
using API.Helpers;
using DataAccess;
using DataAccess.Models;
using FluentEmail.MailKitSmtp;
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
using Service.BalanceHistory;
using Service.Device;
using Service.Email;
using Service.Security;
using Service.Transaction;
using Service.Users;

#region Boostrap Logger
Log.Logger = new LoggerConfiguration().Enrich.FromLogContext()
                                      .WriteTo.Console()
                                      .CreateBootstrapLogger();

Log.Information("Starting up!");
#endregion

// Try/Catch pga., Serilog Log.CloseAndFlush()
try {
    var builder = WebApplication.CreateBuilder(args);
    
    #region AppOptions
    builder.Services.AddOptions<AppOptions>()
                    .BindConfiguration(nameof(AppOptions))
                    .ValidateDataAnnotations()
                    .ValidateOnStart();
        
    var appOptions = builder.Configuration.GetSection(nameof(AppOptions)).Get<AppOptions>();
    if (appOptions == null) throw new InvalidOperationException("AppOptions missing or invalid");
    

    builder.Configuration.AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
                         .AddJsonFile($"appsettings.{appOptions.AspNetCoreEnvironment}.json", optional: true, reloadOnChange: true);
                         
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowClient", policy => policy.SetIsOriginAllowed(origin => new Uri(origin).Host == "localhost" || origin == appOptions.Urls.ClientUrl)
                                                         .AllowAnyMethod()
                                                         .AllowAnyHeader()
                                                         .AllowCredentials());
    }); 
    #endregion
                    
    #region Logging
    var seqConfig = new LoggerConfiguration().ReadFrom.Configuration(builder.Configuration)
                                                      .Enrich.FromLogContext()
                                                      .WriteTo.Console();
                                                      
    var seqApiKey = Environment.GetEnvironmentVariable(appOptions.EnvVar.SeqApiKey);
    if (!string.IsNullOrEmpty(seqApiKey)) seqConfig.WriteTo.Seq(appOptions.Urls.SeqUrl, apiKey: seqApiKey);
    else seqConfig.WriteTo.Seq(appOptions.Urls.SeqUrl);
    
    builder.Services.AddSerilog(seqConfig.CreateLogger());
    #endregion

    #region Database  
    builder.Services.AddDbContext<AppDbContext>((serviceProvider, options) =>
    {
        var appOps = serviceProvider.GetRequiredService<IOptions<AppOptions>>().Value;
        var databaseUrl = Environment.GetEnvironmentVariable(appOps.EnvVar.DatabaseUrl); 
    
        var connectionString = !string.IsNullOrEmpty(databaseUrl)
            ? DbHelper.ConvertDatabaseUrlToConnectionString(databaseUrl)
            : appOps.Database.LocalDbConn;
    
        options.UseNpgsql(connectionString);
    });

    builder.Services.AddScoped<DbSeeder>();
    #endregion

    #region Identity & Auth
    // Identity
    builder.Services.AddIdentityApiEndpoints<User>()
                    .AddRoles<Role>()
                    .AddEntityFrameworkStores<AppDbContext>();
                    
    builder.Services.Configure<IdentityOptions>(options =>
    {
        options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+æøåÆØÅ";
    });

    // Password hashing
    builder.Services.AddSingleton<IPasswordHasher<User>, Argon2idPasswordHasher<User>>();

    // JWT
    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
        options.DefaultSignInScheme = JwtBearerDefaults.AuthenticationScheme;
    }).AddJwtBearer(options =>
    {
        options.TokenValidationParameters = JwtTokenService.ValidationParameters(appOptions);
        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                var error = context.Exception.ToString();
                Log.Error("Token validation failed: {Error}", error);
                return Task.CompletedTask;
            }
        };
    });
    
    builder.Services.AddAuthorizationBuilder()
        .SetFallbackPolicy(new AuthorizationPolicyBuilder().RequireAssertion(context =>
            {
                if (context.Resource is not HttpContext httpContext) return false;
                // Tillad OPTIONS
                if (string.Equals(httpContext.Request.Method, "OPTIONS", StringComparison.OrdinalIgnoreCase))
                {
                    return true;
                }

                // Tillad swagger og root
                if (httpContext.Request.Path.StartsWithSegments("/swagger") ||
                    httpContext.Request.Path.StartsWithSegments("/swagger-ui") ||
                    httpContext.Request.Path.Equals("/"))
                {
                    return true;
                }

                // Blacklist alt andet
                return context.User.Identity?.IsAuthenticated ?? false;
            })
            .Build());
    #endregion
        
    #region Services Registration
    builder.Services.AddValidatorsFromAssemblyContaining<ServiceAssembly>();
    builder.Services.AddSingleton(TimeProvider.System);
    builder.Services.AddScoped<IAuthService, AuthService>();
    builder.Services.AddScoped<ITokenService, JwtTokenService>();
    builder.Services.AddScoped<IEmailService, EmailService>();
    builder.Services.AddScoped<IDeviceService, DeviceService>();
    builder.Services.AddScoped<ITransactionService, TransactionService>();
    builder.Services.AddScoped<IUsersService, UsersService>();
    builder.Services.AddScoped<IBalanceHistoryService, BalanceHistoryService>();
  
    if (builder.Environment.IsProduction())
    { 
        builder.Services.AddFluentEmail(appOptions.Email.From, appOptions.Email.Sender)
                        .AddRazorRenderer()
                        .AddSendGridSender(apiKey: Environment.GetEnvironmentVariable(appOptions.EnvVar.SendGridApiKey));
    }
    else
    {
        builder.Services.AddFluentEmail(appOptions.Email.From, appOptions.Email.Sender)
                        .AddRazorRenderer()
                        .AddMailKitSender(new SmtpClientOptions 
                        {
                            Server = appOptions.Email.Host, 
                            Port = appOptions.Email.Port
                        });
    }

    builder.Services.AddHttpContextAccessor();
    #endregion
    
    #region API Config
    builder.Services.AddControllers()
                    .AddNewtonsoftJson(options =>
                    {
                        options.SerializerSettings.Converters.Add(new StringEnumConverter());
                    });

    // Swagger/OpenAPI
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
        configure.SchemaSettings.SchemaProcessors.Add(new ExampleSchemaProcessor());
    });

    // Routing config
    builder.Services.AddRouting(options =>
    {
        options.LowercaseUrls = true;
        //options.AppendTrailingSlash = true;
    });

    // Problem Details & Error handling
    builder.Services.AddProblemDetails(options => options.CustomizeProblemDetails = ctx =>
    {
        ctx.ProblemDetails.Extensions.Add("instance", $"{ctx.HttpContext.Request.Method} {ctx.HttpContext.Request.Path}");
    });

    builder.Services.AddExceptionHandler<ExceptionToProblemDetailsHandler>();
    #endregion

    var app = builder.Build();
    
    // Logging middleware
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
    
    // Swagger middleware 
    app.UseOpenApi();
    app.UseSwaggerUi(settings =>
    {
        settings.DocumentTitle = "Jerne IF API";
        settings.DocExpansion = "list";
        settings.CustomStylesheetPath = "/swagger-ui/universal-dark.css";
    });
        
    if (app.Environment.IsDevelopment()) {
        app.Lifetime.ApplicationStarted.Register(() =>
        {
            var addresses = app.Urls;
            if (addresses.Count != 0)
            {
                Log.Information("Swagger UI available at: {SwaggerUrl}/swagger", addresses.First());
            }
        });
    }
    
    // Security & Error handling middleware
    app.UseCors("AllowClient");
    app.UseStatusCodePages();
    app.UseExceptionHandler();
    
    app.UseHttpsRedirection();
    
    app.UseAuthentication();
    app.UseAuthorization();
    
    app.MapControllers();
    
    // DB setup/seeding
    using (var scope = app.Services.CreateScope())
    {
        if (app.Environment.IsProduction() || appOptions.AspNetCoreEnvironment.Equals("Test"))
        {
             scope.ServiceProvider.GetRequiredService<AppDbContext>().Database.EnsureCreated();
        }
        else
        {
            // Må IKKE bruges under testing - da det overhovedet ikke kan køre så
            scope.ServiceProvider.GetRequiredService<DbSeeder>().SeedAsync().Wait();
        }

        // File.WriteAllText("../dump.sql", context.Database.GenerateCreateScript());
    } 
    
    app.Run();
    
    Log.Information("Stopped cleanly");
    return 0; // Termination
}
catch (Exception ex)
{
    Log.Fatal(ex, "An unhandled exception occurred during bootstrapping");
    // throw; // fjern kommentar hvis der sker IServiceProvider exceptions under test 
    return 1; // Error
}
finally
{
    Log.CloseAndFlush();
}
public partial class Program;