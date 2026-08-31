using Microsoft.AspNetCore.Mvc;
using VidaSalud.Api.DTOs;
using VidaSalud.Api.Exceptions;
using VidaSalud.Api.Services;

namespace VidaSalud.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsuariosController : ControllerBase
{
    private readonly IUsuarioService _usuarioService;
    private readonly ILogger<UsuariosController> _logger;

    public UsuariosController(IUsuarioService usuarioService, ILogger<UsuariosController> logger)
    {
        _usuarioService = usuarioService;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<UsuarioResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar(CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _usuarioService.ListarAsync(cancellationToken));
        }
        catch (Exception ex)
        {
            return ErrorInterno(ex, "consultar los usuarios");
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(UsuarioResponseDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Crear(
        [FromBody] CrearUsuarioDto dto,
        CancellationToken cancellationToken)
    {
        try
        {
            var usuario = await _usuarioService.CrearAsync(dto, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, usuario);
        }
        catch (DuplicateUsernameException ex)
        {
            return Conflict(new { code = ex.Code, message = ex.Message });
        }
        catch (InvalidRoleException ex)
        {
            return BadRequest(new { code = ex.Code, message = ex.Message });
        }
        catch (AdminProtectedException ex)
        {
            return BadRequest(new { code = ex.Code, message = ex.Message });
        }
        catch (BusinessValidationException ex)
        {
            return BadRequest(new { code = ex.Code, message = ex.Message });
        }
        catch (Exception ex)
        {
            return ErrorInterno(ex, "crear el usuario");
        }
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(UsuarioResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Actualizar(
        int id,
        [FromBody] ActualizarUsuarioDto dto,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _usuarioService.ActualizarAsync(id, dto, cancellationToken));
        }
        catch (UserNotFoundException ex)
        {
            return NotFound(new { code = ex.Code, message = ex.Message });
        }
        catch (DuplicateUsernameException ex)
        {
            return Conflict(new { code = ex.Code, message = ex.Message });
        }
        catch (InvalidRoleException ex)
        {
            return BadRequest(new { code = ex.Code, message = ex.Message });
        }
        catch (AdminProtectedException ex)
        {
            return BadRequest(new { code = ex.Code, message = ex.Message });
        }
        catch (BusinessValidationException ex)
        {
            return BadRequest(new { code = ex.Code, message = ex.Message });
        }
        catch (Exception ex)
        {
            return ErrorInterno(ex, "actualizar el usuario");
        }
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Eliminar(int id, CancellationToken cancellationToken)
    {
        try
        {
            await _usuarioService.EliminarAsync(id, cancellationToken);
            return NoContent();
        }
        catch (UserNotFoundException ex)
        {
            return NotFound(new { code = ex.Code, message = ex.Message });
        }
        catch (AdminProtectedException ex)
        {
            return BadRequest(new { code = ex.Code, message = ex.Message });
        }
        catch (Exception ex)
        {
            return ErrorInterno(ex, "eliminar el usuario");
        }
    }

    private IActionResult ErrorInterno(Exception ex, string operacion)
    {
        _logger.LogError(ex, "Error no controlado al {Operacion}.", operacion);
        return StatusCode(StatusCodes.Status500InternalServerError, new
        {
            code = "INTERNAL_SERVER_ERROR",
            message = "Ocurrió un error inesperado al procesar usuarios."
        });
    }
}
