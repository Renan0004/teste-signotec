<?php

namespace App\Http\Controllers;

use App\Models\Candidate;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class CandidateController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Candidate::query();

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

        $candidates = $query->paginate(20);
        return response()->json($candidates);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:candidates',
            'phone' => 'required|string|max:20',
            'jobs' => 'array'
        ]);

        $jobs = $validated['jobs'] ?? [];
        unset($validated['jobs']);

        $candidate = Candidate::create($validated);
        
        if (!empty($jobs)) {
            $candidate->jobs()->attach(collect($jobs)->pluck('id'));
        }

        return $candidate->load('jobs');
    }

    public function show(Candidate $candidate): JsonResponse
    {
        return $candidate->load('jobs');
    }

    public function update(Request $request, Candidate $candidate): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:candidates,email,' . $candidate->id,
            'phone' => 'required|string|max:20',
            'jobs' => 'array'
        ]);

        $jobs = $validated['jobs'] ?? [];
        unset($validated['jobs']);

        $candidate->update($validated);
        
        if (isset($jobs)) {
            $candidate->jobs()->sync(collect($jobs)->pluck('id'));
        }

        return $candidate->load('jobs');
    }

    public function destroy(Candidate $candidate): JsonResponse
    {
        $candidate->delete();
        return response()->noContent();
    }

    public function applyForJob(Request $request, Candidate $candidate): JsonResponse
    {
        $validated = $request->validate([
            'job_id' => 'required|exists:jobs,id'
        ]);

        $candidate->jobs()->attach($validated['job_id']);
        return response()->json(['message' => 'Application successful']);
    }
} 