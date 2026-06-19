using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.EntityFrameworkCore.Metadata.Internal;

namespace backend.Models
{
[Table("revisoes")]
public class Revisao {

    [Key] //informa que é pk
    [Column("id_revisao")]//camel_case
    public int IdRevisao { get; set; }//Pascal_Case

    [Required] //not null
    [Column("status_revisao")]
    public string StatusRevisao { get; set; } = string.Empty;

    [Required]
    [Column("tipo_revisao")]

    public int TipoRevisao { get; set; }

    [Required]
    [Column("dat_finalizacao")]
    
    public DateTime DatFinalizacao { get; set; }

    [Required]
    [Column("dat_agendamento")]

    public DateTime DatAgendamento { get; set; }

    // fk de cliente
        [Column("id_cliente")]
        public int IdCliente { get; set; }

        [ForeignKey("IdCliente")]
        public Cliente? Cliente { get; set; }
    // fk de funcionario
        [Column("id_funcionario")]
        public int? IdFuncionario { get; set; }

        [ForeignKey("IdFuncionario")]
        public Funcionario? Funcionario { get; set; }

        [Column("observacao_cliente")]
        public string? ObservacaoCliente { get; set; }

        [Column("feedback_mecanico")]
        public string? FeedbackMecanico { get; set; }
    }
}