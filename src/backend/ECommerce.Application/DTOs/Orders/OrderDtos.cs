using ECommerce.Application.DTOs.Users;
using ECommerce.Domain.Enums;

namespace ECommerce.Application.DTOs.Orders;

public record OrderDto
{
    public Guid Id { get; init; }
    public string OrderNumber { get; init; } = string.Empty;
    public Guid UserId { get; init; }
    public string CustomerName { get; init; } = string.Empty;
    public string CustomerEmail { get; init; } = string.Empty;
    public OrderStatus Status { get; init; }
    public AddressDto? ShippingAddress { get; init; }
    public decimal SubTotal { get; init; }
    public decimal ShippingCost { get; init; }
    public decimal Tax { get; init; }
    public decimal Discount { get; init; }
    public decimal Total { get; init; }
    public PaymentMethod PaymentMethod { get; init; }
    public PaymentStatus PaymentStatus { get; init; }
    public string? PayPalTransactionId { get; init; }
    public string? Notes { get; init; }
    public IEnumerable<OrderItemDto> Items { get; init; } = Enumerable.Empty<OrderItemDto>();
    public DateTime CreatedAt { get; init; }
    public DateTime? ShippedAt { get; init; }
    public DateTime? DeliveredAt { get; init; }
}

public record OrderListDto
{
    public Guid Id { get; init; }
    public string OrderNumber { get; init; } = string.Empty;
    public string CustomerName { get; init; } = string.Empty;
    public OrderStatus Status { get; init; }
    public decimal Total { get; init; }
    public PaymentStatus PaymentStatus { get; init; }
    public int ItemCount { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record OrderItemDto
{
    public Guid Id { get; init; }
    public Guid ProductId { get; init; }
    public string ProductName { get; init; } = string.Empty;
    public string? ProductImageUrl { get; init; }
    public int Quantity { get; init; }
    public decimal UnitPrice { get; init; }
    public decimal Total { get; init; }
    public string VendorName { get; init; } = string.Empty;
}

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
