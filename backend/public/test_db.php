<?php
// Permitir acesso de qualquer origem
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Responder imediatamente para requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
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
    // Conectar ao banco de dados
    $pdo = new PDO($dsn, $user, $pass, $options);
    
    // Verificar a conexão
    $stmt = $pdo->query('SELECT 1');
    
    // Obter informações do servidor MySQL
    $serverInfo = $pdo->getAttribute(PDO::ATTR_SERVER_VERSION);
    
    // Contar usuários
    $userCount = $pdo->query('SELECT COUNT(*) FROM users')->fetchColumn();
    
    echo json_encode([
        'status' => 'success',
        'message' => 'Conexão com o banco de dados estabelecida',
        'server_info' => $serverInfo,
        'user_count' => $userCount
    ]);
    
} catch (PDOException $e) {
    // Log do erro
    error_log('Erro na conexão com o banco de dados: ' . $e->getMessage());
    
    // Retornar mensagem de erro
    echo json_encode([
        'status' => 'error',
        'message' => 'Erro na conexão com o banco de dados',
        'error' => $e->getMessage()
    ]);
} 