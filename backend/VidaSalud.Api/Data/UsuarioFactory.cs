using Microsoft.AspNetCore.Identity;
using VidaSalud.Api.Models;

namespace VidaSalud.Api.Data;

public static class UsuarioFactory
{
    public static IReadOnlyList<UsuarioDemostracion> ObtenerUsuariosDemostracion()
    {
        return
        [
            new(
                "Ana Patricia Rojas",
                "admin",
                "ana.rojas@vidasalud.demo",
                "ADMINISTRADOR",
                "admin123",
                "Administrador VidaSalud",
                "admin@vidasalud.local"),
            new(
                "Víctor Hugo Mamani",
                "victor",
                "victor.mamani@vidasalud.demo",
                "AUXILIAR",
                "victor123",
                "Víctor",
                "victor@vidasalud.local"),
            new(
                "María López Vargas",
                "maria",
                "maria.lopez@vidasalud.demo",
                "ENCARGADO",
                "maria123",
                "María López",
                "maria@vidasalud.local"),
            new(
                "José Roberto Márquez",
                "jose",
                "jose.marquez@vidasalud.demo",
                "ENCARGADO",
                "jose123",
                "Jose Roberto Marquez",
                "jose@email.com"),
            new(
                "Camila Rojas Pérez",
                "camila",
                "camila.rojas@vidasalud.demo",
                "AUXILIAR",
                "camila123"),
            new(
                "Diego Flores Choque",
                "diego",
                "diego.flores@vidasalud.demo",
                "ENCARGADO",
                "diego123"),
            new(
                "Lucía Mendoza Quispe",
                "lucia",
                "lucia.mendoza@vidasalud.demo",
                "AUXILIAR",
                "lucia123"),
            new(
                "Carlos Condori Vargas",
                "carlos",
                "carlos.condori@vidasalud.demo",
                "ENCARGADO",
                "carlos123")
        ];
    }

    public static Usuario Crear(
        UsuarioDemostracion datos,
        IPasswordHasher<Usuario> passwordHasher,
        DateTime fechaRegistro)
    {
        var usuario = new Usuario
        {
            Nombre = datos.Nombre,
            NombreUsuario = datos.NombreUsuario,
            Email = datos.Email,
            Rol = datos.Rol,
            FechaRegistro = fechaRegistro,
            Activo = true
        };

        usuario.PasswordHash = passwordHasher.HashPassword(usuario, datos.ContrasenaInicial);
        return usuario;
    }

    public static bool CompletarPerfilExistente(
        Usuario usuario,
        UsuarioDemostracion datos)
    {
        var modificado = false;

        if (string.IsNullOrWhiteSpace(usuario.Nombre) ||
            EsIgual(usuario.Nombre, datos.NombreAnterior))
        {
            usuario.Nombre = datos.Nombre;
            modificado = true;
        }

        if (string.IsNullOrWhiteSpace(usuario.Email) ||
            EsIgual(usuario.Email, datos.EmailAnterior))
        {
            usuario.Email = datos.Email;
            modificado = true;
        }

        return modificado;
    }

    private static bool EsIgual(string? valor, string? valorEsperado) =>
        valorEsperado is not null &&
        string.Equals(valor, valorEsperado, StringComparison.OrdinalIgnoreCase);
}

public sealed record UsuarioDemostracion(
    string Nombre,
    string NombreUsuario,
    string Email,
    string Rol,
    string ContrasenaInicial,
    string? NombreAnterior = null,
    string? EmailAnterior = null);
