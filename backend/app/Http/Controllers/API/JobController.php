<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class JobController extends Controller
{
    /**
     * Exibe uma lista de vagas.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $perPage = $request->input('perPage', 20);
        $query = Job::query()->withCount('candidates');

        // Filtros
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->has('title')) {
            $query->where('title', 'like', "%{$request->title}%");
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('active')) {
            $active = filter_var($request->active, FILTER_VALIDATE_BOOLEAN);
            $query->where('active', $active);
        }

        // Ordenação
        $sortBy = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortBy, $sortDirection);

        $jobs = $query->paginate($perPage);

        return response()->json($jobs);
    }

    /**
     * Armazena uma nova vaga.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'requirements' => 'nullable|string',
            'type' => 'required|string|in:CLT,PJ,FREELANCER',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $job = Job::create($request->all());

        return response()->json($job, 201);
    }

    /**
     * Exibe uma vaga específica.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        $job = Job::with('candidates')->findOrFail($id);

        return response()->json($job);
    }

    /**
     * Atualiza uma vaga específica.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'requirements' => 'nullable|string',
            'type' => 'sometimes|required|string|in:CLT,PJ,FREELANCER',
            'active' => 'boolean',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $job = Job::findOrFail($id);
        $job->update($request->all());

        return response()->json($job);
    }

    /**
     * Remove uma vaga específica.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        $job = Job::findOrFail($id);
        $job->delete();

        return response()->json(null, 204);
    }

    /**
     * Alterna o status de uma vaga (ativa/pausada).
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function toggleStatus($id)
    {
        $job = Job::findOrFail($id);
        $job->active = !$job->active;
        $job->save();

        return response()->json($job);
    }

    /**
     * Remove várias vagas de uma vez.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:jobs,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        Job::whereIn('id', $request->ids)->delete();

        return response()->json(['message' => 'Vagas excluídas com sucesso']);
    }
} 