using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.RegularExpressions;
using ApiIntegrationTests.Auth;
using ApiIntegrationTests.Common;
using Generated;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Service.Exceptions;
using Xunit.Abstractions;

namespace ApiIntegrationTests;

#pragma warning disable CS9113
public class AuthTests(ITestOutputHelper testOutputHelper) : ApiTestBase
#pragma warning restore CS9113
{
    // Kommer i forbindelse med Identity
    private const string RfcUnauthorized = "https://tools.ietf.org/html/rfc9110#section-15.5.2";
    private const string RfcForbidden = "https://tools.ietf.org/html/rfc9110#section-15.5.4";
    
    #region Checks
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
    
        var handler = new JsonWebTokenHandler();
        var jsonToken = handler.ReadJsonWebToken(accessToken);
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
            client.LogoutAsync,
            StatusCodes.Status401Unauthorized, RfcUnauthorized);
            
        // Kræver login
        await WebAssert.ThrowsProblemAsync<ApiException>(
            client.UserInfoAsync,
            StatusCodes.Status401Unauthorized, RfcUnauthorized);
            
        // Har adgang her, men har ikke en reel token
        await WebAssert.ThrowsProblemAsync<UnauthorizedException>(
            client.RefreshAsync,
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
            client.UserInfoAsync,
            StatusCodes.Status401Unauthorized, RfcUnauthorized);
    }
    
    private async Task Check_Logout_Flow(AuthClient client)
    {
        var logoutResponse = await client.LogoutAsync();
        Assert.Equal(StatusCodes.Status200OK, logoutResponse.StatusCode);
            
        // Tjek at refresh token er ugyldig efter logud
        await WebAssert.ThrowsProblemAsync<ApiException>(
            client.RefreshAsync,
            StatusCodes.Status401Unauthorized, nameof(UnauthorizedException));
    }
    
    private async Task<(string Email, string Code)> Check_Initiate_Password_Reset(AuthClient client, string email)
    {
        var initiateResponse = await client.InitiatePasswordResetAsync(new ForgotPasswordRequest { Email = email } );
        Assert.Equal(StatusCodes.Status200OK, initiateResponse.StatusCode);
        
        var resetCode = await PgCtxSetup.DbContextInstance.PasswordResetCodes.OrderByDescending(x => x.CreatedAt)
                                                                             .FirstOrDefaultAsync(x => x.Email == email);
                                                                             
        Assert.NotNull(resetCode);
        Assert.False(resetCode.IsUsed);
        Assert.True(resetCode.ExpiresAt > DateTime.UtcNow);
        Assert.Equal(6, resetCode.Code.Length);
        Assert.Matches("^[0-9]+$", resetCode.Code);
        
        return (email, resetCode.Code);
    }
    
    private async Task Check_Verify_Reset_Code(AuthClient client, string email, string code, bool shouldBeValid = true)
    {
        var request = new VerifyResetCodeRequest { Email = email, Code = code };
        if (shouldBeValid)
        {
            var verifyResponse = await client.VerifyResetCodeAsync(request);
            Assert.Equal(StatusCodes.Status200OK, verifyResponse.StatusCode);
        }
        else
        {
            var exception = await Assert.ThrowsAsync<ApiException>(() => client.VerifyResetCodeAsync(request));
            Assert.Equal(StatusCodes.Status400BadRequest, exception.StatusCode);
        }
    }
    
    private async Task Check_Complete_Password_Reset(AuthClient client, string email, string code, string newPassword, bool shouldSucceed = true)
    {
        var completeResponse = await client.CompletePasswordResetAsync(new CompletePasswordResetRequest { Email = email, Code = code, NewPassword = newPassword });
        Assert.Equal(shouldSucceed ? StatusCodes.Status200OK : StatusCodes.Status400BadRequest, completeResponse.StatusCode);
        
        if (shouldSucceed)
        {
            // tjek at vi kan logge ind hvis ændring af kodeord er godkendt
            var loginResponse = await client.LoginAsync(new LoginRequest { Email = email, Password = newPassword });
            Assert.Equal(StatusCodes.Status200OK, loginResponse.StatusCode);
        }
    }
    
    private async Task Check_Invalid_Reset_Attempts(string email, string code)
    {
        // NSwag fucker op med at deserialize ProblemDetails, så gør på den her måde
        for (int i = 0; i < 4; i++)
        {
            var response = await TestHttpClient.PostAsJsonAsync("/api/auth/verify-reset-code", new { email, code = "000000" });
            Assert.Equal(400, (int)response.StatusCode);
        }

        var finalResponse = await TestHttpClient.PostAsJsonAsync("/api/auth/verify-reset-code", new { email, code });
        Assert.Equal(400, (int)finalResponse.StatusCode);
    
        var resetCode = await PgCtxSetup.DbContextInstance.PasswordResetCodes.FirstOrDefaultAsync(x => x.Email == email && x.Code == code);
    
        Assert.NotNull(resetCode);
        Assert.True(resetCode.IsUsed);
    }
    
    private async Task<(string AccessToken, IEnumerable<string> CookieHeaders, AuthClient Client, HttpClient httpClient)> Check_Login_With_Device(LoginRequest user, string deviceName, string userAgent)
    {
        var httpClient = CreateNewClient(userAgent);
        var client = new AuthClient(httpClient);
        
        user.DeviceName = deviceName;
        var loginResponse = await client.LoginAsync(user);
        Assert.Equal(StatusCodes.Status200OK, loginResponse.StatusCode);
        
        var accessToken = loginResponse.Result.AccessToken;
        Assert.NotEmpty(accessToken);
        SetAccessToken(httpClient, accessToken);
        
        var setCookieHeaders = loginResponse.Headers.TryGetValue("Set-Cookie", out var values) ? values : [];
        var cookieHeaders = setCookieHeaders as string[] ?? setCookieHeaders.ToArray();
        Assert.Contains(cookieHeaders, header => header.StartsWith("refreshToken="));
        SetRefreshTokenCookie(httpClient, cookieHeaders);
        
        return (accessToken, cookieHeaders, client, httpClient);
    }
    
    private async Task Check_Device_Count(string email, int expectedCount)
    {
        var devices = await GetUserDevices(email);
        Assert.Equal(expectedCount, devices.Count);
    }
    
    private async Task<List<DataAccess.Models.UserDevice>> GetUserDevices(string email)
    {
        var user = await PgCtxSetup.DbContextInstance.Users.Where(u => u.Email == email).FirstOrDefaultAsync(); 
        Assert.NotNull(user);
        
        var devices = await PgCtxSetup.DbContextInstance.UserDevices.Where(d => d.UserId == user.Id).ToListAsync();
        return devices;
    }
    #endregion
    
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
    
    [Fact]
    public async Task Password_Reset_Happy_Path()
    {
        var client = new AuthClient(TestHttpClient);
        var email = AuthTestHelper.Users.Player.Email;
        
        var (resetEmail, code) = await Check_Initiate_Password_Reset(client, email);
        await Check_Verify_Reset_Code(client, resetEmail, code);
        await Check_Complete_Password_Reset(client, resetEmail, code, "Kartoffelmel1234!");
    }
    
    [Fact]
    public async Task Password_Reset_Security_Measures()
    {
        var email = AuthTestHelper.Users.Player.Email;
        
        // NSwag fucker op med at deserialize ProblemDetails, så gør på den her måde
        for (int i = 0; i < 5; i++)
        {
            await TestHttpClient.PostAsJsonAsync("/api/auth/forgot-password", new { email });
        }
    
        var response = await TestHttpClient.PostAsJsonAsync("/api/auth/forgot-password", new { email });
        Assert.Equal(429, (int)response.StatusCode);
    }
    
    [Fact]
    public async Task Password_Reset_Invalid_Attempts()
    {
        var client = new AuthClient(TestHttpClient);
        var email = AuthTestHelper.Users.Player.Email;
    
        var (resetEmail, code) = await Check_Initiate_Password_Reset(client, email);
        await Check_Invalid_Reset_Attempts(resetEmail, code);
    }
    
    [Fact]
    public async Task Password_Reset_Validation()
    {
        var client = new AuthClient(TestHttpClient);
        
        await WebAssert.ThrowsValidationAsync(() => client.InitiatePasswordResetAsync(new ForgotPasswordRequest { Email = "invalid-email" } ));
        
        await WebAssert.ThrowsValidationAsync(() => client.VerifyResetCodeAsync(new VerifyResetCodeRequest { Email = "test@test.com", Code = "12345" }));
        
        await WebAssert.ThrowsValidationAsync(() => client.CompletePasswordResetAsync(new CompletePasswordResetRequest { Email = "test@test.com", Code = "123456", NewPassword = "short" }));
    }
    
    [Fact]
    public async Task Password_Reset_Code_Should_Expire()
    {
        var client = new AuthClient(TestHttpClient);
        var email = AuthTestHelper.Users.Player.Email;
    
        var (resetEmail, code) = await Check_Initiate_Password_Reset(client, email);
    
        await Check_Verify_Reset_Code(client, resetEmail, code, shouldBeValid: true);
    
        TimeProvider.Advance(TimeSpan.FromMinutes(16)); // kode udløber efter 15m
    
        await Check_Verify_Reset_Code(client, resetEmail, code, shouldBeValid: false);
    }
    
    [Fact]
    public async Task Rate_Limiting_Should_Reset_After_Window()
    {
        var email = AuthTestHelper.Users.Player.Email;
    
        for (int i = 0; i < 5; i++)
        {
            await TestHttpClient.PostAsJsonAsync("/api/auth/forgot-password", new { email });
        }
    
        var rateLimitedResponse = await TestHttpClient.PostAsJsonAsync("/api/auth/forgot-password", new { email });
        Assert.Equal(429, (int)rateLimitedResponse.StatusCode);
    
        TimeProvider.Advance(TimeSpan.FromMinutes(61)); // udløber efter 1 time
    
        var response = await TestHttpClient.PostAsJsonAsync("/api/auth/forgot-password", new { email });
        Assert.Equal(200, (int)response.StatusCode);
    }
    
    [Fact]
    public async Task Refresh_Token_Should_Expire()
    {
        var (accessToken, cookieHeaders, client) = await Check_Login(AuthTestHelper.Users.Player);
        var cookieEnumerable = cookieHeaders as string[] ?? cookieHeaders.ToArray();
        
        Check_Refresh_Token_Cookie(cookieEnumerable);
        SetAccessToken(accessToken);
        SetRefreshTokenCookie(cookieEnumerable);

        var refreshResponse = await client.RefreshAsync();
        Assert.Equal(StatusCodes.Status200OK, refreshResponse.StatusCode);

        TimeProvider.Advance(TimeSpan.FromDays(8)); // Udløber efter 7 dage 

        await WebAssert.ThrowsProblemAsync<ApiException>(
            () => client.RefreshAsync(),
            StatusCodes.Status401Unauthorized,
            nameof(UnauthorizedException)
        );
    }
    
    [Fact]
    public async Task MultiDevice_Login_Up_To_MaxDevices()
    {
        var userCredentials = AuthTestHelper.Users.Player;
        var deviceNames = new[] { "Device1", "Device2", "Device3", "Device4", "Device5" };
        var userAgents = new[]
        {
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
            "Mozilla/5.0 (Linux; Android 10; SM-G973F)",
            "Mozilla/5.0 (iPad; CPU OS 13_2 like Mac OS X)"
        };
        
        var clients = new List<AuthClient>();
        
        // Login med 5 enheder
        for (int i = 0; i < 5; i++)
        {
            var (accessToken, cookieHeaders, client, _) = await Check_Login_With_Device(userCredentials, deviceNames[i], userAgents[i]);
            Check_JWT_Structure(accessToken);
            Check_Refresh_Token_Cookie(cookieHeaders);

            clients.Add(client);
        }
        
        await Check_Device_Count(userCredentials.Email, 5);
        
        foreach (var client in clients)
        {
            await client.LogoutAsync();
        }
    }
    
    [Fact]
    public async Task MultiDevice_Exceed_MaxDevices_Should_Fail()
    {
        var userCredentials = AuthTestHelper.Users.Player;
        var deviceNames = new[] { "Device1", "Device2", "Device3", "Device4", "Device5" };
        var userAgents = new[]
        {
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
            "Mozilla/5.0 (Linux; Android 10; SM-G973F)",
            "Mozilla/5.0 (iPad; CPU OS 13_2 like Mac OS X)"
        };
        
        var clients = new List<AuthClient>();
        
        // Login med 5 enheder
        for (int i = 0; i < 5; i++)
        {
            var (accessToken, cookieHeaders, client, _) = await Check_Login_With_Device(userCredentials, deviceNames[i], userAgents[i]);
            Check_JWT_Structure(accessToken);
            Check_Refresh_Token_Cookie(cookieHeaders);

            clients.Add(client);
        }
        
        // Forsøg 6
        userCredentials.DeviceName = "Device6";
        var httpClient = CreateNewClient("Mozilla/5.0 (Windows NT 10.0; Win64; x64)");
        var client6 = new AuthClient(httpClient);
        var exception = await Assert.ThrowsAsync<ApiException>(() => client6.LoginAsync(userCredentials));
        Assert.Contains("Maximum number of devices reached", exception.Response);
        
        await Check_Device_Count(userCredentials.Email, 5);
        
        foreach (var client in clients)
        {
            await client.LogoutAsync();
        }
    }
    
    [Fact]
    public async Task MultiDevice_Logout_Removes_Device()
    {
        var userCredentials = AuthTestHelper.Users.Player;
        var deviceNames = new[] { "Device1", "Device2" };
        var userAgents = new[]
        {
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)"
        };
        
        var clients = new List<AuthClient>();

        for (int i = 0; i < 2; i++)
        {
            var (accessToken, cookieHeaders, client, _) = await Check_Login_With_Device(userCredentials, deviceNames[i], userAgents[i]);
            Check_JWT_Structure(accessToken);
            Check_Refresh_Token_Cookie(cookieHeaders);

            clients.Add(client);
        }
        
        await Check_Device_Count(userCredentials.Email, 2);
        await clients[0].LogoutAsync();
        await Check_Device_Count(userCredentials.Email, 1);
        
        var devices = await GetUserDevices(userCredentials.Email);
        Assert.Contains(devices, d => d.DeviceName == deviceNames[1]);
        await clients[1].LogoutAsync();
    }
    
    
    [Fact]
    public async Task MultiDevice_Expired_Tokens_Are_Cleaned_Up()
    {
        var userCredentials = AuthTestHelper.Users.Player;
        var deviceNames = new[] { "Device1", "Device2", "Device3", "Device4", "Device5" };
        var userAgents = new[]
        {
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X)",
            "Mozilla/5.0 (Linux; Android 10; SM-G973F)",
            "Mozilla/5.0 (iPad; CPU OS 13_2 like Mac OS X)"
        };
        
        for (int i = 0; i < 5; i++)
        {
            var (accessToken, cookieHeaders, _, _) = await Check_Login_With_Device(userCredentials, deviceNames[i], userAgents[i]);
            Check_JWT_Structure(accessToken);
            Check_Refresh_Token_Cookie(cookieHeaders);
        }
        
        await Check_Device_Count(userCredentials.Email, 5);
        TimeProvider.Advance(TimeSpan.FromDays(8)); // refresh token udløber efter 7 dage
        
        // Login med ny enhed; bør være succes efter udløbet enheder bliver fjernet
        var newDeviceName = "NewDevice";
        var newUserAgent = "Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1)";

        var loginRequestNew = new LoginRequest
        {
            Email = userCredentials.Email,
            Password = userCredentials.Password
        };
        
        var (accessTokenNew, cookieHeadersNew, clientNew, _) = await Check_Login_With_Device(loginRequestNew, newDeviceName, newUserAgent);
        Check_JWT_Structure(accessTokenNew);
        Check_Refresh_Token_Cookie(cookieHeadersNew);
        
        await Check_Device_Count(userCredentials.Email, 1);
        var devices = await GetUserDevices(userCredentials.Email);
        Assert.Contains(devices, d => d.DeviceName == newDeviceName);
        
        await clientNew.LogoutAsync();
    }
    
    [Fact]
    public async Task Logout_After_Token_Rotation_Should_Properly_Cleanup()
    {
        // Login
        var userCredentials = AuthTestHelper.Users.Player;
        var deviceName = "TestDevice";
        var userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64)";
    
        var (accessToken, cookieHeaders, client, httpClient) = await Check_Login_With_Device(userCredentials, deviceName, userAgent);
        Check_JWT_Structure(accessToken);
        Check_Refresh_Token_Cookie(cookieHeaders);
    
        await Check_Device_Count(userCredentials.Email, 1);
        
        // Roter token
        var refreshResponse = await client.RefreshAsync();
        var setCookieHeaders = refreshResponse.Headers.TryGetValue("Set-Cookie", out var values) ? values : [];
        var refreshCookieHeaders = setCookieHeaders as string[] ?? setCookieHeaders.ToArray();
        Assert.Contains(refreshCookieHeaders, header => header.StartsWith("refreshToken="));
        SetRefreshTokenCookie(httpClient, refreshCookieHeaders);
        Assert.Equal(StatusCodes.Status200OK, refreshResponse.StatusCode);
        
        // Har kun 1 enhed aktiv
        await Check_Device_Count(userCredentials.Email, 1);
        
        // Tjek at vi har 2 refresh tokens (1 roteret, 1 aktiv)
        var user = await PgCtxSetup.DbContextInstance.Users.FirstOrDefaultAsync(u => u.Email == userCredentials.Email);
        Assert.NotNull(user);
    
        var refreshTokenCount = await PgCtxSetup.DbContextInstance.RefreshTokens.CountAsync(rt => rt.UserId == user.Id);
        Assert.Equal(2, refreshTokenCount);
        
        // Tjek at 1 token er markeret som erstattet
        var replacedToken = await PgCtxSetup.DbContextInstance.RefreshTokens.FirstOrDefaultAsync(rt => rt.UserId == user.Id && rt.ReplacedByTokenId != null);
        Assert.NotNull(replacedToken);
        Assert.NotNull(replacedToken.ReplacedByTokenId);
        Assert.NotNull(replacedToken.RevokedAt);
        
        // Logud
        var logoutResponse = await client.LogoutAsync();
        Assert.Equal(StatusCodes.Status200OK, logoutResponse.StatusCode);
        httpClient.DefaultRequestHeaders.Remove("Cookie");
        
        // Tjek at enheder er fjernet
        await Check_Device_Count(userCredentials.Email, 0);

        // Tjek at refresh tokens er revoked
        refreshTokenCount = await PgCtxSetup.DbContextInstance.RefreshTokens.CountAsync(rt => rt.UserId == user.Id && rt.RevokedAt == null);
        Assert.Equal(0, refreshTokenCount);
        
        // Tjek at vi ikke kan anvende refresh token igen
        await WebAssert.ThrowsProblemAsync<ApiException>(
            () => client.RefreshAsync(),
            StatusCodes.Status401Unauthorized,
            nameof(UnauthorizedException)
        );
    }
}