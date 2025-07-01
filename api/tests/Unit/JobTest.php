<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\Job;
use Illuminate\Foundation\Testing\RefreshDatabase;

class JobTest extends TestCase
{
    use RefreshDatabase;

    public function test_can_create_job()
    {
        $jobData = [
            'title' => 'Software Developer',
            'description' => 'PHP Developer position',
            'company' => 'Tech Corp',
            'location' => 'São Paulo',
            'contract_type' => 'CLT',
            'is_active' => true
        ];

        $job = Job::create($jobData);

        $this->assertInstanceOf(Job::class, $job);
        $this->assertEquals($jobData['title'], $job->title);
        $this->assertEquals($jobData['contract_type'], $job->contract_type);
        $this->assertTrue($job->is_active);
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

    public function test_scope_active_only_returns_active_jobs()
    {
        Job::factory()->create(['is_active' => true]);
        Job::factory()->create(['is_active' => false]);

        $activeJobs = Job::active()->get();

        $this->assertEquals(1, $activeJobs->count());
        $this->assertTrue($activeJobs->first()->is_active);
    }
} 