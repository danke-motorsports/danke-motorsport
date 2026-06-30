# Arquitetura

## Visão geral

Aplicação **cliente-servidor**: SPA React (Vite) no browser, API REST em ASP.NET Core e PostgreSQL no Supabase. O frontend e o backend ficam em pastas separadas no mesmo repositório, o que simplifica o Docker Compose e o trabalho em equipe.

```
Browser ──► React (Vite) ──► API /danke/* ──► EF Core ──► PostgreSQL (Supabase)
```

Em produção, o frontend é servido pela **Vercel** e a API pela **Railway**. O banco continua no **Supabase** (instâncias distintas para dev e produção).

## Camadas

| Camada | Tecnologia | Função |
|---|---|---|
| Frontend | React 19 + Vite | Interface, rotas, formulários, sessão no browser |
| API | ASP.NET Core 10 | Autenticação, autorização, regras de negócio |
| Persistência | EF Core + Npgsql | ORM e migrations |
| Banco | PostgreSQL | Clientes, funcionários e revisões |

Todos os endpoints usam o prefixo `/danke/`. JSON em **camelCase**; datas gravadas em **UTC** no banco e formatadas em pt-BR na interface.

## Autenticação (resumo)

Login unificado em `POST /danke/auth/login`. A API busca o e-mail em `clientes` e, se não achar, em `funcionarios`. Senha validada com BCrypt; resposta com JWT (7 dias) e dados do usuário (`role`: Cliente, Funcionario ou Admin).

O frontend guarda token e usuário no `localStorage` e envia `Authorization: Bearer` nas requisições. Rotas protegidas no React (`ProtectedRoute`) complementam, mas a autorização real está nos atributos `[Authorize]` da API.

Detalhes por camada: [frontend.md](./frontend.md), [backend.md](./backend.md).

## Ambientes

### Desenvolvimento (Docker Compose)

- Frontend: http://localhost:5173  
- API: http://localhost:8080 (Swagger em `/swagger`)  
- Banco: connection string do `.env.development` (geralmente Supabase de dev)

No Compose, o Vite faz **proxy** de `/danke` e `/health` para o container `backend:8080`. O browser não precisa chamar a porta 8080 diretamente; `VITE_API_URL` fica vazio e `API_PROXY_TARGET=http://backend:8080` vale só para o dev server.

### Produção

Deploy automático a partir da branch `production`. O frontend usa `VITE_API_URL` apontando para a URL pública do Railway. CORS no backend (`AllowedOrigins__0`) deve ser a URL exata do Vercel.

Health check: `GET /health` → `{ "status": "healthy" }` (Docker e Railway).

## Estrutura do repositório

```
danke-motorsport/
├── frontend/src/     components, pages, routes, services, styles, utils
├── backend/          Controllers, Models, Data, Services, Migrations
├── docs/
└── docker-compose.yml
```

## Escolhas gerais

- **Monorepo** frontend + backend para um único `docker compose up`.
- **Supabase** como PostgreSQL gerenciado (sem operar servidor próprio no MVP).
- **JWT stateless** — sem store de sessão no servidor.
- **CSS puro** nos dashboards (Swiss Design + cores Danke), sem UI kit externo.
- **Sem fila de mensagens** — fluxo síncrono HTTP, suficiente para o volume atual.

## Limitações conhecidas (projeto)

- JWT no `localStorage` (sem refresh token).
- Listagens sem paginação.
- Planos de revisão (`tipo_revisao`) como inteiro, sem tabela de lookup no banco.
- Poucos testes automatizados.

Mais detalhes por camada nos outros arquivos desta pasta.
