<?php
// Permitir acesso de qualquer origem
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Log para depuração
error_log('Requisição recebida em get_user.php: ' . $_SERVER['REQUEST_METHOD']);

// Responder imediatamente para requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Obter o token do cabeçalho Authorization
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = '';

if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
    $token = $matches[1];
    error_log('Token extraído do cabeçalho: ' . substr($token, 0, 10) . '...');
} else {
    // Se não estiver no cabeçalho, tenta obter do corpo da requisição
    $data = json_decode(file_get_contents('php://input'), true);
    $token = $data['token'] ?? '';
    error_log('Token extraído do corpo: ' . substr($token, 0, 10) . '...');
}

if (empty($token)) {
    echo json_encode(['error' => 'Token não fornecido']);
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
    
    // Hash do token para comparação
    $hashedToken = hash('sha256', $token);
    
    // Buscar o token na tabela personal_access_tokens
    $stmt = $pdo->prepare('SELECT * FROM personal_access_tokens WHERE token = ?');
    $stmt->execute([$hashedToken]);
    $tokenRecord = $stmt->fetch();
    
    if (!$tokenRecord) {
        error_log('Token não encontrado no banco de dados');
        echo json_encode(['error' => 'Token inválido']);
        exit;
    }
    
    // Buscar o usuário associado ao token
    $stmt = $pdo->prepare('SELECT id, name, email, created_at, updated_at FROM users WHERE id = ?');
    $stmt->execute([$tokenRecord['tokenable_id']]);
    $user = $stmt->fetch();
    
    if (!$user) {
        error_log('Usuário não encontrado para o token fornecido');
        echo json_encode(['error' => 'Usuário não encontrado']);
        exit;
    }
    
    error_log('Usuário encontrado: ' . $user['email']);
    echo json_encode(['user' => $user]);
    
} catch (PDOException $e) {
    // Log do erro
    error_log('Erro ao obter usuário: ' . $e->getMessage());
    
    // Retornar mensagem de erro
    echo json_encode(['error' => 'Erro ao obter usuário: ' . $e->getMessage()]);
} 