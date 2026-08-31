using Microsoft.AspNetCore.Mvc;
using VidaSalud.Api.DTOs;
using VidaSalud.Api.Exceptions;
using VidaSalud.Api.Services;

namespace VidaSalud.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductosController : ControllerBase
{
    private readonly IProductoService _productoService;
    private readonly ILogger<ProductosController> _logger;

    public ProductosController(IProductoService productoService, ILogger<ProductosController> logger)
    {
        _productoService = productoService;
        _logger = logger;
    }

    /// <summary>
    /// HU02: Obtiene el inventario general o busca productos por nombre.
    /// </summary>
    /// <param name="search">Texto opcional para buscar coincidencias parciales por nombre.</param>
    /// <param name="cancellationToken">Token de cancelación de la solicitud.</param>
    /// <returns>Listado de productos con su stock actual.</returns>
    [HttpGet]
    [ProducesResponseType(typeof(IReadOnlyList<ProductoResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> BuscarProductos(
        [FromQuery] string? search,
        CancellationToken cancellationToken)
    {
        try
        {
            var productos = await _productoService.BuscarProductosAsync(search, cancellationToken);
            return Ok(productos);
        }
        catch (BusinessValidationException ex)
        {
            return BadRequest(new
            {
                code = ex.Code,
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no controlado al consultar productos.");
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                code = "INTERNAL_SERVER_ERROR",
                message = "Ocurrió un error inesperado al consultar el inventario."
            });
        }
    }

    /// <summary>
    /// HU01: Registrar un nuevo producto con su lote inicial.
    /// </summary>
    /// <param name="dto">Datos del producto y lote inicial</param>
    /// <returns>Producto y lote creado</returns>
    [HttpPost]
    [ProducesResponseType(typeof(ProductoResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> RegistrarProducto([FromBody] RegistrarProductoDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(new
            {
                code = "VALIDATION_ERROR",
                message = "Datos obligatorios incompletos o inválidos.",
                errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
            });
        }

        try
        {
            var resultado = await _productoService.RegistrarProductoAsync(dto);
            return StatusCode(StatusCodes.Status201Created, resultado);
        }
        catch (DuplicateProductException ex)
        {
            return Conflict(new
            {
                code = ex.Code,
                message = ex.Message
            });
        }
        catch (CategoryNotFoundException ex)
        {
            return BadRequest(new
            {
                code = ex.Code,
                message = ex.Message
            });
        }
        catch (BusinessValidationException ex)
        {
            return BadRequest(new
            {
                code = ex.Code,
                message = ex.Message
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error no controlado al registrar producto.");
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                code = "INTERNAL_SERVER_ERROR",
                message = "Ocurrió un error inesperado al procesar la solicitud."
            });
        }
    }
}
