// using DataAccess;
using Microsoft.AspNetCore.Mvc.Testing;
using PgCtx;
using Service;

namespace ApiIntegrationTests;

public class ExampleTests : WebApplicationFactory<Program>
{
    // private readonly PgCtxSetup<AppDbContext> _pgCtxSetup = new();
    
    public ExampleTests()
    {
        // Environment.SetEnvironmentVariable($"{nameof(AppOptions)}:{nameof(AppOptions.LocalDbConn)}", _pgCtxSetup._postgres.GetConnectionString());
        
        SeedDatabase();
    }
    
    private void SeedDatabase()
    {
    }
}