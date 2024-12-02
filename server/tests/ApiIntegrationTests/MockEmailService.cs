using Service.Email;

namespace ApiIntegrationTests;

public class MockEmailService : IEmailService
{
    public Task SendVerificationEmailAsync(string email, string verificationLink)
    {
        return Task.CompletedTask;
    }

    public Task SendPasswordResetCodeAsync(string email, string code, TimeSpan expiresIn)
    {
        return Task.CompletedTask;
    }
}