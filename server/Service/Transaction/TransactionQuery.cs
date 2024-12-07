using Service.Models;

namespace Service.Transaction;

public record TransactionsQuery(int Page = 1, 
                                int PageSize = 20, 
                                TransactionStatus? Status = null, 
                                TransactionOrderBy OrderBy = TransactionOrderBy.Timestamp, 
                                SortOrder Sort = SortOrder.Desc, 
                                DateTime? FromDate = null, 
                                DateTime? ToDate = null, 
                                int? MinCredits = null, 
                                int? MaxCredits = null);