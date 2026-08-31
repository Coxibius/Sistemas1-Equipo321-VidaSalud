namespace VidaSalud.Api.DTOs;

public class ActualizarUsuarioDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Usuario { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string Rol { get; set; } = string.Empty;
    public string? Contrasena { get; set; }
}
