# Documentação Técnica — Danke Motorsport

Este diretório registra **decisões de projeto**, **arquitetura** e **modelo de dados** do sistema de agendamento da Danke Motorsport.

## Índice

| Documento | Conteúdo |
|---|---|
| [Arquitetura](./arquitetura.md) | Visão geral do sistema, fluxos, deploy e ambiente local |
| [Frontend](./frontend.md) | Decisões da camada React/Vite |
| [Backend](./backend.md) | Decisões da API .NET, autenticação e regras de negócio |
| [Banco de Dados](./banco-de-dados.md) | Modelo relacional, constraints e histórico de migrations |

## Contexto do projeto

Sistema web full-stack para centralizar agendamentos de revisões automotivas da **Danke Motorsport** (Palhoça/SC), substituindo o fluxo manual via WhatsApp. O MVP cobre três perfis de usuário — **Cliente**, **Funcionário** e **Admin** — com autenticação JWT e persistência em PostgreSQL (Supabase).

Para instruções de execução e deploy, consulte o [README principal](../README.md) e o [setup.xml](../setup.xml).
