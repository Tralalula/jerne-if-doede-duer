using FluentValidation;
using Microsoft.AspNetCore.Mvc;
using Service.Auth;

namespace API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController(IAuthService service) : ControllerBase
{
    [HttpPost("login")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<LoginResponse>> Login([FromServices] IValidator<LoginRequest> validator,
                                                         [FromBody] LoginRequest request)
    {
        await validator.ValidateAndThrowAsync(request);
        return Ok(await service.LoginAsync(request));
    }
}