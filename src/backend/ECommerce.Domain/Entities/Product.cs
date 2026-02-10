using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class Product : BaseEntity
{
    public Guid VendorId { get; set; }
    public int CategoryId { get; set; }
    public string NameEn { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string? DescriptionEn { get; set; }
    public string? DescriptionAr { get; set; }
    public string SKU { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public decimal? DiscountPrice { get; set; }
    public int StockQuantity { get; set; }
    public bool IsActive { get; set; } = true;
    public bool IsFeatured { get; set; } = false;
    public decimal Weight { get; set; }
    public string? Brand { get; set; }
    public string? Tags { get; set; }

    public decimal CurrentPrice => DiscountPrice ?? Price;
    public bool InStock => StockQuantity > 0;
    public decimal DiscountPercentage => DiscountPrice.HasValue
        ? Math.Round((1 - DiscountPrice.Value / Price) * 100, 2)
        : 0;

    // Navigation properties
    public virtual User Vendor { get; set; } = null!;
    public virtual Category Category { get; set; } = null!;
    public virtual ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    public virtual ICollection<ProductReview> Reviews { get; set; } = new List<ProductReview>();
    public virtual ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public virtual ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
    public virtual ICollection<Wishlist> Wishlists { get; set; } = new List<Wishlist>();
}
