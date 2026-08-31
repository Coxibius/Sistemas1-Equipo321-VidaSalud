namespace VidaSalud.Api.DTOs;

public class AlertaVencimientoDto
{
    public int LoteId { get; set; }
    public int ProductoId { get; set; }
    public string Producto { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public string FechaVencimiento { get; set; } = string.Empty;
    public int DiasRestantes { get; set; }
    public string EstadoVencimiento { get; set; } = string.Empty;
    public string Mensaje { get; set; } = string.Empty;
}
