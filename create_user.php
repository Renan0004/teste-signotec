<?php
// Este script cria um usuário de teste no banco de dados

// Carrega o ambiente Laravel
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use App\Models\User;
use Illuminate\Support\Facades\Hash;

// Dados do usuário
$name = 'Usuário Teste';
$email = 'teste@example.com';
$password = 'password';

try {
    // Verifica se o usuário já existe
    $existingUser = User::where('email', $email)->first();
    
    if ($existingUser) {
        echo "Usuário já existe: {$existingUser->name} ({$existingUser->email})\n";
    } else {
        // Cria o usuário
        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($password)
        ]);
        
        echo "Usuário criado com sucesso!\n";
        echo "ID: {$user->id}\n";
        echo "Nome: {$user->name}\n";
        echo "Email: {$user->email}\n";
        echo "Senha: $password (não criptografada)\n";
    }
    
    // Lista todos os usuários
    echo "\nLista de todos os usuários:\n";
    $users = User::all();
    foreach ($users as $u) {
        echo "- {$u->id}: {$u->name} ({$u->email})\n";
    }
    
} catch (Exception $e) {
    echo "Erro ao criar usuário: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
?> 