<?php

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
        Schema::dropIfExists('price_lists');
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::create('price_lists', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Item::class)->references('id')->on('items')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignIdFor(Partner::class)->references('id')->on('partners')->cascadeOnUpdate()->cascadeOnDelete();
            $table->integer('net_price')->unsigned();
        });
    }
};
