using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class Cart : BaseEntity
{
    public Guid? UserId { get; set; }
    public string? SessionId { get; set; } // For guest carts

    // Navigation properties
    public virtual User? User { get; set; }
    public virtual ICollection<CartItem> Items { get; set; } = new List<CartItem>();

    public decimal Total => Items.Sum(item => item.Total);
    public int TotalItems => Items.Sum(item => item.Quantity);
}
