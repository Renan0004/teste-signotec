<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\API\AuthController;
use App\Http\Controllers\API\JobController;
use App\Http\Controllers\API\CandidateController;
use App\Http\Controllers\API\TestController;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

/*
|--------------------------------------------------------------------------
| Rotas da API
|--------------------------------------------------------------------------
|
| Aqui é onde você pode registrar as rotas da API para sua aplicação.
| Estas rotas são carregadas pelo RouteServiceProvider e todas elas
| serão atribuídas ao grupo de middleware "api".
|
*/

// Rota de teste para verificar se a API está funcionando
Route::get('/test', function () {
    return response()->json([
        'message' => 'API está funcionando corretamente',
        'status' => 'success',
        'timestamp' => now()->toDateTimeString()
    ]);
});

// Rota de teste para CORS
Route::options('/cors-test', function () {
    return response()->json(['status' => 'success', 'message' => 'CORS funcionando corretamente']);
});

Route::get('/cors-test', function () {
    return response()->json(['status' => 'success', 'message' => 'CORS funcionando corretamente']);
});

// Rota de registro simplificada sem CSRF e sem validação complexa
Route::post('/register-direct', function (Request $request) {
    try {
        // Log da requisição
        Log::info('Tentativa de registro direto', [
            'email' => $request->email,
            'name' => $request->name,
            'headers' => $request->headers->all()
        ]);
        
        // Verificar se o usuário já existe
        $existingUser = User::where('email', $request->email)->first();
        if ($existingUser) {
            return response()->json([
                'message' => 'Email já está em uso',
                'error' => 'Email already exists'
            ], 422);
        }
        
        // Criar o usuário
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);
        
        // Gerar token
        $token = $user->createToken('auth_token')->plainTextToken;
        
        Log::info('Usuário registrado com sucesso via rota direta', ['user_id' => $user->id]);
        
        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    } catch (\Exception $e) {
        Log::error('Erro no registro direto', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'message' => 'Erro ao registrar usuário',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Rota de registro simplificada para contornar problemas de CORS
Route::post('/register-simple', function (Request $request) {
    try {
        Log::info('Tentativa de registro simplificado', ['email' => $request->email]);
        
        // Verificar se o usuário já existe
        $existingUser = User::where('email', $request->email)->first();
        if ($existingUser) {
            return response()->json([
                'message' => 'Email já está em uso',
                'error' => 'Email already exists'
            ], 422);
        }
        
        // Criar o usuário
        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
        ]);
        
        // Gerar token
        $token = $user->createToken('auth_token')->plainTextToken;
        
        Log::info('Usuário registrado com sucesso via rota simplificada', ['user_id' => $user->id]);
        
        return response()->json([
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer',
        ], 201);
    } catch (\Exception $e) {
        Log::error('Erro no registro simplificado', [
            'error' => $e->getMessage(),
            'trace' => $e->getTraceAsString()
        ]);
        
        return response()->json([
            'message' => 'Erro ao registrar usuário',
            'error' => $e->getMessage()
        ], 500);
    }
});

// Rotas públicas - não requerem autenticação
Route::post('/login', [AuthController::class, 'login']);        // Login de usuário
Route::post('/register', [AuthController::class, 'register']);  // Registro de novo usuário

// Rotas protegidas - requerem autenticação via token
Route::middleware('auth:sanctum')->group(function () {
    // Rotas de usuário
    Route::get('/user', [AuthController::class, 'user']);       // Obter dados do usuário autenticado
    Route::post('/logout', [AuthController::class, 'logout']);  // Logout do usuário (invalidar token)
    
    // Rotas de vagas - CRUD completo
    Route::apiResource('jobs', JobController::class);           // Cria rotas padrão: index, store, show, update, destroy
    Route::post('/jobs/bulk-delete', [JobController::class, 'bulkDelete']);          // Excluir múltiplas vagas
    Route::put('/jobs/{job}/toggle-status', [JobController::class, 'toggleStatus']);  // Alternar status da vaga (ativa/inativa)
    
    // Rotas de candidatos - CRUD completo
    Route::apiResource('candidates', CandidateController::class); // Cria rotas padrão: index, store, show, update, destroy
    Route::post('/candidates/bulk-delete', [CandidateController::class, 'bulkDelete']);                // Excluir múltiplos candidatos
    Route::get('/candidates/{candidate}/jobs', [CandidateController::class, 'jobs']);                  // Listar vagas de um candidato
    Route::post('/candidates/{candidate}/apply', [CandidateController::class, 'applyToJob']);          // Candidatar-se a uma vaga
    Route::delete('/candidates/{candidate}/jobs/{job}', [CandidateController::class, 'removeFromJob']); // Remover candidatura
});

// Rotas de teste
Route::get('/test-controller', [TestController::class, 'test']);
Route::get('/cors-test-controller', [TestController::class, 'corsTest']);
Route::post('/register-test', [TestController::class, 'registerSimple']); 