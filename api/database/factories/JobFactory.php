<?php

namespace Database\Factories;

use App\Models\Job;
use Illuminate\Database\Eloquent\Factories\Factory;

class JobFactory extends Factory
{
    protected $model = Job::class;

    public function definition(): array
    {
        $jobTypes = ['full_time', 'part_time', 'contract', 'temporary', 'internship'];
        $experienceLevels = ['internship', 'junior', 'mid_level', 'senior', 'expert', 'manager'];
        $status = ['active', 'inactive'];
        
        $requirements = [
            'JavaScript',
            'React',
            'Node.js',
            'PHP',
            'Laravel',
            'MySQL',
            'Git',
            'Scrum',
            'Inglês',
            'TypeScript',
            'Python',
            'Java',
            'C#',
            '.NET',
            'AWS',
            'Docker',
            'Kubernetes'
        ];

        $benefits = [
            'Vale Refeição',
            'Vale Transporte',
            'Plano de Saúde',
            'Plano Odontológico',
            'Seguro de Vida',
            'Gympass',
            'Day Off no Aniversário',
            'Home Office',
            'Horário Flexível',
            'PLR',
            'Stock Options'
        ];

        $companies = [
            'TechCorp',
            'InnovaSoft',
            'DataTech',
            'WebSolutions',
            'CloudTech',
            'DevHub',
            'CodeMasters',
            'DigitalWave',
            'TechGlobal',
            'ByteWorks'
        ];

        $locations = [
            'São Paulo, SP',
            'Rio de Janeiro, RJ',
            'Belo Horizonte, MG',
            'Curitiba, PR',
            'Porto Alegre, RS',
            'Florianópolis, SC',
            'Recife, PE',
            'Salvador, BA',
            'Brasília, DF',
            'Remoto'
        ];

        $titles = [
            'Desenvolvedor Full Stack',
            'Desenvolvedor Frontend',
            'Desenvolvedor Backend',
            'Engenheiro de Software',
            'Arquiteto de Software',
            'DevOps Engineer',
            'QA Engineer',
            'Tech Lead',
            'Product Owner',
            'Scrum Master'
        ];

        $salaryRanges = [
            'R$ 3.000 - R$ 4.500',
            'R$ 4.500 - R$ 6.000',
            'R$ 6.000 - R$ 8.000',
            'R$ 8.000 - R$ 10.000',
            'R$ 10.000 - R$ 13.000',
            'R$ 13.000 - R$ 16.000',
            'R$ 16.000 - R$ 20.000',
            'Acima de R$ 20.000',
            'A combinar'
        ];

        return [
            'title' => $this->faker->randomElement($titles),
            'description' => $this->faker->paragraphs(3, true),
            'company' => $this->faker->randomElement($companies),
            'location' => $this->faker->randomElement($locations),
            'status' => $this->faker->randomElement($status),
            'type' => $this->faker->randomElement($jobTypes),
            'experience_level' => $this->faker->randomElement($experienceLevels),
            'requirements' => $this->faker->randomElements($requirements, $this->faker->numberBetween(3, 8)),
            'benefits' => $this->faker->randomElements($benefits, $this->faker->numberBetween(3, 8)),
            'salary' => $this->faker->randomElement($salaryRanges),
            'created_at' => $this->faker->dateTimeBetween('-3 months', 'now'),
            'updated_at' => function (array $attributes) {
                return $this->faker->dateTimeBetween($attributes['created_at'], 'now');
            }
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