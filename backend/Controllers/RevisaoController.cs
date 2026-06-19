using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using System.Security.Claims;

namespace backend.Controllers;

/// <summary>
/// Controller para gerenciamento de Revisões (agendamentos de serviço).
/// Implementa lógica de negócio com separação por role:
/// Clientes criam e visualizam suas próprias revisões;
/// Funcionários gerenciam revisões, atualizam status e se auto-atribuem.
/// </summary>
[ApiController]
[Route("danke/[controller]")]
public class RevisaoController : ControllerBase
{
    private readonly AppDbContext _context;

    /// <summary>
    /// Inicializa o controller com o contexto de banco de dados.
    /// </summary>
    /// <param name="context">Contexto do Entity Framework Core.</param>
    public RevisaoController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Retorna revisões filtradas pela role do usuário autenticado:
    /// Cliente recebe apenas as suas revisões;
    /// Funcionário recebe as revisões associadas a ele.
    /// </summary>
    /// <returns>
    /// 200 OK com lista de revisões filtrada por role.
    /// 401 Unauthorized se o claim de ID não estiver presente.
    /// 403 Forbidden se a role for inválida.
    /// </returns>
    [HttpGet]
    [Authorize]
    public IActionResult ListarRevisoes()
    {
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized();

        int userId = int.Parse(userIdClaim.Value);

        if (role == "Cliente")
        {
            var revisoes = _context.Revisoes
                .Where(r => r.IdCliente == userId)
                .ToList();
            return Ok(revisoes);
        }
        else if (role == "Funcionario")
        {
            var revisoes = _context.Revisoes
                .Where(r => r.IdFuncionario == userId)
                .ToList();
            return Ok(revisoes);
        }
        else if (role == "Admin")
        {
            var revisoes = _context.Revisoes
                .Include(r => r.Cliente)
                .Include(r => r.Funcionario)
                .ToList();
            return Ok(revisoes);
        }

        return Forbid();
    }

    /// <summary>
    /// Retorna todas as revisões do cliente autenticado, ordenadas por data de agendamento decrescente.
    /// Exclusivo para usuários com role <c>Cliente</c>.
    /// </summary>
    /// <returns>200 OK com lista de revisões do cliente ordenadas por data.</returns>
    [HttpGet("cliente")]
    [Authorize(Roles = "Cliente")]
    public IActionResult ObterRevisoesCliente()
    {
        var clienteIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (clienteIdClaim == null)
            return Unauthorized();

        int clienteId = int.Parse(clienteIdClaim.Value);
        var revisoes = _context.Revisoes
            .Where(r => r.IdCliente == clienteId)
            .OrderByDescending(r => r.DatAgendamento)
            .ToList();

        return Ok(revisoes);
    }

    /// <summary>
    /// Retorna as revisões associadas ao funcionário autenticado, incluindo dados do cliente.
    /// Exclusivo para usuários com role <c>Funcionario</c>.
    /// </summary>
    /// <returns>200 OK com lista de revisões do funcionário (com dados do cliente incluídos).</returns>
    [HttpGet("funcionario")]
    [Authorize(Roles = "Funcionario,Admin")]
    public IActionResult ObterRevisoesFuncionario()
    {
        var funcionarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (funcionarioIdClaim == null)
            return Unauthorized();

        int funcionarioId = int.Parse(funcionarioIdClaim.Value);
        var revisoes = _context.Revisoes
            .Include(r => r.Cliente)
            .Where(r => r.IdFuncionario == funcionarioId)
            .ToList();

        return Ok(revisoes);
    }

    /// <summary>
    /// Retorna todas as revisões com StatusRevisao == "Pendente" (sem funcionário atribuído).
    /// Usado pelo dashboard do funcionário para exibir o Kanban de revisões disponíveis.
    /// Exclusivo para usuários com role <c>Funcionario</c>.
    /// </summary>
    /// <returns>200 OK com lista de revisões pendentes (com dados do cliente incluídos).</returns>
    [HttpGet("pendentes")]
    [Authorize(Roles = "Funcionario,Admin")]
    public IActionResult ObterRevisoesPendentes()
    {
        var pendentes = _context.Revisoes
            .Include(r => r.Cliente)
            .Where(r => r.StatusRevisao == "Pendente" && r.IdFuncionario == null)
            .ToList();

        return Ok(pendentes);
    }

    /// <summary>
    /// Retorna uma revisão específica por ID, incluindo dados do cliente.
    /// Clientes só podem acessar suas próprias revisões; Funcionários podem acessar qualquer uma.
    /// </summary>
    /// <param name="id">ID da revisão.</param>
    /// <returns>
    /// 200 OK com dados da revisão.
    /// 401 Unauthorized se o claim de ID não estiver presente.
    /// 403 Forbidden se um Cliente tentar acessar revisão de outro.
    /// 404 Not Found se a revisão não existir.
    /// </returns>
    [HttpGet("{id}")]
    [Authorize]
    public IActionResult ObterRevisao(int id)
    {
        var revisao = _context.Revisoes.Include(r => r.Cliente).FirstOrDefault(r => r.IdRevisao == id);
        if (revisao == null)
            return NotFound();

        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized();

        int userId = int.Parse(userIdClaim.Value);

        if (role == "Cliente" && revisao.IdCliente != userId)
        {
            return Forbid();
        }

        return Ok(revisao);
    }

    /// <summary>
    /// Cria uma nova revisão para o cliente autenticado.
    /// O <c>IdCliente</c> é extraído diretamente do JWT (não deve ser enviado no body).
    /// A revisão é criada com StatusRevisao = "Pendente" e sem funcionário atribuído.
    /// Exclusivo para usuários com role <c>Cliente</c>.
    /// </summary>
    /// <param name="request">Dados da revisão: TipoRevisao (1=Bronze, 2=Silver, 3=Gold) e DatAgendamento.</param>
    /// <returns>
    /// 201 Created com dados da revisão criada.
    /// 400 BadRequest se os dados forem inválidos.
    /// 401 Unauthorized se o claim de ID não estiver presente.
    /// </returns>
    [HttpPost]
    [Authorize(Roles = "Cliente")]
    public IActionResult CriarRevisao([FromBody] CriarRevisaoRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var clienteIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (clienteIdClaim == null)
            return Unauthorized();

        int clienteId = int.Parse(clienteIdClaim.Value);

        var novaRevisao = new Revisao
        {
            StatusRevisao = "Pendente",
            TipoRevisao = request.TipoRevisao,
            DatAgendamento = request.DatAgendamento.ToUniversalTime(),
            DatFinalizacao = request.DatAgendamento.ToUniversalTime(), // placeholder; atualizado ao concluir
            IdCliente = clienteId,
            IdFuncionario = null, // Inicialmente não atrelado a funcionário
            ObservacaoCliente = string.IsNullOrWhiteSpace(request.ObservacaoCliente)
                ? null
                : request.ObservacaoCliente.Trim()
        };

        _context.Revisoes.Add(novaRevisao);
        _context.SaveChanges();

        return CreatedAtAction(nameof(ObterRevisao), new { id = novaRevisao.IdRevisao }, novaRevisao);
    }

    /// <summary>
    /// Atualiza o status de uma revisão e auto-atribui o funcionário na primeira interação.
    /// Se <c>IdFuncionario</c> for null, o funcionário autenticado é automaticamente atribuído.
    /// Quando o status for "Concluído", <c>DatFinalizacao</c> é definida para o momento atual.
    /// Exclusivo para usuários com role <c>Funcionario</c>.
    /// </summary>
    /// <param name="id">ID da revisão a atualizar.</param>
    /// <param name="request">Novo status: "Pendente", "Em Andamento" ou "Concluído".</param>
    /// <returns>
    /// 200 OK com dados atualizados da revisão.
    /// 400 BadRequest se o status for inválido.
    /// 401 Unauthorized se o claim de ID não estiver presente.
    /// 404 Not Found se a revisão não existir.
    /// </returns>
    [HttpPatch("{id}")]
    [Authorize(Roles = "Funcionario,Admin")]
    public IActionResult AtualizarStatus(int id, [FromBody] AtualizarStatusRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var statusPermitidos = new[] { "Pendente", "Em Andamento", "Concluído" };
        if (!statusPermitidos.Contains(request.StatusRevisao))
        {
            return BadRequest(new { message = "Status inválido. Use: Pendente, Em Andamento ou Concluído." });
        }

        var revisao = _context.Revisoes.Find(id);
        if (revisao == null)
            return NotFound();

        var funcionarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (funcionarioIdClaim == null)
            return Unauthorized();

        int funcionarioId = int.Parse(funcionarioIdClaim.Value);
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (role != "Admin" && revisao.IdFuncionario != null && revisao.IdFuncionario != funcionarioId)
        {
            return StatusCode(403, new { message = "Esta revisão já está atribuída a outro funcionário." });
        }

        // Se a revisão ainda não tem funcionário associado (primeira interação), assinala o FuncionarioId
        if (revisao.IdFuncionario == null)
        {
            revisao.IdFuncionario = funcionarioId;
        }

        revisao.StatusRevisao = request.StatusRevisao;

        if (request.FeedbackMecanico != null)
        {
            revisao.FeedbackMecanico = string.IsNullOrWhiteSpace(request.FeedbackMecanico)
                ? null
                : request.FeedbackMecanico.Trim();
        }

        // Se o status for concluído, define a data de finalização
        if (request.StatusRevisao == "Concluído")
        {
            revisao.DatFinalizacao = DateTime.UtcNow;
        }

        _context.SaveChanges();

        return Ok(revisao);
    }

    /// <summary>
    /// Remove uma revisão do banco de dados.
    /// Clientes só podem remover suas próprias revisões; Funcionários podem remover qualquer uma.
    /// </summary>
    /// <param name="id">ID da revisão a remover.</param>
    /// <returns>
    /// 204 No Content em caso de sucesso.
    /// 401 Unauthorized se o claim de ID não estiver presente.
    /// 403 Forbidden se um Cliente tentar remover revisão de outro.
    /// 404 Not Found se a revisão não existir.
    /// </returns>
    [HttpDelete("{id}")]
    [Authorize]
    public IActionResult RemoverRevisao(int id)
    {
        var revisao = _context.Revisoes.Find(id);
        if (revisao == null)
            return NotFound();

        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
            return Unauthorized();

        int userId = int.Parse(userIdClaim.Value);

        if (role == "Cliente" && revisao.IdCliente != userId)
        {
            return Forbid();
        }

        _context.Revisoes.Remove(revisao);
        _context.SaveChanges();
        return NoContent();
    }

    /// <summary>
    /// Atualiza uma revisão completa.
    /// Exclusivo para administradores.
    /// </summary>
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public IActionResult AtualizarRevisao(int id, [FromBody] Revisao revisaoAtualizada)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var revisao = _context.Revisoes.Find(id);
        if (revisao == null)
            return NotFound();

        revisao.TipoRevisao = revisaoAtualizada.TipoRevisao;
        revisao.StatusRevisao = revisaoAtualizada.StatusRevisao;
        revisao.DatAgendamento = revisaoAtualizada.DatAgendamento.ToUniversalTime();
        revisao.IdCliente = revisaoAtualizada.IdCliente;
        revisao.IdFuncionario = revisaoAtualizada.IdFuncionario == 0 ? null : revisaoAtualizada.IdFuncionario;
        revisao.ObservacaoCliente = revisaoAtualizada.ObservacaoCliente;
        revisao.FeedbackMecanico = revisaoAtualizada.FeedbackMecanico;

        if (revisao.StatusRevisao == "Concluído")
        {
            revisao.DatFinalizacao = DateTime.UtcNow;
        }
        else
        {
            revisao.DatFinalizacao = revisao.DatAgendamento;
        }

        _context.SaveChanges();
        return Ok(revisao);
    }
}

/// <summary>
/// DTO para criação de uma nova revisão.
/// O <c>IdCliente</c> não é enviado — é extraído do JWT pelo controller.
/// </summary>
public class CriarRevisaoRequest
{
    /// <summary>Tipo do pacote de revisão: 1 = Bronze, 2 = Silver, 3 = Gold.</summary>
    public int TipoRevisao { get; set; }

    /// <summary>Data e hora desejada para o agendamento (será convertida para UTC).</summary>
    public DateTime DatAgendamento { get; set; }

    /// <summary>Observação enviada pelo cliente.</summary>
    public string? ObservacaoCliente { get; set; }
}

/// <summary>
/// DTO para atualização de status de uma revisão via PATCH.
/// </summary>
public class AtualizarStatusRequest
{
    /// <summary>Novo status da revisão. Valores aceitos: "Pendente", "Em Andamento", "Concluído".</summary>
    public string StatusRevisao { get; set; } = string.Empty;

    /// <summary>Feedback/observações fornecidas pelo mecânico.</summary>
    public string? FeedbackMecanico { get; set; }
}
