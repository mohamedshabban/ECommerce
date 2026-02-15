using FluentValidation;
using ECommerce.Application.DTOs.Categories;

namespace ECommerce.Application.Validators.Categories;

public class CreateCategoryRequestValidator : AbstractValidator<CreateCategoryRequest>
{
    public CreateCategoryRequestValidator()
    {
        RuleFor(x => x.NameEn)
            .NotEmpty().WithMessage("Category name (English) is required.")
            .MaximumLength(100).WithMessage("Category name (English) must not exceed 100 characters.");

        RuleFor(x => x.NameAr)
            .NotEmpty().WithMessage("Category name (Arabic) is required.")
            .MaximumLength(100).WithMessage("Category name (Arabic) must not exceed 100 characters.");

        RuleFor(x => x.DescriptionEn)
            .MaximumLength(500).WithMessage("Description (English) must not exceed 500 characters.")
            .When(x => x.DescriptionEn is not null);

        RuleFor(x => x.DescriptionAr)
            .MaximumLength(500).WithMessage("Description (Arabic) must not exceed 500 characters.")
            .When(x => x.DescriptionAr is not null);

        RuleFor(x => x.ParentCategoryId)
            .GreaterThan(0).WithMessage("Parent category ID must be a positive number.")
            .When(x => x.ParentCategoryId.HasValue);

        RuleFor(x => x.SortOrder)
            .GreaterThanOrEqualTo(0).WithMessage("Sort order cannot be negative.");
    }
}
