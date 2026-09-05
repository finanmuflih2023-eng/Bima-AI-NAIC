import React, { useState } from 'react';
import { Search, Plus, Filter, LayoutGrid, List, Users, ArrowLeft, Trash2 } from 'lucide-react';

export default function MyClasses({
    classes,
    selectedClassId,
    setSelectedClassId,
    onDeleteClass,
    user,
    tasks = [],
    onDeleteTask
}) {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    // 1. Logika: Jika ada ID kelas yang dipilih dari Dashboard, tampilkan Detail Manajemen Kelas
    const activeClass = classes.find(c => c.id === selectedClassId);

    if (activeClass) {
        // Cari tugas lisan yang aktif dirilis ke token kelas ini
        const activeTasks = tasks.filter(t => t.classToken === activeClass.token);
        const classEnrollments = (enrollments || []).filter(e => e.class_token === activeClass.token);
        const classAnnouncements = (announcements || []).filter(a => a.class_token === activeClass.token);
        const classSubmissions = (submissions || []).filter(s => s.classToken === activeClass.token);

        return (
            <div className="p-8 text-left font-sans text-gray-800 antialiased w-full">
                {/* Tombol Navigasi Kembali */}
                <button
                    onClick={() => setSelectedClassId(null)}
                    className="text-xxs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-1 hover:text-amber-800 transition cursor-pointer"
                >
                    <ArrowLeft size={12} /> Kembali ke semua kelas
                </button>

                {/* Header Manajemen Kelas */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-gray-200 shadow-xs gap-4 w-full">
                    <div>
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                            {activeClass.level} • {activeClass.school_type}
                        </span>
                        <h1 className="text-2xl font-black text-gray-900 mt-2 tracking-tight">{activeClass.title}</h1>
                        <p className="text-xs text-gray-400 font-medium mt-1">
                            {activeClass.school_name} • Pengajar: <strong className="text-gray-700">{activeClass.created_by || user?.name}</strong> • Token Akses: <span className="font-mono font-black text-amber-900 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{activeClass.token}</span>
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            if (confirm(`Apakah Anda yakin ingin menghapus kelas "${activeClass.title}"?`)) {
                                onDeleteClass(activeClass.id);
                                setSelectedClassId(null);
                            }
                        }}
                        className="bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2.5 rounded-xl text-xs active:scale-95 transition-all duration-200 shadow-2xs cursor-pointer flex items-center gap-2"
                    >
                        <Trash2 size={14} />
                        Hapus Kelas
                    </button>
                </div>

                {/* Split grid: Student Roster vs Released Tasks */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    
                    {/* Card 1: Class Roster & Kick Student */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs text-left">
                        <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                            <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wider flex items-center gap-2">
                                <Users size={16} className="text-amber-800" />
                                Daftar Siswa Terdaftar ({classEnrollments.length})
                            </h3>
                            <span className="text-xxs text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-mono font-bold">
                                {activeClass.token}
                            </span>
                        </div>

                        {classEnrollments.length === 0 ? (
                            <p className="text-xs text-gray-450 italic text-center py-8">
                                Belum ada siswa yang mendaftar menggunakan token kelas ini.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                                {classEnrollments.map((enr) => (
                                    <div key={enr.id} className="bg-gray-50/80 border border-gray-150 rounded-xl p-3 flex justify-between items-center">
                                        <div>
                                            <h4 className="text-xs font-bold text-gray-900">{enr.student_name}</h4>
                                            <p className="text-[10px] text-gray-400 font-mono">@{enr.student_username} • Bergabung: {enr.joined_at}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Keluarkan siswa "${enr.student_name}" dari kelas ini?`)) {
                                                    onKickStudent(enr.id);
                                                }
                                            }}
                                            className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition"
                                        >
                                            Keluarkan
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Card 2: Released Javanese Tasks */}
                    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs text-left">
                        <h3 className="font-bold text-sm text-gray-800 mb-3 uppercase tracking-wider pb-2 border-b border-gray-100">
                            Daftar Tugas Lisan Aktif ({activeTasks.length})
                        </h3>
                        
                        {activeTasks.length === 0 ? (
                            <p className="text-xs text-gray-450 italic text-center py-10">
                                Belum ada tugas wicara yang dirilis ke kelas ini. Gunakan AI Generator untuk merilis soal baru.
                            </p>
                        ) : (
                            <div className="flex flex-col gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                                {activeTasks.map((t) => (
                                    <div key={t.id} className="bg-gray-50/70 border border-gray-100 rounded-xl p-3 flex justify-between items-start gap-4">
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-1.5 mb-1">
                                                <span className="text-[8px] font-black text-amber-800 bg-amber-50 px-1 py-0.5 rounded uppercase">
                                                    {t.level}
                                                </span>
                                                <span className="text-[9px] text-gray-400 font-semibold">{t.context}</span>
                                            </div>
                                            <h4 className="text-xs font-bold text-gray-900 leading-snug truncate">{t.title}</h4>
                                            <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{t.scenario}</p>
                                        </div>
                                        <button
                                            onClick={() => {
                                                if (confirm(`Apakah Anda yakin ingin menghapus tugas "${t.title}" dari kelas ini?`)) {
                                                    onDeleteTask(t.id);
                                                }
                                            }}
                                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer shrink-0"
                                            title="Hapus Tugas"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>

                {/* Section 3: Classroom Stream / Pengumuman & Komentar */}
                <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs text-left">
                    <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
                        📢 Pengumuman & Diskusi Stream Kelas
                    </h3>

                    {/* Form Tulis Pengumuman */}
                    <form 
                        onSubmit={(e) => {
                            e.preventDefault();
                            const content = e.target.elements.annContent.value;
                            if (content.trim()) {
                                onPostAnnouncement(activeClass.token, content.trim());
                                e.target.reset();
                            }
                        }}
                        className="flex flex-col gap-2 mb-6"
                    >
                        <textarea
                            name="annContent"
                            required
                            rows="2"
                            placeholder="Tulis pesan atau pengumuman untuk siswa di kelas ini..."
                            className="w-full text-xs p-3 border border-gray-250 rounded-xl bg-gray-50 focus:outline-none focus:ring-1 focus:ring-amber-700"
                        />
                        <button 
                            type="submit"
                            className="self-end bg-amber-800 hover:bg-amber-950 text-white font-bold px-4 py-2 rounded-xl text-xxs transition cursor-pointer"
                        >
                            Kirim Pengumuman
                        </button>
                    </form>

                    {/* List Pengumuman */}
                    <div className="flex flex-col gap-4">
                        {classAnnouncements.length === 0 ? (
                            <p className="text-xs text-gray-400 italic">Belum ada pengumuman di kelas ini.</p>
                        ) : (
                            classAnnouncements.map((ann) => {
                                const annComments = (comments || []).filter(c => c.announcement_id === ann.id);
                                return (
                                    <div key={ann.id} className="bg-amber-50/40 border border-amber-100 rounded-xl p-4 text-xs">
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-bold text-amber-900">{ann.teacher_name}</span>
                                            <span className="text-[10px] text-gray-400">{ann.created_at}</span>
                                        </div>
                                        <p className="text-gray-800 text-xs leading-relaxed">{ann.content}</p>

                                        {/* Diskusi Komentar */}
                                        <div className="mt-3 pt-3 border-t border-amber-200/50 flex flex-col gap-2">
                                            {annComments.map((c) => (
                                                <div key={c.id} className="bg-white p-2.5 rounded-lg border border-gray-150 text-xxs">
                                                    <span className="font-bold text-gray-900">{c.author_name}</span>: <span className="text-gray-700">{c.content}</span>
                                                </div>
                                            ))}

                                            {/* Input komentar guru */}
                                            <form 
                                                onSubmit={(e) => {
                                                    e.preventDefault();
                                                    const commText = e.target.elements.commText.value;
                                                    if (commText.trim()) {
                                                        onPostComment(ann.id, user?.name || 'Guru', commText.trim());
                                                        e.target.reset();
                                                    }
                                                }}
                                                className="flex gap-2 mt-1"
                                            >
                                                <input 
                                                    type="text" 
                                                    name="commText" 
                                                    required 
                                                    placeholder="Balas komentar..." 
                                                    className="flex-1 text-xxs p-2 border border-gray-200 rounded-lg bg-white"
                                                />
                                                <button type="submit" className="bg-amber-800 text-white font-bold px-3 py-1 rounded-lg text-xxs">
                                                    Kirim
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Section 4: Submission Score Override & Teacher Manual Feedback */}
                <div className="mt-6 bg-white rounded-2xl border border-gray-200 p-6 shadow-xs text-left">
                    <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider mb-4 pb-2 border-b border-gray-100">
                        📝 Penilaian Tugas Siswa & Override Nilai Guru ({classSubmissions.length})
                    </h3>

                    {classSubmissions.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">Belum ada hasil pengumpulan tugas siswa di kelas ini.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {classSubmissions.map((sub) => (
                                <div key={sub.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-extrabold text-gray-900">{sub.studentName}</span>
                                            <span className="text-[10px] text-gray-400">• Tugas: {sub.taskTitle}</span>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black ${sub.score >= 75 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                                                Nilai: {sub.score}%
                                            </span>
                                        </div>
                                        <p className="text-gray-600 italic text-xxs mb-1">"{sub.transcript}"</p>
                                        {sub.teacherComment && (
                                            <p className="text-amber-900 bg-amber-50 border border-amber-200 p-1.5 rounded text-xxs font-semibold">
                                                💬 Komentar Guru: {sub.teacherComment}
                                            </p>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => {
                                            const newScore = prompt(`Ubah Nilai Keseluruhan untuk ${sub.studentName} (Saat ini: ${sub.score}%):`, sub.score);
                                            if (newScore !== null) {
                                                const scoreNum = parseInt(newScore, 10);
                                                const comment = prompt(`Beri Catatan / Komentar Manual Guru untuk ${sub.studentName}:`, sub.teacherComment || '');
                                                if (!isNaN(scoreNum)) {
                                                    onUpdateSubmission(sub.id, {
                                                        score: scoreNum,
                                                        teacherComment: comment || ''
                                                    });
                                                    alert('Nilai dan komentar guru berhasil diperbarui!');
                                                }
                                            }
                                        }}
                                        className="bg-amber-800 hover:bg-amber-950 text-white font-bold px-3 py-2 rounded-xl text-xxs shrink-0 cursor-pointer"
                                    >
                                        ✏️ Ubah Nilai & Komentar
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        );
    }

    // 2. Logika Utama: Jika tidak ada kelas terpilih, tampilkan Semua Daftar Kelas
    const filteredClasses = classes.filter(cls => {
        const matchesSearch = cls.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesSearch;
    });

    return (
        <div className="p-8 font-sans text-gray-800 antialiased w-full text-left">
            {/* Top Header */}
            <header className="flex justify-between items-center mb-8 w-full bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4">
                <div className="relative w-80 max-w-full">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari nama kelas..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-xs focus:outline-none focus:ring-1 focus:ring-amber-700 text-gray-800"
                    />
                </div>

                <div className="flex items-center gap-3 text-right shrink-0">
                    <div>
                        <p className="font-bold text-xs text-gray-900">{user?.name || 'Pengajar'}</p>
                        <p className="text-xxs text-gray-400 font-medium truncate max-w-[120px]">{user?.school || 'BIMA AI Educator'}</p>
                    </div>
                    <div className="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase">
                        {user?.name ? user.name.substring(0, 2) : 'BM'}
                    </div>
                </div>
            </header>

            {/* Section Title */}
            <section className="mb-6 w-full flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Daftar Kelas Saya</h2>
                    <p className="text-gray-500 text-xs">Kelola kurikulum, token siswa, dan pantau perkembangan nilai asesmen kelas.</p>
                </div>
            </section>

            {/* Grid Tampilan Kelas */}
            {filteredClasses.length > 0 ? (
                <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredClasses.map(cls => (
                        <div
                            key={cls.id}
                            className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden flex flex-col justify-between group hover:shadow-md transition-all duration-300"
                        >
                            <div className="p-5">
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded uppercase tracking-wider">
                                        {cls.level} • {cls.school_type}
                                    </span>
                                    <span className="text-gray-400 text-[11px] font-semibold flex items-center gap-1">
                                        <Users size={12} /> {cls.students} Siswa
                                    </span>
                                </div>
                                <h3 className="font-bold text-sm text-gray-800 group-hover:text-amber-800 transition-colors mb-1">{cls.title}</h3>
                                <p className="text-xxs text-gray-400 font-medium mb-3">{cls.school_name}</p>

                                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100 flex justify-between items-center text-xs mb-4">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Token:</span>
                                    <span className="font-mono font-bold text-amber-900">{cls.token}</span>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between text-xxs font-bold text-gray-400 uppercase">
                                        <span>Rata-rata Nilai</span>
                                        <span className="text-amber-800">{cls.progress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                                        <div className="bg-amber-700 h-full" style={{ width: `${cls.progress}%` }}></div>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedClassId(cls.id)}
                                className="w-full bg-gray-50 hover:bg-amber-50 py-2.5 text-center text-xxs font-bold text-amber-800 uppercase tracking-wider border-t border-gray-100 transition cursor-pointer"
                            >
                                Buka Manajemen Kelas
                            </button>
                        </div>
                    ))}
                </section>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center shadow-sm w-full">
                    <p className="text-gray-400 text-sm font-medium">Tidak ada kelas yang ditemukan.</p>
                </div>
            )}
        </div>
    );
}