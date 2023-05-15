<?php

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
        Schema::create('user_passwords', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(User::class);
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('password');
            $table->smallInteger('is_generated')->unsigned();
            $table->timestamp('set_time');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('user_passwords');
    }
};
