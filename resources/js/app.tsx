import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => {
        // Ambil semua file page
        const pages = import.meta.glob('./pages/**/*.tsx');
        
        // 1. Coba cari file yang namanya persis (Contoh: pages/Auth/Login.tsx)
        const exactMatch = `./pages/${name}.tsx`;
        if (pages[exactMatch]) {
            return resolvePageComponent(exactMatch, pages);
        }

        // 2. Jika tidak ketemu, coba cari versi huruf kecil semua (Contoh: pages/auth/login.tsx)
        // Ini solusi untuk masalah Anda!
        const lowerName = name.toLowerCase(); 
        const lowerMatch = `./pages/${lowerName}.tsx`;
        
        if (pages[lowerMatch]) {
             return resolvePageComponent(lowerMatch, pages);
        }

        // 3. Debugging: Jika masih tidak ketemu, cek console browser
        console.error(`Halaman tidak ditemukan: ${name}`);
        console.log('Mencoba path:', exactMatch, 'atau', lowerMatch);
        
        // Fallback terakhir (jika struktur folder berbeda)
        return resolvePageComponent(`./pages/${name}.tsx`, pages);
    },
    setup({ el, App, props }) {
        const root = createRoot(el);
        root.render(<App {...props} />);
    },
    progress: {
        color: '#4B5563',
    },
});