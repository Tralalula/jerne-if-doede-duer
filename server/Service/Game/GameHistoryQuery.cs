using Service.Models;

namespace Service;

public record GameHistoryQuery(int Page = 1, 
                                int PageSize = 20, 
                                DateOnly? FromDate = null, 
                                DateOnly? ToDate = null,
                                SortOrder Sort = SortOrder.Desc);