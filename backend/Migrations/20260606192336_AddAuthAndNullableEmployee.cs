using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddAuthAndNullableEmployee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_revisoes_funcionarios_id_funcionario",
                table: "revisoes");

            migrationBuilder.AlterColumn<int>(
                name: "id_funcionario",
                table: "revisoes",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<string>(
                name: "email",
                table: "funcionarios",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "senha",
                table: "funcionarios",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "senha",
                table: "clientes",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_revisoes_funcionarios_id_funcionario",
                table: "revisoes",
                column: "id_funcionario",
                principalTable: "funcionarios",
                principalColumn: "id_funcionario");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_revisoes_funcionarios_id_funcionario",
                table: "revisoes");

            migrationBuilder.DropColumn(
                name: "email",
                table: "funcionarios");

            migrationBuilder.DropColumn(
                name: "senha",
                table: "funcionarios");

            migrationBuilder.DropColumn(
                name: "senha",
                table: "clientes");

            migrationBuilder.AlterColumn<int>(
                name: "id_funcionario",
                table: "revisoes",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_revisoes_funcionarios_id_funcionario",
                table: "revisoes",
                column: "id_funcionario",
                principalTable: "funcionarios",
                principalColumn: "id_funcionario",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
