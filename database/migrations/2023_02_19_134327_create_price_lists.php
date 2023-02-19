<?php

use App\Models\Item;
use App\Models\Partner;
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
        Schema::create('price_lists', function (Blueprint $table) {
            $table->foreignIdFor(Item::class)->references('id')->on('items')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignIdFor(Partner::class)->references('id')->on('partners')->cascadeOnUpdate()->cascadeOnDelete();
            $table->float('net_price', 18, 5)->unsigned();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('price_lists');
    }
};
