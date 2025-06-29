<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Cria um usuário admin padrão
        User::create([
            'name' => 'Admin',
            'email' => 'admin@signotec.com',
            'password' => Hash::make('password'),
        ]);

        // Cria alguns usuários adicionais para testes
        User::create([
            'name' => 'Usuário Teste',
            'email' => 'usuario@signotec.com',
            'password' => Hash::make('password'),
        ]);
    }
} 