#!/bin/bash

# Cores para mensagens
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}Iniciando configuração do projeto SignoTech...${NC}"

# Iniciar containers Docker
echo -e "${BLUE}Iniciando containers Docker...${NC}"
docker-compose up -d
echo -e "${GREEN}Containers iniciados com sucesso!${NC}"

# Configurar backend
echo -e "${BLUE}Configurando backend...${NC}"
docker exec -it signotec-backend bash -c "
    cd /var/www/html && \
    composer install && \
    cp .env.example .env && \
    php artisan key:generate && \
    php artisan migrate:fresh --seed && \
    php artisan db:clean && \
    php artisan storage:link && \
    chmod -R 777 storage bootstrap/cache
"
echo -e "${GREEN}Backend configurado com sucesso!${NC}"

echo -e "${BLUE}Limpando o banco de dados...${NC}"
echo -e "${GREEN}Banco de dados limpo! Apenas as tabelas necessárias para o teste foram mantidas.${NC}"
echo -e "${GREEN}Tabelas mantidas: users, personal_access_tokens, job_listings, candidates, candidate_job, migrations${NC}"

echo -e "${GREEN}Configuração concluída!${NC}"
echo -e "${BLUE}Acesse:${NC}"
echo -e "- Frontend: http://localhost:3000"
echo -e "- Backend API: http://localhost:8000/api"
echo -e "- phpMyAdmin: http://localhost:8080 (usuário: signotec, senha: secret)"
echo -e "${BLUE}Credenciais de acesso:${NC}"
echo -e "- Admin: admin@signotec.com / password"
echo -e "- Usuário: usuario@signotec.com / password" 