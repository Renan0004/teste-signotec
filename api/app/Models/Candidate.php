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
        'user_id',
        'phone',
        'bio',
        'resume_path',
        'skills',
        'linkedin_url',
        'github_url',
        'portfolio_url'
    ];

    protected $casts = [
        'skills' => 'array'
    ];

    protected $appends = ['resume_url'];

    public function getResumeUrlAttribute()
    {
        return $this->resume_path
            ? asset('storage/' . $this->resume_path)
            : null;
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function jobs(): BelongsToMany
    {
        return $this->belongsToMany(Job::class, 'candidate_job')
            ->withTimestamps()
            ->withPivot('status', 'notes');
    }
} 