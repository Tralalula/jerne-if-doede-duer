using DataAccess.Models;
using FluentValidation;
using Microsoft.AspNetCore.Authorization;
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
        return Ok(await service.LoginAsync(Response.Cookies, request));
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
        await service.LogoutAsync(Request.Cookies, Response.Cookies);
        return Results.Ok();
    }
    
    [HttpGet("me")]
    public async Task<UserInfoResponse> UserInfo()
    {
        return await service.UserInfoAsync(HttpContext.User); 
    }
    
    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<ActionResult<RefreshResponse>> Refresh()
    {
        return Ok(await service.RefreshAsync(Request.Cookies, Response.Cookies));
    }
    
    [AllowAnonymous]
    [HttpGet("verify-email")]
    public async Task<IActionResult> VerifyEmail([FromQuery] string token, [FromQuery] string email)
    {
        var success = await service.VerifyEmailAsync(token, email);
        return success ? Ok("Email confirmed successfully!") : BadRequest("Email confirmation failed.");
    }
}