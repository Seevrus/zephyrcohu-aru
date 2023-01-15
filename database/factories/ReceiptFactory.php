<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Receipt>
 */
class ReceiptFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $user_ids = User::all()->pluck('id')->toArray();

        return [
            'user_id' => fake()->randomElement($user_ids),
            'round_id' => fake()->numberBetween(1, 20),
            'client_id' => fake()->numberBetween(1, 50),
            'receipt_nr' => fake()->numerify('#####/23'),
            'last_downloaded_at' => mt_rand(0, 99) < 20 ? null : fake()->dateTimeInInterval('-1 week', '+3 days')
        ];
    }
}
