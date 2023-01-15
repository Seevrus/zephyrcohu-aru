<?php

namespace Database\Factories;

use App\Models\Receipt;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class TransactionFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $receipt_ids = Receipt::all()->pluck('id')->toArray();

        return [
            'receipt_id' => fake()->randomElement($receipt_ids),
            'product_id' => fake()->ean13(),
        ];
    }
}
