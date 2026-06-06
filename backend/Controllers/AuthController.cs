using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace backend.Controllers;

[ApiController]
[Route("danke/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;

    public AuthController(AppDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
    }

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
            var token = GenerateToken(funcionario.IdFuncionario.ToString(), "Funcionario", funcionario.NomeFuncionario, funcionario.Email);
            return Ok(new
            {
                token,
                user = new
                {
                    id = funcionario.IdFuncionario,
                    nome = funcionario.NomeFuncionario,
                    email = funcionario.Email,
                    role = "Funcionario"
                }
            });
        }

        return Unauthorized(new { message = "E-mail ou senha incorretos." });
    }

    private string GenerateToken(string id, string role, string nome, string email)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        
        var jwtKey = _configuration["Jwt:Key"];
        if (string.IsNullOrEmpty(jwtKey))
        {
            jwtKey = "danke_motorsport_super_secret_key_1234567890_default";
        }
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

public class LoginRequest
{
    public string Email { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
}
