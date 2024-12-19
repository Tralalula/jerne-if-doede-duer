using Service.Models;

namespace Service.Boards;

public record BoardHistoryQuery(int Page = 1, 
            int PageSize = 20, 
            DateOnly? FromDate = null, 
            DateOnly? ToDate = null, 
            SortOrder Sort = SortOrder.Desc);