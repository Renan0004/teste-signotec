<?php

/**
 * Script para limpar o banco de dados e manter apenas as tabelas necessárias para o teste da SignoTech.
 * 
 * Este script deve ser executado após as migrações iniciais para remover tabelas desnecessárias.
 * 
 * Uso: php artisan tinker --execute="require('database/clean_database.php');"
 */

use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

// Lista de tabelas que queremos manter
$keepTables = [
    'users',                  // Para autenticação (bônus)
    'personal_access_tokens', // Para autenticação via API (bônus)
    'job_listings',           // Para o CRUD de vagas
    'candidates',             // Para o CRUD de candidatos
    'candidate_job',          // Para relacionamento entre candidatos e vagas
    'migrations',             // Tabela de controle de migrações do Laravel
];

// Desativar verificação de chaves estrangeiras temporariamente
DB::statement('SET FOREIGN_KEY_CHECKS=0');

// Obter todas as tabelas do banco de dados
$tables = DB::select('SHOW TABLES');
$dbName = DB::connection()->getDatabaseName();
$tableColumn = "Tables_in_$dbName";

// Contar tabelas antes da limpeza
$totalTables = count($tables);
$tablesToDrop = [];

// Identificar tabelas para remover
foreach ($tables as $table) {
    $tableName = $table->$tableColumn;
    if (!in_array($tableName, $keepTables)) {
        $tablesToDrop[] = $tableName;
    }
}

// Remover tabelas desnecessárias
foreach ($tablesToDrop as $tableName) {
    Schema::dropIfExists($tableName);
    echo "Tabela '$tableName' removida com sucesso.\n";
}

// Reativar verificação de chaves estrangeiras
DB::statement('SET FOREIGN_KEY_CHECKS=1');

// Resumo da operação
$remainingTables = count($keepTables);
$tablesDropped = count($tablesToDrop);

echo "\n=== Resumo da limpeza do banco de dados ===\n";
echo "Total de tabelas antes: $totalTables\n";
echo "Tabelas removidas: $tablesDropped\n";
echo "Tabelas mantidas: $remainingTables\n";
echo "Tabelas mantidas: " . implode(', ', $keepTables) . "\n";
echo "=======================================\n";

// Verificar se as tabelas mantidas existem
echo "\nVerificando tabelas mantidas:\n";
foreach ($keepTables as $tableName) {
    if (Schema::hasTable($tableName)) {
        echo "✓ Tabela '$tableName' existe.\n";
    } else {
        echo "✗ Tabela '$tableName' não existe!\n";
    }
}

echo "\nLimpeza do banco de dados concluída.\n"; 