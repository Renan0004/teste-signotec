<?php

/**
 * Laravel - Um framework PHP para desenvolvedores web
 *
 * @package  Laravel
 * @author   Taylor Otwell <taylor@laravel.com> (https://laravel.com)
 */

// Adicionar cabeçalhos CORS manualmente
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, Accept, Origin');
header('Access-Control-Max-Age: 86400');

// Responder imediatamente para requisições OPTIONS (preflight)
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

/*
|--------------------------------------------------------------------------
| Verificar se a aplicação está em modo de manutenção
|--------------------------------------------------------------------------
|
| Se a aplicação está em modo de manutenção / demonstração via o comando "down"
| vamos carregar este arquivo para que qualquer conteúdo pré-renderizado possa ser exibido
| ao invés de iniciar o framework, o que poderia causar uma exceção.
|
*/

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

/*
|--------------------------------------------------------------------------
| Registrar o carregador automático
|--------------------------------------------------------------------------
|
| Composer fornece um carregador de classes conveniente, automaticamente gerado para
| esta aplicação. Nós apenas precisamos utilizá-lo! Vamos simplesmente requerê-lo
| aqui no script para que não precisemos carregar manualmente nossas classes.
|
*/

require __DIR__.'/../vendor/autoload.php';

/*
|--------------------------------------------------------------------------
| Acender as luzes
|--------------------------------------------------------------------------
|
| Precisamos iluminar o desenvolvimento PHP, então vamos acender as luzes.
| Este bootstrapa o framework e prepara para uso, então ele
| carrega esta aplicação para que possamos rodar e enviar
| a resposta para o navegador e deliciar nossos usuários.
|
*/

$app = require_once __DIR__.'/../bootstrap/app.php';

/*
|--------------------------------------------------------------------------
| Executar a aplicação
|--------------------------------------------------------------------------
|
| Uma vez que temos a aplicação, podemos lidar com a solicitação recebida usando
| o kernel HTTP da aplicação. Então, vamos enviar a resposta de volta para o navegador
| deste cliente, permitindo que eles desfrutem de nossa aplicação.
|
*/

$kernel = $app->make(Kernel::class);

$response = $kernel->handle(
    $request = Request::capture()
)->send();

$kernel->terminate($request, $response); 