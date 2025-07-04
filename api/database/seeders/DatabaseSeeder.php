<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Job;
use App\Models\Candidate;

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
            'password' => bcrypt('password'),
            'is_admin' => true
        ]);

        // Criar alguns usuários regulares
        User::factory(10)->create();

        // Criar vagas ativas
        Job::factory(15)
            ->active()
            ->create();

        // Criar algumas vagas inativas
        Job::factory(5)
            ->inactive()
            ->create();

        // Criar candidatos
        Candidate::factory(8)->create();
    }
}
