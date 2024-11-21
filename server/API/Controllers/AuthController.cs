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

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<LoginResponse>> Login([FromServices] IValidator<LoginRequest> validator,
                                                         [FromBody] LoginRequest request)
    {
        await validator.ValidateAndThrowAsync(request);
        return Ok(await service.LoginAsync(request));
    }
    
    [Authorize(Roles = Role.Admin)]
    [HttpPost("register")]
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
    
    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<ActionResult<RefreshResponse>> Refresh([FromBody] RefreshRequest request)
    {
        return Ok(await service.RefreshAsync(request));
    }
}