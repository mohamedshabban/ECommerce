namespace ECommerce.Application.DTOs.Categories;

public record CategoryDto
{
    public int Id { get; init; }
    public string NameEn { get; init; } = string.Empty;
    public string NameAr { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? DescriptionEn { get; init; }
    public string? DescriptionAr { get; init; }
    public string? ImageUrl { get; init; }
    public int? ParentCategoryId { get; init; }
    public string? ParentCategoryName { get; init; }
    public bool IsActive { get; init; }
    public int SortOrder { get; init; }
    public int ProductCount { get; init; }
}

public record CategoryListDto
{
    public int Id { get; init; }
    public string NameEn { get; init; } = string.Empty;
    public string NameAr { get; init; } = string.Empty;
    public string Slug { get; init; } = string.Empty;
    public string? ImageUrl { get; init; }
    public int? ParentCategoryId { get; init; }
    public bool IsActive { get; init; }
    public int ProductCount { get; init; }
    public IEnumerable<CategoryListDto>? SubCategories { get; init; }
}

public record CreateCategoryRequest(
    string NameEn,
    string NameAr,
    string? DescriptionEn,
    string? DescriptionAr,
    int? ParentCategoryId,
    int SortOrder
);

public record UpdateCategoryRequest(
    string NameEn,
    string NameAr,
    string? DescriptionEn,
    string? DescriptionAr,
    int? ParentCategoryId,
    bool IsActive,
    int SortOrder
);
