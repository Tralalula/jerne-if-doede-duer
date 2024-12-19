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
    public Task<GameHistoryPagedResponse> GetBoardsHistory(Guid userId, GameHistoryQuery query);
}

public class GameService(AppDbContext context, UserManager<User> userManager) : IGameService
{
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
}