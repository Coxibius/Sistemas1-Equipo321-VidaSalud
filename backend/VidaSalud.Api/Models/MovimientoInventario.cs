namespace VidaSalud.Api.Models;

public class MovimientoInventario
{
    public int IdMovimiento { get; set; }
    public int IdProducto { get; set; }
    public string TipoMovimiento { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
    public string EstadoMovimiento { get; set; } = "REGISTRADO";
    public string Responsable { get; set; } = string.Empty;

    public Producto? Producto { get; set; }
}
