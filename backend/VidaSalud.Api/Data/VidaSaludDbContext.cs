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
    public DbSet<MovimientoInventario> MovimientosInventario => Set<MovimientoInventario>();
    public DbSet<Usuario> Usuarios => Set<Usuario>();

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

        modelBuilder.Entity<MovimientoInventario>(entity =>
        {
            entity.ToTable("movimiento_inventario");
            entity.HasKey(m => m.IdMovimiento);

            entity.Property(m => m.IdMovimiento)
                .HasColumnName("id_movimiento")
                .ValueGeneratedOnAdd();

            entity.Property(m => m.IdProducto)
                .HasColumnName("id_producto")
                .IsRequired();

            entity.Property(m => m.TipoMovimiento)
                .HasColumnName("tipo_movimiento")
                .HasMaxLength(10)
                .IsRequired();

            entity.Property(m => m.Cantidad)
                .HasColumnName("cantidad")
                .IsRequired();

            entity.Property(m => m.Fecha)
                .HasColumnName("fecha")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            entity.Property(m => m.EstadoMovimiento)
                .HasColumnName("estado_movimiento")
                .HasMaxLength(15)
                .IsRequired();

            entity.Property(m => m.Responsable)
                .HasColumnName("responsable")
                .HasMaxLength(80)
                .IsRequired();

            entity.HasIndex(m => m.IdProducto)
                .HasDatabaseName("idx_mov_producto");

            entity.HasOne(m => m.Producto)
                .WithMany(p => p.Movimientos)
                .HasForeignKey(m => m.IdProducto)
                .OnDelete(DeleteBehavior.Restrict)
                .HasConstraintName("fk_mov_producto");
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.ToTable("usuario", table =>
                table.HasCheckConstraint(
                    "ck_usuario_rol",
                    "rol IN ('ADMINISTRADOR', 'ENCARGADO', 'AUXILIAR')"));
            entity.HasKey(usuario => usuario.IdUsuario);

            entity.Property(usuario => usuario.IdUsuario)
                .HasColumnName("id_usuario")
                .ValueGeneratedOnAdd();

            entity.Property(usuario => usuario.Nombre)
                .HasColumnName("nombre")
                .HasMaxLength(80)
                .IsRequired();

            entity.Property(usuario => usuario.NombreUsuario)
                .HasColumnName("nombre_usuario")
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(usuario => usuario.Email)
                .HasColumnName("email")
                .HasMaxLength(100);

            entity.Property(usuario => usuario.Rol)
                .HasColumnName("rol")
                .HasMaxLength(20)
                .IsRequired();

            entity.Property(usuario => usuario.PasswordHash)
                .HasColumnName("password_hash")
                .HasMaxLength(500)
                .IsRequired();

            entity.Property(usuario => usuario.FechaRegistro)
                .HasColumnName("fecha_registro")
                .HasColumnType("timestamp with time zone")
                .IsRequired();

            entity.HasIndex(usuario => usuario.NombreUsuario)
                .IsUnique()
                .HasDatabaseName("idx_usuario_nombre_usuario");

            entity.HasIndex(usuario => usuario.Email)
                .IsUnique()
                .HasDatabaseName("idx_usuario_email");
        });
    }
}
