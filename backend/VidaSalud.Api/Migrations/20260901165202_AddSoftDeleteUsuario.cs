using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace VidaSalud.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSoftDeleteUsuario : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "eliminado",
                table: "usuario",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "eliminado",
                table: "usuario");
        }
    }
}
