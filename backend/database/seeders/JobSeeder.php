<?php

namespace Database\Seeders;

use App\Models\Job;
use Illuminate\Database\Seeder;

class JobSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Cria algumas vagas de exemplo
        $jobs = [
            [
                'title' => 'Desenvolvedor PHP/Laravel',
                'description' => 'Estamos procurando um desenvolvedor PHP com experiência em Laravel para trabalhar em projetos web.',
                'requirements' => 'Experiência com PHP, Laravel, MySQL e Git.',
                'type' => 'CLT',
                'active' => true,
            ],
            [
                'title' => 'Desenvolvedor Frontend React',
                'description' => 'Desenvolvedor frontend para trabalhar com React em projetos web modernos.',
                'requirements' => 'Experiência com React, JavaScript, HTML, CSS e consumo de APIs.',
                'type' => 'PJ',
                'active' => true,
            ],
            [
                'title' => 'Designer UI/UX',
                'description' => 'Designer para criar interfaces modernas e experiências de usuário intuitivas.',
                'requirements' => 'Experiência com Figma, Adobe XD e conhecimentos de Design System.',
                'type' => 'FREELANCER',
                'active' => true,
            ],
            [
                'title' => 'Analista de Testes',
                'description' => 'Analista para realizar testes manuais e automatizados em aplicações web.',
                'requirements' => 'Experiência com testes de software, Selenium e metodologias ágeis.',
                'type' => 'CLT',
                'active' => false,
            ],
            [
                'title' => 'DevOps Engineer',
                'description' => 'Engenheiro DevOps para configurar e manter infraestrutura em nuvem.',
                'requirements' => 'Experiência com AWS, Docker, CI/CD e monitoramento.',
                'type' => 'PJ',
                'active' => true,
            ],
        ];

        foreach ($jobs as $job) {
            Job::create($job);
        }
    }
} 