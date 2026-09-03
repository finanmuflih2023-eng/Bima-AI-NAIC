import React, { useState } from 'react';
import { Plus, Users, BookOpen, GraduationCap, ArrowRight } from 'lucide-react';
import ClassModal from '../components/ClassModal'; // 1. Impor komponen modal baru

export default function Dashboard({ user, classes, quizzesCount, onCreateClass, setCurrentTab, setSelectedClassId }) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [copiedToken, setCopiedToken] = useState(null);

    const handleCopyToken = (token) => {
        navigator.clipboard.writeText(token);
        setCopiedToken(token);
        setTimeout(() => setCopiedToken(null), 2000); // Reset ikon setelah 2 detik
    };
    return (
        <div className="flex-1 p-8 text-left font-sans text-gray-800 antialiased">
            {/* Header Dashboard */}
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-2xl font-black text-[#2D1B18]">Sugeng Rawuh, {user?.name}!</h1>
                    <p className="text-xs font-semibold text-gray-400 mt-1">{user?.school}</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-amber-700 hover:bg-[#2D1B18] text-white px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md transition cursor-pointer"
                >
                    <Plus size={16} />
                    Tambah Kelas
                </button>
            </div>

            {/* Statistik Ringkas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-700">
                        <GraduationCap size={24} />
                    </div>
                    <div>
                        <p className="text-xxs font-bold text-gray-400 uppercase tracking-wide">Total Kelas Aktif</p>
                        <p className="text-xl font-black text-[#2D1B18]">{classes.length} Kelas</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <p className="text-xxs font-bold text-gray-400 uppercase tracking-wide">Total Kuis Tarikan AI</p>
                        <p className="text-xl font-black text-[#2D1B18]">{quizzesCount} Evaluasi</p>
                    </div>
                </div>
            </div>

            {/* Bagian Daftar Kelas Real-Time */}
            <h2 className="text-sm font-black text-[#2D1B18] uppercase tracking-wider mb-4">Daftar Kelas Anda</h2>

            {classes.length === 0 ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 p-12 rounded-2xl text-center">
                    <p className="text-xs font-semibold text-gray-400">Belum ada kelas terdaftar. Klik "Tambah Kelas" untuk memulai.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {classes.map((item) => (
                        <div
                            key={item.id}
                            className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden flex flex-col justify-between group hover:shadow-md hover:border-amber-200/60 transition-all duration-300"
                        >
                            {/* Bagian Utama Kartu */}
                            <div className="p-5 flex-1 flex flex-col justify-between">
                                <div>
                                    {/* Baris Atas: Badge Jenjang & Jumlah Siswa */}
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                            {item.level} • {item.school_type}
                                        </span>
                                        <span className="bg-gray-50 text-gray-500 text-[11px] font-semibold px-2 py-1 rounded-lg flex items-center gap-1.5 border border-gray-100/80">
                                            <Users size={13} className="text-gray-400" />
                                            {item.students} Siswa
                                        </span>
                                    </div>

                                    {/* Detail Nama Kelas & Sekolah */}
                                    <div className="mb-4">
                                        <h3 className="font-bold text-base text-gray-800 group-hover:text-amber-800 transition-colors duration-200 leading-tight">
                                            {item.title}
                                        </h3>
                                        <p className="text-[11px] text-gray-400 font-medium mt-1">
                                            {item.school_name}
                                        </p>
                                    </div>

                                    {/* Fitur Token Akses Horizontal + Tombol Klik Salin */}
                                    <div className="flex items-center justify-between bg-gray-50/80 border border-gray-100 rounded-xl p-2.5 mb-5">
                                        <div className="flex flex-col">
                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Token Siswa</span>
                                            <span className="text-xs font-mono font-bold text-amber-900 tracking-wide mt-0.5">{item.token}</span>
                                        </div>
                                        <button
                                            onClick={() => handleCopyToken(item.token)}
                                            className="p-1.5 rounded-lg bg-white border border-gray-200 text-gray-500 hover:text-amber-800 hover:border-amber-200 shadow-2xs transition cursor-pointer"
                                            title="Salin Token"
                                        >
                                            {copiedToken === item.token ? (
                                                <span className="text-[10px] text-green-600 font-bold flex items-center gap-0.5 px-1">✓ Berhasil</span>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* Info Asesmen Terakhir & Progress */}
                                <div className="mt-auto">
                                    <div className="border-t border-gray-100/70 pt-4 mb-3">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Asesmen Terakhir</p>
                                        <p className="text-xs font-semibold text-gray-600 truncate">{item.latest}</p>
                                    </div>

                                    <div className="space-y-1.5">
                                        <div className="flex justify-between items-center text-[11px] font-medium">
                                            <span className="text-gray-400">Rata-rata Nilai</span>
                                            <span className="font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded text-[10px]">{item.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-amber-700 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${item.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Tombol Footer Kelola Kelas */}
                            <button
                                onClick={() => {
                                    setSelectedClassId(item.id); // 1. Simpan ID kelas yang diklik
                                    setCurrentTab('classes');    // 2. Alihkan halaman ke manajemen kelas
                                }}
                                className="w-full bg-gray-50/50 hover:bg-amber-700/5 px-5 py-3 border-t border-gray-100 text-left text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center justify-between group/btn transition-all duration-200 cursor-pointer"
                            >
                                <span>Kelola Kelas</span>
                                <ArrowRight size={14} className="transform group-hover/btn:translate-x-1 transition-transform duration-200" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* 2. Panggil komponen modal di sini dengan menyalurkan props yang dibutuhkan */}
            <ClassModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={onCreateClass}
            />
        </div>
    );
}