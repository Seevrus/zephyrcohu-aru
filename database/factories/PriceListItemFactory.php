<?php

namespace Database\Factories;

use App\Models\Item;
use App\Models\PriceList;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PriceListItem>
 */
class PriceListItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $price_list_ids = PriceList::all()->pluck('id')->toArray();
        $item_ids = Item::all()->pluck('id')->toArray();

        return [
            'price_list_id' => fake()->randomElement($price_list_ids),
            'item_id' => fake()->randomElement($item_ids),
            'price' => fake()->randomFloat(2, 1000, 20000),
        ];
    }
}
