using System;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;
using VidaSalud.Api.Models;

#nullable disable

namespace VidaSalud.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUsuarios : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "usuario",
                columns: table => new
                {
                    id_usuario = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nombre = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    nombre_usuario = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    email = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: true),
                    rol = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    fecha_registro = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuario", x => x.id_usuario);
                    table.CheckConstraint("ck_usuario_rol", "rol IN ('ADMINISTRADOR', 'ENCARGADO', 'AUXILIAR')");
                });

            migrationBuilder.CreateIndex(
                name: "idx_usuario_email",
                table: "usuario",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_usuario_nombre_usuario",
                table: "usuario",
                column: "nombre_usuario",
                unique: true);

            var passwordHasher = new PasswordHasher<Usuario>();
            var fechaRegistro = new DateTime(2026, 8, 31, 0, 0, 0, DateTimeKind.Utc);
            var administrador = new Usuario { NombreUsuario = "admin", Rol = "ADMINISTRADOR" };
            var victor = new Usuario { NombreUsuario = "victor", Rol = "AUXILIAR" };
            var maria = new Usuario { NombreUsuario = "maria", Rol = "ENCARGADO" };

            migrationBuilder.InsertData(
                table: "usuario",
                columns: new[]
                {
                    "nombre", "nombre_usuario", "email", "rol", "password_hash", "fecha_registro"
                },
                values: new object[,]
                {
                    {
                        "Administrador VidaSalud", "admin", "admin@vidasalud.local", "ADMINISTRADOR",
                        passwordHasher.HashPassword(administrador, "admin123"), fechaRegistro
                    },
                    {
                        "Víctor", "victor", "victor@vidasalud.local", "AUXILIAR",
                        passwordHasher.HashPassword(victor, "victor123"), fechaRegistro
                    },
                    {
                        "María López", "maria", "maria@vidasalud.local", "ENCARGADO",
                        passwordHasher.HashPassword(maria, "maria123"), fechaRegistro
                    }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(name: "usuario");
        }
    }
}
