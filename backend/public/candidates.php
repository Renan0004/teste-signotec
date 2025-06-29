<?php
// Permitir acesso de qualquer origem
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Log para depuração
error_log('Requisição recebida em candidates.php: ' . $_SERVER['REQUEST_METHOD']);

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
    
    // Obter parâmetros da requisição
    $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
    $perPage = isset($_GET['perPage']) ? (int)$_GET['perPage'] : 20;
    $sortBy = isset($_GET['sort_by']) ? $_GET['sort_by'] : 'created_at';
    $sortDirection = isset($_GET['sort_direction']) ? $_GET['sort_direction'] : 'desc';
    
    // Validar parâmetros
    if ($page < 1) $page = 1;
    if ($perPage < 1 || $perPage > 100) $perPage = 20;
    
    // Campos permitidos para ordenação
    $allowedSortFields = ['id', 'name', 'email', 'created_at', 'updated_at'];
    if (!in_array($sortBy, $allowedSortFields)) $sortBy = 'created_at';
    
    // Direções permitidas para ordenação
    $allowedSortDirections = ['asc', 'desc'];
    if (!in_array(strtolower($sortDirection), $allowedSortDirections)) $sortDirection = 'desc';
    
    // Calcular offset para paginação
    $offset = ($page - 1) * $perPage;
    
    // Construir consulta SQL
    $sql = "SELECT * FROM candidates ORDER BY {$sortBy} {$sortDirection} LIMIT {$perPage} OFFSET {$offset}";
    $countSql = "SELECT COUNT(*) FROM candidates";
    
    // Executar consulta para contar total de registros
    $countStmt = $pdo->query($countSql);
    $totalCandidates = $countStmt->fetchColumn();
    
    // Executar consulta principal
    $stmt = $pdo->query($sql);
    $candidates = $stmt->fetchAll();
    
    // Adicionar contagem de inscrições para cada candidato
    foreach ($candidates as &$candidate) {
        $jobsStmt = $pdo->prepare("SELECT COUNT(*) FROM candidate_job WHERE candidate_id = ?");
        $jobsStmt->execute([$candidate['id']]);
        $candidate['jobs_count'] = (int)$jobsStmt->fetchColumn();
    }
    
    // Calcular informações de paginação
    $lastPage = ceil($totalCandidates / $perPage);
    
    // Montar resposta no formato esperado pelo frontend
    $response = [
        'data' => $candidates,
        'meta' => [
            'current_page' => $page,
            'from' => $offset + 1,
            'last_page' => $lastPage,
            'per_page' => $perPage,
            'to' => min($offset + $perPage, $totalCandidates),
            'total' => $totalCandidates,
        ],
        'links' => [
            'first' => "?page=1&perPage={$perPage}",
            'last' => "?page={$lastPage}&perPage={$perPage}",
            'prev' => $page > 1 ? "?page=" . ($page - 1) . "&perPage={$perPage}" : null,
            'next' => $page < $lastPage ? "?page=" . ($page + 1) . "&perPage={$perPage}" : null,
        ]
    ];
    
    // Retornar resposta
    echo json_encode($response);
    
} catch (PDOException $e) {
    // Log do erro
    error_log('Erro ao buscar candidatos: ' . $e->getMessage());
    
    // Retornar mensagem de erro
    http_response_code(500);
    echo json_encode([
        'error' => 'Erro ao buscar candidatos: ' . $e->getMessage()
    ]);
} 