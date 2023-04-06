# Imagem base
FROM php:8.0-fpm

# Define o diretório da aplicação
WORKDIR /var/www/html

# Instala as dependências necessárias
RUN apt-get update && \
    apt-get install -y \
        libpq-dev \
        libzip-dev \
        zip && \
    docker-php-ext-install pdo pdo_pgsql zip

# Copia todos os arquivos para o container
COPY . .

# Define as variáveis de ambiente necessárias para a aplicação
ENV APP_ENV=local \
    APP_DEBUG=true \
    APP_KEY=your_app_key_here \
    DB_HOST=db \
    DB_PORT=5432 \
    DB_DATABASE=your_database_name_here \
    DB_USERNAME=your_database_username_here \
    DB_PASSWORD=your_database_password_here

# Inicia o serviço PHP-FPM
CMD ["php-fpm"]
