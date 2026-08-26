using Microsoft.EntityFrameworkCore;
using VidaSalud.Api.Data;
using VidaSalud.Api.DTOs;
using VidaSalud.Api.Exceptions;
using VidaSalud.Api.Models;

namespace VidaSalud.Api.Services;

public class ProductoService : IProductoService
{
    private readonly VidaSaludDbContext _context;
    private readonly ILogger<ProductoService> _logger;

    public ProductoService(VidaSaludDbContext context, ILogger<ProductoService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ProductoResponseDto> RegistrarProductoAsync(RegistrarProductoDto dto)
    {
        // 1. Validaciones básicas de reglas de negocio (BR01, BR02)
        if (string.IsNullOrWhiteSpace(dto.Nombre))
        {
            throw new BusinessValidationException("El nombre del producto es obligatorio.");
        }

        if (string.IsNullOrWhiteSpace(dto.Categoria))
        {
            throw new BusinessValidationException("La categoría es obligatoria.");
        }

        if (dto.Precio < 0)
        {
            throw new BusinessValidationException("El precio no puede ser negativo.");
        }

        if (dto.Cantidad < 0)
        {
            throw new BusinessValidationException("La cantidad no puede ser negativa.");
        }

        var nombreNormalizado = dto.Nombre.Trim();

        // 2. Validación de producto duplicado por nombre (BR03, AC04)
        var yaExiste = await _context.Productos
            .AnyAsync(p => p.Nombre.ToLower() == nombreNormalizado.ToLower());

        if (yaExiste)
        {
            _logger.LogWarning("Intento de registrar producto duplicado: {Nombre}", nombreNormalizado);
            throw new DuplicateProductException($"El producto '{nombreNormalizado}' ya existe en el sistema.");
        }

        // 3. Validación y búsqueda de categoría existente únicamente por nombre
        var categoriaNombre = dto.Categoria.Trim();
        var categoria = await _context.Categorias
            .FirstOrDefaultAsync(c => c.NombreCategoria.ToLower() == categoriaNombre.ToLower());

        if (categoria == null)
        {
            _logger.LogWarning("Categoría no encontrada: {Categoria}", categoriaNombre);
            throw new CategoryNotFoundException($"La categoría '{categoriaNombre}' no existe en el sistema.");
        }

        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);

        // 4. Creación atómica de Producto + Lote inicial
        var nuevoProducto = new Producto
        {
            Nombre = nombreNormalizado,
            IdCategoria = categoria.IdCategoria,
            Precio = dto.Precio,
            FechaCreacion = hoy
        };

        var nuevoLote = new Lote
        {
            Producto = nuevoProducto,
            Cantidad = dto.Cantidad,
            FechaIngreso = hoy,
            FechaVencimiento = dto.FechaVencimiento
        };

        nuevoProducto.Lotes.Add(nuevoLote);

        _context.Productos.Add(nuevoProducto);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Producto '{Nombre}' con Id {Id} y Lote {LoteId} registrado exitosamente.",
            nuevoProducto.Nombre, nuevoProducto.IdProducto, nuevoLote.IdLote);

        // 5. Retorno de DTO de respuesta (EstadoVencimiento se evalúa dinámicamente desde Lote)
        return new ProductoResponseDto
        {
            Id = nuevoProducto.IdProducto,
            Nombre = nuevoProducto.Nombre,
            Categoria = categoria.NombreCategoria,
            Precio = nuevoProducto.Precio,
            Cantidad = nuevoLote.Cantidad,
            FechaVencimiento = nuevoLote.FechaVencimiento.ToString("yyyy-MM-dd"),
            CreadoEn = nuevoProducto.FechaCreacion.ToString("yyyy-MM-dd"),
            LoteId = nuevoLote.IdLote,
            EstadoVencimiento = nuevoLote.EstadoVencimiento
        };
    }
}
