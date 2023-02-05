<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Item>
 */
class ItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $company_ids = Company::all()->pluck('id')->toArray();

        return [
            'company_id' => fake()->randomElement($company_ids),
            'article_number' => fake()->unique()->numerify('################'),
            'name' => fake()->word(),
            'short_name' => fake()->lexify('??????????'),
            'category' => fake()->word(),
            'unit_name' => fake()->lexify('??????'),
            'product_catalog_code' => fake()->lexify('???????????'),
            'vat_rate' => fake()->numerify('##'),
            'price' => fake()->randomFloat(2, 1000, 20000),
        ];
    }
}
