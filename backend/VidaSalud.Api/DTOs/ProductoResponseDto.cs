using System.Text.Json.Serialization;

namespace VidaSalud.Api.DTOs;

public class ProductoResponseDto
{
    [JsonPropertyName("id")]
    public int Id { get; set; }

    [JsonPropertyName("nombre")]
    public string Nombre { get; set; } = string.Empty;

    [JsonPropertyName("categoria")]
    public string Categoria { get; set; } = string.Empty;

    [JsonPropertyName("precio")]
    public decimal Precio { get; set; }

    [JsonPropertyName("cantidad")]
    public int Cantidad { get; set; }

    [JsonPropertyName("fechaVencimiento")]
    public string FechaVencimiento { get; set; } = string.Empty;

    [JsonPropertyName("creadoEn")]
    public string? CreadoEn { get; set; }

    [JsonPropertyName("loteId")]
    public int LoteId { get; set; }

    [JsonPropertyName("estadoVencimiento")]
    public string EstadoVencimiento { get; set; } = "Vigente";
}
