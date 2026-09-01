using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace VidaSalud.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditoriaYSolicitudesBaja : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "activo",
                table: "usuario",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.CreateTable(
                name: "log_auditoria",
                columns: table => new
                {
                    id_log = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    actor = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: false),
                    accion = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    entidad = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    entidad_id = table.Column<int>(type: "integer", nullable: true),
                    fecha_utc = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    resultado = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    detalle = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_log_auditoria", x => x.id_log);
                    table.CheckConstraint("ck_log_auditoria_resultado", "resultado IN ('EXITOSO', 'FALLIDO', 'RECHAZADO')");
                });

            migrationBuilder.CreateTable(
                name: "solicitud_baja",
                columns: table => new
                {
                    id_solicitud = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    id_usuario = table.Column<int>(type: "integer", nullable: true),
                    nombre_usuario = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    motivo = table.Column<string>(type: "character varying(250)", maxLength: 250, nullable: true),
                    estado = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    fecha_solicitud = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    fecha_resolucion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    resuelta_por = table.Column<string>(type: "character varying(80)", maxLength: 80, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_solicitud_baja", x => x.id_solicitud);
                    table.CheckConstraint("ck_solicitud_baja_estado", "estado IN ('PENDIENTE', 'APROBADA', 'RECHAZADA')");
                    table.ForeignKey(
                        name: "fk_solicitud_baja_usuario",
                        column: x => x.id_usuario,
                        principalTable: "usuario",
                        principalColumn: "id_usuario",
                        onDelete: ReferentialAction.SetNull);
                });

            migrationBuilder.CreateIndex(
                name: "idx_log_auditoria_fecha",
                table: "log_auditoria",
                column: "fecha_utc");

            migrationBuilder.CreateIndex(
                name: "idx_solicitud_baja_estado",
                table: "solicitud_baja",
                column: "estado");

            migrationBuilder.CreateIndex(
                name: "idx_solicitud_baja_usuario",
                table: "solicitud_baja",
                column: "id_usuario");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "log_auditoria");

            migrationBuilder.DropTable(
                name: "solicitud_baja");

            migrationBuilder.DropColumn(
                name: "activo",
                table: "usuario");
        }
    }
}
