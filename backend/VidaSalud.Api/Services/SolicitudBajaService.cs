using Microsoft.EntityFrameworkCore;
using VidaSalud.Api.Data;
using VidaSalud.Api.DTOs;
using VidaSalud.Api.Exceptions;
using VidaSalud.Api.Models;

namespace VidaSalud.Api.Services;

public class SolicitudBajaService : ISolicitudBajaService
{
    private readonly VidaSaludDbContext _context;
    private readonly IAuditoriaService _auditoria;

    public SolicitudBajaService(VidaSaludDbContext context, IAuditoriaService auditoria)
    {
        _context = context;
        _auditoria = auditoria;
    }

    public async Task<SolicitudBajaResponseDto> SolicitarAsync(
        SolicitarBajaDto dto,
        CancellationToken cancellationToken = default)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(item => item.IdUsuario == dto.UsuarioId, cancellationToken)
            ?? throw new UserNotFoundException();

        if (!usuario.Activo)
        {
            throw new AccountInactiveException();
        }

        if (usuario.Rol == "ADMINISTRADOR")
        {
            throw new AdminProtectedException("El único administrador no puede solicitar su baja.");
        }

        var existePendiente = await _context.SolicitudesBaja.AnyAsync(
            item => item.IdUsuario == usuario.IdUsuario && item.Estado == "PENDIENTE",
            cancellationToken);

        if (existePendiente)
        {
            throw new PendingDeactivationRequestException();
        }

        var motivo = string.IsNullOrWhiteSpace(dto.Motivo) ? null : dto.Motivo.Trim();
        if (motivo?.Length > 250)
        {
            throw new BusinessValidationException("El motivo no puede exceder 250 caracteres.");
        }

        var solicitud = new SolicitudBaja
        {
            IdUsuario = usuario.IdUsuario,
            NombreUsuario = usuario.NombreUsuario,
            Motivo = motivo,
            Estado = "PENDIENTE",
            FechaSolicitud = DateTime.UtcNow,
            Usuario = usuario
        };

        _context.SolicitudesBaja.Add(solicitud);
        await _context.SaveChangesAsync(cancellationToken);
        await _auditoria.RegistrarAsync(
            usuario.NombreUsuario,
            "SOLICITAR_BAJA",
            "SOLICITUD_BAJA",
            solicitud.IdSolicitud,
            detalle: "Solicitud de baja registrada para revisión administrativa.",
            cancellationToken: cancellationToken);

        return Mapear(solicitud, usuario.Nombre);
    }

    public async Task<IReadOnlyList<SolicitudBajaResponseDto>> ListarAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.SolicitudesBaja
            .AsNoTracking()
            .Include(solicitud => solicitud.Usuario)
            .OrderBy(solicitud => solicitud.Estado == "PENDIENTE" ? 0 : 1)
            .ThenByDescending(solicitud => solicitud.FechaSolicitud)
            .Select(solicitud => new SolicitudBajaResponseDto
            {
                Id = solicitud.IdSolicitud,
                UsuarioId = solicitud.IdUsuario,
                Nombre = solicitud.Usuario != null ? solicitud.Usuario.Nombre : solicitud.NombreUsuario,
                Usuario = solicitud.NombreUsuario,
                Motivo = solicitud.Motivo,
                Estado = solicitud.Estado,
                FechaSolicitud = solicitud.FechaSolicitud,
                FechaResolucion = solicitud.FechaResolucion,
                ResueltaPor = solicitud.ResueltaPor
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<SolicitudBajaResponseDto> ResolverAsync(
        int id,
        ResolverSolicitudBajaDto dto,
        CancellationToken cancellationToken = default)
    {
        var solicitud = await _context.SolicitudesBaja
            .Include(item => item.Usuario)
            .FirstOrDefaultAsync(item => item.IdSolicitud == id, cancellationToken)
            ?? throw new DeactivationRequestNotFoundException();

        if (solicitud.Estado != "PENDIENTE")
        {
            throw new BusinessValidationException("La solicitud ya fue procesada.");
        }

        var estado = (dto.Estado ?? string.Empty).Trim().ToUpperInvariant();
        if (estado is not ("APROBADA" or "RECHAZADA"))
        {
            throw new BusinessValidationException("El estado debe ser APROBADA o RECHAZADA.");
        }

        var responsable = (dto.ResueltaPor ?? string.Empty).Trim();
        if (responsable.Length is 0 or > 80)
        {
            throw new BusinessValidationException("El administrador responsable es obligatorio.");
        }

        solicitud.Estado = estado;
        solicitud.FechaResolucion = DateTime.UtcNow;
        solicitud.ResueltaPor = responsable;

        if (estado == "APROBADA" && solicitud.Usuario is not null)
        {
            solicitud.Usuario.Activo = false;
        }

        await _context.SaveChangesAsync(cancellationToken);
        await _auditoria.RegistrarAsync(
            responsable,
            estado == "APROBADA" ? "APROBAR_BAJA" : "RECHAZAR_BAJA",
            "SOLICITUD_BAJA",
            solicitud.IdSolicitud,
            detalle: $"Solicitud de {solicitud.NombreUsuario} procesada.",
            cancellationToken: cancellationToken);

        return Mapear(solicitud, solicitud.Usuario?.Nombre ?? solicitud.NombreUsuario);
    }

    private static SolicitudBajaResponseDto Mapear(SolicitudBaja solicitud, string nombre) => new()
    {
        Id = solicitud.IdSolicitud,
        UsuarioId = solicitud.IdUsuario,
        Nombre = nombre,
        Usuario = solicitud.NombreUsuario,
        Motivo = solicitud.Motivo,
        Estado = solicitud.Estado,
        FechaSolicitud = solicitud.FechaSolicitud,
        FechaResolucion = solicitud.FechaResolucion,
        ResueltaPor = solicitud.ResueltaPor
    };
}
