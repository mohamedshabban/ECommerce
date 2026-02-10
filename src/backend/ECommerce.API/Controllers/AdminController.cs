using AutoMapper;
using ECommerce.Application.DTOs.Common;
using ECommerce.Application.DTOs.Users;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Exceptions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ISearchService _searchService;

    public AdminController(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ISearchService searchService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _searchService = searchService;
    }

    [HttpGet("dashboard/stats")]
    public async Task<ActionResult<ApiResponse<DashboardStats>>> GetDashboardStats()
    {
        var totalUsers = await _unitOfWork.Repository<User>().CountAsync();
        var totalProducts = await _unitOfWork.Repository<Product>().CountAsync();
        var totalOrders = await _unitOfWork.Repository<Order>().CountAsync();
        var totalCategories = await _unitOfWork.Repository<Category>().CountAsync();

        var pendingOrders = await _unitOfWork.Repository<Order>()
            .CountAsync(o => o.Status == OrderStatus.Pending);

        var totalRevenue = await _unitOfWork.Repository<Order>().Query()
            .Where(o => o.PaymentStatus == PaymentStatus.Paid)
            .SumAsync(o => o.Total);

        var todayOrders = await _unitOfWork.Repository<Order>()
            .CountAsync(o => o.CreatedAt.Date == DateTime.UtcNow.Date);

        var todayRevenue = await _unitOfWork.Repository<Order>().Query()
            .Where(o => o.CreatedAt.Date == DateTime.UtcNow.Date && o.PaymentStatus == PaymentStatus.Paid)
            .SumAsync(o => o.Total);

        var stats = new DashboardStats(
            totalUsers,
            totalProducts,
            totalOrders,
            totalCategories,
            pendingOrders,
            totalRevenue,
            todayOrders,
            todayRevenue
        );

        return Ok(ApiResponse<DashboardStats>.SuccessResponse(stats));
    }

    [HttpGet("dashboard/sales")]
    public async Task<ActionResult<ApiResponse<IEnumerable<SalesData>>>> GetSalesData(
        [FromQuery] int days = 30)
    {
        var startDate = DateTime.UtcNow.AddDays(-days).Date;

        var salesData = await _unitOfWork.Repository<Order>().Query()
            .Where(o => o.CreatedAt >= startDate && o.PaymentStatus == PaymentStatus.Paid)
            .GroupBy(o => o.CreatedAt.Date)
            .Select(g => new SalesData(
                g.Key,
                g.Count(),
                g.Sum(o => o.Total)
            ))
            .OrderBy(s => s.Date)
            .ToListAsync();

        return Ok(ApiResponse<IEnumerable<SalesData>>.SuccessResponse(salesData));
    }

    [HttpGet("dashboard/top-products")]
    public async Task<ActionResult<ApiResponse<IEnumerable<TopProduct>>>> GetTopProducts(
        [FromQuery] int count = 10)
    {
        var topProducts = await _unitOfWork.Repository<OrderItem>().Query()
            .GroupBy(oi => new { oi.ProductId, oi.ProductNameSnapshot })
            .Select(g => new TopProduct(
                g.Key.ProductId,
                g.Key.ProductNameSnapshot,
                g.Sum(oi => oi.Quantity),
                g.Sum(oi => oi.Total)
            ))
            .OrderByDescending(tp => tp.TotalSold)
            .Take(count)
            .ToListAsync();

        return Ok(ApiResponse<IEnumerable<TopProduct>>.SuccessResponse(topProducts));
    }

    [HttpGet("dashboard/recent-orders")]
    public async Task<ActionResult<ApiResponse<IEnumerable<RecentOrder>>>> GetRecentOrders(
        [FromQuery] int count = 10)
    {
        var recentOrders = await _unitOfWork.Repository<Order>().Query()
            .Include(o => o.User)
            .OrderByDescending(o => o.CreatedAt)
            .Take(count)
            .Select(o => new RecentOrder(
                o.Id,
                o.OrderNumber,
                o.User.FullName,
                o.Total,
                o.Status,
                o.CreatedAt
            ))
            .ToListAsync();

        return Ok(ApiResponse<IEnumerable<RecentOrder>>.SuccessResponse(recentOrders));
    }

    [HttpGet("vendors")]
    public async Task<ActionResult<ApiResponse<PaginatedList<UserListDto>>>> GetVendors(
        [FromQuery] PaginationParams pagination)
    {
        var query = _unitOfWork.Repository<User>().Query()
            .Where(u => u.Role == UserRole.Vendor);

        var totalCount = await query.CountAsync();
        var vendors = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync();

        var vendorDtos = _mapper.Map<List<UserListDto>>(vendors);
        var result = new PaginatedList<UserListDto>(vendorDtos, totalCount, pagination.PageNumber, pagination.PageSize);

        return Ok(ApiResponse<PaginatedList<UserListDto>>.SuccessResponse(result));
    }

    [HttpPut("vendors/{id}/approve")]
    public async Task<ActionResult<ApiResponse<UserDto>>> ApproveVendor(Guid id)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(id);

        if (user == null)
            throw new NotFoundException("User", id);

        user.Role = UserRole.Vendor;
        user.IsActive = true;
        await _unitOfWork.SaveChangesAsync();

        var userDto = _mapper.Map<UserDto>(user);
        return Ok(ApiResponse<UserDto>.SuccessResponse(userDto, "Vendor approved successfully"));
    }

    [HttpPost("reindex-products")]
    public async Task<ActionResult<ApiResponse>> ReindexProducts()
    {
        await _searchService.ReindexAllProductsAsync();
        return Ok(ApiResponse.SuccessResponse("Product reindexing started"));
    }
}

public record DashboardStats(
    int TotalUsers,
    int TotalProducts,
    int TotalOrders,
    int TotalCategories,
    int PendingOrders,
    decimal TotalRevenue,
    int TodayOrders,
    decimal TodayRevenue
);

public record SalesData(DateTime Date, int OrderCount, decimal Revenue);

public record TopProduct(Guid ProductId, string ProductName, int TotalSold, decimal TotalRevenue);

public record RecentOrder(Guid Id, string OrderNumber, string CustomerName, decimal Total, OrderStatus Status, DateTime CreatedAt);
