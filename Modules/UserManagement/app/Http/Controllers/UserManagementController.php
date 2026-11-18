<?php

namespace Modules\UserManagement\Http\Controllers;

use App\Actions\Teams\CreateTeam;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class UserManagementController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request): Response
    {
        $users = User::query()
            ->select(['id', 'name', 'email', 'role', 'created_at'])
            ->latest('id')
            ->paginate(10)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role->value,
                'roleLabel' => $user->role->label(),
                'createdAt' => $user->created_at?->toISOString(),
            ]);

        return Inertia::render('UserManagement::index', [
            'users' => $users,
            'currentUserId' => $request->user()->id,
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): Response
    {
        return Inertia::render('UserManagement::create', [
            'roles' => $this->roles(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request, CreateTeam $createTeam): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'role' => ['required', Rule::enum(UserRole::class)],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = DB::transaction(function () use ($createTeam, $validated): User {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'role' => UserRole::from($validated['role']),
                'password' => $validated['password'],
            ]);

            $user->markEmailAsVerified();
            $createTeam->handle($user, "{$user->name}'s Team", isPersonal: true);

            return $user;
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User created.']);

        return to_route('usermanagement.index');
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(User $usermanagement): Response
    {
        return Inertia::render('UserManagement::edit', [
            'user' => [
                'id' => $usermanagement->id,
                'name' => $usermanagement->name,
                'email' => $usermanagement->email,
                'role' => $usermanagement->role->value,
            ],
            'roles' => $this->roles(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $usermanagement): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($usermanagement)],
            'role' => ['required', Rule::enum(UserRole::class)],
            'password' => ['nullable', 'string', 'min:8', 'confirmed'],
        ]);

        $newRole = UserRole::from($validated['role']);

        abort_if(
            $usermanagement->is($request->user()) && $newRole !== $usermanagement->role,
            403,
        );
        abort_if(
            $usermanagement->isAdmin() &&
            $newRole !== UserRole::Admin &&
            User::query()->where('role', UserRole::Admin->value)->count() <= 1,
            403,
        );

        if (($validated['password'] ?? null) === null) {
            unset($validated['password']);
        }

        $usermanagement->update($validated);

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User updated.']);

        return to_route('usermanagement.index');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Request $request, User $usermanagement): RedirectResponse
    {
        abort_if($request->user()->is($usermanagement), 403);
        abort_if(
            $usermanagement->isAdmin() &&
            User::query()->where('role', UserRole::Admin->value)->count() <= 1,
            403,
        );
        abort_if(
            $usermanagement->ownedTeams()->where('is_personal', false)->exists(),
            409,
            'Users who own a shared team cannot be deleted.',
        );

        $personalTeam = $usermanagement->personalTeam();

        DB::transaction(function () use ($personalTeam, $usermanagement): void {
            $personalTeam?->forceDelete();
            $usermanagement->delete();
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'User deleted.']);

        return to_route('usermanagement.index');
    }

    /**
     * Get the available user roles.
     *
     * @return array<array{value: string, label: string}>
     */
    private function roles(): array
    {
        return array_map(
            fn (UserRole $role) => ['value' => $role->value, 'label' => $role->label()],
            UserRole::cases(),
        );
    }
}
