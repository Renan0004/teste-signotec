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
            \Log::info('Iniciando criação de candidato');
            \Log::info('Dados recebidos: ' . json_encode($request->all()));
            
            // Validação simplificada
            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email',
                'phone' => 'required|string|max:20',
                'resume' => 'nullable|file|mimes:pdf,doc,docx|max:5120', // Currículo opcional
                'bio' => 'nullable|string',
                'linkedin_url' => 'nullable|string', // URL não obrigatória
                'experiences' => 'nullable|string',
                'job_ids' => 'required|array',
                'job_ids.*' => 'exists:jobs,id'
            ]);

            \Log::info('Validação concluída com sucesso');
            
            // Criar dados do candidato
            $candidateData = [
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'],
                'linkedin_url' => $request->input('linkedin_url'),
                'bio' => $request->input('bio')
            ];

            // Processar experiências se fornecidas
            if ($request->has('experiences')) {
                try {
                    \Log::info('Processando experiências: ' . $request->input('experiences'));
                    $experiences = json_decode($request->input('experiences'), true);
                    
                    if (is_array($experiences)) {
                        // Verifica e limpa cada experiência para garantir que não haja problemas com datas
                        foreach ($experiences as $key => $exp) {
                            // Garantir que todos os campos sejam strings para evitar problemas de SQL
                            $experiences[$key]['company'] = (string)($exp['company'] ?? '');
                            $experiences[$key]['position'] = (string)($exp['position'] ?? '');
                            $experiences[$key]['description'] = (string)($exp['description'] ?? '');
                            $experiences[$key]['period'] = (string)($exp['period'] ?? '');
                        }
                        
                        // Armazena como string JSON válida
                        $candidateData['experiences'] = json_encode($experiences);
                        \Log::info('Experiências processadas com sucesso: ' . json_encode($experiences));
                    } else {
                        \Log::warning('Experiências não são um array válido');
                        $candidateData['experiences'] = json_encode([]);
                    }
                } catch (\Exception $e) {
                    \Log::error('Erro ao decodificar experiências: ' . $e->getMessage());
                    \Log::error($e->getTraceAsString());
                    $candidateData['experiences'] = json_encode([]);
                }
            }

            // Upload do currículo se fornecido
            if ($request->hasFile('resume')) {
                $path = $request->file('resume')->store('resumes', 'public');
                $candidateData['resume_path'] = $path;
            }

            \Log::info('Dados do candidato processados: ' . json_encode($candidateData));
            $candidate = Candidate::create($candidateData);
            \Log::info('Candidato criado com ID: ' . $candidate->id);

            // Vincula as vagas selecionadas
            if ($request->has('job_ids')) {
                $candidate->jobs()->attach($request->input('job_ids'));
                \Log::info('Vagas vinculadas: ' . json_encode($request->input('job_ids')));
            }

            return response()->json([
                'message' => 'Candidato criado com sucesso',
                'candidate' => $candidate
            ], 201);
        } catch (\Exception $e) {
            \Log::error('Erro ao criar candidato: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
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
                'phone' => ['sometimes', 'required', 'string', 'max:20', 'regex:/^\(\d{2}\)\s\d{5}-\d{4}$/'],
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
    public function destroy($id): JsonResponse
    {
        try {
            \Log::info('Método destroy chamado com ID: ' . $id);
            
            if (is_null($id)) {
                \Log::error('ID nulo recebido no método destroy');
                return response()->json([
                    'message' => 'ID do candidato não fornecido',
                    'error' => 'ID não encontrado na requisição'
                ], 400);
            }
            
            $candidate = Candidate::find($id);
            
            if (!$candidate) {
                \Log::error('Candidato não encontrado com ID: ' . $id);
                return response()->json([
                    'message' => 'Candidato não encontrado',
                    'error' => 'Registro inexistente'
                ], 404);
            }
            
            \Log::info('Excluindo candidato: ' . $candidate->id . ' - ' . $candidate->name);
            
            if ($candidate->resume_path) {
                Storage::disk('public')->delete($candidate->resume_path);
            }
            
            $candidate->delete();
            \Log::info('Candidato excluído com sucesso: ' . $id);
            
            return response()->json(['message' => 'Candidato excluído com sucesso']);
        } catch (\Exception $e) {
            \Log::error('Erro ao excluir candidato: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
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

            if ($job->status !== 'aberta') {
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

    // Método para lidar com requisições POST para update ou delete
    public function updateOrDestroy(Request $request, $candidateId): JsonResponse
    {
        try {
            \Log::info('Iniciando updateOrDestroy para candidato ID: ' . $candidateId);
            \Log::info('Dados da requisição: ' . json_encode($request->all()));
            
            // Garantir que temos um ID válido
            if (!is_numeric($candidateId)) {
                \Log::error('ID de candidato inválido: ' . $candidateId);
                return response()->json([
                    'message' => 'ID de candidato inválido',
                    'error' => 'ID deve ser um número'
                ], 400);
            }
            
            $candidate = Candidate::find($candidateId);
            
            if (!$candidate) {
                \Log::error('Candidato não encontrado com ID: ' . $candidateId);
                return response()->json([
                    'message' => 'Candidato não encontrado',
                    'error' => 'Registro inexistente'
                ], 404);
            }
            
            // Verificar se é uma requisição de exclusão
            if ($request->input('_method') === 'DELETE') {
                \Log::info('Processando exclusão do candidato ID: ' . $candidateId);
                
                if ($candidate->resume_path) {
                    Storage::disk('public')->delete($candidate->resume_path);
                }
                $candidate->delete();
                \Log::info('Candidato excluído com sucesso: ' . $candidateId);
                return response()->json(['message' => 'Candidato excluído com sucesso']);
            }
            // Verificar se é uma requisição de atualização
            else {
                // Validação dos dados - simplificada
                $validated = $request->validate([
                    'name' => 'sometimes|required|string|max:255',
                    'email' => ['sometimes', 'required', 'email', Rule::unique('candidates')->ignore($candidate->id)],
                    'phone' => 'sometimes|required|string|max:20', // Removida validação de regex
                    'resume' => 'nullable|file|mimes:pdf,doc,docx|max:5120', 
                    'bio' => 'nullable|string',
                    'experiences' => 'nullable|string',
                    'linkedin_url' => 'nullable|string', // URL não obrigatória
                    'job_ids' => 'nullable|array',
                    'job_ids.*' => 'exists:jobs,id'
                ]);

                \Log::info('Validação concluída com sucesso');

                // Processar experiências se fornecidas
                if (isset($validated['experiences'])) {
                    try {
                        \Log::info('Processando experiências: ' . $validated['experiences']);
                        $experiences = json_decode($validated['experiences'], true);
                        
                        if (is_array($experiences)) {
                            // Verifica e limpa cada experiência para garantir que não haja problemas com datas
                            foreach ($experiences as $key => $exp) {
                                // Garantir que todos os campos sejam strings para evitar problemas de SQL
                                $experiences[$key]['company'] = (string)($exp['company'] ?? '');
                                $experiences[$key]['position'] = (string)($exp['position'] ?? '');
                                $experiences[$key]['description'] = (string)($exp['description'] ?? '');
                                $experiences[$key]['period'] = (string)($exp['period'] ?? '');
                            }
                            
                            // Armazena como string JSON válida
                            $validated['experiences'] = json_encode($experiences);
                            \Log::info('Experiências processadas com sucesso: ' . json_encode($experiences));
                        } else {
                            \Log::warning('Experiências não são um array válido');
                            $validated['experiences'] = json_encode([]);
                            unset($validated['experiences']); // Remove se não for um array válido
                        }
                    } catch (\Exception $e) {
                        \Log::error('Erro ao decodificar experiências: ' . $e->getMessage());
                        \Log::error($e->getTraceAsString());
                        $validated['experiences'] = json_encode([]);
                        unset($validated['experiences']); // Remove em caso de erro
                    }
                }

                // Upload do currículo
                if ($request->hasFile('resume')) {
                    if ($candidate->resume_path) {
                        Storage::disk('public')->delete($candidate->resume_path);
                    }
                    $path = $request->file('resume')->store('resumes', 'public');
                    $validated['resume_path'] = $path;
                }

                $candidate->update($validated);
                \Log::info('Candidato atualizado com sucesso: ' . $candidateId);

                // Atualizar vagas associadas
                if (isset($validated['job_ids'])) {
                    $candidate->jobs()->sync($validated['job_ids']);
                    \Log::info('Vagas atualizadas: ' . json_encode($validated['job_ids']));
                }

                return response()->json([
                    'message' => 'Candidato atualizado com sucesso',
                    'candidate' => $candidate->fresh()
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Erro ao processar requisição: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([
                'message' => 'Erro ao processar requisição',
                'error' => $e->getMessage()
            ], 500);
        }
    }
} 
