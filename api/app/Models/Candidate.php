<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Candidate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'resume'
    ];

    public function jobs(): BelongsToMany
    {
        return $this->belongsToMany(Job::class, 'candidate_job', 'candidate_id', 'job_position_id');
    }
} 