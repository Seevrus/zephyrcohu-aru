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
        Schema::create('companies', function (Blueprint $table) {
            $table->id();
            $table->string('code', 3)->unique();
            $table->string('name', 50);
            $table->string('country', 2);
            $table->string('postal_code', 10);
            $table->string('city', 30);
            $table->string('address', 40);
            $table->string('felir', 9);
            $table->string('vat_number', 13);
            $table->string('iban', 4);
            $table->string('bank_account', 26);
            $table->string('phone_number', 20)->nullable();
            $table->string('email', 70)->nullable();
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
        Schema::dropIfExists('companies');
    }
};
