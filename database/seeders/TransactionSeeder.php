<?php

namespace Database\Seeders;

use App\Models\Transaction;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class TransactionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Transaction::factory()
            ->count(10000)
            ->hasOrder(1)
            ->hasPurchases(2)
            ->create();

        Transaction::factory()
            ->count(5000)
            ->hasPurchases(3)
            ->create();

        Transaction::factory()
            ->count(5000)
            ->hasOrder(1)
            ->hasPurchases(1)
            ->create();

        Transaction::factory()
            ->count(10000)
            ->hasPurchases(1)
            ->create();
    }
}