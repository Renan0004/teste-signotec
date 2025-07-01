# Sistema de Vagas

Este é um sistema de gerenciamento de vagas e candidatos desenvolvido com Laravel (backend) e React (frontend).

## Requisitos

- PHP 8.1 ou superior
- Composer
- Node.js 14 ou superior
- NPM ou Yarn

## Instalação

### Backend (Laravel)

1. Entre na pasta do backend:
```bash
cd api
```

2. Instale as dependências:
```bash
composer install
```

3. Copie o arquivo .env.example para .env e configure o banco de dados SQLite:
```bash
cp .env.example .env
```

4. Gere a chave da aplicação:
```bash
php artisan key:generate
```

5. Execute as migrations:
```bash
php artisan migrate
```

6. Inicie o servidor:
```bash
php artisan serve
```

### Frontend (React)

1. Entre na pasta do frontend:
```bash
cd frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Inicie o servidor de desenvolvimento:
```bash
npm start
```

## Uso

O sistema estará disponível em:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000

### Funcionalidades

- CRUD de vagas (CLT, PJ ou Freelancer)
- CRUD de candidatos
- Inscrição de candidatos em vagas
- Filtro e ordenação de listagens
- Paginação de 20 itens por página 