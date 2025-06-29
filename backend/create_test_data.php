<?php
// Este script cria dados de teste para vagas e candidatos no banco de dados

// Carrega o ambiente Laravel
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\Job;
use App\Models\Candidate;

try {
    echo "Criando dados de teste para o sistema de gerenciamento de vagas\n";
    echo "===========================================================\n\n";
    
    // Criar vagas de teste
    echo "Criando vagas de teste...\n";
    
    $jobs = [
        [
            'title' => 'Desenvolvedor PHP Sênior',
            'description' => 'Estamos procurando um desenvolvedor PHP sênior para trabalhar em projetos desafiadores usando Laravel e Vue.js.',
            'requirements' => 'Experiência com PHP, Laravel, Vue.js, MySQL e Docker. Mínimo de 5 anos de experiência.',
            'type' => 'CLT',
            'active' => true
        ],
        [
            'title' => 'Desenvolvedor Frontend React',
            'description' => 'Vaga para desenvolvedor frontend com foco em React para trabalhar em aplicações web modernas.',
            'requirements' => 'Conhecimento avançado em React, JavaScript, HTML5, CSS3 e ferramentas de build como Webpack.',
            'type' => 'PJ',
            'active' => true
        ],
        [
            'title' => 'Analista de Banco de Dados',
            'description' => 'Analista de banco de dados para otimização e manutenção de bancos MySQL e PostgreSQL.',
            'requirements' => 'Experiência com MySQL, PostgreSQL, otimização de consultas e modelagem de dados.',
            'type' => 'CLT',
            'active' => true
        ],
        [
            'title' => 'UX/UI Designer',
            'description' => 'Designer para criar interfaces intuitivas e atraentes para nossos produtos digitais.',
            'requirements' => 'Experiência com Figma, Adobe XD, e conhecimento de princípios de usabilidade e acessibilidade.',
            'type' => 'FREELANCER',
            'active' => true
        ],
        [
            'title' => 'DevOps Engineer',
            'description' => 'Engenheiro DevOps para automatizar processos de implantação e manutenção de infraestrutura.',
            'requirements' => 'Conhecimento em AWS, Docker, Kubernetes, CI/CD e ferramentas de automação.',
            'type' => 'PJ',
            'active' => false
        ]
    ];
    
    $createdJobs = [];
    foreach ($jobs as $jobData) {
        $job = Job::firstOrCreate(
            ['title' => $jobData['title']],
            $jobData
        );
        $createdJobs[] = $job;
        echo "- Vaga criada: {$job->title} (ID: {$job->id})\n";
    }
    
    // Criar candidatos de teste
    echo "\nCriando candidatos de teste...\n";
    
    $candidates = [
        [
            'name' => 'João Silva',
            'email' => 'joao.silva@example.com',
            'phone' => '(11) 98765-4321',
            'resume' => 'Desenvolvedor PHP com 7 anos de experiência em Laravel e Vue.js.'
        ],
        [
            'name' => 'Maria Oliveira',
            'email' => 'maria.oliveira@example.com',
            'phone' => '(21) 99876-5432',
            'resume' => 'Desenvolvedora frontend especialista em React e TypeScript.'
        ],
        [
            'name' => 'Pedro Santos',
            'email' => 'pedro.santos@example.com',
            'phone' => '(31) 97654-3210',
            'resume' => 'Analista de banco de dados com experiência em MySQL e PostgreSQL.'
        ],
        [
            'name' => 'Ana Souza',
            'email' => 'ana.souza@example.com',
            'phone' => '(41) 96543-2109',
            'resume' => 'UX/UI Designer com portfólio diversificado e conhecimento em Figma e Adobe XD.'
        ],
        [
            'name' => 'Lucas Pereira',
            'email' => 'lucas.pereira@example.com',
            'phone' => '(51) 95432-1098',
            'resume' => 'Engenheiro DevOps com experiência em AWS, Docker e Kubernetes.'
        ]
    ];
    
    $createdCandidates = [];
    foreach ($candidates as $candidateData) {
        $candidate = Candidate::firstOrCreate(
            ['email' => $candidateData['email']],
            $candidateData
        );
        $createdCandidates[] = $candidate;
        echo "- Candidato criado: {$candidate->name} (ID: {$candidate->id})\n";
    }
    
    // Associar candidatos a vagas
    echo "\nAssociando candidatos a vagas...\n";
    
    // João se candidata a Desenvolvedor PHP Sênior e DevOps Engineer
    $createdCandidates[0]->jobs()->sync([$createdJobs[0]->id, $createdJobs[4]->id]);
    echo "- {$createdCandidates[0]->name} se candidatou para: {$createdJobs[0]->title}, {$createdJobs[4]->title}\n";
    
    // Maria se candidata a Desenvolvedor Frontend React
    $createdCandidates[1]->jobs()->sync([$createdJobs[1]->id]);
    echo "- {$createdCandidates[1]->name} se candidatou para: {$createdJobs[1]->title}\n";
    
    // Pedro se candidata a Analista de Banco de Dados
    $createdCandidates[2]->jobs()->sync([$createdJobs[2]->id]);
    echo "- {$createdCandidates[2]->name} se candidatou para: {$createdJobs[2]->title}\n";
    
    // Ana se candidata a UX/UI Designer e Desenvolvedor Frontend React
    $createdCandidates[3]->jobs()->sync([$createdJobs[3]->id, $createdJobs[1]->id]);
    echo "- {$createdCandidates[3]->name} se candidatou para: {$createdJobs[3]->title}, {$createdJobs[1]->title}\n";
    
    // Lucas se candidata a DevOps Engineer e Desenvolvedor PHP Sênior
    $createdCandidates[4]->jobs()->sync([$createdJobs[4]->id, $createdJobs[0]->id]);
    echo "- {$createdCandidates[4]->name} se candidatou para: {$createdJobs[4]->title}, {$createdJobs[0]->title}\n";
    
    // Resumo
    echo "\nResumo dos dados criados:\n";
    echo "- " . count($createdJobs) . " vagas\n";
    echo "- " . count($createdCandidates) . " candidatos\n";
    
    // Mostrar candidatos por vaga
    echo "\nCandidatos por vaga:\n";
    foreach ($createdJobs as $job) {
        echo "- {$job->title}: " . $job->candidates->count() . " candidato(s)\n";
        foreach ($job->candidates as $candidate) {
            echo "  * {$candidate->name} ({$candidate->email})\n";
        }
    }
    
    echo "\nDados de teste criados com sucesso!\n";
    
} catch (Exception $e) {
    echo "Erro ao criar dados de teste: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
?> 