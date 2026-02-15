using FluentValidation;
using ECommerce.Application.DTOs.Orders;

namespace ECommerce.Application.Validators.Orders;

public class CapturePayPalOrderRequestValidator : AbstractValidator<CapturePayPalOrderRequest>
{
    public CapturePayPalOrderRequestValidator()
    {
        RuleFor(x => x.PayPalOrderId)
            .NotEmpty().WithMessage("PayPal order ID is required.")
            .MaximumLength(50).WithMessage("PayPal order ID must not exceed 50 characters.");
    }
}
