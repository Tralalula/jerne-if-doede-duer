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
    [HttpGet("history")]
    public async Task<ActionResult<GameHistoryPagedResponse>> PickBoard([FromQuery] GameHistoryQuery query)
    {
        var userId = User.GetUserId();
        return Ok(await service.GetBoardsHistory(userId, query));
    }

}