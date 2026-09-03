import React, { useState } from 'react';
import { User, Building, Shield, LogOut, Save, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../supabaseClient'; // Pastikan path impor supabase ini sudah benar

export default function Settings({ user, handleLogout, handleUpdateUser }) {
    // Inisialisasi state lokal dari data user global
    const [name, setName] = useState(user?.name || '');
    const [school, setSchool] = useState(user?.school || '');
    const [role, setRole] = useState('Senior Educator');
    const [isSaved, setIsSaved] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const handleSaveSettings = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // 1. Cari properti mana dari data user yang berisi ID/Angka
        // Kita cek user.id, user.id_teacher, user.teacher_id, atau field pertama jika ada
        const rawId = user?.id || user?.id_teacher || user?.teacher_id || user?.uid;

        // 2. Ubah menjadi tipe data Angka murni (Integer) untuk memenuhi syarat 'bigint' Supabase
        const userId = parseInt(rawId, 10);

        // Validasi jika ID benar-benar tidak ditemukan atau bukan angka
        if (!userId || isNaN(userId)) {
            console.error("Data user lengkap saat ini:", user);
            alert(
                "Gagal menyimpan: ID Pengajar tidak valid (Bernilai: " + rawId + ").\n\n" +
                "Saran: Coba periksa file login Anda, pastikan data 'id' pengajar dari database ikut disimpan ke dalam state 'user'."
            );
            setIsLoading(false);
            return;
        }

        try {
            // 3. Lakukan update ke Supabase dengan ID yang sudah dipastikan berupa angka
            const { data, error } = await supabase
                .from('teachers')
                .update({
                    name: name,
                    school: school
                })
                .eq('id', userId) // Sekarang userId dijamin bertipe angka/bigint
                .select();

            if (error) throw error;

            // Perbarui state global di App.jsx jika berhasil
            handleUpdateUser({ name, school });

            setIsSaved(true);
            setTimeout(() => setIsSaved(false), 3000);
        } catch (error) {
            console.error("Supabase Error detail:", error);
            alert("Gagal menyimpan ke database: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className="p-8 font-sans text-gray-800 antialiased w-full text-left max-w-2xl">

                {/* Header Halaman */}
                <div className="mb-8">
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Pengaturan Akun</h2>
                    <p className="text-gray-500 text-xs mt-0.5">Kelola informasi profil pengajar, instansi sekolah, dan preferensi keamanan akun Anda.</p>
                </div>

                <form onSubmit={handleSaveSettings} className="space-y-6">

                    {/* KELOMPOK PROFIL UTAMA */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs">
                        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-100">
                            <User size={16} className="text-amber-700" />
                            <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Profil Pengajar</h3>
                        </div>

                        <div className="space-y-4">
                            {/* Input Nama Lengkap */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider pl-0.5">
                                    Nama Lengkap
                                </label>
                                <div className="relative">
                                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        required
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
                                    />
                                </div>
                            </div>

                            {/* Input Jabatan / Peran */}
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider pl-0.5">
                                    Peran / Jabatan
                                </label>
                                <div className="relative">
                                    <Shield size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        disabled
                                        value={role}
                                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 bg-gray-100 text-xs font-semibold text-gray-400 cursor-not-allowed"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* KELOMPOK INSTANSI SEKOLAH */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-2xs">
                        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-gray-100">
                            <Building size={16} className="text-amber-800" />
                            <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wider">Detail Instansi</h3>
                        </div>

                        {/* Input Nama Instansi / Sekolah */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider pl-0.5">
                                Nama Instansi Utama
                            </label>
                            <div className="relative">
                                <Building size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    required
                                    value={school}
                                    onChange={(e) => setSchool(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-300 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
                                />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 pl-0.5">
                                * Nama instansi ini digunakan sebagai identitas default saat Anda membuat kelas baru di Dashboard.
                            </p>
                        </div>
                    </div>

                    {/* AREA TOMBOL AKSI */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl border border-gray-200 shadow-2xs">

                        {/* Tombol Kiri: Memicu Pop-up Logout */}
                        <button
                            type="button"
                            onClick={() => setShowLogoutConfirm(true)}
                            className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100/50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                        >
                            <LogOut size={14} />
                            Keluar Aplikasi
                        </button>

                        {/* Baris Kanan: Status Simpan */}
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                            {isSaved && (
                                <span className="text-green-600 text-xs font-bold flex items-center gap-1">
                                    <CheckCircle size={14} /> Tersimpan di Database!
                                </span>
                            )}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full sm:w-auto bg-amber-700 hover:bg-[#2D1B18] disabled:bg-gray-400 text-white px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer flex items-center justify-center gap-2 active:scale-95"
                            >
                                <Save size={14} />
                                {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>

                    </div>

                </form>
            </div>

            {/* POP-UP MODAL KONFIRMASI LOGOUT */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-sm w-full shadow-2xl text-center">

                        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-700 mx-auto mb-4">
                            <AlertTriangle size={22} />
                        </div>

                        <h3 className="font-black text-gray-900 text-sm tracking-tight mb-1">Konfirmasi Keluar</h3>
                        <p className="text-xs text-gray-400 font-medium px-2 leading-relaxed">
                            Apakah Anda yakin ingin keluar dari BIMA AI? Anda harus memasukkan kredensial pengajar kembali nanti.
                        </p>

                        <div className="flex gap-3 mt-6">
                            <button
                                type="button"
                                onClick={() => setShowLogoutConfirm(false)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xxs font-bold uppercase tracking-wider py-2.5 rounded-xl transition cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setShowLogoutConfirm(false);
                                    handleLogout();
                                }}
                                className="flex-1 bg-amber-700 hover:bg-[#2D1B18] text-white text-xxs font-bold uppercase tracking-wider py-2.5 rounded-xl transition shadow-xs cursor-pointer active:scale-95"
                            >
                                Ya, Keluar
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </>
    );
}