using AutoMapper;
using ECommerce.Application.DTOs.Common;
using ECommerce.Application.DTOs.Orders;
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
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;
    private readonly IPaymentService _paymentService;
    private readonly IEmailService _emailService;

    public OrdersController(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ICurrentUserService currentUser,
        IPaymentService paymentService,
        IEmailService emailService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUser = currentUser;
        _paymentService = paymentService;
        _emailService = emailService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedList<OrderListDto>>>> GetOrders(
        [FromQuery] OrderFilterParams filter,
        [FromQuery] PaginationParams pagination)
    {
        var query = _unitOfWork.Repository<Order>().Query()
            .Include(o => o.User)
            .Include(o => o.Items)
            .AsQueryable();

        // Non-admins can only see their own orders
        if (!_currentUser.IsAdmin)
        {
            query = query.Where(o => o.UserId == _currentUser.UserId);
        }

        // Vendors can see orders containing their products
        if (_currentUser.IsVendor && !_currentUser.IsAdmin)
        {
            query = query.Where(o => o.Items.Any(i => i.VendorId == _currentUser.UserId));
        }

        if (filter.Status.HasValue)
            query = query.Where(o => o.Status == filter.Status);

        if (filter.PaymentStatus.HasValue)
            query = query.Where(o => o.PaymentStatus == filter.PaymentStatus);

        if (filter.FromDate.HasValue)
            query = query.Where(o => o.CreatedAt >= filter.FromDate);

        if (filter.ToDate.HasValue)
            query = query.Where(o => o.CreatedAt <= filter.ToDate);

        var totalCount = await query.CountAsync();
        var orders = await query
            .OrderByDescending(o => o.CreatedAt)
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync();

        var orderDtos = _mapper.Map<List<OrderListDto>>(orders);
        var result = new PaginatedList<OrderListDto>(orderDtos, totalCount, pagination.PageNumber, pagination.PageSize);

        return Ok(ApiResponse<PaginatedList<OrderListDto>>.SuccessResponse(result));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<OrderDto>>> GetOrder(Guid id)
    {
        var order = await _unitOfWork.Repository<Order>().Query()
            .Include(o => o.User)
            .Include(o => o.ShippingAddress)
            .Include(o => o.Items)
                .ThenInclude(i => i.Vendor)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            throw new NotFoundException("Order", id);

        // Check access
        if (!_currentUser.IsAdmin && order.UserId != _currentUser.UserId)
        {
            var hasVendorItems = order.Items.Any(i => i.VendorId == _currentUser.UserId);
            if (!hasVendorItems)
                throw new ForbiddenException();
        }

        var orderDto = _mapper.Map<OrderDto>(order);
        return Ok(ApiResponse<OrderDto>.SuccessResponse(orderDto));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<OrderDto>>> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var cart = await _unitOfWork.Repository<Cart>().Query()
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == _currentUser.UserId);

        if (cart == null || !cart.Items.Any())
            throw new BadRequestException("Your cart is empty");

        var address = await _unitOfWork.Repository<Address>()
            .FirstOrDefaultAsync(a => a.Id == request.ShippingAddressId && a.UserId == _currentUser.UserId);

        if (address == null)
            throw new NotFoundException("Address", request.ShippingAddressId);

        // Validate stock
        foreach (var item in cart.Items)
        {
            if (item.Product.StockQuantity < item.Quantity)
                throw new BadRequestException($"Insufficient stock for {item.Product.NameEn}");
        }

        await _unitOfWork.BeginTransactionAsync();

        try
        {
            var order = new Order
            {
                Id = Guid.NewGuid(),
                UserId = _currentUser.UserId!.Value,
                OrderNumber = Order.GenerateOrderNumber(),
                Status = OrderStatus.Pending,
                ShippingAddressId = request.ShippingAddressId,
                PaymentMethod = request.PaymentMethod,
                PaymentStatus = PaymentStatus.Pending,
                Notes = request.Notes,
                SubTotal = cart.Items.Sum(i => i.Product.CurrentPrice * i.Quantity),
                ShippingCost = 0, // Could be calculated based on address
                Tax = 0 // Could be calculated based on region
            };

            order.Total = order.SubTotal + order.ShippingCost + order.Tax - order.Discount;

            // Create order items and update stock
            foreach (var cartItem in cart.Items)
            {
                var orderItem = new OrderItem
                {
                    Id = Guid.NewGuid(),
                    OrderId = order.Id,
                    ProductId = cartItem.ProductId,
                    VendorId = cartItem.Product.VendorId,
                    ProductNameSnapshot = cartItem.Product.NameEn,
                    ProductImageSnapshot = cartItem.Product.Images.FirstOrDefault()?.ImageUrl,
                    Quantity = cartItem.Quantity,
                    UnitPrice = cartItem.Product.CurrentPrice,
                    Total = cartItem.Product.CurrentPrice * cartItem.Quantity
                };

                await _unitOfWork.Repository<OrderItem>().AddAsync(orderItem);

                // Update stock
                cartItem.Product.StockQuantity -= cartItem.Quantity;
            }

            await _unitOfWork.Repository<Order>().AddAsync(order);

            // Clear cart
            _unitOfWork.Repository<CartItem>().RemoveRange(cart.Items);

            await _unitOfWork.CommitTransactionAsync();

            var createdOrder = await _unitOfWork.Repository<Order>().Query()
                .Include(o => o.User)
                .Include(o => o.ShippingAddress)
                .Include(o => o.Items)
                    .ThenInclude(i => i.Vendor)
                .FirstOrDefaultAsync(o => o.Id == order.Id);

            var orderDto = _mapper.Map<OrderDto>(createdOrder);
            return CreatedAtAction(nameof(GetOrder), new { id = order.Id },
                ApiResponse<OrderDto>.SuccessResponse(orderDto, "Order created successfully"));
        }
        catch
        {
            await _unitOfWork.RollbackTransactionAsync();
            throw;
        }
    }

    [HttpPost("checkout/paypal")]
    public async Task<ActionResult<ApiResponse<PayPalOrderResponse>>> CreatePayPalOrder([FromBody] CheckoutRequest request)
    {
        var cart = await _unitOfWork.Repository<Cart>().Query()
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == _currentUser.UserId);

        if (cart == null || !cart.Items.Any())
            throw new BadRequestException("Your cart is empty");

        var total = cart.Items.Sum(i => i.Product.CurrentPrice * i.Quantity);

        var result = await _paymentService.CreatePaymentAsync(Guid.NewGuid(), total);

        if (!result.Success)
            throw new BadRequestException(result.ErrorMessage ?? "Failed to create PayPal order");

        return Ok(ApiResponse<PayPalOrderResponse>.SuccessResponse(
            new PayPalOrderResponse(result.PaymentId!, result.ApprovalUrl!)));
    }

    [HttpPost("checkout/paypal/capture")]
    public async Task<ActionResult<ApiResponse<OrderDto>>> CapturePayPalOrder([FromBody] CapturePayPalOrderRequest request)
    {
        var captureResult = await _paymentService.CapturePaymentAsync(request.PayPalOrderId);

        if (!captureResult.Success)
            throw new BadRequestException(captureResult.ErrorMessage ?? "Failed to capture payment");

        // Create the order after successful payment
        // In a real app, you'd pass the address from the original checkout request
        var cart = await _unitOfWork.Repository<Cart>().Query()
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(c => c.UserId == _currentUser.UserId);

        var user = await _unitOfWork.Repository<User>().Query()
            .Include(u => u.Addresses)
            .FirstOrDefaultAsync(u => u.Id == _currentUser.UserId);

        var defaultAddress = user!.Addresses.FirstOrDefault(a => a.IsDefault) ?? user.Addresses.First();

        var createRequest = new CreateOrderRequest(
            defaultAddress.Id,
            PaymentMethod.PayPal,
            null
        );

        // Create order (reusing logic)
        var orderResult = await CreateOrder(createRequest);
        var orderResponse = orderResult.Result as OkObjectResult;
        var apiResponse = orderResponse?.Value as ApiResponse<OrderDto>;

        if (apiResponse?.Data != null)
        {
            // Update payment status
            var order = await _unitOfWork.Repository<Order>().GetByIdAsync(apiResponse.Data.Id);
            order!.PaymentStatus = PaymentStatus.Paid;
            order.PayPalTransactionId = captureResult.TransactionId;
            order.Status = OrderStatus.Confirmed;
            await _unitOfWork.SaveChangesAsync();

            // Send confirmation email
            await _emailService.SendOrderConfirmationAsync(user.Email, order.OrderNumber, order.Total);

            var updatedOrder = await _unitOfWork.Repository<Order>().Query()
                .Include(o => o.User)
                .Include(o => o.ShippingAddress)
                .Include(o => o.Items)
                    .ThenInclude(i => i.Vendor)
                .FirstOrDefaultAsync(o => o.Id == order.Id);

            return Ok(ApiResponse<OrderDto>.SuccessResponse(
                _mapper.Map<OrderDto>(updatedOrder), "Payment successful! Order confirmed."));
        }

        throw new BadRequestException("Failed to create order");
    }

    [Authorize(Policy = "VendorOnly")]
    [HttpPut("{id}/status")]
    public async Task<ActionResult<ApiResponse<OrderDto>>> UpdateOrderStatus(
        Guid id, [FromBody] UpdateOrderStatusRequest request)
    {
        var order = await _unitOfWork.Repository<Order>().Query()
            .Include(o => o.User)
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            throw new NotFoundException("Order", id);

        // Vendors can only update orders containing their products
        if (!_currentUser.IsAdmin)
        {
            var hasVendorItems = order.Items.Any(i => i.VendorId == _currentUser.UserId);
            if (!hasVendorItems)
                throw new ForbiddenException();
        }

        order.Status = request.Status;

        if (request.Status == OrderStatus.Shipped)
            order.ShippedAt = DateTime.UtcNow;
        else if (request.Status == OrderStatus.Delivered)
            order.DeliveredAt = DateTime.UtcNow;

        await _unitOfWork.SaveChangesAsync();

        var orderDto = _mapper.Map<OrderDto>(order);
        return Ok(ApiResponse<OrderDto>.SuccessResponse(orderDto, "Order status updated"));
    }

    [HttpPut("{id}/cancel")]
    public async Task<ActionResult<ApiResponse<OrderDto>>> CancelOrder(Guid id)
    {
        var order = await _unitOfWork.Repository<Order>().Query()
            .Include(o => o.Items)
                .ThenInclude(i => i.Product)
            .FirstOrDefaultAsync(o => o.Id == id);

        if (order == null)
            throw new NotFoundException("Order", id);

        if (order.UserId != _currentUser.UserId && !_currentUser.IsAdmin)
            throw new ForbiddenException();

        if (order.Status >= OrderStatus.Shipped)
            throw new BadRequestException("Cannot cancel an order that has already been shipped");

        order.Status = OrderStatus.Cancelled;

        // Restore stock
        foreach (var item in order.Items)
        {
            item.Product.StockQuantity += item.Quantity;
        }

        await _unitOfWork.SaveChangesAsync();

        var orderDto = _mapper.Map<OrderDto>(order);
        return Ok(ApiResponse<OrderDto>.SuccessResponse(orderDto, "Order cancelled"));
    }
}
