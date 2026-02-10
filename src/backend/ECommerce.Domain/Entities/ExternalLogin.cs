using ECommerce.Domain.Common;

namespace ECommerce.Domain.Entities;

public class ExternalLogin : BaseEntity
{
    public Guid UserId { get; set; }
    public string Provider { get; set; } = string.Empty; // Google, Facebook
    public string ProviderKey { get; set; } = string.Empty;
    public string? ProviderDisplayName { get; set; }

    // Navigation property
    public virtual User User { get; set; } = null!;
}
