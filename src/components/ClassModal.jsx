import React, { useState } from 'react';

export default function ClassModal({ isOpen, onClose, onSubmit }) {
    const [level, setLevel] = useState('Kelas X (10)');
    const [schoolType, setSchoolType] = useState('SMA');
    const [schoolName, setSchoolName] = useState('');
    const [title, setTitle] = useState('');

    const handleFormSubmit = (e) => {
        e.preventDefault();
        if (!title.trim() || !schoolName.trim()) return;

        onSubmit({ level, schoolType, schoolName, title });

        setTitle('');
        setSchoolName('');
        setLevel('Kelas X (10)');
        setSchoolType('SMA');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-100 text-left">
                {/* Judul Modal Utama */}
                <h3 className="font-black text-sm text-[#2D1B18] uppercase tracking-wider mb-5">
                    Detail Kelas Baru
                </h3>

                <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">

                    {/* Dropdown Pilihan Jenjang / Tingkat */}
                    <div className="flex flex-col gap-1 text-left">
                        {/* UKURAN FONT LABEL DIKECILKAN & DIPERLEMBUT DI SINI */}
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider pl-0.5">
                            Tingkatan / Jenjang
                        </label>
                        <select
                            value={level}
                            onChange={(e) => setLevel(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-700 cursor-pointer mt-1"
                        >
                            <option value="Kelas X (10)">Kelas X (10)</option>
                            <option value="Kelas XI (11)">Kelas XI (11)</option>
                            <option value="Kelas XII (12)">Kelas XII (12)</option>
                        </select>
                    </div>

                    {/* Dropdown Pilihan Tipe Sekolah */}
                    <div className="flex flex-col gap-1 text-left">
                        {/* UKURAN FONT LABEL DIKECILKAN & DIPERLEMBUT DI SINI */}
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider pl-0.5">
                            Jenis Instansi
                        </label>
                        <select
                            value={schoolType}
                            onChange={(e) => setSchoolType(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-700 cursor-pointer mt-1"
                        >
                            <option value="SMA">SMA</option>
                            <option value="SMK">SMK</option>
                            <option value="MA">MA</option>
                        </select>
                    </div>

                    {/* Input Ketik Nama Instansi / Sekolah */}
                    <div className="flex flex-col gap-1 text-left">
                        {/* UKURAN FONT LABEL DIKECILKAN & DIPERLEMBUT DI SINI */}
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider pl-0.5">
                            Nama Instansi / Sekolah
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: SMK Negeri 1 Yogyakarta"
                            value={schoolName}
                            onChange={(e) => setSchoolName(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-700 mt-1"
                        />
                    </div>

                    {/* Input Nama Kelas */}
                    <div className="flex flex-col gap-1 text-left">
                        {/* UKURAN FONT LABEL DIKECILKAN & DIPERLEMBUT DI SINI */}
                        <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider pl-0.5">
                            Nama / Spesialisasi Kelas
                        </label>
                        <input
                            type="text"
                            required
                            placeholder="Contoh: Unggah-Ungguh Basa A"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-700 mt-1"
                        />
                    </div>

                    {/* Aksi Kontrol Modal */}
                    <div className="flex gap-2 justify-end mt-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-400 hover:bg-gray-100 transition cursor-pointer"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="bg-amber-700 hover:bg-[#2D1B18] text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition shadow-sm cursor-pointer"
                        >
                            Simpan ke Cloud
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}