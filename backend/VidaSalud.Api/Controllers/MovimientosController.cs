using Microsoft.AspNetCore.Mvc;
using VidaSalud.Api.DTOs;
using VidaSalud.Api.Exceptions;
using VidaSalud.Api.Services;

namespace VidaSalud.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MovimientosController : ControllerBase
{
    private readonly IMovimientoService _movimientoService;
    private readonly ILogger<MovimientosController> _logger;

    public MovimientosController(
        IMovimientoService movimientoService,
        ILogger<MovimientosController> logger)
    {
        _movimientoService = movimientoService;
        _logger = logger;
    }

    [HttpPost]
    [ProducesResponseType(typeof(MovimientoResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> RegistrarMovimiento(
        [FromBody] RegistrarMovimientoDto dto,
        CancellationToken cancellationToken)
    {
        try
        {
            var resultado = await _movimientoService.RegistrarMovimientoAsync(dto, cancellationToken);
            return StatusCode(StatusCodes.Status201Created, resultado);
        }
        catch (InvalidQuantityException ex)
        {
            return BadRequest(new { code = ex.Code, message = ex.Message });
        }
        catch (InsufficientStockException ex)
        {
            return BadRequest(new { code = ex.Code, message = ex.Message });
        }
        catch (ProductExpiredException ex)
        {
            return BadRequest(new { code = ex.Code, message = ex.Message });
        }
        catch (ProductNotFoundException ex)
        {
            return NotFound(new { code = ex.Code, message = ex.Message });
        }
        catch (BusinessValidationException ex)
        {
            return BadRequest(new { code = ex.Code, message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no controlado al registrar un movimiento de inventario.");
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                code = "INTERNAL_SERVER_ERROR",
                message = "Ocurrió un error inesperado al registrar el movimiento."
            });
        }
    }
}
