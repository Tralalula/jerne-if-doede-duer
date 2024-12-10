using FluentValidation;

namespace Service.BalanceHistory;

public class BalanceHistoryQueryValidator : AbstractValidator<BalanceHistoryQuery>
{
    public BalanceHistoryQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThan(0)
                            .WithMessage("Page must be greater than 0");

        RuleFor(x => x.PageSize).GreaterThan(0)
                                .LessThanOrEqualTo(100)
                                .WithMessage("PageSize must be between 1 and 100");
            
        RuleFor(x => x.ToDate).GreaterThanOrEqualTo(x => x.FromDate)
                              .When(x => x.FromDate.HasValue && x.ToDate.HasValue)
                              .WithMessage("ToDate must be after FromDate");
    }
}