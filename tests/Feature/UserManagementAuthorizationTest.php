<?php

use App\Models\User;

test('non-admin users cannot access user management', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->get(route('usermanagement.index'))
        ->assertForbidden();
});
