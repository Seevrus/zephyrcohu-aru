<?php

use App\Models\Partner;
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
        Schema::create('partner_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Partner::class)->references('id')->on('partners')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('name', 50);
            $table->string('location_type', 1); // C(enter), D(elivery)
            $table->string('country', 2);
            $table->string('postal_code', 10);
            $table->string('city', 30);
            $table->string('address', 40);
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
        Schema::dropIfExists('partner_locations');
    }
};
