using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Data;
using backend.Models;
using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

namespace backend.Controllers;

/// <summary>
/// Controller CRUD para a entidade Cliente.
/// Aplica autorização baseada em roles (Cliente / Funcionario) e
/// verificação de propriedade (ownership) nos endpoints sensíveis.
/// </summary>
[ApiController]
[Route("danke/[controller]")]
public class ClientesController : ControllerBase
{
    private readonly AppDbContext _context;

    /// <summary>
    /// Inicializa o controller com o contexto de banco de dados.
    /// </summary>
    /// <param name="context">Contexto do Entity Framework Core.</param>
    public ClientesController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Retorna a lista de todos os clientes cadastrados, sem expor o hash de senha.
    /// Restrito a usuários com role <c>Funcionario</c>.
    /// </summary>
    /// <returns>200 OK com lista de { id, nome, email, cpf, telefone, placaVeiculo }.</returns>
    [HttpGet]
    [Authorize(Roles = "Funcionario,Admin")]
    public IActionResult ListarClientes()
    {
        var clientes = _context.Clientes
            .Select(c => new { c.Id, c.Nome, c.Email, c.Cpf, c.Telefone, c.PlacaVeiculo })
            .ToList();
        return Ok(clientes);
    }

    /// <summary>
    /// Retorna os dados de um cliente específico por ID.
    /// Um Cliente só pode consultar o próprio perfil; Funcionários podem consultar qualquer um.
    /// O hash de senha nunca é retornado.
    /// </summary>
    /// <param name="id">ID do cliente.</param>
    /// <returns>
    /// 200 OK com dados do cliente.
    /// 403 Forbidden se um Cliente tentar acessar o perfil de outro.
    /// 404 Not Found se o cliente não existir.
    /// </returns>
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

    /// <summary>
    /// Cadastra um novo cliente. Endpoint público — não requer autenticação.
    /// A senha é hasheada com BCrypt antes de persistir no banco.
    /// </summary>
    /// <param name="novoCliente">Dados do cliente a ser criado.</param>
    /// <returns>
    /// 201 Created com os dados do cliente criado (sem senha).
    /// 400 BadRequest se os dados forem inválidos.
    /// </returns>
    [HttpPost]
    public IActionResult CriarCliente([FromBody] Cliente novoCliente)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Verifica se o e-mail já está em uso por outro cliente ou funcionário
        if (_context.Clientes.Any(c => c.Email == novoCliente.Email) ||
            _context.Funcionarios.Any(f => f.Email == novoCliente.Email))
        {
            return Conflict(new { message = "Este e-mail já está em uso." });
        }

        // Criptografa a senha antes de salvar no banco de dados
        novoCliente.Senha = BCrypt.Net.BCrypt.HashPassword(novoCliente.Senha);

        _context.Clientes.Add(novoCliente);
        _context.SaveChanges();

        // Remove o hash da senha do retorno por segurança
        novoCliente.Senha = string.Empty;

        return CreatedAtAction(nameof(ObterCliente), new { id = novoCliente.Id }, novoCliente);
    }

    /// <summary>
    /// Atualiza os dados de um cliente existente.
    /// Um Cliente só pode atualizar o próprio cadastro; Funcionários podem atualizar qualquer um.
    /// A senha não é alterada por este endpoint.
    /// </summary>
    /// <param name="id">ID do cliente a atualizar.</param>
    /// <param name="clienteAtualizado">Novos dados do cliente.</param>
    /// <returns>
    /// 200 OK com os dados atualizados (sem senha).
    /// 400 BadRequest se os dados forem inválidos.
    /// 403 Forbidden se um Cliente tentar atualizar outro.
    /// 404 Not Found se o cliente não existir.
    /// </returns>
    [HttpPut("{id}")]
    [Authorize]
    public IActionResult AtualizarCliente(int id, [FromBody] AtualizarClienteRequest request)
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

        if (cliente.Email != request.Email)
        {
            if (_context.Clientes.Any(c => c.Email == request.Email) ||
                _context.Funcionarios.Any(f => f.Email == request.Email))
            {
                return Conflict(new { message = "Este e-mail já está em uso por outro usuário." });
            }
        }

        cliente.Nome = request.Nome;
        cliente.Email = request.Email;
        cliente.Cpf = request.Cpf;
        cliente.Telefone = request.Telefone;
        cliente.PlacaVeiculo = request.PlacaVeiculo;

        if (!string.IsNullOrEmpty(request.Senha))
        {
            cliente.Senha = BCrypt.Net.BCrypt.HashPassword(request.Senha);
        }

        _context.SaveChanges();

        cliente.Senha = string.Empty;
        return Ok(cliente);
    }

    /// <summary>
    /// Remove um cliente do banco de dados.
    /// Restrito a usuários com role <c>Funcionario</c>.
    /// </summary>
    /// <param name="id">ID do cliente a remover.</param>
    /// <returns>
    /// 204 No Content em caso de sucesso.
    /// 404 Not Found se o cliente não existir.
    /// </returns>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Funcionario,Admin")]
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

/// <summary>
/// DTO para atualização de cliente. Senha é opcional — omita para manter a atual.
/// </summary>
public class AtualizarClienteRequest
{
    [Required]
    public string Nome { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Cpf { get; set; } = string.Empty;

    [Required]
    public string Telefone { get; set; } = string.Empty;

    public string PlacaVeiculo { get; set; } = string.Empty;

    public string? Senha { get; set; }
}
