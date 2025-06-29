<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * Modelo para representar candidatos no sistema.
 * 
 * Este modelo está associado à tabela 'candidates' e gerencia todas
 * as operações relacionadas aos candidatos cadastrados na plataforma.
 */
class Candidate extends Model
{
    use HasFactory;

    /**
     * Os atributos que podem ser atribuídos em massa.
     * Define quais campos podem ser preenchidos através de atribuição em massa.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',   // Nome completo do candidato
        'email',  // Email do candidato (único)
        'phone',  // Telefone de contato
        'resume', // Currículo ou resumo profissional
    ];

    /**
     * Obtém as vagas para as quais o candidato se inscreveu.
     * 
     * Relacionamento muitos-para-muitos com o modelo Job.
     * Um candidato pode se inscrever em múltiplas vagas.
     *
     * @return \Illuminate\Database\Eloquent\Relations\BelongsToMany
     */
    public function jobs()
    {
        return $this->belongsToMany(Job::class, 'candidate_job')
                    ->withTimestamps();
    }
} 