<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Job;
use App\Models\Candidate;
use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Criar usuário admin
        User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password123'),
        ]);

        // Criar vagas
        $jobs = [
            [
                'title' => 'Desenvolvedor Full Stack',
                'description' => 'Desenvolvedor com experiência em React e Laravel',
                'company' => 'TechCorp',
                'location' => 'São Paulo, SP',
                'contract_type' => 'CLT',
                'is_active' => true,
            ],
            [
                'title' => 'Desenvolvedor Frontend',
                'description' => 'Desenvolvedor React com experiência em Material-UI',
                'company' => 'WebSolutions',
                'location' => 'Rio de Janeiro, RJ',
                'contract_type' => 'PJ',
                'is_active' => true,
            ],
            [
                'title' => 'Desenvolvedor Backend',
                'description' => 'Desenvolvedor PHP/Laravel Senior',
                'company' => 'SoftwareHouse',
                'location' => 'Curitiba, PR',
                'contract_type' => 'CLT',
                'is_active' => true,
            ],
        ];

        foreach ($jobs as $job) {
            Job::create($job);
        }

        // Criar candidatos
        $candidates = [
            [
                'name' => 'João Silva',
                'email' => 'joao@example.com',
                'phone' => '(11) 98765-4321',
                'resume' => 'Desenvolvedor Full Stack com 5 anos de experiência',
            ],
            [
                'name' => 'Maria Santos',
                'email' => 'maria@example.com',
                'phone' => '(21) 98765-4321',
                'resume' => 'Desenvolvedora Frontend especialista em React',
            ],
            [
                'name' => 'Pedro Oliveira',
                'email' => 'pedro@example.com',
                'phone' => '(41) 98765-4321',
                'resume' => 'Desenvolvedor Backend com foco em Laravel',
            ],
        ];

        foreach ($candidates as $candidate) {
            $newCandidate = Candidate::create($candidate);
            // Associar candidatos a vagas aleatoriamente
            $jobIds = Job::inRandomOrder()->limit(rand(1, 2))->pluck('id');
            $newCandidate->jobs()->attach($jobIds);
        }
    }
}
