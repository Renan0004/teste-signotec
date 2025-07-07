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
        $this->assertDatabaseHas('jobs', ['id' => $job->id]);
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
        $this->assertDatabaseMissing('jobs', ['id' => $job->id]);
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

    public function test_can_toggle_status()
    {
        $job = Job::factory()->create(['status' => 'aberta']);
        
        $job->update(['status' => 'fechada']);
        $this->assertEquals('fechada', $job->fresh()->status);
        
        $job->update(['status' => 'aberta']);
        $this->assertEquals('aberta', $job->fresh()->status);
    }

    public function test_has_valid_job_type()
    {
        $job = Job::factory()->create();
        $this->assertContains($job->type, ['full_time', 'part_time', 'contract', 'temporary', 'internship']);
    }
} 