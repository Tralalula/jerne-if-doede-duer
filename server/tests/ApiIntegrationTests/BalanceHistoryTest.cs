using ApiIntegrationTests.Common;
using Generated;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Xunit.Abstractions;
using PagedBalanceHistoryResponse = Generated.PagedBalanceHistoryResponse;
using BalanceAction = Generated.BalanceAction;

namespace ApiIntegrationTests
{
#pragma warning disable CS9113
    public class BalanceHistoryTests(ITestOutputHelper testOutputHelper) : ApiTestBase
#pragma warning restore CS9113
    {
        public const string RfcForbidden = "https://tools.ietf.org/html/rfc9110#section-15.5.4";

        #region Checks
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

        private async Task<Guid> Get_User_Id(string email)
        {
            var user = await PgCtxSetup.DbContextInstance.Users.FirstAsync(u => u.Email == email);
            return user.Id;
        }

        private async Task<PagedBalanceHistoryResponse> Check_Get_My_History(BalanceHistoryClient client, 
            int? page = null, int? pageSize = null, BalanceAction? action = null, 
            DateTimeOffset? fromDate = null, DateTimeOffset? toDate = null, SortOrder? sort = null)
        {
            var response = await client.GetMyBalanceHistoryAsync(page, pageSize, action, fromDate, toDate, sort);
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
            return response.Result;
        }

        private async Task<PagedBalanceHistoryResponse> Check_Get_User_History(BalanceHistoryClient client, Guid userId,
            int? page = null, int? pageSize = null, BalanceAction? action = null,
            DateTimeOffset? fromDate = null, DateTimeOffset? toDate = null, SortOrder? sort = null)
        {
            var response = await client.GetUserBalanceHistoryAsync(userId, page, pageSize, action, fromDate, toDate, sort);
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
            return response.Result;
        }

        private async Task<PagedBalanceHistoryResponse> Check_Get_All_History(BalanceHistoryClient client,
            int? page = null, int? pageSize = null, BalanceAction? action = null,
            DateTimeOffset? fromDate = null, DateTimeOffset? toDate = null, SortOrder? sort = null)
        {
            var response = await client.GetAllBalanceHistoryAsync(page, pageSize, action, fromDate, toDate, sort);
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
            return response.Result;
        }

        private async Task Add_Balance_History(Guid userId, int amount,
            BalanceAction action, DateTimeOffset? timestamp = null)
        {
            var history = new DataAccess.Models.BalanceHistory
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Amount = amount,
                Action = action.ToString().ToLower(), 
                Timestamp = (timestamp ?? TimeProvider.GetUtcNow()).UtcDateTime
            };

            PgCtxSetup.DbContextInstance.BalanceHistories.Add(history);
            await PgCtxSetup.DbContextInstance.SaveChangesAsync();
        }
        #endregion

        [Fact]
        public async Task Get_My_History_Happy_Path()
        {
            var (accessToken, _, _) = await Check_Login(AuthTestHelper.Users.Player, TestHttpClient);
            SetAccessToken(accessToken);
            var client = new BalanceHistoryClient(TestHttpClient);

            var userId = await Get_User_Id(AuthTestHelper.Users.Player.Email);
            
            await Add_Balance_History(userId, 1000, BalanceAction.UserBought);
            await Add_Balance_History(userId, -500, BalanceAction.UserUsed);
            
            var history = await Check_Get_My_History(client);
            
            Assert.Equal(2, history.Items.Count);
            var items = history.Items.ToList();
            
            Assert.Contains(items, h => h.Amount == 1000 && h.Action == BalanceAction.UserBought);
            Assert.Contains(items, h => h.Amount == -500 && h.Action == BalanceAction.UserUsed);
            
            await Add_Balance_History(userId, 1000, BalanceAction.UserBought);
            await Task.Delay(100); 
            await Add_Balance_History(userId, -500, BalanceAction.UserUsed);
        }

        [Fact]
        public async Task Admin_Can_View_Any_User_History()
        {
            var userId = await Get_User_Id(AuthTestHelper.Users.Player.Email);
            await Add_Balance_History(userId, 1000, BalanceAction.UserBought);
            await Add_Balance_History(userId, -200, BalanceAction.UserUsed);

            var (adminToken, _, _) = await Check_Login(AuthTestHelper.Users.Admin, TestHttpClient);
            SetAccessToken(adminToken);
            var adminClient = new BalanceHistoryClient(TestHttpClient);

            var userHistory = await Check_Get_User_History(adminClient, userId);
            Assert.Equal(2, userHistory.Items.Count);
            
            var allHistory = await Check_Get_All_History(adminClient);
            Assert.True(allHistory.Items.Count >= 2);
        }

        [Fact]
        public async Task History_Filtering()
        {
            var (accessToken, _, _) = await Check_Login(AuthTestHelper.Users.Player, TestHttpClient);
            SetAccessToken(accessToken);
            var client = new BalanceHistoryClient(TestHttpClient);

            var userId = await Get_User_Id(AuthTestHelper.Users.Player.Email);
            
            var initialTime = new DateTimeOffset(2024, 1, 1, 12, 0, 0, TimeSpan.Zero).ToUniversalTime();
            TimeProvider.Advance(initialTime - TimeProvider.GetUtcNow());
            
            await Add_Balance_History(userId, 1000, BalanceAction.UserBought);
            
            TimeProvider.Advance(TimeSpan.FromDays(2));
            await Add_Balance_History(userId, -200, BalanceAction.UserUsed);
            
            TimeProvider.Advance(TimeSpan.FromDays(2));
            await Add_Balance_History(userId, 500, BalanceAction.UserBought);
            
            var boughtHistory = await Check_Get_My_History(client, action: BalanceAction.UserBought);
            Assert.Equal(2, boughtHistory.Items.Count);
            Assert.All(boughtHistory.Items, h => Assert.Equal(BalanceAction.UserBought, h.Action));

            var fromDate = initialTime.AddDays(1);
            var toDate = initialTime.AddDays(5);
            var dateFilteredHistory = await Check_Get_My_History(client, fromDate: fromDate, toDate: toDate);
            Assert.Equal(2, dateFilteredHistory.Items.Count);

            var ascHistory = await Check_Get_My_History(client, sort: SortOrder.Asc);
            var ascItems = ascHistory.Items.ToList();
            Assert.True(ascItems[0].Timestamp < ascItems[1].Timestamp);
            Assert.Equal(initialTime.UtcDateTime, ascItems[0].Timestamp);
        }

        [Fact]
        public async Task Get_History_For_Non_Existent_User()
        {
            var (adminToken, _, _) = await Check_Login(AuthTestHelper.Users.Admin, TestHttpClient);
            SetAccessToken(adminToken);
            var adminClient = new BalanceHistoryClient(TestHttpClient);

            var nonExistentUserId = Guid.NewGuid();
            
            var exception = await Assert.ThrowsAsync<ApiException>(() => 
                adminClient.GetUserBalanceHistoryAsync(nonExistentUserId, null, null, null, null, null, null));
            Assert.Equal(StatusCodes.Status404NotFound, exception.StatusCode);
            Assert.Contains("User not found", exception.Response);
        }

        [Fact]
        public async Task Non_Admin_Cannot_Access_All_History()
        {
            var (playerToken, _, _) = await Check_Login(AuthTestHelper.Users.Player, TestHttpClient);
            SetAccessToken(playerToken);
            var playerClient = new BalanceHistoryClient(TestHttpClient);

            await WebAssert.ThrowsProblemAsync<ApiException>(
                () => playerClient.GetAllBalanceHistoryAsync(null, null, null, null, null, null),
                StatusCodes.Status403Forbidden,
                RfcForbidden);
            
            var otherUserId = await Get_User_Id(AuthTestHelper.Users.Admin.Email);
            await WebAssert.ThrowsProblemAsync<ApiException>(
                () => playerClient.GetUserBalanceHistoryAsync(otherUserId, null, null, null, null, null, null),
                StatusCodes.Status403Forbidden,
                RfcForbidden);
        }

        [Fact]
        public async Task Balance_History_Query_Validation()
        {
            var (accessToken, _, _) = await Check_Login(AuthTestHelper.Users.Player, TestHttpClient);
            SetAccessToken(accessToken);
            var client = new BalanceHistoryClient(TestHttpClient);

            await WebAssert.ThrowsValidationAsync(() => 
                client.GetMyBalanceHistoryAsync(0, 20, null, null, null, null));

            await WebAssert.ThrowsValidationAsync(() => 
                client.GetMyBalanceHistoryAsync(1, 101, null, null, null, null));

            var fromDate = TimeProvider.GetUtcNow();
            var toDate = fromDate.AddDays(-1);
            await WebAssert.ThrowsValidationAsync(() => 
                client.GetMyBalanceHistoryAsync(1, 20, null, fromDate, toDate, null));
        }

        [Fact]
        public async Task Pagination_Works_Correctly()
        {
            var (accessToken, _, _) = await Check_Login(AuthTestHelper.Users.Player, TestHttpClient);
            SetAccessToken(accessToken);
            var client = new BalanceHistoryClient(TestHttpClient);

            var userId = await Get_User_Id(AuthTestHelper.Users.Player.Email);
            
            for (var i = 0; i < 25; i++)
            {
                await Add_Balance_History(userId, 100, BalanceAction.UserBought);
            }

            var firstPage = await Check_Get_My_History(client, page: 1, pageSize: 10);
            Assert.Equal(10, firstPage.Items.Count);
            Assert.Equal(25, firstPage.PagingInfo.TotalItems);
            Assert.Equal(1, firstPage.PagingInfo.CurrentPage);

            var lastPage = await Check_Get_My_History(client, page: 3, pageSize: 10);
            Assert.Equal(5, lastPage.Items.Count);
            Assert.Equal(25, lastPage.PagingInfo.TotalItems);
            Assert.Equal(3, lastPage.PagingInfo.CurrentPage);
        }

        [Fact]
        public async Task History_Time_Based_Scenarios()
        {
            var (accessToken, _, _) = await Check_Login(AuthTestHelper.Users.Player, TestHttpClient);
            SetAccessToken(accessToken);
            var client = new BalanceHistoryClient(TestHttpClient);

            var userId = await Get_User_Id(AuthTestHelper.Users.Player.Email);
            
            var initialTime = new DateTimeOffset(2024, 1, 1, 0, 0, 0, TimeSpan.Zero);
            TimeProvider.Advance(initialTime - TimeProvider.GetUtcNow());

            for (int i = 0; i < 3; i++)
            {
                await Add_Balance_History(userId, 100 * (i + 1), BalanceAction.UserBought);
                TimeProvider.Advance(TimeSpan.FromDays(1));
            }

            var dayStart = initialTime;
            var dayEnd = initialTime.AddDays(1).AddMilliseconds(-1);
            var singleDayHistory = await Check_Get_My_History(client, fromDate: dayStart, toDate: dayEnd);
            Assert.Single(singleDayHistory.Items);
            Assert.Equal(100, singleDayHistory.Items.First().Amount);

            var windowStart = initialTime.AddDays(1);
            var windowEnd = initialTime.AddDays(2).AddMilliseconds(-1);
            var timeWindowHistory = await Check_Get_My_History(client, fromDate: windowStart, toDate: windowEnd);
            Assert.Single(timeWindowHistory.Items);
            Assert.Equal(200, timeWindowHistory.Items.First().Amount);

            TimeProvider.Advance(TimeSpan.FromDays(30));
            var allHistory = await Check_Get_My_History(client);
            Assert.Equal(3, allHistory.Items.Count);
        }
    }
}