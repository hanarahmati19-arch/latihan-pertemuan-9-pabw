<?php

use App\Models\User;
use Modules\Pendaftaran\Models\Pendaftaran;

test('only admins can access pendaftaran ajax endpoints', function () {
    $user = User::factory()->create();

    $this->actingAs($user)
        ->getJson(route('pendaftaran.data'))
        ->assertForbidden();
});

test('admins can create list update and delete registrations with json requests', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->postJson(route('pendaftaran.store'), [
            'name' => 'Ayu Pratama',
            'email' => 'ayu@example.com',
            'phone' => '+628123456789',
        ])
        ->assertCreated()
        ->assertJsonPath('data.name', 'Ayu Pratama');

    $registration = Pendaftaran::query()->where('email', 'ayu@example.com')->firstOrFail();

    $this->getJson(route('pendaftaran.data'))
        ->assertOk()
        ->assertJsonPath('data.0.email', 'ayu@example.com');

    $this->putJson(route('pendaftaran.update', $registration), [
        'name' => 'Ayu Updated',
        'email' => 'ayu@example.com',
        'phone' => '+628123456700',
    ])
        ->assertOk()
        ->assertJsonPath('data.name', 'Ayu Updated');

    $this->assertDatabaseHas('pendaftarans', [
        'id' => $registration->id,
        'name' => 'Ayu Updated',
        'phone' => '+628123456700',
    ]);

    $this->deleteJson(route('pendaftaran.destroy', $registration))
        ->assertOk()
        ->assertJsonPath('message', 'Registration deleted.');

    $this->assertDatabaseMissing('pendaftarans', ['id' => $registration->id]);
});

test('registration validation errors are returned as json', function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)
        ->postJson(route('pendaftaran.store'), [])
        ->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'email', 'phone']);
});
