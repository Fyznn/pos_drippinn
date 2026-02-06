<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\Kasir;
use App\Models\Produk;

class DatabaseSeeder extends Seeder
{
    public function run()
    {

        Kasir::insert([
            ['username' => 'Figo', 'password' => Hash::make('figo123'),], 
            ['username' => 'Yosafat', 'password' => Hash::make('yosafat123'),],
            ['username' => 'Raihan', 'password' => Hash::make('raihan123'),],
            ['username' => 'Marcel', 'password' => Hash::make('marcel123'),]
        ]);

        Produk::insert([
            ['nama_produk' => 'Espresso', 'harga' => 25000, 'stok' => 100, 'kategori' => 'Kopi', 'created_at' => now(), 'updated_at' => now()],
            ['nama_produk' => 'Latte', 'harga' => 35000, 'stok' => 80, 'kategori' => 'Kopi', 'created_at' => now(), 'updated_at' => now()],
            ['nama_produk' => 'Cappuccino', 'harga' => 35000, 'stok' => 75, 'kategori' => 'Kopi', 'created_at' => now(), 'updated_at' => now()],
            ['nama_produk' => 'Americano', 'harga' => 30000, 'stok' => 90, 'kategori' => 'Kopi', 'created_at' => now(), 'updated_at' => now()],
            ['nama_produk' => 'Croissant', 'harga' => 20000, 'stok' => 50, 'kategori' => 'Makanan', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}