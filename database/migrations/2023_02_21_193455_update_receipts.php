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
        Schema::table('receipts', function (Blueprint $table) {
            $table->string('vendor_iban', 4)->nullable()->change();
            $table->string('vendor_bank_account', 26)->nullable()->change();
            $table->string('buyer_iban', 4)->nullable()->change();
            $table->string('buyer_bank_account', 26)->nullable()->change();
            $table->integer('vat_amount')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('receipts', function (Blueprint $table) {
            $table->string('vendor_iban', 4)->change();
            $table->string('vendor_bank_account', 26)->change();
            $table->string('buyer_iban', 4)->change();
            $table->string('buyer_bank_account', 26)->change();
            $table->integer('vat_amount')->change();
        });
    }
};
