import { LabelHTMLAttributes } from 'react';

export default function InputLabel({
    value,
    className = '',
    children,
    ...props
}: LabelHTMLAttributes<HTMLLabelElement> & { value?: string }) {
    return (
        <label
            {...props}
            // PERUBAHAN: Saya ganti 'font-medium' jadi 'font-bold'
            // dan 'text-gray-700' jadi 'text-gray-900' (Hitam Pekat) agar lebih jelas
            className={`block font-bold text-sm text-gray-900 mb-1 ` + className}
        >
            {value ? value : children}
        </label>
    );
}