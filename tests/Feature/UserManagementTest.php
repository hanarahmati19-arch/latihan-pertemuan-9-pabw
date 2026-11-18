<?php

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Inertia\Testing\AssertableInertia as Assert;

test('admins can view a paginated user list', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->get(route('usermanagement.index'))
        ->assertOk()
        ->assertInertia(fn (Assert $page) => $page
            ->component('UserManagement::index', false)
            ->where('users.data.0.email', $admin->email)
            ->where('users.data.0.role', UserRole::Admin->value),
        );
});

test('admins can create users with a personal team', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->post(route('usermanagement.store'), [
            'name' => 'New Administrator',
            'email' => 'new-admin@example.com',
            'role' => UserRole::Admin->value,
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])
        ->assertRedirect(route('usermanagement.index'));

    $createdUser = User::query()->where('email', 'new-admin@example.com')->firstOrFail();

    expect($createdUser->role)->toBe(UserRole::Admin)
        ->and($createdUser->email_verified_at)->not->toBeNull()
        ->and($createdUser->current_team_id)->not->toBeNull()
        ->and(Hash::check('password123', $createdUser->password))->toBeTrue();
});

test('admins can update a user without changing their password', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create(['email' => 'member@example.com']);
    $originalPassword = $user->password;

    $this->actingAs($admin)
        ->put(route('usermanagement.update', $user), [
            'name' => 'Updated Member',
            'email' => 'member@example.com',
            'role' => UserRole::Admin->value,
        ])
        ->assertRedirect(route('usermanagement.index'));

    expect($user->fresh()->name)->toBe('Updated Member')
        ->and($user->fresh()->role)->toBe(UserRole::Admin)
        ->and($user->fresh()->password)->toBe($originalPassword);
});

test('admins can delete a user and their personal team', function () {
    $admin = User::factory()->admin()->create();
    $user = User::factory()->create();
    $personalTeam = $user->personalTeam();

    $this->actingAs($admin)
        ->delete(route('usermanagement.destroy', $user))
        ->assertRedirect(route('usermanagement.index'));

    $this->assertDatabaseMissing('users', ['id' => $user->id]);
    $this->assertDatabaseMissing('teams', ['id' => $personalTeam->id]);
});

test('the last admin cannot be demoted or deleted', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->put(route('usermanagement.update', $admin), [
            'name' => $admin->name,
            'email' => $admin->email,
            'role' => UserRole::User->value,
        ])
        ->assertForbidden();

    $this->actingAs($admin)
        ->delete(route('usermanagement.destroy', $admin))
        ->assertForbidden();

    expect($admin->fresh()->role)->toBe(UserRole::Admin);
});
