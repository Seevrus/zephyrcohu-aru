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
        Schema::table('receipt_expiration', function (Blueprint $table) {
            $table->foreign('receipt_id')->references('id')->on('receipts')->cascadeOnDelete()->cascadeOnUpdate();
            $table->foreign('expiration_id')->references('id')->on('expirations')->cascadeOnDelete()->cascadeOnUpdate();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('receipt_expiration', function (Blueprint $table) {
            //
        });
    }
};
