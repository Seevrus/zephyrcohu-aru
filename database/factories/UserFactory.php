<?php

namespace Database\Factories;

use App\Models\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
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
            'phone_number' => fake()->unique()->e164PhoneNumber(),
            'type' => mt_rand(0, 99) < 5 ? 'I' : 'A',
            'device_id' => fake()->uuid(),
            'created_at' => fake()->dateTimeInInterval('-1 months', '+2 weeks'),
            'last_active' => mt_rand(0, 99) < 20 ? null : fake()->dateTimeInInterval('-1 week', '+3 days'),
        ];
    }
}
