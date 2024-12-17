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
    [HttpPost("pick")]
    public async Task<ActionResult<BoardPickResponse>> PickBoard([FromBody] BoardPickRequest request)
    {
        var userId = User.GetUserId();

        return Ok(await service.PlaceBoardBetAsync(request, userId));
    }
    
    [HttpGet("status")]
    public async Task<ActionResult<GameStatusResponse>> GetStatus()
    {
        var userId = User.GetUserId();
        return Ok(await service.GetGameStatusAsync(userId));
    }  
}