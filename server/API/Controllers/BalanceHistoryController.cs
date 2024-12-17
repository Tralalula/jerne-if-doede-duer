using DataAccess.Models;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.BalanceHistory;
using Service.Security;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BalanceHistoryController(IBalanceHistoryService balanceHistoryService) : ControllerBase
{
    [HttpGet("my")]
    public async Task<ActionResult<PagedBalanceHistoryResponse>> GetMyBalanceHistory([FromServices] IValidator<BalanceHistoryQuery> validator, 
                                                                                     [FromQuery] BalanceHistoryQuery query)
    {
        await validator.ValidateAndThrowAsync(query);
        var userId = User.GetUserId();
        return Ok(await balanceHistoryService.GetUserBalanceHistoryAsync(userId, query));
    }

    [Authorize(Roles = Role.Admin)]
    [HttpGet("users/{userId:guid}")]
    public async Task<ActionResult<PagedBalanceHistoryResponse>> GetUserBalanceHistory([FromServices] IValidator<BalanceHistoryQuery> validator, 
                                                                                       Guid userId, [FromQuery] BalanceHistoryQuery query)
    {
        await validator.ValidateAndThrowAsync(query);
        return Ok(await balanceHistoryService.GetUserBalanceHistoryAsync(userId, query));
    }

    [Authorize(Roles = Role.Admin)]
    [HttpGet("all")]
    public async Task<ActionResult<PagedBalanceHistoryResponse>> GetAllBalanceHistory([FromServices] IValidator<BalanceHistoryQuery> validator, 
                                                                                      [FromQuery] BalanceHistoryQuery query)
    {
        await validator.ValidateAndThrowAsync(query);
        return Ok(await balanceHistoryService.GetBalanceHistoryAsync(query));
    }
}