using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace backend.Models
{
    [Table("funcionarios")]

    public class Funcionario
    {
        [Key]
        [Column("id_funcionario")]//camel_case

        public int IdFuncionario { get; set; }//PascalCase

        [Required]
        [Column("nome_funcionario")]
        public string NomeFuncionario { get; set; } = string.Empty;

        [Required]
        [Column("tipo_funcionario")]

        public int TipoFuncionario { get; set; }

        [Required]
        [Column("cargo")]
        public int Cargo { get; set; }

        [Required]
        [Column("email")]
        public string Email { get; set; } = string.Empty;

        [Required]
        [Column("senha")]
        [JsonIgnore(Condition = JsonIgnoreCondition.WhenWriting)]
        public string Senha { get; set; } = string.Empty;

        [JsonIgnore]
        public List<Revisao> Revisoes { get; set; } = new List<Revisao>();
    }
}