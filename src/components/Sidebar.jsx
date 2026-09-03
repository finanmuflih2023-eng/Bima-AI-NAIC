import React, { useState } from 'react';
import { LayoutDashboard, BookOpen, Cpu, BarChart3, Settings, LogOut, Menu, AlertTriangle, RefreshCw } from 'lucide-react';

// 1. Tangkap 'handleLogout' di parameter props paling atas
// PASTIKAN 'setIsSidebarOpen' ADA DI DALAM KURUNG KURAWAL PROPS INI:
export default function Sidebar({ isSidebarOpen: isOpen, setIsSidebarOpen, currentTab, setCurrentTab, handleLogout, userRole, setUserRole }) {
    // State lokal untuk mengontrol pop-up konfirmasi logout
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const menus = [
        { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard },
        { id: 'classes', name: 'My Classes', icon: BookOpen },
        { id: 'ai-generator', name: 'AI Generator', icon: Cpu },
        { id: 'analytics', name: 'Analytics', icon: BarChart3 },
        { id: 'settings', name: 'Settings', icon: Settings },
    ];

    return (
        <>
            <aside
                className={`bg-[#3E2723] flex flex-col justify-between min-h-screen text-left select-none shadow-md shrink-0 transition-all duration-300 ease-in-out ${isOpen ? 'w-64 p-6' : 'w-20 py-6 px-4 items-center'
                    }`}
            >
                <div className="w-full flex flex-col items-center">
                    {/* Header Sidebar */}
                    <div className={`flex items-center mb-10 w-full transition-all duration-300 ${isOpen ? 'justify-between px-2' : 'flex-col gap-4 justify-center'}`}>
                        <div 
                            onClick={() => !isOpen && setIsSidebarOpen(true)}
                            className={`flex items-center gap-3 transition-all duration-300 ${!isOpen ? 'cursor-pointer hover:scale-105' : ''}`}
                        >
                            <img src="/logo.png" alt="BIMA AI Logo" className="h-10 w-10 object-contain rounded-lg shrink-0" />
                            <h1 className={`text-xl font-black text-white tracking-wider font-sans whitespace-nowrap transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 h-0 pointer-events-none'
                                }`}>
                                BIMA <span className="text-amber-400">AI</span>
                            </h1>
                        </div>

                        <button
                            onClick={() => setIsSidebarOpen(!isOpen)}
                            className="p-2 hover:bg-white/10 rounded-lg text-amber-200 transition-colors cursor-pointer shrink-0"
                        >
                            <Menu size={20} strokeWidth={2} />
                        </button>
                    </div>

                    {/* Menu Navigasi */}
                    <nav className="flex flex-col gap-1.5 w-full">
                        {menus.map((menu) => {
                            const Icon = menu.icon;
                            const isMenuAllignedActive = currentTab === menu.id;

                            return (
                                <button
                                    key={menu.id}
                                    type="button"
                                    onClick={() => {
                                        if (
                                            menu.id === 'dashboard' ||
                                            menu.id === 'classes' ||
                                            menu.id === 'ai-generator' ||
                                            menu.id === 'analytics' ||
                                            menu.id === 'settings'
                                        ) {
                                            setCurrentTab(menu.id);
                                        }
                                    }}
                                    className={`flex items-center rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap cursor-pointer ${isOpen ? 'px-4 py-3 gap-3' : 'p-3 justify-center'
                                        } ${isMenuAllignedActive
                                            ? 'bg-amber-700 text-white shadow-sm'
                                            : 'text-amber-200/70 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <Icon size={18} strokeWidth={2} className="shrink-0" />
                                    <span className={`transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 pointer-events-none overflow-hidden'
                                        }`}>
                                        {menu.name}
                                    </span>
                                </button>
                            );
                        })}
                    </nav>
                </div>



                {/* 2. Tombol Logout Diaktifkan dengan onClick */}
                <div className="w-full">
                    <button
                        onClick={() => setShowLogoutConfirm(true)} // Memicu pop-up muncul
                        className={`w-full bg-white/10 text-amber-200 hover:bg-red-600/20 hover:text-red-300 rounded-xl font-bold flex items-center transition-all duration-300 text-xs whitespace-nowrap cursor-pointer ${isOpen ? 'px-4 py-2.5 gap-2 justify-center' : 'p-3 justify-center'
                            }`}
                    >
                        <LogOut size={14} strokeWidth={2} className="shrink-0" />
                        <span className={`transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 pointer-events-none overflow-hidden'}`}>
                            Logout
                        </span>
                    </button>
                </div>
            </aside>

            {/* 3. POP-UP MODAL KONFIRMASI LOGOUT (Tema Cokelat Elegan BIMA AI) */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 max-w-sm w-full shadow-2xl text-center">

                        {/* Ikon Peringatan */}
                        <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center text-amber-700 mx-auto mb-4">
                            <AlertTriangle size={22} />
                        </div>

                        {/* Konten Teks */}
                        <h3 className="font-black text-gray-900 text-sm tracking-tight mb-1">Konfirmasi Keluar</h3>
                        <p className="text-xs text-gray-400 font-medium px-2 leading-relaxed">
                            Apakah Anda yakin ingin keluar dari BIMA AI? Anda harus memasukkan kredensial pengajar kembali nanti.
                        </p>

                        {/* Pilihan Tombol Aksi */}
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
                                    handleLogout(); // Menjalankan fungsi logout cloud global
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