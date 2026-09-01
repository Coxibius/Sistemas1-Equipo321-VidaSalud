using VidaSalud.Api.DTOs;

namespace VidaSalud.Api.Services;

public interface IUsuarioService
{
    Task<IReadOnlyList<UsuarioResponseDto>> ListarAsync(CancellationToken cancellationToken = default);
    Task<UsuarioResponseDto> ObtenerAsync(int id, CancellationToken cancellationToken = default);
    Task<UsuarioResponseDto> CrearAsync(CrearUsuarioDto dto, string? actor, CancellationToken cancellationToken = default);
    Task<UsuarioResponseDto> ActualizarAsync(int id, ActualizarUsuarioDto dto, string? actor, CancellationToken cancellationToken = default);
    Task<UsuarioResponseDto> ActualizarPerfilAsync(int id, ActualizarPerfilDto dto, string? actor, CancellationToken cancellationToken = default);
    Task EliminarAsync(int id, string? actor, CancellationToken cancellationToken = default);
    Task<UsuarioResponseDto> IniciarSesionAsync(LoginDto dto, CancellationToken cancellationToken = default);
}
