import React from 'react';

export default function Card({ title, value, icon, colorType = 'amber' }) {
    // Pemetaan skema warna berdasarkan tema yang dipilih
    const colorStyles = {
        amber: {
            border: 'border-l-amber-700',
            bgIcon: 'bg-amber-50 border-amber-100 text-amber-700',
        },
        emerald: {
            border: 'border-l-emerald-600',
            bgIcon: 'bg-emerald-50 border-emerald-100 text-emerald-600',
        },
        indigo: {
            border: 'border-l-indigo-600',
            bgIcon: 'bg-indigo-50 border-indigo-100 text-indigo-600',
        },
        rose: {
            border: 'border-l-rose-600',
            bgIcon: 'bg-rose-50 border-rose-100 text-rose-600',
        },
    };

    // Pilih warna aktif, jika tidak terdaftar gunakan amber sebagai default
    const activeColor = colorStyles[colorType] || colorStyles.amber;

    return (
        <div className={`bg-white p-5 rounded-xl border border-gray-200 border-l-4 ${activeColor.border} shadow-sm flex items-center justify-between text-left transition-all duration-300`}>
            <div>
                <p className="text-gray-400 text-xxs font-bold uppercase tracking-wider">{title}</p>
                <p className="text-gray-900 text-2xl font-black mt-1 leading-none">{value}</p>
            </div>
            <div className={`p-3 rounded-xl text-xl border flex items-center justify-center transition-colors ${activeColor.bgIcon}`}>
                {icon}
            </div>
        </div>
    );
}