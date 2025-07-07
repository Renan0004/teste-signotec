# API do Sistema de Gerenciamento de Vagas - SignoTech

Esta é a API backend do sistema de gerenciamento de vagas e candidatos desenvolvido para o teste técnico da SignoTech.

## Tecnologias Utilizadas

- Laravel 10
- MySQL
- Laravel Sanctum (autenticação por token)
- Migrations e Seeders

## Estrutura Principal

- **Controllers**: Gerenciam as requisições HTTP e retornam respostas
  - `AuthController`: Autenticação de usuários
  - `CandidateController`: Gerenciamento de candidatos
  - `JobController`: Gerenciamento de vagas
  
- **Models**: Representam as entidades do banco de dados
  - `User`: Usuários do sistema
  - `Candidate`: Candidatos às vagas
  - `Job`: Vagas disponíveis

- **Routes**: Endpoints da API definidos em `routes/api.php`

## Endpoints Principais

### Autenticação
- `POST /api/register`: Registro de novos usuários
- `POST /api/login`: Login de usuários
- `POST /api/logout`: Logout (requer autenticação)

### Vagas
- `GET /api/jobs`: Listar todas as vagas
- `GET /api/jobs/{id}`: Obter detalhes de uma vaga
- `POST /api/jobs`: Criar nova vaga (requer autenticação)
- `PUT /api/jobs/{id}`: Atualizar vaga (requer autenticação)
- `DELETE /api/jobs/{id}`: Excluir vaga (requer autenticação)

### Candidatos
- `GET /api/candidates`: Listar todos os candidatos
- `GET /api/candidates/{id}`: Obter detalhes de um candidato
- `POST /api/candidates`: Criar novo candidato
- `PUT /api/candidates/{id}`: Atualizar candidato
- `DELETE /api/candidates/{id}`: Excluir candidato

## Instalação

1. Clone o repositório e acesse a pasta do projeto
2. Execute `composer install`
3. Copie `.env.example` para `.env` e configure seu banco de dados
4. Execute `php artisan key:generate`
5. Execute `php artisan migrate --seed` para criar e popular o banco de dados
6. Execute `php artisan storage:link` para criar o link simbólico para armazenamento
7. Inicie o servidor com `php artisan serve`

## Usuário de Teste

Após executar o seeder, você pode usar as seguintes credenciais:

- **Email**: admin@example.com
- **Senha**: password
