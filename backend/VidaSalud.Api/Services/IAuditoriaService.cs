using VidaSalud.Api.DTOs;

namespace VidaSalud.Api.Services;

public interface IAuditoriaService
{
    Task RegistrarAsync(
        string? actor,
        string accion,
        string entidad,
        int? entidadId = null,
        string resultado = "EXITOSO",
        string? detalle = null,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<LogAuditoriaResponseDto>> ListarAsync(
        int limite = 100,
        CancellationToken cancellationToken = default);
}
