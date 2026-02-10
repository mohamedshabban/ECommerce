using ECommerce.Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using MimeKit;

namespace ECommerce.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string to, string subject, string body, bool isHtml = true)
    {
        var emailSettings = _configuration.GetSection("EmailSettings");

        var email = new MimeMessage();
        email.From.Add(new MailboxAddress(emailSettings["SenderName"], emailSettings["SenderEmail"]));
        email.To.Add(MailboxAddress.Parse(to));
        email.Subject = subject;

        var builder = new BodyBuilder();
        if (isHtml)
            builder.HtmlBody = body;
        else
            builder.TextBody = body;

        email.Body = builder.ToMessageBody();

        using var smtp = new SmtpClient();
        await smtp.ConnectAsync(
            emailSettings["SmtpServer"],
            int.Parse(emailSettings["SmtpPort"]!),
            SecureSocketOptions.StartTls);
        await smtp.AuthenticateAsync(emailSettings["Username"], emailSettings["Password"]);
        await smtp.SendAsync(email);
        await smtp.DisconnectAsync(true);
    }

    public async Task SendWelcomeEmailAsync(string to, string userName)
    {
        var subject = "Welcome to E-Commerce Store!";
        var body = $@"
            <h1>Welcome, {userName}!</h1>
            <p>Thank you for joining our e-commerce platform.</p>
            <p>Start shopping now and enjoy amazing deals!</p>
        ";
        await SendEmailAsync(to, subject, body);
    }

    public async Task SendPasswordResetEmailAsync(string to, string resetLink)
    {
        var subject = "Reset Your Password";
        var body = $@"
            <h1>Password Reset Request</h1>
            <p>Click the link below to reset your password:</p>
            <p><a href='{resetLink}'>Reset Password</a></p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't request this, please ignore this email.</p>
        ";
        await SendEmailAsync(to, subject, body);
    }

    public async Task SendEmailConfirmationAsync(string to, string confirmationLink)
    {
        var subject = "Confirm Your Email Address";
        var body = $@"
            <h1>Email Confirmation</h1>
            <p>Please confirm your email address by clicking the link below:</p>
            <p><a href='{confirmationLink}'>Confirm Email</a></p>
        ";
        await SendEmailAsync(to, subject, body);
    }

    public async Task SendOrderConfirmationAsync(string to, string orderNumber, decimal total)
    {
        var subject = $"Order Confirmation - {orderNumber}";
        var body = $@"
            <h1>Order Confirmed!</h1>
            <p>Thank you for your order.</p>
            <p><strong>Order Number:</strong> {orderNumber}</p>
            <p><strong>Total:</strong> ${total:F2}</p>
            <p>We'll send you another email when your order ships.</p>
        ";
        await SendEmailAsync(to, subject, body);
    }
}
