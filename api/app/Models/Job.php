<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Job extends Model
{
    use HasFactory;

    protected $table = 'job_positions';
    
    protected $fillable = [
        'title',
        'description',
        'company',
        'location',
        'contract_type',
        'is_active'
    ];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function candidates(): BelongsToMany
    {
        return $this->belongsToMany(Candidate::class, 'candidate_job', 'job_position_id', 'candidate_id');
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
} 