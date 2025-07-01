<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Job;
use App\Models\Candidate;
use Illuminate\Foundation\Testing\RefreshDatabase;

// Testes unitários para o modelo Candidate
class CandidateTest extends TestCase
{
    use RefreshDatabase;

    // Teste para criar um candidato
    public function test_can_create_candidate()
    {
        $candidateData = [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '11999999999',
            'resume' => 'Experienced developer'
        ];

        $candidate = Candidate::create($candidateData);

        $this->assertInstanceOf(Candidate::class, $candidate);
        $this->assertEquals($candidateData['name'], $candidate->name);
        $this->assertEquals($candidateData['email'], $candidate->email);
    }

    // Teste para aplicar para uma vaga
    public function test_can_apply_for_job()
    {
        $candidate = Candidate::factory()->create();
        $job = Job::factory()->create();

        $candidate->jobs()->attach($job->id);

        $this->assertTrue($candidate->jobs->contains($job));
        $this->assertEquals(1, $candidate->jobs->count());
    }

    // Teste para aplicar para múltiplas vagas
    public function test_can_apply_for_multiple_jobs()
    {
        $candidate = Candidate::factory()->create();
        $jobs = Job::factory()->count(3)->create();

        $candidate->jobs()->attach($jobs->pluck('id'));

        $this->assertEquals(3, $candidate->jobs->count());
    }

    // Teste para remover uma candidatura
    public function test_can_remove_job_application()
    {
        $candidate = Candidate::factory()->create();
        $job = Job::factory()->create();

        $candidate->jobs()->attach($job->id);
        $this->assertEquals(1, $candidate->jobs->count());

        $candidate->jobs()->detach($job->id);
        $this->assertEquals(0, $candidate->fresh()->jobs->count());
    }
} 