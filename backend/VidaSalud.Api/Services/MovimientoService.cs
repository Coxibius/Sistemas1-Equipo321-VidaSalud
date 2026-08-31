using Microsoft.EntityFrameworkCore;
using VidaSalud.Api.Data;
using VidaSalud.Api.DTOs;
using VidaSalud.Api.Exceptions;
using VidaSalud.Api.Models;

namespace VidaSalud.Api.Services;

public class MovimientoService : IMovimientoService
{
    private readonly VidaSaludDbContext _context;
    private readonly ILogger<MovimientoService> _logger;

    public MovimientoService(VidaSaludDbContext context, ILogger<MovimientoService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<MovimientoResponseDto> RegistrarMovimientoAsync(
        RegistrarMovimientoDto dto,
        CancellationToken cancellationToken = default)
    {
        if (dto.Cantidad <= 0)
        {
            throw new InvalidQuantityException();
        }

        var tipo = (dto.Tipo ?? string.Empty).Trim().ToUpperInvariant();
        if (tipo is not ("ENTRADA" or "SALIDA"))
        {
            throw new BusinessValidationException("El tipo debe ser ENTRADA o SALIDA.");
        }

        var responsable = (dto.Responsable ?? string.Empty).Trim();
        if (string.IsNullOrWhiteSpace(responsable))
        {
            throw new BusinessValidationException("El responsable es obligatorio.");
        }

        if (responsable.Length > 80)
        {
            throw new BusinessValidationException("El responsable no puede exceder 80 caracteres.");
        }

        var producto = await _context.Productos
            .Include(p => p.Lotes)
            .FirstOrDefaultAsync(p => p.IdProducto == dto.ProductoId, cancellationToken);

        if (producto is null)
        {
            throw new ProductNotFoundException();
        }

        var stockActual = producto.Lotes.Sum(lote => lote.Cantidad);

        if (tipo == "SALIDA")
        {
            var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
            var lotesDisponibles = producto.Lotes
                .Where(lote => lote.Cantidad > 0 && lote.FechaVencimiento > hoy)
                .OrderBy(lote => lote.FechaVencimiento)
                .ThenBy(lote => lote.IdLote)
                .ToList();
            var stockDisponible = lotesDisponibles.Sum(lote => lote.Cantidad);

            if (stockDisponible == 0 && stockActual > 0)
            {
                throw new ProductExpiredException();
            }

            if (dto.Cantidad > stockDisponible)
            {
                throw new InsufficientStockException(stockDisponible);
            }

            var cantidadPendiente = dto.Cantidad;
            foreach (var lote in lotesDisponibles)
            {
                var cantidadADescontar = Math.Min(lote.Cantidad, cantidadPendiente);
                lote.Cantidad -= cantidadADescontar;
                cantidadPendiente -= cantidadADescontar;

                if (cantidadPendiente == 0)
                {
                    break;
                }
            }

            stockActual -= dto.Cantidad;
        }
        else
        {
            var lote = producto.Lotes
                .OrderBy(lote => lote.FechaVencimiento)
                .ThenBy(lote => lote.IdLote)
                .FirstOrDefault();

            if (lote is null)
            {
                throw new BusinessValidationException("El producto no tiene un lote disponible.");
            }

            lote.Cantidad += dto.Cantidad;
            stockActual += dto.Cantidad;
        }

        var movimiento = new MovimientoInventario
        {
            IdProducto = producto.IdProducto,
            TipoMovimiento = tipo,
            Cantidad = dto.Cantidad,
            Fecha = DateTime.UtcNow,
            EstadoMovimiento = "REGISTRADO",
            Responsable = responsable
        };

        _context.MovimientosInventario.Add(movimiento);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogInformation(
            "Movimiento {Tipo} {MovimientoId} registrado para el producto {ProductoId} por {Responsable}.",
            tipo,
            movimiento.IdMovimiento,
            producto.IdProducto,
            responsable);

        return new MovimientoResponseDto
        {
            Id = movimiento.IdMovimiento,
            ProductoId = producto.IdProducto,
            Producto = producto.Nombre,
            Tipo = movimiento.TipoMovimiento,
            Cantidad = movimiento.Cantidad,
            Fecha = movimiento.Fecha,
            Estado = movimiento.EstadoMovimiento,
            Responsable = movimiento.Responsable,
            StockActual = stockActual
        };
    }
}
