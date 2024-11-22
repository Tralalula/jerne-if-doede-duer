using System.Net.Http.Json;
using Generated;

namespace ApiIntegrationTests;

public class AuthTest : ApiTestBase 
{
    [Fact]
    public async Task Login_Receives_AccessToken()
    {
        // Arrange
        var request = new LoginRequest
        {
             Email = "admin@example.com",
             Password = "Kakao1234!"
        };
        
        // Act
        var response = await new AuthClient(TestHttpClient).LoginAsync(request);
        
        // Assert
        Assert.NotEmpty(response.Result.AccessToken);
        Assert.Equal(200, response.StatusCode);
        
        var setCookieHeaders = response.Headers.TryGetValue("Set-Cookie", out var values) ? values : [];
        Assert.Contains(setCookieHeaders, header => header.StartsWith("refreshToken="));
    }
}