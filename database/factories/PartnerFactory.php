<?php

namespace Database\Factories;

use App\Models\Company;
use App\Models\PriceList;
use App\Models\Store;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Partner>
 */
class PartnerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition()
    {
        $company_ids = Company::all()->pluck('id')->toArray();
        $store_ids = Store::all()->pluck('id')->toArray();
        $price_list_ids = PriceList::all()->pluck('id')->toArray();

        return [
            'company_id' => fake()->randomElement($company_ids),
            'store_id' => fake()->randomElement($store_ids),
            'price_list_id' => fake()->randomElement($price_list_ids),
            'code' => fake()->unique()->numerify('######'),
            'site_code' => fake()->numerify('####'),
            'name' => fake()->company(),
            'country' => fake()->countryCode(),
            'postal_code' => fake()->numerify('####'),
            'city' => fake()->word(),
            'address' => fake()->text(40),
            'vat_number' => fake()->numerify('########-#-##'),
            'iban' => fake()->lexify(),
            'bank_account' => fake()->numerify('########-########-########'),
            'phone_number' => fake()->e164PhoneNumber(),
            'email' => fake()->companyEmail(),
        ];
    }
}
