# Sistema de Vagas - Frontend

Frontend do sistema de gerenciamento de vagas e candidatos desenvolvido com React e Material-UI.

## Tecnologias Utilizadas

- React 18
- Material-UI 5
- React Router 6
- Axios
- Notistack
- Date-fns

## Funcionalidades

- Autenticação de usuários
- Gerenciamento de vagas
  - Listagem com paginação e busca
  - Criação, edição e exclusão
  - Status da vaga
  - Requisitos e benefícios
- Gerenciamento de candidatos
  - Listagem com paginação e busca
  - Criação, edição e exclusão
  - Upload de currículo
  - Informações profissionais

## Pré-requisitos

- Node.js 16+
- NPM 8+

## Instalação

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/teste-signotec.git
cd teste-signotec/frontend
```

2. Instale as dependências:
```bash
npm install
```

3. Crie o arquivo `.env` na raiz do projeto com as seguintes variáveis:
```env
REACT_APP_API_URL=http://localhost:8000/api
```

## Executando o Projeto

1. Inicie o servidor de desenvolvimento:
```bash
npm start
```

2. Acesse o sistema em: [http://localhost:3000](http://localhost:3000)

## Build para Produção

1. Gere o build:
```bash
npm run build
```

2. Os arquivos serão gerados na pasta `build`

## Estrutura do Projeto

```
src/
  ├── components/       # Componentes reutilizáveis
  ├── contexts/        # Contextos do React
  ├── layouts/         # Layouts da aplicação
  ├── pages/          # Páginas/rotas
  ├── services/       # Serviços e API
  ├── theme/          # Configuração do tema
  ├── config/         # Configurações globais
  └── App.js          # Componente principal
```

## Convenções de Código

- Componentes em PascalCase
- Arquivos de componente: index.js
- Hooks personalizados com prefixo "use"
- Estilos com Material-UI sx prop
- Prettier para formatação
- ESLint para linting

## Contribuindo

1. Crie uma branch para sua feature
2. Faça commit das alterações
3. Push para a branch
4. Crie um Pull Request

## Licença

Este projeto está sob a licença MIT.

src/
  ├── components/       # Componentes reutilizáveis
  ├── contexts/        # Contextos do React
  ├── layouts/         # Layouts da aplicação
  ├── pages/          # Páginas/rotas
  ├── services/       # Serviços e API
  ├── theme/          # Configuração do tema
  ├── config/         # Configurações globais
  └── App.js          # Componente principal
```

## Convenções de Código

- Componentes em PascalCase
- Arquivos de componente: index.js
- Hooks personalizados com prefixo "use"
- Estilos com Material-UI sx prop
- Prettier para formatação
- ESLint para linting

## Contribuindo

1. Crie uma branch para sua feature
2. Faça commit das alterações
3. Push para a branch
4. Crie um Pull Request

## Licença

Este projeto está sob a licença MIT.

src/
  ├── components/       # Componentes reutilizáveis
  ├── contexts/        # Contextos do React
  ├── layouts/         # Layouts da aplicação
  ├── pages/          # Páginas/rotas
  ├── services/       # Serviços e API
  ├── theme/          # Configuração do tema
  ├── config/         # Configurações globais
  └── App.js          # Componente principal
```

## Convenções de Código

- Componentes em PascalCase
- Arquivos de componente: index.js
- Hooks personalizados com prefixo "use"
- Estilos com Material-UI sx prop
- Prettier para formatação
- ESLint para linting

## Contribuindo

1. Crie uma branch para sua feature
2. Faça commit das alterações
3. Push para a branch
4. Crie um Pull Request

## Licença

Este projeto está sob a licença MIT.
