<?php

namespace Database\Factories;

use App\Models\Partner;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
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
            'created_at' => fake()->dateTimeInInterval('-1 months', '+2 weeks'),
        ];
    }
}
