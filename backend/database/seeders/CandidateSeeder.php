<?php

namespace Database\Seeders;

use App\Models\Candidate;
use App\Models\Job;
use Illuminate\Database\Seeder;

class CandidateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Cria alguns candidatos de exemplo
        $candidates = [
            [
                'name' => 'João Silva',
                'email' => 'joao@example.com',
                'phone' => '(11) 98765-4321',
                'resume' => 'Desenvolvedor com 5 anos de experiência em PHP e Laravel.',
            ],
            [
                'name' => 'Maria Oliveira',
                'email' => 'maria@example.com',
                'phone' => '(11) 91234-5678',
                'resume' => 'Desenvolvedora frontend com experiência em React e Angular.',
            ],
            [
                'name' => 'Pedro Santos',
                'email' => 'pedro@example.com',
                'phone' => '(21) 99876-5432',
                'resume' => 'Designer UI/UX com experiência em Figma e Adobe XD.',
            ],
            [
                'name' => 'Ana Costa',
                'email' => 'ana@example.com',
                'phone' => '(21) 98765-1234',
                'resume' => 'Analista de testes com experiência em testes automatizados.',
            ],
            [
                'name' => 'Lucas Ferreira',
                'email' => 'lucas@example.com',
                'phone' => '(31) 99876-1234',
                'resume' => 'DevOps Engineer com experiência em AWS e Docker.',
            ],
        ];

        // Cria os candidatos e os inscreve em algumas vagas
        foreach ($candidates as $index => $candidateData) {
            $candidate = Candidate::create($candidateData);
            
            // Inscreve cada candidato em 1-3 vagas aleatórias
            $jobs = Job::inRandomOrder()->take(rand(1, 3))->get();
            foreach ($jobs as $job) {
                $candidate->jobs()->attach($job->id);
            }
        }
    }
} 