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
        $products = Produk::where('stok', '>', 0)->get();
        
        return Inertia::render('Pos/Index', [
            'products' => $products
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'items' => 'required|array',
            'items.*.id' => 'required|exists:produk,id',
            'items.*.jumlah' => 'required|integer|min:1',
            'total' => 'required|integer'
        ]);

        try {
            DB::beginTransaction();

            $transaksi = Transaksi::create([
                'kasir_id' => auth()->id(),
                'nama_pelanggan' => $request->nama_pelanggan ?? 'Umum',
                'total' => $request->total,
                'tanggal' => now(),
            ]);

            foreach ($request->items as $item) {
                $produkDb = Produk::lockForUpdate()->find($item['id']);
                
                if($produkDb->stok < $item['jumlah']) {
                    throw new \Exception("Stok {$produkDb->nama_produk} habis.");
                }

                TransaksiDetail::create([
                    'transaksi_id' => $transaksi->id,
                    'produk_id' => $produkDb->id,
                    'jumlah' => $item['jumlah'],
                    'harga' => $produkDb->harga,
                ]);

                $produkDb->decrement('stok', $item['jumlah']);
            }

            DB::commit();

            return redirect()->back()->with('success', 'Transaksi Berhasil!');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
}