using System.Text.RegularExpressions;
using AutoMapper;
using ECommerce.Application.DTOs.Categories;
using ECommerce.Application.DTOs.Common;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public partial class CategoriesController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IFileStorageService _fileStorageService;

    public CategoriesController(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        IFileStorageService fileStorageService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _fileStorageService = fileStorageService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<CategoryListDto>>>> GetCategories(
        [FromQuery] bool includeInactive = false,
        [FromQuery] bool hierarchical = true)
    {
        var query = _unitOfWork.Repository<Category>().Query()
            .Include(c => c.Products)
            .Include(c => c.SubCategories)
            .AsQueryable();

        if (!includeInactive)
            query = query.Where(c => c.IsActive);

        if (hierarchical)
            query = query.Where(c => c.ParentCategoryId == null);

        var categories = await query.OrderBy(c => c.SortOrder).ToListAsync();
        var categoryDtos = _mapper.Map<IEnumerable<CategoryListDto>>(categories);

        return Ok(ApiResponse<IEnumerable<CategoryListDto>>.SuccessResponse(categoryDtos));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetCategory(int id)
    {
        var category = await _unitOfWork.Repository<Category>().Query()
            .Include(c => c.ParentCategory)
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
            throw new NotFoundException("Category", id);

        var categoryDto = _mapper.Map<CategoryDto>(category);
        return Ok(ApiResponse<CategoryDto>.SuccessResponse(categoryDto));
    }

    [HttpGet("slug/{slug}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetCategoryBySlug(string slug)
    {
        var category = await _unitOfWork.Repository<Category>().Query()
            .Include(c => c.ParentCategory)
            .Include(c => c.Products)
            .FirstOrDefaultAsync(c => c.Slug == slug);

        if (category == null)
            throw new NotFoundException("Category", slug);

        var categoryDto = _mapper.Map<CategoryDto>(category);
        return Ok(ApiResponse<CategoryDto>.SuccessResponse(categoryDto));
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> CreateCategory(
        [FromBody] CreateCategoryRequest request)
    {
        if (request.ParentCategoryId.HasValue)
        {
            var parentExists = await _unitOfWork.Repository<Category>()
                .AnyAsync(c => c.Id == request.ParentCategoryId);
            if (!parentExists)
                throw new NotFoundException("Parent category", request.ParentCategoryId);
        }

        var slug = GenerateSlug(request.NameEn);
        var slugExists = await _unitOfWork.Repository<Category>()
            .AnyAsync(c => c.Slug == slug);

        if (slugExists)
            slug = $"{slug}-{DateTime.UtcNow.Ticks}";

        var category = _mapper.Map<Category>(request);
        category.Slug = slug;
        category.IsActive = true;

        await _unitOfWork.Repository<Category>().AddAsync(category);
        await _unitOfWork.SaveChangesAsync();

        var categoryDto = _mapper.Map<CategoryDto>(category);
        return CreatedAtAction(nameof(GetCategory), new { id = category.Id },
            ApiResponse<CategoryDto>.SuccessResponse(categoryDto, "Category created successfully"));
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> UpdateCategory(
        int id, [FromBody] UpdateCategoryRequest request)
    {
        var category = await _unitOfWork.Repository<Category>().GetByIdAsync(id);

        if (category == null)
            throw new NotFoundException("Category", id);

        if (request.ParentCategoryId.HasValue)
        {
            if (request.ParentCategoryId == id)
                throw new BadRequestException("A category cannot be its own parent");

            var parentExists = await _unitOfWork.Repository<Category>()
                .AnyAsync(c => c.Id == request.ParentCategoryId);
            if (!parentExists)
                throw new NotFoundException("Parent category", request.ParentCategoryId);
        }

        _mapper.Map(request, category);

        var newSlug = GenerateSlug(request.NameEn);
        if (newSlug != category.Slug)
        {
            var slugExists = await _unitOfWork.Repository<Category>()
                .AnyAsync(c => c.Slug == newSlug && c.Id != id);
            category.Slug = slugExists ? $"{newSlug}-{DateTime.UtcNow.Ticks}" : newSlug;
        }

        await _unitOfWork.SaveChangesAsync();

        var categoryDto = _mapper.Map<CategoryDto>(category);
        return Ok(ApiResponse<CategoryDto>.SuccessResponse(categoryDto, "Category updated successfully"));
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPost("{id}/image")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> UploadImage(int id, IFormFile file)
    {
        var category = await _unitOfWork.Repository<Category>().GetByIdAsync(id);

        if (category == null)
            throw new NotFoundException("Category", id);

        if (!string.IsNullOrEmpty(category.ImageUrl))
            await _fileStorageService.DeleteFileAsync(category.ImageUrl);

        category.ImageUrl = await _fileStorageService.UploadFileAsync(file, "categories");
        await _unitOfWork.SaveChangesAsync();

        var categoryDto = _mapper.Map<CategoryDto>(category);
        return Ok(ApiResponse<CategoryDto>.SuccessResponse(categoryDto, "Image uploaded successfully"));
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteCategory(int id)
    {
        var category = await _unitOfWork.Repository<Category>().Query()
            .Include(c => c.Products)
            .Include(c => c.SubCategories)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (category == null)
            throw new NotFoundException("Category", id);

        if (category.Products.Any())
            throw new BadRequestException("Cannot delete a category that has products");

        if (category.SubCategories.Any())
            throw new BadRequestException("Cannot delete a category that has subcategories");

        _unitOfWork.Repository<Category>().Remove(category);
        await _unitOfWork.SaveChangesAsync();

        return Ok(ApiResponse.SuccessResponse("Category deleted successfully"));
    }

    private static string GenerateSlug(string name)
    {
        var slug = name.ToLowerInvariant();
        slug = SlugInvalidCharsRegex().Replace(slug, "");
        slug = SlugWhitespaceRegex().Replace(slug, "-");
        slug = SlugMultipleDashesRegex().Replace(slug, "-");
        return slug.Trim('-');
    }

    [GeneratedRegex(@"[^a-z0-9\s-]")]
    private static partial Regex SlugInvalidCharsRegex();

    [GeneratedRegex(@"\s+")]
    private static partial Regex SlugWhitespaceRegex();

    [GeneratedRegex(@"-+")]
    private static partial Regex SlugMultipleDashesRegex();
}
