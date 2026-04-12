using Microsoft.EntityFrameworkCore;
using backend.Data; // Certifique-se de que o AppDbContext está neste namespace

var builder = WebApplication.CreateBuilder(args);

// 1. Pega a URL do Supabase lá do seu appsettings.json
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// 2. Ensina a API a usar o AppDbContext com o PostgreSQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));

// Adiciona o suporte aos Controllers (que vamos criar depois)
builder.Services.AddControllers();

var app = builder.Build();

// Configurações da rota e permissões
app.MapControllers();

app.Run();