using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace VidaSalud.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "categoria",
                columns: table => new
                {
                    id_categoria = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nombre_categoria = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_categoria", x => x.id_categoria);
                });

            migrationBuilder.CreateTable(
                name: "producto",
                columns: table => new
                {
                    id_producto = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    id_categoria = table.Column<int>(type: "integer", nullable: false),
                    precio = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    fecha_creacion = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_producto", x => x.id_producto);
                    table.ForeignKey(
                        name: "fk_producto_categoria",
                        column: x => x.id_categoria,
                        principalTable: "categoria",
                        principalColumn: "id_categoria",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "lote",
                columns: table => new
                {
                    id_lote = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_producto = table.Column<int>(type: "integer", nullable: false),
                    cantidad = table.Column<int>(type: "integer", nullable: false),
                    fecha_ingreso = table.Column<DateOnly>(type: "date", nullable: false),
                    fecha_vencimiento = table.Column<DateOnly>(type: "date", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_lote", x => x.id_lote);
                    table.ForeignKey(
                        name: "fk_lote_producto",
                        column: x => x.id_producto,
                        principalTable: "producto",
                        principalColumn: "id_producto",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "categoria",
                columns: new[] { "id_categoria", "nombre_categoria" },
                values: new object[,]
                {
                    { 1, "Analgésicos" },
                    { 2, "Antibióticos" },
                    { 3, "Antiinflamatorios" },
                    { 4, "Vitaminas y Suplementos" },
                    { 5, "Antigripales" },
                    { 6, "Gastrointestinales" },
                    { 7, "Cardiovasculares" },
                    { 8, "Dermatológicos" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_categoria_nombre_categoria",
                table: "categoria",
                column: "nombre_categoria",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_lote_fecha_venc",
                table: "lote",
                column: "fecha_vencimiento");

            migrationBuilder.CreateIndex(
                name: "idx_lote_producto",
                table: "lote",
                column: "id_producto");

            migrationBuilder.CreateIndex(
                name: "idx_producto_nombre",
                table: "producto",
                column: "nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_producto_id_categoria",
                table: "producto",
                column: "id_categoria");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "lote");

            migrationBuilder.DropTable(
                name: "producto");

            migrationBuilder.DropTable(
                name: "categoria");
        }
    }
}
