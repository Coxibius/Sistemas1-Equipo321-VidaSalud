namespace VidaSalud.Api.DTOs;

public class LogAuditoriaResponseDto
{
    public int Id { get; set; }
    public string Actor { get; set; } = string.Empty;
    public string Accion { get; set; } = string.Empty;
    public string Entidad { get; set; } = string.Empty;
    public int? EntidadId { get; set; }
    public DateTime FechaUtc { get; set; }
    public string Resultado { get; set; } = string.Empty;
    public string? Detalle { get; set; }
}
