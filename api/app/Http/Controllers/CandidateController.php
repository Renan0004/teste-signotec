<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CandidateController extends Controller
{
    // Mostrar todos os candidatos
    public function index(Request $request): JsonResponse
    {
        $query = Candidate::with('jobs');

        if ($request->has('sort')) {
            $sort = $request->get('sort');
            $direction = $request->get('direction', 'asc');
            $query->orderBy($sort, $direction);
        }

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
        }

        $candidates = $query->get();
        return response()->json($candidates);
    }

    // Criar um novo candidato
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:candidates',
            'phone' => 'required|string|max:20',
            'resume' => 'required|string|max:5000',
            'jobs' => 'array'
        ]);

        $jobs = $validated['jobs'] ?? [];
        unset($validated['jobs']);

        $candidate = Candidate::create($validated);
        
        if (!empty($jobs)) {
            $candidate->jobs()->attach(collect($jobs)->pluck('id'));
        }

        return response()->json($candidate->load('jobs'), 201);
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
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:candidates,email,' . $candidate->id,
            'phone' => 'required|string|max:20',
            'resume' => 'required|string|max:5000',
            'jobs' => 'array'
        ]);

        $jobs = $validated['jobs'] ?? [];
        unset($validated['jobs']);

        $candidate->update($validated);
        
        if (isset($jobs)) {
            $candidate->jobs()->sync(collect($jobs)->pluck('id'));
        }

        return response()->json($candidate->load('jobs'));
    }

    // Deletar um candidato
    public function destroy(Candidate $candidate): JsonResponse
    {
        $candidate->delete();
        return response()->noContent();
    }

    // Aplicar para uma vaga
    public function applyForJob(Request $request, Candidate $candidate): JsonResponse
    {
        $validated = $request->validate([
            'job_id' => 'required|exists:job_positions,id'
        ]);

        if ($candidate->jobs()->where('job_position_id', $validated['job_id'])->exists()) {
            return response()->json(['message' => 'Candidate already applied for this job'], 422);
        }

        $candidate->jobs()->attach($validated['job_id']);
        return response()->json(['message' => 'Application successful']);
    }

    // Buscar candidatos aplicados para uma vaga
    public function getCandidatesForJob(JobPosition $job): JsonResponse
    {
        $candidates = $job->candidates()->get();
        return response()->json($candidates);
    }
} 
