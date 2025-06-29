<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Executa a migração para criar a tabela de candidatos.
     * 
     * Esta tabela armazena todos os candidatos cadastrados no sistema.
     * Cada candidato pode se candidatar a múltiplas vagas.
     */
    public function up(): void
    {
        Schema::create('candidates', function (Blueprint $table) {
            $table->id(); // Identificador único do candidato
            $table->string('name'); // Nome completo do candidato
            $table->string('email')->unique(); // Email do candidato (único)
            $table->string('phone')->nullable(); // Telefone do candidato (opcional)
            $table->text('resume')->nullable(); // Currículo ou resumo profissional (opcional)
            $table->timestamps(); // Cria colunas created_at e updated_at automaticamente
        });
    }

    /**
     * Reverte a migração, removendo a tabela de candidatos.
     */
    public function down(): void
    {
        Schema::dropIfExists('candidates');
    }
}; 