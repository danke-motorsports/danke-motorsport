# Frontend — Decisões de Projeto

## Stack

| Escolha | Alternativas consideradas | Motivo da decisão |
|---|---|---|
| **React 19** | Vue, Angular | Ecossistema maduro; familiaridade da equipe |
| **Vite** | Create React App, Webpack manual | Dev server rápido; configuração enxuta |
| **React Router DOM v7** | TanStack Router | Padrão de mercado; guards de rota simples |
| **Axios** | fetch nativo | Interceptors para JWT; API consistente |
| **CSS puro** | Tailwind, MUI, Chakra | Identidade visual customizada (Swiss Design + Danke) sem dependência de UI kit |

## Organização do código

```
frontend/src/
├── components/       # Navbar, DashboardUserMenu (reutilizáveis)
├── contexts/         # AuthContext (estado global de sessão)
├── pages/            # Uma página por rota principal
├── routes/           # Router, ProtectedRoute, GuestRoute
├── services/         # Instância Axios (api.js)
├── styles/           # dashboard-swiss.css (design system compartilhado)
├── utils/            # authRoutes, scheduling (helpers puros)
└── assets/           # variables.css (tokens de cor globais)
```

**Decisão:** não adotar Redux/Zustand. O escopo do MVP cabe em **Context API** (`AuthContext`) + estado local por página (`useState`).

## Design system (Swiss minimal + Danke)

Arquivo central: `frontend/src/styles/dashboard-swiss.css`

| Token | Valor | Uso |
|---|---|---|
| `--swiss-bg` | `#1B1B1B` | Fundo principal |
| `--swiss-accent` | `#E30613` | Vermelho Danke (CTAs, destaques) |
| `--swiss-border` | `#333333` | Bordas e separadores |
| `--swiss-text-muted` | `#999999` | Labels e texto secundário |

**Decisão:** dashboards compartilham um CSS base importado por cada página (`@import '../styles/dashboard-swiss.css'`), evitando duplicação entre Client, Employee e Admin.

### Badges de plano (Bronze / Silver / Gold)

Cores leves e distintas para identificação visual rápida:

| Plano | Classe CSS | Cor de destaque |
|---|---|---|
| Bronze | `.badge-bronze` | Cobre quente (`#e8a86e`) |
| Silver | `.badge-silver` | Prata (`#c8ccd0`) |
| Gold | `.badge-gold` | Dourado (`#e8c547`) |

## Roteamento e controle de acesso

Configuração em `frontend/src/routes/index.jsx`.

| Rota | Acesso | Página |
|---|---|---|
| `/` | Público | Landing Page |
| `/auth` | Guest (não logado) | Login / Cadastro |
| `/sobre` | Público | Sobre nós |
| `/perfil` | Autenticado | Perfil do usuário |
| `/client-dashboard` | `Cliente` | Agendamento e histórico |
| `/employee-dashboard` | `Funcionario`, `Admin` | Kanban de revisões |
| `/admin-dashboard` | `Admin` | Gestão completa |

### Guards

- **`ProtectedRoute`**: exige login; opcionalmente restringe por `allowedRoles`
- **`GuestRoute`**: redireciona usuários já autenticados para o dashboard correto

Redirecionamento por role centralizado em `utils/authRoutes.js`:

```javascript
Cliente      → /client-dashboard
Funcionario  → /employee-dashboard
Admin        → /admin-dashboard
```

## Autenticação no browser

| Aspecto | Implementação |
|---|---|
| Login | `POST /danke/auth/login` via `AuthContext.login()` |
| Persistência | `localStorage`: `@DankeMotorsport:token` e `@DankeMotorsport:user` |
| Reidratação | `useEffect` no mount do `AuthProvider` |
| Token nas requisições | Interceptor Axios em `services/api.js` |

**Decisão:** `localStorage` em vez de cookies httpOnly — trade-off consciente para MVP (simplicidade); em produção futura, cookies + refresh token seria mais seguro contra XSS.

## Comunicação com a API

### Produção

`VITE_API_URL` define a URL base do Railway. Axios envia requisições diretamente ao backend.

### Desenvolvimento

Proxy do Vite (`vite.config.js`):

```javascript
proxy: {
  '/danke': { target: API_PROXY_TARGET || 'http://localhost:8080' },
  '/health': { target: API_PROXY_TARGET || 'http://localhost:8080' },
}
```

Com `VITE_API_URL` vazio, `api.js` usa `baseURL: ''` (URLs relativas) e o browser fala apenas com `:5173`.

## Páginas por perfil

### ClientDashboard

- Seleção de plano (radio cards Bronze/Silver/Gold)
- Formulário de agendamento com observação opcional
- Histórico em tabela com linha expandível (observação + feedback do mecânico)

### EmployeeDashboard

- Layout **Kanban** em 3 colunas: Pendentes → Em Andamento → Concluídos
- Auto-atribuição do funcionário ao iniciar/atualizar revisão
- Campo de feedback do mecânico ao concluir

### AdminDashboard

- Cards de estatísticas + abas (Revisões, Clientes, Funcionários)
- Modais de edição/criação
- CRUD completo via API

## Validações no frontend

| Regra | Onde | Arquivo |
|---|---|---|
| Horário comercial 08:00–18:00 | Agendamento | `utils/scheduling.js` |
| Não permitir passado | Agendamento | `utils/scheduling.js` |
| Máscaras CPF/telefone | Auth, Profile | React IMask |
| Confirmação de senha | Cadastro | `Auth.jsx` |

**Decisão:** validar no frontend **e** no backend — UX imediata no client, garantia de integridade no server.

## Responsividade

- Breakpoints: `576px`, `768px`, `992px`
- Landing: grid lado a lado → empilhado no mobile
- Dashboards: tabelas com scroll horizontal; Kanban empilha colunas
- Mapa (Google Maps iframe): largura total no mobile

## Bibliotecas auxiliares

| Lib | Uso |
|---|---|
| React Hot Toast | Feedback não-bloqueante (sucesso/erro) |
| React Icons | Ícones padronizados (Fa*, Md*) |
| React IMask | Máscara de CPF e telefone |

## Trade-offs e limitações conhecidas

| Limitação | Impacto | Evolução possível |
|---|---|---|
| Sem SSR/SSG | SEO limitado na SPA | Next.js se landing precisar de SEO forte |
| Sem testes automatizados | Regressões manuais | Vitest + Testing Library |
| Estado local nos dashboards | Sem cache global de listas | React Query para refetch/cache |
| JWT no localStorage | Vulnerável a XSS | Migrar para httpOnly cookie |
