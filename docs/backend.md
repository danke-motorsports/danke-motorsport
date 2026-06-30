# Backend

## Stack

ASP.NET Core 10 (Web API), Entity Framework Core, Npgsql, JWT Bearer, BCrypt.Net-Next e Swagger (somente em Development).

```
backend/
├── Controllers/
├── Models/
├── Data/           AppDbContext
├── Services/       ex.: AgendamentoValidator
├── Migrations/
└── Program.cs
```

Controllers concentram o fluxo HTTP; regras reutilizáveis ficam em `Services/`. Não há camada Repository — o `AppDbContext` é injetado direto nos controllers.

## Configuração

Variáveis obrigatórias (via `.env` ou painel do provedor):

| Variável | Uso |
|---|---|
| `ConnectionStrings__DefaultConnection` | PostgreSQL |
| `Jwt__Key` | Assinatura do JWT (32+ caracteres) |
| `AllowedOrigins__0` | Origem CORS do frontend |
| `PORT` | Porta HTTP (padrão 8080) |

Se connection string, JWT ou CORS faltarem, a aplicação falha na subida (`InvalidOperationException` em `Program.cs`).

## Autenticação

`AuthController` — `POST /danke/auth/login`:

1. Busca e-mail em `clientes`; se achar, valida senha (BCrypt) e emite JWT com role `Cliente`.
2. Senão, busca em `funcionarios`; role `Admin` se `tipo_funcionario = 1`, senão `Funcionario`.
3. Token HMAC-SHA256, validade de 7 dias. Claims: id, role, nome, e-mail.

Senhas nunca voltam no JSON de resposta (`JsonIgnore` nos models).

## Autorização

Endpoints protegidos com `[Authorize]` e roles quando necessário. Exemplos:

- Cliente cria revisão: `POST /danke/revisao` → role `Cliente`
- Funcionário altera status: `PATCH /danke/revisao/{id}` → `Funcionario` ou `Admin`
- Admin edita revisão completa: `PUT /danke/revisao/{id}` → `Admin`
- Cadastro de cliente: `POST /danke/clientes` → público
- Listagem de clientes: `GET /danke/clientes` → `Funcionario` ou `Admin`

A API é quem impõe permissão; o frontend só esconde rotas.

## JSON e CORS

Respostas em camelCase; `ReferenceHandler.IgnoreCycles` evita loop ao serializar navegações EF (`Cliente` ↔ `Revisao`).

CORS: política `AllowReact`, origens de `AllowedOrigins` no appsettings/env.

## Regras de negócio

### Agendamento

`AgendamentoValidator` valida `datAgendamento` em:

- `POST /danke/revisao` (cliente)
- `PUT /danke/revisao/{id}` (admin)

Regras: não no passado; entre 08:00 e 18:00 em `America/Sao_Paulo`; persistência em UTC.

### Ciclo da revisão

Status: `Pendente` → `Em Andamento` → `Concluído`.

Nova revisão: status `Pendente`, sem funcionário atribuído. Na primeira ação do funcionário, `IdFuncionario` é preenchido. Ao concluir, `DatFinalizacao` recebe `UtcNow`.

Funcionário que não é admin só altera revisão sem dono ou já atribuída a ele.

### Planos

`tipo_revisao`: `1` Bronze, `2` Silver, `3` Gold (inteiro no banco, sem tabela auxiliar).

## Endpoints (prefixo `/danke/`)

| Método | Rota | Notas |
|---|---|---|
| POST | `/auth/login` | Login |
| GET/POST/PUT/DELETE | `/clientes` | CRUD |
| GET/POST/PUT/DELETE | `/funcionarios` | CRUD |
| GET | `/revisao/cliente` | Revisões do cliente logado |
| GET | `/revisao/funcionario` | Revisões do funcionário |
| GET | `/revisao/pendentes` | Fila pendente |
| POST | `/revisao` | Nova revisão |
| PATCH | `/revisao/{id}` | Status (+ feedback opcional) |
| PUT | `/revisao/{id}` | Edição admin |
| DELETE | `/revisao/{id}` | Remoção |
| GET | `/health` | Health check |

## Migrations

EF Core; histórico em [banco-de-dados.md](./banco-de-dados.md). Aplicadas manualmente (`dotnet ef database update`), não no startup da API.

## Deploy (Railway)

Build pelo `Dockerfile` em `backend/`. Health check em `/health`. Variáveis no painel; `AllowedOrigins__0` deve bater com a URL do Vercel.
