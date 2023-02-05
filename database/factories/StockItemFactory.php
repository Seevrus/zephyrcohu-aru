<?php

namespace Database\Factories;

use App\Models\Item;
use App\Models\Store;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Stock>
 */
class StockItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $store_ids = Store::all()->pluck('id')->toArray();
        $item_ids = Item::all()->pluck('id')->toArray();

        return [
            'item_id' => fake()->randomElement($item_ids),
            'store_id' => fake()->randomElement($store_ids),
        ];
    }
}
