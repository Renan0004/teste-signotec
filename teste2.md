# Instruções para Execução do Teste Técnico - SignoTech

## Pré-requisitos
- PHP 8.1+
- Composer
- Node.js 16+
- MySQL 8.0+

## Checklist de Entrega

- [x] CRUD completo de vagas (CLT, Pessoa Jurídica, Freelancer)
- [x] CRUD completo de candidatos
- [x] Candidatos podem se inscrever em uma ou mais vagas
- [x] Pausar vagas para evitar novas inscrições
- [x] Filtros, ordenação e paginação em todos os CRUDs
- [x] Validação de campos obrigatórios e tipos de dados
- [x] Autenticação de usuários
- [x] API REST JSON para todos os CRUDs
- [x] Deleção em massa de itens
- [x] Configuração de itens por página
- [x] Testes unitários e de integração (backend e frontend)
- [x] Migrations, Seeders e Factories
- [x] Documentação da API (Swagger)

## Configuração

### Backend (Laravel)

1. Navegue até a pasta `api`:
```bash
cd api
```

2. Instale as dependências do PHP:
```bash
composer install
```

3. Copie o arquivo de ambiente:
```bash
cp .env.example .env
```

4. Configure o arquivo `.env` com as credenciais do seu banco de dados:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=signotech_teste
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
```

5. Gere a chave da aplicação:
```bash
php artisan key:generate
```

6. Execute as migrações e seeds para criar e popular o banco de dados:
```bash
php artisan migrate --seed
```

7. Configure o link simbólico para armazenamento:
```bash
php artisan storage:link
```

8. Inicie o servidor de desenvolvimento:
```bash
php artisan serve
```

O backend estará disponível em: `http://localhost:8000`

### Frontend (React)

1. Navegue até a pasta `frontend`:
```bash
cd ../frontend
```

2. Instale as dependências do Node.js:
```bash
npm install
```

3. Copie o arquivo de ambiente:
```bash
cp .env.example .env
```

4. Configure o arquivo `.env` apontando para o backend:
```
REACT_APP_API_URL=http://localhost:8000
```

5. Inicie o servidor de desenvolvimento:
```bash
npm start
```

O frontend estará disponível em: `http://localhost:3000`

## Testes

### Backend (Laravel)
Para rodar os testes automatizados:
```bash
php artisan test
```

### Frontend (React)
Para rodar os testes automatizados:
```bash
npm test
```

## Documentação da API

A documentação da API está disponível via Swagger. Após rodar o backend, acesse:
```
http://localhost:8000/api/documentation
```

## Credenciais de Teste

Após executar o seeder, você pode acessar o sistema com as seguintes credenciais:

**Usuário Admin:**
- Email: admin@exemplo.com
- Senha: password

## Observações

- As vagas podem ter os status: "aberta", "fechada" ou "em_andamento"
- Os candidatos podem se inscrever apenas em vagas com status "aberta"
- O sistema utiliza Laravel Sanctum para autenticação via token
- Os currículos são armazenados na pasta `storage/app/public/resumes`

## Diferenciais Implementados

- API RESTful completa para todos os CRUDs
- Autenticação de usuários (login, registro, proteção de rotas)
- Deleção em massa de candidatos e vagas
- Permite alterar o número de itens por página
- Documentação da API via Swagger
- Testes automatizados backend e frontend
- Interface responsiva e moderna

## Como entregar

1. Faça um fork deste repositório.
2. Crie uma branch com seu nome completo.
3. Confirme que todas as alterações estão commitadas e pushadas para o seu fork.
4. Envie um Pull Request para o repositório original.
5. No Pull Request, escreva um resumo do que foi feito e destaque os diferenciais implementados.

---

Qualquer dúvida, estou à disposição!

