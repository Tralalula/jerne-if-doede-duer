using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.RegularExpressions;
using ApiIntegrationTests.Auth;
using ApiIntegrationTests.Common;
using DataAccess.Models;
using Generated;
using Microsoft.AspNetCore.Http;
using Service.Exceptions;
using Xunit.Abstractions;


namespace ApiIntegrationTests;

public class AuthTests(ITestOutputHelper testOutputHelper) : ApiTestBase
{
    // Kommer i forbindelse med Identity
    private const string RfcUnauthorized = "https://tools.ietf.org/html/rfc9110#section-15.5.2";
    private const string RfcForbidden = "https://tools.ietf.org/html/rfc9110#section-15.5.4";
    
    private async Task<(string AccessToken, IEnumerable<string> CookieHeaders, AuthClient Client)> Check_Login(LoginRequest user)
    {
        var client = new AuthClient(TestHttpClient);
        var loginResponse = await client.LoginAsync(user);
        Assert.Equal(StatusCodes.Status200OK, loginResponse.StatusCode);
        
        var accessToken = loginResponse.Result.AccessToken;
        Assert.NotEmpty(accessToken);
        
        var setCookieHeaders = loginResponse.Headers.TryGetValue("Set-Cookie", out var values) ? values : [];
        var cookieHeaders = setCookieHeaders as string[] ?? setCookieHeaders.ToArray();
        Assert.Contains(cookieHeaders, header => header.StartsWith("refreshToken="));
        
        return (accessToken, cookieHeaders, client);
    }
    
    private void Check_JWT_Structure(string accessToken)
    {
        var tokenParts = accessToken.Split('.');
        Assert.Equal(3, tokenParts.Length);
        
        var handler = new JwtSecurityTokenHandler();
        var jsonToken = handler.ReadToken(accessToken) as JwtSecurityToken;
        Assert.NotNull(jsonToken);
        
        // Claims 
        var audClaim = jsonToken.Claims.FirstOrDefault(c => c.Type == "aud");
        Assert.NotNull(audClaim);
        Assert.Equal("http://localhost:5009", audClaim.Value);
        
        var userIdClaim = jsonToken.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        Assert.NotNull(userIdClaim);
        Assert.True(Guid.TryParse(userIdClaim.Value, out _), $"User ID '{userIdClaim.Value}' not a valid GUID");
        
        // Timestamps
        var exp = jsonToken.Claims.First(c => c.Type == "exp").Value;
        var expirationTime = DateTimeOffset.FromUnixTimeSeconds(long.Parse(exp));
        Assert.True(expirationTime > DateTimeOffset.UtcNow);
        
        var iat = jsonToken.Claims.First(c => c.Type == "iat").Value;
        var issuedTime = DateTimeOffset.FromUnixTimeSeconds(long.Parse(iat));
        Assert.True(issuedTime <= DateTimeOffset.UtcNow);
    }
    
    private void Check_Refresh_Token_Cookie(IEnumerable<string> cookieHeaders)
    {
        var refreshTokenCookie = cookieHeaders.First(h => h.StartsWith("refreshToken="));
        testOutputHelper.WriteLine(refreshTokenCookie);
        Assert.Contains("path=/", refreshTokenCookie);
        Assert.Contains("secure", refreshTokenCookie);
        Assert.Contains("samesite=none", refreshTokenCookie); 
        Assert.Contains("httponly", refreshTokenCookie);
        
        // Har udløbstid
        var expiresMatch = Regex.Match(refreshTokenCookie, @"expires=([^;]+)");
        Assert.True(expiresMatch.Success);
    
        var expiresValue = expiresMatch.Groups[1].Value;
        var expiresDate = DateTime.Parse(expiresValue);
        Assert.True(expiresDate > DateTime.UtcNow);
    }
    
    private async Task Check_Anonymous_Endpoints(AuthClient client)
    {
        // Kræver login & admin
        await WebAssert.ThrowsProblemAsync<ApiException>(
            () => client.RegisterAsync(AuthTestHelper.Users.NewUser),
            StatusCodes.Status401Unauthorized, RfcUnauthorized);
            
        // Kræver login
        await WebAssert.ThrowsProblemAsync<ApiException>(
            () => client.LogoutAsync(),
            StatusCodes.Status401Unauthorized, RfcUnauthorized);
            
        // Kræver login
        await WebAssert.ThrowsProblemAsync<ApiException>(
            () => client.UserInfoAsync(),
            StatusCodes.Status401Unauthorized, RfcUnauthorized);
            
        // Har adgang her, men har ikke en reel token
        await WebAssert.ThrowsProblemAsync<UnauthorizedException>(
            () => client.RefreshAsync(),
            StatusCodes.Status401Unauthorized, nameof(UnauthorizedException));
    }
    
    private async Task Check_Protected_Endpoint_Access(AuthClient client)
    {
        var userInfoResponse = await client.UserInfoAsync();
        Assert.Equal(StatusCodes.Status200OK, userInfoResponse.StatusCode);
    }
    
    private async Task Check_Admin_Specific_Access(AuthClient client)
    {
        var registerResponse = await client.RegisterAsync(AuthTestHelper.Users.NewUser);
        Assert.Equal(StatusCodes.Status200OK, registerResponse.StatusCode);
    }
    
    private async Task Check_Invalid_Token_Handling(AuthClient client)
    {
        SetAccessToken("invalid.token.here");
        await WebAssert.ThrowsProblemAsync<ApiException>(
            () => client.UserInfoAsync(),
            StatusCodes.Status401Unauthorized, RfcUnauthorized);
    }
    
    private async Task Check_Logout_Flow(AuthClient client)
    {
        var logoutResponse = await client.LogoutAsync();
        Assert.Equal(StatusCodes.Status200OK, logoutResponse.StatusCode);
            
        // Tjek at refresh token er ugyldig efter logud
        await WebAssert.ThrowsProblemAsync<ApiException>(
            () => client.RefreshAsync(),
            StatusCodes.Status401Unauthorized, nameof(UnauthorizedException));
    }
    
    [Fact]
    public async Task Admin_Authentication_Flow()
    {
        var (accessToken, cookieHeaders, client) = await Check_Login(AuthTestHelper.Users.Admin);
        
        Check_JWT_Structure(accessToken);
        Check_Refresh_Token_Cookie(cookieHeaders);
        SetAccessToken(accessToken);
        
        await Check_Protected_Endpoint_Access(client);
        await Check_Admin_Specific_Access(client);
        await Check_Logout_Flow(client);
    }
    
    [Fact]
    public async Task Player_Authentication_Flow()
    {
        var (accessToken, cookieHeaders, client) = await Check_Login(AuthTestHelper.Users.Player);
        
        Check_JWT_Structure(accessToken);
        Check_Refresh_Token_Cookie(cookieHeaders);
        SetAccessToken(accessToken);
        
        await Check_Protected_Endpoint_Access(client);
        
        await WebAssert.ThrowsProblemAsync<ApiException>(
            () => client.RegisterAsync(AuthTestHelper.Users.NewUser),
            StatusCodes.Status403Forbidden, RfcForbidden);
        await Check_Logout_Flow(client);
    }
    
    [Fact]
    public async Task Anonymous_Access_Restrictions()
    {
        var client = new AuthClient(TestHttpClient);
        await Check_Anonymous_Endpoints(client);
        await Check_Invalid_Token_Handling(client);
    }
}