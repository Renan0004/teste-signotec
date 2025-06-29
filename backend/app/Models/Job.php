<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modelo para representar vagas de emprego no sistema.
 * 
 * Este modelo está associado à tabela 'job_listings' e gerencia todas
 * as operações relacionadas às vagas disponíveis na plataforma.
 */
class Job extends Model
{
    use HasFactory;

    /**
     * Nome da tabela associada ao modelo.
     * Especificado explicitamente porque renomeamos de 'jobs' para 'job_listings'
     * para evitar conflito com a tabela de sistema do Laravel.
     *
     * @var string
     */
    protected $table = 'job_listings';

    /**
     * Os atributos que podem ser atribuídos em massa.
     * Define quais campos podem ser preenchidos através de atribuição em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'title',        // Título da vaga
        'description',  // Descrição detalhada da vaga
        'requirements', // Requisitos necessários para a vaga
        'type',         // Tipo de contratação (CLT, PJ, FREELANCER)
        'active',       // Status da vaga (ativa/inativa)
    ];

    /**
     * Os atributos que devem ser convertidos para tipos específicos.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'active' => 'boolean', // Converte o campo 'active' para booleano
    ];

    /**
     * Obtém os candidatos inscritos nesta vaga.
     * 
     * Relacionamento muitos-para-muitos com o modelo Candidate.
     * Uma vaga pode ter múltiplos candidatos inscritos.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function candidates()
    {
        return $this->belongsToMany(Candidate::class, 'candidate_job')
                    ->withTimestamps();
    }
} 