using DataAccess.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service;
using Service.Models.Requests;
using Service.Models.Responses;
using Service.Security;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GameController(IGameService service) : ControllerBase
{
    [Authorize(Roles = Role.Admin)]
    [HttpGet("history")]
    public async Task<ActionResult<GameHistoryPagedResponse>> GetHistory([FromQuery] GameHistoryQuery query)
    {
        var userId = User.GetUserId();
        return Ok(await service.GetBoardsHistory(userId, query));
    }
    
    [Authorize(Roles = Role.Admin)]
    [HttpGet("history/{gameId:guid}")]
    public async Task<ActionResult<GameHistoryResponse>> GetGameBoardHistory(Guid gameId, [FromQuery] GameHistoryQuery query)
    {
        var userId = User.GetUserId();
        return Ok(await service.GetGameBoardHistoryAsync(userId, gameId, query));
    }

}