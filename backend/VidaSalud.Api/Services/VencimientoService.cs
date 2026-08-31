using Microsoft.EntityFrameworkCore;
using VidaSalud.Api.Data;
using VidaSalud.Api.DTOs;

namespace VidaSalud.Api.Services;

public class VencimientoService : IVencimientoService
{
    private const int DiasAlerta = 30;
    private readonly VidaSaludDbContext _context;

    public VencimientoService(VidaSaludDbContext context)
    {
        _context = context;
    }

    public async Task<IReadOnlyList<AlertaVencimientoDto>> ObtenerAlertasAsync(
        CancellationToken cancellationToken = default)
    {
        var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
        var fechaLimite = hoy.AddDays(DiasAlerta);

        var lotes = await _context.Lotes
            .AsNoTracking()
            .Include(lote => lote.Producto)
            .Where(lote => lote.Cantidad > 0 && lote.FechaVencimiento <= fechaLimite)
            .OrderBy(lote => lote.FechaVencimiento)
            .ThenBy(lote => lote.Producto!.Nombre)
            .ToListAsync(cancellationToken);

        return lotes.Select(lote =>
        {
            var diasRestantes = lote.FechaVencimiento.DayNumber - hoy.DayNumber;
            var vencido = lote.FechaVencimiento <= hoy;

            return new AlertaVencimientoDto
            {
                LoteId = lote.IdLote,
                ProductoId = lote.IdProducto,
                Producto = lote.Producto?.Nombre ?? string.Empty,
                Cantidad = lote.Cantidad,
                FechaVencimiento = lote.FechaVencimiento.ToString("yyyy-MM-dd"),
                DiasRestantes = diasRestantes,
                EstadoVencimiento = vencido ? "VENCIDO" : "PROXIMO_A_VENCER",
                Mensaje = vencido
                    ? "Producto vencido. Retirar del inventario disponible para salidas."
                    : $"El lote vence en {diasRestantes} día(s)."
            };
        }).ToList();
    }
}
