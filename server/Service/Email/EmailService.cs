using FluentEmail.Core;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace Service.Email;

public interface IEmailService
{
    Task SendVerificationEmailAsync(string email, string verificationLink);
    Task SendPasswordResetCodeAsync(string email, string code, TimeSpan expiresIn);
}

public class EmailService(IFluentEmail fluentEmail, ILogger<EmailService> logger) : IEmailService
{
    public async Task SendVerificationEmailAsync(string email, string verificationLink)
    {
        try
        {
            await fluentEmail.To(email)
                             .Subject("Velkommen til Jerne IF døde duer")
                             .Body($"For at verificere din email adresse <a href='{verificationLink}'>klik her</a>", isHtml: true)
                             .SendAsync();
                            
            logger.LogInformation("Verification email sent successfully to: {Email}", email);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send verification email to: {Email}", email);
            throw;
        }
    }

    public async Task SendPasswordResetCodeAsync(string email, string code, TimeSpan expiresIn)
    {
        try
        {
            await fluentEmail.To(email)
                             .Subject("Password Reset Code")
                             .Body($"Your password reset code is: {code}<br>This code will expire in {expiresIn.TotalMinutes} minutes.", isHtml: true)
                             .SendAsync();
                            
            logger.LogInformation("Password reset code email sent successfully to: {Email}", email);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Failed to send password reset code email to: {Email}", email);
            throw;
        }
    }
}