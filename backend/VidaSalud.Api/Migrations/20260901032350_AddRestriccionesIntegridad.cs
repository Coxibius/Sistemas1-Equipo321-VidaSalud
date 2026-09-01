using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VidaSalud.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRestriccionesIntegridad : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_solicitud_baja_usuario",
                table: "solicitud_baja");

            migrationBuilder.CreateIndex(
                name: "idx_solicitud_baja_usuario_pendiente",
                table: "solicitud_baja",
                column: "id_usuario",
                unique: true,
                filter: "estado = 'PENDIENTE'");

            migrationBuilder.AddCheckConstraint(
                name: "ck_producto_precio",
                table: "producto",
                sql: "precio >= 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_movimiento_cantidad",
                table: "movimiento_inventario",
                sql: "cantidad > 0");

            migrationBuilder.AddCheckConstraint(
                name: "ck_movimiento_estado",
                table: "movimiento_inventario",
                sql: "estado_movimiento IN ('REGISTRADO')");

            migrationBuilder.AddCheckConstraint(
                name: "ck_movimiento_tipo",
                table: "movimiento_inventario",
                sql: "tipo_movimiento IN ('ENTRADA', 'SALIDA')");

            migrationBuilder.AddCheckConstraint(
                name: "ck_lote_cantidad",
                table: "lote",
                sql: "cantidad >= 0");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "idx_solicitud_baja_usuario_pendiente",
                table: "solicitud_baja");

            migrationBuilder.DropCheckConstraint(
                name: "ck_producto_precio",
                table: "producto");

            migrationBuilder.DropCheckConstraint(
                name: "ck_movimiento_cantidad",
                table: "movimiento_inventario");

            migrationBuilder.DropCheckConstraint(
                name: "ck_movimiento_estado",
                table: "movimiento_inventario");

            migrationBuilder.DropCheckConstraint(
                name: "ck_movimiento_tipo",
                table: "movimiento_inventario");

            migrationBuilder.DropCheckConstraint(
                name: "ck_lote_cantidad",
                table: "lote");

            migrationBuilder.CreateIndex(
                name: "idx_solicitud_baja_usuario",
                table: "solicitud_baja",
                column: "id_usuario");
        }
    }
}
