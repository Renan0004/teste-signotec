FROM php:8.2-fpm

# Argumentos para criação do usuário no container
ARG user=laravel
ARG uid=1000

# Instalação de dependências necessárias para o Laravel
RUN apt-get update && apt-get install -y \
    git \
    curl \
    libpng-dev \
    libonig-dev \
    libxml2-dev \
    zip \
    unzip \
    libzip-dev \
    supervisor \
    nginx \
    libicu-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install intl

# Limpar cache para reduzir o tamanho da imagem
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Instalar extensões PHP necessárias para o Laravel e MySQL
RUN docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip

# Instalar Composer para gerenciar dependências do PHP
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Criar usuário do sistema para evitar execução como root
RUN useradd -G www-data,root -u $uid -d /home/$user $user
RUN mkdir -p /home/$user/.composer && \
    chown -R $user:$user /home/$user

# Definir diretório de trabalho para a aplicação
WORKDIR /var/www/html

# Copiar configuração personalizada do PHP
COPY php.ini /usr/local/etc/php/conf.d/custom.ini

# Copiar script de inicialização
COPY start.sh /usr/local/bin/start.sh
RUN chmod +x /usr/local/bin/start.sh

# Expor porta para acesso à API
EXPOSE 8000

# Iniciar servidor ao executar o container
CMD ["/usr/local/bin/start.sh"] 