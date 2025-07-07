# Sistema de Gerenciamento de Vagas e Candidatos - SignoTech


## Sobre o Projeto

Este sistema foi desenvolvido como parte do teste técnico para a vaga de desenvolvedor na SignoTech. Trata-se de uma plataforma completa para gerenciamento de vagas de emprego e candidaturas, permitindo que empresas publiquem suas oportunidades e que candidatos possam se inscrever nelas.

O projeto foi construído com uma arquitetura moderna, separando o backend (Laravel/PHP) e o frontend (React), proporcionando uma experiência fluida tanto para administradores quanto para candidatos.

### O Que Foi Implementado

- **Sistema de Autenticação**: Login e registro de usuários com proteção de rotas
- **Gerenciamento de Vagas**: Criação, visualização, edição e exclusão de vagas de emprego
- **Gerenciamento de Candidatos**: Cadastro completo de candidatos com informações profissionais
- **Experiências Profissionais**: Possibilidade de adicionar múltiplas experiências para cada candidato
- **Vinculação**: Um candidato pode se candidatar a múltiplas vagas
- **Controle de Status**: Vagas podem ser pausadas/fechadas para novas candidaturas
- **Filtros Avançados**: Busca por nome, e-mail e outros campos relevantes
- **Ordenação**: Possibilidade de ordenar por diferentes campos (nome, data, etc.)
- **Interface Responsiva**: Adaptação para diferentes tamanhos de tela
- **Validações**: Tanto no frontend quanto no backend para garantir a integridade dos dados

### Tecnologias Utilizadas

#### Backend
- **Laravel 10**: Framework PHP robusto e moderno
- **MySQL**: Banco de dados relacional para armazenamento persistente
- **Laravel Sanctum**: Sistema de autenticação via tokens
- **Migrations e Seeders**: Para estruturação e população inicial do banco de dados

#### Frontend
- **React 18**: Biblioteca JavaScript para construção de interfaces
- **Material UI**: Framework de componentes React para um design consistente
- **React Router**: Navegação entre páginas da aplicação
- **Context API**: Gerenciamento de estado global
- **Axios**: Cliente HTTP para comunicação com a API

## Como Executar o Projeto

### Pré-requisitos
- PHP 8.1 ou superior
- Composer (gerenciador de pacotes PHP)
- Node.js 16 ou superior
- MySQL 8.0 ou superior
- Git

### Passos para Instalação

1. **Clone o repositório**:
```bash
git clone https://github.com/Renan0004/teste-signotec.git
cd teste-signotec
```

2. **Configure o Backend**:
```bash
cd api
composer install
cp .env.example .env
```

3. **Configure o banco de dados** no arquivo `.env`:
```
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=signotech_teste
DB_USERNAME=seu_usuario
DB_PASSWORD=sua_senha
```

4. **Finalize a configuração do backend**:
```bash
php artisan key:generate
php artisan migrate --seed
php artisan storage:link
php artisan serve
```

5. **Configure o Frontend** (em outro terminal):
```bash
cd frontend
npm install
npm start
```

### Acessando o Sistema

- **Frontend**: http://localhost:3000
- **API**: http://localhost:8000/api

### Usuário de Teste
- **Email**: admin@exemplo.com
- **Senha**: password

## Estrutura do Projeto

O projeto foi organizado seguindo as melhores práticas de desenvolvimento, com separação clara de responsabilidades:

### Backend (Laravel)

- **Controllers**: Gerenciam as requisições HTTP e retornam respostas
- **Models**: Representam as entidades do banco de dados e suas relações
- **Migrations**: Definem a estrutura do banco de dados
- **Routes**: Definem os endpoints da API
- **Middleware**: Controla autenticação e outras verificações

### Frontend (React)

- **Components**: Componentes reutilizáveis da interface
- **Pages**: Páginas completas da aplicação
- **Contexts**: Gerenciamento de estado global
- **Services**: Comunicação com a API
- **Layouts**: Estruturas de página reutilizáveis

## Funcionalidades Detalhadas

### Vagas
- Cadastro com informações detalhadas (título, descrição, requisitos)
- Definição de tipo de contrato (CLT, PJ, Freelancer)
- Controle de status (aberta, fechada, em andamento)
- Listagem com filtros e ordenação
- Visualização detalhada de cada vaga

### Candidatos
- Cadastro com informações pessoais e profissionais
- Múltiplas experiências profissionais
- Vinculação com vagas de interesse
- Busca avançada por diferentes critérios
- Visualização de candidatos por vaga

### Sistema de Autenticação
- Registro de novos usuários
- Login seguro com tokens
- Proteção de rotas sensíveis
- Logout e gerenciamento de sessão

## Melhorias Implementadas

Durante o desenvolvimento, foram realizadas diversas melhorias para garantir a qualidade do código:

1. **Tratamento de Erros**: Implementação de tratamento adequado de exceções
2. **Validações**: Regras de validação robustas tanto no frontend quanto no backend
3. **Codificação UTF-8**: Correção de problemas com caracteres especiais
4. **Exclusão Permanente**: Implementação de exclusão definitiva de registros quando solicitado
5. **Interface Responsiva**: Adaptação para diferentes dispositivos
6. **Logs Detalhados**: Registro de operações importantes para facilitar depuração

## Considerações Finais

Este projeto foi desenvolvido com foco na qualidade do código, usabilidade e aderência aos requisitos solicitados. A arquitetura escolhida permite fácil manutenção e extensão das funcionalidades no futuro.

---

Desenvolvido para o processo seletivo da SignoTech. 