<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Candidate;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CandidateController extends Controller
{
    /**
     * Exibe uma lista de candidatos.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $perPage = $request->input('perPage', 20);
        $query = Candidate::query()->withCount('jobs');

        // Filtros
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->has('name')) {
            $query->where('name', 'like', "%{$request->name}%");
        }

        if ($request->has('email')) {
            $query->where('email', 'like', "%{$request->email}%");
        }

        if ($request->has('job_id')) {
            $query->whereHas('jobs', function ($q) use ($request) {
                $q->where('jobs.id', $request->job_id);
            });
        }

        // Ordenação
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $candidates = $query->paginate($perPage);

        return response()->json($candidates);
    }

    /**
     * Armazena um novo candidato.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:candidates',
            'phone' => 'nullable|string|max:20',
            'resume' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $candidate = Candidate::create($request->all());

        return response()->json($candidate, 201);
    }

    /**
     * Exibe um candidato específico.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $candidate = Candidate::with('jobs')->findOrFail($id);

        return response()->json($candidate);
    }

    /**
     * Atualiza um candidato específico.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $candidate = Candidate::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|string|email|max:255|unique:candidates,email,' . $candidate->id,
            'phone' => 'nullable|string|max:20',
            'resume' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $candidate->update($request->all());

        return response()->json($candidate);
    }

    /**
     * Remove um candidato específico.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $candidate = Candidate::findOrFail($id);
        $candidate->delete();

        return response()->json(null, 204);
    }

    /**
     * Retorna as vagas de um candidato.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function jobs($id)
    {
        $candidate = Candidate::findOrFail($id);
        $jobs = $candidate->jobs;

        return response()->json($jobs);
    }

    /**
     * Inscreve um candidato em uma vaga.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function applyToJob(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'job_id' => 'required|integer|exists:jobs,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $candidate = Candidate::findOrFail($id);
        $job = Job::findOrFail($request->job_id);

        // Verifica se o candidato já está inscrito na vaga
        if ($candidate->jobs()->where('job_id', $job->id)->exists()) {
            return response()->json(['message' => 'Candidato já inscrito nesta vaga'], 422);
        }

        $candidate->jobs()->attach($job->id);

        return response()->json(['message' => 'Candidato inscrito com sucesso']);
    }

    /**
     * Remove um candidato de uma vaga.
     *
     * @param  int  $candidateId
     * @param  int  $jobId
     * @return \Illuminate\Http\Response
     */
    public function removeFromJob($candidateId, $jobId)
    {
        $candidate = Candidate::findOrFail($candidateId);
        $job = Job::findOrFail($jobId);

        $candidate->jobs()->detach($job->id);

        return response()->json(['message' => 'Candidato removido da vaga com sucesso']);
    }

    /**
     * Remove vários candidatos de uma vez.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:candidates,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        Candidate::whereIn('id', $request->ids)->delete();

        return response()->json(['message' => 'Candidatos excluídos com sucesso']);
    }
} 