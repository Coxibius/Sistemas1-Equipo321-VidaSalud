namespace VidaSalud.Api.Models;

public class Producto
{
    public int IdProducto { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public int IdCategoria { get; set; }
    public decimal Precio { get; set; }
    public DateOnly FechaCreacion { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);

    // Navegación: Categoría
    public Categoria? Categoria { get; set; }

    // Relación de navegación: 1 Producto -> N Lotes
    public ICollection<Lote> Lotes { get; set; } = new List<Lote>();

    public ICollection<MovimientoInventario> Movimientos { get; set; } = new List<MovimientoInventario>();
}
