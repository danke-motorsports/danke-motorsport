using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddObservacaoAndFeedbackToRevisoes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE revisoes ADD COLUMN IF NOT EXISTS observacao_cliente TEXT;
                ALTER TABLE revisoes ADD COLUMN IF NOT EXISTS feedback_mecanico TEXT;
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                ALTER TABLE revisoes DROP COLUMN IF EXISTS feedback_mecanico;
                ALTER TABLE revisoes DROP COLUMN IF EXISTS observacao_cliente;
                """);
        }
    }
}
