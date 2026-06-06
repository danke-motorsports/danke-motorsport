using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;

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

    [HttpGet]
    public IActionResult ListarClientes()
    {
        var clientes = _context.Clientes.ToList();
        return Ok(clientes);
    }

    [HttpGet("{id}")]
    public IActionResult ObterCliente(int id)
    {
        var cliente = _context.Clientes.Find(id);
        if (cliente == null)
            return NotFound();

        return Ok(cliente);
    }

    [HttpPost]
    public IActionResult CriarCliente([FromBody] Cliente novoCliente)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        _context.Clientes.Add(novoCliente);
        _context.SaveChanges();

        return CreatedAtAction(nameof(ObterCliente), new { id = novoCliente.Id }, novoCliente);
    }

    [HttpPut("{id}")]
    public IActionResult AtualizarCliente(int id, [FromBody] Cliente clienteAtualizado)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var cliente = _context.Clientes.Find(id);
        if (cliente == null)
            return NotFound();

        cliente.Nome = clienteAtualizado.Nome;
        cliente.Email = clienteAtualizado.Email;
        cliente.Cpf = clienteAtualizado.Cpf;
        cliente.Telefone = clienteAtualizado.Telefone;
        cliente.PlacaVeiculo = clienteAtualizado.PlacaVeiculo;

        _context.SaveChanges();
        return Ok(cliente);
    }

    [HttpDelete("{id}")]
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
