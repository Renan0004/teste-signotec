<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Cors
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle(Request $request, Closure $next)
    {
        // Para requisições OPTIONS (preflight)
        if ($request->isMethod('OPTIONS')) {
            $response = new Response('', 200);
            $response->headers->set('Access-Control-Allow-Origin', '*');
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, Accept, Origin');
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
            $response->headers->set('Access-Control-Max-Age', '86400');
            return $response;
        }
        
        $response = $next($request);
        
        // Adicionar cabeçalhos CORS à resposta
        if (!$response->headers->has('Access-Control-Allow-Origin')) {
            $response->headers->set('Access-Control-Allow-Origin', '*');
        }
        
        if (!$response->headers->has('Access-Control-Allow-Methods')) {
            $response->headers->set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        }
        
        if (!$response->headers->has('Access-Control-Allow-Headers')) {
            $response->headers->set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-TOKEN, Accept, Origin');
        }
        
        if (!$response->headers->has('Access-Control-Allow-Credentials')) {
            $response->headers->set('Access-Control-Allow-Credentials', 'true');
        }
        
        if (!$response->headers->has('Access-Control-Max-Age')) {
            $response->headers->set('Access-Control-Max-Age', '86400');
        }
        
        return $response;
    }
}
