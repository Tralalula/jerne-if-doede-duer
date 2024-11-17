using API.ExceptionHandler;
using DataAccess;
using DataAccess.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using Newtonsoft.Json.Converters;
using Service;

var builder = WebApplication.CreateBuilder(args);

// Configuration
builder.Services.AddOptions<AppOptions>()
                .Bind(builder.Configuration.GetSection(nameof(AppOptions)))
                .ValidateDataAnnotations()
                .ValidateOnStart();

builder.Services.AddDbContext<AppDbContext>((serviceProvider, options) =>
{
    var appOptions = serviceProvider.GetRequiredService<IOptions<AppOptions>>().Value;
    options.UseNpgsql(Environment.GetEnvironmentVariable("LocalDbConn") ?? appOptions.LocalDbConn);
});

builder.Services.AddIdentityApiEndpoints<IdentityUser<Guid>>()
                .AddRoles<IdentityRole<Guid>>()
                .AddEntityFrameworkStores<AppDbContext>();
    
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
    var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    context.Database.EnsureDeleted();
    context.Database.EnsureCreated();
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

app.UseHttpsRedirection();

app.Run();

public partial class Program;