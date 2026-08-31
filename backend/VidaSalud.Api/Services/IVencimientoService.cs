using VidaSalud.Api.DTOs;

namespace VidaSalud.Api.Services;

public interface IVencimientoService
{
    Task<IReadOnlyList<AlertaVencimientoDto>> ObtenerAlertasAsync(
        CancellationToken cancellationToken = default);
}
