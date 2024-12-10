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
    
    public async Task<Board> PlaceBoardBetAsync(BoardPickRequest board, Guid userId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString()) ?? throw new NotFoundException("User not found");

        board.SelectedNumbers = board.SelectedNumbers.OrderBy(n => n).ToList();
        ValidateBoard(board.SelectedNumbers);

        var game = await GetActiveGameAsync();
        
        // klar til at spille
        int boardNumbers = int.Parse(string.Join("", board.SelectedNumbers));

        var purchase = board.ToPurchase();
        
        
        // log til købshistorik

        await context.SaveChangesAsync();
        return new Board();
    }
}