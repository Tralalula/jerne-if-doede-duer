using DataAccess;
using DataAccess.Models;
using FluentValidation;
using FluentValidation.Results;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Service.Email;
using Service.Exceptions;
using Service.Models;

namespace Service.Users;

public interface IUsersService
{
    Task<UserDetailsResponse> GetUserAsync(Guid userId); 
    Task<PagedUserResponse> GetUsersAsync(UsersQuery query);
    Task<UserDetailsResponse> UpdateUserStatusAsync(Guid userId, UserStatus status, Guid adminId);
    Task<UserDetailsResponse> UpdateUserAsync(Guid userId, UpdateUserRequest request, Guid adminId);
}

public class UsersService(AppDbContext dbContext, UserManager<User> userManager, ILogger<UsersService> logger, IEmailService emailService) : IUsersService
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

    public async Task<UserDetailsResponse> UpdateUserAsync(Guid userId, UpdateUserRequest request, Guid adminId)
    {
        var user = await userManager.FindByIdAsync(userId.ToString()) ?? throw new NotFoundException("User not found");
        
        if (!string.IsNullOrEmpty(request.Email) && !request.Email.Equals(user.Email, StringComparison.OrdinalIgnoreCase))
        {
            var existingUser = await userManager.FindByEmailAsync(request.Email);
            if (existingUser != null && existingUser.Id != user.Id)
            {
                throw new ConflictException("This email is already in use.");
            }
        }
        
        var oldEmail = user.Email;
        
        user.FirstName = request.FirstName;
        user.LastName = request.LastName;
        user.PhoneNumber = request.PhoneNumber;
        
        if (!string.IsNullOrEmpty(request.Email) && !request.Email.Equals(user.Email, StringComparison.OrdinalIgnoreCase))
        {
            user.Email = request.Email;
            user.UserName = request.Email;
            user.EmailConfirmed = true;
        }
        
        var result = await userManager.UpdateAsync(user);
        if (!result.Succeeded)
        {
            var errors = result.Errors.Select(e => e.Description).ToList();
            logger.LogWarning("Failed to update user. UserId: {UserId}, AdminId: {AdminId}, Errors: {Errors}", userId, adminId, string.Join(", ", errors));
            throw new ValidationException("Failed to update user profile.", result.Errors.Select(e => new ValidationFailure(e.Code, e.Description)).ToList());
        }
        
        logger.LogInformation("User updated by Admin. UserId: {UserId}, AdminId: {AdminId}", userId, adminId);
        
        if (!string.IsNullOrEmpty(request.Email) && !request.Email.Equals(oldEmail, StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                if (!string.IsNullOrEmpty(oldEmail)) await emailService.SendEmailChangeNotificationAsync(oldEmail, request.Email);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Failed to send email change notification. UserId: {UserId}", userId);
            }
        }
        
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