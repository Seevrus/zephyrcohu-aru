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
        Schema::create('receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Company::class)->references('id')->on('companies')->cascadeOnUpdate()->cascadeOnDelete();
            $table->mediumInteger('ci_serial_number')->unsigned()->nullable();
            $table->smallInteger('ci_year_code')->unsigned()->nullable();
            $table->mediumInteger('serial_number')->unsigned();
            $table->smallInteger('year_code')->unsigned();
            $table->tinyInteger('original_copies_printed')->unsigned();
            $table->string('vendor_name', 50);
            $table->string('vendor_country', 2);
            $table->string('vendor_postal_code', 10);
            $table->string('vendor_city', 30);
            $table->string('vendor_address', 40);
            $table->string('vendor_felir', 9);
            $table->string('vendor_iban', 4);
            $table->string('vendor_bank_account', 26);
            $table->string('vendor_vat_number', 13);
            $table->string('buyer_name', 50);
            $table->string('buyer_country', 2);
            $table->string('buyer_postal_code', 10);
            $table->string('buyer_city', 30);
            $table->string('buyer_address', 40);
            $table->string('buyer_iban', 4);
            $table->string('buyer_bank_account', 26);
            $table->string('buyer_vat_number', 13);
            $table->string('buyer_delivery_name', 50)->nullable();
            $table->string('buyer_delvery_country', 2)->nullable();
            $table->string('buyer_delivery_postal_code', 10)->nullable();
            $table->string('buyer_delivery_city', 30)->nullable();
            $table->string('buyer_delivery_address', 40)->nullable();
            $table->date('invoice_date');
            $table->date('fulfillment_date');
            $table->string('invoice_type', 1);
            $table->date('paid_date');
            $table->string('agent_name', 50);
            $table->string('agent_phone_number', 20);
            $table->integer('quantity');
            $table->integer('net_amount');
            $table->integer('vat_amount');
            $table->integer('gross_amount');
            $table->tinyInteger('round_amount');
            $table->integer('rounded_amount');
            $table->dateTime('last_downloaded_at')->nullable();
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
        Schema::dropIfExists('receipts');
    }
};
