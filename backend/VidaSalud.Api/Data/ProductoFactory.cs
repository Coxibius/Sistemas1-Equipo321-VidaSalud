using VidaSalud.Api.Models;

namespace VidaSalud.Api.Data;

public static class ProductoFactory
{
    public static IReadOnlyList<Producto> CrearProductosDemostracion(DateOnly hoy)
    {
        return
        [
            Crear("Paracetamol 500 mg", 1, 12.50m, 120, hoy, 180),
            Crear("Amoxicilina 500 mg", 2, 28.90m, 45, hoy, 10),
            Crear("Ibuprofeno 400 mg", 3, 18.00m, 80, hoy, 20),
            Crear("Vitamina C 1 g", 4, 35.50m, 150, hoy, 270),
            Crear("Antigripal Forte", 5, 22.00m, 90, hoy, 90),
            Crear("Omeprazol 20 mg", 6, 24.50m, 60, hoy, 28),
            Crear("Losartan 50 mg", 7, 31.00m, 70, hoy, 240),
            Crear("Crema de hidrocortisona 1%", 8, 19.90m, 12, hoy, -5)
        ];
    }

    private static Producto Crear(
        string nombre,
        int categoriaId,
        decimal precio,
        int cantidad,
        DateOnly hoy,
        int diasHastaVencimiento)
    {
        var producto = new Producto
        {
            Nombre = nombre,
            IdCategoria = categoriaId,
            Precio = precio,
            FechaCreacion = hoy
        };

        producto.Lotes.Add(new Lote
        {
            Producto = producto,
            Cantidad = cantidad,
            FechaIngreso = hoy,
            FechaVencimiento = hoy.AddDays(diasHastaVencimiento)
        });

        return producto;
    }
}
