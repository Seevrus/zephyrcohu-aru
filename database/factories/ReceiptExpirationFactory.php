<?php

namespace Database\Factories;

use App\Models\Expiration;
use App\Models\Receipt;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class ExpirationReceiptFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $expiration_ids = Expiration::all()->pluck('id')->toArray();
        $receipt_ids = Receipt::all()->pluck('id')->toArray();

        return [
            'expiration_id' => fake()->randomElement($expiration_ids),
            'receipt_id' => fake()->randomElement($receipt_ids),
            'quantity' => fake()->numberBetween(10, 100),
            'item_amount' => fake()->random_int(100000, 1000000),
        ];
    }
}
