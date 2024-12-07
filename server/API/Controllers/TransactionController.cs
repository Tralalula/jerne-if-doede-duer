using DataAccess.Models;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Security;
using Service.Transaction;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TransactionController(ITransactionService transactionService) : ControllerBase
{
    [HttpGet("balance")]
    public async Task<ActionResult<BalanceResponse>> GetBalance()
    {
        var userId = User.GetUserId();
        return Ok(await transactionService.GetBalanceAsync(userId));
    }
    
    [HttpPost]
    public async Task<ActionResult<TransactionResponse>> CreateTransaction([FromServices] IValidator<CreateTransactionRequest> validator, 
                                                                   [FromBody] CreateTransactionRequest request)
    {
        await validator.ValidateAndThrowAsync(request);
        var userId = User.GetUserId();
        return Ok(await transactionService.CreateTransactionAsync(userId, request));
    }
    
    [HttpGet("my")]
    public async Task<ActionResult<PagedTransactionResponse>> GetMyTransactions([FromServices] IValidator<TransactionsQuery> validator,
                                                                                [FromQuery] TransactionsQuery query)
    {
        await validator.ValidateAndThrowAsync(query);
        var userId = User.GetUserId();
        return Ok(await transactionService.GetUserTransactionsAsync(userId, query));
    }
    
    [Authorize(Roles = Role.Admin)]
    [HttpGet("all")]
    public async Task<ActionResult<PagedTransactionResponse>> GetAllTransactions([FromServices] IValidator<TransactionsQuery> validator,
                                                                                     [FromQuery] TransactionsQuery query)
    {
        await validator.ValidateAndThrowAsync(query);
        return Ok(await transactionService.GetTransactionsAsync(query));
    }
    
    [Authorize(Roles = Role.Admin)]
    [HttpPost("{id}/accept")]
    public async Task<ActionResult> AcceptTransaction(Guid id)
    {
        var adminId = User.GetUserId();
        await transactionService.AcceptTransactionAsync(id, adminId);
        return Ok();
    }

    [Authorize(Roles = Role.Admin)]
    [HttpPost("{id}/deny")]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult> DenyTransaction(Guid id)
    {
        var adminId = User.GetUserId();
        await transactionService.DenyTransactionAsync(id, adminId);
        return Ok();
    }
}