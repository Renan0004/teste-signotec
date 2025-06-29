<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

class CleanDatabase extends Command
{
    /**
     * O nome e a assinatura do comando do console.
     *
     * @var string
     */
    protected $signature = 'db:clean';

    /**
     * A descrição do comando do console.
     *
     * @var string
     */
    protected $description = 'Limpa o banco de dados e mantém apenas as tabelas necessárias para o teste da SignoTech';

    /**
     * Execute o comando do console.
     */
    public function handle()
    {
        // Lista de tabelas que queremos manter
        $keepTables = [
            'users',                  // Para autenticação (bônus)
            'personal_access_tokens', // Para autenticação via API (bônus)
            'job_listings',           // Para o CRUD de vagas
            'candidates',             // Para o CRUD de candidatos
            'candidate_job',          // Para relacionamento entre candidatos e vagas
            'migrations',             // Tabela de controle de migrações do Laravel
        ];

        $this->info('Iniciando limpeza do banco de dados...');

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
            $this->info("Tabela '$tableName' removida com sucesso.");
        }

        // Reativar verificação de chaves estrangeiras
        DB::statement('SET FOREIGN_KEY_CHECKS=1');

        // Resumo da operação
        $remainingTables = count($keepTables);
        $tablesDropped = count($tablesToDrop);

        $this->newLine();
        $this->info('=== Resumo da limpeza do banco de dados ===');
        $this->info("Total de tabelas antes: $totalTables");
        $this->info("Tabelas removidas: $tablesDropped");
        $this->info("Tabelas mantidas: $remainingTables");
        $this->info("Tabelas mantidas: " . implode(', ', $keepTables));
        $this->info('=======================================');

        // Verificar se as tabelas mantidas existem
        $this->newLine();
        $this->info('Verificando tabelas mantidas:');
        foreach ($keepTables as $tableName) {
            if (Schema::hasTable($tableName)) {
                $this->info("✓ Tabela '$tableName' existe.");
            } else {
                $this->error("✗ Tabela '$tableName' não existe!");
            }
        }

        $this->newLine();
        $this->info('Limpeza do banco de dados concluída.');
    }
} 