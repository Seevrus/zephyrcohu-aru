<?php

use App\Models\Company;
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
        Schema::create('storage_receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Company::class)->references('id')->on('companies')->cascadeOnUpdate()->cascadeOnDelete();
            $table->string('company_code', 3);
            $table->bigInteger('user_id')->unsigned();
            $table->string('user_user_name');
            $table->string('user_name', 50);
            $table->string('user_phone_number', 20)->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('storage_receipts');
    }
};
