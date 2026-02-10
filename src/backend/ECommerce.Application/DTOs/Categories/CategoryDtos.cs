namespace ECommerce.Application.DTOs.Categories;

public record CategoryDto(
    int Id,
    string NameEn,
    string NameAr,
    string Slug,
    string? DescriptionEn,
    string? DescriptionAr,
    string? ImageUrl,
    int? ParentCategoryId,
    string? ParentCategoryName,
    bool IsActive,
    int SortOrder,
    int ProductCount
);

public record CategoryListDto(
    int Id,
    string NameEn,
    string NameAr,
    string Slug,
    string? ImageUrl,
    int? ParentCategoryId,
    bool IsActive,
    int ProductCount,
    IEnumerable<CategoryListDto>? SubCategories
);

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
