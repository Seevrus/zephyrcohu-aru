<?php

use App\Models\Expiration;
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
        Schema::create('expiration_store', function (Blueprint $table) {
            $table->foreignIdFor(Expiration::class)->references('id')->on('expirations')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignIdFor(Store::class)->references('id')->on('stores')->cascadeOnUpdate()->cascadeOnDelete();
            $table->smallInteger('quantity')->unsigned();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('expiration_store');
    }
};
