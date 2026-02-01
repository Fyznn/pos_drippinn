import { useState, PropsWithChildren, ReactNode } from 'react';
import { Link, usePage } from '@inertiajs/react';
import { PageProps } from '@/types';

declare function route(name: string, params?: any, absolute?: boolean): string;

export default function Authenticated({ header, children }: PropsWithChildren<{ header?: ReactNode }>) {
    const { auth } = usePage<PageProps>().props;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar dengan efek Glassmorphism halus */}
            <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex items-center gap-4">
                            {/* Logo / Brand */}
                            <div className="shrink-0 flex items-center">
                                <Link href={route('pos.index')} className="flex items-center gap-2 group">
                                    <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white text-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                        ☕
                                    </div>
                                    <span className="font-extrabold text-2xl text-gray-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                                        Drippin'
                                    </span>
                                </Link>
                            </div>
                        </div>

                        {/* User Profile Pill */}
                        <div className="flex items-center">
                            <div className="flex items-center bg-gray-100 rounded-full px-4 py-2 border border-gray-200">
                                <div className="text-sm font-bold text-gray-700 mr-4">
                                    Halo, {auth.user.username} 👋
                                </div>
                                <Link
                                    method="post"
                                    href={route('logout')}
                                    as="button"
                                    className="text-xs font-bold bg-white text-red-500 px-3 py-1.5 rounded-full shadow-sm hover:bg-red-50 hover:text-red-600 transition-all"
                                >
                                    Logout
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-[1920px] mx-auto">{children}</main>
        </div>
    );
}