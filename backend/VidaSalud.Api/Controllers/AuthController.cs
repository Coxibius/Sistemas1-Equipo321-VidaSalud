using Microsoft.AspNetCore.Mvc;
using VidaSalud.Api.DTOs;
using VidaSalud.Api.Exceptions;
using VidaSalud.Api.Services;

namespace VidaSalud.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(IUsuarioService usuarioService, ILogger<AuthController> logger)
    {
        _usuarioService = usuarioService;
        _logger = logger;
    }

    [HttpPost("login")]
    [ProducesResponseType(typeof(UsuarioResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> IniciarSesion(
        [FromBody] LoginDto dto,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _usuarioService.IniciarSesionAsync(dto, cancellationToken));
        }
        catch (InvalidCredentialsException ex)
        {
            return Unauthorized(new { code = ex.Code, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no controlado durante el inicio de sesión.");
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                code = "INTERNAL_SERVER_ERROR",
                message = "Ocurrió un error inesperado al iniciar sesión."
            });
        }
    }
}
