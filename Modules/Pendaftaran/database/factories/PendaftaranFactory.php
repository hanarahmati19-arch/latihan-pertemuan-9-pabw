<?php

namespace Modules\Pendaftaran\Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Modules\Pendaftaran\Models\Pendaftaran;

class PendaftaranFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     */
    protected $model = Pendaftaran::class;

    /**
     * Define the model's default state.
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'phone' => fake()->phoneNumber(),
        ];
    }
}
