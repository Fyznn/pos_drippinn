<?php

namespace App\Http\Controllers;

use Illuminate\Database\QueryException;
use App\Models\Produk;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProdukController extends Controller
{
    public function index()
    {
        // Ambil data produk terbaru
        $products = Produk::latest()->get();
        return Inertia::render('produk/index', ['products' => $products]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'nama_produk' => 'required|string|max:255',
            'kategori'    => 'required|string',
            'harga'       => 'required|numeric|min:0',
            'stok'        => 'required|integer|min:0',
        ]);

        Produk::create($data);
        return redirect()->back()->with('message', 'Produk berhasil ditambahkan!');
    }

    public function update(Request $request, $id)
    {
        $data = $request->validate([
            'nama_produk' => 'required|string|max:255',
            'kategori'    => 'required|string',
            'harga'       => 'required|numeric|min:0',
            'stok'        => 'required|integer|min:0',
        ]);

        Produk::findOrFail($id)->update($data);
        return redirect()->back()->with('message', 'Produk berhasil diperbarui!');
    }

    public function destroy($id)
{
    try {
        $produk = Produk::findOrFail($id);
        $produk->delete();
        
        return redirect()->back()->with('message', 'Produk berhasil dihapus!');
        
    } catch (QueryException $e) {
        // Error Code 23000 = Integrity Constraint Violation (Foreign Key Fails)
        if ($e->getCode() == "23000") {
            return redirect()->back()->withErrors(['message' => 'Gagal Hapus: Produk ini sudah pernah terjual dan ada di riwayat transaksi!']);
        }
        
        return redirect()->back()->withErrors(['message' => 'Terjadi kesalahan sistem: ' . $e->getMessage()]);
    }
}
}