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
        try {
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
            $page = $request->input('page', 1);
            $candidates = $query->paginate($perPage, ['*'], 'page', $page);

            return response()->json($candidates);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao buscar candidatos',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Criar um novo candidato
    public function store(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'required|string|max:255|min:3',
                'email' => 'required|email:rfc,dns|unique:candidates',
                'phone' => ['required', 'string', 'max:20', 'regex:/^\+?[1-9]\d{1,14}$/'],
                'resume' => 'required|file|mimes:pdf|max:5120', // max 5MB
                'bio' => 'nullable|string|max:1000',
                'skills' => 'nullable|array|min:1',
                'skills.*' => 'required|string|max:50',
                'linkedin_url' => ['nullable', 'url', 'regex:/^https:\/\/(www\.)?linkedin\.com\/.*$/'],
                'github_url' => ['nullable', 'url', 'regex:/^https:\/\/(www\.)?github\.com\/.*$/'],
                'portfolio_url' => 'nullable|url',
                'job_ids' => 'nullable|array',
                'job_ids.*' => 'exists:jobs,id'
            ], [
                'name.required' => 'O nome é obrigatório',
                'name.min' => 'O nome deve ter pelo menos 3 caracteres',
                'name.max' => 'O nome não pode ter mais que 255 caracteres',
                'email.required' => 'O e-mail é obrigatório',
                'email.email' => 'Digite um e-mail válido',
                'email.unique' => 'Este e-mail já está cadastrado',
                'phone.required' => 'O telefone é obrigatório',
                'phone.regex' => 'O telefone deve estar em um formato válido',
                'resume.required' => 'O currículo é obrigatório',
                'resume.mimes' => 'O currículo deve estar em formato PDF',
                'resume.max' => 'O currículo não pode ter mais que 5MB',
                'bio.max' => 'A bio não pode ter mais que 1000 caracteres',
                'skills.min' => 'Informe pelo menos uma habilidade',
                'skills.*.required' => 'A habilidade é obrigatória',
                'skills.*.max' => 'A habilidade não pode ter mais que 50 caracteres',
                'linkedin_url.url' => 'O URL do LinkedIn deve ser válido',
                'linkedin_url.regex' => 'O URL do LinkedIn deve ser válido',
                'github_url.url' => 'O URL do GitHub deve ser válido',
                'github_url.regex' => 'O URL do GitHub deve ser válido',
                'portfolio_url.url' => 'O URL do portfólio deve ser válido',
                'job_ids.*.exists' => 'Uma ou mais vagas selecionadas não existem'
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
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao criar candidato',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Mostrar um candidato específico
    public function show(Candidate $candidate): JsonResponse
    {
        try {
            return response()->json($candidate->load('jobs'));
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao buscar candidato',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Atualizar um candidato existente
    public function update(Request $request, Candidate $candidate): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'email' => ['sometimes', 'required', 'email', Rule::unique('candidates')->ignore($candidate->id)],
                'phone' => 'sometimes|required|string|max:20',
                'resume' => 'sometimes|file|mimes:pdf|max:5120',
                'bio' => 'nullable|string',
                'skills' => 'nullable|array',
                'linkedin_url' => 'nullable|url',
                'github_url' => 'nullable|url',
                'portfolio_url' => 'nullable|url',
                'job_ids' => 'nullable|array',
                'job_ids.*' => 'exists:jobs,id'
            ]);

            if ($request->hasFile('resume')) {
                if ($candidate->resume_path) {
                    Storage::disk('public')->delete($candidate->resume_path);
                }
                $path = $request->file('resume')->store('resumes', 'public');
                $validated['resume_path'] = $path;
            }

            $candidate->update($validated);

            if (isset($validated['job_ids'])) {
                $candidate->jobs()->sync($validated['job_ids']);
            }

            return response()->json($candidate->fresh());
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao atualizar candidato',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Deletar um candidato
    public function destroy(Request $request): JsonResponse
    {
        try {
            if ($request->has('ids')) {
                $ids = explode(',', $request->input('ids'));
                $candidates = Candidate::whereIn('id', $ids)->get();
                
                foreach ($candidates as $candidate) {
                    if ($candidate->resume_path) {
                        Storage::disk('public')->delete($candidate->resume_path);
                    }
                }
                
                Candidate::whereIn('id', $ids)->delete();
                return response()->json(['message' => 'Candidatos excluídos com sucesso']);
            }

            $candidate = Candidate::findOrFail($request->route('id'));
            
            if ($candidate->resume_path) {
                Storage::disk('public')->delete($candidate->resume_path);
            }
            
            $candidate->delete();
            return response()->json(['message' => 'Candidato excluído com sucesso']);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao excluir candidato(s)',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    // Aplicar para uma vaga
    public function applyToJob(Request $request, Candidate $candidate): JsonResponse
    {
        try {
            $validated = $request->validate([
                'job_id' => 'required|exists:jobs,id'
            ]);

            $job = Job::findOrFail($validated['job_id']);

            if ($job->status !== 'active') {
                return response()->json([
                    'message' => 'Esta vaga não está aceitando candidaturas no momento'
                ], 422);
            }

            if ($candidate->jobs()->where('job_id', $job->id)->exists()) {
                return response()->json([
                    'message' => 'Candidato já está aplicado para esta vaga'
                ], 422);
            }

            $candidate->jobs()->attach($job->id);

            return response()->json([
                'message' => 'Candidatura realizada com sucesso'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao aplicar para vaga',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function downloadResume(Candidate $candidate): JsonResponse
    {
        try {
            if (!$candidate->resume_path || !Storage::disk('public')->exists($candidate->resume_path)) {
                return response()->json([
                    'message' => 'Currículo não encontrado'
                ], 404);
            }

            $url = Storage::disk('public')->url($candidate->resume_path);
            return response()->json(['url' => $url]);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erro ao baixar currículo',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 
