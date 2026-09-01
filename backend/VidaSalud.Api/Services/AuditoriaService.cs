using Microsoft.EntityFrameworkCore;
using VidaSalud.Api.Data;
using VidaSalud.Api.DTOs;
using VidaSalud.Api.Models;

namespace VidaSalud.Api.Services;

public class AuditoriaService : IAuditoriaService
{
    private readonly VidaSaludDbContext _context;

    public AuditoriaService(VidaSaludDbContext context)
    {
        _context = context;
    }

    public async Task RegistrarAsync(
        string? actor,
        string accion,
        string entidad,
        int? entidadId = null,
        string resultado = "EXITOSO",
        string? detalle = null,
        CancellationToken cancellationToken = default)
    {
        var log = new LogAuditoria
        {
            Actor = Limitar(actor, 80, "USUARIO_NO_IDENTIFICADO"),
            Accion = Limitar(accion, 50, "ACCION_NO_IDENTIFICADA"),
            Entidad = Limitar(entidad, 50, "ENTIDAD_NO_IDENTIFICADA"),
            EntidadId = entidadId,
            FechaUtc = DateTime.UtcNow,
            Resultado = NormalizarResultado(resultado),
            Detalle = string.IsNullOrWhiteSpace(detalle) ? null : Limitar(detalle, 250, string.Empty)
        };

        _context.LogsAuditoria.Add(log);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<LogAuditoriaResponseDto>> ListarAsync(
        int limite = 100,
        CancellationToken cancellationToken = default)
    {
        var limiteSeguro = Math.Clamp(limite, 1, 200);

        return await _context.LogsAuditoria
            .AsNoTracking()
            .OrderByDescending(log => log.FechaUtc)
            .Take(limiteSeguro)
            .Select(log => new LogAuditoriaResponseDto
            {
                Id = log.IdLog,
                Actor = log.Actor,
                Accion = log.Accion,
                Entidad = log.Entidad,
                EntidadId = log.EntidadId,
                FechaUtc = log.FechaUtc,
                Resultado = log.Resultado,
                Detalle = log.Detalle
            })
            .ToListAsync(cancellationToken);
    }

    private static string Limitar(string? valor, int maximo, string valorPredeterminado)
    {
        var normalizado = string.IsNullOrWhiteSpace(valor) ? valorPredeterminado : valor.Trim();
        return normalizado.Length <= maximo ? normalizado : normalizado[..maximo];
    }

    private static string NormalizarResultado(string resultado)
    {
        var normalizado = (resultado ?? string.Empty).Trim().ToUpperInvariant();
        return normalizado is "EXITOSO" or "FALLIDO" or "RECHAZADO" ? normalizado : "FALLIDO";
    }
}
