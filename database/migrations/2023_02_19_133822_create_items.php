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
        Schema::create('items', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Company::class)->references('id')->on('companies')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('cn_code', 6);
            $table->string('article_number', 16)->unique();
            $table->string('name', 60);
            $table->string('short_name', 10);
            $table->string('category', 20);
            $table->string('unit_name', 6);
            $table->string('product_catalog_code', 11);
            $table->string('vat_rate', 2);
            $table->float('net_price', 18, 5)->unsigned();
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
        Schema::dropIfExists('items');
    }
};
