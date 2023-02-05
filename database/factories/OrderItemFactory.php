<?php

namespace Database\Factories;

use App\Models\Item;
use App\Models\Order;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Model>
 */
class OrderItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $item_ids = Item::all()->pluck('id')->toArray();
        $order_ids = Order::all()->pluck('id')->toArray();

        return [
            'item_id' => fake()->randomElement($item_ids),
            'order_id' => fake()->randomElement($order_ids),
            'quantity' => fake()->numberBetween(1, 100),
        ];
    }
}
