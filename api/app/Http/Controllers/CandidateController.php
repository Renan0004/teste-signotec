<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class CandidateController extends Controller
{
    // Mostrar todos os candidatos
    public function index(Request $request): JsonResponse
    {
        $query = Candidate::query();

        // Filtros
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        // Ordenação
        $sortField = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Paginação
        $perPage = $request->input('per_page', 20);
        $candidates = $query->paginate($perPage);

        return response()->json($candidates);
    }

    // Criar um novo candidato
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:candidates',
            'phone' => 'required|string|max:20',
            'resume' => 'required|file|mimes:pdf|max:5120', // max 5MB
            'job_ids' => 'array',
            'job_ids.*' => 'exists:job_positions,id'
        ]);

        // Upload do currículo
        if ($request->hasFile('resume')) {
            $path = $request->file('resume')->store('resumes', 'public');
            $validated['resume_path'] = $path;
        }

        $candidate = Candidate::create($validated);

        // Vincula as vagas selecionadas
        if (isset($validated['job_ids'])) {
            $candidate->jobs()->attach($validated['job_ids']);
        }

        return response()->json($candidate, 201);
    }

    // Mostrar um candidato específico
    public function show(Candidate $candidate): JsonResponse
    {
        return response()->json($candidate->load('jobs'));
    }

    // Atualizar um candidato existente
    public function update(Request $request, Candidate $candidate): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('candidates')->ignore($candidate->id)],
            'phone' => 'sometimes|required|string|max:20',
            'resume' => 'sometimes|file|mimes:pdf|max:5120', // max 5MB
            'job_ids' => 'sometimes|array',
            'job_ids.*' => 'exists:job_positions,id'
        ]);

        // Upload do novo currículo
        if ($request->hasFile('resume')) {
            // Remove o currículo antigo
            if ($candidate->resume_path) {
                Storage::disk('public')->delete($candidate->resume_path);
            }
            
            $path = $request->file('resume')->store('resumes', 'public');
            $validated['resume_path'] = $path;
        }

        $candidate->update($validated);

        // Atualiza as vagas vinculadas
        if (isset($validated['job_ids'])) {
            $candidate->jobs()->sync($validated['job_ids']);
        }

        return response()->json($candidate);
    }

    // Deletar um candidato
    public function destroy(Request $request): JsonResponse
    {
        // Deleção em massa
        if ($request->has('ids')) {
            $ids = explode(',', $request->input('ids'));
            $candidates = Candidate::whereIn('id', $ids)->get();
            
            // Remove os currículos
            foreach ($candidates as $candidate) {
                if ($candidate->resume_path) {
                    Storage::disk('public')->delete($candidate->resume_path);
                }
            }
            
            Candidate::whereIn('id', $ids)->delete();
            return response()->json(['message' => 'Candidatos excluídos com sucesso']);
        }

        // Deleção única
        $candidate = Candidate::findOrFail($request->route('id'));
        
        // Remove o currículo
        if ($candidate->resume_path) {
            Storage::disk('public')->delete($candidate->resume_path);
        }
        
        $candidate->delete();
        return response()->json(['message' => 'Candidato excluído com sucesso']);
    }

    // Aplicar para uma vaga
    public function applyToJob(Request $request, Candidate $candidate): JsonResponse
    {
        $validated = $request->validate([
            'job_id' => 'required|exists:job_positions,id'
        ]);

        $job = Job::findOrFail($validated['job_id']);

        // Verifica se a vaga está ativa
        if (!$job->is_active) {
            return response()->json([
                'message' => 'Esta vaga não está aceitando candidaturas no momento'
            ], 422);
        }

        // Verifica se já está aplicado
        if ($candidate->jobs()->where('job_id', $job->id)->exists()) {
            return response()->json([
                'message' => 'Candidato já está aplicado para esta vaga'
            ], 422);
        }

        $candidate->jobs()->attach($job->id);

        return response()->json([
            'message' => 'Candidatura realizada com sucesso'
        ]);
    }

    public function downloadResume(Candidate $candidate): JsonResponse
    {
        if (!$candidate->resume_path || !Storage::disk('public')->exists($candidate->resume_path)) {
            return response()->json([
                'message' => 'Currículo não encontrado'
            ], 404);
        }

        $url = Storage::disk('public')->url($candidate->resume_path);
        return response()->json(['url' => $url]);
    }
} 
