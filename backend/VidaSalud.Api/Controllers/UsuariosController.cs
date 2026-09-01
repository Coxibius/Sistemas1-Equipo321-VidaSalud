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

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(UsuarioResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Obtener(int id, CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _usuarioService.ObtenerAsync(id, cancellationToken));
        }
        catch (UserNotFoundException ex)
        {
            return NotFound(new { code = ex.Code, message = ex.Message });
        }
        catch (Exception ex)
        {
            return ErrorInterno(ex, "consultar el perfil");
        }
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
        [FromHeader(Name = "X-Actor")] string? actor,
        CancellationToken cancellationToken)
    {
        try
        {
            var usuario = await _usuarioService.CrearAsync(dto, actor, cancellationToken);
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
        [FromHeader(Name = "X-Actor")] string? actor,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _usuarioService.ActualizarAsync(id, dto, actor, cancellationToken));
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

    [HttpPut("{id:int}/perfil")]
    [ProducesResponseType(typeof(UsuarioResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> ActualizarPerfil(
        int id,
        [FromBody] ActualizarPerfilDto dto,
        [FromHeader(Name = "X-Actor")] string? actor,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _usuarioService.ActualizarPerfilAsync(id, dto, actor, cancellationToken));
        }
        catch (UserNotFoundException ex)
        {
            return NotFound(new { code = ex.Code, message = ex.Message });
        }
        catch (BusinessValidationException ex)
        {
            return BadRequest(new { code = ex.Code, message = ex.Message });
        }
        catch (Exception ex)
        {
            return ErrorInterno(ex, "actualizar el perfil");
        }
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Eliminar(
        int id,
        [FromHeader(Name = "X-Actor")] string? actor,
        CancellationToken cancellationToken)
    {
        try
        {
            await _usuarioService.EliminarAsync(id, actor, cancellationToken);
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
