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

// Obter informações do PHP
$phpInfo = [
    'version' => phpversion(),
    'os' => PHP_OS,
    'extensions' => get_loaded_extensions(),
    'pdo_drivers' => PDO::getAvailableDrivers(),
    'server' => $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown',
    'memory_limit' => ini_get('memory_limit'),
    'max_execution_time' => ini_get('max_execution_time'),
    'upload_max_filesize' => ini_get('upload_max_filesize'),
    'post_max_size' => ini_get('post_max_size'),
    'display_errors' => ini_get('display_errors'),
    'error_reporting' => ini_get('error_reporting')
];

// Retornar informações
echo json_encode([
    'status' => 'success',
    'php_info' => $phpInfo
]); 