<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;

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
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'curriculum' => 'required|file|mimes:pdf,doc,docx|max:10240', // máximo 10MB
        ]);

        $curriculumPath = null;
        if ($request->hasFile('curriculum')) {
            $curriculumPath = $request->file('curriculum')->store('curriculos', 'public');
        }

        $candidate = Candidate::create([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'curriculum_path' => $curriculumPath,
        ]);

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
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'curriculum' => 'nullable|file|mimes:pdf,doc,docx|max:10240',
        ]);

        if ($request->hasFile('curriculum')) {
            // Remove o arquivo antigo se existir
            if ($candidate->curriculum_path) {
                Storage::disk('public')->delete($candidate->curriculum_path);
            }
            $curriculumPath = $request->file('curriculum')->store('curriculos', 'public');
            $candidate->curriculum_path = $curriculumPath;
        }

        $candidate->update([
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
        ]);

        return response()->json($candidate);
    }

    // Deletar um candidato
    public function destroy(Candidate $candidate): JsonResponse
    {
        if ($candidate->curriculum_path) {
            Storage::disk('public')->delete($candidate->curriculum_path);
        }
        $candidate->delete();
        return response()->json(null, 204);
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
