using Microsoft.AspNetCore.Mvc;
using VidaSalud.Api.DTOs;
using VidaSalud.Api.Services;

namespace VidaSalud.Api.Controllers;

[ApiController]
[Route("api/auditoria")]
public class AuditoriaController : ControllerBase
{
    private readonly IAuditoriaService _auditoria;
    private readonly ILogger<AuditoriaController> _logger;

    public AuditoriaController(IAuditoriaService auditoria, ILogger<AuditoriaController> logger)
    {
        _auditoria = auditoria;
        _logger = logger;
    }

    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<LogAuditoriaResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Listar(
        [FromQuery] int limite = 100,
        CancellationToken cancellationToken = default)
    {
        try
        {
            return Ok(await _auditoria.ListarAsync(limite, cancellationToken));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no controlado al consultar la auditoría.");
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                code = "INTERNAL_SERVER_ERROR",
                message = "Ocurrió un error inesperado al consultar la auditoría."
            });
        }
    }
}
