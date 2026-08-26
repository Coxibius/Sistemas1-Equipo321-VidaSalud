using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace VidaSalud.Api.DTOs;

public class RegistrarProductoDto
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(100, ErrorMessage = "El nombre no puede exceder 100 caracteres.")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "La categoría es obligatoria.")]
    [StringLength(50, ErrorMessage = "La categoría no puede exceder 50 caracteres.")]
    public string Categoria { get; set; } = string.Empty;

    [Required(ErrorMessage = "El precio es obligatorio.")]
    [Range(0, double.MaxValue, ErrorMessage = "El precio debe ser mayor o igual a 0.")]
    public decimal Precio { get; set; }

    [Required(ErrorMessage = "La cantidad es obligatoria.")]
    [Range(0, int.MaxValue, ErrorMessage = "La cantidad debe ser un entero mayor o igual a 0.")]
    public int Cantidad { get; set; }

    [Required(ErrorMessage = "La fecha de vencimiento es obligatoria.")]
    public DateOnly FechaVencimiento { get; set; }

    [JsonPropertyName("fecha_vencimiento")]
    public DateOnly? FechaVencimientoSnakeCase
    {
        get => null;
        set
        {
            if (value.HasValue && FechaVencimiento == default)
            {
                FechaVencimiento = value.Value;
            }
        }
    }
}
