using DataAccess.Models;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Service.Auth;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService service) : ControllerBase
{
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LoginResponse>> Login([FromServices] IValidator<LoginRequest> validator,
                                                         [FromBody] LoginRequest request)
    {
        await validator.ValidateAndThrowAsync(request);
        return Ok(await service.LoginAsync(request));
    }
    
    [HttpPost("register")]
    [Authorize(Roles = Role.Admin)]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<RegisterResponse> Register([FromServices] IValidator<RegisterRequest> validator,
                                                 [FromBody] RegisterRequest request) 
    {
        await validator.ValidateAndThrowAsync(request);
        return await service.RegisterAsync(request);
    }
    
    [HttpPost("logout")]
    public async Task<IResult> Logout()
    {
        await service.LogoutAsync();
        return Results.Ok();
    }
    
    [HttpGet("me")]
    public async Task<UserInfoResponse> UserInfo()
    {
        return await service.UserInfoAsync(HttpContext.User); 
    }
}