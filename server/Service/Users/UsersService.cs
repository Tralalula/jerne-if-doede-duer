using DataAccess;
using DataAccess.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Service.Exceptions;
using Service.Models;

namespace Service.Users;

public interface IUsersService
{
    Task<UserDetailsResponse> GetUserAsync(Guid userId); 
    Task<PagedUserResponse> GetUsersAsync(UsersQuery query);
    Task<UserDetailsResponse> UpdateUserStatusAsync(Guid userId, UserStatus status, Guid adminId);
}

public class UsersService(AppDbContext dbContext, UserManager<User> userManager, ILogger<UsersService> logger) : IUsersService
{
    public async Task<UserDetailsResponse> GetUserAsync(Guid userId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString()) ?? throw new NotFoundException("User not found");
    
        var roles = await userManager.GetRolesAsync(user);
        return new UserDetailsResponse(
            user.Id,
            user.Email ?? "",
            user.PhoneNumber ?? "",
            user.Status,
            user.Credits,
            user.Timestamp,
            roles.ToList());
    }

    public async Task<PagedUserResponse> GetUsersAsync(UsersQuery query)
    {
        var baseQuery = userManager.Users.AsQueryable();

        // Filter
        if (query.Status.HasValue) baseQuery = baseQuery.Where(u => u.Status == query.Status.Value);
        
        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var search = query.Search.Trim().ToLower();
            baseQuery = baseQuery.Where(u => u.Email != null && (EF.Functions.ILike(u.Email, $"%{search}%") || 
                                       (u.PhoneNumber != null && EF.Functions.ILike(u.PhoneNumber, $"%{search}%")))
            );
        }
        
        if (query.Role.HasValue)
        {
            var roleString = query.Role.Value.ToDbString();
            var usersInRole = await userManager.GetUsersInRoleAsync(roleString);
            var userIds = usersInRole.Select(u => u.Id);
            baseQuery = baseQuery.Where(u => userIds.Contains(u.Id));
        }

        // Order
        baseQuery = query.OrderBy switch
        {
            UserOrderBy.Email => query.Sort == SortOrder.Asc ? baseQuery.OrderBy(u => u.Email) : baseQuery.OrderByDescending(u => u.Email),
            UserOrderBy.Credits => query.Sort == SortOrder.Asc ? baseQuery.OrderBy(u => u.Credits) : baseQuery.OrderByDescending(u => u.Credits),
            UserOrderBy.Status => query.Sort == SortOrder.Asc ? baseQuery.OrderBy(u => u.Status) : baseQuery.OrderByDescending(u => u.Status),
            _ => query.Sort == SortOrder.Asc ? baseQuery.OrderBy(u => u.Timestamp) : baseQuery.OrderByDescending(u => u.Timestamp)
        };

        // Pagination
        var totalItems = await baseQuery.CountAsync();
        
        var users = await baseQuery
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync();

        var items = new List<UserDetailsResponse>();
        foreach (var user in users)
        {
            var roles = await userManager.GetRolesAsync(user);
            items.Add(new UserDetailsResponse(user.Id, 
                                              user.Email ?? "", 
                                              user.PhoneNumber ?? "",
                                              user.Status, 
                                              user.Credits, 
                                              user.Timestamp, 
                                              roles.ToList()));
        }
        
        var pagingInfo = new PagingInfo
        {
            CurrentPage = query.Page,
            ItemsPerPage = query.PageSize,
            TotalItems = totalItems
        };
        
        return new PagedUserResponse(items, pagingInfo);
    }

    public async Task<UserDetailsResponse> UpdateUserStatusAsync(Guid userId, UserStatus status, Guid adminId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString()) ?? throw new NotFoundException("User not found");

        user.Status = status;
        await dbContext.SaveChangesAsync();

        logger.LogInformation("User status updated. UserId: {UserId}, NewStatus: {Status}, AdminId: {AdminId}", userId, status, adminId);

        var roles = await userManager.GetRolesAsync(user);
        return new UserDetailsResponse(user.Id, 
                                       user.Email ?? "", 
                                       user.PhoneNumber ?? "", 
                                       user.Status, 
                                       user.Credits, 
                                       user.Timestamp, 
                                       roles.ToList());
    }
}