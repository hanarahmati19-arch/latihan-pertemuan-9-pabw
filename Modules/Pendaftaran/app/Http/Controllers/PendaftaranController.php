<?php

namespace Modules\Pendaftaran\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Modules\Pendaftaran\Models\Pendaftaran;

class PendaftaranController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): Response
    {
        return Inertia::render('Pendaftaran::index');
    }

    /**
     * Return registration records for the AJAX table.
     */
    public function data(): JsonResponse
    {
        return response()->json(Pendaftaran::query()->latest()->paginate(10));
    }

    /**
     * Store a registration through an AJAX request.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:pendaftarans,email'],
            'phone' => ['required', 'string', 'max:30'],
        ]);

        $pendaftaran = Pendaftaran::create($validated);

        return response()->json(['data' => $pendaftaran], 201);
    }

    /**
     * Update a registration through an AJAX request.
     */
    public function update(Request $request, Pendaftaran $pendaftaran): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('pendaftarans', 'email')->ignore($pendaftaran)],
            'phone' => ['required', 'string', 'max:30'],
        ]);

        $pendaftaran->update($validated);

        return response()->json(['data' => $pendaftaran->fresh()]);
    }

    /**
     * Delete a registration through an AJAX request.
     */
    public function destroy(Pendaftaran $pendaftaran): JsonResponse
    {
        $pendaftaran->delete();

        return response()->json(['message' => 'Registration deleted.']);
    }
}
