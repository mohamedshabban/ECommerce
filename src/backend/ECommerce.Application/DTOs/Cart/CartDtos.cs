namespace ECommerce.Application.DTOs.Cart;

public record CartDto(
    Guid Id,
    IEnumerable<CartItemDto> Items,
    decimal SubTotal,
    int TotalItems
);

public record CartItemDto(
    Guid Id,
    Guid ProductId,
    string ProductNameEn,
    string ProductNameAr,
    string? ProductImageUrl,
    decimal UnitPrice,
    int Quantity,
    decimal Total,
    int AvailableStock
);

public record AddToCartRequest(
    Guid ProductId,
    int Quantity = 1
);

public record UpdateCartItemRequest(
    int Quantity
);
