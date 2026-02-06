<?php

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
    Schema::table('transaksi', function (Blueprint $table) {
        // Menambah kolom jenis_pembayaran setelah kolom total
        $table->string('jenis_pembayaran')->default('Tunai')->after('total');
    });
}

public function down(): void
{
    Schema::table('transaksi', function (Blueprint $table) {
        $table->dropColumn('jenis_pembayaran');
    });
}
};
