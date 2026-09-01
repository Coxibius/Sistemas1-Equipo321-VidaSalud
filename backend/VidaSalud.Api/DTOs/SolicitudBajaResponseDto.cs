namespace VidaSalud.Api.DTOs;

public class SolicitudBajaResponseDto
{
    public int Id { get; set; }
    public int? UsuarioId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Usuario { get; set; } = string.Empty;
    public string? Motivo { get; set; }
    public string Estado { get; set; } = string.Empty;
    public DateTime FechaSolicitud { get; set; }
    public DateTime? FechaResolucion { get; set; }
    public string? ResueltaPor { get; set; }
}
