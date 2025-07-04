<?php

namespace Database\Factories;

use App\Models\Candidate;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class CandidateFactory extends Factory
{
    protected $model = Candidate::class;

    public function definition()
    {
        $skills = [
            'PHP', 'Laravel', 'JavaScript', 'React', 'Vue.js', 'Angular',
            'Python', 'Django', 'Java', 'Spring Boot', 'C#', '.NET',
            'Node.js', 'Express', 'MySQL', 'PostgreSQL', 'MongoDB',
            'Docker', 'AWS', 'Git', 'Scrum', 'DevOps'
        ];

        return [
            'user_id' => User::factory(),
            'phone' => fake()->phoneNumber(),
            'bio' => fake()->paragraphs(2, true),
            'resume_path' => null,
            'skills' => fake()->randomElements($skills, fake()->numberBetween(3, 8)),
            'linkedin_url' => 'https://linkedin.com/in/' . fake()->userName(),
            'github_url' => 'https://github.com/' . fake()->userName(),
            'portfolio_url' => 'https://' . fake()->domainName() . '/portfolio'
        ];
    }
} 