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
        Schema::table('receipts', function (Blueprint $table) {
            $table->string('company_code', 3)->after('company_id');
            $table->string('partner_code', 6)->after('company_code');
            $table->string('partner_site_code', 4)->after('partner_code');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('receipts', function (Blueprint $table) {
            $table->dropColumn('company_code');
            $table->dropColumn('partner_code');
            $table->dropColumn('partner_site_code');
        });
    }
};
