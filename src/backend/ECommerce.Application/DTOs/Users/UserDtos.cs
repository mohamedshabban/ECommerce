using ECommerce.Domain.Enums;

namespace ECommerce.Application.DTOs.Users;

public record UserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string? PhoneNumber,
    UserRole Role,
    string? AvatarUrl,
    bool IsActive,
    bool EmailConfirmed,
    DateTime CreatedAt
);

public record UserListDto(
    Guid Id,
    string Email,
    string FullName,
    UserRole Role,
    bool IsActive,
    DateTime CreatedAt
);

public record UpdateProfileRequest(
    string FirstName,
    string LastName,
    string? PhoneNumber
);

public record UpdateUserRequest(
    string FirstName,
    string LastName,
    string? PhoneNumber,
    UserRole Role,
    bool IsActive
);

public record AddressDto(
    Guid Id,
    string Label,
    string FullName,
    string Phone,
    string Street,
    string City,
    string State,
    string Country,
    string PostalCode,
    bool IsDefault
);

public record CreateAddressRequest(
    string Label,
    string FullName,
    string Phone,
    string Street,
    string City,
    string State,
    string Country,
    string PostalCode,
    bool IsDefault
);

public record UpdateAddressRequest(
    string Label,
    string FullName,
    string Phone,
    string Street,
    string City,
    string State,
    string Country,
    string PostalCode,
    bool IsDefault
);
