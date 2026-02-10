using ECommerce.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ECommerce.Infrastructure.Data.Configurations;

public class ProductConfiguration : IEntityTypeConfiguration<Product>
{
    public void Configure(EntityTypeBuilder<Product> builder)
    {
        builder.HasKey(p => p.Id);

        builder.Property(p => p.NameEn)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(p => p.NameAr)
            .IsRequired()
            .HasMaxLength(300);

        builder.Property(p => p.DescriptionEn)
            .HasMaxLength(5000);

        builder.Property(p => p.DescriptionAr)
            .HasMaxLength(5000);

        builder.Property(p => p.SKU)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(p => p.SKU)
            .IsUnique();

        builder.Property(p => p.Price)
            .HasPrecision(18, 2);

        builder.Property(p => p.DiscountPrice)
            .HasPrecision(18, 2);

        builder.Property(p => p.Weight)
            .HasPrecision(18, 3);

        builder.Property(p => p.Brand)
            .HasMaxLength(100);

        builder.Property(p => p.Tags)
            .HasMaxLength(500);

        builder.HasMany(p => p.Images)
            .WithOne(i => i.Product)
            .HasForeignKey(i => i.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.Reviews)
            .WithOne(r => r.Product)
            .HasForeignKey(r => r.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasMany(p => p.CartItems)
            .WithOne(c => c.Product)
            .HasForeignKey(c => c.ProductId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Ignore(p => p.CurrentPrice);
        builder.Ignore(p => p.InStock);
        builder.Ignore(p => p.DiscountPercentage);
    }
}
