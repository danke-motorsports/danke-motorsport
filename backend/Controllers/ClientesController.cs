using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Data;
using backend.Models;
using System.Security.Claims;

namespace backend.Controllers;

[ApiController]
[Route("danke/[controller]")]
public class ClientesController : ControllerBase
{
    private readonly AppDbContext _context;

    public ClientesController(AppDbContext context)
    {
        _context = context;
    }

    // Somente funcionários podem listar todos os clientes
    [HttpGet]
    [Authorize(Roles = "Funcionario")]
    public IActionResult ListarClientes()
    {
        var clientes = _context.Clientes
            .Select(c => new { c.Id, c.Nome, c.Email, c.Cpf, c.Telefone, c.PlacaVeiculo })
            .ToList();
        return Ok(clientes);
    }

    // Qualquer usuário autenticado pode buscar um cliente por id
    [HttpGet("{id}")]
    [Authorize]
    public IActionResult ObterCliente(int id)
    {
        var cliente = _context.Clientes.Find(id);
        if (cliente == null)
            return NotFound();

        // Cliente só pode ver o próprio perfil; Funcionario pode ver qualquer um
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var myId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        if (role == "Cliente" && myId != id)
            return Forbid();

        // Nunca retornar o hash da senha
        cliente.Senha = string.Empty;
        return Ok(cliente);
    }

    // Endpoint público: qualquer pessoa pode se cadastrar como cliente
    [HttpPost]
    public IActionResult CriarCliente([FromBody] Cliente novoCliente)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Criptografa a senha antes de salvar no banco de dados
        novoCliente.Senha = BCrypt.Net.BCrypt.HashPassword(novoCliente.Senha);

        _context.Clientes.Add(novoCliente);
        _context.SaveChanges();

        // Remove o hash da senha do retorno por segurança
        novoCliente.Senha = string.Empty;

        return CreatedAtAction(nameof(ObterCliente), new { id = novoCliente.Id }, novoCliente);
    }

    // Cliente só atualiza o próprio cadastro; Funcionario pode atualizar qualquer um
    [HttpPut("{id}")]
    [Authorize]
    public IActionResult AtualizarCliente(int id, [FromBody] Cliente clienteAtualizado)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        var myId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        if (role == "Cliente" && myId != id)
            return Forbid();

        var cliente = _context.Clientes.Find(id);
        if (cliente == null)
            return NotFound();

        cliente.Nome = clienteAtualizado.Nome;
        cliente.Email = clienteAtualizado.Email;
        cliente.Cpf = clienteAtualizado.Cpf;
        cliente.Telefone = clienteAtualizado.Telefone;
        cliente.PlacaVeiculo = clienteAtualizado.PlacaVeiculo;

        _context.SaveChanges();

        cliente.Senha = string.Empty;
        return Ok(cliente);
    }

    // Somente funcionários podem remover clientes
    [HttpDelete("{id}")]
    [Authorize(Roles = "Funcionario")]
    public IActionResult RemoverCliente(int id)
    {
        var cliente = _context.Clientes.Find(id);
        if (cliente == null)
            return NotFound();

        _context.Clientes.Remove(cliente);
        _context.SaveChanges();
        return NoContent();
    }
}
