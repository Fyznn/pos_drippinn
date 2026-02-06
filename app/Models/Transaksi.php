<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaksi extends Model
{
    protected $table = 'transaksi';
    protected $fillable = ['tanggal', 'kasir_id', 'nama_pelanggan', 'total', 'jenis_pembayaran'];

    public function kasir()
    {
        return $this->belongsTo(Kasir::class, 'kasir_id');
    }

    public function details()
    {
        return $this->hasMany(TransaksiDetail::class, 'transaksi_id');
    }
}