<?php

use App\Models\Partner;
use App\Models\PartnerList;
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
        Schema::create('partner_partner_list', function (Blueprint $table) {
            $table->foreignIdFor(Partner::class)->references('id')->on('partners')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignIdFor(PartnerList::class)->references('id')->on('partner_lists')->cascadeOnUpdate()->cascadeOnDelete();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('partner_partner_list');
    }
};
