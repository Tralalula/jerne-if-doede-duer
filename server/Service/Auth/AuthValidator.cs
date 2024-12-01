using FluentValidation;

namespace Service.Auth;

public static class AuthValidationRules
{
    public static IRuleBuilderOptions<T, string> EmailRule<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(256);
    }
    
    public static IRuleBuilderOptions<T, string> BasicPasswordRule<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .MinimumLength(6);
    }
    
    public static IRuleBuilderOptions<T, string> ResetCodeRule<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .Length(6)
            .Matches("^[0-9]+$")
            .WithMessage("Code must contain only numbers");
    }
}

public class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(x => x.Email).EmailRule();
        RuleFor(x => x.Password).BasicPasswordRule();
    }
}

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email).EmailRule();
        RuleFor(x => x.Password).BasicPasswordRule();
    }
}

public class VerifyEmailQueryValidator : AbstractValidator<VerifyEmailQuery>
{
    public VerifyEmailQueryValidator()
    {
        RuleFor(x => x.Email).EmailRule();
        RuleFor(x => x.Token).NotEmpty();
    }
}

public class ForgotPasswordRequestValidator : AbstractValidator<ForgotPasswordRequest>
{
    public ForgotPasswordRequestValidator()
    {
        RuleFor(x => x.Email).EmailRule();
    }
}

public class VerifyResetCodeRequestValidator : AbstractValidator<VerifyResetCodeRequest>
{
    public VerifyResetCodeRequestValidator()
    {
        RuleFor(x => x.Email).EmailRule();
        RuleFor(x => x.Code).ResetCodeRule();
    }
}

public class CompletePasswordResetRequestValidator : AbstractValidator<CompletePasswordResetRequest>
{
    public CompletePasswordResetRequestValidator()
    {
        RuleFor(x => x.Email).EmailRule();
        RuleFor(x => x.Code).ResetCodeRule();
        RuleFor(x => x.NewPassword).BasicPasswordRule();
    }
}