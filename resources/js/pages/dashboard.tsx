import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { PageProps } from '@/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

declare function route(name: string, params?: any, absolute?: boolean): string;

// Registrasi ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardProps extends PageProps {
    stats: {
        today: number;
        month: number;
        transactions: number;
        best_seller: string;
    };
    charts: {
        daily: { date: string, total: number }[];
        monthly: { month: number, total: number }[];
    };
}

export default function Dashboard({ auth, stats, charts }: DashboardProps) {

    // --- SETUP CHART HARIAN (Line) ---
    const dailyLabels = charts.daily.map(d => new Date(d.date).toLocaleDateString('id-ID', { weekday: 'short' }));
    const dailyValues = charts.daily.map(d => d.total);

    const dailyChartData = {
        labels: dailyLabels,
        datasets: [{
            label: 'Omzet Harian',
            data: dailyValues,
            borderColor: 'rgb(79, 70, 229)',
            backgroundColor: 'rgba(79, 70, 229, 0.5)',
            tension: 0.4, // Membuat garis melengkung halus
        }],
    };

    // --- SETUP CHART BULANAN (Bar) ---
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
    // Mapping data database ke 12 bulan (isi 0 jika kosong)
    const monthlyValues = Array(12).fill(0);
    charts.monthly.forEach(d => {
        monthlyValues[d.month - 1] = d.total; // d.month return 1-12
    });

    const monthlyChartData = {
        labels: monthNames,
        datasets: [{
            label: 'Omzet Bulanan',
            data: monthlyValues,
            backgroundColor: 'rgba(236, 72, 153, 0.8)', // Warna Pink
            borderRadius: 8,
        }],
    };

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <div className="py-12 bg-gray-50 min-h-screen">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    
                    {/* Header */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h2 className="text-3xl font-black text-gray-800">Dashboard</h2>
                            <p className="text-gray-500">Analisis performa bisnis Anda.</p>
                        </div>
                        <div className="flex gap-3">
                            <Link href={route('produk.index')} className="px-4 py-2 bg-white text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 border border-gray-200">
                                📦 Kelola Produk
                            </Link>
                            <Link href={route('pos.index')} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700">
                                🖥️ Buka Kasir
                            </Link>
                        </div>
                    </div>

                    {/* 1. KARTU STATISTIK */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Omzet Hari Ini */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Omzet Hari Ini</p>
                                <h3 className="text-2xl font-black text-gray-900">Rp {stats.today.toLocaleString('id-ID')}</h3>
                            </div>
                            <div className="absolute right-0 top-0 h-24 w-24 bg-indigo-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        </div>

                        {/* Omzet Bulan Ini */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Omzet Bulan Ini</p>
                                <h3 className="text-2xl font-black text-indigo-600">Rp {stats.month.toLocaleString('id-ID')}</h3>
                            </div>
                            <div className="absolute right-0 top-0 h-24 w-24 bg-blue-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        </div>

                        {/* Total Transaksi */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Total Transaksi</p>
                                <h3 className="text-2xl font-black text-gray-900">{stats.transactions} <span className="text-sm font-medium text-gray-400">Nota</span></h3>
                            </div>
                            <div className="absolute right-0 top-0 h-24 w-24 bg-green-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        </div>

                        {/* Produk Terlaris */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 relative overflow-hidden group">
                            <div className="relative z-10">
                                <p className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-1">Produk Terlaris</p>
                                <h3 className="text-xl font-black text-amber-600 truncate">{stats.best_seller}</h3>
                            </div>
                            <div className="absolute right-0 top-0 h-24 w-24 bg-amber-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                        </div>
                    </div>

                    {/* 2. BAGIAN GRAFIK */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                        {/* Grafik Harian */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Tren Penjualan (7 Hari)</h3>
                            <div className="h-64">
                                <Line 
                                    data={dailyChartData} 
                                    options={{ 
                                        responsive: true, 
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: { y: { beginAtZero: true, grid: { display: false } } }
                                    }} 
                                />
                            </div>
                        </div>

                        {/* Grafik Bulanan */}
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Performa Bulanan</h3>
                            <div className="h-64">
                                <Bar 
                                    data={monthlyChartData} 
                                    options={{ 
                                        responsive: true, 
                                        maintainAspectRatio: false,
                                        plugins: { legend: { display: false } },
                                        scales: { y: { beginAtZero: true } }
                                    }} 
                                />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}