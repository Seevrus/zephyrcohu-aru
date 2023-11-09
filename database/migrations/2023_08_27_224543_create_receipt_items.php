<?php

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
        Schema::create('receipt_items', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Receipt::class)->references('id')->on('receipts')->cascadeOnUpdate()->cascadeOnDelete();
            $table->bigInteger('item_id')->unsinged();
            $table->string('code', 3);
            $table->string('cn_code', 6);
            $table->string('article_number', 16);
            $table->timestamp('expires_at');
            $table->string('name', 60);
            $table->integer('quantity');
            $table->string('unit_name', 6);
            $table->integer('net_price');
            $table->integer('net_amount');
            $table->string('vat_rate', 2);
            $table->integer('vat_amount')->nullable();
            $table->integer('gross_amount');
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
        Schema::dropIfExists('receipt_items');
    }
};
