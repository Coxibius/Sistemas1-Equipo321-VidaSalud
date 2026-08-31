namespace VidaSalud.Api.DTOs;

public class MovimientoResponseDto
{
    public int Id { get; set; }
    public int ProductoId { get; set; }
    public string Producto { get; set; } = string.Empty;
    public string Tipo { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public DateTime Fecha { get; set; }
    public string Estado { get; set; } = string.Empty;
    public string Responsable { get; set; } = string.Empty;
    public int StockActual { get; set; }
}
