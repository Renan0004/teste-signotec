<?php
// Permitir acesso de qualquer origem
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Log para depuração
error_log('Requisição recebida em jobs.php: ' . $_SERVER['REQUEST_METHOD']);

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
    $active = isset($_GET['active']) ? ($_GET['active'] === 'true' ? 1 : 0) : null;
    
    // Validar parâmetros
    if ($page < 1) $page = 1;
    if ($perPage < 1 || $perPage > 100) $perPage = 20;
    
    // Campos permitidos para ordenação
    $allowedSortFields = ['id', 'title', 'type', 'created_at', 'updated_at', 'active'];
    if (!in_array($sortBy, $allowedSortFields)) $sortBy = 'created_at';
    
    // Direções permitidas para ordenação
    $allowedSortDirections = ['asc', 'desc'];
    if (!in_array(strtolower($sortDirection), $allowedSortDirections)) $sortDirection = 'desc';
    
    // Calcular offset para paginação
    $offset = ($page - 1) * $perPage;
    
    // Construir consulta SQL base
    $sql = "SELECT * FROM job_listings";
    $countSql = "SELECT COUNT(*) FROM job_listings";
    $params = [];
    
    // Adicionar filtros se necessário
    $whereClause = "";
    if ($active !== null) {
        $whereClause = " WHERE active = ?";
        $params[] = $active;
    }
    
    // Adicionar cláusula WHERE à consulta
    if (!empty($whereClause)) {
        $sql .= $whereClause;
        $countSql .= $whereClause;
    }
    
    // Adicionar ordenação
    $sql .= " ORDER BY {$sortBy} {$sortDirection}";
    
    // Adicionar paginação
    $sql .= " LIMIT {$perPage} OFFSET {$offset}";
    
    // Executar consulta para contar total de registros
    $countStmt = $pdo->prepare($countSql);
    $countStmt->execute($params);
    $totalJobs = $countStmt->fetchColumn();
    
    // Executar consulta principal
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $jobs = $stmt->fetchAll();
    
    // Adicionar contagem de candidatos para cada vaga
    foreach ($jobs as &$job) {
        $candidatesStmt = $pdo->prepare("SELECT COUNT(*) FROM candidate_job WHERE job_id = ?");
        $candidatesStmt->execute([$job['id']]);
        $job['candidates_count'] = (int)$candidatesStmt->fetchColumn();
    }
    
    // Calcular informações de paginação
    $lastPage = ceil($totalJobs / $perPage);
    
    // Montar resposta no formato esperado pelo frontend
    $response = [
        'data' => $jobs,
        'meta' => [
            'current_page' => $page,
            'from' => $offset + 1,
            'last_page' => $lastPage,
            'per_page' => $perPage,
            'to' => min($offset + $perPage, $totalJobs),
            'total' => $totalJobs,
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
    error_log('Erro ao buscar vagas: ' . $e->getMessage());
    
    // Retornar mensagem de erro
    http_response_code(500);
    echo json_encode([
        'error' => 'Erro ao buscar vagas: ' . $e->getMessage()
    ]);
} 