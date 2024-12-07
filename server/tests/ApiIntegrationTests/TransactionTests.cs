using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using ApiIntegrationTests.Auth;
using ApiIntegrationTests.Common;
using Generated;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Service.BalanceHistory;
using Service.Exceptions;
using Xunit.Abstractions;
using BalanceResponse = Generated.BalanceResponse;
using CreateTransactionRequest = Generated.CreateTransactionRequest;
using PagedTransactionResponse = Generated.PagedTransactionResponse;
using TransactionOrderBy = Generated.TransactionOrderBy;
using TransactionResponse = Generated.TransactionResponse;
using TransactionStatus = Generated.TransactionStatus;

namespace ApiIntegrationTests
{
#pragma warning disable CS9113
    public class TransactionTests(ITestOutputHelper testOutputHelper) : ApiTestBase
#pragma warning restore CS9113
    {
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
    
        private async Task<(TransactionResponse Transaction, TransactionClient Client)> Check_Create_Transaction(LoginRequest user, CreateTransactionRequest request)
        {
            var (accessToken, _, _) = await Check_Login(user, TestHttpClient);
            SetAccessToken(accessToken);
        
            var client = new TransactionClient(TestHttpClient);
            var response = await client.CreateTransactionAsync(request);
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
        
            var transaction = response.Result;
            Assert.NotNull(transaction);
            Assert.Equal(request.Credits, transaction.Credits);
            Assert.Equal(request.MobilePayTransactionNumber, transaction.MobilePayTransactionNumber);
            Assert.Equal(TransactionStatus.Pending, transaction.Status);
        
            return (transaction, client);
        }
    
        private async Task<BalanceResponse> Check_Get_Balance(TransactionClient client)
        {
            var response = await client.GetBalanceAsync();
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
            return response.Result;
        }
    
        private async Task Check_Balance_After_Transaction(TransactionClient client, int initialBalance, int transactionCredits)
        {
            var balance = await Check_Get_Balance(client);
            Assert.Equal(initialBalance, balance.CurrentBalance);
            Assert.Equal(transactionCredits, balance.PendingCredits);
        }
    
        private async Task<PagedTransactionResponse> Check_Get_My_Transactions(TransactionClient client, int? page, int? pageSize, TransactionStatus? status, TransactionOrderBy? orderBy, SortOrder? sort, System.DateTimeOffset? fromDate, System.DateTimeOffset? toDate, int? minCredits, int? maxCredits)
        {
            var response = await client.GetMyTransactionsAsync(page, pageSize, status, orderBy, sort, fromDate, toDate, minCredits, maxCredits);
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
            return response.Result;
        }
    
        private async Task<PagedTransactionResponse> Check_Get_All_Transactions(TransactionClient client, int? page, int? pageSize, TransactionStatus? status, TransactionOrderBy? orderBy, SortOrder? sort, System.DateTimeOffset? fromDate, System.DateTimeOffset? toDate, int? minCredits, int? maxCredits)
        {
            var response = await client.GetAllTransactionsAsync(page, pageSize, status, orderBy, sort, fromDate, toDate, minCredits, maxCredits);
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
            return response.Result;
        }
    
        private async Task Check_Accept_Transaction(TransactionClient client, Guid transactionId)
        {
            var response = await client.AcceptTransactionAsync(transactionId);
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
        }

        private async Task Check_Deny_Transaction(TransactionClient client, Guid transactionId)
        {
            var response = await client.DenyTransactionAsync(transactionId);
            Assert.Equal(StatusCodes.Status200OK, response.StatusCode);
        }
    
        private async Task Check_Balance_History_Created(Guid userId, Guid transactionId, int credits)
        {
            var balanceHistory = await PgCtxSetup.DbContextInstance.BalanceHistories
                .FirstOrDefaultAsync(bh => bh.UserId == userId && 
                                           bh.AdditionalId == transactionId &&
                                           bh.Action == BalanceAction.UserBought.ToDbString());
                
            Assert.NotNull(balanceHistory);
            Assert.Equal(credits, balanceHistory.Amount);
        }
        #endregion
    
        [Fact]
        public async Task Create_Transaction_Happy_Path()
        {
            var request = new CreateTransactionRequest { Credits = 1000, MobilePayTransactionNumber = "MP-123456" };
            var (transaction, client) = await Check_Create_Transaction(AuthTestHelper.Users.Player, request);
        
            await Check_Balance_After_Transaction(client, initialBalance: 0, transactionCredits: request.Credits);
        
            var transactions = await Check_Get_My_Transactions(client, 1, 20, null, TransactionOrderBy.Timestamp, SortOrder.Desc, null, null, null, null);
            Assert.Single(transactions.Items);
            Assert.Equal(transaction.Id, transactions.Items.First().Id); 
        }
    
        [Fact]
        public async Task Admin_Review_Transaction_Flow()
        {
            var request = new CreateTransactionRequest { Credits = 1000, MobilePayTransactionNumber = "MP-123456" };
            var (transaction, playerClient) = await Check_Create_Transaction(AuthTestHelper.Users.Player, request);

            var newClient = CreateNewClient();
            var (adminAccessToken, _, _) = await Check_Login(AuthTestHelper.Users.Admin, newClient);
            SetAccessToken(newClient, adminAccessToken);
            var adminClient = new TransactionClient(newClient);

            var adminTransactions = await Check_Get_All_Transactions(adminClient, 1, 20, null, TransactionOrderBy.Timestamp, SortOrder.Desc, null, null, null, null);
            Assert.Contains(adminTransactions.Items, t => t.Id == transaction.Id);

            await Check_Accept_Transaction(adminClient, transaction.Id);

            var finalBalance = await Check_Get_Balance(playerClient);
            Assert.Equal(request.Credits, finalBalance.CurrentBalance);
            Assert.Equal(0, finalBalance.PendingCredits);

            var user = await PgCtxSetup.DbContextInstance.Users.FirstAsync(u => u.Email == AuthTestHelper.Users.Player.Email);
            await Check_Balance_History_Created(user.Id, transaction.Id, request.Credits);
        }
    
        [Fact]
        public async Task Transaction_Query_Filtering()
        {
            var client = new TransactionClient(TestHttpClient);
            var (accessToken, _, _) = await Check_Login(AuthTestHelper.Users.Player, TestHttpClient);
            SetAccessToken(accessToken);
        
            var requests = new[]
            {
                new CreateTransactionRequest { Credits = 500, MobilePayTransactionNumber = "MP-111" },
                new CreateTransactionRequest { Credits = 1000, MobilePayTransactionNumber = "MP-222" },
                new CreateTransactionRequest { Credits = 1500, MobilePayTransactionNumber = "MP-333" }
            };
        
            foreach (var request in requests)
            {
                await Check_Create_Transaction(AuthTestHelper.Users.Player, request);
            }
        
            var result1 = await Check_Get_My_Transactions(client,  1, 20, null, TransactionOrderBy.Timestamp, SortOrder.Desc, null, null, 1000, null);
            Assert.Equal(2, result1.Items.Count);
            Assert.All(result1.Items, item => Assert.True(item.Credits >= 1000));
        
            var result2 = await Check_Get_My_Transactions(client,  1, 20, null, TransactionOrderBy.Credits, SortOrder.Asc, null, null, null, null);
            Assert.Equal(3, result2.Items.Count);
            Assert.Equal(500, result2.Items.First().Credits);
            Assert.Equal(1500, result2.Items.Last().Credits);
        }
    
        [Fact]
        public async Task Transaction_Validation()
        {
            var (accessToken, _, _) = await Check_Login(AuthTestHelper.Users.Player, TestHttpClient);
            SetAccessToken(accessToken);
            var client = new TransactionClient(TestHttpClient);
        
            // Ugyldig credits
            await WebAssert.ThrowsValidationAsync(() => 
                client.CreateTransactionAsync(new CreateTransactionRequest{ Credits = 0, MobilePayTransactionNumber = "MP-123" } ));
            
            await WebAssert.ThrowsValidationAsync(() => 
                client.CreateTransactionAsync(new CreateTransactionRequest{ Credits = 100001, MobilePayTransactionNumber = "MP-123" }));
            
            // Ugyldig mobilepay id
            await WebAssert.ThrowsValidationAsync(() => 
                client.CreateTransactionAsync(new CreateTransactionRequest{ Credits = 1000, MobilePayTransactionNumber = "" }));
            
            await WebAssert.ThrowsValidationAsync(() => 
                client.CreateTransactionAsync(new CreateTransactionRequest{ Credits = 1000, MobilePayTransactionNumber = "Invalid@Number" }));
            
            // Ugyldig query parametre 
            await WebAssert.ThrowsValidationAsync(() => // 0 page, min er 1 
                client.GetMyTransactionsAsync(0, 20, null, TransactionOrderBy.Timestamp, SortOrder.Desc, null, null, 1000, null));
        
            await WebAssert.ThrowsValidationAsync(() => // 101 pageSize, max er 100
                client.GetMyTransactionsAsync(1, 101, null, TransactionOrderBy.Timestamp, SortOrder.Desc, null, null, 1000, null));
            
            await WebAssert.ThrowsValidationAsync(() => // toDate må ikke være før fromDate
                client.GetMyTransactionsAsync(1, 20, null, TransactionOrderBy.Timestamp, SortOrder.Desc, DateTime.UtcNow, DateTime.UtcNow.AddDays(-1), 1000, null));
        }
    
        [Fact]
        public async Task Cannot_Review_Already_Reviewed_Transaction()
        {
            var request = new CreateTransactionRequest { Credits = 1000, MobilePayTransactionNumber = "MP-123456" };
            var (transaction, playerClient) = await Check_Create_Transaction(AuthTestHelper.Users.Player, request);

            var adminHttpClient = CreateNewClient();
            var (adminAccessToken, _, _) = await Check_Login(AuthTestHelper.Users.Admin, adminHttpClient);
            SetAccessToken(adminHttpClient, adminAccessToken);
            var adminClient = new TransactionClient(adminHttpClient);

            await Check_Accept_Transaction(adminClient, transaction.Id);
            var balanceAfterAccept = await Check_Get_Balance(playerClient);
            Assert.Equal(request.Credits, balanceAfterAccept.CurrentBalance);

            // NSwag deserialize ProblemDetails fejl så gør sådan her
            var response = await adminHttpClient.PostAsJsonAsync($"/api/transaction/{transaction.Id}/deny", transaction.Id);
            Assert.Equal(StatusCodes.Status400BadRequest, (int)response.StatusCode);

            var finalBalance = await Check_Get_Balance(playerClient);
            Assert.Equal(request.Credits, finalBalance.CurrentBalance);

            var user = await PgCtxSetup.DbContextInstance.Users.FirstAsync(u => u.Email == AuthTestHelper.Users.Player.Email);
            var history = await PgCtxSetup.DbContextInstance.BalanceHistories
                .Where(bh => bh.UserId == user.Id && bh.AdditionalId == transaction.Id)
                .OrderBy(bh => bh.Timestamp)
                .ToListAsync();

            Assert.Single(history);
            Assert.Equal(BalanceAction.UserBought.ToDbString(), history[0].Action);
        }
        
        [Fact]
        public async Task Can_Deny_Pending_Transaction()
        {
            var request = new CreateTransactionRequest { Credits = 1000, MobilePayTransactionNumber = "MP-123456" };
            var (transaction, playerClient) = await Check_Create_Transaction(AuthTestHelper.Users.Player, request);

            var newClient = CreateNewClient();
            var (adminAccessToken, _, _) = await Check_Login(AuthTestHelper.Users.Admin, newClient);
            SetAccessToken(newClient, adminAccessToken);
            var adminClient = new TransactionClient(newClient);

            await Check_Deny_Transaction(adminClient, transaction.Id);

            var finalBalance = await Check_Get_Balance(playerClient);
            Assert.Equal(0, finalBalance.CurrentBalance);
            Assert.Equal(0, finalBalance.PendingCredits);

            var user = await PgCtxSetup.DbContextInstance.Users.FirstAsync(u => u.Email == AuthTestHelper.Users.Player.Email);
            var history = await PgCtxSetup.DbContextInstance.BalanceHistories
                .Where(bh => bh.UserId == user.Id && bh.AdditionalId == transaction.Id)
                .ToListAsync();
            Assert.Empty(history);
        }
    }
}
