using System.Net.Mail;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using VidaSalud.Api.Data;
using VidaSalud.Api.DTOs;
using VidaSalud.Api.Exceptions;
using VidaSalud.Api.Models;

namespace VidaSalud.Api.Services;

public class UsuarioService : IUsuarioService
{
    private static readonly HashSet<string> RolesValidos =
        new(StringComparer.OrdinalIgnoreCase) { "ADMINISTRADOR", "ENCARGADO", "AUXILIAR" };

    private readonly VidaSaludDbContext _context;
    private readonly IPasswordHasher<Usuario> _passwordHasher;
    private readonly IAuditoriaService _auditoria;

    public UsuarioService(
        VidaSaludDbContext context,
        IPasswordHasher<Usuario> passwordHasher,
        IAuditoriaService auditoria)
    {
        _context = context;
        _passwordHasher = passwordHasher;
        _auditoria = auditoria;
    }

    public async Task<IReadOnlyList<UsuarioResponseDto>> ListarAsync(
        CancellationToken cancellationToken = default)
    {
        return await _context.Usuarios
            .AsNoTracking()
            .OrderBy(usuario => usuario.Nombre)
            .Select(usuario => new UsuarioResponseDto
            {
                Id = usuario.IdUsuario,
                Nombre = usuario.Nombre,
                Usuario = usuario.NombreUsuario,
                Email = usuario.Email,
                Rol = usuario.Rol,
                FechaRegistro = usuario.FechaRegistro,
                Activo = usuario.Activo
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<UsuarioResponseDto> ObtenerAsync(
        int id,
        CancellationToken cancellationToken = default)
    {
        var usuario = await _context.Usuarios
            .AsNoTracking()
            .FirstOrDefaultAsync(item => item.IdUsuario == id, cancellationToken)
            ?? throw new UserNotFoundException();

        return Mapear(usuario);
    }

    public async Task<UsuarioResponseDto> CrearAsync(
        CrearUsuarioDto dto,
        string? actor,
        CancellationToken cancellationToken = default)
    {
        var datos = ValidarDatos(dto.Nombre, dto.Usuario, dto.Email, dto.Rol);

        if (datos.Rol == "ADMINISTRADOR")
        {
            throw new AdminProtectedException("El sistema permite un único administrador.");
        }

        ValidarContrasena(dto.Contrasena, obligatoria: true);
        await ValidarUnicidadAsync(datos.Usuario, datos.Email, null, cancellationToken);

        var usuario = new Usuario
        {
            Nombre = datos.Nombre,
            NombreUsuario = datos.Usuario,
            Email = datos.Email,
            Rol = datos.Rol,
            FechaRegistro = DateTime.UtcNow
        };
        usuario.PasswordHash = _passwordHasher.HashPassword(usuario, dto.Contrasena);

        _context.Usuarios.Add(usuario);
        await _context.SaveChangesAsync(cancellationToken);
        await _auditoria.RegistrarAsync(
            actor,
            "CREAR_USUARIO",
            "USUARIO",
            usuario.IdUsuario,
            detalle: $"Cuenta {usuario.NombreUsuario} creada con rol {usuario.Rol}.",
            cancellationToken: cancellationToken);
        return Mapear(usuario);
    }

    public async Task<UsuarioResponseDto> ActualizarAsync(
        int id,
        ActualizarUsuarioDto dto,
        string? actor,
        CancellationToken cancellationToken = default)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(item => item.IdUsuario == id, cancellationToken)
            ?? throw new UserNotFoundException();
        var datos = ValidarDatos(dto.Nombre, dto.Usuario, dto.Email, dto.Rol);

        if (usuario.Rol == "ADMINISTRADOR" && datos.Rol != "ADMINISTRADOR")
        {
            throw new AdminProtectedException("No se puede cambiar el rol del administrador.");
        }

        if (usuario.Rol != "ADMINISTRADOR" && datos.Rol == "ADMINISTRADOR")
        {
            throw new AdminProtectedException("No se puede registrar un segundo administrador.");
        }

        await ValidarUnicidadAsync(datos.Usuario, datos.Email, id, cancellationToken);

        usuario.Nombre = datos.Nombre;
        usuario.NombreUsuario = datos.Usuario;
        usuario.Email = datos.Email;
        usuario.Rol = datos.Rol;

        if (!string.IsNullOrWhiteSpace(dto.Contrasena))
        {
            ValidarContrasena(dto.Contrasena, obligatoria: false);
            usuario.PasswordHash = _passwordHasher.HashPassword(usuario, dto.Contrasena);
        }

        await _context.SaveChangesAsync(cancellationToken);
        await _auditoria.RegistrarAsync(
            actor,
            "EDITAR_USUARIO",
            "USUARIO",
            usuario.IdUsuario,
            detalle: $"Cuenta {usuario.NombreUsuario} actualizada.",
            cancellationToken: cancellationToken);
        return Mapear(usuario);
    }

    public async Task<UsuarioResponseDto> ActualizarPerfilAsync(
        int id,
        ActualizarPerfilDto dto,
        string? actor,
        CancellationToken cancellationToken = default)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(item => item.IdUsuario == id, cancellationToken)
            ?? throw new UserNotFoundException();

        var datos = ValidarDatos(dto.Nombre, usuario.NombreUsuario, dto.Email, usuario.Rol);
        await ValidarUnicidadAsync(usuario.NombreUsuario, datos.Email, id, cancellationToken);

        usuario.Nombre = datos.Nombre;
        usuario.Email = datos.Email;

        await _context.SaveChangesAsync(cancellationToken);
        await _auditoria.RegistrarAsync(
            actor ?? usuario.NombreUsuario,
            "ACTUALIZAR_PERFIL",
            "USUARIO",
            usuario.IdUsuario,
            detalle: "Nombre y correo personal actualizados.",
            cancellationToken: cancellationToken);

        return Mapear(usuario);
    }

    public async Task EliminarAsync(
        int id,
        string? actor,
        CancellationToken cancellationToken = default)
    {
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(item => item.IdUsuario == id, cancellationToken)
            ?? throw new UserNotFoundException();

        if (usuario.Rol == "ADMINISTRADOR")
        {
            throw new AdminProtectedException("No se puede eliminar al único administrador.");
        }

        var nombreUsuario = usuario.NombreUsuario;
        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync(cancellationToken);
        await _auditoria.RegistrarAsync(
            actor,
            "ELIMINAR_USUARIO",
            "USUARIO",
            id,
            detalle: $"Cuenta {nombreUsuario} eliminada por administración.",
            cancellationToken: cancellationToken);
    }

    public async Task<UsuarioResponseDto> IniciarSesionAsync(
        LoginDto dto,
        CancellationToken cancellationToken = default)
    {
        var nombreUsuario = (dto.Usuario ?? string.Empty).Trim().ToLowerInvariant();
        var contrasena = dto.Contrasena ?? string.Empty;
        var usuario = await _context.Usuarios
            .FirstOrDefaultAsync(item => item.NombreUsuario == nombreUsuario, cancellationToken);

        if (usuario is null)
        {
            await _auditoria.RegistrarAsync(
                nombreUsuario,
                "INICIAR_SESION",
                "USUARIO",
                resultado: "FALLIDO",
                detalle: "Credenciales inválidas.",
                cancellationToken: cancellationToken);
            throw new InvalidCredentialsException();
        }

        if (!usuario.Activo)
        {
            await _auditoria.RegistrarAsync(
                nombreUsuario,
                "INICIAR_SESION",
                "USUARIO",
                usuario.IdUsuario,
                "RECHAZADO",
                "Cuenta inactiva.",
                cancellationToken);
            throw new AccountInactiveException();
        }

        var resultado = _passwordHasher.VerifyHashedPassword(
            usuario,
            usuario.PasswordHash,
            contrasena);

        if (resultado == PasswordVerificationResult.Failed)
        {
            await _auditoria.RegistrarAsync(
                nombreUsuario,
                "INICIAR_SESION",
                "USUARIO",
                usuario.IdUsuario,
                "FALLIDO",
                "Credenciales inválidas.",
                cancellationToken);
            throw new InvalidCredentialsException();
        }

        if (resultado == PasswordVerificationResult.SuccessRehashNeeded)
        {
            usuario.PasswordHash = _passwordHasher.HashPassword(usuario, contrasena);
            await _context.SaveChangesAsync(cancellationToken);
        }

        await _auditoria.RegistrarAsync(
            usuario.NombreUsuario,
            "INICIAR_SESION",
            "USUARIO",
            usuario.IdUsuario,
            cancellationToken: cancellationToken);

        return Mapear(usuario);
    }

    private static (string Nombre, string Usuario, string? Email, string Rol) ValidarDatos(
        string? nombre,
        string? nombreUsuario,
        string? email,
        string? rol)
    {
        var nombreNormalizado = (nombre ?? string.Empty).Trim();
        var usuarioNormalizado = (nombreUsuario ?? string.Empty).Trim().ToLowerInvariant();
        var emailNormalizado = string.IsNullOrWhiteSpace(email) ? null : email.Trim().ToLowerInvariant();
        var rolNormalizado = (rol ?? string.Empty).Trim().ToUpperInvariant();

        if (nombreNormalizado.Length is 0 or > 80)
        {
            throw new BusinessValidationException("El nombre es obligatorio y no puede exceder 80 caracteres.");
        }

        if (usuarioNormalizado.Length is 0 or > 50)
        {
            throw new BusinessValidationException("El usuario es obligatorio y no puede exceder 50 caracteres.");
        }

        if (!RolesValidos.Contains(rolNormalizado))
        {
            throw new InvalidRoleException();
        }

        if (emailNormalizado is not null)
        {
            try
            {
                _ = new MailAddress(emailNormalizado);
            }
            catch (FormatException)
            {
                throw new BusinessValidationException("El correo electrónico no tiene un formato válido.");
            }
        }

        return (nombreNormalizado, usuarioNormalizado, emailNormalizado, rolNormalizado);
    }

    private static void ValidarContrasena(string? contrasena, bool obligatoria)
    {
        if (obligatoria && string.IsNullOrEmpty(contrasena))
        {
            throw new BusinessValidationException("La contraseña es obligatoria.");
        }

        if (!string.IsNullOrEmpty(contrasena) && contrasena.Length < 6)
        {
            throw new BusinessValidationException("La contraseña debe tener al menos 6 caracteres.");
        }
    }

    private async Task ValidarUnicidadAsync(
        string nombreUsuario,
        string? email,
        int? idActual,
        CancellationToken cancellationToken)
    {
        var usuarioDuplicado = await _context.Usuarios.AnyAsync(
            item => item.NombreUsuario == nombreUsuario && item.IdUsuario != idActual,
            cancellationToken);

        if (usuarioDuplicado)
        {
            throw new DuplicateUsernameException();
        }

        if (email is not null)
        {
            var emailDuplicado = await _context.Usuarios.AnyAsync(
                item => item.Email == email && item.IdUsuario != idActual,
                cancellationToken);

            if (emailDuplicado)
            {
                throw new BusinessValidationException("El correo electrónico ya está registrado.");
            }
        }
    }

    private static UsuarioResponseDto Mapear(Usuario usuario) => new()
    {
        Id = usuario.IdUsuario,
        Nombre = usuario.Nombre,
        Usuario = usuario.NombreUsuario,
        Email = usuario.Email,
        Rol = usuario.Rol,
        FechaRegistro = usuario.FechaRegistro,
        Activo = usuario.Activo
    };
}
