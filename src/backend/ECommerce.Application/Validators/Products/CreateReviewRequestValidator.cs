using FluentValidation;
using ECommerce.Application.DTOs.Products;

namespace ECommerce.Application.Validators.Products;

public class CreateReviewRequestValidator : AbstractValidator<CreateReviewRequest>
{
    public CreateReviewRequestValidator()
    {
        RuleFor(x => x.Rating)
            .InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5.");

        RuleFor(x => x.Title)
            .MaximumLength(200).WithMessage("Review title must not exceed 200 characters.")
            .When(x => x.Title is not null);

        RuleFor(x => x.Comment)
            .MaximumLength(2000).WithMessage("Review comment must not exceed 2000 characters.")
            .When(x => x.Comment is not null);
    }
}
