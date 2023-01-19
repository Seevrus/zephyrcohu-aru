<?php

namespace Database\Factories;

use App\Models\Transaction;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Purchase>
 */
class PurchaseFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $transaction_ids = Transaction::all()->pluck('id')->toArray();

        return [
            'transaction_id' => fake()->randomElement($transaction_ids),
            'expires_at' => fake()->dateTimeInInterval('+3 months', '+3 months'),
            'quantity' => fake()->numberBetween(1, 20),
            'item_amount' => fake()->numberBetween(1000, 20000),
        ];
    }
}
