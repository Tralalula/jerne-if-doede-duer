using Microsoft.AspNetCore.Mvc;
using Service;
using Service.Models.Requests;
using Service.Models.Responses;
using Service.Security;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BoardController(IBoardService service): ControllerBase
{
    [HttpPost("board/pick")]
    public async Task<ActionResult<BoardPickResponse>> PickBoard([FromBody] BoardPickRequest request)
    {
        var userId = User.GetUserId();

        return Ok(await service.PlaceBoardBetAsync(request, userId));
    }
}