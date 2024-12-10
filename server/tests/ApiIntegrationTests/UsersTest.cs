using ApiIntegrationTests.Common;
using Generated;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Xunit.Abstractions;
using PagedUserResponse = Generated.PagedUserResponse;
using UserDetailsResponse = Generated.UserDetailsResponse;
using UserOrderBy = Generated.UserOrderBy;
using UserStatus = Generated.UserStatus;
using RoleType = Generated.RoleType;

namespace ApiIntegrationTests
{
#pragma warning disable CS9113
    public class UsersTests(ITestOutputHelper testOutputHelper) : ApiTestBase
#pragma warning restore CS9113
    {
        public static readonly string RfcForbidden = "https://tools.ietf.org/html/rfc9110#section-15.5.4";

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

        private async Task<PagedUserResponse> Check_Get_Users(UserClient client, int? page, int? pageSize, UserStatus? status, string? search, RoleType? role, UserOrderBy? orderBy, SortOrder? sort)
        {
            var response = await client.GetUsersAsync(page, pageSize, status, search, role, orderBy, sort);
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
            return response.Result;
        }

        private async Task<UserDetailsResponse> Check_Activate_User(UserClient client, Guid userId)
        {
            var response = await client.ActivateUserAsync(userId);
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
            return response.Result;
        }

        private async Task<UserDetailsResponse> Check_Deactivate_User(UserClient client, Guid userId)
        {
            var response = await client.DeactivateUserAsync(userId);
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
            return response.Result;
        }
        #endregion

        [Fact]
        public async Task Get_Users_Happy_Path()
        {
            var (accessToken, _, _) = await Check_Login(AuthTestHelper.Users.Admin, TestHttpClient);
            SetAccessToken(accessToken);

            var client = new UserClient(TestHttpClient);
            var users = await Check_Get_Users(client, 1, 20, null, null, null, UserOrderBy.Email, SortOrder.Asc);

            Assert.NotEmpty(users.Items);
            Assert.Contains(users.Items, u => u.Email == AuthTestHelper.Users.Admin.Email);
            Assert.Contains(users.Items, u => u.Email == AuthTestHelper.Users.Player.Email);
        }

        [Fact]
        public async Task Get_Users_With_Filtering()
        {
            var (accessToken, _, _) = await Check_Login(AuthTestHelper.Users.Admin, TestHttpClient);
            SetAccessToken(accessToken);

            var client = new UserClient(TestHttpClient);
            
            // Filter på rolle 
            var adminUsers = await Check_Get_Users(client, 1, 20, null, null, RoleType.Admin, null, null);
            Assert.Single(adminUsers.Items);
            Assert.Equal(AuthTestHelper.Users.Admin.Email, adminUsers.Items.First().Email);

            // Filter på søgning
            var searchUsers = await Check_Get_Users(client, 1, 20, null, "player", null, null, null);
            Assert.Single(searchUsers.Items);
            Assert.Equal(AuthTestHelper.Users.Player.Email, searchUsers.Items.First().Email);

            // Test order 
            var orderedUsers = await Check_Get_Users(client, 1, 20, null, null, null, UserOrderBy.Email, SortOrder.Desc);
            var usersList = orderedUsers.Items.ToList();
            Assert.True(usersList.Count >= 2, "Need at least 2 users to test ordering");
            Assert.True(string.Compare(usersList[0].Email, usersList[1].Email, StringComparison.OrdinalIgnoreCase) > 0);
        }

        [Fact]
        public async Task User_Status_Management()
        {
            var (accessToken, _, _) = await Check_Login(AuthTestHelper.Users.Admin, TestHttpClient);
            SetAccessToken(accessToken);

            var client = new UserClient(TestHttpClient);
            
            // Få player
            var users = await Check_Get_Users(client, 1, 20, null, null, RoleType.Player, null, null);
            var playerUser = users.Items.First();
            Assert.Equal(UserStatus.Active, playerUser.Status);

            // Deaktiver 
            var deactivatedUser = await Check_Deactivate_User(client, playerUser.Id);
            Assert.Equal(UserStatus.Inactive, deactivatedUser.Status);

            // Tjek db 
            var dbUser = await PgCtxSetup.DbContextInstance.Users
                .FirstAsync(u => u.Id == playerUser.Id);
            Assert.Equal(DataAccess.Models.UserStatus.Inactive, dbUser.Status);

            // Genaktiver 
            var reactivatedUser = await Check_Activate_User(client, playerUser.Id);
            Assert.Equal(UserStatus.Active, reactivatedUser.Status);
        }

        [Fact]
        public async Task Non_Admin_Cannot_Access_User_Management()
        {
            var (playerAccessToken, _, _) = await Check_Login(AuthTestHelper.Users.Player, TestHttpClient);
            SetAccessToken(playerAccessToken);
            var playerClient = new UserClient(TestHttpClient);

            await WebAssert.ThrowsProblemAsync<ApiException>(
                () => playerClient.GetUsersAsync(1, 20, null, null, null, null, null),
                StatusCodes.Status403Forbidden,
                RfcForbidden);

            var (adminAccessToken, _, _) = await Check_Login(AuthTestHelper.Users.Admin, CreateNewClient());
            SetAccessToken(adminAccessToken);
            var adminClient = new UserClient(TestHttpClient);
            var users = await Check_Get_Users(adminClient, 1, 20, null, null, RoleType.Admin, null, null);
            var adminUserId = users.Items.First().Id;

            SetAccessToken(playerAccessToken);
            await WebAssert.ThrowsProblemAsync<ApiException>(
                () => playerClient.DeactivateUserAsync(adminUserId),
                StatusCodes.Status403Forbidden,
                RfcForbidden);
        }

        [Fact]
        public async Task User_Query_Validation()
        {
            var (accessToken, _, _) = await Check_Login(AuthTestHelper.Users.Admin, TestHttpClient);
            SetAccessToken(accessToken);
            var client = new UserClient(TestHttpClient);

            // page min 1 
            await WebAssert.ThrowsValidationAsync(() => 
                client.GetUsersAsync(0, 20, null, null, null, null, null));

            // pageSize max 100
            await WebAssert.ThrowsValidationAsync(() => client.GetUsersAsync(1, 101, null, null, null, null, null));
        }
    }
}