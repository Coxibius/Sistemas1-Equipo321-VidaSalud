using Microsoft.EntityFrameworkCore;
using VidaSalud.Api.Models;

namespace VidaSalud.Api.Data;

public class VidaSaludDbContext : DbContext
{
    public VidaSaludDbContext(DbContextOptions<VidaSaludDbContext> options) : base(options)
    {
    }

    public DbSet<Categoria> Categorias => Set<Categoria>();
    public DbSet<Producto> Productos => Set<Producto>();
    public DbSet<Lote> Lotes => Set<Lote>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ==========================================
        // Configuración de Tabla: CATEGORIA
        // ==========================================
        modelBuilder.Entity<Categoria>(entity =>
        {
            entity.ToTable("categoria");
            entity.HasKey(c => c.IdCategoria);

            entity.Property(c => c.IdCategoria)
                .HasColumnName("id_categoria")
                .ValueGeneratedOnAdd();

            entity.Property(c => c.NombreCategoria)
                .HasColumnName("nombre_categoria")
                .HasMaxLength(50)
                .IsRequired();

            entity.HasIndex(c => c.NombreCategoria)
                .IsUnique();

            // Seed inicial de categorías
            entity.HasData(
                new Categoria { IdCategoria = 1, NombreCategoria = "Analgésicos" },
                new Categoria { IdCategoria = 2, NombreCategoria = "Antibióticos" },
                new Categoria { IdCategoria = 3, NombreCategoria = "Antiinflamatorios" },
                new Categoria { IdCategoria = 4, NombreCategoria = "Vitaminas y Suplementos" },
                new Categoria { IdCategoria = 5, NombreCategoria = "Antigripales" },
                new Categoria { IdCategoria = 6, NombreCategoria = "Gastrointestinales" },
                new Categoria { IdCategoria = 7, NombreCategoria = "Cardiovasculares" },
                new Categoria { IdCategoria = 8, NombreCategoria = "Dermatológicos" }
            );
        });

        // ==========================================
        // Configuración de Tabla: PRODUCTO
        // ==========================================
        modelBuilder.Entity<Producto>(entity =>
        {
            entity.ToTable("producto");
            entity.HasKey(p => p.IdProducto);

            entity.Property(p => p.IdProducto)
                .HasColumnName("id_producto")
                .ValueGeneratedOnAdd();

            entity.Property(p => p.Nombre)
                .HasColumnName("nombre")
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(p => p.IdCategoria)
                .HasColumnName("id_categoria")
                .IsRequired();

            entity.Property(p => p.Precio)
                .HasColumnName("precio")
                .HasColumnType("decimal(10,2)")
                .IsRequired();

            entity.Property(p => p.FechaCreacion)
                .HasColumnName("fecha_creacion")
                .IsRequired();

            entity.HasIndex(p => p.Nombre)
                .IsUnique()
                .HasDatabaseName("idx_producto_nombre");

            entity.HasOne(p => p.Categoria)
                .WithMany(c => c.Productos)
                .HasForeignKey(p => p.IdCategoria)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_producto_categoria");
        });

        // ==========================================
        // Configuración de Tabla: LOTE
        // ==========================================
        modelBuilder.Entity<Lote>(entity =>
        {
            entity.ToTable("lote");
            entity.HasKey(l => l.IdLote);

            entity.Property(l => l.IdLote)
                .HasColumnName("id_lote")
                .ValueGeneratedOnAdd();

            entity.Property(l => l.IdProducto)
                .HasColumnName("id_producto")
                .IsRequired();

            entity.Property(l => l.Cantidad)
                .HasColumnName("cantidad")
                .IsRequired();

            entity.Property(l => l.FechaIngreso)
                .HasColumnName("fecha_ingreso")
                .IsRequired();

            entity.Property(l => l.FechaVencimiento)
                .HasColumnName("fecha_vencimiento")
                .IsRequired();

            entity.Ignore(l => l.EstadoVencimiento);

            entity.HasIndex(l => l.IdProducto)
                .HasDatabaseName("idx_lote_producto");

            entity.HasIndex(l => l.FechaVencimiento)
                .HasDatabaseName("idx_lote_fecha_venc");

            entity.HasOne(l => l.Producto)
                .WithMany(p => p.Lotes)
                .HasForeignKey(l => l.IdProducto)
                .OnDelete(DeleteBehavior.Cascade)
                .HasConstraintName("fk_lote_producto");
        });
    }
}
