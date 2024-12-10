using Service.Models;

namespace Service.BalanceHistory;

public record BalanceHistoryEntryResponse(Guid Id, 
                                          DateTime Timestamp, 
                                          int Amount, 
                                          BalanceAction Action); 

public record PagedBalanceHistoryResponse(List<BalanceHistoryEntryResponse> Items, PagingInfo PagingInfo);