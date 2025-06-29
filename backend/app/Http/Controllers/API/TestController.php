<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class TestController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }

    /**
     * Teste simples para verificar se a API está funcionando.
     */
    public function test()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'API funcionando corretamente',
            'timestamp' => now()->toDateTimeString()
        ]);
    }
    
    /**
     * Teste de CORS para verificar se os cabeçalhos estão sendo enviados corretamente.
     */
    public function corsTest()
    {
        return response()->json([
            'status' => 'success',
            'message' => 'CORS funcionando corretamente',
            'headers' => [
                'Access-Control-Allow-Origin' => 'http://localhost:3000',
                'Access-Control-Allow-Methods' => 'GET, POST, PUT, DELETE, OPTIONS'
            ]
        ]);
    }
    
    /**
     * Registro simplificado para contornar problemas de CORS.
     */
    public function registerSimple(Request $request)
    {
        try {
            Log::info('Tentativa de registro via TestController', ['email' => $request->email]);
            
            // Validação básica
            if (empty($request->name) || empty($request->email) || empty($request->password)) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Campos obrigatórios não preenchidos'
                ], 422);
            }
            
            // Verificar se o email já existe
            $existingUser = User::where('email', $request->email)->first();
            if ($existingUser) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Email já está em uso'
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
            
            Log::info('Usuário registrado com sucesso via TestController', ['user_id' => $user->id]);
            
            return response()->json([
                'status' => 'success',
                'message' => 'Usuário registrado com sucesso',
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
            ], 201);
        } catch (\Exception $e) {
            Log::error('Erro no registro via TestController', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'status' => 'error',
                'message' => 'Erro ao registrar usuário',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
