import { forwardRef, useEffect, useRef, InputHTMLAttributes } from 'react';

export default forwardRef(function TextInput(
    { type = 'text', className = '', isFocused = false, ...props }: InputHTMLAttributes<HTMLInputElement> & { isFocused?: boolean },
    ref
) {
    const localRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isFocused) {
            localRef.current?.focus();
        }
    }, [isFocused]);

    return (
        <input
            {...props}
            type={type}
            // PERUBAHAN:
            // 1. 'py-3': Padding atas-bawah diperbesar agar teks pas di tengah vertikal
            // 2. 'px-4': Jarak kiri agar teks tidak mepet garis
            // 3. 'bg-white text-gray-900': Memastikan warna tetap benar di mode apapun
            className={
                'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm bg-white text-gray-900 py-3 px-4 ' +
                className
            }
            ref={localRef}
        />
    );
});