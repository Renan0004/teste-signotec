<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Job;
use App\Models\Candidate;
use Illuminate\Foundation\Testing\RefreshDatabase;

class JobTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_job()
    {
        $job = Job::factory()->create();
        $this->assertInstanceOf(Job::class, $job);
        $this->assertDatabaseHas('job_positions', ['id' => $job->id]);
    }

    public function test_can_update_job()
    {
        $job = Job::factory()->create();
        $job->update(['title' => 'Updated Title']);
        $this->assertEquals('Updated Title', $job->fresh()->title);
    }

    public function test_can_delete_job()
    {
        $job = Job::factory()->create();
        $job->delete();
        $this->assertDatabaseMissing('job_positions', ['id' => $job->id]);
    }

    public function test_can_attach_candidates()
    {
        $job = Job::factory()->create();
        $candidates = Candidate::factory(3)->create();
        
        $job->candidates()->attach($candidates->pluck('id'));
        
        $this->assertEquals(3, $job->candidates()->count());
        foreach ($candidates as $candidate) {
            $this->assertTrue($job->candidates->contains($candidate));
        }
    }

    public function test_can_detach_candidates()
    {
        $job = Job::factory()->create();
        $candidates = Candidate::factory(3)->create();
        
        $job->candidates()->attach($candidates->pluck('id'));
        $job->candidates()->detach($candidates->pluck('id'));
        
        $this->assertEquals(0, $job->candidates()->count());
    }

    public function test_can_sync_candidates()
    {
        $job = Job::factory()->create();
        $candidates = Candidate::factory(3)->create();
        
        // Anexa todos os candidatos
        $job->candidates()->attach($candidates->pluck('id'));
        
        // Sincroniza apenas com o primeiro candidato
        $job->candidates()->sync([$candidates->first()->id]);
        
        $this->assertEquals(1, $job->candidates()->count());
        $this->assertTrue($job->candidates->contains($candidates->first()));
    }

    public function test_can_toggle_active_status()
    {
        $job = Job::factory()->create(['is_active' => true]);
        
        $job->update(['is_active' => false]);
        $this->assertFalse($job->fresh()->is_active);
        
        $job->update(['is_active' => true]);
        $this->assertTrue($job->fresh()->is_active);
    }

    public function test_has_valid_contract_type()
    {
        $job = Job::factory()->create();
        $this->assertContains($job->contract_type, ['CLT', 'PJ', 'FREELANCER']);
    }
} 