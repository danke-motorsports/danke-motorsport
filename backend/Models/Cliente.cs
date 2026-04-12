using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("clientes")]
    public class Cliente
    {
        [Key] // Avisa o banco que esta é a Primary Key
        [Column("id")]
        public int Id { get; set; }

        [Required] // Impede que o nome fique vazio no banco (NOT NULL)
        [Column("nome")]
        public string Nome { get; set; } = string.Empty;

        [Required]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column("cpf")]
        public string Cpf { get; set; } = string.Empty;

        [Required]
        [Column("telefone")]
        public string Telefone { get; set; } = string.Empty;

        [Column("placa_veiculo")]
        public string PlacaVeiculo { get; set; } = string.Empty;

            public List<Revisao> Revisoes { get; set; } = new List<Revisao>();
    }
}