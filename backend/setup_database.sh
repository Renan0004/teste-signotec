#!/bin/bash

# Script para configurar o banco de dados do teste SignoTech
# Este script executa as migrações, seeders e limpa o banco de dados
# para manter apenas as tabelas necessárias para o teste.

echo "===== Configurando o banco de dados para o teste SignoTech ====="

# Executar migrações
echo "Executando migrações..."
php artisan migrate --force

# Executar seeders
echo "Executando seeders..."
php artisan db:seed --force

# Limpar o banco de dados
echo "Limpando o banco de dados..."
php artisan db:clean

echo "===== Configuração do banco de dados concluída! ====="
echo "O banco de dados agora contém apenas as tabelas necessárias para o teste:"
echo "- users (autenticação)"
echo "- personal_access_tokens (API)"
echo "- job_listings (vagas)"
echo "- candidates (candidatos)"
echo "- candidate_job (relacionamento)"
echo "- migrations (controle de migrações)"

echo "===== Pronto para uso! =====" 