using System.Diagnostics;
using DataAccess;
using DataAccess.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using Service.BalanceHistory;
using Service.Transaction;

namespace Service;

public class DbSeeder(
    ILogger<DbSeeder> logger,
    AppDbContext context,
    UserManager<User> userManager,
    RoleManager<Role> roleManager,
    TimeProvider timeProvider)
{
    public async Task SeedAsync()
    {
        await context.Database.EnsureDeletedAsync();
        await context.Database.EnsureCreatedAsync();
        
        await CreateRoles(Role.All);
        await CreateUser(email: "admin@example.com", password: "Kakao1234!", role: Role.Admin, "Poul", "Henriksen");
        await CreateUser(email: "player@example.com", password: "Pepsitwist69!", role: Role.Player, "Jørgen", "Jensen");
        
        var admin = await userManager.FindByEmailAsync("admin@example.com");
        var player = await userManager.FindByEmailAsync("player@example.com");

        Debug.Assert(player != null, nameof(player) + " != null");
        Debug.Assert(admin != null, nameof(admin) + " != null");
        
        await SeedTransactionsAsync(player.Id, admin.Id);
        var game = await SeedGameAsync();
        var purchases = await SeedPurchasesAsync();
        
        await SeedBoardsAsync(game, admin, purchases);
    }
    
    private async Task CreateRoles(params string[] roles)
    {
        foreach (string role in roles)
        {
            if (await roleManager.RoleExistsAsync(role)) continue;
            
            await roleManager.CreateAsync(new Role(role));
        }
    }
    
    private async Task CreateUser(string email, string password, string role, String firstName, String lastName)
    {
        if (await userManager.FindByEmailAsync(email) != null) return;
        
        var user = new User
        {
            UserName = email,
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            EmailConfirmed = true
        };
        
        var result = await userManager.CreateAsync(user, password);
        
        if (!result.Succeeded)
        {
            foreach (var error in result.Errors)
            {
                logger.LogWarning("{Code}: {Description}", error.Code, error.Description);
            }
        }
        
        await userManager.AddToRoleAsync(user, role);
    }
    
    private async Task SeedTransactionsAsync(Guid playerId, Guid adminId)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        
        var transactions = new[]
        {
            // Accepted
            new DataAccess.Models.Transaction
            {
                UserId = playerId,
                Credits = 100,
                MobilepayTransactionNumber = "MP-123456",
                Status = TransactionStatus.Pending.ToDbString(),
                Timestamp = now.AddDays(-1)
            },
            new DataAccess.Models.Transaction
            {
                UserId = playerId,
                Credits = 200,
                MobilepayTransactionNumber = "MP-234567",
                Status = TransactionStatus.Pending.ToDbString(),
                Timestamp = now.AddHours(-12)
            },
            
            // Accepted 
            new DataAccess.Models.Transaction
            {
                UserId = playerId,
                Credits = 500,
                MobilepayTransactionNumber = "MP-345678",
                Status = TransactionStatus.Accepted.ToDbString(),
                Timestamp = now.AddDays(-5),
                ReviewedByUserId = adminId,
                ReviewedAt = now.AddDays(-5).AddHours(2)
            },
            new DataAccess.Models.Transaction
            {
                UserId = playerId,
                Credits = 1000,
                MobilepayTransactionNumber = "MP-456789",
                Status = TransactionStatus.Accepted.ToDbString(),
                Timestamp = now.AddDays(-10),
                ReviewedByUserId = adminId,
                ReviewedAt = now.AddDays(-10).AddHours(1)
            },
            
            // Denied 
            new DataAccess.Models.Transaction
            {
                UserId = playerId,
                Credits = 50,
                MobilepayTransactionNumber = "MP-567890",
                Status = TransactionStatus.Denied.ToDbString(),
                Timestamp = now.AddDays(-7),
                ReviewedByUserId = adminId,
                ReviewedAt = now.AddDays(-7).AddHours(3)
            }
        };
        
        var balanceHistories = transactions
            .Where(t => t.Status == TransactionStatus.Accepted.ToDbString())
            .Select(t => new DataAccess.Models.BalanceHistory
            {
                UserId = t.UserId,
                Amount = t.Credits,
                Action = BalanceAction.UserBought.ToDbString(),
                Timestamp = t.ReviewedAt!.Value,
                AdditionalId = t.Id
            })
            .ToList();
            
        var totalAcceptedCredits = transactions.Where(t => t.Status == TransactionStatus.Accepted.ToDbString())
                                               .Sum(t => t.Credits);
                                               
        var player = await userManager.FindByIdAsync(playerId.ToString());
        if (player != null)
        {
            player.Credits = totalAcceptedCredits;
            await userManager.UpdateAsync(player);
        }
        
        await context.Transactions.AddRangeAsync(transactions);
        await context.BalanceHistories.AddRangeAsync(balanceHistories);
    }

    private async Task<Game> SeedGameAsync()
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        
        var testGame = new Game
        {
            StartTime = now - TimeSpan.FromDays(1),
            EndTime = now + TimeSpan.FromDays(1),
            Id = Guid.NewGuid(),
            FieldCount = 47,
            Active = true
        };
        
        await context.Games.AddAsync(testGame);
        await context.SaveChangesAsync();

        return testGame;
    }
    
    private async Task<Purchase> SeedPurchasesAsync()
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        
        var purchase = new Purchase
        {
            Id = Guid.NewGuid(),
            Timestamp = now,
            Price = 30
        };
        
        await context.Purchases.AddAsync(purchase);
        await context.SaveChangesAsync();

        return purchase;
    }
    
    private async Task SeedBoardsAsync(Game game, User user, Purchase purchase)
    {
        var now = timeProvider.GetUtcNow().UtcDateTime;
        
        var boards = new List<Board>
        {
            new Board
            {
                Id = Guid.NewGuid(),
                Game = game,
                GameId = game.Id,
                UserId = user.Id,
                Timestamp = now,
                Configuration = new List<int> { 2, 9, 11, 13, 14, 15, 16 },
                PurchaseId = purchase.Id
            },
            new Board
            {
                Id = Guid.NewGuid(),
                Game = game,
                GameId = game.Id,
                UserId = user.Id,
                Timestamp = DateTime.UtcNow,
                Configuration = new List<int> { 4, 5, 6, 7, 9, 16 },
                PurchaseId = purchase.Id
            },
            new Board
            {
                Id = Guid.NewGuid(),
                Game = game,
                GameId = game.Id,
                UserId = user.Id,
                Timestamp = now,
                Configuration = new List<int> { 1, 4, 8, 10, 11 },
                PurchaseId = purchase.Id
            }
        };

        context.Boards.AddRange(boards);
        await context.SaveChangesAsync();
    }
}