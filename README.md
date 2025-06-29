# Teste SignoTech - Sistema de Gerenciamento de Vagas e Candidatos

Este projeto implementa um sistema de gerenciamento de vagas e candidatos, conforme solicitado no teste da SignoTech.

## Requisitos do Sistema

- Docker e Docker Compose
- PHP 8.1 ou superior
- Composer
- Node.js 16 ou superior
- NPM ou Yarn

## Configuração do Ambiente

### Usando Docker (Recomendado)

1. Clone o repositório:
   ```
   git clone https://github.com/seu-usuario/teste-signotec.git
   cd teste-signotec
   ```

2. Inicie os contêineres Docker:
   ```
   docker-compose up -d
   ```

3. Acesse o contêiner do backend para executar comandos:
   ```
   docker exec -it signotec-backend bash
   ```

4. Dentro do contêiner, execute as migrações e seeders:
   ```
   php artisan migrate --seed
   ```

5. Limpe o banco de dados para manter apenas as tabelas necessárias:
   ```
   php artisan db:clean
   ```

6. Acesse o frontend em: http://localhost:3000
7. Acesse o backend em: http://localhost:8000
8. Acesse o phpMyAdmin em: http://localhost:8080 (usuário: signotec, senha: secret)

### Instalação Manual (Sem Docker)

1. Configure o backend:
   ```
   cd backend
   composer install
   cp .env.example .env
   php artisan key:generate
   ```

2. Configure o banco de dados no arquivo .env e execute as migrações:
   ```
   php artisan migrate --seed
   php artisan db:clean
   ```

3. Inicie o servidor do backend:
   ```
   php artisan serve
   ```

4. Configure o frontend:
   ```
   cd ../frontend
   npm install
   ```

5. Inicie o servidor do frontend:
   ```
   npm start
   ```

## Estrutura do Banco de Dados

O banco de dados foi otimizado para manter apenas as tabelas necessárias para o teste:

1. **users** - Para autenticação de usuários
2. **personal_access_tokens** - Para autenticação via API
3. **job_listings** - Para o CRUD de vagas
4. **candidates** - Para o CRUD de candidatos
5. **candidate_job** - Para relacionamento entre candidatos e vagas

## Funcionalidades Implementadas

- CRUD completo de vagas (criar, listar, editar, excluir)
- CRUD completo de candidatos (criar, listar, editar, excluir)
- Relacionamento muitos-para-muitos entre candidatos e vagas
- Possibilidade de "pausar" uma vaga (desativar)
- Filtros e ordenação em todos os CRUDs
- Paginação de 20 itens por página
- Validação de campos obrigatórios
- API REST para todos os CRUDs
- Autenticação de usuários
- Deleção em massa de itens

## Comandos Úteis

### Limpar o Banco de Dados

Para manter apenas as tabelas necessárias para o teste:

```
php artisan db:clean
```

### Recriar o Banco de Dados

Para recriar o banco de dados do zero:

```
php artisan migrate:fresh --seed
php artisan db:clean
```

### Executar Testes

```
php artisan test
```

## API Documentation

A documentação da API está disponível em:

- Swagger UI: http://localhost:8000/api/documentation
- Arquivo Postman: `docs/SignoTech-API.postman_collection.json` 