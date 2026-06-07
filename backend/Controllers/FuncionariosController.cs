using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Data;
using backend.Models;
using System.Security.Claims;

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

    // Qualquer usuário autenticado pode listar funcionários (ex: cliente ver quem atendeu)
    [HttpGet]
    [Authorize]
    public IActionResult ListarFuncionarios()
    {
        var funcionarios = _context.Funcionarios
            .Select(f => new { f.IdFuncionario, f.NomeFuncionario, f.Cargo, f.TipoFuncionario, f.Email })
            .ToList();
        return Ok(funcionarios);
    }

    // Qualquer usuário autenticado pode buscar um funcionário por id
    [HttpGet("{id}")]
    [Authorize]
    public IActionResult ObterFuncionario(int id)
    {
        var funcionario = _context.Funcionarios.Find(id);
        if (funcionario == null)
            return NotFound();

        // Nunca retornar o hash da senha
        funcionario.Senha = string.Empty;
        return Ok(funcionario);
    }

    // Somente funcionários podem cadastrar outros funcionários
    [HttpPost]
    [Authorize(Roles = "Funcionario")]
    public IActionResult CriarFuncionario([FromBody] Funcionario novoFuncionario)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Criptografa a senha antes de salvar no banco de dados
        novoFuncionario.Senha = BCrypt.Net.BCrypt.HashPassword(novoFuncionario.Senha);

        _context.Funcionarios.Add(novoFuncionario);
        _context.SaveChanges();

        // Remove o hash da senha do retorno por segurança
        novoFuncionario.Senha = string.Empty;

        return CreatedAtAction(nameof(ObterFuncionario), new { id = novoFuncionario.IdFuncionario }, novoFuncionario);
    }

    // Funcionário só atualiza o próprio cadastro
    [HttpPut("{id}")]
    [Authorize(Roles = "Funcionario")]
    public IActionResult AtualizarFuncionario(int id, [FromBody] Funcionario funcionarioAtualizado)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var myId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        if (myId != id)
            return Forbid();

        var funcionario = _context.Funcionarios.Find(id);
        if (funcionario == null)
            return NotFound();

        funcionario.NomeFuncionario = funcionarioAtualizado.NomeFuncionario;
        funcionario.TipoFuncionario = funcionarioAtualizado.TipoFuncionario;
        funcionario.Cargo = funcionarioAtualizado.Cargo;
        funcionario.Email = funcionarioAtualizado.Email;

        _context.SaveChanges();

        funcionario.Senha = string.Empty;
        return Ok(funcionario);
    }

    // Somente funcionários podem remover outros funcionários
    [HttpDelete("{id}")]
    [Authorize(Roles = "Funcionario")]
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
