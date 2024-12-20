using Microsoft.AspNetCore.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using ApiIntegrationTests.Common;
using Generated;
using GameModel = DataAccess.Models.Game;

using Microsoft.EntityFrameworkCore;
using Service.Models.Responses;
using Xunit.Abstractions;
using BoardPickRequest = Service.Models.Requests.BoardPickRequest;
using BoardPickResponse = Service.Models.Responses.BoardPickResponse;
using GameStatusResponse = Service.Models.Responses.GameStatusResponse;
using UserStatus = DataAccess.Models.UserStatus;

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
        
        PgCtxSetup.DbContextInstance.Update(user);
        await PgCtxSetup.DbContextInstance.SaveChangesAsync();
    }
    
    private async Task Set_User_Inactive(Guid userId)
    {
        var user = await PgCtxSetup.DbContextInstance.Users
            .FirstOrDefaultAsync(u => u.Id == userId);

        if (user == null)
            throw new InvalidOperationException("User not found.");

        user.Status = UserStatus.Inactive;
        
        PgCtxSetup.DbContextInstance.Update(user);
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
            FieldCount = 47,
            Active = true
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
        
        await Create_Active_Game();
        
        var boardRequest = new BoardPickRequest
        {
            Amount = 2,
            SelectedNumbers = new List<int> { 3, 7, 9, 12, 14 }
        };

        var response = await client.PostAsJsonAsync("/api/board/pick", boardRequest);
        
        Assert.Equal(StatusCodes.Status200OK, (int)response.StatusCode);

        var responseContent = await response.Content.ReadFromJsonAsync<BoardPickResponse>();
        Assert.NotNull(responseContent);
        Assert.Equal(boardRequest.SelectedNumbers, responseContent.SelectedNumbers);
        Assert.Equal(boardRequest.Amount, responseContent.Amount);
        Assert.True(responseContent.Total > 0, "Total price should be greater than zero.");
    }

    [Fact]
    public async Task PickBoard_NotEnoughCreditsValidBoard()
    {
        var client = await AuthenticateClientAsync(AuthTestHelper.Users.Player);
        await Create_Active_Game();
        
        var boardRequest = new BoardPickRequest
        {
            Amount = 2,
            SelectedNumbers = new List<int> { 3, 7, 9, 12, 14 }
        };

        var response = await client.PostAsJsonAsync("/api/board/pick", boardRequest);
        
        Assert.Equal(StatusCodes.Status400BadRequest, (int)response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Du har ikke nok credits til at købe dette bræt.", content);
    }
    
    [Fact]
    public async Task PickBoard_NotValidBoard()
    {
        var client = await AuthenticateClientAsync(AuthTestHelper.Users.Player);
        await Create_Active_Game();
        
        var boardRequest = new BoardPickRequest
        {
            Amount = 1,
            SelectedNumbers = new List<int> { 3, 7, 9, 10 }
        };

        var response = await client.PostAsJsonAsync("/api/board/pick", boardRequest);
        
        Assert.Equal(StatusCodes.Status400BadRequest, (int)response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Du skal vælge mellem 5 til 8 numre.", content);
    }
    
    [Fact]
    public async Task PickBoard_NoActiveGame()
    {
        var client = await AuthenticateClientAsync(AuthTestHelper.Users.Player);
        var userId = await Get_User_Id(AuthTestHelper.Users.Player.Email);
        await Add_User_Credits(userId, 200);

        var boardRequest = new BoardPickRequest
        {
            Amount = 1,
            SelectedNumbers = new List<int> { 3, 7, 9, 10, 11 }
        };

        var response = await client.PostAsJsonAsync("/api/board/pick", boardRequest);
        
        Assert.Equal(StatusCodes.Status404NotFound, (int)response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Ingen aktiv spil fundet.", content);
    }

    [Fact]
    public async Task PickBoard_User_Is_Inactive()
    {
        var client = await AuthenticateClientAsync(AuthTestHelper.Users.Player);
        var userId = await Get_User_Id(AuthTestHelper.Users.Player.Email);
        await Set_User_Inactive(userId);

        var boardRequest = new BoardPickRequest
        {
            Amount = 1,
            SelectedNumbers = new List<int> { 3, 7, 9, 10, 11 }
        };

        var response = await client.PostAsJsonAsync("/api/board/pick", boardRequest);
        
        Assert.Equal(StatusCodes.Status401Unauthorized, (int)response.StatusCode);
        
        var content = await response.Content.ReadAsStringAsync();
        Assert.Contains("Du har ikke tilladelse til at købe et bræt.", content);
    }
    
    [Fact]
    public async Task PickWinner_SequenceValid()
    {
        var client = await AuthenticateClientAsync(AuthTestHelper.Users.Admin);

        await Create_Active_Game();
        
        var selectedNumbers = new List<int> { 3, 7, 9 };
        var numbersQuery = string.Join(",", selectedNumbers);

        var response = await client.GetAsync($"/api/board/winner-sequence?numbers={numbersQuery}");

        Assert.Equal(StatusCodes.Status200OK, (int)response.StatusCode);

        var content = await response.Content.ReadAsStringAsync();

        var responseObject = System.Text.Json.JsonSerializer.Deserialize<BoardWinningSequenceResponse>(content);
        Assert.NotNull(responseObject);
        
        Assert.NotNull(responseObject.SelectedNumbers);
        Assert.Equal(0, responseObject.WinnerAmounts);
        Assert.Equal(selectedNumbers, responseObject.SelectedNumbers);
    }
    
    [Fact]
    public async Task GetStatus_ReturnsGameStatus()
    {
        var client = await AuthenticateClientAsync(AuthTestHelper.Users.Player);

        var response = await client.GetAsync("/api/board/status");

        Assert.Equal(StatusCodes.Status200OK, (int)response.StatusCode);

        var responseContent = await response.Content.ReadFromJsonAsync<GameStatusResponse>();
        Assert.NotNull(responseContent);
        Assert.True(responseContent.GameWeek >= 0);
        Assert.True(responseContent.TimeLeft >= 0);
    }
}
