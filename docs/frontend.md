# Frontend

## Stack

React 19, Vite, React Router DOM, Axios, React Hot Toast, React Icons e React IMask. Estilização com **CSS puro** (sem Tailwind ou biblioteca de componentes), para manter o visual alinhado à marca Danke.

## Organização

```
frontend/src/
├── components/     Navbar, menu do usuário
├── contexts/       AuthContext (sessão)
├── pages/          Landing, Auth, dashboards, Sobre, Perfil
├── routes/         Router, ProtectedRoute, GuestRoute
├── services/       api.js (Axios)
├── styles/         dashboard-swiss.css
└── utils/          authRoutes, scheduling
```

Estado global limitado ao **AuthContext**; cada página usa `useState` local. Não usamos Redux nem Zustand.

## Design

Tokens principais em `styles/dashboard-swiss.css`: fundo `#1B1B1B`, accent `#E30613`, bordas `#333333`. Dashboards importam esse arquivo para não repetir estilos.

Planos **Bronze**, **Silver** e **Gold** têm badges com cores distintas (classes `.badge-bronze`, `.badge-silver`, `.badge-gold`). No formulário de agendamento, os cards de plano usam a mesma paleta quando selecionados.

## Rotas

| Rota | Quem acessa |
|---|---|
| `/`, `/sobre` | Qualquer visitante |
| `/auth` | Visitante (logado é redirecionado) |
| `/perfil` | Usuário autenticado |
| `/client-dashboard` | Cliente |
| `/employee-dashboard` | Funcionário ou Admin |
| `/admin-dashboard` | Admin |

`ProtectedRoute` checa login e, quando necessário, a `role`. `GuestRoute` evita que usuário logado volte ao login. Redirecionamento pós-login em `utils/authRoutes.js`.

## Sessão e API

Login via `AuthContext.login()` → `POST /danke/auth/login`. Token e usuário ficam em `@DankeMotorsport:token` e `@DankeMotorsport:user` no `localStorage`. O interceptor do Axios anexa o Bearer automaticamente.

**Produção:** `VITE_API_URL` aponta para o Railway.

**Desenvolvimento:** com `VITE_API_URL` vazio, requisições relativas (`/danke/...`) passam pelo proxy do Vite (`vite.config.js`), configurado no Docker com `API_PROXY_TARGET=http://backend:8080`.

## Páginas principais

**ClientDashboard** — escolha do plano, data/hora do agendamento, observação opcional, histórico em tabela (com observação do cliente e feedback do mecânico quando existirem).

**EmployeeDashboard** — Kanban (Pendentes / Em Andamento / Concluídos), atualização de status, feedback do mecânico, auto-atribuição na primeira interação.

**AdminDashboard** — estatísticas, abas de revisões/clientes/funcionários, edição em modal.

## Validações no browser

Agendamentos passam por `utils/scheduling.js` antes do POST:

- não permitir data/hora no passado;
- horário entre **08:00 e 18:00** (horário local do browser).

A API repete essas regras no backend (`AgendamentoValidator`), usando fuso `America/Sao_Paulo`.

Cadastro e perfil usam máscaras de CPF e telefone (React IMask). Cadastro exige confirmação de senha.

## Responsividade

Media queries em `576px`, `768px` e `992px`. Landing e dashboards empilham colunas no mobile; tabelas ganham scroll horizontal. Mapa da oficina na landing via iframe do Google Maps.
