<?php

use App\Models\Company;
use App\Models\PartnerList;
use App\Models\Store;
use App\Models\User;
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
        Schema::create('rounds', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Company::class)->references('id')->on('companies')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignIdFor(User::class)->references('id')->on('users')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignIdFor(Store::class)->references('id')->on('stores')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignIdFor(PartnerList::class)->references('id')->on('partner_lists')->cascadeOnUpdate()->cascadeOnDelete();
            $table->mediumInteger('last_serial_number')->unsigned()->nullable();
            $table->smallInteger('year_code')->unsigned()->nullable();
            $table->timestamp('round_started');
            $table->timestamp('round_finished')->nullable();
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
        Schema::dropIfExists('rounds');
    }
};
