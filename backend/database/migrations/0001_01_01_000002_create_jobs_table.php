<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     * 
     * Esta migração foi modificada para não criar tabelas desnecessárias.
     * As tabelas jobs, job_batches e failed_jobs são tabelas de sistema do Laravel
     * para filas e não são necessárias para o teste da SignoTech.
     * 
     * Esta migração agora está vazia, mas foi mantida para preservar a consistência
     * do histórico de migrações.
     */
    public function up(): void
    {
        // As tabelas jobs, job_batches e failed_jobs foram removidas
        // por não serem necessárias para o teste da SignoTech
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Nada a reverter
    }
};
