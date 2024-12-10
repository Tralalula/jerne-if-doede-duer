using DataAccess.Models;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Security;
using Service.Users;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController(IUsersService userService) : ControllerBase
{
    [Authorize(Roles = Role.Admin)]
    [HttpGet]
    public async Task<ActionResult<PagedUserResponse>> GetUsers([FromServices] IValidator<UsersQuery> validator, 
                                                                [FromQuery] UsersQuery query)
    {
        await validator.ValidateAndThrowAsync(query);
        return Ok(await userService.GetUsersAsync(query));
    }

    [Authorize(Roles = Role.Admin)]
    [HttpPost("{id:guid}/activate")]
    public async Task<ActionResult<UserDetailsResponse>> ActivateUser(Guid id)
    {
        var adminId = User.GetUserId();
        return Ok(await userService.UpdateUserStatusAsync(id, UserStatus.Active, adminId));
    }

    [Authorize(Roles = Role.Admin)]
    [HttpPost("{id:guid}/deactivate")]
    public async Task<ActionResult<UserDetailsResponse>> DeactivateUser(Guid id)
    {
        var adminId = User.GetUserId();
        return Ok(await userService.UpdateUserStatusAsync(id, UserStatus.Inactive, adminId));
    }
}