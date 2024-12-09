using Microsoft.AspNetCore.Mvc;
using Service.Interfaces;
using Service.Models.Requests;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BoardController(IBoardService service): ControllerBase
{
    [HttpPost("board/pick")]
    public async Task<IResult> PickBoard([FromBody] BoardPickRequest request)
    {
        await service.PlaceBoardBet(request);
        return Results.Ok();
    }
    
}