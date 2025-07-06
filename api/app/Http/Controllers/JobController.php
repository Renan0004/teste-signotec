<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;

class JobController extends Controller
{
    // Mostrar todas as vagas
    public function index(Request $request): JsonResponse
    {
        try {
            $query = Job::query();

            // Filtros
            if ($request->has('status') && $request->status !== 'all') {
                $query->where('status', $request->status);
            }

            if ($request->has('type') && $request->type !== 'all') {
                $query->where('type', $request->type);
            }

            if ($request->has('search') && !empty($request->search)) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%")
                      ->orWhere('company', 'like', "%{$search}%")
                      ->orWhere('location', 'like', "%{$search}%");
                });
            }

            // Ordenação
            $sortField = $request->get('sort_by', 'created_at');
            $sortDirection = $request->get('sort_direction', 'desc');
            $query->orderBy($sortField, $sortDirection);

            // Paginação
            $perPage = $request->get('per_page', 20);
            $jobs = $query->paginate($perPage);

            return response()->json($jobs);
        } catch (\Exception $e) {
            \Log::error('Erro ao buscar vagas: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([
                'message' => 'Erro ao buscar vagas',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Criar uma nova vaga
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'company' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'status' => 'required|in:aberta,fechada,em_andamento',
            'type' => 'required|string|max:255',
            'requirements' => 'required|string',
            'benefits' => 'nullable|string'
        ], [
            'title.required' => 'O título é obrigatório',
            'title.max' => 'O título não pode ter mais que 255 caracteres',
            'description.required' => 'A descrição é obrigatória',
            'company.required' => 'A empresa é obrigatória',
            'company.max' => 'O nome da empresa não pode ter mais que 255 caracteres',
            'location.required' => 'A localização é obrigatória',
            'location.max' => 'A localização não pode ter mais que 255 caracteres',
            'status.required' => 'O status é obrigatório',
            'status.in' => 'O status deve ser: aberta, fechada ou em_andamento',
            'type.required' => 'O tipo é obrigatório',
            'type.max' => 'O tipo não pode ter mais que 255 caracteres',
            'requirements.required' => 'Os requisitos são obrigatórios'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $job = Job::create($request->all());
            return response()->json([
                'message' => 'Vaga criada com sucesso',
                'job' => $job
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao criar vaga',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Mostrar uma vaga específica
    public function show(Job $job): JsonResponse
    {
        return response()->json($job);
    }

    // Atualizar uma vaga existente
    public function update(Request $request, Job $job): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'company' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'status' => 'required|in:aberta,fechada,em_andamento',
            'type' => 'required|string|max:255',
            'requirements' => 'required|string',
            'benefits' => 'nullable|string'
        ], [
            'title.required' => 'O título é obrigatório',
            'title.max' => 'O título não pode ter mais que 255 caracteres',
            'description.required' => 'A descrição é obrigatória',
            'company.required' => 'A empresa é obrigatória',
            'company.max' => 'O nome da empresa não pode ter mais que 255 caracteres',
            'location.required' => 'A localização é obrigatória',
            'location.max' => 'A localização não pode ter mais que 255 caracteres',
            'status.required' => 'O status é obrigatório',
            'status.in' => 'O status deve ser: aberta, fechada ou em_andamento',
            'type.required' => 'O tipo é obrigatório',
            'type.max' => 'O tipo não pode ter mais que 255 caracteres',
            'requirements.required' => 'Os requisitos são obrigatórios'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Erro de validação',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $job->update($request->all());
            return response()->json([
                'message' => 'Vaga atualizada com sucesso',
                'job' => $job
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar vaga',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Deletar uma vaga
    public function destroy(Request $request): JsonResponse
    {
        // Deleção em massa
        if ($request->has('ids')) {
            $ids = explode(',', $request->input('ids'));
            Job::whereIn('id', $ids)->delete();
            return response()->json(['message' => 'Vagas excluídas com sucesso']);
        }

        // Deleção única
        $job = Job::findOrFail($request->route('id'));
        $job->delete();
        return response()->json(['message' => 'Vaga excluída com sucesso']);
    }

    // Buscar candidatos aplicados para uma vaga
    public function candidates(Job $job): JsonResponse
    {
        return response()->json($job->candidates()->paginate(20));
    }

    // Buscar candidatos aplicados para uma vaga
    public function getCandidatesForJob(Job $job): JsonResponse
    {
        $candidates = $job->candidates()->get();
        return response()->json($candidates);
    }
} 