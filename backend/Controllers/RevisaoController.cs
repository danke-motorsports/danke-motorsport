using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using backend.Models;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("danke/[controller]")]
public class RevisaoController : ControllerBase
{
    private readonly AppDbContext _context;

    public RevisaoController(AppDbContext context)
    {
        _context = context;
    }

    // GET /danke/revisao
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

        return Forbid();
    }

    // GET /danke/revisao/cliente
    // Retorna as revisões do cliente autenticado
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

    // GET /danke/revisao/funcionario
    // Retorna as revisões associadas ao funcionário autenticado
    [HttpGet("funcionario")]
    [Authorize(Roles = "Funcionario")]
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

    // GET /danke/revisao/pendentes
    // Retorna todas as revisões que estão com status "Pendente"
    [HttpGet("pendentes")]
    [Authorize(Roles = "Funcionario")]
    public IActionResult ObterRevisoesPendentes()
    {
        var pendentes = _context.Revisoes
            .Include(r => r.Cliente)
            .Where(r => r.StatusRevisao == "Pendente")
            .ToList();

        return Ok(pendentes);
    }

    // GET /danke/revisao/{id}
    [HttpGet("{id}")]
    [Authorize]
    public IActionResult ObterRevisao(int id)
    {
        var revisao = _context.Revisoes.Include(r => r.Cliente).FirstOrDefault(r => r.IdRevisao == id);
        if (revisao == null)
            return NotFound();

        // Verifica permissões simples (o cliente só pode ver a dele, funcionário pode ver todas)
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

    // POST /danke/revisao
    // Cria uma revisão extraindo o ClienteId diretamente das Claims
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
            DatFinalizacao = request.DatAgendamento.ToUniversalTime(), // placeholder
            IdCliente = clienteId,
            IdFuncionario = null // Inicialmente não atrelado a funcionário
        };

        _context.Revisoes.Add(novaRevisao);
        _context.SaveChanges();

        return CreatedAtAction(nameof(ObterRevisao), new { id = novaRevisao.IdRevisao }, novaRevisao);
    }

    // PATCH /danke/revisao/{id}
    // Atualiza status e assinala o FuncionarioId na primeira interação
    [HttpPatch("{id}")]
    [Authorize(Roles = "Funcionario")]
    public IActionResult AtualizarStatus(int id, [FromBody] AtualizarStatusRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var revisao = _context.Revisoes.Find(id);
        if (revisao == null)
            return NotFound();

        var funcionarioIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (funcionarioIdClaim == null)
            return Unauthorized();

        int funcionarioId = int.Parse(funcionarioIdClaim.Value);

        // Se a revisão ainda não tem funcionário associado (primeira interação), assinala o FuncionarioId
        if (revisao.IdFuncionario == null)
        {
            revisao.IdFuncionario = funcionarioId;
        }

        revisao.StatusRevisao = request.StatusRevisao;

        // Se o status for concluído, define a data de finalização
        if (request.StatusRevisao == "Concluído")
        {
            revisao.DatFinalizacao = DateTime.UtcNow;
        }

        _context.SaveChanges();

        return Ok(revisao);
    }

    // DELETE /danke/revisao/{id}
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
}

public class CriarRevisaoRequest
{
    public int TipoRevisao { get; set; }
    public DateTime DatAgendamento { get; set; }
}

public class AtualizarStatusRequest
{
    public string StatusRevisao { get; set; } = string.Empty;
}
