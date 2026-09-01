using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using VidaSalud.Api.Data;
using VidaSalud.Api.Models;
using VidaSalud.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// En el entorno académico los eventos se revisan desde la terminal.
// Evita depender del Registro de eventos de Windows, que requiere permisos elevados.
builder.Logging.ClearProviders();
builder.Logging.AddConsole();

// 1. Configurar DbContext con PostgreSQL
builder.Services.AddDbContext<VidaSaludDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Inyección de Dependencias de Servicios
builder.Services.AddScoped<IProductoService, ProductoService>();
builder.Services.AddScoped<IMovimientoService, MovimientoService>();
builder.Services.AddScoped<IVencimientoService, VencimientoService>();
builder.Services.AddScoped<IAuditoriaService, AuditoriaService>();
builder.Services.AddScoped<ISolicitudBajaService, SolicitudBajaService>();
builder.Services.AddScoped<IUsuarioService, UsuarioService>();
builder.Services.AddScoped<IPasswordHasher<Usuario>, PasswordHasher<Usuario>>();

// 3. Controladores y JSON Options
builder.Services.AddControllers();

// 4. CORS limitado al frontend web de desarrollo. Expo Go usa solicitudes nativas.
var origenesPermitidos = builder.Configuration
    .GetSection("Cors:AllowedOrigins")
    .Get<string[]>() ?? ["http://localhost:8081", "http://127.0.0.1:8081"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins(origenesPermitidos)
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// 5. OpenAPI / Swagger
builder.Services.AddOpenApi();

var app = builder.Build();

if (builder.Configuration.GetValue<bool>("SeedDemoData"))
{
    await using var scope = app.Services.CreateAsyncScope();
    var context = scope.ServiceProvider.GetRequiredService<VidaSaludDbContext>();
    var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher<Usuario>>();
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>()
        .CreateLogger("DatabaseSeeder");

    await context.Database.MigrateAsync();
    await DatabaseSeeder.SembrarUsuariosDemostracionAsync(context, passwordHasher, logger);
    await DatabaseSeeder.SembrarProductosDemostracionAsync(context, logger);
}

// Configuración del pipeline HTTP
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("Frontend");

if (!app.Environment.IsDevelopment())
{
    app.UseHttpsRedirection();
}

app.UseAuthorization();

app.MapGet("/api/health", () => Results.Ok(new
{
    status = "ok",
    serverTimeUtc = DateTime.UtcNow
}));

app.MapControllers();

app.Run();
