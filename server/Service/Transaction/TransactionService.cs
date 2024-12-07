using DataAccess;
using DataAccess.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Service.BalanceHistory;
using Service.Exceptions;
using Service.Models;

namespace Service.Transaction;

public interface ITransactionService
{
    Task<BalanceResponse> GetBalanceAsync(Guid userId);
    Task<TransactionResponse> CreateTransactionAsync(Guid userId, CreateTransactionRequest request);
    Task<PagedTransactionResponse> GetUserTransactionsAsync(Guid userId, TransactionsQuery query);
    Task<PagedTransactionResponse> GetTransactionsAsync(TransactionsQuery query);
    Task AcceptTransactionAsync(Guid transactionId, Guid adminId);
    Task DenyTransactionAsync(Guid transactionId, Guid adminId);
}

public class TransactionService(AppDbContext dbContext, ILogger<TransactionService> logger, TimeProvider timeProvider): ITransactionService
{
    public async Task<BalanceResponse> GetBalanceAsync(Guid userId)
    {
        var user = await dbContext.Users.FindAsync(userId) ?? throw new NotFoundException("User not found");
        
        var pendingCredits = await dbContext.Transactions.Where(t => t.UserId == userId && t.Status == TransactionStatus.Pending.ToDbString())
                                                         .SumAsync(t => t.Credits);
        
        return new BalanceResponse(CurrentBalance: user.Credits, PendingCredits: pendingCredits);
    }

    public async Task<TransactionResponse> CreateTransactionAsync(Guid userId, CreateTransactionRequest request)
    {
        var user = await dbContext.Users.FindAsync(userId) ?? throw new NotFoundException("User not found");
        
        if (user.Status == UserStatus.Inactive) throw new BadRequestException("User account is not active");
        
        var transaction = new DataAccess.Models.Transaction
        {
            UserId = userId,
            Credits = request.Credits,
            MobilepayTransactionNumber = request.MobilePayTransactionNumber,
            Status = TransactionStatus.Pending.ToDbString(),
            Timestamp = timeProvider.GetUtcNow().UtcDateTime
        };
        
        await dbContext.Transactions.AddAsync(transaction);
        await dbContext.SaveChangesAsync();
        
        logger.LogInformation("New transaction created. UserId: {UserId}, Credits: {Credits}, MobilePay: {MobilePayId}", userId, request.Credits, request.MobilePayTransactionNumber);
        
        return new TransactionResponse(
            Id: transaction.Id,
            Timestamp: transaction.Timestamp,
            Credits: transaction.Credits,
            MobilePayTransactionNumber: transaction.MobilepayTransactionNumber,
            Status: transaction.Status.ToTransactionStatus()
        );
    }

    public async Task<PagedTransactionResponse> GetUserTransactionsAsync(Guid userId, TransactionsQuery query)
    {
        return await GetPagedTransactionsAsync(dbContext.Transactions.Where(t => t.UserId == userId), query);    }

    public async Task<PagedTransactionResponse> GetTransactionsAsync(TransactionsQuery query)
    {
        return await GetPagedTransactionsAsync(dbContext.Transactions.AsQueryable(), query);
    }

    public async Task AcceptTransactionAsync(Guid transactionId, Guid adminId)
    {
        var transaction = await dbContext.Transactions.FindAsync(transactionId) ?? throw new NotFoundException("Transaction not found");
    
        if (transaction.Status.ToTransactionStatus() != TransactionStatus.Pending) throw new BadRequestException("Transaction has already been reviewed");
    
        var user = await dbContext.Users.FindAsync(transaction.UserId) ?? throw new NotFoundException("User not found");
    
        transaction.Status = TransactionStatus.Accepted.ToDbString();
        transaction.ReviewedByUserId = adminId;
        transaction.ReviewedAt = timeProvider.GetUtcNow().UtcDateTime;
    
        user.Credits += transaction.Credits;
        await dbContext.BalanceHistories.AddAsync(new DataAccess.Models.BalanceHistory
        {
            UserId = user.Id,
            Amount = transaction.Credits,
            Action = BalanceAction.UserBought.ToDbString(),
            Timestamp = timeProvider.GetUtcNow().UtcDateTime,
            AdditionalId = transaction.Id
        });

        await dbContext.SaveChangesAsync();
    }

    public async Task DenyTransactionAsync(Guid transactionId, Guid adminId)
    {
        var transaction = await dbContext.Transactions.FindAsync(transactionId) ?? throw new NotFoundException("Transaction not found");
    
        if (transaction.Status.ToTransactionStatus() != TransactionStatus.Pending) throw new BadRequestException("Transaction has already been reviewed");
    
        transaction.Status = TransactionStatus.Denied.ToDbString();
        transaction.ReviewedByUserId = adminId;
        transaction.ReviewedAt = timeProvider.GetUtcNow().UtcDateTime;
    
        await dbContext.SaveChangesAsync();
    }
    
    private static async Task<PagedTransactionResponse> GetPagedTransactionsAsync(IQueryable<DataAccess.Models.Transaction> baseQuery, TransactionsQuery query)
    {
        // Filter
        if (query.Status.HasValue) baseQuery = baseQuery.Where(t => t.Status == query.Status.Value.ToDbString());
        if (query.FromDate.HasValue) baseQuery = baseQuery.Where(t => t.Timestamp >= query.FromDate.Value);
        if (query.ToDate.HasValue) baseQuery = baseQuery.Where(t => t.Timestamp <= query.ToDate.Value);
        if (query.MinCredits.HasValue) baseQuery = baseQuery.Where(t => t.Credits >= query.MinCredits.Value);
        if (query.MaxCredits.HasValue) baseQuery = baseQuery.Where(t => t.Credits <= query.MaxCredits.Value);
        
        // Order
        baseQuery = query.OrderBy switch
        {
            TransactionOrderBy.Credits => query.Sort == SortOrder.Asc ? baseQuery.OrderBy(t => t.Credits) : baseQuery.OrderByDescending(t => t.Credits),
            TransactionOrderBy.Status => query.Sort == SortOrder.Asc ? baseQuery.OrderBy(t => t.Status) : baseQuery.OrderByDescending(t => t.Status),
            _ => query.Sort == SortOrder.Asc ? baseQuery.OrderBy(t => t.Timestamp) : baseQuery.OrderByDescending(t => t.Timestamp),
        };
        
        // Pagination
        var totalItems = await baseQuery.CountAsync();
        
        var items = await baseQuery.Skip((query.Page - 1) * query.PageSize)
                                   .Take(query.PageSize)
                                   .Select(t => new TransactionDetailsResponse(
                                           t.Id, 
                                           t.Timestamp, 
                                           t.Credits, 
                                           t.MobilepayTransactionNumber, 
                                           t.Status.ToTransactionStatus(), 
                                           t.ReviewedByUserId, 
                                           t.ReviewedAt))
                                   .ToListAsync();
                                   
        var pagingInfo = new PagingInfo
        {
            CurrentPage = query.Page,
            ItemsPerPage = query.PageSize,
            TotalItems = totalItems
        };

        return new PagedTransactionResponse(items, pagingInfo);
    }
}