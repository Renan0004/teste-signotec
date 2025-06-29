<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

/**
 * Controlador responsável pela autenticação de usuários na API.
 * 
 * Este controlador gerencia operações como registro, login, 
 * obtenção de dados do usuário e logout.
 */
class AuthController extends Controller
{
    /**
     * Registra um novo usuário no sistema.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function register(Request $request)
    {
        // Registra a tentativa de registro nos logs
        Log::info('Tentativa de registro', [
            'dados' => $request->only(['name', 'email']), 
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);
        
        try {
            // Valida os dados de entrada
            $validator = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'email' => 'required|string|email|max:255|unique:users',
                'password' => 'required|string|min:8|confirmed',
            ]);

            // Retorna erros de validação se houver
            if ($validator->fails()) {
                Log::error('Falha na validação do registro', ['errors' => $validator->errors()->toArray()]);
                return response()->json(['errors' => $validator->errors()], 422);
            }

            Log::info('Criando usuário com os dados:', ['name' => $request->name, 'email' => $request->email]);
            
            // Cria o novo usuário no banco de dados
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password), // Senha é criptografada
            ]);

            // Gera token de autenticação para o usuário
            $token = $user->createToken('auth_token')->plainTextToken;

            Log::info('Usuário registrado com sucesso', ['user_id' => $user->id, 'email' => $user->email]);
            
            // Retorna os dados do usuário e o token
            return response()->json([
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
            ], 201); // 201 = Created
        } catch (\Exception $e) {
            // Registra erros no log
            Log::error('Erro ao registrar usuário', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'dados' => $request->only(['name', 'email'])
            ]);
            
            // Retorna mensagem de erro
            return response()->json([
                'message' => 'Erro ao registrar usuário',
                'error' => $e->getMessage()
            ], 500); // 500 = Internal Server Error
        }
    }

    /**
     * Faz login do usuário no sistema.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function login(Request $request)
    {
        // Registra a tentativa de login nos logs
        Log::info('Tentativa de login', [
            'email' => $request->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent()
        ]);
        
        try {
            // Valida os dados de entrada
            $validator = Validator::make($request->all(), [
                'email' => 'required|string|email',
                'password' => 'required|string',
            ]);

            // Retorna erros de validação se houver
            if ($validator->fails()) {
                Log::error('Falha na validação do login', ['errors' => $validator->errors()]);
                return response()->json(['errors' => $validator->errors()], 422);
            }

            // Tenta autenticar o usuário
            if (!Auth::attempt($request->only('email', 'password'))) {
                Log::warning('Credenciais inválidas', ['email' => $request->email]);
                return response()->json(['message' => 'Credenciais inválidas'], 401); // 401 = Unauthorized
            }

            // Busca o usuário no banco de dados
            $user = User::where('email', $request->email)->firstOrFail();
            
            // Remove tokens antigos
            $user->tokens()->delete();
            
            // Gera token de autenticação
            $token = $user->createToken('auth_token')->plainTextToken;

            Log::info('Login realizado com sucesso', ['user_id' => $user->id]);
            
            // Retorna os dados do usuário e o token
            return response()->json([
                'user' => $user,
                'token' => $token,
                'token_type' => 'Bearer',
            ]);
        } catch (\Exception $e) {
            // Registra erros no log
            Log::error('Erro ao fazer login', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            // Retorna mensagem de erro
            return response()->json([
                'message' => 'Erro ao fazer login',
                'error' => $e->getMessage()
            ], 500); // 500 = Internal Server Error
        }
    }

    /**
     * Obtém informações do usuário autenticado.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function user(Request $request)
    {
        try {
            // Registra a requisição nos logs
            Log::info('Obtendo informações do usuário', ['user_id' => $request->user()->id]);
            
            // Retorna os dados do usuário autenticado
            return response()->json($request->user());
        } catch (\Exception $e) {
            Log::error('Erro ao obter informações do usuário', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Erro ao obter informações do usuário',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Faz logout do usuário, invalidando o token atual.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function logout(Request $request)
    {
        try {
            // Registra o logout nos logs
            Log::info('Logout do usuário', ['user_id' => $request->user()->id]);
            
            // Remove o token atual do usuário
            $request->user()->currentAccessToken()->delete();

            // Retorna mensagem de sucesso
            return response()->json(['message' => 'Logout realizado com sucesso']);
        } catch (\Exception $e) {
            Log::error('Erro ao fazer logout', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'message' => 'Erro ao fazer logout',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 