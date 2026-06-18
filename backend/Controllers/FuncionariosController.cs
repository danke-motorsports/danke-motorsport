using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using backend.Data;
using backend.Models;
using System.Security.Claims;

namespace backend.Controllers;

/// <summary>
/// Controller CRUD para a entidade Funcionário.
/// Operações de escrita (criação, atualização, exclusão) exigem role <c>Funcionario</c>.
/// Funcionários só podem atualizar o próprio cadastro (ownership check via JWT claim).
/// </summary>
[ApiController]
[Route("danke/[controller]")]
public class FuncionariosController : ControllerBase
{
    private readonly AppDbContext _context;

    /// <summary>
    /// Inicializa o controller com o contexto de banco de dados.
    /// </summary>
    /// <param name="context">Contexto do Entity Framework Core.</param>
    public FuncionariosController(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Retorna a lista de todos os funcionários, sem expor o hash de senha.
    /// Qualquer usuário autenticado pode consultar (ex: cliente saber quem fez a revisão).
    /// </summary>
    /// <returns>200 OK com lista de { idFuncionario, nomeFuncionario, cargo, tipoFuncionario, email }.</returns>
    [HttpGet]
    [Authorize]
    public IActionResult ListarFuncionarios()
    {
        var funcionarios = _context.Funcionarios
            .Select(f => new { f.IdFuncionario, f.NomeFuncionario, f.Cargo, f.TipoFuncionario, f.Email })
            .ToList();
        return Ok(funcionarios);
    }

    /// <summary>
    /// Retorna os dados de um funcionário específico por ID.
    /// O hash de senha nunca é retornado.
    /// </summary>
    /// <param name="id">ID do funcionário.</param>
    /// <returns>
    /// 200 OK com dados do funcionário.
    /// 404 Not Found se o funcionário não existir.
    /// </returns>
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

    /// <summary>
    /// Cadastra um novo funcionário no sistema.
    /// Restrito a usuários com role <c>Funcionario</c>.
    /// A senha é hasheada com BCrypt antes de persistir.
    /// </summary>
    /// <param name="novoFuncionario">Dados do funcionário a ser criado.</param>
    /// <returns>
    /// 201 Created com dados do funcionário criado (sem senha).
    /// 400 BadRequest se os dados forem inválidos.
    /// </returns>
    [HttpPost]
    [Authorize(Roles = "Funcionario,Admin")]
    public IActionResult CriarFuncionario([FromBody] Funcionario novoFuncionario)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // Verifica se o e-mail já está em uso por outro cliente ou funcionário
        if (_context.Clientes.Any(c => c.Email == novoFuncionario.Email) ||
            _context.Funcionarios.Any(f => f.Email == novoFuncionario.Email))
        {
            return Conflict(new { message = "Este e-mail já está em uso." });
        }

        // Criptografa a senha antes de salvar no banco de dados
        novoFuncionario.Senha = BCrypt.Net.BCrypt.HashPassword(novoFuncionario.Senha);

        _context.Funcionarios.Add(novoFuncionario);
        _context.SaveChanges();

        // Remove o hash da senha do retorno por segurança
        novoFuncionario.Senha = string.Empty;

        return CreatedAtAction(nameof(ObterFuncionario), new { id = novoFuncionario.IdFuncionario }, novoFuncionario);
    }

    /// <summary>
    /// Atualiza os dados de um funcionário.
    /// Um Funcionário só pode atualizar o próprio cadastro — a verificação é feita
    /// pelo claim <c>NameIdentifier</c> do JWT. A senha não é alterada por este endpoint.
    /// </summary>
    /// <param name="id">ID do funcionário a atualizar.</param>
    /// <param name="funcionarioAtualizado">Novos dados do funcionário.</param>
    /// <returns>
    /// 200 OK com dados atualizados (sem senha).
    /// 400 BadRequest se os dados forem inválidos.
    /// 403 Forbidden se tentar atualizar outro funcionário.
    /// 404 Not Found se o funcionário não existir.
    /// </returns>
    [HttpPut("{id}")]
    [Authorize(Roles = "Funcionario,Admin")]
    public IActionResult AtualizarFuncionario(int id, [FromBody] Funcionario funcionarioAtualizado)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var myId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var role = User.FindFirst(ClaimTypes.Role)?.Value;

        if (role != "Admin" && myId != id)
            return Forbid();

        var funcionario = _context.Funcionarios.Find(id);
        if (funcionario == null)
            return NotFound();

        // Verifica se o e-mail mudou e se o novo e-mail já está cadastrado por outro usuário
        if (funcionario.Email != funcionarioAtualizado.Email)
        {
            if (_context.Clientes.Any(c => c.Email == funcionarioAtualizado.Email) ||
                _context.Funcionarios.Any(f => f.Email == funcionarioAtualizado.Email))
            {
                return Conflict(new { message = "Este e-mail já está em uso por outro usuário." });
            }
        }

        funcionario.NomeFuncionario = funcionarioAtualizado.NomeFuncionario;
        funcionario.TipoFuncionario = funcionarioAtualizado.TipoFuncionario;
        funcionario.Cargo = funcionarioAtualizado.Cargo;
        funcionario.Email = funcionarioAtualizado.Email;

        if (!string.IsNullOrEmpty(funcionarioAtualizado.Senha))
        {
            funcionario.Senha = BCrypt.Net.BCrypt.HashPassword(funcionarioAtualizado.Senha);
        }

        _context.SaveChanges();

        funcionario.Senha = string.Empty;
        return Ok(funcionario);
    }

    /// <summary>
    /// Remove um funcionário do banco de dados.
    /// Restrito a usuários com role <c>Funcionario</c>.
    /// </summary>
    /// <param name="id">ID do funcionário a remover.</param>
    /// <returns>
    /// 204 No Content em caso de sucesso.
    /// 404 Not Found se o funcionário não existir.
    /// </returns>
    [HttpDelete("{id}")]
    [Authorize(Roles = "Funcionario,Admin")]
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
