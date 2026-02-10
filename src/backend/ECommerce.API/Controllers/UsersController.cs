using AutoMapper;
using ECommerce.Application.DTOs.Common;
using ECommerce.Application.DTOs.Users;
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
public class UsersController : ControllerBase
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly ICurrentUserService _currentUser;
    private readonly IFileStorageService _fileStorageService;

    public UsersController(
        IUnitOfWork unitOfWork,
        IMapper mapper,
        ICurrentUserService currentUser,
        IFileStorageService fileStorageService)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _currentUser = currentUser;
        _fileStorageService = fileStorageService;
    }

    [HttpGet("profile")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetProfile()
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(_currentUser.UserId!.Value);

        if (user == null)
            throw new NotFoundException("User", _currentUser.UserId);

        var userDto = _mapper.Map<UserDto>(user);
        return Ok(ApiResponse<UserDto>.SuccessResponse(userDto));
    }

    [HttpPut("profile")]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(_currentUser.UserId!.Value);

        if (user == null)
            throw new NotFoundException("User", _currentUser.UserId);

        _mapper.Map(request, user);
        await _unitOfWork.SaveChangesAsync();

        var userDto = _mapper.Map<UserDto>(user);
        return Ok(ApiResponse<UserDto>.SuccessResponse(userDto, "Profile updated successfully"));
    }

    [HttpPost("profile/avatar")]
    public async Task<ActionResult<ApiResponse<UserDto>>> UploadAvatar(IFormFile file)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(_currentUser.UserId!.Value);

        if (user == null)
            throw new NotFoundException("User", _currentUser.UserId);

        if (!string.IsNullOrEmpty(user.AvatarUrl))
            await _fileStorageService.DeleteFileAsync(user.AvatarUrl);

        user.AvatarUrl = await _fileStorageService.UploadFileAsync(file, "avatars");
        await _unitOfWork.SaveChangesAsync();

        var userDto = _mapper.Map<UserDto>(user);
        return Ok(ApiResponse<UserDto>.SuccessResponse(userDto, "Avatar uploaded successfully"));
    }

    // Address endpoints
    [HttpGet("addresses")]
    public async Task<ActionResult<ApiResponse<IEnumerable<AddressDto>>>> GetAddresses()
    {
        var addresses = await _unitOfWork.Repository<Address>()
            .FindAsync(a => a.UserId == _currentUser.UserId);

        var addressDtos = _mapper.Map<IEnumerable<AddressDto>>(addresses);
        return Ok(ApiResponse<IEnumerable<AddressDto>>.SuccessResponse(addressDtos));
    }

    [HttpGet("addresses/{id}")]
    public async Task<ActionResult<ApiResponse<AddressDto>>> GetAddress(Guid id)
    {
        var address = await _unitOfWork.Repository<Address>()
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == _currentUser.UserId);

        if (address == null)
            throw new NotFoundException("Address", id);

        var addressDto = _mapper.Map<AddressDto>(address);
        return Ok(ApiResponse<AddressDto>.SuccessResponse(addressDto));
    }

    [HttpPost("addresses")]
    public async Task<ActionResult<ApiResponse<AddressDto>>> CreateAddress([FromBody] CreateAddressRequest request)
    {
        // If this is the first address or marked as default, set others to non-default
        if (request.IsDefault)
        {
            var existingAddresses = await _unitOfWork.Repository<Address>()
                .FindAsync(a => a.UserId == _currentUser.UserId && a.IsDefault);

            foreach (var addr in existingAddresses)
            {
                addr.IsDefault = false;
            }
        }

        var address = _mapper.Map<Address>(request);
        address.Id = Guid.NewGuid();
        address.UserId = _currentUser.UserId!.Value;

        // If no addresses exist, make this the default
        var addressCount = await _unitOfWork.Repository<Address>()
            .CountAsync(a => a.UserId == _currentUser.UserId);
        if (addressCount == 0)
            address.IsDefault = true;

        await _unitOfWork.Repository<Address>().AddAsync(address);
        await _unitOfWork.SaveChangesAsync();

        var addressDto = _mapper.Map<AddressDto>(address);
        return CreatedAtAction(nameof(GetAddress), new { id = address.Id },
            ApiResponse<AddressDto>.SuccessResponse(addressDto, "Address created successfully"));
    }

    [HttpPut("addresses/{id}")]
    public async Task<ActionResult<ApiResponse<AddressDto>>> UpdateAddress(
        Guid id, [FromBody] UpdateAddressRequest request)
    {
        var address = await _unitOfWork.Repository<Address>()
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == _currentUser.UserId);

        if (address == null)
            throw new NotFoundException("Address", id);

        if (request.IsDefault && !address.IsDefault)
        {
            var existingAddresses = await _unitOfWork.Repository<Address>()
                .FindAsync(a => a.UserId == _currentUser.UserId && a.IsDefault && a.Id != id);

            foreach (var addr in existingAddresses)
            {
                addr.IsDefault = false;
            }
        }

        _mapper.Map(request, address);
        await _unitOfWork.SaveChangesAsync();

        var addressDto = _mapper.Map<AddressDto>(address);
        return Ok(ApiResponse<AddressDto>.SuccessResponse(addressDto, "Address updated successfully"));
    }

    [HttpDelete("addresses/{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteAddress(Guid id)
    {
        var address = await _unitOfWork.Repository<Address>()
            .FirstOrDefaultAsync(a => a.Id == id && a.UserId == _currentUser.UserId);

        if (address == null)
            throw new NotFoundException("Address", id);

        _unitOfWork.Repository<Address>().Remove(address);
        await _unitOfWork.SaveChangesAsync();

        return Ok(ApiResponse.SuccessResponse("Address deleted successfully"));
    }

    // Admin endpoints
    [Authorize(Policy = "AdminOnly")]
    [HttpGet]
    public async Task<ActionResult<ApiResponse<PaginatedList<UserListDto>>>> GetUsers(
        [FromQuery] PaginationParams pagination,
        [FromQuery] string? search)
    {
        var query = _unitOfWork.Repository<User>().Query();

        if (!string.IsNullOrEmpty(search))
        {
            query = query.Where(u =>
                u.Email.Contains(search) ||
                u.FirstName.Contains(search) ||
                u.LastName.Contains(search));
        }

        var totalCount = await query.CountAsync();
        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Skip((pagination.PageNumber - 1) * pagination.PageSize)
            .Take(pagination.PageSize)
            .ToListAsync();

        var userDtos = _mapper.Map<List<UserListDto>>(users);
        var result = new PaginatedList<UserListDto>(userDtos, totalCount, pagination.PageNumber, pagination.PageSize);

        return Ok(ApiResponse<PaginatedList<UserListDto>>.SuccessResponse(result));
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> GetUser(Guid id)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(id);

        if (user == null)
            throw new NotFoundException("User", id);

        var userDto = _mapper.Map<UserDto>(user);
        return Ok(ApiResponse<UserDto>.SuccessResponse(userDto));
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpPut("{id}")]
    public async Task<ActionResult<ApiResponse<UserDto>>> UpdateUser(
        Guid id, [FromBody] UpdateUserRequest request)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(id);

        if (user == null)
            throw new NotFoundException("User", id);

        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.PhoneNumber = request.PhoneNumber;
        user.Role = request.Role;
        user.IsActive = request.IsActive;

        await _unitOfWork.SaveChangesAsync();

        var userDto = _mapper.Map<UserDto>(user);
        return Ok(ApiResponse<UserDto>.SuccessResponse(userDto, "User updated successfully"));
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id}")]
    public async Task<ActionResult<ApiResponse>> DeleteUser(Guid id)
    {
        var user = await _unitOfWork.Repository<User>().GetByIdAsync(id);

        if (user == null)
            throw new NotFoundException("User", id);

        if (user.Id == _currentUser.UserId)
            throw new BadRequestException("You cannot delete your own account");

        // Soft delete - just deactivate
        user.IsActive = false;
        await _unitOfWork.SaveChangesAsync();

        return Ok(ApiResponse.SuccessResponse("User deactivated successfully"));
    }
}
