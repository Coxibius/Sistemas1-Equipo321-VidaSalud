using System.ComponentModel.DataAnnotations.Schema;

namespace VidaSalud.Api.Models;

public class Lote
{
    public int IdLote { get; set; }
    public int IdProducto { get; set; }
    public int Cantidad { get; set; }
    public DateOnly FechaIngreso { get; set; } = DateOnly.FromDateTime(DateTime.UtcNow);
    public DateOnly FechaVencimiento { get; set; }

    // Navegación: Producto
    public Producto? Producto { get; set; }

    // Propiedad calculada dinámicamente, no persistida en la base de datos
    [NotMapped]
    public string EstadoVencimiento
    {
        get
        {
            var hoy = DateOnly.FromDateTime(DateTime.UtcNow);
            if (FechaVencimiento <= hoy) return "VENCIDO";
            if (FechaVencimiento <= hoy.AddDays(30)) return "PROXIMO_A_VENCER";
            return "VIGENTE";
        }
    }
}
