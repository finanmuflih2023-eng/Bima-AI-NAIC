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
    const [isStudentLoginTab, setIsStudentLoginTab] = useState(true);
    const [studentName, setStudentName] = useState('');
    const [studentUsername, setStudentUsername] = useState('');
    const [studentPassword, setStudentPassword] = useState('');
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
                // Check local registered teachers fallback
                const localTeachers = JSON.parse(localStorage.getItem('bima_registered_teachers') || '[]');
                const matchedLocal = localTeachers.find(t => t.name.toLowerCase() === name.toLowerCase() && t.password === password);

                if (name === 'Ki Hadjar' && password === 'admin') {
                    onLogin({
                        id: 1,
                        name: 'Ki Hadjar',
                        role: 'Educator',
                        school: 'SMP Negeri 1 Yogyakarta'
                    });
                } else if (matchedLocal) {
                    onLogin({
                        id: matchedLocal.id,
                        name: matchedLocal.name,
                        role: 'Educator',
                        school: matchedLocal.school || 'Sekolah Penggerak'
                    });
                } else {
                    alert('Login Gagal! Nama Pengajar atau Kata Sandi Anda salah.');
                    return;
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

            const newTeacherObj = {
                id: Date.now(),
                name,
                email,
                school,
                password
            };

            try {
                const { data: inserted, error } = await supabase
                    .from('teachers')
                    .insert([{ name, email, school, password }])
                    .select();

                if (!error && inserted && inserted.length > 0) {
                    newTeacherObj.id = inserted[0].id;
                }
            } catch (err) {
                console.warn("Supabase signup failed, saving locally:", err.message);
            }

            // Save to local registered teachers
            const existingTeachers = JSON.parse(localStorage.getItem('bima_registered_teachers') || '[]');
            localStorage.setItem('bima_registered_teachers', JSON.stringify([...existingTeachers, newTeacherObj]));

            alert(`Pendaftaran Akun Guru ${name} Berhasil! Silakan masuk.`);
            onLogin({
                id: newTeacherObj.id,
                name: newTeacherObj.name,
                role: 'Educator',
                school: newTeacherObj.school
            });
        }
    };

    const handleSubmitStudent = async (e) => {
        e.preventDefault();
        
        if (isStudentLoginTab) {
            // LOGIN SISWA
            if (!studentUsername.trim() || !studentPassword.trim()) {
                alert('Mohon isi Username / NIS dan Kata Sandi Anda!');
                return;
            }

            let data = null;
            try {
                const res = await supabase
                    .from('students')
                    .select('*')
                    .eq('username', studentUsername.trim())
                    .eq('password', studentPassword.trim())
                    .maybeSingle();
                data = res.data;
            } catch (err) {
                console.warn("Supabase student fetch error, using local fallback");
            }

            let authenticatedStudent = data;

            if (!authenticatedStudent) {
                const localStudents = JSON.parse(localStorage.getItem('bima_registered_students') || '[]');
                const matched = localStudents.find(s => 
                    (s.username.toLowerCase() === studentUsername.trim().toLowerCase() || s.name.toLowerCase() === studentUsername.trim().toLowerCase()) && 
                    s.password === studentPassword.trim()
                );
                if (matched) {
                    authenticatedStudent = matched;
                } else if (studentUsername === 'budi' && studentPassword === '123456') {
                    authenticatedStudent = {
                        id: 'stud-1',
                        name: 'Budi Santoso',
                        username: 'budi',
                        token: classToken.trim().toUpperCase() || 'BIMA-SMP9A'
                    };
                }
            }

            if (!authenticatedStudent) {
                alert('Login Siswa Gagal! Username/NIS atau Kata Sandi salah.');
                return;
            }

            const cleanToken = classToken.trim().toUpperCase() || authenticatedStudent.token || 'BIMA-SMP9A';

            onStudentLogin({
                id: authenticatedStudent.id,
                name: authenticatedStudent.name,
                username: authenticatedStudent.username,
                token: cleanToken
            });
        } else {
            // PENDAFTARAN AKUN SISWA BARU
            if (!studentName.trim() || !studentUsername.trim() || !studentPassword.trim() || !classToken.trim()) {
                alert('Mohon isi semua kolom pendaftaran siswa dan token kelas!');
                return;
            }

            const cleanToken = classToken.trim().toUpperCase();

            const newStudent = {
                id: 'student-' + Date.now(),
                name: studentName.trim(),
                username: studentUsername.trim(),
                password: studentPassword.trim(),
                token: cleanToken
            };

            try {
                const { data: inserted, error } = await supabase
                    .from('students')
                    .insert([{
                        name: newStudent.name,
                        username: newStudent.username,
                        password: newStudent.password,
                        token: cleanToken
                    }])
                    .select();
                if (!error && inserted && inserted.length > 0) {
                    newStudent.id = inserted[0].id;
                }
            } catch (err) {
                console.warn("Supabase student signup fallback to LocalStorage");
            }

            const existingStudents = JSON.parse(localStorage.getItem('bima_registered_students') || '[]');
            localStorage.setItem('bima_registered_students', JSON.stringify([...existingStudents, newStudent]));

            alert(`Pendaftaran Akun Siswa "${newStudent.name}" Berhasil!`);

            onStudentLogin({
                id: newStudent.id,
                name: newStudent.name,
                username: newStudent.username,
                token: cleanToken
            });
        }
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

                {/* FORM SISWA (AUTHENTICATED LOGIN & SIGNUP) */}
                {userType === 'student' && (
                    <div className="p-7 flex flex-col gap-4 text-left">
                        {/* Sub-tab: Login Siswa vs Daftar Siswa */}
                        <div className="flex border-b border-gray-150 pb-2 mb-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setIsStudentLoginTab(true)}
                                className={`text-xs font-bold uppercase tracking-wider pb-1 transition cursor-pointer ${
                                    isStudentLoginTab
                                        ? 'text-amber-800 border-b-2 border-amber-800 font-black'
                                        : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                Masuk Siswa
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsStudentLoginTab(false)}
                                className={`text-xs font-bold uppercase tracking-wider pb-1 transition cursor-pointer ${
                                    !isStudentLoginTab
                                        ? 'text-amber-800 border-b-2 border-amber-800 font-black'
                                        : 'text-gray-400 hover:text-gray-600'
                                }`}
                            >
                                Daftar Akun Baru
                            </button>
                        </div>

                        <form onSubmit={handleSubmitStudent} className="flex flex-col gap-4">
                            {!isStudentLoginTab && (
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Nama Lengkap Siswa</label>
                                    <div className="relative">
                                        <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-450" />
                                        <input
                                            type="text"
                                            required
                                            placeholder="Contoh: Budi Santoso"
                                            value={studentName}
                                            onChange={(e) => setStudentName(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-250 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Username / NIS</label>
                                <div className="relative">
                                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-450" />
                                    <input
                                        type="text"
                                        required
                                        placeholder="username_siswa atau NIS"
                                        value={studentUsername}
                                        onChange={(e) => setStudentUsername(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-250 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Kata Sandi</label>
                                <div className="relative">
                                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-455" />
                                    <input
                                        type="password"
                                        required
                                        placeholder="••••••••"
                                        value={studentPassword}
                                        onChange={(e) => setStudentPassword(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-250 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-700"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                                        {isStudentLoginTab ? 'Token Kelas (Opsional - Otomatis Menggunakan Kelas Terdaftar)' : 'Token Kelas Guru (Wajib)'}
                                    </label>
                                    <span className="text-[9px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">BIMA-SMP9A</span>
                                </div>
                                <div className="relative">
                                    <KeyRound size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-455" />
                                    <input
                                        type="text"
                                        required={!isStudentLoginTab}
                                        placeholder="BIMA-XXXXXX"
                                        value={classToken}
                                        onChange={(e) => setClassToken(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-250 bg-gray-50 text-xs font-mono font-bold tracking-wider text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-700 uppercase"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="w-full bg-amber-750 hover:bg-[#2D1B18] text-white font-black py-3 rounded-xl text-xs transition uppercase tracking-wider shadow-md cursor-pointer mt-2"
                            >
                                {isStudentLoginTab ? 'Masuk Portal Belajar Siswa' : 'Daftar & Masuk Portal Siswa'}
                            </button>
                        </form>
                    </div>
                )}

            </div>
        </div>
    );
}