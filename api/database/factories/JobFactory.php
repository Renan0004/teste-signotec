<?php

namespace Database\Factories;

use App\Models\Job;
use Illuminate\Database\Eloquent\Factories\Factory;

class JobFactory extends Factory
{
    protected $model = Job::class;

    public function definition()
    {
        return [
            'title' => $this->faker->jobTitle,
            'description' => $this->faker->paragraphs(3, true),
            'company' => $this->faker->company,
            'location' => $this->faker->city,
            'contract_type' => $this->faker->randomElement(['CLT', 'PJ', 'FREELANCER']),
            'is_active' => $this->faker->boolean(80), // 80% chance de estar ativa
        ];
    }
} 