<?php

use App\Models\Item;
use App\Models\PriceList;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('item_pricelist', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Item::class)->references('id')->on('items')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignIdFor(PriceList::class)->references('id')->on('price_lists')->cascadeOnUpdate()->cascadeOnDelete();
            $table->integer('net_price')->unsigned();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('item_pricelist');
    }
};
