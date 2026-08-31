using VidaSalud.Api.DTOs;

namespace VidaSalud.Api.Services;

public interface IUsuarioService
{
    Task<IReadOnlyList<UsuarioResponseDto>> ListarAsync(CancellationToken cancellationToken = default);
    Task<UsuarioResponseDto> CrearAsync(CrearUsuarioDto dto, CancellationToken cancellationToken = default);
    Task<UsuarioResponseDto> ActualizarAsync(int id, ActualizarUsuarioDto dto, CancellationToken cancellationToken = default);
    Task EliminarAsync(int id, CancellationToken cancellationToken = default);
    Task<UsuarioResponseDto> IniciarSesionAsync(LoginDto dto, CancellationToken cancellationToken = default);
}
