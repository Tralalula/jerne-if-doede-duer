using Service.Models;

namespace Service.BalanceHistory;

public record BalanceHistoryQuery(int Page = 1, 
                                  int PageSize = 20, 
                                  BalanceAction? Action = null, 
                                  DateOnly? FromDate = null, 
                                  DateOnly? ToDate = null, 
                                  SortOrder Sort = SortOrder.Desc);