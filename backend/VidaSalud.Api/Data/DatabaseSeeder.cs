using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using VidaSalud.Api.Models;

namespace VidaSalud.Api.Data;

public static class DatabaseSeeder
{
    public static async Task SembrarUsuariosDemostracionAsync(
        VidaSaludDbContext context,
        IPasswordHasher<Usuario> passwordHasher,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        var usuariosDemostracion = UsuarioFactory.ObtenerUsuariosDemostracion();
        var usuariosExistentes = await context.Usuarios
            .IgnoreQueryFilters()
            .ToDictionaryAsync(
                usuario => usuario.NombreUsuario.ToLower(),
                StringComparer.OrdinalIgnoreCase,
                cancellationToken);

        var fechaRegistro = DateTime.UtcNow;
        var usuariosNuevos = 0;
        var perfilesCompletados = 0;

        foreach (var datos in usuariosDemostracion)
        {
            if (!usuariosExistentes.TryGetValue(datos.NombreUsuario, out var usuarioExistente))
            {
                var usuarioNuevo = UsuarioFactory.Crear(datos, passwordHasher, fechaRegistro);
                context.Usuarios.Add(usuarioNuevo);
                usuariosExistentes[datos.NombreUsuario] = usuarioNuevo;
                usuariosNuevos++;
                continue;
            }

            // Una cuenta eliminada permanece reservada y no debe reaparecer por el seeder.
            if (!usuarioExistente.Eliminado &&
                UsuarioFactory.CompletarPerfilExistente(usuarioExistente, datos))
            {
                perfilesCompletados++;
            }
        }

        if (usuariosNuevos == 0 && perfilesCompletados == 0)
        {
            logger.LogInformation("Los usuarios de demostración ya están preparados.");
            return;
        }

        await context.SaveChangesAsync(cancellationToken);
        logger.LogInformation(
            "Usuarios de demostración preparados: {Nuevos} creados y {Actualizados} perfiles completados.",
            usuariosNuevos,
            perfilesCompletados);
    }

    public static async Task SembrarProductosDemostracionAsync(
        VidaSaludDbContext context,
        ILogger logger,
        CancellationToken cancellationToken = default)
    {
        var productosDemostracion = ProductoFactory.CrearProductosDemostracion(
            DateOnly.FromDateTime(DateTime.UtcNow));

        var nombresExistentes = await context.Productos
            .AsNoTracking()
            .Select(producto => producto.Nombre.ToLower())
            .ToListAsync(cancellationToken);

        var nombresRegistrados = nombresExistentes.ToHashSet(StringComparer.OrdinalIgnoreCase);
        var productosNuevos = productosDemostracion
            .Where(producto => !nombresRegistrados.Contains(producto.Nombre))
            .ToList();

        if (productosNuevos.Count == 0)
        {
            logger.LogInformation("Los productos de demostración ya están registrados.");
            return;
        }

        context.Productos.AddRange(productosNuevos);
        await context.SaveChangesAsync(cancellationToken);

        logger.LogInformation(
            "Se agregaron {Cantidad} productos de demostración al inventario.",
            productosNuevos.Count);
    }
}
