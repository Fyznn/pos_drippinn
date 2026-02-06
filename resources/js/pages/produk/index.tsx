import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import { PageProps } from '@/types';

declare function route(name: string, params?: any, absolute?: boolean): string;

interface Product {
    id: number;
    nama_produk: string;
    harga: number;
    stok: number;
    kategori: string;
}

// Update Interface Props untuk menangkap Error dari Backend
interface ProdukProps extends PageProps {
    products: Product[];
    errors: { message?: string }; // <--- TAMBAHAN
}

export default function ProdukIndex({ auth, products, errors }: ProdukProps) {
    const [search, setSearch] = useState('');
    const [isFormModalOpen, setIsFormModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    
    // State Form
    const [form, setForm] = useState({
        id: 0,
        nama_produk: '',
        kategori: 'Kopi',
        harga: '',
        stok: ''
    });

    // State Modals
    const [confirmModal, setConfirmModal] = useState({ show: false, type: 'save', message: '', targetId: 0 });
    const [successModal, setSuccessModal] = useState({ show: false, message: '' });
    const [errorModal, setErrorModal] = useState({ show: false, message: '' });
    const [processing, setProcessing] = useState(false);

    // --- EFFECT BARU: TANGKAP ERROR DARI BACKEND ---
    useEffect(() => {
        if (errors?.message) {
            setProcessing(false);
            setConfirmModal({ ...confirmModal, show: false }); // Tutup konfirmasi hapus
            setErrorModal({ show: true, message: errors.message }); // Buka popup merah
        }
    }, [errors]);
    // ------------------------------------------------

    const filteredProducts = products.filter(p => 
        p.nama_produk.toLowerCase().includes(search.toLowerCase())
    );

    const openAddModal = () => {
        setForm({ id: 0, nama_produk: '', kategori: 'Kopi', harga: '', stok: '' });
        setIsEditMode(false);
        setIsFormModalOpen(true);
    };

    const openEditModal = (p: Product) => {
        setForm({
            id: p.id,
            nama_produk: p.nama_produk,
            kategori: p.kategori,
            harga: p.harga.toString(),
            stok: p.stok.toString()
        });
        setIsEditMode(true);
        setIsFormModalOpen(true);
    };

    // Validasi Frontend (Stok & Harga)
    const handlePreSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (Number(form.stok) > 1000) {
            setErrorModal({ show: true, message: 'Stok tidak boleh melebihi 1.000 unit!' });
            return;
        }

        if (Number(form.harga) > 200000) {
            setErrorModal({ show: true, message: 'Harga tidak boleh melebihi Rp 200.000!' });
            return;
        }

        setConfirmModal({
            show: true,
            type: 'save',
            message: isEditMode ? 'Apakah Anda yakin ingin memperbarui data produk ini?' : 'Pastikan data produk sudah benar sebelum disimpan.',
            targetId: 0
        });
    };

    const handlePreDelete = (id: number) => {
        setConfirmModal({
            show: true,
            type: 'delete',
            message: 'Tindakan ini tidak dapat dibatalkan. Produk akan hilang permanen.',
            targetId: id
        });
    };

    const executeAction = () => {
        setProcessing(true);
        
        const onSuccess = (msg: string) => {
            setProcessing(false);
            setConfirmModal({ ...confirmModal, show: false });
            setIsFormModalOpen(false);
            setSuccessModal({ show: true, message: msg });
        };

        // Error handler disini hanya untuk error jaringan/sistem generik.
        // Error validasi backend (seperti gagal hapus) akan ditangani useEffect di atas.
        const onError = () => {
            setProcessing(false);
            setConfirmModal({ ...confirmModal, show: false });
        };

        if (confirmModal.type === 'delete') {
            router.delete(route('produk.destroy', confirmModal.targetId), {
                onSuccess: () => onSuccess('Produk berhasil dihapus!'),
                onError: onError
            });
        } else {
            if (isEditMode) {
                router.put(route('produk.update', form.id), form, {
                    onSuccess: () => onSuccess('Data produk berhasil diperbarui!'),
                    onError: onError
                });
            } else {
                router.post(route('produk.store'), form, {
                    onSuccess: () => onSuccess('Produk baru berhasil ditambahkan!'),
                    onError: onError
                });
            }
        }
    };

    return (
        <AuthenticatedLayout>
            <Head title="Manajemen Produk" />

            <div className="py-12 bg-gray-50 min-h-screen relative overflow-hidden">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 relative z-10">
                    
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-center mb-6 px-4 sm:px-0 gap-4">
                        <div>
                            <h2 className="text-3xl font-black text-gray-800 tracking-tight">Inventory</h2>
                            <p className="text-gray-500 text-sm">Kelola daftar menu dan stok barang.</p>
                        </div>
                        
                        <div className="flex gap-3">
                             <Link href={route('dashboard')} className="px-4 py-3 bg-white text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 border border-gray-200 flex items-center gap-2">
                                <span>📊</span> Dashboard
                            </Link>
                            <Link href={route('pos.index')} className="px-4 py-3 bg-white text-gray-700 font-bold rounded-xl shadow-sm hover:bg-gray-50 border border-gray-200 flex items-center gap-2">
                                <span>🖥️</span> Buka Kasir
                            </Link>
                            <button onClick={openAddModal} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-2">
                                <span className="text-lg">+</span> Tambah
                            </button>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="bg-white overflow-hidden shadow-xl sm:rounded-3xl border border-gray-100">
                        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                            <input type="text" placeholder="Cari nama produk..." className="w-full max-w-md px-4 py-2 rounded-xl border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/20 transition-all"
                                value={search} onChange={e => setSearch(e.target.value)} />
                        </div>

                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Produk</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Kategori</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Harga</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Stok</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {filteredProducts.map((p) => (
                                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 bg-indigo-50 rounded-lg flex items-center justify-center text-xl">
                                                        {p.kategori === 'Kopi' ? '☕' : (p.kategori === 'Makanan' ? '🥐' : '🥤')}
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-bold text-gray-900">{p.nama_produk}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                    ${p.kategori === 'Kopi' ? 'bg-amber-100 text-amber-800' : 
                                                      p.kategori === 'Makanan' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                                    {p.kategori}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                                                Rp {p.harga.toLocaleString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className={`text-sm font-bold ${p.stok < 10 ? 'text-red-500' : 'text-green-600'}`}>
                                                    {p.stok} pcs
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button onClick={() => openEditModal(p)} className="text-indigo-600 hover:text-indigo-900 mr-4 font-bold bg-indigo-50 px-3 py-1 rounded-lg hover:bg-indigo-100 transition-colors">Edit</button>
                                                <button onClick={() => handlePreDelete(p.id)} className="text-red-500 hover:text-red-700 font-bold bg-red-50 px-3 py-1 rounded-lg hover:bg-red-100 transition-colors">Hapus</button>
                                            </td>
                                        </tr>
                                    ))}
                                    {filteredProducts.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-400">Tidak ada produk yang ditemukan.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* MODAL 1: FORM INPUT */}
                {isFormModalOpen && (
                    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setIsFormModalOpen(false)}></div>
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 relative z-10 animate-fade-in-up">
                            <h3 className="text-2xl font-black text-gray-900 mb-6">{isEditMode ? 'Edit Produk' : 'Tambah Produk Baru'}</h3>
                            <form onSubmit={handlePreSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Nama Produk</label>
                                    <input type="text" required className="w-full rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        value={form.nama_produk} onChange={e => setForm({...form, nama_produk: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Kategori</label>
                                        <select className="w-full rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                            value={form.kategori} onChange={e => setForm({...form, kategori: e.target.value})}>
                                            <option value="Kopi">Kopi</option>
                                            <option value="Non-Kopi">Non-Kopi</option>
                                            <option value="Makanan">Makanan</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-gray-700 mb-1">Stok</label>
                                        <input type="number" required min="0" className="w-full rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                            value={form.stok} onChange={e => setForm({...form, stok: e.target.value})} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Harga (Rp)</label>
                                    <input type="number" required min="0" className="w-full rounded-xl border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                                        value={form.harga} onChange={e => setForm({...form, harga: e.target.value})} />
                                </div>
                                <div className="flex gap-3 mt-8 pt-4">
                                    <button type="button" onClick={() => setIsFormModalOpen(false)} className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Batal</button>
                                    <button type="submit" className="w-full py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700">Simpan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* MODAL 2: KONFIRMASI */}
                {confirmModal.show && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setConfirmModal({...confirmModal, show: false})}></div>
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative z-10 animate-bounce-in text-center">
                            <div className={`mx-auto flex items-center justify-center h-20 w-20 rounded-full mb-6 ${confirmModal.type === 'delete' ? 'bg-red-100 text-red-500' : 'bg-indigo-100 text-indigo-500'}`}>
                                <span className="text-4xl">{confirmModal.type === 'delete' ? '🗑️' : '💾'}</span>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">{confirmModal.type === 'delete' ? 'Hapus Produk?' : 'Konfirmasi Simpan'}</h3>
                            <p className="text-gray-500 mb-8">{confirmModal.message}</p>
                            <div className="flex gap-3">
                                <button onClick={() => setConfirmModal({...confirmModal, show: false})} className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-xl hover:bg-gray-200">Batal</button>
                                <button onClick={executeAction} disabled={processing} className={`w-full py-3 font-bold rounded-xl shadow-lg text-white flex justify-center items-center gap-2 ${confirmModal.type === 'delete' ? 'bg-red-500 hover:bg-red-600 shadow-red-200' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'}`}>
                                    {processing ? 'Memproses...' : 'Ya, Lanjutkan'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* MODAL 3: SUKSES */}
                {successModal.show && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-green-900/20 backdrop-blur-md transition-opacity" onClick={() => setSuccessModal({...successModal, show: false})}></div>
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative z-10 animate-bounce-in text-center">
                            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-6 animate-pulse">
                                <span className="text-4xl">✅</span>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Berhasil!</h3>
                            <p className="text-gray-500 mb-8">{successModal.message}</p>
                            <button onClick={() => setSuccessModal({...successModal, show: false})} className="w-full py-3 bg-gray-900 text-white font-bold rounded-xl shadow-xl hover:bg-gray-800 hover:scale-[1.02] transition-all">OK, Tutup</button>
                        </div>
                    </div>
                )}

                {/* MODAL 4: ERROR POPUP (Backend & Validasi) */}
                {errorModal.show && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-red-900/20 backdrop-blur-sm transition-opacity" onClick={() => setErrorModal({ ...errorModal, show: false })}></div>
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-8 relative z-10 animate-shake text-center border-4 border-red-50">
                            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-100 mb-6">
                                <span className="text-4xl">❌</span>
                            </div>
                            <h3 className="text-2xl font-black text-gray-900 mb-2">Gagal!</h3>
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