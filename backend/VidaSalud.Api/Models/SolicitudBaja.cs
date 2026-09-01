namespace VidaSalud.Api.Models;

public class SolicitudBaja
{
    public int IdSolicitud { get; set; }
    public int? IdUsuario { get; set; }
    public string NombreUsuario { get; set; } = string.Empty;
    public string? Motivo { get; set; }
    public string Estado { get; set; } = "PENDIENTE";
    public DateTime FechaSolicitud { get; set; } = DateTime.UtcNow;
    public DateTime? FechaResolucion { get; set; }
    public string? ResueltaPor { get; set; }

    public Usuario? Usuario { get; set; }
}
