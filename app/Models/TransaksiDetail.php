<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TransaksiDetail extends Model
{
    protected $table = 'transaksi_detail';
    protected $fillable = ['transaksi_id', 'produk_id', 'jumlah', 'harga'];
}