using DataAccess.Models;
using Service.Models;

namespace Service.Users;

public record UsersQuery(int Page = 1, 
                         int PageSize = 20, 
                         UserStatus? Status = null, 
                         string? Search = null, 
                         RoleType? Role = null,
                         UserOrderBy OrderBy = UserOrderBy.Timestamp, 
                         SortOrder Sort = SortOrder.Desc);