using DataAccess.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service;
using Service.Boards;
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
    
    [Authorize(Roles = Role.Admin)]
    [HttpPost("winner-sequence/confirm")]
    public async Task<ActionResult<BoardWinningSequenceConfirmedResponse>> ConfirmWinningSequence([FromBody] BoardWinningSequenceRequest request)
    {
        var adminId = User.GetUserId();
        return Ok(await service.ConfirmWinningSequence(request, adminId));
    }
    
    [Authorize(Roles = Role.Admin)]
    [HttpGet("winner-sequence")]
    public async Task<ActionResult<BoardWinningSequenceResponse>> PickWinningSequenceAsync([FromQuery] string numbers)
    {
        if (string.IsNullOrEmpty(numbers))
            return BadRequest("Numbers are required.");

        var selectedNumbers = numbers
            .Split(',')
            .Select(n => int.Parse(n))
            .ToList();

        var adminId = User.GetUserId();
        return Ok(await service.PickWinningSequenceAsync(BoardWinningSequenceRequest.FromNumbers(selectedNumbers), adminId));
    }
    
    [HttpGet("history")]
    public async Task<ActionResult<BoardPagedHistoryResponse>> GetBoardHistory([FromQuery] BoardHistoryQuery query)
    {
        var userId = User.GetUserId();
        return Ok(await service.GetBoardHistory(userId, query));
    } 
}