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
        'portfolio_url'
    ];

    protected $casts = [
        'skills' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    protected $appends = ['resume_url'];

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
} 