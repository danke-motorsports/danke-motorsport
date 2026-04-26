using Microsoft.AspNetCore.Mvc;
// Substitua "SeuProjeto" pelo nome real do seu namespace (ex: DankeMotorsport)
using backend.Data; 
using backend.Models; 
using System.Linq;

namespace backend.Controllers;

[ApiController]
[Route("danke/[controller]")] // A rota ficará: http://localhost:porta/danke/Funcionarios
public class FuncionariosController : ControllerBase
{
    private readonly AppDbContext _context;

    // 1. Injeção de Dependência: O .NET entrega o "tradutor" do banco pronto para uso.
    public FuncionariosController(AppDbContext context)
    {
        _context = context;
    }

    // 2. ROTA GET (Ler dados)
    [HttpGet]
    public IActionResult ListarFuncionarios()
    {
        // O Entity Framework faz o "SELECT * FROM Funcionarios" sozinho aqui
        var funcionarios = _context.Funcionarios.ToList();
        
        // Retorna o status HTTP 200 (OK) com a lista em JSON
        return Ok(funcionarios); 
    }

    // 3. ROTA POST (Inserir dados)
    [HttpPost]
    public IActionResult CriarFuncionario([FromBody] Funcionario novoFuncionario)
    {
        // O Entity Framework prepara o "INSERT INTO"
        _context.Funcionarios.Add(novoFuncionario);
        
        // Salva de fato no Supabase
        _context.SaveChanges(); 

        // Retorna o status HTTP 201 (Criado)
        return Created("", novoFuncionario); 
    }
}