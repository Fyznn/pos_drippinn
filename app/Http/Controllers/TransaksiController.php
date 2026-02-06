<?php

namespace App\Http\Controllers;

use App\Models\Produk;
use App\Models\Transaksi;
use App\Models\TransaksiDetail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class TransaksiController extends Controller
{
    public function index()
    {
        $products = Produk::all();
        return Inertia::render('pos/index', [
            'products' => $products
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:produk,id',
            'items.*.jumlah' => 'required|integer|min:1',
            'jenis_pembayaran' => 'required|string'
        ]);

        DB::beginTransaction();
        try {
            // 1. HITUNG SUBTOTAAL DI SERVER
            $subtotal = 0;
            $validItems = []; 

            foreach ($request->items as $item) {
                $produkDb = Produk::lockForUpdate()->find($item['id']);
                
                if ($produkDb->stok < $item['jumlah']) {
                    throw new \Exception("Stok {$produkDb->nama_produk} habis!");
                }

                $subtotal += $produkDb->harga * $item['jumlah'];
                
                $validItems[] = [
                    'produk' => $produkDb,
                    'jumlah' => $item['jumlah'],
                    'harga_saat_ini' => $produkDb->harga
                ];
            }

            // 2. HITUNG GRAND TOTAL (Plus Pajak 10%)
            $pajak = $subtotal * 0.1;
            $grandTotal = $subtotal + $pajak;

            // 3. TRIK PAMUNGKAS: SIMPAN 0 DULU!
            // Kita set total jadi 0 agar jika ada Trigger database, dia tidak menambah ke angka yang salah.
            $transaksi = Transaksi::create([
                'kasir_id' => auth()->id(),
                'nama_pelanggan' => $request->nama_pelanggan ?? 'Umum',
                'total' => 0, // <--- NOL-KAN DULU
                'jenis_pembayaran' => $request->jenis_pembayaran ?? 'Tunai',
                'tanggal' => now(),
            ]);

            // 4. SIMPAN DETAIL
            foreach ($validItems as $data) {
                TransaksiDetail::create([
                    'transaksi_id' => $transaksi->id,
                    'produk_id' => $data['produk']->id,
                    'jumlah' => $data['jumlah'],
                    'harga' => $data['harga_saat_ini']
                ]);

                $data['produk']->decrement('stok', $data['jumlah']);
            }

            // 5. UPDATE TOTAL TERAKHIR (OVERRIDE)
            // Ini akan memaksa database menggunakan angka hitungan kita, menimpa gangguan apapun sebelumnya.
            $transaksi->update([
                'total' => $grandTotal
            ]);

            DB::commit();
            return redirect()->back()->with('success', 'Transaksi Berhasil Disimpan');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['message' => $e->getMessage()]);
        }
    }
}