<?php

namespace Database\Factories;

use App\Models\Candidate;
use Illuminate\Database\Eloquent\Factories\Factory;

class CandidateFactory extends Factory
{
    protected $model = Candidate::class;

    public function definition()
    {
        $skills = [
            'PHP',
            'Laravel',
            'React',
            'JavaScript',
            'TypeScript',
            'Node.js',
            'MySQL',
            'PostgreSQL',
            'Git',
            'Docker',
            'AWS',
            'REST APIs',
            'HTML5',
            'CSS3',
            'Sass',
            'Vue.js',
            'Angular',
            'Python',
            'Java',
            'C#',
            '.NET'
        ];

        return [
            'name' => $this->faker->name(),
            'email' => $this->faker->unique()->safeEmail(),
            'phone' => $this->faker->numerify('(##) #####-####'),
            'bio' => $this->faker->paragraphs(2, true),
            'skills' => $this->faker->randomElements($skills, rand(4, 8)),
            'linkedin_url' => 'https://linkedin.com/in/' . $this->faker->userName(),
            'github_url' => 'https://github.com/' . $this->faker->userName(),
            'portfolio_url' => 'https://' . $this->faker->domainName() . '/portfolio',
            'resume_path' => null // Será preenchido no seeder
        ];
    }
} 