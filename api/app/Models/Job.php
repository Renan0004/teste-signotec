<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;

class Job extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'jobs';
    
    protected $fillable = [
        'title',
        'description',
        'company',
        'location',
        'status',
        'type',
        'requirements',
        'benefits',
        'salary',
        'experience_level'
    ];

    protected $casts = [
        'requirements' => 'array',
        'benefits' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime'
    ];

    protected $attributes = [
        'status' => 'active',
        'type' => 'full_time'
    ];

    public function candidates(): BelongsToMany
    {
        return $this->belongsToMany(Candidate::class, 'candidate_job')
            ->withTimestamps()
            ->withPivot('status', 'notes');
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function scopeSearch($query, $search)
    {
        if ($search) {
            return $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }
        return $query;
    }

    public function scopeByType($query, $type)
    {
        if ($type && $type !== 'all') {
            return $query->where('type', $type);
        }
        return $query;
    }

    public function scopeByStatus($query, $status)
    {
        if ($status && $status !== 'all') {
            return $query->where('status', $status);
        }
        return $query;
    }

    public function scopeByExperienceLevel($query, $level)
    {
        if ($level && $level !== 'all') {
            return $query->where('experience_level', $level);
        }
        return $query;
    }

    protected static function boot()
    {
        parent::boot();

        static::saving(function ($job) {
            // Garante que requirements e benefits são arrays
            if (is_string($job->requirements)) {
                $job->requirements = json_decode($job->requirements, true) ?? [];
            }
            if (is_string($job->benefits)) {
                $job->benefits = json_decode($job->benefits, true) ?? [];
            }

            // Remove espaços em branco extras
            $job->title = trim($job->title);
            $job->company = trim($job->company);
            $job->location = trim($job->location);
            $job->description = trim($job->description);
            if ($job->salary) {
                $job->salary = trim($job->salary);
            }

            // Normaliza arrays
            if (is_array($job->requirements)) {
                $job->requirements = array_values(array_filter(array_map('trim', $job->requirements)));
            }
            if (is_array($job->benefits)) {
                $job->benefits = array_values(array_filter(array_map('trim', $job->benefits)));
            }

            // Valida status
            if (!in_array($job->status, ['active', 'inactive'])) {
                $job->status = 'active';
            }

            // Valida tipo
            if (!in_array($job->type, ['full_time', 'part_time', 'contract', 'temporary', 'internship'])) {
                $job->type = 'full_time';
            }

            // Valida nível de experiência
            if (!in_array($job->experience_level, ['internship', 'junior', 'mid_level', 'senior', 'expert', 'manager'])) {
                $job->experience_level = 'junior';
            }
        });
    }
} 