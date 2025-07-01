<?php

namespace App\Http\Controllers;

use App\Models\Job;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class JobController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = $request->input('per_page', 20);
        $query = Job::query();

        // Filtros
        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                  ->orWhere('company', 'like', "%{$search}%")
                  ->orWhere('location', 'like', "%{$search}%");
            });
        }

        if ($request->has('contract_type')) {
            $query->where('contract_type', $request->input('contract_type'));
        }

        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        // Ordenação
        $sortField = $request->input('sort_by', 'created_at');
        $sortDirection = $request->input('sort_direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        $jobs = $query->paginate($perPage);
        return response()->json($jobs);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'company' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'contract_type' => ['required', Rule::in(['CLT', 'PJ', 'FREELANCER'])],
            'is_active' => 'boolean'
        ]);

        $job = Job::create($validated);
        return response()->json($job, 201);
    }

    public function show(Job $job): JsonResponse
    {
        return response()->json($job);
    }

    public function update(Request $request, Job $job): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'string|max:255',
            'description' => 'string',
            'company' => 'string|max:255',
            'location' => 'string|max:255',
            'contract_type' => Rule::in(['CLT', 'PJ', 'FREELANCER']),
            'is_active' => 'boolean'
        ]);

        $job->update($validated);
        return response()->json($job);
    }

    public function destroy(Request $request, $ids = null): JsonResponse
    {
        // Deleção em massa
        if ($request->has('ids')) {
            $ids = explode(',', $request->input('ids'));
            Job::whereIn('id', $ids)->delete();
            return response()->json(['message' => 'Vagas deletadas com sucesso']);
        }

        // Deleção única
        $job = Job::findOrFail($ids);
        $job->delete();
        return response()->json(['message' => 'Vaga deletada com sucesso']);
    }
} 