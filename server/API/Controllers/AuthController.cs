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
    public async Task<IActionResult> VerifyEmail([FromServices] IValidator<VerifyEmailQuery> validator,
                                                 [FromQuery] VerifyEmailQuery query)
    {
        await validator.ValidateAndThrowAsync(query);
        var success = await service.VerifyEmailAsync(query.Token, query.Email);
        return success ? Ok("Email confirmed successfully!") : BadRequest("Email confirmation failed.");
    }
    
    [AllowAnonymous]
    [HttpPost("forgot-password")]
    [ProducesResponseType(StatusCodes.Status429TooManyRequests)]
    public async Task<IActionResult> InitiatePasswordReset([FromServices] IValidator<ForgotPasswordRequest> validator, 
                                                           [FromBody] ForgotPasswordRequest request)
    {
        await validator.ValidateAndThrowAsync(request);
        await service.InitiatePasswordResetAsync(request.Email);
        return Ok();
    }
    
    [AllowAnonymous]
    [HttpPost("verify-reset-code")]
    public async Task<IActionResult> VerifyResetCode([FromServices] IValidator<VerifyResetCodeRequest> validator,
                                                     [FromBody] VerifyResetCodeRequest request)
    {
        await validator.ValidateAndThrowAsync(request);
        var isValid = await service.VerifyPasswordResetAsync(request);
        return isValid ? Ok() : BadRequest("Invalid or expired code");
    }

    [AllowAnonymous]
    [HttpPost("complete-password-reset")]
    public async Task<IActionResult> CompletePasswordReset([FromServices] IValidator<CompletePasswordResetRequest> validator,
                                                           [FromBody] CompletePasswordResetRequest request)
    {
        await validator.ValidateAndThrowAsync(request);
        var success = await service.CompletePasswordResetAsync(request);
        return success ? Ok() : BadRequest("Password reset failed");
    }
}