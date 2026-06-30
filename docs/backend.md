# Backend — Decisões de Projeto

## Stack

| Componente | Tecnologia | Versão |
|---|---|---|
| Runtime | .NET | 10 |
| Framework | ASP.NET Core Web API | 10 |
| ORM | Entity Framework Core | 10 |
| Driver PostgreSQL | Npgsql | via EF Core |
| Autenticação | JWT Bearer | Microsoft.AspNetCore.Authentication.JwtBearer |
| Hash de senha | BCrypt.Net-Next | — |
| Documentação API | Swashbuckle (Swagger) | Apenas Development |

## Estrutura de camadas

```
backend/
├── Controllers/     # Endpoints REST (thin controllers)
├── Models/          # Entidades EF mapeadas às tabelas
├── Data/            # AppDbContext
├── Services/        # Regras de negócio reutilizáveis
├── Migrations/      # Evolução do schema
└── Program.cs       # Composição DI, middleware, CORS, JWT
```

**Decisão:** controllers finos — lógica de validação de domínio extraída para `Services/` quando reutilizável (ex.: `AgendamentoValidator`). Sem camada Repository explícita; EF Core via `AppDbContext` injetado nos controllers.

## Configuração e variáveis de ambiente

Toda configuração sensível vem de **variáveis de ambiente** (nunca hardcoded):

| Variável | Obrigatória | Descrição |
|---|---|---|
| `ConnectionStrings__DefaultConnection` | Sim | Connection string PostgreSQL |
| `Jwt__Key` | Sim | Segredo HMAC (mín. 32 caracteres) |
| `AllowedOrigins__0` | Sim | Origem CORS do frontend |
| `PORT` | Não | Porta HTTP (default `8080`) |
| `ASPNETCORE_ENVIRONMENT` | Não | `Development` ou `Production` |

`Program.cs` lança `InvalidOperationException` na inicialização se connection string, JWT ou CORS estiverem ausentes — **fail-fast** para evitar subir API mal configurada.

## Autenticação e autorização

### Fluxo de login (`AuthController`)

1. Busca e-mail em `clientes`; se encontrado, valida senha com BCrypt
2. Se não encontrado, busca em `funcionarios`
3. Gera JWT com claims: `NameIdentifier` (id), `Role`, `Name`, `Email`
4. Token válido por **7 dias**; assinatura HMAC-SHA256

### Mapeamento de roles

| Origem | Condição | Role JWT |
|---|---|---|
| Tabela `clientes` | — | `Cliente` |
| Tabela `funcionarios` | `tipo_funcionario = 1` | `Admin` |
| Tabela `funcionarios` | `tipo_funcionario ≠ 1` | `Funcionario` |

### Proteção de endpoints

Atributo `[Authorize]` com roles específicas por operação:

| Controller | Operação | Roles |
|---|---|---|
| `AuthController` | POST login | Público |
| `ClientesController` | POST cadastro | Público |
| `ClientesController` | GET lista | Funcionario, Admin |
| `RevisaoController` | POST criar | Cliente |
| `RevisaoController` | PATCH status | Funcionario, Admin |
| `RevisaoController` | PUT editar | Admin |
| `FuncionariosController` | POST/PUT/DELETE | Funcionario, Admin |

**Decisão:** autorização no backend é a fonte da verdade; guards do frontend são apenas UX.

## Serialização JSON

Configurado em `Program.cs`:

- **camelCase** nas propriedades de resposta/request
- **ReferenceHandler.IgnoreCycles** — evita loop infinito ao serializar navegações EF (`Cliente.Revisoes → Cliente`)

Senhas nunca são expostas na escrita: `[JsonIgnore(Condition = JsonIgnoreCondition.WhenWriting)]` no model.

## CORS

Política `AllowReact` com origens lidas de `AllowedOrigins` no appsettings/env. Métodos e headers liberados para SPA.

## Regras de negócio

### Agendamento (`AgendamentoValidator`)

Validado em:

- `POST /danke/revisao` (cliente cria)
- `PUT /danke/revisao/{id}` (admin edita)

| Regra | Detalhe |
|---|---|
| Não no passado | Comparação em `America/Sao_Paulo` |
| Horário comercial | 08:00 ≤ hora ≤ 18:00 (local) |
| Armazenamento | Convertido para UTC antes de persistir |

### Revisões — ciclo de vida

```
Pendente → Em Andamento → Concluído
```

| Evento | Comportamento |
|---|---|
| Cliente cria revisão | Status `Pendente`, `IdFuncionario = null` |
| Funcionário interage | Auto-atribui `IdFuncionario` na primeira ação |
| Status `Concluído` | `DatFinalizacao = UtcNow` |
| Funcionário não-admin | Só altera revisões próprias ou sem atribuição |

### Planos de revisão (`tipo_revisao`)

| Valor | Plano |
|---|---|
| 1 | Bronze |
| 2 | Silver |
| 3 | Gold |

Representado como `int` (não enum PostgreSQL) — simplicidade no MVP; enum C# ou lookup table seria evolução futura.

## Endpoints principais

Prefixo base: `/danke/`

| Método | Rota | Descrição |
|---|---|---|
| POST | `/auth/login` | Autenticação |
| GET/POST/PUT/DELETE | `/clientes` | CRUD clientes |
| GET/POST/PUT/DELETE | `/funcionarios` | CRUD funcionários |
| GET | `/revisao/cliente` | Revisões do cliente logado |
| GET | `/revisao/funcionario` | Revisões do funcionário |
| GET | `/revisao/pendentes` | Fila pendente |
| POST | `/revisao` | Nova revisão (cliente) |
| PATCH | `/revisao/{id}` | Atualizar status |
| PUT | `/revisao/{id}` | Edição completa (admin) |
| DELETE | `/revisao/{id}` | Remover revisão |
| GET | `/health` | Health check |

## Migrations

Gerenciadas pelo EF Core (`dotnet ef migrations add`, `dotnet ef database update`). Histórico documentado em [Banco de Dados](./banco-de-dados.md).

**Decisão:** migrations versionadas no repositório; aplicadas manualmente em dev/prod (não auto-apply no startup) para controle explícito.

## Deploy (Railway)

- Build via `backend/Dockerfile`
- Health check em `/health`
- Variáveis de ambiente configuradas no painel Railway
- `AllowedOrigins__0` deve coincidir com URL exata do Vercel

## Trade-offs e limitações conhecidas

| Limitação | Impacto | Evolução possível |
|---|---|---|
| JWT sem refresh token | Re-login após 7 dias | Refresh token + rotação |
| Sem rate limiting | Brute force no login | Middleware de throttling |
| `tipo_revisao` como int | Sem FK para tabela de planos | Tabela `planos` + seed |
| Validação de CPF/placa no backend mínima | Dados inconsistentes possíveis | FluentValidation |
| Sem paginação nas listagens | Performance em escala | `Skip/Take` + query params |
