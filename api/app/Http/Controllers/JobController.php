<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;

/**
 * @OA\Tag(
 *     name="Jobs",
 *     description="API Endpoints de vagas"
 * )
 */
class JobController extends Controller
{
    /**
     * @OA\Get(
     *     path="/api/jobs",
     *     summary="Listar todas as vagas",
     *     tags={"Jobs"},
     *     @OA\Parameter(
     *         name="status",
     *         in="query",
     *         description="Filtrar por status",
     *         @OA\Schema(type="string", enum={"aberta", "fechada", "em_andamento", "all"})
     *     ),
     *     @OA\Parameter(
     *         name="type",
     *         in="query",
     *         description="Filtrar por tipo",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="search",
     *         in="query",
     *         description="Termo de busca",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="sort_by",
     *         in="query",
     *         description="Campo para ordenação",
     *         @OA\Schema(type="string")
     *     ),
     *     @OA\Parameter(
     *         name="sort_direction",
     *         in="query",
     *         description="Direção da ordenação",
     *         @OA\Schema(type="string", enum={"asc", "desc"})
     *     ),
     *     @OA\Parameter(
     *         name="per_page",
     *         in="query",
     *         description="Itens por página",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de vagas"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Erro ao buscar vagas"
     *     ),
     *     security={{"sanctum":{}}}
     * )
     */
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

    /**
     * @OA\Post(
     *     path="/api/jobs",
     *     summary="Criar uma nova vaga",
     *     tags={"Jobs"},
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title", "description", "company", "location", "status", "type", "requirements"},
     *             @OA\Property(property="title", type="string", example="Desenvolvedor PHP"),
     *             @OA\Property(property="description", type="string", example="Vaga para desenvolvedor PHP"),
     *             @OA\Property(property="company", type="string", example="SignoTech"),
     *             @OA\Property(property="location", type="string", example="São Paulo"),
     *             @OA\Property(property="status", type="string", enum={"aberta", "fechada", "em_andamento"}, example="aberta"),
     *             @OA\Property(property="type", type="string", example="full_time"),
     *             @OA\Property(property="requirements", type="string", example="[\"PHP\", \"Laravel\", \"MySQL\"]"),
     *             @OA\Property(property="benefits", type="string", example="[\"VR\", \"VT\", \"Plano de saúde\"]")
     *         )
     *     ),
     *     @OA\Response(
     *         response=201,
     *         description="Vaga criada com sucesso"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erro de validação"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Erro ao criar vaga"
     *     ),
     *     security={{"sanctum":{}}}
     * )
     */
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

    /**
     * @OA\Get(
     *     path="/api/jobs/{job}",
     *     summary="Obter detalhes de uma vaga",
     *     tags={"Jobs"},
     *     @OA\Parameter(
     *         name="job",
     *         in="path",
     *         required=true,
     *         description="ID da vaga",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Detalhes da vaga"
     *     ),
     *     @OA\Response(
     *         response=404,
     *         description="Vaga não encontrada"
     *     ),
     *     security={{"sanctum":{}}}
     * )
     */
    public function show(Job $job): JsonResponse
    {
        return response()->json($job);
    }

    /**
     * @OA\Put(
     *     path="/api/jobs/{job}",
     *     summary="Atualizar uma vaga",
     *     tags={"Jobs"},
     *     @OA\Parameter(
     *         name="job",
     *         in="path",
     *         required=true,
     *         description="ID da vaga",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             required={"title", "description", "company", "location", "status", "type", "requirements"},
     *             @OA\Property(property="title", type="string"),
     *             @OA\Property(property="description", type="string"),
     *             @OA\Property(property="company", type="string"),
     *             @OA\Property(property="location", type="string"),
     *             @OA\Property(property="status", type="string", enum={"aberta", "fechada", "em_andamento"}),
     *             @OA\Property(property="type", type="string"),
     *             @OA\Property(property="requirements", type="string"),
     *             @OA\Property(property="benefits", type="string")
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Vaga atualizada com sucesso"
     *     ),
     *     @OA\Response(
     *         response=422,
     *         description="Erro de validação"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Erro ao atualizar vaga"
     *     ),
     *     security={{"sanctum":{}}}
     * )
     */
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

    /**
     * @OA\Delete(
     *     path="/api/jobs/{job}",
     *     summary="Excluir uma vaga",
     *     tags={"Jobs"},
     *     @OA\Parameter(
     *         name="job",
     *         in="path",
     *         required=true,
     *         description="ID da vaga",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Vaga excluída com sucesso"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Erro ao excluir vaga"
     *     ),
     *     security={{"sanctum":{}}}
     * )
     */
    public function destroy(Request $request): JsonResponse
    {
        try {
            // Verificar se é uma requisição POST com _method=DELETE
            $isMethodSpoofing = $request->isMethod('post') && $request->input('_method') === 'DELETE';
            
            // Deleção em massa
            if ($request->has('ids') || ($isMethodSpoofing && $request->has('ids'))) {
                $ids = $request->has('ids') ? explode(',', $request->input('ids')) : [];
                Job::whereIn('id', $ids)->delete();
                return response()->json(['message' => 'Vagas excluídas com sucesso']);
            }

            // Deleção única
            $jobId = $request->route('job');
            $job = Job::findOrFail($jobId);
            $job->delete();
            return response()->json(['message' => 'Vaga excluída com sucesso']);
        } catch (\Exception $e) {
            \Log::error('Erro ao excluir vaga: ' . $e->getMessage());
            \Log::error($e->getTraceAsString());
            
            return response()->json([
                'message' => 'Erro ao excluir vaga',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * @OA\Get(
     *     path="/api/jobs/{job}/candidates",
     *     summary="Listar candidatos de uma vaga",
     *     tags={"Jobs"},
     *     @OA\Parameter(
     *         name="job",
     *         in="path",
     *         required=true,
     *         description="ID da vaga",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista de candidatos"
     *     ),
     *     security={{"sanctum":{}}}
     * )
     */
    public function candidates(Job $job): JsonResponse
    {
        return response()->json($job->candidates()->paginate(20));
    }

    /**
     * @OA\Get(
     *     path="/api/jobs/{job}/candidates/all",
     *     summary="Listar todos os candidatos de uma vaga",
     *     tags={"Jobs"},
     *     @OA\Parameter(
     *         name="job",
     *         in="path",
     *         required=true,
     *         description="ID da vaga",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Lista completa de candidatos"
     *     ),
     *     security={{"sanctum":{}}}
     * )
     */
    public function getCandidatesForJob(Job $job): JsonResponse
    {
        $candidates = $job->candidates()->get();
        return response()->json($candidates);
    }

    /**
     * @OA\Post(
     *     path="/api/jobs/{jobId}",
     *     summary="Atualizar ou excluir uma vaga via POST",
     *     tags={"Jobs"},
     *     @OA\Parameter(
     *         name="jobId",
     *         in="path",
     *         required=true,
     *         description="ID da vaga",
     *         @OA\Schema(type="integer")
     *     ),
     *     @OA\RequestBody(
     *         required=true,
     *         @OA\JsonContent(
     *             @OA\Property(property="_method", type="string", enum={"PUT", "DELETE"})
     *         )
     *     ),
     *     @OA\Response(
     *         response=200,
     *         description="Operação realizada com sucesso"
     *     ),
     *     @OA\Response(
     *         response=405,
     *         description="Método não suportado"
     *     ),
     *     @OA\Response(
     *         response=500,
     *         description="Erro ao processar requisição"
     *     ),
     *     security={{"sanctum":{}}}
     * )
     */
    public function updateOrDestroy(Request $request, $jobId): JsonResponse
    {
        try {
            // Verificar se é uma requisição de exclusão
            if ($request->input('_method') === 'DELETE') {
                // Deleção única
                $job = Job::findOrFail($jobId);
                $job->delete();
                return response()->json(['message' => 'Vaga excluída com sucesso']);
            }
            // Verificar se é uma requisição de atualização
            else if ($request->input('_method') === 'PUT') {
                $job = Job::findOrFail($jobId);
                
                $validator = Validator::make($request->all(), [
                    'title' => 'required|string|max:255',
                    'description' => 'required|string',
                    'company' => 'required|string|max:255',
                    'location' => 'required|string|max:255',
                    'status' => 'required|in:aberta,fechada,em_andamento',
                    'type' => 'required|string|max:255',
                    'requirements' => 'required|string',
                    'benefits' => 'nullable|string'
                ]);

                if ($validator->fails()) {
                    return response()->json([
                        'message' => 'Erro de validação',
                        'errors' => $validator->errors()
                    ], 422);
                }

                // Remover o campo _method antes de atualizar
                $data = $request->except('_method');
                $job->update($data);
                
                return response()->json([
                    'message' => 'Vaga atualizada com sucesso',
                    'job' => $job
                ]);
            }
            
            return response()->json(['message' => 'Método não suportado'], 405);
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