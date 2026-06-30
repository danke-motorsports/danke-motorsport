# Banco de dados

PostgreSQL hospedado no **Supabase**. Acesso via connection string em variável de ambiente. Schema gerenciado com **EF Core Code First**; tabelas e colunas em **snake_case**, classes C# em **PascalCase**.

## Relacionamentos

```
clientes (1) ──< revisoes >── (0..1) funcionarios
```

- Cada revisão pertence a um **cliente** (`id_cliente`, NOT NULL).
- **Funcionário** é opcional (`id_funcionario` NULL até alguém assumir o serviço).
- Excluir cliente **cascade** nas revisões dele.
- Excluir funcionário **não** apaga revisões (FK sem cascade).

## Tabela `clientes`

| Coluna | Tipo | Observação |
|---|---|---|
| `id` | serial PK | |
| `nome` | text | NOT NULL |
| `email` | text | NOT NULL, UNIQUE |
| `cpf` | text | NOT NULL |
| `telefone` | text | NOT NULL |
| `placa_veiculo` | text | pode ser vazia no cadastro |
| `senha` | text | hash BCrypt |

Índice único em `email` (`AppDbContext`).

## Tabela `funcionarios`

| Coluna | Tipo | Observação |
|---|---|---|
| `id_funcionario` | serial PK | |
| `nome_funcionario` | text | NOT NULL |
| `tipo_funcionario` | int | `1` = admin (role JWT `Admin`) |
| `cargo` | int | código interno |
| `email` | text | NOT NULL, UNIQUE |
| `senha` | text | hash BCrypt |

Admin não é tabela separada — distinção por `tipo_funcionario`.

## Tabela `revisoes`

| Coluna | Tipo | Observação |
|---|---|---|
| `id_revisao` | serial PK | |
| `status_revisao` | text | `Pendente`, `Em Andamento`, `Concluído` |
| `tipo_revisao` | int | 1 Bronze, 2 Silver, 3 Gold |
| `dat_agendamento` | timestamptz | UTC |
| `dat_finalizacao` | timestamptz | placeholder na criação; atualizado ao concluir |
| `id_cliente` | int FK | → `clientes.id` |
| `id_funcionario` | int FK NULL | → `funcionarios.id_funcionario` |
| `observacao_cliente` | text NULL | |
| `feedback_mecanico` | text NULL | |

Status e planos são valores fixos no código, não tabelas lookup.

## Datas

Colunas `timestamptz`. Backend grava UTC (`ToUniversalTime()`). Validação de horário comercial usa `America/Sao_Paulo`. Frontend formata com locale pt-BR.

## Migrations

| Migration | O que faz |
|---|---|
| `SetupInicial` | Cria as três tabelas e FKs |
| `AddAuthAndNullableEmployee` | E-mail/senha em clientes e funcionários; `id_funcionario` nullable |
| `AddUniqueEmailConstraints` | UNIQUE em `clientes.email` e `funcionarios.email` |
| `AddObservacaoAndFeedbackToRevisoes` | `observacao_cliente`, `feedback_mecanico` |

Aplicar:

```bash
docker compose run --rm backend dotnet ef database update
```

ou, fora do Docker, `dotnet ef database update` na pasta `backend/`.

EF mantém histórico em `__EFMigrationsHistory` — não editar manualmente.

## Primeiro administrador

Não há seed no código. Inserir manualmente no Supabase (senha em BCrypt, mesma lib do backend):

```sql
INSERT INTO funcionarios (nome_funcionario, tipo_funcionario, cargo, email, senha)
VALUES ('Admin', 1, 1, 'admin@exemplo.com', '<bcrypt-hash>');
```

## Keep-alive (Supabase)

Workflow `.github/workflows/keepalive.yml` roda `SELECT 1` periodicamente para reduzir pausa do banco no plano gratuito por inatividade.
