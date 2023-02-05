<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Store>
 */
class StoreFactory extends Factory
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
            'code' => fake()->unique()->numerify('####'),
            'name' => fake()->word(),
            'first_available_serial_number' => fake()->numberBetween(10000, 99999),
            'last_available_serial_number' => fake()->numberBetween(10000, 99999),
            'year_code' => fake()->numberBetween(10, 99),
        ];
    }
}
