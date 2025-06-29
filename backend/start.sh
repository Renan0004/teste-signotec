#!/bin/bash

cd /var/www/html

# Verificar se o composer.json existe
if [ -f "composer.json" ]; then
    # Instalar dependências do Laravel
    composer install --no-interaction --optimize-autoloader

    # Verificar se o arquivo .env existe, se não, criar a partir do exemplo
    if [ ! -f ".env" ] && [ -f ".env.example" ]; then
        cp .env.example .env
        php artisan key:generate --ansi
    fi

    # Garantir que as permissões estão corretas para os diretórios de cache e storage
    chown -R www-data:www-data storage bootstrap/cache
    chmod -R 775 storage bootstrap/cache
    
    # Limpar todos os caches do Laravel para garantir que as alterações sejam aplicadas
    php artisan cache:clear
    php artisan config:clear
    php artisan route:clear
    php artisan view:clear
    
    # Executar migrações do banco de dados automaticamente
    php artisan migrate --force
fi

# Criar um arquivo router.php para processar todas as requisições através do Laravel
echo '<?php
// Arquivo router.php para o servidor PHP embutido
// Este arquivo garante que todas as requisições sejam processadas pelo Laravel
$uri = urldecode(parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH));

// Verificar se o arquivo existe diretamente
if ($uri !== "/" && file_exists(__DIR__ . "/public" . $uri)) {
    // Servir o arquivo diretamente
    return false;
}

// Se não for um arquivo estático, rotear para o index.php do Laravel
require_once __DIR__ . "/public/index.php";
' > router.php

# Iniciar servidor PHP embutido na porta 8000 com o router.php
php -S 0.0.0.0:8000 router.php 