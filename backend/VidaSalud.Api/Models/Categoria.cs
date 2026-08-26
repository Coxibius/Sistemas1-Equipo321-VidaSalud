namespace VidaSalud.Api.Models;

public class Categoria
{
    public int IdCategoria { get; set; }
    public string NombreCategoria { get; set; } = string.Empty;

    // Relación de navegación: 1 Categoría -> N Productos
    public ICollection<Producto> Productos { get; set; } = new List<Producto>();
}
