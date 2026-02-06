import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, router, Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

declare function route(name: string, params?: any, absolute?: boolean): string;

interface Product {
    id: number;
    nama_produk: string;
    harga: number;
    stok: number;
    kategori: string;
}

interface CartItem extends Product {
    jumlah: number;
}

interface PosProps extends PageProps {
    products: Product[];
    errors: { message?: string }; // Menangkap error dari backend
}

export default function PosIndex({ auth, products, errors }: PosProps) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState('');
    const [namaPelanggan, setNamaPelanggan] = useState('');
    const [processing, setProcessing] = useState(false);
    
    // STATE PEMBAYARAN & MODAL
    const [paymentType, setPaymentType] = useState('Tunai');
    
    // MODAL STATES
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errorModal, setErrorModal] = useState({ show: false, message: '' }); // <--- STATE BARU
    
    const [lastTransaction, setLastTransaction] = useState({ total: 0, items: 0, type: '' });

    // EFFECT: TANGKAP ERROR DARI BACKEND (Flash Message)
    useEffect(() => {
        if (errors?.message) {
            setErrorModal({ show: true, message: errors.message });
            setProcessing(false); // Stop loading jika error
            setShowConfirmModal(false); // Tutup modal konfirmasi jika ada
        }
    }, [errors]);

    const filtered = products.filter(p => 
        p.nama_produk.toLowerCase().includes(search.toLowerCase())
    );

    const addToCart = (p: Product) => {
        const exist = cart.find(x => x.id === p.id);
        if (exist) {
            if (exist.jumlah + 1 > p.stok) {
                // GANTI ALERT DENGAN MODAL
                setErrorModal({ show: true, message: `Stok ${p.nama_produk} hanya sisa ${p.stok}!` });
                return;
            }
            setCart(cart.map(x => x.id === p.id ? { ...x, jumlah: x.jumlah + 1 } : x));
        } else {
            if (p.stok <= 0) {
                 setErrorModal({ show: true, message: `Stok ${p.nama_produk} sudah habis!` });
                 return;
            }
            setCart([...cart, { ...p, jumlah: 1 }]);
        }
    };

    const removeFromCart = (id: number) => {
        setCart(cart.filter(item => item.id !== id));
    };

    const updateQty = (id: number, qty: number) => {
        const product = products.find(p => p.id === id);
        if (!product) return;
        
        if (qty > product.stok) {
            setErrorModal({ show: true, message: `Stok tidak cukup! Maksimal ${product.stok} pcs.` });
            return;
        }
        
        if (qty < 1) return;
        setCart(cart.map(item => item.id === id ? { ...item, jumlah: qty } : item));
    };

    const total = cart.reduce((acc, item) => acc + (item.harga * item.jumlah), 0);
    const tax = total * 0.1;
    const grandTotal = total + tax;

    const openPaymentModal = () => {
        if (cart.length === 0) {
            setErrorModal({ show: true, message: 'Keranjang belanja masih kosong!' });
            return;
        }
        setPaymentType('Tunai');
        setShowConfirmModal(true);
    };

    const processPayment = () => {
        setProcessing(true);

        const finalTotal = grandTotal;
        const finalItems = cart.length;
        const finalType = paymentType;

        const payload: any = {
            nama_pelanggan: namaPelanggan,
            items: cart,
            total: finalTotal,
            jenis_pembayaran: finalType
        };

        router.post(route('transaksi.store'), payload, {
            onSuccess: () => {
                setShowConfirmModal(false);
                setCart([]);
                setNamaPelanggan('');
                setProcessing(false);
                
                setLastTransaction({ 
                    total: finalTotal, 
                    items: finalItems, 
                    type: finalType 
                });

                setShowSuccessModal(true);
            },
            onError: (err) => {
                console.error(err);
                setProcessing(false);
                setShowConfirmModal(false);
                // Error akan ditangani oleh useEffect di atas (jika ada message)
                // Jika error validasi lain, kita bisa tampilkan generic error
                if (!err.message) {
                    setErrorModal({ show: true, message: 'Terjadi kesalahan sistem. Silakan coba lagi.' });
                }
            }
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="POS" />
            
            <div className="flex h-[calc(100vh-80px)] overflow-hidden font-sans bg-gray-50 relative">
                
                {/* --- BAGIAN KIRI: PRODUK --- */}
                <div className="flex-1 flex flex-col h-full overflow-hidden relative">
                    
                    {/* HEADER */}
                    <div className="p-8 pb-4 flex items-center justify-between gap-4">
                        <div className="relative max-w-lg w-full">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-gray-400 text-lg">🔍</span>
                            </div>
                            <input 
                                type="text" 
                                placeholder="Cari menu favorit..." 
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border-none bg-white shadow-sm text-gray-700 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500/20 transition-all text-lg"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)} 
                            />
                        </div>

                        {/* NAVIGASI */}
                        <div className="flex gap-3 h-full">
                            <Link href={route('dashboard')} className="shrink-0 bg-white text-gray-600 hover:text-indigo-600 border border-transparent hover:border-indigo-100 font-bold py-4 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 group h-[60px]">
                                <span className="text-xl grayscale group-hover:grayscale-0 transition-all">📊</span><span className="hidden xl:inline">Dashboard</span>
                            </Link>
                            <Link href={route('produk.index')} className="shrink-0 bg-white text-gray-600 hover:text-indigo-600 border border-transparent hover:border-indigo-100 font-bold py-4 px-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-2 group h-[60px]">
                                <span className="text-xl grayscale group-hover:grayscale-0 transition-all">📦</span><span className="hidden xl:inline">Produk</span>
                            </Link>
                        </div>
                    </div>

                    {/* GRID PRODUK */}
                    <div className="flex-1 overflow-y-auto p-8 pt-0 pb-32">
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filtered.map(p => (
                                <div key={p.id} onClick={() => addToCart(p)} className="group bg-white rounded-3xl p-4 cursor-pointer border border-transparent hover:border-indigo-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-indigo-50 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                                    <div className="h-40 w-full bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-50/30 transition-colors">
                                        <span className="text-6xl drop-shadow-sm group-hover:scale-110 transition-transform duration-300">{p.kategori === 'Kopi' ? '☕' : (p.kategori === 'Makanan' ? '🥐' : '🥤')}</span>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-gray-800 text-lg leading-tight group-hover:text-indigo-600 transition-colors">{p.nama_produk}</h3>
                                            {/* Badge Stok Habis */}
                                            {p.stok <= 0 && (
                                                <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide">Habis</span>
                                            )}
                                        </div>
                                        <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{p.kategori}</p>
                                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                                            <span className="font-black text-lg text-gray-900">Rp {p.harga.toLocaleString('id-ID')}</span>
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center transition-all ${p.stok <= 0 ? 'bg-gray-100 text-gray-300' : 'bg-gray-100 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white'}`}>+</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* --- BAGIAN KANAN: KERANJANG --- */}
                <div className="w-[400px] bg-white shadow-2xl flex flex-col h-full border-l border-gray-100 z-20 relative">
                    <div className="p-8 bg-white border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Pesanan</h2>
                            <p className="text-sm text-gray-400 mt-1">Invoice #{Math.floor(Math.random() * 99999)}</p>
                        </div>
                        <div className="bg-indigo-50 text-indigo-600 font-bold px-3 py-1 rounded-lg text-sm">{cart.length} Item</div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                        {cart.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 space-y-4">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-4xl opacity-50">🛒</div>
                                <p className="font-medium">Keranjang masih kosong</p>
                            </div>
                        ) : (
                            cart.map(item => (
                                <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 group hover:border-indigo-200 transition-colors">
                                    <div className="h-16 w-16 bg-gray-50 rounded-xl flex items-center justify-center text-2xl shrink-0">
                                        {item.kategori === 'Kopi' ? '☕' : '🥐'}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-bold text-gray-800 line-clamp-1">{item.nama_produk}</h4>
                                            <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 transition-colors">✕</button>
                                        </div>
                                        <div className="flex justify-between items-end mt-2">
                                            <div className="text-sm font-semibold text-indigo-600">Rp {(item.harga * item.jumlah).toLocaleString()}</div>
                                            <div className="flex items-center bg-gray-100 rounded-lg p-1 gap-3">
                                                <button onClick={() => updateQty(item.id, item.jumlah - 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-red-600 font-bold text-xs">-</button>
                                                <span className="text-xs font-bold w-4 text-center">{item.jumlah}</span>
                                                <button onClick={() => updateQty(item.id, item.jumlah + 1)} className="w-6 h-6 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-green-600 font-bold text-xs">+</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="p-8 bg-white border-t border-gray-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-10">
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-gray-500 text-sm">
                                <span>Subtotal</span><span>Rp {total.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-gray-500 text-sm">
                                <span>Pajak (10%)</span><span>Rp {tax.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-2xl font-black text-gray-900 pt-4 border-t border-dashed border-gray-200">
                                <span>Total</span><span>Rp {grandTotal.toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <input type="text" placeholder="Nama Pelanggan (Opsional)" className="w-full mb-4 px-4 py-3 bg-gray-50 rounded-xl border-transparent focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-medium" value={namaPelanggan} onChange={(e) => setNamaPelanggan(e.target.value)} />
                        
                        <button onClick={openPaymentModal} disabled={cart.length === 0 || processing} className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-indigo-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                            💳 Bayar Sekarang
                        </button>
                    </div>
                </div>

                {/* MODAL 1: KONFIRMASI */}
                {showConfirmModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setShowConfirmModal(false)}></div>
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 relative z-10 animate-fade-in-up transform transition-all scale-100">
                            <div className="text-center">
                                <h3 className="text-2xl font-black text-gray-900 mb-2">Metode Pembayaran</h3>
                                <p className="text-gray-500 text-sm mb-6">Pilih cara pembayaran pelanggan.</p>
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    <button onClick={() => setPaymentType('Tunai')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentType === 'Tunai' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-100 hover:border-indigo-200'}`}>
                                        <span className="text-2xl">💵</span><span className="text-xs font-bold">Tunai</span>
                                    </button>
                                    <button onClick={() => setPaymentType('QRIS')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentType === 'QRIS' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-100 hover:border-indigo-200'}`}>
                                        <span className="text-2xl">📱</span><span className="text-xs font-bold">QRIS</span>
                                    </button>
                                    <button onClick={() => setPaymentType('Debit')} className={`p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentType === 'Debit' ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-100 hover:border-indigo-200'}`}>
                                        <span className="text-2xl">💳</span><span className="text-xs font-bold">Debit</span>
                                    </button>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-100">
                                    <div className="flex justify-between items-center mb-2 text-gray-500 text-sm"><span>Total Tagihan</span><span className="font-bold">{cart.length} Item</span></div>
                                    <div className="flex justify-between items-center text-gray-900 text-xl font-black"><span>Bayar</span><span className="text-indigo-600">Rp {grandTotal.toLocaleString()}</span></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setShowConfirmModal(false)} className="w-full py-3 px-4 bg-white border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors">Batal</button>
                                    <button onClick={processPayment} className="w-full py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 flex justify-center items-center gap-2">
                                        {processing ? 'Memproses...' : 'Proses Bayar'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL 2: SUKSES */}
                {showSuccessModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-green-900/20 backdrop-blur-md transition-opacity"></div>
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative z-10 animate-bounce-in text-center">
                            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-pulse">
                                <span className="text-4xl">✅</span>
                            </div>
                            <h3 className="text-3xl font-black text-gray-900 mb-2">Lunas!</h3>
                            <p className="text-gray-500 mb-6">Pembayaran via <span className="font-bold text-gray-800">{lastTransaction.type}</span> berhasil.</p>
                            <div className="bg-green-50 rounded-2xl p-4 mb-8 border border-green-100">
                                <p className="text-sm text-green-600 font-bold uppercase tracking-wider mb-1">Total Transaksi</p>
                                <p className="text-3xl font-black text-green-700">Rp {lastTransaction.total.toLocaleString()}</p>
                            </div>
                            <button onClick={() => setShowSuccessModal(false)} className="w-full py-4 px-6 bg-gray-900 text-white font-bold rounded-2xl shadow-xl hover:bg-gray-800 hover:scale-[1.02] transition-all">Transaksi Baru ➜</button>
                        </div>
                    </div>
                )}

                {/* MODAL 3: ERROR (BARU 🔥) */}
                {errorModal.show && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        {/* Overlay Merah Tipis */}
                        <div className="absolute inset-0 bg-red-900/20 backdrop-blur-sm transition-opacity" onClick={() => setErrorModal({ ...errorModal, show: false })}></div>
                        
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative z-10 animate-shake text-center border-4 border-red-50">
                            {/* Icon Silang Animasi */}
                            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
                                <span className="text-4xl">❌</span>
                            </div>
                            
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Oops, Gagal!</h3>
                            <p className="text-gray-600 mb-8 font-medium">{errorModal.message}</p>
                            
                            <button 
                                onClick={() => setErrorModal({ ...errorModal, show: false })}
                                className="w-full py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 hover:shadow-red-200 transition-all transform hover:scale-[1.02]"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                )}

            </div>
            
            <style>{`
                @keyframes fade-in-up { 0% { opacity: 0; transform: scale(0.95); } 100% { opacity: 1; transform: scale(1); } }
                @keyframes bounce-in { 0% { opacity: 0; transform: scale(0.5); } 50% { transform: scale(1.05); } 100% { opacity: 1; transform: scale(1); } }
                @keyframes shake { 0%, 100% { transform: translateX(0); } 10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); } 20%, 40%, 60%, 80% { transform: translateX(4px); } }
                .animate-fade-in-up { animation: fade-in-up 0.3s ease-out forwards; }
                .animate-bounce-in { animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .animate-shake { animation: shake 0.4s ease-in-out; }
            `}</style>
        </AuthenticatedLayout>
    );
}