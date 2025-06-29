<?php
// Permitir acesso de qualquer origem
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, Accept, Origin');
header('Content-Type: application/json');

// Log para depuração
error_log('Requisição recebida em cors_test.php: ' . $_SERVER['REQUEST_METHOD']);

// Responder imediatamente para requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Retornar informações sobre a requisição
$response = [
    'status' => 'success',
    'message' => 'CORS funcionando corretamente',
    'request' => [
        'method' => $_SERVER['REQUEST_METHOD'],
        'headers' => getallheaders(),
        'time' => date('Y-m-d H:i:s'),
        'remote_addr' => $_SERVER['REMOTE_ADDR'],
        'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown'
    ],
    'cors_headers' => [
        'Access-Control-Allow-Origin' => '*',
        'Access-Control-Allow-Methods' => 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers' => 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, Accept, Origin'
    ]
];

echo json_encode($response, JSON_PRETTY_PRINT); 