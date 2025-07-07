<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Candidate extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'resume_path',
        'bio',
        'skills',
        'linkedin_url',
        'github_url',
        'portfolio_url',
        'experiences'
    ];

    protected $casts = [
        'skills' => 'array',
        'experiences' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    protected $appends = ['resume_url'];

    /**
     * Regras de validação para o modelo
     */
    public static $rules = [
        'name' => 'required|string|max:255',
        'email' => 'required|email|unique:candidates,email',
        'phone' => 'required|string|max:20',
        'linkedin_url' => 'nullable|string',
        'bio' => 'nullable|string',
        'experiences' => 'nullable'
    ];

    public function getResumeUrlAttribute()
    {
        return $this->resume_path
            ? asset('storage/' . $this->resume_path)
            : null;
    }

    public function jobs(): BelongsToMany
    {
        return $this->belongsToMany(Job::class, 'candidate_job')
            ->withTimestamps()
            ->withPivot('status', 'notes');
    }

    // Garantir que experiences seja sempre um array, mesmo quando vazio
    protected function getExperiencesAttribute($value)
    {
        if (empty($value)) {
            return [];
        }
        
        // Se for uma string JSON, tenta decodificar
        if (is_string($value)) {
            try {
                $decoded = json_decode($value, true);
                return is_array($decoded) ? $decoded : [];
            } catch (\Exception $e) {
                \Log::error('Erro ao decodificar experiences: ' . $e->getMessage());
                return [];
            }
        }
        
        // Se já for um array, retorna como está
        return is_array($value) ? $value : [];
    }

    // Garantir que experiences seja sempre armazenado como JSON
    protected function setExperiencesAttribute($value)
    {
        if (empty($value)) {
            $this->attributes['experiences'] = '[]';
            return;
        }
        
        if (is_array($value)) {
            $this->attributes['experiences'] = json_encode($value);
        } else if (is_string($value)) {
            // Verifica se já é um JSON válido
            json_decode($value);
            if (json_last_error() === JSON_ERROR_NONE) {
                $this->attributes['experiences'] = $value;
            } else {
                // Tenta converter para array e depois para JSON
                try {
                    // Tenta decodificar como string escapada
                    $decoded = json_decode(stripslashes($value), true);
                    if (json_last_error() === JSON_ERROR_NONE && is_array($decoded)) {
                        $this->attributes['experiences'] = json_encode($decoded);
                    } else {
                        $this->attributes['experiences'] = '[]';
                    }
                } catch (\Exception $e) {
                    $this->attributes['experiences'] = '[]';
                    \Log::error('Erro ao processar experiences: ' . $e->getMessage());
                }
            }
        } else {
            $this->attributes['experiences'] = '[]';
        }
    }
} 