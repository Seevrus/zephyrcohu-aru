<?php

use App\Models\PriceList;
use App\Models\Store;
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
        Schema::table('partners', function (Blueprint $table) {
            $table->foreign('company_id')->references('id')->on('companies')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreignIdFor(Store::class)->nullable()->change();
            $table->foreign('store_id')->references('id')->on('stores')->onDelete('set null')->cascadeOnUpdate();
            $table->foreign('price_list_id')->references('id')->on('price_lists')->onDelete('set null')->cascadeOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('partners', function (Blueprint $table) {
            //
        });
    }
};
