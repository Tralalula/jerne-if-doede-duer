using Service.Models;

namespace Service.BalanceHistory;

public record BalanceHistoryEntryResponse(Guid Id, 
                                          DateTime Timestamp,
                                          Guid UserId, 
                                          int Amount, 
                                          BalanceAction Action); 

public record PagedBalanceHistoryResponse(List<BalanceHistoryEntryResponse> Items, PagingInfo PagingInfo);