using Microsoft.AspNetCore.Mvc;
// Substitua "SeuProjeto" pelo nome real do seu namespace (ex: DankeMotorsport)
using backend.Data; 
using backend.Models; 
using System.Linq;

namespace backend.Controllers;

[ApiController]
[Route("danke/[controller]")] // A rota ficará: http://localhost:porta/danke/clientes
public class ClientesController : ControllerBase
{
    private readonly AppDbContext _context;

    // 1. Injeção de Dependência: O .NET entrega o "tradutor" do banco pronto para uso.
    public ClientesController(AppDbContext context)
    {
        _context = context;
    }

    // 2. ROTA GET (Ler dados)
    [HttpGet]
    public IActionResult ListarClientes()
    {
        // O Entity Framework faz o "SELECT * FROM Clientes" sozinho aqui
        var clientes = _context.Clientes.ToList();
        
        // Retorna o status HTTP 200 (OK) com a lista em JSON
        return Ok(clientes); 
    }

    // 3. ROTA POST (Inserir dados)
    [HttpPost]
    public IActionResult CriarCliente([FromBody] Cliente novoCliente)
    {
        // O Entity Framework prepara o "INSERT INTO"
        _context.Clientes.Add(novoCliente);
        
        // Salva de fato no Supabase
        _context.SaveChanges(); 

        // Retorna o status HTTP 201 (Criado)
        return Created("", novoCliente); 
    }
}