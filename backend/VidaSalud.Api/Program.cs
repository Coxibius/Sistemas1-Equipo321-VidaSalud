using Microsoft.EntityFrameworkCore;
using VidaSalud.Api.Data;
using VidaSalud.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Configurar DbContext con PostgreSQL
builder.Services.AddDbContext<VidaSaludDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Inyección de Dependencias de Servicios
builder.Services.AddScoped<IProductoService, ProductoService>();

// 3. Controladores y JSON Options
builder.Services.AddControllers();

// 4. Configuración de CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 5. OpenAPI / Swagger
builder.Services.AddOpenApi();

var app = builder.Build();

// Configuración del pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAll");

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
