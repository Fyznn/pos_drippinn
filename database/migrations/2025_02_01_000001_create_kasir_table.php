<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('kasir', function (Blueprint $table) {
            $table->id();
            $table->string('username', 50)->unique();
            $table->string('password');
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('produk', function (Blueprint $table) {
            $table->id();
            $table->string('nama_produk', 100);
            $table->integer('harga');
            $table->integer('stok');
            $table->string('kategori', 50);
            $table->timestamps();
        });

        Schema::create('transaksi', function (Blueprint $table) {
            $table->id();
            $table->dateTime('tanggal')->useCurrent();
            $table->foreignId('kasir_id')->constrained('kasir');
            $table->string('nama_pelanggan', 100)->nullable();
            $table->integer('total');
            $table->timestamps();
        });

        Schema::create('transaksi_detail', function (Blueprint $table) {
            $table->id();
            $table->foreignId('transaksi_id')->constrained('transaksi')->onDelete('cascade');
            $table->foreignId('produk_id')->constrained('produk');
            $table->integer('jumlah');
            $table->integer('harga');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('transaksi_detail');
        Schema::dropIfExists('transaksi');
        Schema::dropIfExists('produk');
        Schema::dropIfExists('kasir');
    }
};