<?php
// Permitir acesso de qualquer origem
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Log para depuração
error_log('Requisição recebida em register_direct.php: ' . $_SERVER['REQUEST_METHOD']);

// Responder imediatamente para requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verificar se é uma requisição POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['error' => 'Método não permitido']);
    exit;
}

// Obter dados do corpo da requisição
$data = json_decode(file_get_contents('php://input'), true);
error_log('Dados recebidos: ' . json_encode($data));

// Verificar se os dados necessários estão presentes
if (!isset($data['name']) || !isset($data['email']) || !isset($data['password'])) {
    echo json_encode(['error' => 'Dados incompletos']);
    exit;
}

// Configuração do banco de dados
$host = 'db';
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
    error_log('Tentando conectar ao banco de dados: ' . $dsn);
    
    // Conectar ao banco de dados
    $pdo = new PDO($dsn, $user, $pass, $options);
    error_log('Conexão com o banco de dados estabelecida');
    
    // Verificar se o email já existe
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$data['email']]);
    $existingUser = $stmt->fetch();
    
    if ($existingUser) {
        error_log('Email já está em uso: ' . $data['email']);
        echo json_encode(['error' => 'Email já está em uso']);
        exit;
    }
    
    // Hash da senha
    $hashedPassword = password_hash($data['password'], PASSWORD_BCRYPT, ['cost' => 12]);
    
    // Inserir o usuário
    error_log('Inserindo novo usuário: ' . $data['email']);
    $stmt = $pdo->prepare('INSERT INTO users (name, email, password, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())');
    $stmt->execute([$data['name'], $data['email'], $hashedPassword]);
    $userId = $pdo->lastInsertId();
    error_log('Usuário inserido com ID: ' . $userId);
    
    // Gerar um token simples
    $token = bin2hex(random_bytes(32));
    $hashedToken = hash('sha256', $token);
    
    // Inserir o token na tabela personal_access_tokens
    $tokenName = 'auth_token';
    $tokenableType = 'App\\Models\\User';
    $abilities = '["*"]';
    
    $stmt = $pdo->prepare('INSERT INTO personal_access_tokens (tokenable_type, tokenable_id, name, token, abilities, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())');
    $stmt->execute([$tokenableType, $userId, $tokenName, $hashedToken, $abilities]);
    error_log('Token gerado e inserido para o usuário: ' . $userId);
    
    // Retornar os dados do usuário e o token
    $user = [
        'id' => $userId,
        'name' => $data['name'],
        'email' => $data['email'],
        'created_at' => date('Y-m-d H:i:s'),
        'updated_at' => date('Y-m-d H:i:s')
    ];
    
    $response = [
        'user' => $user,
        'token' => $token,
        'token_type' => 'Bearer'
    ];
    
    error_log('Resposta de sucesso: ' . json_encode($response));
    echo json_encode($response);
    
} catch (PDOException $e) {
    // Log do erro
    error_log('Erro no registro: ' . $e->getMessage());
    
    // Retornar mensagem de erro
    echo json_encode(['error' => 'Erro ao registrar: ' . $e->getMessage()]);
} 