<?php

use App\Models\Expiration;
use App\Models\Receipt;
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
        Schema::create('receipt_expiration', function (Blueprint $table) {
            $table->foreignIdFor(Receipt::class);
            $table->foreignIdFor(Expiration::class);
            $table->primary(['expiration_id', 'receipt_id']);
            $table->smallInteger('quantity', false, true);
            $table->integer('item_amount', false, true);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('expiration_receipt');
    }
};
