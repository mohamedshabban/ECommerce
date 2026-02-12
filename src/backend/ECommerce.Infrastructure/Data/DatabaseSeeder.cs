using System.Security.Cryptography;
using System.Text;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Infrastructure.Data;

public static class DatabaseSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // Only seed if database is empty
        if (await context.Users.AnyAsync())
            return;

        // Create Users
        var adminId = Guid.NewGuid();
        var vendorId = Guid.NewGuid();
        var customerId = Guid.NewGuid();

        var users = new List<User>
        {
            new User
            {
                Id = adminId,
                Email = "admin@eshop.com",
                PasswordHash = HashPassword("Admin@123"),
                FirstName = "Admin",
                LastName = "User",
                PhoneNumber = "+1234567890",
                Role = UserRole.Admin,
                IsActive = true,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = vendorId,
                Email = "vendor@eshop.com",
                PasswordHash = HashPassword("Vendor@123"),
                FirstName = "John",
                LastName = "Vendor",
                PhoneNumber = "+1234567891",
                Role = UserRole.Vendor,
                IsActive = true,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            },
            new User
            {
                Id = customerId,
                Email = "customer@eshop.com",
                PasswordHash = HashPassword("Customer@123"),
                FirstName = "Jane",
                LastName = "Customer",
                PhoneNumber = "+1234567892",
                Role = UserRole.Customer,
                IsActive = true,
                EmailConfirmed = true,
                CreatedAt = DateTime.UtcNow
            }
        };

        await context.Users.AddRangeAsync(users);

        // Create Carts for users
        var carts = new List<Cart>
        {
            new Cart { Id = Guid.NewGuid(), UserId = adminId, CreatedAt = DateTime.UtcNow },
            new Cart { Id = Guid.NewGuid(), UserId = vendorId, CreatedAt = DateTime.UtcNow },
            new Cart { Id = Guid.NewGuid(), UserId = customerId, CreatedAt = DateTime.UtcNow }
        };

        await context.Carts.AddRangeAsync(carts);

        // Create Categories (don't set Id - it's auto-generated)
        var electronicsCategory = new Category
        {
            NameEn = "Electronics",
            NameAr = "إلكترونيات",
            Slug = "electronics",
            DescriptionEn = "Electronic devices and gadgets",
            DescriptionAr = "الأجهزة الإلكترونية والأدوات",
            IsActive = true,
            SortOrder = 1,
            CreatedAt = DateTime.UtcNow
        };
        var clothingCategory = new Category
        {
            NameEn = "Clothing",
            NameAr = "ملابس",
            Slug = "clothing",
            DescriptionEn = "Fashion and apparel",
            DescriptionAr = "الأزياء والملابس",
            IsActive = true,
            SortOrder = 2,
            CreatedAt = DateTime.UtcNow
        };
        var homeCategory = new Category
        {
            NameEn = "Home & Garden",
            NameAr = "المنزل والحديقة",
            Slug = "home-garden",
            DescriptionEn = "Home decor and garden supplies",
            DescriptionAr = "ديكور المنزل ومستلزمات الحديقة",
            IsActive = true,
            SortOrder = 3,
            CreatedAt = DateTime.UtcNow
        };
        var sportsCategory = new Category
        {
            NameEn = "Sports & Outdoors",
            NameAr = "الرياضة والأنشطة الخارجية",
            Slug = "sports-outdoors",
            DescriptionEn = "Sports equipment and outdoor gear",
            DescriptionAr = "معدات رياضية وأدوات خارجية",
            IsActive = true,
            SortOrder = 4,
            CreatedAt = DateTime.UtcNow
        };
        var booksCategory = new Category
        {
            NameEn = "Books",
            NameAr = "كتب",
            Slug = "books",
            DescriptionEn = "Books, magazines and publications",
            DescriptionAr = "الكتب والمجلات والمطبوعات",
            IsActive = true,
            SortOrder = 5,
            CreatedAt = DateTime.UtcNow
        };

        await context.Categories.AddRangeAsync(electronicsCategory, clothingCategory, homeCategory, sportsCategory, booksCategory);
        await context.SaveChangesAsync(); // Save categories first to get their IDs

        // Create Products (using category IDs from saved categories)
        var products = new List<Product>
        {
            // Electronics
            new Product
            {
                Id = Guid.NewGuid(),
                VendorId = vendorId,
                CategoryId = electronicsCategory.Id,
                NameEn = "Wireless Bluetooth Headphones",
                NameAr = "سماعات بلوتوث لاسلكية",
                DescriptionEn = "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
                DescriptionAr = "سماعات لاسلكية عالية الجودة مع إلغاء الضوضاء وعمر بطارية 30 ساعة.",
                SKU = "ELEC-001",
                Price = 149.99m,
                DiscountPrice = 129.99m,
                StockQuantity = 50,
                IsActive = true,
                IsFeatured = true,
                Weight = 0.3m,
                Brand = "SoundMax",
                Tags = "headphones,wireless,bluetooth,audio",
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.NewGuid(),
                VendorId = vendorId,
                CategoryId = electronicsCategory.Id,
                NameEn = "Smart Watch Pro",
                NameAr = "ساعة ذكية برو",
                DescriptionEn = "Feature-rich smartwatch with health monitoring, GPS, and water resistance.",
                DescriptionAr = "ساعة ذكية غنية بالميزات مع مراقبة الصحة ونظام تحديد المواقع ومقاومة الماء.",
                SKU = "ELEC-002",
                Price = 299.99m,
                StockQuantity = 30,
                IsActive = true,
                IsFeatured = true,
                Weight = 0.1m,
                Brand = "TechTime",
                Tags = "smartwatch,wearable,fitness,gps",
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.NewGuid(),
                VendorId = vendorId,
                CategoryId = electronicsCategory.Id,
                NameEn = "Portable Power Bank 20000mAh",
                NameAr = "شاحن متنقل 20000 مللي أمبير",
                DescriptionEn = "Fast charging power bank with dual USB ports and LED indicator.",
                DescriptionAr = "شاحن متنقل سريع الشحن مع منفذي USB ومؤشر LED.",
                SKU = "ELEC-003",
                Price = 49.99m,
                DiscountPrice = 39.99m,
                StockQuantity = 100,
                IsActive = true,
                IsFeatured = false,
                Weight = 0.4m,
                Brand = "PowerUp",
                Tags = "powerbank,charger,portable,usb",
                CreatedAt = DateTime.UtcNow
            },

            // Clothing
            new Product
            {
                Id = Guid.NewGuid(),
                VendorId = vendorId,
                CategoryId = clothingCategory.Id,
                NameEn = "Men's Classic Polo Shirt",
                NameAr = "قميص بولو كلاسيكي للرجال",
                DescriptionEn = "Premium cotton polo shirt with embroidered logo. Available in multiple colors.",
                DescriptionAr = "قميص بولو قطني فاخر مع شعار مطرز. متوفر بألوان متعددة.",
                SKU = "CLOTH-001",
                Price = 59.99m,
                DiscountPrice = 49.99m,
                StockQuantity = 200,
                IsActive = true,
                IsFeatured = true,
                Weight = 0.2m,
                Brand = "StyleCo",
                Tags = "polo,shirt,men,cotton,casual",
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.NewGuid(),
                VendorId = vendorId,
                CategoryId = clothingCategory.Id,
                NameEn = "Women's Running Shoes",
                NameAr = "حذاء جري نسائي",
                DescriptionEn = "Lightweight and breathable running shoes with superior cushioning.",
                DescriptionAr = "حذاء جري خفيف الوزن وقابل للتنفس مع توسيد فائق.",
                SKU = "CLOTH-002",
                Price = 89.99m,
                StockQuantity = 75,
                IsActive = true,
                IsFeatured = false,
                Weight = 0.5m,
                Brand = "RunFast",
                Tags = "shoes,running,women,sports,athletic",
                CreatedAt = DateTime.UtcNow
            },

            // Home & Garden
            new Product
            {
                Id = Guid.NewGuid(),
                VendorId = vendorId,
                CategoryId = homeCategory.Id,
                NameEn = "Modern LED Desk Lamp",
                NameAr = "مصباح مكتب LED عصري",
                DescriptionEn = "Adjustable LED desk lamp with touch control and USB charging port.",
                DescriptionAr = "مصباح مكتب LED قابل للتعديل مع تحكم باللمس ومنفذ شحن USB.",
                SKU = "HOME-001",
                Price = 45.99m,
                DiscountPrice = 35.99m,
                StockQuantity = 60,
                IsActive = true,
                IsFeatured = true,
                Weight = 0.8m,
                Brand = "LightPro",
                Tags = "lamp,led,desk,office,lighting",
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.NewGuid(),
                VendorId = vendorId,
                CategoryId = homeCategory.Id,
                NameEn = "Ceramic Plant Pot Set",
                NameAr = "طقم أواني نباتات سيراميك",
                DescriptionEn = "Set of 3 decorative ceramic plant pots with drainage holes.",
                DescriptionAr = "طقم من 3 أواني نباتات سيراميك مزخرفة مع فتحات تصريف.",
                SKU = "HOME-002",
                Price = 34.99m,
                StockQuantity = 40,
                IsActive = true,
                IsFeatured = false,
                Weight = 1.5m,
                Brand = "GreenHome",
                Tags = "pots,plants,ceramic,garden,decor",
                CreatedAt = DateTime.UtcNow
            },

            // Sports & Outdoors
            new Product
            {
                Id = Guid.NewGuid(),
                VendorId = vendorId,
                CategoryId = sportsCategory.Id,
                NameEn = "Yoga Mat Premium",
                NameAr = "سجادة يوغا فاخرة",
                DescriptionEn = "Non-slip yoga mat with carrying strap. Extra thick for comfort.",
                DescriptionAr = "سجادة يوغا مانعة للانزلاق مع حزام حمل. سميكة جداً للراحة.",
                SKU = "SPORT-001",
                Price = 29.99m,
                StockQuantity = 80,
                IsActive = true,
                IsFeatured = true,
                Weight = 1.0m,
                Brand = "FitLife",
                Tags = "yoga,mat,fitness,exercise,gym",
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.NewGuid(),
                VendorId = vendorId,
                CategoryId = sportsCategory.Id,
                NameEn = "Adjustable Dumbbell Set",
                NameAr = "طقم دمبل قابل للتعديل",
                DescriptionEn = "Adjustable dumbbell set from 5 to 25 lbs. Space-saving design.",
                DescriptionAr = "طقم دمبل قابل للتعديل من 5 إلى 25 رطل. تصميم موفر للمساحة.",
                SKU = "SPORT-002",
                Price = 199.99m,
                DiscountPrice = 169.99m,
                StockQuantity = 25,
                IsActive = true,
                IsFeatured = false,
                Weight = 12.0m,
                Brand = "IronStrong",
                Tags = "dumbbell,weights,fitness,gym,strength",
                CreatedAt = DateTime.UtcNow
            },

            // Books
            new Product
            {
                Id = Guid.NewGuid(),
                VendorId = vendorId,
                CategoryId = booksCategory.Id,
                NameEn = "The Art of Programming",
                NameAr = "فن البرمجة",
                DescriptionEn = "Comprehensive guide to software development best practices.",
                DescriptionAr = "دليل شامل لأفضل ممارسات تطوير البرمجيات.",
                SKU = "BOOK-001",
                Price = 39.99m,
                DiscountPrice = 29.99m,
                StockQuantity = 100,
                IsActive = true,
                IsFeatured = true,
                Weight = 0.6m,
                Brand = "TechBooks",
                Tags = "programming,software,development,coding,tech",
                CreatedAt = DateTime.UtcNow
            },
            new Product
            {
                Id = Guid.NewGuid(),
                VendorId = vendorId,
                CategoryId = booksCategory.Id,
                NameEn = "Business Strategy Essentials",
                NameAr = "أساسيات استراتيجية الأعمال",
                DescriptionEn = "Learn the fundamentals of business strategy and leadership.",
                DescriptionAr = "تعلم أساسيات استراتيجية الأعمال والقيادة.",
                SKU = "BOOK-002",
                Price = 24.99m,
                StockQuantity = 60,
                IsActive = true,
                IsFeatured = false,
                Weight = 0.4m,
                Brand = "BizPress",
                Tags = "business,strategy,leadership,management",
                CreatedAt = DateTime.UtcNow
            }
        };

        await context.Products.AddRangeAsync(products);

        // Create sample address for customer
        var address = new Address
        {
            Id = Guid.NewGuid(),
            UserId = customerId,
            Label = "Home",
            FullName = "Jane Customer",
            Phone = "+1234567892",
            Street = "123 Main Street, Apt 4B",
            City = "New York",
            State = "NY",
            Country = "USA",
            PostalCode = "10001",
            IsDefault = true,
            CreatedAt = DateTime.UtcNow
        };

        await context.Addresses.AddAsync(address);

        await context.SaveChangesAsync();
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }
}
