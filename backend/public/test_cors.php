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

// Informações sobre a requisição
$info = [
    'method' => $_SERVER['REQUEST_METHOD'],
    'headers' => getallheaders(),
    'time' => date('Y-m-d H:i:s'),
    'remote_addr' => $_SERVER['REMOTE_ADDR'],
    'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
    'cors' => [
        'origin' => $_SERVER['HTTP_ORIGIN'] ?? 'Not set',
        'host' => $_SERVER['HTTP_HOST'] ?? 'Not set'
    ]
];

// Retornar informações
echo json_encode([
    'status' => 'success',
    'message' => 'CORS funcionando corretamente',
    'info' => $info
]); 