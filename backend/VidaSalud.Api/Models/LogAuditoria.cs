namespace VidaSalud.Api.Models;

public class LogAuditoria
{
    public int IdLog { get; set; }
    public string Actor { get; set; } = string.Empty;
    public string Accion { get; set; } = string.Empty;
    public string Entidad { get; set; } = string.Empty;
    public int? EntidadId { get; set; }
    public DateTime FechaUtc { get; set; } = DateTime.UtcNow;
    public string Resultado { get; set; } = "EXITOSO";
    public string? Detalle { get; set; }
}
