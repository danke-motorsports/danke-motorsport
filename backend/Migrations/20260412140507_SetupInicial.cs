using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class SetupInicial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "clientes",
                columns: table => new
                {
                    id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome = table.Column<string>(type: "text", nullable: false),
                    email = table.Column<string>(type: "text", nullable: false),
                    cpf = table.Column<string>(type: "text", nullable: false),
                    telefone = table.Column<string>(type: "text", nullable: false),
                    placa_veiculo = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_clientes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "funcionarios",
                columns: table => new
                {
                    id_funcionario = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    nome_funcionario = table.Column<string>(type: "text", nullable: false),
                    tipo_funcionario = table.Column<int>(type: "integer", nullable: false),
                    cargo = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_funcionarios", x => x.id_funcionario);
                });

            migrationBuilder.CreateTable(
                name: "revisoes",
                columns: table => new
                {
                    id_revisao = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    status_revisao = table.Column<string>(type: "text", nullable: false),
                    tipo_revisao = table.Column<int>(type: "integer", nullable: false),
                    dat_finalizacao = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    dat_agendamento = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    id_cliente = table.Column<int>(type: "integer", nullable: false),
                    id_funcionario = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_revisoes", x => x.id_revisao);
                    table.ForeignKey(
                        name: "FK_revisoes_clientes_id_cliente",
                        column: x => x.id_cliente,
                        principalTable: "clientes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_revisoes_funcionarios_id_funcionario",
                        column: x => x.id_funcionario,
                        principalTable: "funcionarios",
                        principalColumn: "id_funcionario",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_revisoes_id_cliente",
                table: "revisoes",
                column: "id_cliente");

            migrationBuilder.CreateIndex(
                name: "IX_revisoes_id_funcionario",
                table: "revisoes",
                column: "id_funcionario");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "revisoes");

            migrationBuilder.DropTable(
                name: "clientes");

            migrationBuilder.DropTable(
                name: "funcionarios");
        }
    }
}
