using ECommerce.Domain.Enums;

namespace ECommerce.Application.DTOs.Users;

public record UserDto
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string FirstName { get; init; } = string.Empty;
    public string LastName { get; init; } = string.Empty;
    public string? PhoneNumber { get; init; }
    public UserRole Role { get; init; }
    public string? AvatarUrl { get; init; }
    public bool IsActive { get; init; }
    public bool EmailConfirmed { get; init; }
    public DateTime CreatedAt { get; init; }
}

public record UserListDto
{
    public Guid Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public UserRole Role { get; init; }
    public bool IsActive { get; init; }
    public DateTime CreatedAt { get; init; }
}

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

public record AddressDto
{
    public Guid Id { get; init; }
    public string Label { get; init; } = string.Empty;
    public string FullName { get; init; } = string.Empty;
    public string Phone { get; init; } = string.Empty;
    public string Street { get; init; } = string.Empty;
    public string City { get; init; } = string.Empty;
    public string State { get; init; } = string.Empty;
    public string Country { get; init; } = string.Empty;
    public string PostalCode { get; init; } = string.Empty;
    public bool IsDefault { get; init; }
}

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
