using FluentValidation;

namespace Service.Transaction;

public static class TransactionValidationRules
{
    public static IRuleBuilderOptions<T, int> CreditsRule<T>(this IRuleBuilder<T, int> ruleBuilder)
    {
        return ruleBuilder.GreaterThan(0)
                          .LessThanOrEqualTo(100000)
                          .WithMessage("Credits must be between 1 and 100,000");
    }
    
    public static IRuleBuilderOptions<T, string> MobilePayTransactionNumberRule<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder.NotEmpty()
                          .MaximumLength(50)
                          .Matches("^[A-Za-z0-9-]+$")
                          .WithMessage("MobilePay transaction number can only contain letters, numbers and hyphens");
    }
}

public class CreateTransactionRequestValidator : AbstractValidator<CreateTransactionRequest>
{
    public CreateTransactionRequestValidator()
    {
        RuleFor(x => x.Credits).CreditsRule();
        RuleFor(x => x.MobilePayTransactionNumber).MobilePayTransactionNumberRule();
    }
}

public class TransactionsQueryValidator : AbstractValidator<TransactionsQuery>
{
    public TransactionsQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThan(0)
                            .WithMessage("Page must be greater than 0");

        RuleFor(x => x.PageSize).GreaterThan(0)
                                .LessThanOrEqualTo(100)
                                .WithMessage("PageSize must be between 1 and 100");
                                
        RuleFor(x => x.ToDate).GreaterThanOrEqualTo(x => x.FromDate)
                              .When(x => x.FromDate.HasValue && x.ToDate.HasValue)
                              .WithMessage("ToDate must be after FromDate");

        RuleFor(x => x.MaxCredits).GreaterThanOrEqualTo(x => x.MinCredits)
                                  .When(x => x.MinCredits.HasValue && x.MaxCredits.HasValue)
                                  .WithMessage("MaxCredits must be greater than or equal to MinCredits");
    }
}