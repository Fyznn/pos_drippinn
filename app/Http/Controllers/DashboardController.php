<?php

namespace App\Http\Controllers;

use App\Models\Transaksi;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. KARTU STATISTIK ATAS
        $today = Carbon::today();
        $startOfMonth = Carbon::now()->startOfMonth();

        $statHariIni = Transaksi::whereDate('created_at', $today)->sum('total');
        $statBulanIni = Transaksi::whereBetween('created_at', [$startOfMonth, Carbon::now()])->sum('total');
        $totalTransaksi = Transaksi::count();
        $produkTerlaris = DB::table('transaksi_detail')
            ->select('produk.nama_produk', DB::raw('sum(jumlah) as total_jual'))
            ->join('produk', 'transaksi_detail.produk_id', '=', 'produk.id')
            ->groupBy('produk.nama_produk')
            ->orderByDesc('total_jual')
            ->limit(1)
            ->first();

        // 2. DATA GRAFIK HARIAN (7 Hari Terakhir)
        $dailyData = Transaksi::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('SUM(total) as total')
            )
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('date')
            ->orderBy('date', 'ASC')
            ->get();

        // 3. DATA GRAFIK BULANAN (Tahun Ini)
        $monthlyData = Transaksi::select(
                DB::raw('MONTH(created_at) as month'),
                DB::raw('SUM(total) as total')
            )
            ->whereYear('created_at', Carbon::now()->year)
            ->groupBy('month')
            ->orderBy('month', 'ASC')
            ->get();

        return Inertia::render('dashboard', [
            'stats' => [
                'today' => $statHariIni,
                'month' => $statBulanIni,
                'transactions' => $totalTransaksi,
                'best_seller' => $produkTerlaris ? $produkTerlaris->nama_produk : '-'
            ],
            'charts' => [
                'daily' => $dailyData,
                'monthly' => $monthlyData
            ]
        ]);
    }
}