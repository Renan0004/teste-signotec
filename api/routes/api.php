<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\JobController;
use App\Http\Controllers\CandidateController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
*/

// Rotas públicas
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// Rotas protegidas
Route::middleware('auth:sanctum')->group(function () {
    // Autenticação
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);

    // Vagas
    Route::apiResource('jobs', JobController::class);
    
    // Rota adicional para permitir exclusão via POST
    Route::post('/jobs/{job}', [JobController::class, 'updateOrDestroy']);
    
    Route::get('/jobs/{job}/candidates', [JobController::class, 'candidates']);

    // Candidatos
    Route::apiResource('candidates', CandidateController::class);
    Route::get('/candidates', [CandidateController::class, 'index']);
    
    // Rota adicional para permitir exclusão e atualização via POST
    Route::post('/candidates/{candidateId}', [CandidateController::class, 'updateOrDestroy'])->where('candidateId', '[0-9]+');
    
    Route::post('/candidates/{candidate}/apply', [CandidateController::class, 'applyToJob']);
    Route::get('/candidates/{candidate}/resume', [CandidateController::class, 'downloadResume']);
}); 