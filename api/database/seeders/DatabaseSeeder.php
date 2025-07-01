<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Job;
use App\Models\Candidate;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Criar usuário admin
        User::factory()->create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password')
        ]);

        // Criar 50 vagas
        $jobs = Job::factory(50)->create();

        // Criar 100 candidatos
        $candidates = Candidate::factory(100)->create();

        // Associar candidatos a vagas aleatoriamente
        $candidates->each(function ($candidate) use ($jobs) {
            $candidate->jobs()->attach(
                $jobs->random(rand(1, 5))->pluck('id')->toArray()
            );
        });
    }
}
