import React, { useState } from 'react';
import { 
    Search, Sparkles, Wand2, Eye, FileText, CheckCircle2, 
    MessageSquare, ArrowRight, Upload, Edit, Trash, Check, Plus
} from 'lucide-react';

export default function AiGenerator({ 
    user, 
    classes, 
    onPublishTask, 
    currentTab, 
    setCurrentTab 
}) {
    // Mode Input Kurikulum
    const [inputMode, setInputMode] = useState('curriculum'); // 'curriculum' | 'manual'
    const [curriculumText, setCurriculumText] = useState('');
    const [uploadedFileName, setUploadedFileName] = useState('');
    const [isExtracting, setIsExtracting] = useState(false);
    const [extractedKeywords, setExtractedKeywords] = useState([]);
    const [selectedKeywords, setSelectedKeywords] = useState([]);

    // Konfigurasi Asesmen AI
    const [selectedClassToken, setSelectedClassToken] = useState(classes[0]?.token || '');
    const [kramaType, setKramaType] = useState('krama-alus');
    const [contextSituation, setContextSituation] = useState('murid-guru');
    const [count, setCount] = useState(5);
    const [isGenerating, setIsGenerating] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    // List Draft Bank Soal yang bisa disunting/disetujui oleh Guru
    const [draftQuestions, setDraftQuestions] = useState(null);
    const [editingId, setEditingId] = useState(null);
    const [editScenario, setEditScenario] = useState('');
    const [editTarget, setEditTarget] = useState('');
    const [editTitle, setEditTitle] = useState('');

    // --- MOCK PROCESS: EKSTRAKSI KATA KUNCI KOMPETENSI (CURRICULUM INPUT) ---
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadedFileName(file.name);
            setCurriculumText(
                `CAPAIAN PEMBELAJARAN (CP) BAHASA JAWA KURIKULUM MERDEKA\n` +
                `Elemen: Berbicara (Wicara)\n` +
                `Peserta didik mampu menggunakan bahasa Jawa ragam krama alus dan krama lugu secara kontekstual untuk berkomunikasi dengan guru, orang tua, dan masyarakat sekitar (sosiokultural) dengan intonasi dan artikulasi yang tepat (menerapkan konsonan th dan dh Jawa).`
            );
        }
    };

    const handleExtractCompetencies = () => {
        if (!curriculumText.trim()) {
            alert('Mohon ketik atau unggah dokumen CP/ATP terlebih dahulu!');
            return;
        }

        setIsExtracting(true);
        setTimeout(() => {
            setIsExtracting(false);
            const keywords = [
                { id: 'kw-1', word: 'Pacelathon (Percakapan)', category: 'Materi' },
                { id: 'kw-2', word: 'Krama Alus (Sopan Tinggi)', category: 'Speech Level' },
                { id: 'kw-3', word: 'Krama Lugu (Sopan Netral)', category: 'Speech Level' },
                { id: 'kw-4', word: 'Sosiokultural (Orang Tua/Guru)', category: 'Konteks' },
                { id: 'kw-5', word: 'Artikulasi Konsonan th/dh', category: 'Fonetik' },
                { id: 'kw-6', word: 'Unggah-Ungguh Basa', category: 'Pragmatik' }
            ];
            setExtractedKeywords(keywords);
            setSelectedKeywords(keywords.map(k => k.id)); // Select all by default
        }, 1500);
    };

    const toggleKeyword = (id) => {
        setSelectedKeywords(prev => 
            prev.includes(id) ? prev.filter(k => k !== id) : [...prev, id]
        );
    };

    // --- MOCK ENGINE: GENERATOR SOAL SOSIOKULTURAL LISAN (LLM OLLAMA FALLBACK) ---
    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!selectedClassToken) {
            alert('Silakan pilih kelas target terlebih dahulu!');
            return;
        }

        setIsGenerating(true);
        setErrorMsg(null);
        setDraftQuestions(null);

        const prompt = `Buat ${count} soal evaluasi lisan bahasa Jawa dengan ragam ${kramaType}, konteks sosiokultural ${contextSituation}. Gunakan kompetensi yang diekstrak: ${extractedKeywords.filter(k => selectedKeywords.includes(k.id)).map(k => k.word).join(', ')}`;

        try {
            // Kita coba melakukan post ke API Ollama lokal yang diproxy di /api/generate
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    model: 'bima-ai',
                    prompt: prompt,
                    stream: false,
                    format: 'json'
                }),
            });

            if (!response.ok) {
                throw new Error(`Ollama lokal tidak merespon (HTTP ${response.status}).`);
            }

            const data = await response.json();
            const parsedData = JSON.parse(data.response);
            setDraftQuestions(parsedData);
        } catch (error) {
            console.warn("Menggunakan engine generator sosiokultural lokal BIMA (Local Fallback)...");
            
            // local engine fallback: Membuat draf soal lisan adaptif berkualitas tinggi
            setTimeout(() => {
                const matchedClass = classes.find(c => c.token === selectedClassToken);
                const isSMP = matchedClass ? matchedClass.level === 'SMP' : true;
                
                let fallbacks = [];
                if (kramaType === 'krama-alus') {
                    fallbacks = [
                        {
                            id: 'draft-1',
                            title: 'Pamit Dolan marang Ibu',
                            scenario: 'Sampeyan arep dolan menyang omahe kanca, nanging Ibu nembe maos koran ing ruang tamu. Kepriye anggonmu pamit nggunakake basa Krama Alus sing bener?',
                            level: 'Krama Alus',
                            context: 'anak-wongtuwa',
                            correctTranscript: 'Ibu, kula nyuwun idi badhe kesah dhateng dalemipun kanca.',
                            audioStimulus: 'Bocah-bocah, bayangake kahanan iki. Sampeyan arep dolan menyang omahe kanca, nanging Ibu nembe maos koran ing ruang tamu. Nyaketa, banjur pamita nggunakake basa Krama Alus sing trep.',
                            audioNativeExample: 'Ibu, kula nyuwun idi badhe kesah dhateng dalemipun kanca.'
                        },
                        {
                            id: 'draft-2',
                            title: 'Nyuwun Pirsa Bantuan PR marang Kakak/Bapak',
                            scenario: 'Sampeyan nemoni kesulitan nggarap PR Basa Jawa. Kepriye anggonmu nyuwun tulung marang Bapak nganggo unggah-ungguh Krama Alus?',
                            level: 'Krama Alus',
                            context: 'anak-wongtuwa',
                            correctTranscript: 'Bapak, kula nyuwun tulung badhe nyuwun pirsa babagan PR puniki.',
                            audioStimulus: 'Matur marang bapakmu ing ruang keluarga, nyuwun tulung bab PR Jawa sing angel.',
                            audioNativeExample: 'Bapak, kula nyuwun tulung badhe nyuwun pirsa babagan PR puniki.'
                        },
                        {
                            id: 'draft-3',
                            title: 'Sapa Aruh marang Pak Guru',
                            scenario: 'Sampeyan kepethuk Pak Guru ing dalan nalika arep menyang perpustakaan. Kepriye anggonmu sapa aruh (menyapa) nggunakake unggah-ungguh sing trep?',
                            level: 'Krama Alus',
                            context: 'murid-guru',
                            correctTranscript: 'Sugeng enjang Pak, badhe tindak dhateng perpustakaan nggih?',
                            audioStimulus: 'Bayangake sampeyan mlaku ing koridor sekolah banjur kepethuk Pak Guru sing arep tindak menyang perpustakaan. Kepriye sapa aruh sing sopan?',
                            audioNativeExample: 'Sugeng enjang Pak, badhe tindak dhateng perpustakaan nggih?'
                        }
                    ];
                } else {
                    fallbacks = [
                        {
                            id: 'draft-1',
                            title: 'Tuku Buku ing Toko (Krama Lugu)',
                            scenario: 'Sampeyan arep tuku buku ing toko. Kepriye anggonmu takon rega buku marang bakule nggunakake basa Krama Lugu?',
                            level: 'Krama Lugu',
                            context: 'rekan-sederajat',
                            correctTranscript: 'Mbak, kula badhe tumbas buku puniki, reganipun pinten nggih?',
                            audioStimulus: 'Sampeyan mlebu toko buku, banjur takon rega buku sekolah marang petugas toko nggunakake basa Krama Lugu.',
                            audioNativeExample: 'Mbak, kula badhe tumbas buku puniki, reganipun pinten nggih?'
                        },
                        {
                            id: 'draft-2',
                            title: 'Sapa Aruh marang Kanca Anyar',
                            scenario: 'Sampeyan kepethuk kanca anyar sekelas ing halte bus. Kepriye sapa aruh nganggo Krama Lugu sing santun lan rukun?',
                            level: 'Krama Lugu',
                            context: 'rekan-sederajat',
                            correctTranscript: 'Sugeng siyang, nopo sampeyan ugi nembe ngrantos bus badhe mantuk?',
                            audioStimulus: 'Kenalan karo kanca anyar ing halte bis, sapa nganggo ragam krama lugu.',
                            audioNativeExample: 'Sugeng siyang, nopo sampeyan ugi nembe ngrantos bus badhe mantuk?'
                        }
                    ];
                }

                // Slice based on requested count
                setDraftQuestions(fallbacks.slice(0, count));
            }, 1000);
        } finally {
            setIsGenerating(false);
        }
    };

    // --- FITUR EDIT DRAF SOAL (TEACHER CONTROL PANEL) ---
    const startEditDraft = (q) => {
        setEditingId(q.id);
        setEditTitle(q.title);
        setEditScenario(q.scenario);
        setEditTarget(q.correctTranscript);
    };

    const saveEditDraft = (id) => {
        setDraftQuestions(prev => 
            prev.map(q => q.id === id ? { 
                ...q, 
                title: editTitle, 
                scenario: editScenario, 
                correctTranscript: editTarget,
                audioNativeExample: editTarget 
            } : q)
        );
        setEditingId(null);
    };

    const deleteDraft = (id) => {
        setDraftQuestions(prev => prev.filter(q => q.id !== id));
    };

    // --- APPROVE & PUBLISH (RILIS KE KELAS GURU) ---
    const handleApproveAndPublish = (q) => {
        const matchedClass = classes.find(c => c.token === selectedClassToken);
        const newTask = {
            id: 'task-' + Date.now(),
            classToken: selectedClassToken,
            title: q.title,
            scenario: q.scenario,
            level: q.level,
            context: q.context || contextSituation,
            correctTranscript: q.correctTranscript,
            audioStimulus: q.audioStimulus || q.scenario,
            audioNativeExample: q.correctTranscript
        };

        // Rilis secara global
        onPublishTask(newTask);

        // Hapus dari draf yang tersisa
        setDraftQuestions(prev => prev.filter(item => item.id !== q.id));
    };

    return (
        <div className="p-8 font-sans text-gray-800 antialiased w-full text-left">
            {/* Header Halaman */}
            <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl border border-gray-200 shadow-sm gap-4">
                <div className="relative w-80 max-w-full font-semibold">
                    <span className="text-xs text-amber-800 font-bold bg-amber-50 px-2 py-1 rounded">Kurikulum Merdeka Active</span>
                </div>
                <div className="flex items-center gap-3 text-right shrink-0">
                    <div>
                        <p className="font-bold text-xs text-gray-900">{user?.name || 'Ki Hadjar'}</p>
                        <p className="text-xxs text-gray-400 font-medium">{user?.school || 'SMP Negeri 1 Yogyakarta'}</p>
                    </div>
                    <div className="w-8 h-8 bg-amber-700 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {user?.name ? user.name.substring(0, 2).toUpperCase() : 'KH'}
                    </div>
                </div>
            </header>

            {/* Title Section */}
            <section className="mb-8">
                <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-gray-950 tracking-tight">Krama AI Question Generator</h2>
                    <Sparkles size={20} className="text-amber-500 fill-amber-500 animate-pulse" />
                </div>
                <p className="text-gray-500 text-xs mt-0.5">
                    Modul pembuatan bank soal wicara adaptif berbasis sosiokultural Jawa berdasarkan dokumen kurikulum CP/ATP.
                </p>
            </section>

            {/* SPLIT LAYOUT */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* PANEL KIRI: CURRICULUM INPUT & SETTINGS */}
                <div className="lg:col-span-5 flex flex-col gap-6">
                    
                    {/* TAB PANEL: CURRICULUM INPUT */}
                    <div className="bg-white p-6 rounded-3xl border border-gray-250/70 shadow-2xs">
                        <div className="flex gap-3 mb-5 border-b border-gray-100 pb-3">
                            <button 
                                onClick={() => setInputMode('curriculum')}
                                className={`text-xs font-black uppercase tracking-wider pb-1.5 border-b-2 transition cursor-pointer ${
                                    inputMode === 'curriculum' ? 'border-amber-700 text-amber-900' : 'border-transparent text-gray-400'
                                }`}
                            >
                                AI Curriculum Input
                            </button>
                            <button 
                                onClick={() => setInputMode('manual')}
                                className={`text-xs font-black uppercase tracking-wider pb-1.5 border-b-2 transition cursor-pointer ${
                                    inputMode === 'manual' ? 'border-amber-700 text-amber-900' : 'border-transparent text-gray-400'
                                }`}
                            >
                                Konfigurasi Cepat
                            </button>
                        </div>

                        {inputMode === 'curriculum' && (
                            <div className="flex flex-col gap-4">
                                <p className="text-[11px] text-gray-400 leading-normal font-medium">
                                    Salin teks Capaian Pembelajaran (CP) atau unggah file dokumen kurikulum lokal guru untuk diekstrak kompetensinya.
                                </p>

                                <textarea 
                                    rows="4"
                                    placeholder="Tempel dokumen CP/ATP Bahasa Jawa di sini..."
                                    value={curriculumText}
                                    onChange={(e) => setCurriculumText(e.target.value)}
                                    className="w-full text-xs p-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-800 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-700"
                                ></textarea>

                                {/* File Upload */}
                                <div className="border border-dashed border-gray-250 rounded-xl p-3 text-center bg-gray-50/50">
                                    <label className="cursor-pointer flex flex-col items-center justify-center gap-1.5">
                                        <Upload size={18} className="text-amber-800" />
                                        <span className="text-[10px] text-amber-900 font-bold">
                                            {uploadedFileName ? `File: ${uploadedFileName}` : 'Pilih/Seret dokumen CP (PDF, TXT, DOCX)'}
                                        </span>
                                        <input 
                                            type="file" 
                                            accept=".txt,.pdf,.docx" 
                                            onChange={handleFileUpload} 
                                            className="hidden" 
                                        />
                                    </label>
                                </div>

                                <button 
                                    onClick={handleExtractCompetencies}
                                    disabled={isExtracting}
                                    className="w-full bg-[#3E2723] hover:bg-amber-950 text-white font-bold py-2.5 rounded-xl text-xxs transition uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                                >
                                    <FileText size={13} className={isExtracting ? 'animate-spin' : ''} />
                                    {isExtracting ? 'Mengekstrak Kompetensi...' : 'Ekstrak Kompetensi CP/ATP'}
                                </button>

                                {/* Extracted Keyword chips */}
                                {extractedKeywords.length > 0 && (
                                    <div className="mt-4 border-t border-gray-100 pt-3">
                                        <span className="text-[9px] font-black text-gray-400 uppercase block mb-2">Kompetensi yang Diekstrak AI:</span>
                                        <div className="flex flex-wrap gap-1.5">
                                            {extractedKeywords.map((kw) => {
                                                const isSelected = selectedKeywords.includes(kw.id);
                                                return (
                                                    <button 
                                                        key={kw.id}
                                                        onClick={() => toggleKeyword(kw.id)}
                                                        className={`text-[9px] font-bold px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
                                                            isSelected 
                                                                ? 'bg-amber-800 text-white shadow-2xs' 
                                                                : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                                        }`}
                                                    >
                                                        {isSelected && <Check size={10} />}
                                                        {kw.word}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {inputMode === 'manual' && (
                            <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100 text-xxs font-medium text-amber-950 leading-relaxed">
                                <Sparkles size={14} className="mb-1 text-amber-800" />
                                <strong>Rekomendasi BIMA:</strong> Mode Curriculum Input mengekstrak kata kunci langsung dari rancangan ajar sekolah agar soal yang dibuat adaptif dengan tingkat kemampuan siswa.
                            </div>
                        )}
                    </div>

                    {/* CONFIG FORM */}
                    <form onSubmit={handleGenerate} className="bg-white p-6 rounded-3xl border border-gray-250/70 shadow-2xs text-left flex flex-col gap-4">
                        <h3 className="text-xs font-black text-gray-900 uppercase tracking-wider border-b border-gray-100 pb-2.5 flex items-center gap-1.5">
                            <Wand2 size={15} className="text-amber-800" />
                            Kriteria Soal Lisan AI
                        </h3>

                        {/* Kelas Target */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Pilih Kelas Target</label>
                            <select 
                                value={selectedClassToken}
                                onChange={(e) => setSelectedClassToken(e.target.value)}
                                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-700"
                            >
                                <option value="" disabled>-- Pilih Kelas --</option>
                                {classes.map(c => (
                                    <option key={c.id} value={c.token}>
                                        {c.title} ({c.token})
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Speech Level */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Tingkat Undha-Usuk Basa</label>
                            <select 
                                value={kramaType}
                                onChange={(e) => setKramaType(e.target.value)}
                                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-700"
                            >
                                <option value="krama-alus">Krama Alus (Paling Sopan & Hormat)</option>
                                <option value="krama-lugu">Krama Lugu (Sopan Sehari-hari)</option>
                            </select>
                        </div>

                        {/* Social Context */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Konteks Sosiokultural</label>
                            <select 
                                value={contextSituation}
                                onChange={(e) => setContextSituation(e.target.value)}
                                className="w-full p-2.5 rounded-xl border border-gray-200 bg-gray-50 text-xs font-semibold text-gray-800 focus:outline-none focus:ring-1 focus:ring-amber-700"
                            >
                                <option value="anak-wongtuwa">Berbicara dengan Orang Tua (Anak - Ibu/Bapak)</option>
                                <option value="murid-guru">Berbicara dengan Guru (Murid - Guru)</option>
                                <option value="rekan-sederajat">Berbicara dengan Teman / Tokoh Masyarakat</option>
                            </select>
                        </div>

                        {/* Jumlah Soal */}
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">Jumlah Soal ({count})</label>
                            <input 
                                type="range" 
                                min="1" 
                                max="3" 
                                value={count} 
                                onChange={(e) => setCount(Number(e.target.value))}
                                className="w-full accent-amber-700 cursor-pointer h-1 bg-gray-200 rounded-lg appearance-none"
                            />
                            <div className="flex justify-between text-[9px] text-gray-450 font-bold">
                                <span>1 Soal</span>
                                <span>2 Soal</span>
                                <span>3 Soal</span>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isGenerating}
                            className="w-full bg-amber-750 hover:bg-amber-800 text-white font-black py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-1.5 uppercase tracking-wider cursor-pointer"
                        >
                            <Sparkles size={14} className={isGenerating ? 'animate-spin' : ''} />
                            {isGenerating ? 'Menghubungkan LLM Engine...' : 'Formulasikan Soal Lisan'}
                        </button>
                    </form>
                </div>

                {/* PANEL KANAN: DRAF REVIEW DOKUMEN & ACTION BOARD */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5 px-1">
                        <Eye size={14} />
                        Draf Asesmen Lisan (Teacher-Driven Control Panel)
                    </h3>

                    {/* Document View */}
                    <div className="bg-white rounded-3xl border border-gray-250/70 p-6 min-h-[500px] flex flex-col justify-between shadow-2xs">
                        
                        {/* Empty/Loading states */}
                        {!draftQuestions && !isGenerating && (
                            <div className="flex flex-col items-center justify-center py-32 text-gray-400 gap-3 flex-1">
                                <FileText size={40} className="opacity-40" />
                                <p className="text-xs font-medium max-w-xs text-center leading-normal">
                                    Silakan isi kurikulum CP/ATP, pilih kelas target, lalu klik "Formulasikan Soal Lisan" untuk memicu Generative LLM.
                                </p>
                            </div>
                        )}

                        {isGenerating && (
                            <div className="flex flex-col gap-6 py-20 flex-1 justify-center">
                                {[1, 2].map(i => (
                                    <div key={i} className="animate-pulse flex flex-col gap-3">
                                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                        <div className="h-3 bg-gray-100 rounded w-full"></div>
                                        <div className="h-3 bg-gray-50 rounded w-2/3"></div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Review Draft List */}
                        {draftQuestions && (
                            <div className="flex flex-col gap-6 flex-1 pr-1 overflow-y-auto max-h-[560px]">
                                <div className="border-b border-dashed border-gray-200 pb-3 text-center">
                                    <h4 className="font-black text-xs text-gray-900 uppercase">Verifikasi Kelayakan Asesmen Lisan</h4>
                                    <p className="text-[9px] font-bold text-amber-800 uppercase tracking-wider mt-0.5">
                                        Ragam: {kramaType.replace('-', ' ')} | Konteks: {contextSituation.replace('-', ' ')}
                                    </p>
                                </div>

                                {draftQuestions.map((q, idx) => (
                                    <div 
                                        key={q.id} 
                                        className="bg-gray-50/50 rounded-2xl border border-gray-150 p-4 text-xs relative"
                                    >
                                        {/* Action edit/delete headers */}
                                        <div className="absolute right-3 top-3 flex gap-2">
                                            {editingId === q.id ? (
                                                <button 
                                                    onClick={() => saveEditDraft(q.id)}
                                                    className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg cursor-pointer"
                                                    title="Simpan Suntingan"
                                                >
                                                    <Check size={12} />
                                                </button>
                                            ) : (
                                                <button 
                                                    onClick={() => startEditDraft(q)}
                                                    className="p-1.5 bg-white border border-gray-200 text-gray-400 hover:text-amber-800 rounded-lg cursor-pointer"
                                                    title="Sunting Soal"
                                                >
                                                    <Edit size={12} />
                                                </button>
                                            )}
                                            <button 
                                                onClick={() => deleteDraft(q.id)}
                                                className="p-1.5 bg-white border border-gray-200 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                                                title="Tolak/Hapus Draf"
                                            >
                                                <Trash size={12} />
                                            </button>
                                        </div>

                                        {/* Editing Form */}
                                        {editingId === q.id ? (
                                            <div className="flex flex-col gap-2.5 mt-2">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-gray-400 uppercase">Judul Soal</label>
                                                    <input 
                                                        type="text" 
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        className="w-full text-xs p-1.5 border border-gray-250 rounded bg-white font-semibold"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-gray-400 uppercase">Skenario Sosiokultural</label>
                                                    <textarea 
                                                        rows="2"
                                                        value={editScenario}
                                                        onChange={(e) => setEditScenario(e.target.value)}
                                                        className="w-full text-xs p-1.5 border border-gray-250 rounded bg-white font-semibold"
                                                    ></textarea>
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[9px] font-bold text-gray-400 uppercase">Target Transkrip (Jawaban Benar)</label>
                                                    <input 
                                                        type="text" 
                                                        value={editTarget}
                                                        onChange={(e) => setEditTarget(e.target.value)}
                                                        className="w-full text-xs p-1.5 border border-gray-250 rounded bg-white font-mono"
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            /* Static view */
                                            <div className="flex flex-col gap-2.5 pr-14 text-left">
                                                <div>
                                                    <span className="text-[8px] font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded uppercase">
                                                        Draf {idx + 1}: {q.title}
                                                    </span>
                                                    <p className="font-extrabold text-gray-900 mt-1.5 leading-normal">{q.scenario}</p>
                                                </div>
                                                <div className="border-t border-gray-200/50 pt-2 flex flex-col gap-1">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase">Target Wicara (Kunci Jawaban):</span>
                                                    <p className="font-mono text-[11px] text-amber-900 font-bold bg-white p-2 rounded border border-gray-150/70">
                                                        "{q.correctTranscript}"
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Publish trigger per question */}
                                        <div className="mt-3.5 border-t border-gray-200/50 pt-2.5 flex justify-between items-center">
                                            <span className="text-[9px] font-bold text-gray-400">Ragam: {q.level}</span>
                                            <button 
                                                onClick={() => handleApproveAndPublish(q)}
                                                className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-lg text-xxs transition flex items-center gap-1 cursor-pointer"
                                            >
                                                <CheckCircle2 size={11} /> Approve & Rilis ke Kelas
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Footer Action */}
                        <div className="border-t border-gray-100 pt-4 flex justify-between items-center text-xxs mt-4">
                            <span className="text-gray-400 font-bold">Rilis Soal asinkronus ke Portal PWA Siswa</span>
                            <span className="font-mono font-bold text-amber-850">Llama 3 @ Ollama Service</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}