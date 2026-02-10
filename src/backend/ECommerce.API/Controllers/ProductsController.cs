using AutoMapper;
using ECommerce.Application.DTOs.Common;
using ECommerce.Application.DTOs.Products;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ISearchService _searchService;
    private readonly IFileStorageService _fileStorageService;
    private readonly ICurrentUserService _currentUser;

    public ProductsController(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ISearchService searchService,
        IFileStorageService fileStorageService,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _searchService = searchService;
        _fileStorageService = fileStorageService;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedList<ProductListDto>>>> GetProducts(
        [FromQuery] ProductFilterParams filter,
        [FromQuery] PaginationParams pagination)
    {
        var query = _unitOfWork.Repository<Product>().Query()
            .Include(p => p.Category)
            .Include(p => p.Images)
            .Include(p => p.Reviews)
            .Where(p => p.IsActive);

        if (filter.CategoryId.HasValue)
            query = query.Where(p => p.CategoryId == filter.CategoryId);

        if (filter.VendorId.HasValue)
            query = query.Where(p => p.VendorId == filter.VendorId);

        if (filter.MinPrice.HasValue)
            query = query.Where(p => p.Price >= filter.MinPrice);

        if (filter.MaxPrice.HasValue)
            query = query.Where(p => p.Price <= filter.MaxPrice);

        if (filter.InStock.HasValue && filter.InStock.Value)
            query = query.Where(p => p.StockQuantity > 0);

        if (filter.IsFeatured.HasValue)
            query = query.Where(p => p.IsFeatured == filter.IsFeatured);

        if (!string.IsNullOrEmpty(filter.Brand))
            query = query.Where(p => p.Brand == filter.Brand);

        query = filter.SortBy?.ToLower() switch
        {
            "price" => filter.SortDescending ? query.OrderByDescending(p => p.Price) : query.OrderBy(p => p.Price),
            "name" => filter.SortDescending ? query.OrderByDescending(p => p.NameEn) : query.OrderBy(p => p.NameEn),
            _ => filter.SortDescending ? query.OrderByDescending(p => p.CreatedAt) : query.OrderBy(p => p.CreatedAt)
        };

        var totalCount = await query.CountAsync();
        var products = await query
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync();

        var productDtos = _mapper.Map<List<ProductListDto>>(products);
        var result = new PaginatedList<ProductListDto>(productDtos, totalCount, pagination.PageNumber, pagination.PageSize);

        return Ok(ApiResponse<PaginatedList<ProductListDto>>.SuccessResponse(result));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetProduct(Guid id)
    {
        var product = await _unitOfWork.Repository<Product>().Query()
            .Include(p => p.Category)
            .Include(p => p.Vendor)
            .Include(p => p.Images.OrderBy(i => i.SortOrder))
            .Include(p => p.Reviews.Where(r => r.IsApproved))
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            throw new NotFoundException("Product", id);

        var productDto = _mapper.Map<ProductDto>(product);
        return Ok(ApiResponse<ProductDto>.SuccessResponse(productDto));
    }

    [HttpGet("search")]
    public async Task<ActionResult<ApiResponse<ProductSearchResultDto>>> SearchProducts(
        [FromQuery] ProductSearchRequestDto request)
    {
        var result = await _searchService.SearchProductsAsync(request);
        return Ok(ApiResponse<ProductSearchResultDto>.SuccessResponse(result));
    }

    [HttpGet("autocomplete")]
    public async Task<ActionResult<ApiResponse<IEnumerable<string>>>> GetAutocompleteSuggestions(
        [FromQuery] string query)
    {
        var suggestions = await _searchService.GetAutocompleteSuggestionsAsync(query);
        return Ok(ApiResponse<IEnumerable<string>>.SuccessResponse(suggestions));
    }

    [Authorize(Policy = "VendorOnly")]
    [HttpPost]
    public async Task<ActionResult<ApiResponse<ProductDto>>> CreateProduct(
        [FromBody] CreateProductRequest request)
    {
        var category = await _unitOfWork.Repository<Category>().GetByIdAsync(request.CategoryId);
        if (category == null)
            throw new NotFoundException("Category", request.CategoryId);

        var existingSku = await _unitOfWork.Repository<Product>()
            .AnyAsync(p => p.SKU == request.SKU);
        if (existingSku)
            throw new BadRequestException("A product with this SKU already exists");

        var product = _mapper.Map<Product>(request);
        product.Id = Guid.NewGuid();
        product.VendorId = _currentUser.UserId!.Value;
        product.IsActive = true;

        await _unitOfWork.Repository<Product>().AddAsync(product);
        await _unitOfWork.SaveChangesAsync();

        // Reload with includes
        var createdProduct = await _unitOfWork.Repository<Product>().Query()
            .Include(p => p.Category)
            .Include(p => p.Vendor)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == product.Id);

        var productDto = _mapper.Map<ProductDto>(createdProduct);

        // Index in Elasticsearch
        await _searchService.IndexProductAsync(productDto);

        return CreatedAtAction(nameof(GetProduct), new { id = product.Id },
            ApiResponse<ProductDto>.SuccessResponse(productDto, "Product created successfully"));
    }

    [Authorize(Policy = "VendorOnly")]
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> UpdateProduct(
        Guid id, [FromBody] UpdateProductRequest request)
    {
        var product = await _unitOfWork.Repository<Product>().Query()
            .Include(p => p.Category)
            .Include(p => p.Vendor)
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            throw new NotFoundException("Product", id);

        if (product.VendorId != _currentUser.UserId && !_currentUser.IsAdmin)
            throw new ForbiddenException("You can only update your own products");

        var existingSku = await _unitOfWork.Repository<Product>()
            .AnyAsync(p => p.SKU == request.SKU && p.Id != id);
        if (existingSku)
            throw new BadRequestException("A product with this SKU already exists");

        _mapper.Map(request, product);
        await _unitOfWork.SaveChangesAsync();

        var productDto = _mapper.Map<ProductDto>(product);

        // Update in Elasticsearch
        await _searchService.IndexProductAsync(productDto);

        return Ok(ApiResponse<ProductDto>.SuccessResponse(productDto, "Product updated successfully"));
    }

    [Authorize(Policy = "VendorOnly")]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteProduct(Guid id)
    {
        var product = await _unitOfWork.Repository<Product>().GetByIdAsync(id);

        if (product == null)
            throw new NotFoundException("Product", id);

        if (product.VendorId != _currentUser.UserId && !_currentUser.IsAdmin)
            throw new ForbiddenException("You can only delete your own products");

        _unitOfWork.Repository<Product>().Remove(product);
        await _unitOfWork.SaveChangesAsync();

        // Remove from Elasticsearch
        await _searchService.DeleteProductAsync(id);

        return Ok(ApiResponse.SuccessResponse("Product deleted successfully"));
    }

    [Authorize(Policy = "VendorOnly")]
    [HttpPost("{id}/images")]
    public async Task<ActionResult<ApiResponse<IEnumerable<ProductImageDto>>>> UploadImages(
        Guid id, [FromForm] List<IFormFile> files, [FromQuery] bool isPrimary = false)
    {
        var product = await _unitOfWork.Repository<Product>().Query()
            .Include(p => p.Images)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product == null)
            throw new NotFoundException("Product", id);

        if (product.VendorId != _currentUser.UserId && !_currentUser.IsAdmin)
            throw new ForbiddenException("You can only upload images to your own products");

        var uploadedUrls = await _fileStorageService.UploadFilesAsync(files, $"products/{id}");

        var images = uploadedUrls.Select((url, index) => new ProductImage
        {
            ProductId = id,
            ImageUrl = url,
            IsPrimary = isPrimary && index == 0 && !product.Images.Any(i => i.IsPrimary),
            SortOrder = product.Images.Count + index
        }).ToList();

        await _unitOfWork.Repository<ProductImage>().AddRangeAsync(images);
        await _unitOfWork.SaveChangesAsync();

        var imageDtos = _mapper.Map<IEnumerable<ProductImageDto>>(images);
        return Ok(ApiResponse<IEnumerable<ProductImageDto>>.SuccessResponse(imageDtos, "Images uploaded successfully"));
    }

    [Authorize(Policy = "VendorOnly")]
    [HttpDelete("{id}/images/{imageId}")]
    public async Task<ActionResult<ApiResponse>> DeleteImage(Guid id, int imageId)
    {
        var product = await _unitOfWork.Repository<Product>().GetByIdAsync(id);

        if (product == null)
            throw new NotFoundException("Product", id);

        if (product.VendorId != _currentUser.UserId && !_currentUser.IsAdmin)
            throw new ForbiddenException("You can only delete images from your own products");

        var image = await _unitOfWork.Repository<ProductImage>()
            .FirstOrDefaultAsync(i => i.Id == imageId && i.ProductId == id);

        if (image == null)
            throw new NotFoundException("Image", imageId);

        await _fileStorageService.DeleteFileAsync(image.ImageUrl);
        _unitOfWork.Repository<ProductImage>().Remove(image);
        await _unitOfWork.SaveChangesAsync();

        return Ok(ApiResponse.SuccessResponse("Image deleted successfully"));
    }
}
