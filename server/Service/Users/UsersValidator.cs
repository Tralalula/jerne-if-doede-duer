using DataAccess.Models;
using FluentValidation;

namespace Service.Users;

public class UsersQueryValidator : AbstractValidator<UsersQuery>
{
    public UsersQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThan(0)
                            .WithMessage("Page must be greater than 0");

        RuleFor(x => x.PageSize).GreaterThan(0)
                                .LessThanOrEqualTo(100)
                                .WithMessage("PageSize must be between 1 and 100");

        RuleFor(x => x.Search).MaximumLength(100)
                              .When(x => !string.IsNullOrEmpty(x.Search))
                              .WithMessage("Search term cannot exceed 100 characters");
    }
}