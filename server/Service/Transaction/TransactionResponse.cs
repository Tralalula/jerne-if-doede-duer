using Service.Models;

namespace Service.Transaction;

public record TransactionResponse(Guid Id, DateTime Timestamp, int Credits, string MobilePayTransactionNumber, TransactionStatus Status);

public record BalanceResponse(int CurrentBalance, int PendingCredits);

public record TransactionDetailsResponse(Guid Id, 
                                         DateTime Timestamp,
                                         int Credits,
                                         string MobilePayTransactionNumber,
                                         TransactionStatus Status,
                                         Guid? ReviewedByUserId,
                                         DateTime? ReviewedAt);

public record PagedTransactionResponse(List<TransactionDetailsResponse> Items, PagingInfo PagingInfo);