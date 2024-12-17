using FluentEmail.Core;
using Microsoft.Extensions.Logging;
using RazorLight;
using Service.Logging;
using SharedDependencies.Email;

namespace Service.Email;

public interface IEmailService
{
    Task SendWelcomeEmailAsync(string email, string verificationLink, string password);
    Task SendPasswordResetCodeAsync(string email, string code, TimeSpan expiresIn);
    Task SendEmailChangeVerificationAsync(string oldEmail, string newEmail, string verificationLink);
    Task SendEmailChangeNotificationAsync(string oldEmail, string newEmail);
}

public class EmailService : IEmailService
{
    private readonly IFluentEmail _fluentEmail;
    private readonly ILogger<EmailService> _logger;
    private readonly RazorLightEngine _razorEngine;
    
    private const string VerificationEmailTemplate = "WelcomeEmail.cshtml";
    private const string PasswordResetEmailTemplate = "PasswordResetEmail.cshtml";
    private const string EmailChangeVerificationTemplate = "EmailChangeVerificationEmail.cshtml";
    private const string EmailChangeNotificationTemplate = "EmailChangeNotificationEmail.cshtml";
    
    // Tags er vigtig - en mail kan ikke sendes uden en såkaldt kategori
    private const string VerificationTag = "verification";
    private const string PasswordResetTag = "password-reset";
    private const string EmailChangeVerificationTag = "email-change-verification";
    private const string EmailChangeNotificationTag = "email-change-notification";

    public EmailService(IFluentEmail fluentEmail, ILogger<EmailService> logger)
    {
        _fluentEmail = fluentEmail;
        _logger = logger;
        
        
        var templatePath = GetTemplatesPath();
        
        if (!Directory.Exists(templatePath))
        {
            throw new DirectoryNotFoundException($"Template directory not found at: {templatePath}");
        }
        
        _razorEngine = new RazorLightEngineBuilder().UseFileSystemProject(templatePath)
                                                    .UseMemoryCachingProvider()
                                                    .Build();
    }
    
    private static string GetTemplatesPath()
    {
        // Produktion sti
        var templatePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Templates");
        
        if (Directory.Exists(templatePath))
        {
            return templatePath;
        }
        
        // Lokal development
        var rootPath = Directory.GetCurrentDirectory();
        templatePath = Path.GetFullPath(Path.Combine(rootPath, "..", "Service", "Email", "Templates"));
        
        return templatePath;
    }

    public async Task SendWelcomeEmailAsync(string email, string verificationLink, string password)
    {
        try
        {
            var template = await _razorEngine.CompileRenderAsync(VerificationEmailTemplate, new VerificationEmailModel(verificationLink, password));
            
            await _fluentEmail.To(email)
                             .Subject("Velkommen til Jerne IF døde duer")
                             .Body(template, isHtml: true)
                             .Tag(VerificationTag)
                             .SendAsync();
                            
            _logger.LogInformation("Verification email sent successfully [TraceId: {TraceId}, Email: {MaskedEmail}]", email.GetUserTraceId(), email.MaskEmail());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send verification email [TraceId: {TraceId}, Email: {MaskedEmail}]", email.GetUserTraceId(), email.MaskEmail());
            throw;
        }
    }

    public async Task SendPasswordResetCodeAsync(string email, string code, TimeSpan expiresIn)
    {
        try
        {
            var template = await _razorEngine.CompileRenderAsync(PasswordResetEmailTemplate, new PasswordResetEmailModel(code, (int) expiresIn.TotalMinutes));

            await _fluentEmail.To(email)
                             .Subject("Nulstil adgangskode")
                             .Body(template, isHtml: true)
                             .Tag(PasswordResetTag)
                             .SendAsync();
                            
            _logger.LogInformation("Password reset code email sent successfully [TraceId: {TraceId}, Email: {MaskedEmail}]", email.GetUserTraceId(), email.MaskEmail());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send password reset code email [TraceId: {TraceId}, Email: {MaskedEmail}]", email.GetUserTraceId(), email.MaskEmail());
            throw;
        }
    }

    public async Task SendEmailChangeVerificationAsync(string oldEmail, string newEmail, string verificationLink)
    {
        try
        {
            var model = new EmailChangeVerificationEmailModel(oldEmail, newEmail, verificationLink);
            var template = await _razorEngine.CompileRenderAsync(EmailChangeVerificationTemplate, model);
            
            await _fluentEmail.To(newEmail)
                              .Subject("Bekræft ændring af email")
                              .Body(template, isHtml: true)
                              .Tag(EmailChangeVerificationTag)
                              .SendAsync();

            _logger.LogInformation("Email change verification email sent successfully [TraceId: {TraceId}, OldEmail: {MaskedOldEmail}, NewEmail: {MaskedNewEmail}]", 
                oldEmail.GetUserTraceId(),
                oldEmail.MaskEmail(),
                newEmail.MaskEmail());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email change verification email [TraceId: {TraceId}, OldEmail: {MaskedOldEmail}, NewEmail: {MaskedNewEmail}]",
                oldEmail.GetUserTraceId(),
                oldEmail.MaskEmail(),
                newEmail.MaskEmail());
            throw;
        }
    }

    public async Task SendEmailChangeNotificationAsync(string oldEmail, string newEmail)
    {
        try
        {
            var model = new EmailChangeNotificationEmailModel(oldEmail, newEmail);
            var template = await _razorEngine.CompileRenderAsync(EmailChangeNotificationTemplate, model);

            // Notify the old email
            await _fluentEmail.To(oldEmail)
                              .Subject("Din email er blevet ændret")
                              .Body(template, isHtml: true)
                              .Tag(EmailChangeNotificationTag)
                              .SendAsync();

            _logger.LogInformation("Email change notification sent successfully [OldEmail: {MaskedOldEmail}, NewEmail: {MaskedNewEmail}]",
                oldEmail.MaskEmail(), newEmail.MaskEmail());
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to send email change notification [OldEmail: {MaskedOldEmail}, NewEmail: {MaskedNewEmail}]",
                oldEmail.MaskEmail(), newEmail.MaskEmail());
            throw;
        }
    }
}