<?php
// Configurar cabeçalhos CORS
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json');

// Responder imediatamente para requisições OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Verificar as rotas disponíveis no Laravel
$routes = [];

// Tentar obter as rotas do Laravel
try {
    // Incluir o autoloader do Laravel
    require_once __DIR__ . '/../vendor/autoload.php';
    
    // Inicializar o aplicativo Laravel
    $app = require_once __DIR__ . '/../bootstrap/app.php';
    $kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);
    
    // Obter as rotas registradas
    $routes = [];
    $routeCollection = Route::getRoutes();
    
    foreach ($routeCollection as $route) {
        $routes[] = [
            'method' => implode('|', $route->methods()),
            'uri' => $route->uri(),
            'name' => $route->getName(),
            'action' => $route->getActionName(),
        ];
    }
    
    // Resposta com as rotas
    echo json_encode([
        'status' => 'success',
        'message' => 'Rotas da API encontradas',
        'routes' => $routes,
        'total_routes' => count($routes)
    ]);
} catch (Exception $e) {
    // Se ocorrer um erro, retornar informações sobre o erro
    echo json_encode([
        'status' => 'error',
        'message' => 'Erro ao obter rotas da API',
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ]);
} 