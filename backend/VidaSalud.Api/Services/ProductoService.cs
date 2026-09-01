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
    private readonly IAuditoriaService _auditoria;

    public ProductoService(
        VidaSaludDbContext context,
        ILogger<ProductoService> logger,
        IAuditoriaService auditoria)
    {
        _context = context;
        _logger = logger;
        _auditoria = auditoria;
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

        await _auditoria.RegistrarAsync(
            dto.Responsable,
            "CREAR_PRODUCTO",
            "PRODUCTO",
            nuevoProducto.IdProducto,
            detalle: $"Producto {nuevoProducto.Nombre} y lote inicial registrados.");

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

    public async Task<IReadOnlyList<ProductoResponseDto>> BuscarProductosAsync(
        string? criterio,
        CancellationToken cancellationToken = default)
    {
        var criterioNormalizado = criterio?.Trim();

        if (criterioNormalizado?.Length > 100)
        {
            throw new BusinessValidationException("El criterio de búsqueda no puede exceder 100 caracteres.");
        }

        var consulta = _context.Productos
            .AsNoTracking()
            .Include(producto => producto.Categoria)
            .Include(producto => producto.Lotes)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(criterioNormalizado))
        {
            consulta = consulta.Where(producto =>
                producto.Nombre.ToLower().Contains(criterioNormalizado.ToLower()));
        }

        var productos = await consulta
            .OrderBy(producto => producto.Nombre)
            .ToListAsync(cancellationToken);

        return productos.Select(producto =>
        {
            var stockActual = producto.Lotes.Sum(lote => lote.Cantidad);
            var loteProximo = producto.Lotes
                .Where(lote => lote.Cantidad > 0)
                .OrderBy(lote => lote.FechaVencimiento)
                .FirstOrDefault();

            return new ProductoResponseDto
            {
                Id = producto.IdProducto,
                Nombre = producto.Nombre,
                Categoria = producto.Categoria?.NombreCategoria ?? string.Empty,
                Precio = producto.Precio,
                Cantidad = stockActual,
                FechaVencimiento = loteProximo?.FechaVencimiento.ToString("yyyy-MM-dd") ?? string.Empty,
                CreadoEn = producto.FechaCreacion.ToString("yyyy-MM-dd"),
                LoteId = loteProximo?.IdLote ?? 0,
                EstadoVencimiento = loteProximo?.EstadoVencimiento ?? "Sin stock"
            };
        }).ToList();
    }
}
