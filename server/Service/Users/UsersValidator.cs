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

public class UpdateUserRequestValidator : AbstractValidator<UpdateUserRequest>
{
    public UpdateUserRequestValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty()
                                 .MaximumLength(50)
                                 .Matches("^[a-zA-ZæøåÆØÅ ]+$")
                                 .WithMessage("First name can only contain letters and must not be empty.");

        RuleFor(x => x.LastName).NotEmpty()
                                .MaximumLength(50)
                                .Matches("^[a-zA-ZæøåÆØÅ ]+$")
                                .WithMessage("Last name can only contain letters and must not be empty.");

        RuleFor(x => x.PhoneNumber).MaximumLength(20)
                                   .Matches(@"^\+?[0-9\s-]+$")
                                   .When(x => !string.IsNullOrEmpty(x.PhoneNumber))
                                   .WithMessage("Invalid phone number format");
                                   
        RuleFor(x => x.Email).EmailAddress()
                             .MaximumLength(256)
                             .When(x => !string.IsNullOrEmpty(x.Email));
    }
}