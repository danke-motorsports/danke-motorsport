using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Controllers;

/// <summary>
/// Controller responsável pela autenticação de usuários (Clientes e Funcionários).
/// Gera tokens JWT assinados com HmacSha256, válidos por 7 dias.
/// </summary>
[ApiController]
[Route("danke/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    /// <summary>
    /// Inicializa o controller com o contexto de banco de dados e as configurações da aplicação.
    /// </summary>
    /// <param name="context">Contexto do Entity Framework Core.</param>
    /// <param name="configuration">Configurações lidas de appsettings (Jwt:Key, etc.).</param>
    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

    /// <summary>
    /// Autentica um usuário (Cliente ou Funcionário) e retorna um JWT.
    /// A busca é feita primeiro em Clientes, depois em Funcionários.
    /// A senha é validada com BCrypt.
    /// </summary>
    /// <param name="request">Objeto contendo Email e Senha.</param>
    /// <returns>
    /// 200 OK com { token, user: { id, nome, email, role } } em caso de sucesso.
    /// 400 BadRequest se os dados enviados forem inválidos.
    /// 401 Unauthorized se e-mail ou senha estiverem incorretos.
    /// </returns>
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        // 1. Procurar em Clientes
        var cliente = _context.Clientes.FirstOrDefault(c => c.Email == request.Email);
        if (cliente != null && BCrypt.Net.BCrypt.Verify(request.Senha, cliente.Senha))
        {
            var token = GenerateToken(cliente.Id.ToString(), "Cliente", cliente.Nome, cliente.Email);
            return Ok(new
            {
                token,
                user = new
                {
                    id = cliente.Id,
                    nome = cliente.Nome,
                    email = cliente.Email,
                    role = "Cliente"
                }
            });
        }

        // 2. Procurar em Funcionarios
        var funcionario = _context.Funcionarios.FirstOrDefault(f => f.Email == request.Email);
        if (funcionario != null && BCrypt.Net.BCrypt.Verify(request.Senha, funcionario.Senha))
        {
            var userRole = funcionario.TipoFuncionario == 1 ? "Admin" : "Funcionario";
            var token = GenerateToken(funcionario.IdFuncionario.ToString(), userRole, funcionario.NomeFuncionario, funcionario.Email);
            return Ok(new
            {
                token,
                user = new
                {
                    id = funcionario.IdFuncionario,
                    nome = funcionario.NomeFuncionario,
                    email = funcionario.Email,
                    role = userRole
                }
            });
        }

        return Unauthorized(new { message = "E-mail ou senha incorretos." });
    }

    /// <summary>
    /// Gera um token JWT com as claims do usuário autenticado.
    /// A chave de assinatura é lida de Jwt:Key (appsettings ou variável de ambiente).
    /// Lança <see cref="InvalidOperationException"/> se a chave não estiver configurada.
    /// </summary>
    /// <param name="id">Identificador único do usuário.</param>
    /// <param name="role">Perfil do usuário: "Cliente" ou "Funcionario".</param>
    /// <param name="nome">Nome completo do usuário.</param>
    /// <param name="email">E-mail do usuário.</param>
    /// <returns>String do token JWT assinado.</returns>
    private string GenerateToken(string id, string role, string nome, string email)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        
        var jwtKey = _configuration["Jwt:Key"];
        if (string.IsNullOrEmpty(jwtKey))
            throw new InvalidOperationException("Jwt:Key não configurado. Defina em appsettings.Development.json ou nas variáveis de ambiente.");

        var key = Encoding.ASCII.GetBytes(jwtKey);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.NameIdentifier, id),
                new Claim(ClaimTypes.Role, role),
                new Claim(ClaimTypes.Name, nome),
                new Claim(ClaimTypes.Email, email)
            }),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}

/// <summary>
/// DTO para a requisição de login. Contém as credenciais do usuário.
/// </summary>
public class LoginRequest
{
    /// <summary>E-mail cadastrado pelo usuário.</summary>
    public string Email { get; set; } = string.Empty;

    /// <summary>Senha em plaintext. Será verificada contra o hash BCrypt armazenado.</summary>
    public string Senha { get; set; } = string.Empty;
}
