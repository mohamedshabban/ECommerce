using AutoMapper;
using ECommerce.Application.DTOs.Auth;
using ECommerce.Application.DTOs.Cart;
using ECommerce.Application.DTOs.Categories;
using ECommerce.Application.DTOs.Orders;
using ECommerce.Application.DTOs.Products;
using ECommerce.Application.DTOs.Users;
using ECommerce.Domain.Entities;

namespace ECommerce.Application.Mappings;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<User, UserDto>();
        CreateMap<User, UserListDto>()
            .ForMember(d => d.FullName, opt => opt.MapFrom(s => s.FullName));
        CreateMap<RegisterRequest, User>();
        CreateMap<UpdateProfileRequest, User>();

        // Address mappings
        CreateMap<Address, AddressDto>();
        CreateMap<CreateAddressRequest, Address>();
        CreateMap<UpdateAddressRequest, Address>();

        // Category mappings
        CreateMap<Category, CategoryDto>()
            .ForMember(d => d.ParentCategoryName, opt => opt.MapFrom(s => s.ParentCategory != null ? s.ParentCategory.NameEn : null))
            .ForMember(d => d.ProductCount, opt => opt.MapFrom(s => s.Products.Count));
        CreateMap<Category, CategoryListDto>()
            .ForMember(d => d.ProductCount, opt => opt.MapFrom(s => s.Products.Count));
        CreateMap<CreateCategoryRequest, Category>();
        CreateMap<UpdateCategoryRequest, Category>();

        // Product mappings
        CreateMap<Product, ProductDto>()
            .ForMember(d => d.VendorName, opt => opt.MapFrom(s => s.Vendor.FullName))
            .ForMember(d => d.CategoryNameEn, opt => opt.MapFrom(s => s.Category.NameEn))
            .ForMember(d => d.CategoryNameAr, opt => opt.MapFrom(s => s.Category.NameAr))
            .ForMember(d => d.AverageRating, opt => opt.MapFrom(s => s.Reviews.Any() ? s.Reviews.Average(r => r.Rating) : 0))
            .ForMember(d => d.ReviewCount, opt => opt.MapFrom(s => s.Reviews.Count));
        CreateMap<Product, ProductListDto>()
            .ForMember(d => d.CategoryNameEn, opt => opt.MapFrom(s => s.Category.NameEn))
            .ForMember(d => d.CategoryNameAr, opt => opt.MapFrom(s => s.Category.NameAr))
            .ForMember(d => d.PrimaryImageUrl, opt => opt.MapFrom(s => s.Images.FirstOrDefault(i => i.IsPrimary) != null ? s.Images.First(i => i.IsPrimary).ImageUrl : s.Images.FirstOrDefault()!.ImageUrl))
            .ForMember(d => d.AverageRating, opt => opt.MapFrom(s => s.Reviews.Any() ? s.Reviews.Average(r => r.Rating) : 0))
            .ForMember(d => d.ReviewCount, opt => opt.MapFrom(s => s.Reviews.Count));
        CreateMap<CreateProductRequest, Product>();
        CreateMap<UpdateProductRequest, Product>();

        // Product Image mappings
        CreateMap<ProductImage, ProductImageDto>();

        // Product Review mappings
        CreateMap<ProductReview, ProductReviewDto>()
            .ForMember(d => d.UserName, opt => opt.MapFrom(s => s.User.FullName));
        CreateMap<CreateReviewRequest, ProductReview>();

        // Cart mappings
        CreateMap<Cart, CartDto>()
            .ForMember(d => d.SubTotal, opt => opt.MapFrom(s => s.Items.Sum(i => i.Product.CurrentPrice * i.Quantity)))
            .ForMember(d => d.TotalItems, opt => opt.MapFrom(s => s.Items.Sum(i => i.Quantity)));
        CreateMap<CartItem, CartItemDto>()
            .ForMember(d => d.ProductNameEn, opt => opt.MapFrom(s => s.Product.NameEn))
            .ForMember(d => d.ProductNameAr, opt => opt.MapFrom(s => s.Product.NameAr))
            .ForMember(d => d.ProductImageUrl, opt => opt.MapFrom(s => s.Product.Images.FirstOrDefault(i => i.IsPrimary) != null ? s.Product.Images.First(i => i.IsPrimary).ImageUrl : null))
            .ForMember(d => d.UnitPrice, opt => opt.MapFrom(s => s.Product.CurrentPrice))
            .ForMember(d => d.Total, opt => opt.MapFrom(s => s.Product.CurrentPrice * s.Quantity))
            .ForMember(d => d.AvailableStock, opt => opt.MapFrom(s => s.Product.StockQuantity));

        // Order mappings
        CreateMap<Order, OrderDto>()
            .ForMember(d => d.CustomerName, opt => opt.MapFrom(s => s.User.FullName))
            .ForMember(d => d.CustomerEmail, opt => opt.MapFrom(s => s.User.Email));
        CreateMap<Order, OrderListDto>()
            .ForMember(d => d.CustomerName, opt => opt.MapFrom(s => s.User.FullName))
            .ForMember(d => d.ItemCount, opt => opt.MapFrom(s => s.Items.Count));
        CreateMap<OrderItem, OrderItemDto>()
            .ForMember(d => d.ProductName, opt => opt.MapFrom(s => s.ProductNameSnapshot))
            .ForMember(d => d.ProductImageUrl, opt => opt.MapFrom(s => s.ProductImageSnapshot))
            .ForMember(d => d.VendorName, opt => opt.MapFrom(s => s.Vendor.FullName));
    }
}
