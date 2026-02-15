using FluentValidation;
using ECommerce.Application.DTOs.Auth;

namespace ECommerce.Application.Validators.Auth;

public class ExternalLoginRequestValidator : AbstractValidator<ExternalLoginRequest>
{
    private static readonly string[] SupportedProviders = { "Google", "Facebook" };

    public ExternalLoginRequestValidator()
    {
        RuleFor(x => x.Provider)
            .NotEmpty().WithMessage("Provider is required.")
            .Must(p => SupportedProviders.Contains(p, StringComparer.OrdinalIgnoreCase))
            .WithMessage("Provider must be one of: Google, Facebook.");

        RuleFor(x => x.IdToken)
            .NotEmpty().WithMessage("ID token is required.");
    }
}
