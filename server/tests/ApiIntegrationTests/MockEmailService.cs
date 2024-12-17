using Service.Email;

namespace ApiIntegrationTests;

public class MockEmailService : IEmailService
{
    public Task SendWelcomeEmailAsync(string email, string verificationLink, string password)
    {
        return Task.CompletedTask;
    }

    public Task SendPasswordResetCodeAsync(string email, string code, TimeSpan expiresIn)
    {
        return Task.CompletedTask;
    }

    public Task SendEmailChangeVerificationAsync(string oldEmail, string newEmail, string verificationLink)
    {
        return Task.CompletedTask;
    }

    public Task SendEmailChangeNotificationAsync(string oldEmail, string newEmail)
    {
        return Task.CompletedTask;
    }
}