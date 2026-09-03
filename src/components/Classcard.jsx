import React from 'react';

export default function ClassCard({ title, students, latest, progress }) {
    return (
        /* Perubahan pada hover: border menjadi cokelat amber tegas, dan bayangan menggunakan opacity cokelat pekat */
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-200 flex flex-col justify-between text-left hover:shadow-[0_12px_30px_rgba(62,39,35,0.15)] hover:-translate-y-2 hover:border-amber-700 transition-all duration-300 min-h-[320px] group">

            {/* Container Konten Atas */}
            <div>
                {/* Header warna cokelat solid */}
                <div className="h-28 bg-[#3E2723] flex items-end p-5 transition-colors duration-300 group-hover:bg-[#2D1B18]">
                    <h4 className="text-white font-bold text-base tracking-tight">{title}</h4>
                </div>

                {/* Informasi Detail Kelas */}
                <div className="p-5 text-xs flex flex-col gap-3">
                    <div className="flex justify-between text-gray-500 font-medium">
                        <span>Students</span>
                        <span className="font-bold text-gray-800">{students} Students</span>
                    </div>
                    <div className="flex justify-between text-gray-500 font-medium">
                        <span>Latest Assessment</span>
                        <span className="text-amber-700 font-bold">{latest}</span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-gray-100 h-2 rounded-full mt-1">
                        <div className="bg-amber-700 h-2 rounded-full shadow-inner" style={{ width: `${progress}%` }}></div>
                    </div>
                </div>
            </div>

            {/* Tombol aksi "View Details" di bagian bawah */}
            <button className="w-full bg-gray-50 group-hover:bg-amber-700 py-3.5 text-xs font-bold text-amber-900 group-hover:text-white transition-colors duration-300 border-t border-gray-200 uppercase tracking-wider cursor-pointer">
                View Details
            </button>
        </div>
    );
}