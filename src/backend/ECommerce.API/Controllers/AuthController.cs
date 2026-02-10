using System.Security.Cryptography;
using System.Text;
using AutoMapper;
using ECommerce.Application.DTOs.Auth;
using ECommerce.Application.DTOs.Common;
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
public class AuthController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ITokenService _tokenService;
    private readonly IEmailService _emailService;
    private readonly IMapper _mapper;
    private readonly IConfiguration _configuration;

    public AuthController(
        IUnitOfWork unitOfWork,
        ITokenService tokenService,
        IEmailService emailService,
        IMapper mapper,
        IConfiguration configuration)
    {
        _unitOfWork = unitOfWork;
        _tokenService = tokenService;
        _emailService = emailService;
        _mapper = mapper;
        _configuration = configuration;
    }

    [HttpPost("register")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Register([FromBody] RegisterRequest request)
    {
        var existingUser = await _unitOfWork.Repository<User>()
            .FirstOrDefaultAsync(u => u.Email == request.Email.ToLower());

        if (existingUser != null)
            throw new BadRequestException("Email is already registered");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email.ToLower(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            PhoneNumber = request.PhoneNumber,
            PasswordHash = HashPassword(request.Password),
            Role = UserRole.Customer,
            IsActive = true,
            EmailConfirmed = false
        };

        await _unitOfWork.Repository<User>().AddAsync(user);

        // Create a cart for the user
        var cart = new Cart { Id = Guid.NewGuid(), UserId = user.Id };
        await _unitOfWork.Repository<Cart>().AddAsync(cart);

        await _unitOfWork.SaveChangesAsync();

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(
            _configuration.GetValue<int>("JwtSettings:RefreshTokenExpirationInDays", 7));
        await _unitOfWork.SaveChangesAsync();

        var response = new AuthResponse(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Role,
            accessToken,
            refreshToken,
            DateTime.UtcNow.AddMinutes(_configuration.GetValue<int>("JwtSettings:ExpirationInMinutes", 60))
        );

        return Ok(ApiResponse<AuthResponse>.SuccessResponse(response, "Registration successful"));
    }

    [HttpPost("login")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> Login([FromBody] LoginRequest request)
    {
        var user = await _unitOfWork.Repository<User>()
            .FirstOrDefaultAsync(u => u.Email == request.Email.ToLower());

        if (user == null || !VerifyPassword(request.Password, user.PasswordHash))
            throw new UnauthorizedException("Invalid email or password");

        if (!user.IsActive)
            throw new UnauthorizedException("Your account has been deactivated");

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(
            _configuration.GetValue<int>("JwtSettings:RefreshTokenExpirationInDays", 7));
        await _unitOfWork.SaveChangesAsync();

        var response = new AuthResponse(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Role,
            accessToken,
            refreshToken,
            DateTime.UtcNow.AddMinutes(_configuration.GetValue<int>("JwtSettings:ExpirationInMinutes", 60))
        );

        return Ok(ApiResponse<AuthResponse>.SuccessResponse(response, "Login successful"));
    }

    [HttpPost("refresh-token")]
    public async Task<ActionResult<ApiResponse<AuthResponse>>> RefreshToken([FromBody] RefreshTokenRequest request)
    {
        var user = await _unitOfWork.Repository<User>()
            .FirstOrDefaultAsync(u => u.RefreshToken == request.RefreshToken);

        if (user == null || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            throw new UnauthorizedException("Invalid or expired refresh token");

        var accessToken = _tokenService.GenerateAccessToken(user);
        var refreshToken = _tokenService.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(
            _configuration.GetValue<int>("JwtSettings:RefreshTokenExpirationInDays", 7));
        await _unitOfWork.SaveChangesAsync();

        var response = new AuthResponse(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Role,
            accessToken,
            refreshToken,
            DateTime.UtcNow.AddMinutes(_configuration.GetValue<int>("JwtSettings:ExpirationInMinutes", 60))
        );

        return Ok(ApiResponse<AuthResponse>.SuccessResponse(response));
    }

    [HttpPost("forgot-password")]
    public async Task<ActionResult<ApiResponse>> ForgotPassword([FromBody] ForgotPasswordRequest request)
    {
        var user = await _unitOfWork.Repository<User>()
            .FirstOrDefaultAsync(u => u.Email == request.Email.ToLower());

        if (user != null)
        {
            var resetToken = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
            // In production, store this token securely with expiration
            var resetLink = $"http://localhost:4200/auth/reset-password?email={user.Email}&token={Uri.EscapeDataString(resetToken)}";
            await _emailService.SendPasswordResetEmailAsync(user.Email, resetLink);
        }

        // Always return success to prevent email enumeration
        return Ok(ApiResponse.SuccessResponse("If the email exists, a password reset link has been sent"));
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<ActionResult<ApiResponse>> ChangePassword(
        [FromBody] ChangePasswordRequest request,
        [FromServices] ICurrentUserService currentUser)
    {
        var user = await _unitOfWork.Repository<User>()
            .GetByIdAsync(currentUser.UserId!.Value);

        if (user == null)
            throw new NotFoundException("User", currentUser.UserId);

        if (!VerifyPassword(request.CurrentPassword, user.PasswordHash))
            throw new BadRequestException("Current password is incorrect");

        user.PasswordHash = HashPassword(request.NewPassword);
        await _unitOfWork.SaveChangesAsync();

        return Ok(ApiResponse.SuccessResponse("Password changed successfully"));
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<ActionResult<ApiResponse>> Logout([FromServices] ICurrentUserService currentUser)
    {
        var user = await _unitOfWork.Repository<User>()
            .GetByIdAsync(currentUser.UserId!.Value);

        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiryTime = null;
            await _unitOfWork.SaveChangesAsync();
        }

        return Ok(ApiResponse.SuccessResponse("Logged out successfully"));
    }

    private static string HashPassword(string password)
    {
        using var sha256 = SHA256.Create();
        var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(hashedBytes);
    }

    private static bool VerifyPassword(string password, string hash)
    {
        return HashPassword(password) == hash;
    }
}
