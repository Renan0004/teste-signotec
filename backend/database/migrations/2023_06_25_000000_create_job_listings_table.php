<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Executa a migração para criar a tabela de vagas.
     * 
     * Esta tabela armazena todas as vagas disponíveis no sistema.
     * Foi renomeada de 'jobs' para 'job_listings' para evitar conflito
     * com a tabela de sistema do Laravel.
     */
    public function up(): void
    {
        Schema::create('job_listings', function (Blueprint $table) {
            $table->id(); // Identificador único da vaga
            $table->string('title'); // Título da vaga
            $table->text('description'); // Descrição detalhada da vaga
            $table->text('requirements')->nullable(); // Requisitos da vaga (opcional)
            $table->enum('type', ['CLT', 'PJ', 'FREELANCER'])->default('CLT'); // Tipo de contratação
            $table->boolean('active')->default(true); // Status da vaga (ativa/inativa)
            $table->timestamps(); // Cria colunas created_at e updated_at automaticamente
        });
    }

    /**
     * Reverte a migração, removendo a tabela de vagas.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_listings');
    }
}; 