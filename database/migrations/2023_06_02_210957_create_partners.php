<?php

use App\Models\Company;
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
        Schema::create('partners', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Company::class)->references('id')->on('companies')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('code', 6);
            $table->string('site_code', 4);
            $table->unique(['code', 'site_code']);
            $table->string('vat_number', 13);
            $table->string('invoice_type', 1); // E, P
            $table->tinyInteger('invoice_copies')->unsigned();
            $table->tinyInteger('payment_days')->unsigned();
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
        Schema::dropIfExists('partners');
    }
};
