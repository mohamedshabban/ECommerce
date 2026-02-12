namespace ECommerce.Application.DTOs.Products;

public record ProductDto
{
    public Guid Id { get; init; }
    public Guid VendorId { get; init; }
    public string VendorName { get; init; } = string.Empty;
    public int CategoryId { get; init; }
    public string CategoryNameEn { get; init; } = string.Empty;
    public string CategoryNameAr { get; init; } = string.Empty;
    public string NameEn { get; init; } = string.Empty;
    public string NameAr { get; init; } = string.Empty;
    public string? DescriptionEn { get; init; }
    public string? DescriptionAr { get; init; }
    public string SKU { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public decimal? DiscountPrice { get; init; }
    public decimal CurrentPrice { get; init; }
    public decimal DiscountPercentage { get; init; }
    public int StockQuantity { get; init; }
    public bool InStock { get; init; }
    public bool IsActive { get; init; }
    public bool IsFeatured { get; init; }
    public string? Brand { get; init; }
    public string? Tags { get; init; }
    public double AverageRating { get; init; }
    public int ReviewCount { get; init; }
    public IEnumerable<ProductImageDto> Images { get; init; } = Enumerable.Empty<ProductImageDto>();
    public DateTime CreatedAt { get; init; }
}

public record ProductListDto
{
    public Guid Id { get; init; }
    public string NameEn { get; init; } = string.Empty;
    public string NameAr { get; init; } = string.Empty;
    public string CategoryNameEn { get; init; } = string.Empty;
    public string CategoryNameAr { get; init; } = string.Empty;
    public decimal Price { get; init; }
    public decimal? DiscountPrice { get; init; }
    public decimal CurrentPrice { get; init; }
    public int StockQuantity { get; init; }
    public bool InStock { get; init; }
    public bool IsFeatured { get; init; }
    public string? PrimaryImageUrl { get; init; }
    public double AverageRating { get; init; }
    public int ReviewCount { get; init; }
}

public record ProductImageDto
{
    public int Id { get; init; }
    public string ImageUrl { get; init; } = string.Empty;
    public string? AltText { get; init; }
    public bool IsPrimary { get; init; }
    public int SortOrder { get; init; }
}

public record CreateProductRequest(
    int CategoryId,
    string NameEn,
    string NameAr,
    string? DescriptionEn,
    string? DescriptionAr,
    string SKU,
    decimal Price,
    decimal? DiscountPrice,
    int StockQuantity,
    bool IsFeatured,
    decimal Weight,
    string? Brand,
    string? Tags
);

public record UpdateProductRequest(
    int CategoryId,
    string NameEn,
    string NameAr,
    string? DescriptionEn,
    string? DescriptionAr,
    string SKU,
    decimal Price,
    decimal? DiscountPrice,
    int StockQuantity,
    bool IsActive,
    bool IsFeatured,
    decimal Weight,
    string? Brand,
    string? Tags
);

public record ProductFilterParams
{
    public int? CategoryId { get; set; }
    public Guid? VendorId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public bool? InStock { get; set; }
    public bool? IsFeatured { get; set; }
    public string? Brand { get; set; }
    public string? SortBy { get; set; } = "CreatedAt";
    public bool SortDescending { get; set; } = true;
}

public record ProductSearchRequestDto
{
    public string? Query { get; set; }
    public int? CategoryId { get; set; }
    public decimal? MinPrice { get; set; }
    public decimal? MaxPrice { get; set; }
    public string? Brand { get; set; }
    public int PageNumber { get; set; } = 1;
    public int PageSize { get; set; } = 10;
    public string? SortBy { get; set; }
    public bool SortDescending { get; set; } = true;
}

public record ProductSearchResultDto(
    IEnumerable<ProductListDto> Products,
    int TotalCount,
    int PageNumber,
    int PageSize,
    int TotalPages,
    IEnumerable<FacetDto>? CategoryFacets,
    IEnumerable<FacetDto>? BrandFacets
);

public record FacetDto(string Key, long Count);

public record ProductReviewDto
{
    public Guid Id { get; init; }
    public Guid UserId { get; init; }
    public string UserName { get; init; } = string.Empty;
    public int Rating { get; init; }
    public string? Title { get; init; }
    public string? Comment { get; init; }
    public bool IsVerifiedPurchase { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record CreateReviewRequest(
    int Rating,
    string? Title,
    string? Comment
);
