namespace ECommerce.Application.Interfaces;

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body, bool isHtml = true);
    Task SendWelcomeEmailAsync(string to, string userName);
    Task SendPasswordResetEmailAsync(string to, string resetLink);
    Task SendEmailConfirmationAsync(string to, string confirmationLink);
    Task SendOrderConfirmationAsync(string to, string orderNumber, decimal total);
}
