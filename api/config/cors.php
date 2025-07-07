<?php
// config/cors.php
return [
    'paths' => ['*', 'sanctum/csrf-cookie', 'api/*'],
    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    'allowed_origins' => [
        'http://localhost:3000',
        'http://127.0.0.1:3001',
        'http://localhost:3001',
        env('FRONTEND_URL', 'http://localhost:3001'),
        env('FRONTEND_URL', 'http://localhost:3000')
    ],
    'allowed_origins_patterns' => [],
    'allowed_headers' => [
        'Content-Type',
        'X-Requested-With',
        'Authorization',
        'X-XSRF-TOKEN',
        'X-HTTP-Method-Override',
        'Accept',
        'Origin'
    ],
    'exposed_headers' => [''],
    'max_age' => 7200,
    'supports_credentials' => true,
]; 