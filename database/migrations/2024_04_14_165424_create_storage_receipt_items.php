<?php

use App\Models\StorageReceipt;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('storage_receipt_items', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(StorageReceipt::class)->references('id')->on('storage_receipts')->cascadeOnDelete()->cascadeOnUpdate();
            $table->bigInteger('item_id')->unsinged();
            $table->string('cn_code', 6);
            $table->string('article_number', 16);
            $table->timestamp('expires_at');
            $table->integer('starting_quantity');
            $table->integer('quantity_change');
            $table->integer('final_quantity');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('storage_receipt_items');
    }
};
