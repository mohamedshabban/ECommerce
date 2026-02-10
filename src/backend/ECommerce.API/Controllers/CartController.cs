using AutoMapper;
using ECommerce.Application.DTOs.Cart;
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
[Authorize]
public class CartController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;

    public CartController(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ICurrentUserService currentUser)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<CartDto>>> GetCart()
    {
        var cart = await GetOrCreateCart();
        var cartDto = _mapper.Map<CartDto>(cart);
        return Ok(ApiResponse<CartDto>.SuccessResponse(cartDto));
    }

    [HttpPost("items")]
    public async Task<ActionResult<ApiResponse<CartDto>>> AddToCart([FromBody] AddToCartRequest request)
    {
        var product = await _unitOfWork.Repository<Product>().GetByIdAsync(request.ProductId);

        if (product == null)
            throw new NotFoundException("Product", request.ProductId);

        if (!product.IsActive)
            throw new BadRequestException("This product is not available");

        if (product.StockQuantity < request.Quantity)
            throw new BadRequestException($"Only {product.StockQuantity} items available in stock");

        var cart = await GetOrCreateCart();

        var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);

        if (existingItem != null)
        {
            var newQuantity = existingItem.Quantity + request.Quantity;
            if (product.StockQuantity < newQuantity)
                throw new BadRequestException($"Only {product.StockQuantity} items available in stock");

            existingItem.Quantity = newQuantity;
        }
        else
        {
            var cartItem = new CartItem
            {
                Id = Guid.NewGuid(),
                CartId = cart.Id,
                ProductId = request.ProductId,
                Quantity = request.Quantity
            };
            await _unitOfWork.Repository<CartItem>().AddAsync(cartItem);
        }

        await _unitOfWork.SaveChangesAsync();

        // Reload cart with updated items
        cart = await GetOrCreateCart();
        var cartDto = _mapper.Map<CartDto>(cart);
        return Ok(ApiResponse<CartDto>.SuccessResponse(cartDto, "Item added to cart"));
    }

    [HttpPut("items/{itemId}")]
    public async Task<ActionResult<ApiResponse<CartDto>>> UpdateCartItem(
        Guid itemId, [FromBody] UpdateCartItemRequest request)
    {
        var cart = await GetOrCreateCart();

        var cartItem = cart.Items.FirstOrDefault(i => i.Id == itemId);

        if (cartItem == null)
            throw new NotFoundException("Cart item", itemId);

        if (request.Quantity <= 0)
        {
            _unitOfWork.Repository<CartItem>().Remove(cartItem);
        }
        else
        {
            var product = await _unitOfWork.Repository<Product>().GetByIdAsync(cartItem.ProductId);
            if (product!.StockQuantity < request.Quantity)
                throw new BadRequestException($"Only {product.StockQuantity} items available in stock");

            cartItem.Quantity = request.Quantity;
        }

        await _unitOfWork.SaveChangesAsync();

        cart = await GetOrCreateCart();
        var cartDto = _mapper.Map<CartDto>(cart);
        return Ok(ApiResponse<CartDto>.SuccessResponse(cartDto, "Cart updated"));
    }

    [HttpDelete("items/{itemId}")]
    public async Task<ActionResult<ApiResponse<CartDto>>> RemoveFromCart(Guid itemId)
    {
        var cart = await GetOrCreateCart();

        var cartItem = cart.Items.FirstOrDefault(i => i.Id == itemId);

        if (cartItem == null)
            throw new NotFoundException("Cart item", itemId);

        _unitOfWork.Repository<CartItem>().Remove(cartItem);
        await _unitOfWork.SaveChangesAsync();

        cart = await GetOrCreateCart();
        var cartDto = _mapper.Map<CartDto>(cart);
        return Ok(ApiResponse<CartDto>.SuccessResponse(cartDto, "Item removed from cart"));
    }

    [HttpDelete]
    public async Task<ActionResult<ApiResponse>> ClearCart()
    {
        var cart = await GetOrCreateCart();

        _unitOfWork.Repository<CartItem>().RemoveRange(cart.Items);
        await _unitOfWork.SaveChangesAsync();

        return Ok(ApiResponse.SuccessResponse("Cart cleared"));
    }

    private async Task<Cart> GetOrCreateCart()
    {
        var cart = await _unitOfWork.Repository<Cart>().Query()
            .Include(c => c.Items)
                .ThenInclude(i => i.Product)
                    .ThenInclude(p => p.Images)
            .FirstOrDefaultAsync(c => c.UserId == _currentUser.UserId);

        if (cart == null)
        {
            cart = new Cart
            {
                Id = Guid.NewGuid(),
                UserId = _currentUser.UserId
            };
            await _unitOfWork.Repository<Cart>().AddAsync(cart);
            await _unitOfWork.SaveChangesAsync();

            cart = await _unitOfWork.Repository<Cart>().Query()
                .Include(c => c.Items)
                    .ThenInclude(i => i.Product)
                        .ThenInclude(p => p.Images)
                .FirstOrDefaultAsync(c => c.Id == cart.Id);
        }

        return cart!;
    }
}
