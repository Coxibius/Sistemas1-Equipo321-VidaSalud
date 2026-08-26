using VidaSalud.Api.DTOs;

namespace VidaSalud.Api.Services;

public interface IProductoService
{
    Task<ProductoResponseDto> RegistrarProductoAsync(RegistrarProductoDto dto);
}
