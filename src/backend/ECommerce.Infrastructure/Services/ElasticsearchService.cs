using ECommerce.Application.DTOs.Products;
using ECommerce.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Nest;

namespace ECommerce.Infrastructure.Services;

public class ElasticsearchService : ISearchService
{
    private readonly IElasticClient _elasticClient;
    private const string IndexName = "products";

    public ElasticsearchService(IConfiguration configuration)
    {
        var uri = new Uri(configuration["Elasticsearch:Uri"] ?? "http://localhost:9200");
        var settings = new ConnectionSettings(uri)
            .DefaultIndex(IndexName)
            .EnableDebugMode();

        _elasticClient = new ElasticClient(settings);
        EnsureIndexExists();
    }

    private void EnsureIndexExists()
    {
        var existsResponse = _elasticClient.Indices.Exists(IndexName);
        if (!existsResponse.Exists)
        {
            _elasticClient.Indices.Create(IndexName, c => c
                .Settings(s => s
                    .NumberOfShards(1)
                    .NumberOfReplicas(0)
                    .Analysis(a => a
                        .Analyzers(an => an
                            .Custom("arabic_analyzer", ca => ca
                                .Tokenizer("standard")
                                .Filters("lowercase", "arabic_normalization", "arabic_stemmer")
                            )
                        )
                        .TokenFilters(tf => tf
                            .Stemmer("arabic_stemmer", st => st.Language("arabic"))
                        )
                    )
                )
                .Map<ProductSearchDocument>(m => m
                    .Properties(p => p
                        .Keyword(k => k.Name(n => n.Id))
                        .Text(t => t.Name(n => n.NameEn).Analyzer("english"))
                        .Text(t => t.Name(n => n.NameAr).Analyzer("arabic_analyzer"))
                        .Text(t => t.Name(n => n.DescriptionEn).Analyzer("english"))
                        .Text(t => t.Name(n => n.DescriptionAr).Analyzer("arabic_analyzer"))
                        .Text(t => t.Name(n => n.CategoryName))
                        .Text(t => t.Name(n => n.VendorName))
                        .Keyword(t => t.Name(n => n.Brand))
                        .Number(n => n.Name(x => x.Price).Type(NumberType.Double))
                        .Number(n => n.Name(x => x.CategoryId).Type(NumberType.Integer))
                        .Boolean(b => b.Name(n => n.IsActive))
                        .Boolean(b => b.Name(n => n.InStock))
                        .Date(d => d.Name(n => n.CreatedAt))
                    )
                )
            );
        }
    }

    public async Task IndexProductAsync(ProductDto product)
    {
        var document = MapToSearchDocument(product);
        await _elasticClient.IndexDocumentAsync(document);
    }

    public async Task IndexProductsAsync(IEnumerable<ProductDto> products)
    {
        var documents = products.Select(MapToSearchDocument);
        await _elasticClient.BulkAsync(b => b.IndexMany(documents));
    }

    public async Task DeleteProductAsync(Guid productId)
    {
        await _elasticClient.DeleteAsync<ProductSearchDocument>(productId.ToString());
    }

    public async Task<ProductSearchResultDto> SearchProductsAsync(ProductSearchRequestDto request)
    {
        var searchResponse = await _elasticClient.SearchAsync<ProductSearchDocument>(s => s
            .From((request.PageNumber - 1) * request.PageSize)
            .Size(request.PageSize)
            .Query(q => q
                .Bool(b => b
                    .Must(BuildMustQueries(request).ToArray())
                    .Filter(BuildFilterQueries(request).ToArray())
                )
            )
            .Sort(BuildSortDescriptor(request))
            .Aggregations(a => a
                .Terms("categories", t => t.Field(f => f.CategoryId))
                .Terms("brands", t => t.Field(f => f.Brand))
            )
        );

        var products = searchResponse.Documents.Select(d => new ProductListDto(
            Guid.Parse(d.Id),
            d.NameEn,
            d.NameAr,
            d.CategoryName,
            d.CategoryName,
            (decimal)d.Price,
            null,
            (decimal)d.Price,
            d.InStock ? 1 : 0,
            d.InStock,
            false,
            d.PrimaryImageUrl,
            0,
            0
        ));

        var categoryFacets = searchResponse.Aggregations
            .Terms("categories")?.Buckets
            .Select(b => new FacetDto(b.Key, b.DocCount ?? 0));

        var brandFacets = searchResponse.Aggregations
            .Terms("brands")?.Buckets
            .Select(b => new FacetDto(b.Key, b.DocCount ?? 0));

        return new ProductSearchResultDto(
            products,
            (int)searchResponse.Total,
            request.PageNumber,
            request.PageSize,
            (int)Math.Ceiling(searchResponse.Total / (double)request.PageSize),
            categoryFacets,
            brandFacets
        );
    }

    public async Task<IEnumerable<string>> GetAutocompleteSuggestionsAsync(string query, int size = 5)
    {
        var response = await _elasticClient.SearchAsync<ProductSearchDocument>(s => s
            .Size(size)
            .Query(q => q
                .MultiMatch(m => m
                    .Fields(f => f
                        .Field(p => p.NameEn)
                        .Field(p => p.NameAr)
                    )
                    .Query(query)
                    .Type(TextQueryType.PhrasePrefix)
                )
            )
            .Source(src => src.Includes(i => i.Field(f => f.NameEn)))
        );

        return response.Documents.Select(d => d.NameEn).Distinct();
    }

    public async Task ReindexAllProductsAsync()
    {
        await _elasticClient.Indices.DeleteAsync(IndexName);
        EnsureIndexExists();
    }

    private static ProductSearchDocument MapToSearchDocument(ProductDto product)
    {
        return new ProductSearchDocument
        {
            Id = product.Id.ToString(),
            NameEn = product.NameEn,
            NameAr = product.NameAr,
            DescriptionEn = product.DescriptionEn,
            DescriptionAr = product.DescriptionAr,
            CategoryId = product.CategoryId,
            CategoryName = product.CategoryNameEn,
            VendorName = product.VendorName,
            Brand = product.Brand,
            Price = (double)product.CurrentPrice,
            IsActive = product.IsActive,
            InStock = product.InStock,
            PrimaryImageUrl = product.Images.FirstOrDefault(i => i.IsPrimary)?.ImageUrl,
            CreatedAt = product.CreatedAt
        };
    }

    private static IEnumerable<Func<QueryContainerDescriptor<ProductSearchDocument>, QueryContainer>> BuildMustQueries(ProductSearchRequestDto request)
    {
        if (!string.IsNullOrWhiteSpace(request.Query))
        {
            yield return q => q.MultiMatch(m => m
                .Fields(f => f
                    .Field(p => p.NameEn, 2)
                    .Field(p => p.NameAr, 2)
                    .Field(p => p.DescriptionEn)
                    .Field(p => p.DescriptionAr)
                    .Field(p => p.Brand)
                )
                .Query(request.Query)
                .Fuzziness(Fuzziness.Auto)
            );
        }
    }

    private static IEnumerable<Func<QueryContainerDescriptor<ProductSearchDocument>, QueryContainer>> BuildFilterQueries(ProductSearchRequestDto request)
    {
        yield return q => q.Term(t => t.Field(f => f.IsActive).Value(true));

        if (request.CategoryId.HasValue)
            yield return q => q.Term(t => t.Field(f => f.CategoryId).Value(request.CategoryId.Value));

        if (!string.IsNullOrWhiteSpace(request.Brand))
            yield return q => q.Term(t => t.Field(f => f.Brand).Value(request.Brand));

        if (request.MinPrice.HasValue || request.MaxPrice.HasValue)
        {
            yield return q => q.Range(r => r
                .Field(f => f.Price)
                .GreaterThanOrEquals(request.MinPrice.HasValue ? (double)request.MinPrice.Value : null)
                .LessThanOrEquals(request.MaxPrice.HasValue ? (double)request.MaxPrice.Value : null)
            );
        }
    }

    private static Func<SortDescriptor<ProductSearchDocument>, IPromise<IList<ISort>>> BuildSortDescriptor(ProductSearchRequestDto request)
    {
        return s =>
        {
            if (string.IsNullOrWhiteSpace(request.SortBy))
            {
                s.Descending(SortSpecialField.Score);
            }
            else
            {
                var order = request.SortDescending ? SortOrder.Descending : SortOrder.Ascending;
                s.Field(f => f.Field(request.SortBy.ToLower()).Order(order));
            }
            return s;
        };
    }
}

public class ProductSearchDocument
{
    public string Id { get; set; } = string.Empty;
    public string NameEn { get; set; } = string.Empty;
    public string NameAr { get; set; } = string.Empty;
    public string? DescriptionEn { get; set; }
    public string? DescriptionAr { get; set; }
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string VendorName { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public double Price { get; set; }
    public bool IsActive { get; set; }
    public bool InStock { get; set; }
    public string? PrimaryImageUrl { get; set; }
    public DateTime CreatedAt { get; set; }
}
