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
        Schema::create('logs', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Company::class);
            $table->foreign('company_id')
                ->references('id')->on('companies')
                ->onUpdate('cascade')->onDelete('cascade');
            $table->foreignIdFor(User::class);
            $table->foreign('user_id')
                ->references('id')->on('users')
                ->onUpdate('cascade')->onDelete('cascade');
            $table->bigInteger('token_id', false, true);
            $table->foreign('token_id')
                ->references('id')->on('personal_access_tokens')
                ->onUpdate('cascade')->onDelete('cascade');
            $table->string('ability');
            $table->dateTime('occured_at');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('logs');
    }
};
