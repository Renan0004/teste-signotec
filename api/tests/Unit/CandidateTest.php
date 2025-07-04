<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Job;
use App\Models\Candidate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

// Testes unitários para o modelo Candidate
class CandidateTest extends TestCase
{
    use RefreshDatabase;

    // Teste para criar um candidato
    public function test_can_create_candidate()
    {
        $candidate = Candidate::factory()->create();
        $this->assertInstanceOf(Candidate::class, $candidate);
        $this->assertDatabaseHas('candidates', ['id' => $candidate->id]);
    }

    // Teste para atualizar um candidato
    public function test_can_update_candidate()
    {
        $candidate = Candidate::factory()->create();
        $candidate->update(['name' => 'Updated Name']);
        $this->assertEquals('Updated Name', $candidate->fresh()->name);
    }

    // Teste para deletar um candidato
    public function test_can_delete_candidate()
    {
        $candidate = Candidate::factory()->create();
        $candidate->delete();
        $this->assertDatabaseMissing('candidates', ['id' => $candidate->id]);
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

    // Teste para aplicar para múltiplas vagas
    public function test_can_apply_to_jobs()
    {
        $candidate = Candidate::factory()->create();
        $jobs = Job::factory(3)->create();
        
        $candidate->jobs()->attach($jobs->pluck('id'));
        
        $this->assertEquals(3, $candidate->jobs()->count());
        foreach ($jobs as $job) {
            $this->assertTrue($candidate->jobs->contains($job));
        }
    }

    // Teste para retirar uma candidatura
    public function test_can_withdraw_from_jobs()
    {
        $candidate = Candidate::factory()->create();
        $jobs = Job::factory(3)->create();
        
        $candidate->jobs()->attach($jobs->pluck('id'));
        $candidate->jobs()->detach($jobs->pluck('id'));
        
        $this->assertEquals(0, $candidate->jobs()->count());
    }

    // Teste para sincronizar candidaturas
    public function test_can_sync_jobs()
    {
        $candidate = Candidate::factory()->create();
        $jobs = Job::factory(3)->create();
        
        // Aplica para todas as vagas
        $candidate->jobs()->attach($jobs->pluck('id'));
        
        // Sincroniza apenas com a primeira vaga
        $candidate->jobs()->sync([$jobs->first()->id]);
        
        $this->assertEquals(1, $candidate->jobs()->count());
        $this->assertTrue($candidate->jobs->contains($jobs->first()));
    }

    // Teste para fazer upload de currículo
    public function test_can_upload_resume()
    {
        Storage::fake('public');

        $candidate = Candidate::factory()->create();
        $file = UploadedFile::fake()->create('resume.pdf', 100);
        
        $path = $file->store('resumes', 'public');
        $candidate->update(['resume_path' => $path]);
        
        Storage::disk('public')->assertExists($path);
        $this->assertEquals($path, $candidate->resume_path);
    }

    // Teste para deletar currículo
    public function test_can_delete_resume()
    {
        Storage::fake('public');

        $candidate = Candidate::factory()->create();
        $file = UploadedFile::fake()->create('resume.pdf', 100);
        
        $path = $file->store('resumes', 'public');
        $candidate->update(['resume_path' => $path]);
        
        if ($candidate->resume_path) {
            Storage::disk('public')->delete($candidate->resume_path);
            $candidate->update(['resume_path' => null]);
        }
        
        Storage::disk('public')->assertMissing($path);
        $this->assertNull($candidate->fresh()->resume_path);
    }

    // Teste para verificar email único
    public function test_has_unique_email()
    {
        $candidate1 = Candidate::factory()->create();
        
        $this->expectException(\Illuminate\Database\QueryException::class);
        
        Candidate::factory()->create([
            'email' => $candidate1->email
        ]);
    }
} 