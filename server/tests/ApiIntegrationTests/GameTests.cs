using System.Net.Http.Headers;
using System.Net.Http.Json;
using ApiIntegrationTests.Common;
using Generated;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Service.Models.Responses;
using Xunit.Abstractions;
using GameModel = DataAccess.Models.Game;

namespace ApiIntegrationTests;

public class GameTests : ApiTestBase
{
    private readonly HttpClient _httpClient;
    private readonly ITestOutputHelper _testOutputHelper;

    public GameTests(ITestOutputHelper testOutputHelper)
    {
        _testOutputHelper = testOutputHelper;
        _httpClient = CreateNewClient();
    }
    
    private async Task<(string AccessToken, IEnumerable<string> CookieHeaders, AuthClient Client)> Check_Login(LoginRequest user, HttpClient httpClient)
    {
        var client = new AuthClient(httpClient);
        var loginResponse = await client.LoginAsync(user);
        Assert.Equal(StatusCodes.Status200OK, loginResponse.StatusCode);
        
        var accessToken = loginResponse.Result.AccessToken;
        Assert.NotEmpty(accessToken);
        
        var setCookieHeaders = loginResponse.Headers.TryGetValue("Set-Cookie", out var values) ? values : [];
        var cookieHeaders = setCookieHeaders as string[] ?? setCookieHeaders.ToArray();
        Assert.Contains(cookieHeaders, header => header.StartsWith("refreshToken="));
        return (accessToken, cookieHeaders, client);
    }
    
    private async Task<HttpClient> AuthenticateClientAsync(LoginRequest loginRequest)
    {
        var (accessToken, _, _) = await Check_Login(loginRequest, _httpClient);

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        return _httpClient;
    }

    private async Task<Guid> Get_User_Id(string email)
    {
        var user = await PgCtxSetup.DbContextInstance.Users.FirstAsync(u => u.Email == email);
        return user.Id;
    }
    
    private async Task<GameModel> Create_Random_Active_Game()
    {
        var now = TimeProvider.GetUtcNow().UtcDateTime;
        var random = new Random();
        
        var fakeGame = new GameModel
        {
            StartTime = now.AddDays(-random.Next(1, 10)),
            EndTime = now.AddHours(random.Next(2, 10)),
            FieldCount = random.Next(0, 100),
            Active = true
        };

        await PgCtxSetup.DbContextInstance.Games.AddAsync(fakeGame);
        await PgCtxSetup.DbContextInstance.SaveChangesAsync();

        return fakeGame;
    }
    
    [Fact]
    public async Task Get_Active_Games()
    {
        var client = await AuthenticateClientAsync(AuthTestHelper.Users.Admin);

        var response = await client.GetAsync("/api/game/history");
        
        Assert.Equal(StatusCodes.Status200OK, (int)response.StatusCode);

        var responseContent = await response.Content.ReadFromJsonAsync<GameHistoryResponse>();
        Assert.NotNull(responseContent);
    }
}