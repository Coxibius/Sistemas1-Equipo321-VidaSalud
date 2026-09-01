using Microsoft.AspNetCore.Mvc;
using VidaSalud.Api.DTOs;
using VidaSalud.Api.Exceptions;
using VidaSalud.Api.Services;

namespace VidaSalud.Api.Controllers;

[ApiController]
[Route("api/solicitudes-baja")]
public class SolicitudesBajaController : ControllerBase
{
    private readonly ISolicitudBajaService _solicitudes;
    private readonly ILogger<SolicitudesBajaController> _logger;

    public SolicitudesBajaController(
        ISolicitudBajaService solicitudes,
        ILogger<SolicitudesBajaController> logger)
    {
        _solicitudes = solicitudes;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<SolicitudBajaResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar(CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _solicitudes.ListarAsync(cancellationToken));
        }
        catch (Exception ex)
        {
            return ErrorInterno(ex, "consultar las solicitudes de baja");
        }
    }

    [HttpPost]
    [ProducesResponseType(typeof(SolicitudBajaResponseDto), StatusCodes.Status201Created)]
    public async Task<IActionResult> Solicitar(
        [FromBody] SolicitarBajaDto dto,
        CancellationToken cancellationToken)
    {
        try
        {
            var solicitud = await _solicitudes.SolicitarAsync(dto, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, solicitud);
        }
        catch (UserNotFoundException ex)
        {
            return NotFound(new { code = ex.Code, message = ex.Message });
        }
        catch (PendingDeactivationRequestException ex)
        {
            return Conflict(new { code = ex.Code, message = ex.Message });
        }
        catch (AccountInactiveException ex)
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
            return ErrorInterno(ex, "registrar la solicitud de baja");
        }
    }

    [HttpPut("{id:int}/resolver")]
    [ProducesResponseType(typeof(SolicitudBajaResponseDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> Resolver(
        int id,
        [FromBody] ResolverSolicitudBajaDto dto,
        CancellationToken cancellationToken)
    {
        try
        {
            return Ok(await _solicitudes.ResolverAsync(id, dto, cancellationToken));
        }
        catch (DeactivationRequestNotFoundException ex)
        {
            return NotFound(new { code = ex.Code, message = ex.Message });
        }
        catch (BusinessValidationException ex)
        {
            return BadRequest(new { code = ex.Code, message = ex.Message });
        }
        catch (Exception ex)
        {
            return ErrorInterno(ex, "resolver la solicitud de baja");
        }
    }

    private IActionResult ErrorInterno(Exception ex, string operacion)
    {
        _logger.LogError(ex, "Error no controlado al {Operacion}.", operacion);
        return StatusCode(StatusCodes.Status500InternalServerError, new
        {
            code = "INTERNAL_SERVER_ERROR",
            message = "Ocurrió un error inesperado al procesar solicitudes de baja."
        });
    }
}
