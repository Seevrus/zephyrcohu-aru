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
        Schema::table('stock_item', function (Blueprint $table) {
            $table->foreign('item_id')->references('id')->on('items')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreign('store_id')->references('id')->on('stores')->cascadeOnDelete()->cascadeOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('stock_item', function (Blueprint $table) {
            //
        });
    }
};
