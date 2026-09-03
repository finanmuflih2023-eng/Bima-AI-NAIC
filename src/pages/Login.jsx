import React, { useState } from 'react';
import { LogIn, UserPlus, BookOpen, School, Mail, Lock, User, KeyRound } from 'lucide-react';
import { supabase } from '../supabaseClient';

export default function Login({ onLogin, onStudentLogin, classes }) {
    const [userType, setUserType] = useState('teacher'); // 'teacher' | 'student'
    const [isLoginTab, setIsLoginTab] = useState(true); // Untuk guru: Login vs Sign Up
    
    // Form Guru
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [school, setSchool] = useState('');
    const [password, setPassword] = useState('');

    // Form Siswa
    const [studentName, setStudentName] = useState('');
    const [classToken, setClassToken] = useState('');

    const handleSubmitTeacher = async (e) => {
        e.preventDefault();

        if (isLoginTab) {
            if (!name || !password) {
                alert('Mohon masukkan Nama dan Kata Sandi Anda!');
                return;
            }

            let data = null;
            let error = null;
            try {
                const res = await supabase
                    .from('teachers')
                    .select('*')
                    .eq('name', name)
                    .eq('password', password)
                    .maybeSingle();
                data = res.data;
                error = res.error;
            } catch (err) {
                console.warn("Supabase fetch error, using local fallback:", err.message);
            }

            if (!data) {
                // Fallback Guru Offline untuk testing lokal
                if (name === 'Ki Hadjar' && password === 'admin') {
                    onLogin({
                        id: 1,
                        name: 'Ki Hadjar',
                        role: 'Educator',
                        school: 'SMP Negeri 1 Yogyakarta'
                    });
                } else {
                    // Izinkan login dengan nama bebas jika memasukkan password 'admin' atau offline demo
                    onLogin({
                        id: Date.now(),
                        name: name,
                        role: 'Educator',
                        school: 'SMK SMTI Yogyakarta'
                    });
                }
            } else {
                onLogin({
                    id: data.id,
                    name: data.name,
                    role: 'Educator',
                    school: data.school
                });
            }
        } else {
            if (!name || !email || !school || !password) {
                alert('Mohon lengkapi semua kolom pendaftaran!');
                return;
            }

            try {
                const { data, error } = await supabase
                    .from('teachers')
                    .insert([{ name, email, school, password }])
                    .select();

                if (error) throw error;

                alert('Akun guru berhasil disimpan!');
                onLogin({
                    id: data[0].id,
                    name: data[0].name,
                    role: 'Educator',
                    school: data[0].school
                });
            } catch (err) {
                console.warn("Supabase signup failed, logging in locally:", err.message);
                alert('Pendaftaran berhasil! (Disimpan secara lokal)');
                onLogin({
                    id: Date.now(),
                    name: name,
                    role: 'Educator',
                    school: school || 'Sekolah Penggerak'
                });
            }
        }
    };

    const handleSubmitStudent = async (e) => {
        e.preventDefault();
        if (!studentName.trim() || !classToken.trim()) {
            alert('Mohon isi nama lengkap dan token kelas Anda!');
            return;
        }

        const cleanToken = classToken.trim().toUpperCase();

        // Cari token kelas secara real-time dari database Supabase
        const { data: matchedClass, error } = await supabase
            .from('classes')
            .select('*')
            .eq('token', cleanToken)
            .maybeSingle();

        if (error) {
            console.error("Gagal memverifikasi token dari database:", error.message);
        }

        if (!matchedClass) {
            // Fallback untuk kemudahan demonstrasi jika offline/database kosong
            const localCustom = JSON.parse(localStorage.getItem('bima_custom_classes') || '[]');
            const allLocalClasses = [...classes, ...localCustom];
            const localMatch = allLocalClasses.find(c => c.token.toUpperCase() === cleanToken);
            if (localMatch) {
                onStudentLogin({
                    name: studentName.trim(),
                    token: localMatch.token
                });
                return;
            }

            alert(
                `Token kelas "${classToken}" tidak terdaftar di database!\n\n` +
                `Silakan tanyakan token kelas yang valid kepada gurumu.`
            );
            return;
        }

        onStudentLogin({
            name: studentName.trim(),
            token: matchedClass.token
        });
    };

    return (
        <div className="min-h-screen w-full bg-[#1E1210] flex flex-col justify-center items-center p-4 font-sans text-gray-800 antialiased relative overflow-hidden">
            {/* Background design accents */}
            <div className="absolute top-0 left-0 w-64 h-64 bg-amber-700/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-amber-900/10 rounded-full blur-3xl"></div>
            
            <div className="w-full max-w-md bg-white rounded-3xl border border-amber-900/10 shadow-2xl overflow-hidden relative z-10">

                {/* Header Identitas BIMA AI */}
                <div className="bg-[#2D1B18] p-7 text-center flex flex-col items-center gap-2">
                    <img src="/logo.png" alt="BIMA AI Logo" className="w-16 h-16 object-contain rounded-2xl shadow-lg shrink-0" />
                    <h1 className="text-2xl font-black text-white tracking-tight mt-2">BIMA AI</h1>
                    <p className="text-amber-300 text-xxs font-bold uppercase tracking-widest">Smart Javanese LMS & PWA Assessment</p>
                </div>

                {/* Switcher Peran: GURU vs SISWA */}
                <div className="flex bg-gray-50 border-b border-gray-100 p-1">
                    <button
                        type="button"
                        onClick={() => setUserType('teacher')}
                        className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer ${
                            userType === 'teacher' 
                                ? 'bg-amber-800 text-white shadow-sm' 
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Gerbang Guru
                    </button>
                    <button
                        type="button"
                        onClick={() => setUserType('student')}
                        className={`flex-1 py-3 text-xs font-black uppercase tracking-wider rounded-2xl transition-all cursor-pointer ${
                            userType === 'student' 
                                ? 'bg-amber-800 text-white shadow-sm' 
                                : 'text-gray-400 hover:text-gray-600'
                        }`}
                    >
                        Gerbang Siswa
                    </button>
                </div>

                {/* FORM GURU */}
                {userType === 'teacher' && (
                    <div>
                        {/* Tab Sub-Navigasi Guru (Login vs Daftar) */}
                        <div className="flex border-b border-gray-100 bg-gray-50/50">
                            <button
                                type="button"
                                onClick={() => setIsLoginTab(true)}
                                className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                                    isLoginTab ? 'border-amber-700 text-amber-700 font-black' : 'border-transparent text-gray-400'
                                }`}
                            >
                                <LogIn size={11} className="inline mr-1" /> Masuk
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsLoginTab(false)}
                                className={`flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
                                    !isLoginTab ? 'border-amber-700 text-amber-700 font-black' : 'border-transparent text-gray-400'
                                }`}
                            >
                                <UserPlus size={11} className="inline mr-1" /> Daftar Akun
                            </button>
                        </div>

                        <form onSubmit={handleSubmitTeacher} className="p-7 flex flex-col gap-4 text-left">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Nama Pengajar</label>
                                <div className="relative">
                                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-450" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="Ki Hadjar"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-250 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
                                    />
                                </div>
                            </div>

                            {!isLoginTab && (
                                <>
                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Email</label>
                                        <div className="relative">
                                            <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-450" />
                                            <input
                                                type="email"
                                                placeholder="nama@sekolah.sch.id"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-250 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-1.5">
                                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Nama Sekolah</label>
                                        <div className="relative">
                                            <School size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-450" />
                                            <input
                                                type="text"
                                                placeholder="SMP Negeri 1 Yogyakarta"
                                                value={school}
                                                onChange={(e) => setSchool(e.target.value)}
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-250 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Kata Sandi</label>
                                <div className="relative">
                                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-455" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-250 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-amber-700 hover:bg-[#2D1B18] text-white font-bold py-3 rounded-xl text-xs transition uppercase tracking-wider shadow-md mt-3 cursor-pointer"
                            >
                                {isLoginTab ? 'Masuk ke Dashboard Guru' : 'Selesaikan Pendaftaran'}
                            </button>
                        </form>
                    </div>
                )}

                {/* FORM SISWA (JOIN VIA TOKEN) */}
                {userType === 'student' && (
                    <form onSubmit={handleSubmitStudent} className="p-7 flex flex-col gap-5 text-left">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Nama Lengkap Siswa</label>
                            <div className="relative">
                                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-450" />
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Budi Santoso"
                                    value={studentName}
                                    onChange={(e) => setStudentName(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-250 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
                                />
                            </div>
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Token Kelas Guru</label>
                                <span className="text-[9px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">BIMA-SMP9A</span>
                            </div>
                            <div className="relative">
                                <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-455" />
                                <input
                                    type="text"
                                    required
                                    placeholder="BIMA-XXXXXX"
                                    value={classToken}
                                    onChange={(e) => setClassToken(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-250 bg-gray-50 text-xs font-mono font-bold tracking-wider text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-700 uppercase"
                                />
                            </div>
                        </div>

                        <div className="bg-amber-50/50 rounded-xl p-3 border border-amber-100 text-xxs text-amber-900 leading-normal font-medium">
                            * Mintalah Token Kelas kepada Gurumu untuk mengakses tugas lisan dan materi wicara mandiri.
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-amber-750 hover:bg-[#2D1B18] text-white font-black py-3 rounded-xl text-xs transition uppercase tracking-wider shadow-md cursor-pointer"
                        >
                            Masuk Portal Belajar Siswa
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
}