using FluentValidation;
using ECommerce.Application.DTOs.Products;

namespace ECommerce.Application.Validators.Products;

public class UpdateProductRequestValidator : AbstractValidator<UpdateProductRequest>
{
    public UpdateProductRequestValidator()
    {
        RuleFor(x => x.CategoryId)
            .GreaterThan(0).WithMessage("A valid category must be selected.");

        RuleFor(x => x.NameEn)
            .NotEmpty().WithMessage("Product name (English) is required.")
            .MaximumLength(200).WithMessage("Product name (English) must not exceed 200 characters.");

        RuleFor(x => x.NameAr)
            .NotEmpty().WithMessage("Product name (Arabic) is required.")
            .MaximumLength(200).WithMessage("Product name (Arabic) must not exceed 200 characters.");

        RuleFor(x => x.DescriptionEn)
            .MaximumLength(4000).WithMessage("Description (English) must not exceed 4000 characters.")
            .When(x => x.DescriptionEn is not null);

        RuleFor(x => x.DescriptionAr)
            .MaximumLength(4000).WithMessage("Description (Arabic) must not exceed 4000 characters.")
            .When(x => x.DescriptionAr is not null);

        RuleFor(x => x.SKU)
            .NotEmpty().WithMessage("SKU is required.")
            .MaximumLength(50).WithMessage("SKU must not exceed 50 characters.")
            .Matches(@"^[A-Za-z0-9\-_]+$").WithMessage("SKU can only contain letters, digits, hyphens, and underscores.");

        RuleFor(x => x.Price)
            .GreaterThan(0).WithMessage("Price must be greater than zero.")
            .PrecisionScale(18, 2, false).WithMessage("Price must have at most 2 decimal places.");

        RuleFor(x => x.DiscountPrice)
            .GreaterThan(0).WithMessage("Discount price must be greater than zero.")
            .LessThan(x => x.Price).WithMessage("Discount price must be less than the regular price.")
            .PrecisionScale(18, 2, false).WithMessage("Discount price must have at most 2 decimal places.")
            .When(x => x.DiscountPrice.HasValue);

        RuleFor(x => x.StockQuantity)
            .GreaterThanOrEqualTo(0).WithMessage("Stock quantity cannot be negative.");

        RuleFor(x => x.Weight)
            .GreaterThanOrEqualTo(0).WithMessage("Weight cannot be negative.");

        RuleFor(x => x.Brand)
            .MaximumLength(100).WithMessage("Brand must not exceed 100 characters.")
            .When(x => x.Brand is not null);

        RuleFor(x => x.Tags)
            .MaximumLength(500).WithMessage("Tags must not exceed 500 characters.")
            .When(x => x.Tags is not null);
    }
}
