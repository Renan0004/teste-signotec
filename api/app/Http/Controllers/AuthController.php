<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Password;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    // Register
    public function register(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users'],
            'password' => [
                'required',
                'string',
                Password::min(8)
                    ->mixedCase()
                    ->numbers()
                    ->symbols()
                    ->uncompromised(),
                'confirmed'
            ],
            'password_confirmation' => ['required', 'string']
        ], [
            'name.required' => 'O nome é obrigatório',
            'name.string' => 'O nome deve ser um texto',
            'name.max' => 'O nome não pode ter mais que 255 caracteres',
            'email.required' => 'O e-mail é obrigatório',
            'email.string' => 'O e-mail deve ser um texto',
            'email.email' => 'Digite um e-mail válido',
            'email.max' => 'O e-mail não pode ter mais que 255 caracteres',
            'email.unique' => 'Este e-mail já está em uso',
            'password.required' => 'A senha é obrigatória',
            'password.string' => 'A senha deve ser um texto',
            'password.min' => 'A senha deve ter no mínimo 8 caracteres',
            'password.mixed' => 'A senha deve conter letras maiúsculas e minúsculas',
            'password.numbers' => 'A senha deve conter números',
            'password.symbols' => 'A senha deve conter caracteres especiais',
            'password.uncompromised' => 'Esta senha já foi exposta em vazamentos de dados. Por favor, escolha outra',
            'password.confirmed' => 'As senhas não conferem',
            'password_confirmation.required' => 'A confirmação de senha é obrigatória'
        ]);

        // Retorna os erros de validação
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        // Tenta criar o usuário
        try {
            \Log::info('Dados recebidos:', $request->all());
            
            $user = new User();
            $user->name = $request->name;
            $user->email = $request->email;
            $user->password = Hash::make($request->password);
            $user->email_verified_at = now(); // Definindo email como verificado
            $user->remember_token = Str::random(60); // Gerando remember_token
            $user->save();

            \Log::info('Usuário criado:', $user->toArray());

        // Retorna o usuário criado
        return response()->json([
                'message' => 'Usuário registrado com sucesso',
                'user' => [
                    'name' => $user->name,
                    'email' => $user->email
                ]
        ], 201);
        } catch (\Exception $e) {
            \Log::error('Erro ao registrar usuário: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([
                'message' => 'Erro ao registrar usuário',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Login
    public function login(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required' => 'O e-mail é obrigatório',
            'email.string' => 'O e-mail deve ser um texto',
            'email.email' => 'Digite um e-mail válido',
            'password.required' => 'A senha é obrigatória',
            'password.string' => 'A senha deve ser um texto'
        ]);

        // Retorna os erros de validação
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        // Tenta fazer o login
        try {
            // Tenta encontrar o usuário primeiro
            $user = User::where('email', $request->email)->first();
            
            if (!$user || !Hash::check($request->password, $user->password)) {
                return response()->json([
                    'message' => 'E-mail ou senha inválidos'
                ], 401);
            }

            // Gera o token
            $token = $user->createToken('auth_token')->plainTextToken;

            // Remove dados sensíveis do usuário
            $userData = [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at
            ];

            return response()->json([
                'message' => 'Login realizado com sucesso',
                'user' => $userData,
                'token' => $token
            ]);
        } catch (\Exception $e) {
            \Log::error('Erro no login: ' . $e->getMessage());
            return response()->json([
                'message' => 'Erro ao fazer login',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Logout
    public function logout(Request $request): JsonResponse
    {
        try {
            // Verificar se o usuário está autenticado
            if ($request->user()) {
                $request->user()->currentAccessToken()->delete();
            }
            
            return response()->json([
                'message' => 'Logout realizado com sucesso'
            ]);
        } catch (\Exception $e) {
            \Log::error('Erro ao fazer logout: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([
                'message' => 'Erro ao fazer logout',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // User
    public function user(Request $request): JsonResponse
    {
        try {
        return response()->json($request->user());
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao obter dados do usuário',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 