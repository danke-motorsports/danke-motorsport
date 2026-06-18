using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddUniqueEmailConstraints : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_funcionarios_email",
                table: "funcionarios",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_clientes_email",
                table: "clientes",
                column: "email",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_funcionarios_email",
                table: "funcionarios");

            migrationBuilder.DropIndex(
                name: "IX_clientes_email",
                table: "clientes");
        }
    }
}
