using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using ECommerce.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace ECommerce.Infrastructure.Services;

public class PayPalService : IPaymentService
{
    private readonly HttpClient _httpClient;
    private readonly string _clientId;
    private readonly string _clientSecret;
    private readonly string _baseUrl;

    public PayPalService(IConfiguration configuration, IHttpClientFactory httpClientFactory)
    {
        _httpClient = httpClientFactory.CreateClient();
        _clientId = configuration["PayPal:ClientId"] ?? throw new ArgumentNullException("PayPal:ClientId");
        _clientSecret = configuration["PayPal:ClientSecret"] ?? throw new ArgumentNullException("PayPal:ClientSecret");

        var sandbox = configuration.GetValue<bool>("PayPal:Sandbox", true);
        _baseUrl = sandbox ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com";
    }

    public async Task<CreatePaymentResult> CreatePaymentAsync(Guid orderId, decimal amount, string currency = "USD")
    {
        try
        {
            var accessToken = await GetAccessTokenAsync();

            var orderRequest = new
            {
                intent = "CAPTURE",
                purchase_units = new[]
                {
                    new
                    {
                        reference_id = orderId.ToString(),
                        amount = new
                        {
                            currency_code = currency,
                            value = amount.ToString("F2")
                        }
                    }
                },
                application_context = new
                {
                    return_url = "http://localhost:4200/checkout/success",
                    cancel_url = "http://localhost:4200/checkout/cancel"
                }
            };

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.PostAsync(
                $"{_baseUrl}/v2/checkout/orders",
                new StringContent(JsonSerializer.Serialize(orderRequest), Encoding.UTF8, "application/json"));

            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return new CreatePaymentResult(false, null, null, $"PayPal error: {content}");
            }

            var result = JsonSerializer.Deserialize<JsonElement>(content);
            var paymentId = result.GetProperty("id").GetString();
            var approvalUrl = result.GetProperty("links")
                .EnumerateArray()
                .FirstOrDefault(l => l.GetProperty("rel").GetString() == "approve")
                .GetProperty("href").GetString();

            return new CreatePaymentResult(true, paymentId, approvalUrl, null);
        }
        catch (Exception ex)
        {
            return new CreatePaymentResult(false, null, null, ex.Message);
        }
    }

    public async Task<CapturePaymentResult> CapturePaymentAsync(string paymentId)
    {
        try
        {
            var accessToken = await GetAccessTokenAsync();

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.PostAsync(
                $"{_baseUrl}/v2/checkout/orders/{paymentId}/capture",
                new StringContent("{}", Encoding.UTF8, "application/json"));

            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return new CapturePaymentResult(false, null, $"PayPal error: {content}");
            }

            var result = JsonSerializer.Deserialize<JsonElement>(content);
            var transactionId = result.GetProperty("purchase_units")[0]
                .GetProperty("payments")
                .GetProperty("captures")[0]
                .GetProperty("id").GetString();

            return new CapturePaymentResult(true, transactionId, null);
        }
        catch (Exception ex)
        {
            return new CapturePaymentResult(false, null, ex.Message);
        }
    }

    public async Task<RefundResult> RefundPaymentAsync(string transactionId, decimal amount)
    {
        try
        {
            var accessToken = await GetAccessTokenAsync();

            var refundRequest = new
            {
                amount = new
                {
                    value = amount.ToString("F2"),
                    currency_code = "USD"
                }
            };

            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var response = await _httpClient.PostAsync(
                $"{_baseUrl}/v2/payments/captures/{transactionId}/refund",
                new StringContent(JsonSerializer.Serialize(refundRequest), Encoding.UTF8, "application/json"));

            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                return new RefundResult(false, null, $"PayPal error: {content}");
            }

            var result = JsonSerializer.Deserialize<JsonElement>(content);
            var refundId = result.GetProperty("id").GetString();

            return new RefundResult(true, refundId, null);
        }
        catch (Exception ex)
        {
            return new RefundResult(false, null, ex.Message);
        }
    }

    private async Task<string> GetAccessTokenAsync()
    {
        var credentials = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_clientId}:{_clientSecret}"));

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", credentials);

        var response = await _httpClient.PostAsync(
            $"{_baseUrl}/v1/oauth2/token",
            new FormUrlEncodedContent(new[] { new KeyValuePair<string, string>("grant_type", "client_credentials") }));

        var content = await response.Content.ReadAsStringAsync();
        var result = JsonSerializer.Deserialize<JsonElement>(content);

        return result.GetProperty("access_token").GetString()!;
    }
}
