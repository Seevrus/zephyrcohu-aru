<?php

namespace Database\Factories;

use App\Models\Item;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\PriceList>
 */
class PriceListFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $item_ids = Item::all()->pluck('id')->toArray();

        return [
            'item_id' => fake()->unique()->randomElement($item_ids),
            'code' => fake()->unique()->numerify('####'),
        ];
    }
}
