using ECommerce.Application.DTOs.Users;
using ECommerce.Domain.Enums;

namespace ECommerce.Application.DTOs.Orders;

public record OrderDto(
    Guid Id,
    string OrderNumber,
    Guid UserId,
    string CustomerName,
    string CustomerEmail,
    OrderStatus Status,
    AddressDto ShippingAddress,
    decimal SubTotal,
    decimal ShippingCost,
    decimal Tax,
    decimal Discount,
    decimal Total,
    PaymentMethod PaymentMethod,
    PaymentStatus PaymentStatus,
    string? PayPalTransactionId,
    string? Notes,
    IEnumerable<OrderItemDto> Items,
    DateTime CreatedAt,
    DateTime? ShippedAt,
    DateTime? DeliveredAt
);

public record OrderListDto(
    Guid Id,
    string OrderNumber,
    string CustomerName,
    OrderStatus Status,
    decimal Total,
    PaymentStatus PaymentStatus,
    int ItemCount,
    DateTime CreatedAt
);

public record OrderItemDto(
    Guid Id,
    Guid ProductId,
    string ProductName,
    string? ProductImageUrl,
    int Quantity,
    decimal UnitPrice,
    decimal Total,
    string VendorName
);

public record CreateOrderRequest(
    Guid ShippingAddressId,
    PaymentMethod PaymentMethod,
    string? Notes
);

public record UpdateOrderStatusRequest(
    OrderStatus Status
);

public record CheckoutRequest(
    Guid ShippingAddressId,
    string? Notes
);

public record PayPalOrderResponse(
    string OrderId,
    string ApprovalUrl
);

public record CapturePayPalOrderRequest(
    string PayPalOrderId
);

public record OrderFilterParams
{
    public OrderStatus? Status { get; set; }
    public PaymentStatus? PaymentStatus { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public Guid? VendorId { get; set; }
}
