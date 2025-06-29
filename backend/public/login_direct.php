<?php
// Permitir acesso de qualquer origem
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Log para depuração
error_log('Requisição recebida em login_direct.php: ' . $_SERVER['REQUEST_METHOD']);

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
if (!isset($data['email']) || !isset($data['password'])) {
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
    
    // Buscar o usuário pelo email
    $stmt = $pdo->prepare('SELECT * FROM users WHERE email = ?');
    $stmt->execute([$data['email']]);
    $user = $stmt->fetch();
    
    // Verificar se o usuário existe
    if (!$user) {
        error_log('Usuário não encontrado: ' . $data['email']);
        echo json_encode(['error' => 'Credenciais inválidas']);
        exit;
    }
    
    // Verificar a senha
    if (!password_verify($data['password'], $user['password'])) {
        error_log('Senha incorreta para o usuário: ' . $data['email']);
        echo json_encode(['error' => 'Credenciais inválidas']);
        exit;
    }
    
    // Gerar um token simples
    $token = bin2hex(random_bytes(32));
    $hashedToken = hash('sha256', $token);
    
    // Remover tokens antigos do usuário
    $stmt = $pdo->prepare('DELETE FROM personal_access_tokens WHERE tokenable_type = ? AND tokenable_id = ?');
    $stmt->execute(['App\\Models\\User', $user['id']]);
    
    // Inserir o token na tabela personal_access_tokens
    $tokenName = 'auth_token';
    $tokenableType = 'App\\Models\\User';
    $abilities = '["*"]';
    
    $stmt = $pdo->prepare('INSERT INTO personal_access_tokens (tokenable_type, tokenable_id, name, token, abilities, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())');
    $stmt->execute([$tokenableType, $user['id'], $tokenName, $hashedToken, $abilities]);
    error_log('Token gerado e inserido para o usuário: ' . $user['id']);
    
    // Preparar dados do usuário para retorno (sem a senha)
    $userData = [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'created_at' => $user['created_at'],
        'updated_at' => $user['updated_at']
    ];
    
    $response = [
        'user' => $userData,
        'token' => $token,
        'token_type' => 'Bearer'
    ];
    
    error_log('Login bem-sucedido para o usuário: ' . $user['email']);
    echo json_encode($response);
    
} catch (PDOException $e) {
    // Log do erro
    error_log('Erro no login: ' . $e->getMessage());
    
    // Retornar mensagem de erro
    echo json_encode(['error' => 'Erro ao fazer login: ' . $e->getMessage()]);
} 