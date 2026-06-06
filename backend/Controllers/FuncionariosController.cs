using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;

namespace backend.Controllers;

[ApiController]
[Route("danke/[controller]")]
public class FuncionariosController : ControllerBase
{
    private readonly AppDbContext _context;

    public FuncionariosController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public IActionResult ListarFuncionarios()
    {
        var funcionarios = _context.Funcionarios.ToList();
        return Ok(funcionarios);
    }

    [HttpGet("{id}")]
    public IActionResult ObterFuncionario(int id)
    {
        var funcionario = _context.Funcionarios.Find(id);
        if (funcionario == null)
            return NotFound();

        return Ok(funcionario);
    }

    [HttpPost]
    public IActionResult CriarFuncionario([FromBody] Funcionario novoFuncionario)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Criptografa a senha antes de salvar no banco de dados
        novoFuncionario.Senha = BCrypt.Net.BCrypt.HashPassword(novoFuncionario.Senha);

        _context.Funcionarios.Add(novoFuncionario);
        _context.SaveChanges();

        // Remove a senha criptografada do retorno por segurança
        novoFuncionario.Senha = string.Empty;

        return CreatedAtAction(nameof(ObterFuncionario), new { id = novoFuncionario.IdFuncionario }, novoFuncionario);
    }

    [HttpPut("{id}")]
    public IActionResult AtualizarFuncionario(int id, [FromBody] Funcionario funcionarioAtualizado)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var funcionario = _context.Funcionarios.Find(id);
        if (funcionario == null)
            return NotFound();

        funcionario.NomeFuncionario = funcionarioAtualizado.NomeFuncionario;
        funcionario.TipoFuncionario = funcionarioAtualizado.TipoFuncionario;
        funcionario.Cargo = funcionarioAtualizado.Cargo;

        _context.SaveChanges();
        return Ok(funcionario);
    }

    [HttpDelete("{id}")]
    public IActionResult RemoverFuncionario(int id)
    {
        var funcionario = _context.Funcionarios.Find(id);
        if (funcionario == null)
            return NotFound();

        _context.Funcionarios.Remove(funcionario);
        _context.SaveChanges();
        return NoContent();
    }
}
