import { useEffect, FormEventHandler } from 'react';
import Checkbox from '@/components/Checkbox';
import InputError from '@/components/InputError';
import InputLabel from '@/components/InputLabel';
import PrimaryButton from '@/components/PrimaryButton';
import TextInput from '@/components/TextInput';
import { Head, useForm } from '@inertiajs/react';

// --- TAMBAHAN PENTING: DEFINISI ROUTE UNTUK TYPESCRIPT ---
declare function route(name: string, params?: any, absolute?: boolean): string;
// ----------------------------------------------------------

export default function Login() {
    // Definisi Tipe Data Form
    const { data, setData, post, processing, errors, reset } = useForm({
        username: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        // Sekarang TypeScript sudah kenal fungsi route()
        post(route('login'));
    };

    return (
        <div className="min-h-screen flex bg-white overflow-hidden font-sans">
            <Head title="Log in" />

            {/* KIRI: FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 z-10 bg-white">
                <div className="w-full max-w-md space-y-8 animate-fade-in-up">
                    <div>
                        <h2 className="mt-6 text-3xl font-extrabold text-gray-900 tracking-tight">
                            Selamat Datang
                        </h2>
                        <p className="mt-2 text-sm text-gray-600">
                            Masuk ke sistem POS Coffee Shop
                        </p>
                    </div>

                    <form onSubmit={submit} className="mt-8 space-y-6">
                        <div className="space-y-4">
                            <div>
                                <InputLabel htmlFor="username" value="Username" />
                                <TextInput
                                    id="username"
                                    type="text"
                                    name="username"
                                    value={data.username}
                                    className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    autoComplete="username"
                                    isFocused={true}
                                    onChange={(e) => setData('username', e.target.value)}
                                />
                                <InputError message={errors.username} className="mt-2" />
                            </div>

                            <div>
                                <InputLabel htmlFor="password" value="Password" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full rounded-lg border-gray-300 focus:ring-indigo-500 focus:border-indigo-500"
                                    autoComplete="current-password"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <InputError message={errors.password} className="mt-2" />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <Checkbox
                                    name="remember"
                                    checked={data.remember}
                                    onChange={(e) => setData('remember', e.target.checked)}
                                />
                                <span className="ml-2 text-sm text-gray-600">Ingat Saya</span>
                            </label>
                        </div>

                        <PrimaryButton className="w-full justify-center py-3 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition transform hover:scale-105" disabled={processing}>
                            {processing ? 'Memproses...' : 'Masuk Sistem'}
                        </PrimaryButton>
                    </form>
                </div>
            </div>

            {/* KANAN: ANIMASI */}
            <div className="hidden lg:block relative w-1/2 bg-gray-900 overflow-hidden">
                <div className="absolute inset-0 bg-linear-to-br from-indigo-800 to-purple-900 opacity-90 animate-gradient-xy"></div>
                <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-indigo-500 opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-purple-500 opacity-20 animate-pulse delay-700"></div>

                <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-12 z-20">
                     <div className="transform transition-all duration-1000 hover:scale-105">
                         <h1 className="text-6xl font-black mb-6 text-center animate-slide-in-right">
                             POS System
                         </h1>
                         <p className="text-xl text-indigo-100 text-center animate-slide-in-right delay-200">
                             Kelola pesanan dengan <span className="font-bold text-white">Cepat & Tepat.</span>
                         </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes slide-in-right { 0% { transform: translateX(50px); opacity: 0; } 100% { transform: translateX(0); opacity: 1; } }
                .animate-slide-in-right { animation: slide-in-right 0.8s ease-out forwards; }
                .delay-200 { animation-delay: 0.2s; }
                @keyframes gradient-xy { 0%, 100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
                .animate-gradient-xy { background-size: 200% 200%; animation: gradient-xy 6s ease infinite; }
                @keyframes fade-in-up { 0% { transform: translateY(20px); opacity: 0; } 100% { transform: translateY(0); opacity: 1; } }
                .animate-fade-in-up { animation: fade-in-up 0.6s ease-out forwards; }
            `}</style>
        </div>
    );
}