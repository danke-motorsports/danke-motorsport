# Documentação técnica

Documentação do sistema de agendamento da **Danke Motorsport**, organizada por camada.

| Arquivo | Assunto |
|---|---|
| [arquitetura.md](./arquitetura.md) | Visão geral, ambientes e deploy |
| [frontend.md](./frontend.md) | React, rotas, UI e validações no browser |
| [backend.md](./backend.md) | API .NET, autenticação e regras de negócio |
| [banco-de-dados.md](./banco-de-dados.md) | Tabelas, relacionamentos e migrations |

Entrega acadêmica (descrição, integrantes, links): [README principal](../README.md).  
Execução local e produção: [setup.xml](../setup.xml).

O MVP atende três perfis — **Cliente**, **Funcionário** e **Admin** — com login JWT e dados em PostgreSQL (Supabase).
