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
    public async Task<ActionResult<GamePagedResponse>> PickBoard([FromQuery] GameHistoryQuery query)
    {
        var userId = User.GetUserId();
        return Ok(service.GetBoardsHistory(userId, query));
    }

}