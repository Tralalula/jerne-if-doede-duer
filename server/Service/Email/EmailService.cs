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
}

public class EmailService : IEmailService
{
    private readonly IFluentEmail _fluentEmail;
    private readonly ILogger<EmailService> _logger;
    private readonly RazorLightEngine _razorEngine;
    
    private const string VerificationEmailTemplate = "WelcomeEmail.cshtml";
    private const string PasswordResetEmailTemplate = "PasswordResetEmail.cshtml";
    
    // Tags er vigtig - en mail kan ikke sendes uden en såkaldt kategori
    private const string VerificationTag = "verification";
    private const string PasswordResetTag = "password-reset";
    
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
}