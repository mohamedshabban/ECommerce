using ECommerce.Application.DTOs.Products;

namespace ECommerce.Application.Interfaces;

public interface ISearchService
{
    Task IndexProductAsync(ProductDto product);
    Task IndexProductsAsync(IEnumerable<ProductDto> products);
    Task DeleteProductAsync(Guid productId);
    Task<ProductSearchResultDto> SearchProductsAsync(ProductSearchRequestDto request);
    Task<IEnumerable<string>> GetAutocompleteSuggestionsAsync(string query, int size = 5);
    Task ReindexAllProductsAsync();
}
