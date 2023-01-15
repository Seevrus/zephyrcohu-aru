<?php

namespace Database\Factories;

use App\Models\Transaction;
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
        $transaction_ids = Transaction::all()->pluck('id')->toArray();

        return [
            'transaction_id' => fake()->randomElement($transaction_ids),
            'amount' => fake()->numberBetween(1, 20),
        ];
    }
}
