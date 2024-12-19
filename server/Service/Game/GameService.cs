using DataAccess;
using DataAccess.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Service.Exceptions;
using Service.Models;
using Service.Models.Responses;
using Service.Transaction;

namespace Service;

public interface IGameService
{
    Task<GameHistoryPagedResponse> GetBoardsHistory(Guid userId, GameHistoryQuery query);
    
    Task<GameHistoryResponse> GetGameBoardHistoryAsync(Guid userId, Guid gameId, GameHistoryQuery query);
}

public class GameService(AppDbContext context, UserManager<User> userManager) : IGameService
{
    private bool AreNumbersMatching(List<int> boardNumbers, List<int> selectedNumbers)
    {
        if (boardNumbers == null || selectedNumbers == null || !boardNumbers.Any())
            return false;

        return selectedNumbers.All(selectedNumber => boardNumbers.Contains(selectedNumber));
    }
    
    public async Task<GameHistoryPagedResponse> GetBoardsHistory(Guid userId, GameHistoryQuery query)
    {
        var user = await userManager.FindByIdAsync(userId.ToString()) 
                   ?? throw new NotFoundException("Bruger ikke fundet");

        var gamesQuery = context.Games.AsQueryable();

        if (query.FromDate.HasValue) 
        {
            var fromDateTime = DateTime.SpecifyKind(
                query.FromDate.Value.ToDateTime(TimeOnly.MinValue), 
                DateTimeKind.Utc
            );
            gamesQuery = gamesQuery.Where(t => t.Timestamp >= fromDateTime);
        }

        if (query.ToDate.HasValue)
        {
            var toDateTime = DateTime.SpecifyKind(
                query.ToDate.Value.ToDateTime(TimeOnly.MaxValue), 
                DateTimeKind.Utc
            );
            gamesQuery = gamesQuery.Where(t => t.Timestamp <= toDateTime);
        }

        var totalItems = await gamesQuery.CountAsync();

        gamesQuery = query.Sort == SortOrder.Asc ? gamesQuery.OrderBy(h => h.Timestamp) : gamesQuery.OrderByDescending(h => h.Timestamp);
        
        var paginatedGames = await gamesQuery
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Include(g => g.Boards)
                .ThenInclude(b => b.Purchase)
            .ToListAsync();


        var gameResponses = paginatedGames.Select(GameResponse.FromEntity).ToList();
        
        var pagingInfo = new PagingInfo
        {
            CurrentPage = query.Page,
            ItemsPerPage = query.PageSize,
            TotalItems = totalItems
        };

        return GameHistoryPagedResponse.FromEntity(gameResponses, pagingInfo);
    }

    public async Task<GameHistoryResponse> GetGameBoardHistoryAsync(Guid userId, Guid gameId, GameHistoryQuery query)
    {
        var user = await userManager.FindByIdAsync(userId.ToString()) 
                   ?? throw new NotFoundException("Bruger ikke fundet.");

        var game = await context.Games
            .Include(g => g.Boards)
            .ThenInclude(b => b.Purchase)
            .FirstOrDefaultAsync(g => g.Id == gameId);

        if (game == null)
            throw new NotFoundException("Spil blev ikke fundet.");

        var winnerSequence = await context.WinnerSequences
            .Where(ws => ws.GameId == game.Id)
            .Select(ws => ws.Sequence)
            .FirstOrDefaultAsync() ?? new List<int>();

        var totalWinAmount = game.Active ? 0 : game.Boards
            .Where(board => AreNumbersMatching(board.Configuration, winnerSequence))
            .Sum(board => board.Purchase.Price);

        var totalBoards = game.Boards.Count;
        var paginatedBoards = game.Boards
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(board =>
            {
                var wasWin = game.Active ? false : AreNumbersMatching(board.Configuration, winnerSequence);
                return BoardGameHistoryResponse.ToResponse(board, wasWin);
            })
            .ToList();

        var boardHistoryPagedResponse = BoardHistoryPagedResponse.ToResponse(paginatedBoards, new PagingInfo
        {
            CurrentPage = query.Page,
            ItemsPerPage = query.PageSize,
            TotalItems = totalBoards
        });

        return GameHistoryResponse.FromEntity(game, totalWinAmount, boardHistoryPagedResponse, winnerSequence);
    }
}