# Estrutura do Banco de Dados - Teste SignoTech

Este documento descreve a estrutura do banco de dados utilizado no teste da SignoTech.

## Tabelas Principais

### 1. `job_listings` - Vagas

Armazena informações sobre as vagas disponíveis.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | int | Identificador único da vaga |
| title | string | Título da vaga |
| description | text | Descrição detalhada da vaga |
| requirements | text | Requisitos necessários (opcional) |
| type | enum | Tipo de contratação: 'CLT', 'PJ', 'FREELANCER' |
| active | boolean | Status da vaga (ativa/inativa) |
| created_at | timestamp | Data de criação |
| updated_at | timestamp | Data da última atualização |

### 2. `candidates` - Candidatos

Armazena informações sobre os candidatos.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | int | Identificador único do candidato |
| name | string | Nome completo do candidato |
| email | string | Email do candidato (único) |
| phone | string | Telefone de contato (opcional) |
| resume | text | Currículo ou resumo profissional (opcional) |
| created_at | timestamp | Data de criação |
| updated_at | timestamp | Data da última atualização |

### 3. `candidate_job` - Relacionamento entre Candidatos e Vagas

Implementa o relacionamento muitos-para-muitos entre candidatos e vagas.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | int | Identificador único do relacionamento |
| candidate_id | int | Chave estrangeira para a tabela de candidatos |
| job_id | int | Chave estrangeira para a tabela de vagas |
| created_at | timestamp | Data de criação |
| updated_at | timestamp | Data da última atualização |

## Tabelas de Autenticação

### 4. `users` - Usuários do Sistema

Armazena informações sobre os usuários que têm acesso ao sistema.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | int | Identificador único do usuário |
| name | string | Nome do usuário |
| email | string | Email do usuário (único) |
| email_verified_at | timestamp | Data de verificação do email (opcional) |
| password | string | Senha criptografada |
| remember_token | string | Token para "lembrar de mim" (opcional) |
| created_at | timestamp | Data de criação |
| updated_at | timestamp | Data da última atualização |

### 5. `personal_access_tokens` - Tokens de Acesso à API

Armazena tokens de acesso pessoal para autenticação via API.

| Coluna | Tipo | Descrição |
|--------|------|-----------|
| id | int | Identificador único do token |
| tokenable_type | string | Tipo do modelo ao qual o token pertence |
| tokenable_id | int | ID do modelo ao qual o token pertence |
| name | string | Nome do token |
| token | string | Hash do token (único) |
| abilities | text | Habilidades/permissões do token (opcional) |
| last_used_at | timestamp | Data da última utilização (opcional) |
| expires_at | timestamp | Data de expiração (opcional) |
| created_at | timestamp | Data de criação |
| updated_at | timestamp | Data da última atualização |

## Diagrama ER

```
+---------------+       +----------------+       +---------------+
|     users     |       | candidate_job  |       |  job_listings |
+---------------+       +----------------+       +---------------+
| id            |       | id             |       | id            |
| name          |       | candidate_id   |<----->| title         |
| email         |       | job_id         |       | description   |
| password      |       | created_at     |       | requirements  |
| created_at    |       | updated_at     |       | type          |
| updated_at    |       +----------------+       | active        |
+---------------+               ^                | created_at    |
                                |                | updated_at    |
                                |                +---------------+
                                |
                        +---------------+
                        |  candidates   |
                        +---------------+
                        | id            |
                        | name          |
                        | email         |
                        | phone         |
                        | resume        |
                        | created_at    |
                        | updated_at    |
                        +---------------+
```

## Observações

1. A tabela `job_listings` foi nomeada assim em vez de `jobs` para evitar conflitos com a tabela de sistema do Laravel para filas.

2. O banco de dados foi otimizado para manter apenas as tabelas necessárias para o teste, removendo tabelas de sistema do Laravel que não são essenciais.

3. As tabelas seguem as convenções do Laravel, incluindo timestamps automáticos (`created_at` e `updated_at`).

4. Todas as chaves estrangeiras têm exclusão em cascata, garantindo a integridade referencial. 