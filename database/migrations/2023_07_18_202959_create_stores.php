<?php

use App\Models\Company;
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
        Schema::create('stores', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Company::class)->references('id')->on('companies')->cascadeOnUpdate()->cascadeOnDelete();
            $table->foreignIdFor(User::class)->nullable()->references('id')->on('users')->cascadeOnUpdate()->nullOnDelete();
            $table->string('code', 4)->unique();
            $table->string('name');
            $table->string('type', 1); // P(rimary), S(econdary)
            $table->string('state', 1); // I(dle), L(oading), R(ound)
            $table->mediumInteger('first_available_serial_number', false, true)->nullable();
            $table->mediumInteger('last_available_serial_number', false, true)->nullable();
            $table->smallInteger('year_code', false, true)->nullable();
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
        Schema::dropIfExists('stores');
    }
};
