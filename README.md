# Sistema de Vagas - SignoTech

<div align="center">
  <img src="https://signotech.com.br/wp-content/uploads/2023/03/SignoTech.webp" width="20%" />
</div>

## Sobre o Projeto

Sistema de gerenciamento de vagas e candidatos desenvolvido para o teste técnico da SignoTech. O sistema permite o cadastro de vagas e candidatos, além de possibilitar a vinculação entre eles.

### Funcionalidades

- CRUD completo de vagas
- CRUD completo de candidatos
- Upload de currículos
- Sistema de autenticação
- Vinculação entre candidatos e vagas
- Filtros e ordenação
- Paginação personalizada
- Interface responsiva

### Tecnologias Utilizadas

#### Backend
- Laravel 10
- MySQL
- Sanctum (autenticação)

#### Frontend
- React 18
- Material UI
- React Router v7
- Axios

## Instalação

### Pré-requisitos
- PHP 8.1+
- Composer
- Node.js 16+
- MySQL 8.0+
- Git

### Passos para Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/teste-signotec.git
cd teste-signotec
```

2. Configure o backend:
```bash
cd api
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan storage:link
php artisan serve
```

3. Configure o frontend:
```bash
cd frontend
npm install
npm start
```

### Acessando o Sistema

- Frontend: http://localhost:3000
- Backend: http://localhost:8000/api

### Usuário Padrão
- Email: admin@example.com
- Senha: password

## Estrutura do Projeto

### Backend (Laravel)

```
api/
  ├── app/
  │   ├── Http/Controllers/     # Controladores
  │   ├── Models/              # Modelos
  │   └── Providers/           # Provedores de serviço
  ├── database/
  │   ├── migrations/          # Migrações
  │   ├── factories/           # Factories para testes
  │   └── seeders/            # Seeders para dados iniciais
  └── routes/
      └── api.php             # Rotas da API
```

### Frontend (React)

```
frontend/
  ├── src/
  │   ├── components/         # Componentes React
  │   ├── contexts/          # Contextos (ex: autenticação)
  │   ├── layouts/           # Layouts da aplicação
  │   ├── pages/            # Páginas
  │   ├── services/         # Serviços (ex: API)
  │   └── theme/            # Configuração do tema
  └── public/               # Arquivos públicos
```

## Testes

### Backend
```bash
cd api
php artisan test
```

### Frontend
```bash
cd frontend
npm test
```

## Documentação da API

A documentação da API está disponível em:
- Swagger: http://localhost:8000/api/documentation
- Postman: [Link para a coleção do Postman]

## Contribuindo

1. Faça o fork do projeto
2. Crie sua branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 