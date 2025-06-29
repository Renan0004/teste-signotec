<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Executa a migração para criar a tabela de relacionamento entre candidatos e vagas.
     * 
     * Esta tabela implementa o relacionamento muitos-para-muitos entre candidatos e vagas,
     * permitindo que um candidato se inscreva em múltiplas vagas e que uma vaga tenha
     * múltiplos candidatos.
     */
    public function up(): void
    {
        Schema::create('candidate_job', function (Blueprint $table) {
            $table->id(); // Identificador único do relacionamento
            
            // Chave estrangeira para a tabela de candidatos com exclusão em cascata
            $table->foreignId('candidate_id')->constrained()->onDelete('cascade');
            
            // Chave estrangeira para a tabela de vagas com exclusão em cascata
            // Nota: referencia 'job_listings' em vez de 'jobs' devido à renomeação da tabela
            $table->foreignId('job_id')->constrained('job_listings')->onDelete('cascade');
            
            $table->timestamps(); // Cria colunas created_at e updated_at automaticamente
            
            // Impede que um candidato se inscreva na mesma vaga mais de uma vez
            // criando um índice único composto
            $table->unique(['candidate_id', 'job_id']);
        });
    }

    /**
     * Reverte a migração, removendo a tabela de relacionamento.
     */
    public function down(): void
    {
        Schema::dropIfExists('candidate_job');
    }
}; 