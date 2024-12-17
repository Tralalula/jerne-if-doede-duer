using Microsoft.AspNetCore.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Service.Models.Requests;
using Service.Models.Responses;
using ApiIntegrationTests.Auth;
using Generated;
using GameModel = DataAccess.Models.Game;

using Microsoft.EntityFrameworkCore;
using Xunit.Abstractions;

namespace ApiIntegrationTests;

public class BoardControllerIntegrationTests : ApiTestBase
{
    private readonly HttpClient _httpClient;
    private readonly ITestOutputHelper _testOutputHelper;

    public BoardControllerIntegrationTests(ITestOutputHelper testOutputHelper)
    {
        _testOutputHelper = testOutputHelper;
        _httpClient = CreateNewClient();
    }
    
    /*

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

    private async Task Add_User_Credits(Guid userId, int amount)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be greater than zero.", nameof(amount));

        var user = await PgCtxSetup.DbContextInstance.Users
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            throw new InvalidOperationException("User not found.");

        user.Credits += amount;
        
        _testOutputHelper.WriteLine($"User credits: {amount}");

        await PgCtxSetup.DbContextInstance.SaveChangesAsync();
    }
    
    private async Task<Guid> Get_User_Id(string email)
    {
        var user = await PgCtxSetup.DbContextInstance.Users.FirstAsync(u => u.Email == email);
        return user.Id;
    }
    
    private async Task<Guid> Create_Active_Game()
    {
        var now = TimeProvider.GetUtcNow().UtcDateTime;

        var fakeGame = new GameModel
        {
            Id = Guid.NewGuid(),
            StartTime = now.AddDays(-2),
            EndTime = now.AddHours(5),
            FieldCount = 47
        };

        await PgCtxSetup.DbContextInstance.Games.AddAsync(fakeGame);
        await PgCtxSetup.DbContextInstance.SaveChangesAsync();

        return fakeGame.Id;
    }
    
    private async Task<HttpClient> AuthenticateClientAsync(LoginRequest loginRequest)
    {
        var (accessToken, _, _) = await Check_Login(loginRequest, _httpClient);

        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        return _httpClient;
    }

    [Fact]
    public async Task PickBoard_WithValidRequest_ReturnsSuccessfulResponse()
    {
        var client = await AuthenticateClientAsync(AuthTestHelper.Users.Player);
        var userId = await Get_User_Id(AuthTestHelper.Users.Player.Email);
        await Add_User_Credits(userId, 200);
        
        var user = await PgCtxSetup.DbContextInstance.Users
            .FirstOrDefaultAsync(u => u.Id == userId);

        _testOutputHelper.WriteLine($"User Credits After Update: {user.Credits}");
        
        await Create_Active_Game();
        
        var boardRequest = new BoardPickRequest
        {
            Amount = 2,
            SelectedNumbers = new List<int> { 3, 7, 9, 12, 14 }
        };

        var response = await client.PostAsJsonAsync("/api/board/pick", boardRequest);
        
        _testOutputHelper.WriteLine(await response.Content.ReadAsStringAsync());

        Assert.Equal(StatusCodes.Status200OK, (int)response.StatusCode);

        var responseContent = await response.Content.ReadFromJsonAsync<BoardPickResponse>();
        Assert.NotNull(responseContent);
        Assert.Equal(boardRequest.SelectedNumbers, responseContent.SelectedNumbers);
        Assert.Equal(boardRequest.Amount, responseContent.Amount);
        Assert.True(responseContent.Total > 0, "Total price should be greater than zero.");
    }

    [Fact]
    public async Task GetStatus_ReturnsGameStatus()
    {
        // Step 1: Login as a Player using AuthTestHelper
        var client = await AuthenticateClientAsync(AuthTestHelper.Users.Player);

        // Step 2: Send a GET request to /api/board/status
        var response = await client.GetAsync("/api/board/status");

        // Step 3: Validate the response
        Assert.Equal(StatusCodes.Status200OK, (int)response.StatusCode);

        var responseContent = await response.Content.ReadFromJsonAsync<GameStatusResponse>();
        Assert.NotNull(responseContent);
        Assert.True(responseContent.GameWeek >= 0);
        Assert.True(responseContent.TimeLeft >= 0);
    }*/
}
