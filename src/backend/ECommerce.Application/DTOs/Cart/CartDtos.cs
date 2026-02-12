namespace ECommerce.Application.DTOs.Cart;

public record CartDto
{
    public Guid Id { get; init; }
    public IEnumerable<CartItemDto> Items { get; init; } = Enumerable.Empty<CartItemDto>();
    public decimal SubTotal { get; init; }
    public int TotalItems { get; init; }
}

public record CartItemDto
{
    public Guid Id { get; init; }
    public Guid ProductId { get; init; }
    public string ProductNameEn { get; init; } = string.Empty;
    public string ProductNameAr { get; init; } = string.Empty;
    public string? ProductImageUrl { get; init; }
    public decimal UnitPrice { get; init; }
    public int Quantity { get; init; }
    public decimal Total { get; init; }
    public int AvailableStock { get; init; }
}

public record AddToCartRequest(
    Guid ProductId,
    int Quantity = 1
);

public record UpdateCartItemRequest(
    int Quantity
);
