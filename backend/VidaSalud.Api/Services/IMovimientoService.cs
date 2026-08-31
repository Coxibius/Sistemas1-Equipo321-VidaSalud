using VidaSalud.Api.DTOs;

namespace VidaSalud.Api.Services;

public interface IMovimientoService
{
    Task<MovimientoResponseDto> RegistrarMovimientoAsync(
        RegistrarMovimientoDto dto,
        CancellationToken cancellationToken = default);
}
