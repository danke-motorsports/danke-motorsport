using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("danke/[controller]")]
public class RevisoesController : ControllerBase
{
    private readonly AppDbContext _context;

    public RevisoesController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult ListarRevisoes()
    {
        var revisoes = _context.Revisoes.ToList();
        return Ok(revisoes);
    }

    [HttpGet("{id}")]
    public IActionResult ObterRevisao(int id)
    {
        var revisao = _context.Revisoes.Find(id);
        if (revisao == null)
            return NotFound();

        return Ok(revisao);
    }

    [HttpPost]
    public IActionResult CriarRevisao([FromBody] Revisao novaRevisao)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        _context.Revisoes.Add(novaRevisao);
        _context.SaveChanges();

        return CreatedAtAction(nameof(ObterRevisao), new { id = novaRevisao.IdRevisao }, novaRevisao);
    }

    [HttpPut("{id}")]
    public IActionResult AtualizarRevisao(int id, [FromBody] Revisao revisaoAtualizada)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var revisao = _context.Revisoes.Find(id);
        if (revisao == null)
            return NotFound();

        revisao.StatusRevisao = revisaoAtualizada.StatusRevisao;
        revisao.TipoRevisao = revisaoAtualizada.TipoRevisao;
        revisao.DatAgendamento = revisaoAtualizada.DatAgendamento;
        revisao.DatFinalizacao = revisaoAtualizada.DatFinalizacao;
        revisao.IdCliente = revisaoAtualizada.IdCliente;
        revisao.IdFuncionario = revisaoAtualizada.IdFuncionario;

        _context.SaveChanges();
        return Ok(revisao);
    }

    [HttpDelete("{id}")]
    public IActionResult RemoverRevisao(int id)
    {
        var revisao = _context.Revisoes.Find(id);
        if (revisao == null)
            return NotFound();

        _context.Revisoes.Remove(revisao);
        _context.SaveChanges();
        return NoContent();
    }
}
