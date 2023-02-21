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
        Schema::create('vat_amounts', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Receipt::class)->references('id')->on('receipts')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('vat_rate', 2);
            $table->integer('net_amount');
            $table->integer('vat_amount');
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
        Schema::dropIfExists('vat_amounts');
    }
};
