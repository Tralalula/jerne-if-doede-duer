using DataAccess;
using DataAccess.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Service.Exceptions;
using Service.Models.Requests;

namespace Service;

public interface IBoardService
{
    public Task<Board> PlaceBoardBetAsync(BoardPickRequest board, Guid userId);
}

public class BoardService(AppDbContext context, UserManager<User> userManager, TimeProvider timeProvider) : IBoardService
{
    public void ValidateBoard(List<int> numbers)
    {
        int count = numbers.Count;
        if (count < 5 || count > 8)
            throw new BadRequestException("You must pick between 5 and 8 numbers.");

        if (numbers.Any(n => n < 1 || n > 16))
            throw new BadRequestException("Selected numbers must be within the range 1-16.");

        if (numbers.Distinct().Count() != count)
            throw new BadRequestException("Selected numbers must be unique.");
    }

    public async Task<Game> GetActiveGameAsync()
    {
        var currentTime = timeProvider.GetUtcNow().UtcDateTime;

        var game = await context.Games
            .Where(game => game.StartTime <= currentTime && currentTime <= game.EndTime)
            .FirstOrDefaultAsync();

        if (game == null)
            throw new NotFoundException("No active game found at this time.");

        return game;
    }
    
    public int GetBoardPrice(int length)
    {
        return length switch
        {
            5 => 20,
            6 => 40,
            7 => 80,
            8 => 160,
            _ => throw new ArgumentException("Invalid board pick.")
        };
    }

    
    public async Task<Board> PlaceBoardBetAsync(BoardPickRequest board, Guid userId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString()) ?? throw new NotFoundException("User not found");

        board.SelectedNumbers = board.SelectedNumbers.OrderBy(n => n).ToList();
        ValidateBoard(board.SelectedNumbers);

        var game = await GetActiveGameAsync();
        
        var purchase = new Purchase
        {
            Timestamp = timeProvider.GetUtcNow().UtcDateTime,
            Price = GetBoardPrice(board.SelectedNumbers.Count),
        };

        var newBoard = board.ToBoard(user, game, timeProvider, purchase);
        
        using (var transaction = await context.Database.BeginTransactionAsync())
        {
            try
            {
                await context.Boards.AddAsync(newBoard);
                await context.SaveChangesAsync();
                
                purchase.Board = newBoard;
                
                context.Purchases.Add(purchase);
                await context.SaveChangesAsync();

                await transaction.CommitAsync();
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                throw new BadRequestException("Failed to place bet.");
            }
        }
        return new Board();
    }
}