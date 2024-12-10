using Service.Email;

namespace ApiIntegrationTests;

public class MockEmailService : IEmailService
{
    public Task SendWelcomeEmailAsync(string email, string verificationLink, string password)
    {
        throw new NotImplementedException();
    }

    public Task SendPasswordResetCodeAsync(string email, string code, TimeSpan expiresIn)
    {
        return Task.CompletedTask;
    }
}