using VidaSalud.Api.DTOs;

namespace VidaSalud.Api.Services;

public interface ISolicitudBajaService
{
    Task<SolicitudBajaResponseDto> SolicitarAsync(
        SolicitarBajaDto dto,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<SolicitudBajaResponseDto>> ListarAsync(
        CancellationToken cancellationToken = default);

    Task<SolicitudBajaResponseDto> ResolverAsync(
        int id,
        ResolverSolicitudBajaDto dto,
        CancellationToken cancellationToken = default);
}
