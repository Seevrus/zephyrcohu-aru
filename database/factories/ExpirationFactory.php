<?php

namespace Database\Factories;

use App\Models\StockItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Expiration>
 */
class ExpirationFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $stock_item_ids = StockItem::all()->pluck('id')->toArray();

        return [
            'stock_item_id' => fake()->randomElement($stock_item_ids),
            'expires_at' => fake()->dateTimeInInterval('+3 months', '+1 year'),
            'quantity' => fake()->numberBetween(100, 1000),
        ];
    }
}
