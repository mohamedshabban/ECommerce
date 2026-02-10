using ECommerce.Domain.Entities;

namespace ECommerce.Application.Interfaces;

public interface ITokenService
{
    string GenerateAccessToken(User user);
    string GenerateRefreshToken();
    (Guid userId, string email)? ValidateToken(string token);
}
