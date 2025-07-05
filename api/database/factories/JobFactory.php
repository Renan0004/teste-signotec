<?php

namespace Database\Factories;

use App\Models\Job;
use Illuminate\Database\Eloquent\Factories\Factory;

class JobFactory extends Factory
{
    protected $model = Job::class;

    public function definition()
    {
        $types = ['full_time', 'part_time', 'contract', 'temporary', 'internship'];
        $experienceLevels = ['internship', 'junior', 'mid_level', 'senior', 'expert', 'manager'];
        $status = ['aberta', 'fechada', 'em_andamento'];
        
        $companies = [
            'TechCorp Solutions',
            'Digital Innovations Ltd',
            'Software Systems Inc',
            'Data Analytics Pro',
            'Cloud Services Group',
            'Web Solutions Brasil',
            'Mobile Tech SA',
            'AI Research Labs'
        ];

        $locations = [
            'São Paulo, SP',
            'Rio de Janeiro, RJ',
            'Curitiba, PR',
            'Belo Horizonte, MG',
            'Porto Alegre, RS',
            'Florianópolis, SC',
            'Remoto',
            'Híbrido - São Paulo'
        ];

        $titles = [
            'Desenvolvedor Full Stack PHP/Laravel',
            'Desenvolvedor Frontend React',
            'Engenheiro de Software Senior',
            'Desenvolvedor Backend Node.js',
            'Arquiteto de Software',
            'DevOps Engineer',
            'Analista de Dados',
            'UX/UI Designer',
            'Product Owner',
            'Scrum Master'
        ];

        $salaryRanges = [
            'R$ 3.000 - R$ 4.500',
            'R$ 4.500 - R$ 6.000',
            'R$ 6.000 - R$ 8.000',
            'R$ 8.000 - R$ 12.000',
            'R$ 12.000 - R$ 15.000',
            'R$ 15.000 - R$ 18.000',
            'A combinar'
        ];

        $requirements = [
            'Conhecimento em PHP e Laravel',
            'Experiência com React e TypeScript',
            'Git e metodologias ágeis',
            'Banco de dados MySQL/PostgreSQL',
            'APIs RESTful',
            'Docker e DevOps',
            'Clean Code e SOLID'
        ];

        $benefits = [
            'Vale Refeição',
            'Vale Transporte',
            'Plano de Saúde',
            'Plano Odontológico',
            'Gympass',
            'Day Off no aniversário',
            'Home Office',
            'Horário Flexível'
        ];

        return [
            'title' => $this->faker->randomElement($titles),
            'description' => $this->faker->paragraphs(3, true),
            'company' => $this->faker->randomElement($companies),
            'location' => $this->faker->randomElement($locations),
            'type' => $this->faker->randomElement($types),
            'experience_level' => $this->faker->randomElement($experienceLevels),
            'status' => $this->faker->randomElement($status),
            'requirements' => $this->faker->randomElements($requirements, rand(3, 5)),
            'benefits' => $this->faker->randomElements($benefits, rand(4, 6)),
            'salary' => $this->faker->randomElement($salaryRanges)
        ];
    }

    public function active()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'active',
            ];
        });
    }

    public function inactive()
    {
        return $this->state(function (array $attributes) {
            return [
                'status' => 'inactive',
            ];
        });
    }
} 