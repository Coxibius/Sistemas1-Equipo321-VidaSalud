using Microsoft.AspNetCore.Mvc;
using VidaSalud.Api.DTOs;
using VidaSalud.Api.Services;

namespace VidaSalud.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class VencimientosController : ControllerBase
{
    private readonly IVencimientoService _vencimientoService;
    private readonly ILogger<VencimientosController> _logger;

    public VencimientosController(
        IVencimientoService vencimientoService,
        ILogger<VencimientosController> logger)
    {
        _vencimientoService = vencimientoService;
        _logger = logger;
    }

    [HttpGet("alertas")]
    [ProducesResponseType(typeof(IReadOnlyList<AlertaVencimientoDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> ObtenerAlertas(CancellationToken cancellationToken)
    {
        try
        {
            var alertas = await _vencimientoService.ObtenerAlertasAsync(cancellationToken);
            return Ok(alertas);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no controlado al consultar alertas de vencimiento.");
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                code = "INTERNAL_SERVER_ERROR",
                message = "Ocurrió un error inesperado al consultar los vencimientos."
            });
        }
    }
}
