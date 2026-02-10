namespace ECommerce.Application.Interfaces;

public interface IPaymentService
{
    Task<CreatePaymentResult> CreatePaymentAsync(Guid orderId, decimal amount, string currency = "USD");
    Task<CapturePaymentResult> CapturePaymentAsync(string paymentId);
    Task<RefundResult> RefundPaymentAsync(string transactionId, decimal amount);
}

public record CreatePaymentResult(bool Success, string? PaymentId, string? ApprovalUrl, string? ErrorMessage);
public record CapturePaymentResult(bool Success, string? TransactionId, string? ErrorMessage);
public record RefundResult(bool Success, string? RefundId, string? ErrorMessage);
