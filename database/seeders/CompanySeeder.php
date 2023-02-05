<?php

namespace Database\Seeders;

use App\Models\Company;
use App\Models\Expiration;
use App\Models\Item;
use App\Models\Order;
use App\Models\Partner;
use App\Models\PriceList;
use App\Models\PriceListItem;
use App\Models\Receipt;
use App\Models\StockItem;
use App\Models\Store;
use App\Models\User;
use Database\Factories\OrderItemFactory;
use Illuminate\Database\Seeder;

class CompanySeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        Company::factory()->count(1)->create();

        Item::factory()->count(400)->create();
        Store::factory()->count(20)->create();
        User::factory()->count(30)->create();

        Partner::factory()->count(50)->create();
        PriceList::factory()->count(5)->create();

        PriceListItem::factory()->count(400)->create();

        StockItem::factory()->count(5000)->create();
        Expiration::factory()->count(30000)->create();

        Order::factory()->count(400)->hasItems(3)->create();

        Receipt::factory()->count(1000)->hasExpirations(2)->create();
    }
}
