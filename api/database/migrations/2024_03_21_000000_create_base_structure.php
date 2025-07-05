<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Tabela de vagas
        Schema::create('jobs', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('description');
            $table->string('company');
            $table->string('location');
            $table->enum('status', ['aberta', 'fechada', 'em_andamento'])->default('aberta');
            $table->enum('type', ['full_time', 'part_time', 'contract', 'temporary', 'internship'])->default('full_time');
            $table->enum('experience_level', ['internship', 'junior', 'mid_level', 'senior', 'expert', 'manager'])->default('junior');
            $table->json('requirements');
            $table->json('benefits');
            $table->string('salary')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Tabela de candidatos
        Schema::create('candidates', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('email')->unique();
            $table->string('phone')->nullable();
            $table->text('bio')->nullable();
            $table->string('resume_path')->nullable();
            $table->json('skills')->nullable();
            $table->string('linkedin_url')->nullable();
            $table->string('github_url')->nullable();
            $table->string('portfolio_url')->nullable();
            $table->timestamps();
            $table->softDeletes();
        });

        // Tabela pivot para candidaturas
        Schema::create('candidate_job', function (Blueprint $table) {
            $table->id();
            $table->foreignId('candidate_id')->constrained()->onDelete('cascade');
            $table->foreignId('job_id')->constrained()->onDelete('cascade');
            $table->enum('status', ['pending', 'reviewing', 'approved', 'rejected'])->default('pending');
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->unique(['candidate_id', 'job_id']);
        });

        // Tabela para tokens de API (Sanctum)
        Schema::create('personal_access_tokens', function (Blueprint $table) {
            $table->id();
            $table->morphs('tokenable');
            $table->string('name');
            $table->string('token', 64)->unique();
            $table->text('abilities')->nullable();
            $table->timestamp('last_used_at')->nullable();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('candidate_job');
        Schema::dropIfExists('candidates');
        Schema::dropIfExists('jobs');
        Schema::dropIfExists('personal_access_tokens');
    }
}; 