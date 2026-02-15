-- E-Commerce Seed Data Script
-- Mirrors DatabaseSeeder.cs: 3 users, 3 carts, 5 categories, 11 products, 1 address
-- Password hashes are SHA256 (same algorithm as DatabaseSeeder.HashPassword)
-- Usage: Execute against your E-Commerce SQL Server database

SET NOCOUNT ON;

-- Only seed if database is empty
IF NOT EXISTS (SELECT 1 FROM Users)
BEGIN
    PRINT 'Seeding database...';

    -- Pre-computed SHA256 password hashes (Base64 encoded)
    -- Admin@123  -> sha256 -> base64
    -- Vendor@123 -> sha256 -> base64
    -- Customer@123 -> sha256 -> base64
    DECLARE @AdminPasswordHash NVARCHAR(256) = 'JAvToCiVmq/V6G/oF7EKqRf7aBfjVafMqwOHRgGHG0Y=';
    DECLARE @VendorPasswordHash NVARCHAR(256) = '7vbrsg0N9AlN76ebYqBZSs/jHn3k8T6JYh73Pr7h/eU=';
    DECLARE @CustomerPasswordHash NVARCHAR(256) = 'UxlQFWYhMUWyroVjlOWzHPwxPnkz1jD0CPMTRXW/GXY=';

    DECLARE @AdminId UNIQUEIDENTIFIER = NEWID();
    DECLARE @VendorId UNIQUEIDENTIFIER = NEWID();
    DECLARE @CustomerId UNIQUEIDENTIFIER = NEWID();
    DECLARE @Now DATETIME2 = SYSUTCDATETIME();

    -- ============================
    -- Users
    -- ============================
    INSERT INTO Users (Id, Email, PasswordHash, FirstName, LastName, PhoneNumber, Role, IsActive, EmailConfirmed, CreatedAt)
    VALUES
        (@AdminId, 'admin@eshop.com', @AdminPasswordHash, 'Admin', 'User', '+1234567890', 2, 1, 1, @Now),
        (@VendorId, 'vendor@eshop.com', @VendorPasswordHash, 'John', 'Vendor', '+1234567891', 1, 1, 1, @Now),
        (@CustomerId, 'customer@eshop.com', @CustomerPasswordHash, 'Jane', 'Customer', '+1234567892', 0, 1, 1, @Now);

    PRINT '  3 users created (admin, vendor, customer)';

    -- ============================
    -- Carts
    -- ============================
    INSERT INTO Carts (Id, UserId, CreatedAt)
    VALUES
        (NEWID(), @AdminId, @Now),
        (NEWID(), @VendorId, @Now),
        (NEWID(), @CustomerId, @Now);

    PRINT '  3 carts created';

    -- ============================
    -- Categories (Id is auto-generated int)
    -- ============================
    DECLARE @ElectronicsId INT;
    DECLARE @ClothingId INT;
    DECLARE @HomeId INT;
    DECLARE @SportsId INT;
    DECLARE @BooksId INT;

    INSERT INTO Categories (NameEn, NameAr, Slug, DescriptionEn, DescriptionAr, IsActive, SortOrder, CreatedAt)
    VALUES ('Electronics', N'إلكترونيات', 'electronics', 'Electronic devices and gadgets', N'الأجهزة الإلكترونية والأدوات', 1, 1, @Now);
    SET @ElectronicsId = SCOPE_IDENTITY();

    INSERT INTO Categories (NameEn, NameAr, Slug, DescriptionEn, DescriptionAr, IsActive, SortOrder, CreatedAt)
    VALUES ('Clothing', N'ملابس', 'clothing', 'Fashion and apparel', N'الأزياء والملابس', 1, 2, @Now);
    SET @ClothingId = SCOPE_IDENTITY();

    INSERT INTO Categories (NameEn, NameAr, Slug, DescriptionEn, DescriptionAr, IsActive, SortOrder, CreatedAt)
    VALUES ('Home & Garden', N'المنزل والحديقة', 'home-garden', 'Home decor and garden supplies', N'ديكور المنزل ومستلزمات الحديقة', 1, 3, @Now);
    SET @HomeId = SCOPE_IDENTITY();

    INSERT INTO Categories (NameEn, NameAr, Slug, DescriptionEn, DescriptionAr, IsActive, SortOrder, CreatedAt)
    VALUES ('Sports & Outdoors', N'الرياضة والأنشطة الخارجية', 'sports-outdoors', 'Sports equipment and outdoor gear', N'معدات رياضية وأدوات خارجية', 1, 4, @Now);
    SET @SportsId = SCOPE_IDENTITY();

    INSERT INTO Categories (NameEn, NameAr, Slug, DescriptionEn, DescriptionAr, IsActive, SortOrder, CreatedAt)
    VALUES ('Books', N'كتب', 'books', 'Books, magazines and publications', N'الكتب والمجلات والمطبوعات', 1, 5, @Now);
    SET @BooksId = SCOPE_IDENTITY();

    PRINT '  5 categories created';

    -- ============================
    -- Products
    -- ============================

    -- Electronics
    INSERT INTO Products (Id, VendorId, CategoryId, NameEn, NameAr, DescriptionEn, DescriptionAr, SKU, Price, DiscountPrice, StockQuantity, IsActive, IsFeatured, Weight, Brand, Tags, CreatedAt)
    VALUES
        (NEWID(), @VendorId, @ElectronicsId,
         'Wireless Bluetooth Headphones', N'سماعات بلوتوث لاسلكية',
         'High-quality wireless headphones with noise cancellation and 30-hour battery life.',
         N'سماعات لاسلكية عالية الجودة مع إلغاء الضوضاء وعمر بطارية 30 ساعة.',
         'ELEC-001', 149.99, 129.99, 50, 1, 1, 0.3, 'SoundMax',
         'headphones,wireless,bluetooth,audio', @Now),

        (NEWID(), @VendorId, @ElectronicsId,
         'Smart Watch Pro', N'ساعة ذكية برو',
         'Feature-rich smartwatch with health monitoring, GPS, and water resistance.',
         N'ساعة ذكية غنية بالميزات مع مراقبة الصحة ونظام تحديد المواقع ومقاومة الماء.',
         'ELEC-002', 299.99, NULL, 30, 1, 1, 0.1, 'TechTime',
         'smartwatch,wearable,fitness,gps', @Now),

        (NEWID(), @VendorId, @ElectronicsId,
         'Portable Power Bank 20000mAh', N'شاحن متنقل 20000 مللي أمبير',
         'Fast charging power bank with dual USB ports and LED indicator.',
         N'شاحن متنقل سريع الشحن مع منفذي USB ومؤشر LED.',
         'ELEC-003', 49.99, 39.99, 100, 1, 0, 0.4, 'PowerUp',
         'powerbank,charger,portable,usb', @Now);

    -- Clothing
    INSERT INTO Products (Id, VendorId, CategoryId, NameEn, NameAr, DescriptionEn, DescriptionAr, SKU, Price, DiscountPrice, StockQuantity, IsActive, IsFeatured, Weight, Brand, Tags, CreatedAt)
    VALUES
        (NEWID(), @VendorId, @ClothingId,
         'Men''s Classic Polo Shirt', N'قميص بولو كلاسيكي للرجال',
         'Premium cotton polo shirt with embroidered logo. Available in multiple colors.',
         N'قميص بولو قطني فاخر مع شعار مطرز. متوفر بألوان متعددة.',
         'CLOTH-001', 59.99, 49.99, 200, 1, 1, 0.2, 'StyleCo',
         'polo,shirt,men,cotton,casual', @Now),

        (NEWID(), @VendorId, @ClothingId,
         'Women''s Running Shoes', N'حذاء جري نسائي',
         'Lightweight and breathable running shoes with superior cushioning.',
         N'حذاء جري خفيف الوزن وقابل للتنفس مع توسيد فائق.',
         'CLOTH-002', 89.99, NULL, 75, 1, 0, 0.5, 'RunFast',
         'shoes,running,women,sports,athletic', @Now);

    -- Home & Garden
    INSERT INTO Products (Id, VendorId, CategoryId, NameEn, NameAr, DescriptionEn, DescriptionAr, SKU, Price, DiscountPrice, StockQuantity, IsActive, IsFeatured, Weight, Brand, Tags, CreatedAt)
    VALUES
        (NEWID(), @VendorId, @HomeId,
         'Modern LED Desk Lamp', N'مصباح مكتب LED عصري',
         'Adjustable LED desk lamp with touch control and USB charging port.',
         N'مصباح مكتب LED قابل للتعديل مع تحكم باللمس ومنفذ شحن USB.',
         'HOME-001', 45.99, 35.99, 60, 1, 1, 0.8, 'LightPro',
         'lamp,led,desk,office,lighting', @Now),

        (NEWID(), @VendorId, @HomeId,
         'Ceramic Plant Pot Set', N'طقم أواني نباتات سيراميك',
         'Set of 3 decorative ceramic plant pots with drainage holes.',
         N'طقم من 3 أواني نباتات سيراميك مزخرفة مع فتحات تصريف.',
         'HOME-002', 34.99, NULL, 40, 1, 0, 1.5, 'GreenHome',
         'pots,plants,ceramic,garden,decor', @Now);

    -- Sports & Outdoors
    INSERT INTO Products (Id, VendorId, CategoryId, NameEn, NameAr, DescriptionEn, DescriptionAr, SKU, Price, DiscountPrice, StockQuantity, IsActive, IsFeatured, Weight, Brand, Tags, CreatedAt)
    VALUES
        (NEWID(), @VendorId, @SportsId,
         'Yoga Mat Premium', N'سجادة يوغا فاخرة',
         'Non-slip yoga mat with carrying strap. Extra thick for comfort.',
         N'سجادة يوغا مانعة للانزلاق مع حزام حمل. سميكة جداً للراحة.',
         'SPORT-001', 29.99, NULL, 80, 1, 1, 1.0, 'FitLife',
         'yoga,mat,fitness,exercise,gym', @Now),

        (NEWID(), @VendorId, @SportsId,
         'Adjustable Dumbbell Set', N'طقم دمبل قابل للتعديل',
         'Adjustable dumbbell set from 5 to 25 lbs. Space-saving design.',
         N'طقم دمبل قابل للتعديل من 5 إلى 25 رطل. تصميم موفر للمساحة.',
         'SPORT-002', 199.99, 169.99, 25, 1, 0, 12.0, 'IronStrong',
         'dumbbell,weights,fitness,gym,strength', @Now);

    -- Books
    INSERT INTO Products (Id, VendorId, CategoryId, NameEn, NameAr, DescriptionEn, DescriptionAr, SKU, Price, DiscountPrice, StockQuantity, IsActive, IsFeatured, Weight, Brand, Tags, CreatedAt)
    VALUES
        (NEWID(), @VendorId, @BooksId,
         'The Art of Programming', N'فن البرمجة',
         'Comprehensive guide to software development best practices.',
         N'دليل شامل لأفضل ممارسات تطوير البرمجيات.',
         'BOOK-001', 39.99, 29.99, 100, 1, 1, 0.6, 'TechBooks',
         'programming,software,development,coding,tech', @Now),

        (NEWID(), @VendorId, @BooksId,
         'Business Strategy Essentials', N'أساسيات استراتيجية الأعمال',
         'Learn the fundamentals of business strategy and leadership.',
         N'تعلم أساسيات استراتيجية الأعمال والقيادة.',
         'BOOK-002', 24.99, NULL, 60, 1, 0, 0.4, 'BizPress',
         'business,strategy,leadership,management', @Now);

    PRINT '  11 products created';

    -- ============================
    -- Address (for customer)
    -- ============================
    INSERT INTO Addresses (Id, UserId, Label, FullName, Phone, Street, City, [State], Country, PostalCode, IsDefault, CreatedAt)
    VALUES (NEWID(), @CustomerId, 'Home', 'Jane Customer', '+1234567892',
            '123 Main Street, Apt 4B', 'New York', 'NY', 'USA', '10001', 1, @Now);

    PRINT '  1 address created';
    PRINT '';
    PRINT 'Seed data inserted successfully!';
    PRINT 'Login credentials:';
    PRINT '  Admin:    admin@eshop.com    / Admin@123';
    PRINT '  Vendor:   vendor@eshop.com   / Vendor@123';
    PRINT '  Customer: customer@eshop.com / Customer@123';
END
ELSE
BEGIN
    PRINT 'Database already contains data. Skipping seed.';
END
