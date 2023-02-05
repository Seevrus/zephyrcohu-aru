<?php

namespace Database\Factories;

use App\Models\Partner;
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
        $partner_ids = Partner::all()->pluck('id')->toArray();
        $user_ids = User::all()->pluck('id')->toArray();

        return [
            'partner_id' => fake()->randomElement($partner_ids),
            'user_id' => fake()->randomElement($user_ids),
            'serial_number' => fake()->unique()->numberBetween(10000, 99999),
            'year_code' => fake()->numberBetween(10, 99),
            'total_amount' => fake()->numberBetween(100000, 10000000),
            'created_at' => fake()->dateTimeInInterval('-1 months', '+2 weeks'),
        ];
    }
}
