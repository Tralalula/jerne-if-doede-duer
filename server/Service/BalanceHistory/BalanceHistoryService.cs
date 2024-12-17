using DataAccess;
using Microsoft.EntityFrameworkCore;
using Service.Exceptions;
using Service.Models;

namespace Service.BalanceHistory;

public interface IBalanceHistoryService
{
    Task<PagedBalanceHistoryResponse> GetUserBalanceHistoryAsync(Guid userId, BalanceHistoryQuery query);
    Task<PagedBalanceHistoryResponse> GetBalanceHistoryAsync(BalanceHistoryQuery query);
}

public class BalanceHistoryService(AppDbContext dbContext) : IBalanceHistoryService
{
    public async Task<PagedBalanceHistoryResponse> GetUserBalanceHistoryAsync(Guid userId, BalanceHistoryQuery query)
    {
        if (!await dbContext.Users.AnyAsync(u => u.Id == userId)) throw new NotFoundException("User not found");

        return await GetPagedBalanceHistoryAsync(dbContext.BalanceHistories.Where(h => h.UserId == userId), query);
    }

    public async Task<PagedBalanceHistoryResponse> GetBalanceHistoryAsync(BalanceHistoryQuery query)
    {
        return await GetPagedBalanceHistoryAsync(dbContext.BalanceHistories.AsQueryable(), query);
    }

    private static async Task<PagedBalanceHistoryResponse> GetPagedBalanceHistoryAsync(IQueryable<DataAccess.Models.BalanceHistory> baseQuery,
                                                                                       BalanceHistoryQuery query)
    {
        // Filter
        if (query.Action.HasValue) baseQuery = baseQuery.Where(h => h.Action == query.Action.Value.ToDbString());

        if (query.FromDate.HasValue)
        {
            var fromDateTime = DateTime.SpecifyKind(query.FromDate.Value.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc);
            baseQuery = baseQuery.Where(h => h.Timestamp >= fromDateTime);
        }

        if (query.ToDate.HasValue)
        {
            var toDateTime = DateTime.SpecifyKind(query.ToDate.Value.ToDateTime(TimeOnly.MaxValue), DateTimeKind.Utc);
            baseQuery = baseQuery.Where(h => h.Timestamp <= toDateTime);
        }
        
        // Order
        baseQuery = query.Sort == SortOrder.Asc ? baseQuery.OrderBy(h => h.Timestamp) : baseQuery.OrderByDescending(h => h.Timestamp);

        // Pagination
        var totalItems = await baseQuery.CountAsync();
        
        var items = await baseQuery
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .Select(h => new BalanceHistoryEntryResponse(
                h.Id,
                h.Timestamp,
                h.UserId,
                h.Amount,
                h.Action.ToBalanceAction()))
            .ToListAsync();

        var pagingInfo = new PagingInfo
        {
            CurrentPage = query.Page,
            ItemsPerPage = query.PageSize,
            TotalItems = totalItems
        };
        
        return new PagedBalanceHistoryResponse(items, pagingInfo);
    }
}