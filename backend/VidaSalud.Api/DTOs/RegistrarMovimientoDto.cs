namespace VidaSalud.Api.DTOs;

public class RegistrarMovimientoDto
{
    public int ProductoId { get; set; }
    public string Tipo { get; set; } = string.Empty;
    public int Cantidad { get; set; }
    public string Responsable { get; set; } = string.Empty;
}
