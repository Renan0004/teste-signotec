<?php
// Este script cria um usuário de teste no banco de dados

// Configuração do banco de dados
$host = 'signotec-db';
$db   = 'signotec';
$user = 'signotec';
$pass = 'secret';
$charset = 'utf8mb4';

$dsn = "mysql:host=$host;dbname=$db;charset=$charset";
$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    // Conectar ao banco de dados
    $pdo = new PDO($dsn, $user, $pass, $options);
    
    // Dados do usuário administrador
    $name = 'Admin';
    $email = 'admin@signotec.com';
    $password = password_hash('password', PASSWORD_BCRYPT, ['cost' => 12]);
    $created_at = date('Y-m-d H:i:s');
    $updated_at = date('Y-m-d H:i:s');
    
    // Verificar se o usuário já existe
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch();
    
    if ($user) {
        echo "Usuário com o email '$email' já existe!\n";
    } else {
        // Inserir o usuário
        $sql = "INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?, ?, ?, ?, ?)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute([$name, $email, $password, $created_at, $updated_at]);
        
        echo "Usuário administrador criado com sucesso!\n";
        echo "Email: $email\n";
        echo "Senha: password\n";
    }
    
} catch (PDOException $e) {
    echo "Erro: " . $e->getMessage() . "\n";
    exit(1);
}
?> 