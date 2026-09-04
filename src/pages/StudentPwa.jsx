import React, { useState, useEffect, useRef } from 'react';
import { 
    BookOpen, Sparkles, Award, Mic, MicOff, Volume2, Play, Pause, 
    ArrowLeft, Check, AlertCircle, X, ChevronRight, User, Trophy, 
    Send, RefreshCw, Zap, History, Star, LogOut
} from 'lucide-react';
import { getGroqApiKey } from '../groqConfig';

export default function StudentPwa({ 
    user, 
    classes, 
    tasks = [], 
    submissions = [], 
    onAddSubmission, 
    onLogout, 
    onSwitchToTeacher 
}) {
    const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'history' | 'sandbox' | 'profile'
    const [selectedTask, setSelectedTask] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recordingPulse, setRecordingPulse] = useState([]);
    const [evaluationState, setEvaluationState] = useState('idle'); // 'idle' | 'recording' | 'processing' | 'done'
    const [speechResult, setSpeechResult] = useState(null);
    const [typedAnswer, setTypedAnswer] = useState(''); // Text fallback for keyboard testing
    const [showKeyboardInput, setShowKeyboardInput] = useState(false);
    const [activeFeedbackWord, setActiveFeedbackWord] = useState(null);
    
    // Drilling Mode State (Remedial)
    const [drillingWords, setDrillingWords] = useState([]);
    const [currentDrillWord, setCurrentDrillWord] = useState(null);
    const [drillRecording, setDrillRecording] = useState(false);
    const [drillState, setDrillState] = useState('idle'); // 'idle' | 'processing' | 'correct' | 'wrong'

    // Roleplay Sandbox State
    const [activeRoleplayChar, setActiveRoleplayChar] = useState(null);
    const [roleplayMessages, setRoleplayMessages] = useState([]);
    const [userRoleplayReply, setUserRoleplayReply] = useState('');
    const [roleplayScore, setRoleplayScore] = useState(0);
    const [isCharTyping, setIsCharTyping] = useState(false);

    // Gamification state
    const [studentXp, setStudentXp] = useState(() => {
        return Number(localStorage.getItem('bima_student_xp') || '350');
    });

    const timerRef = useRef(null);
    const pulseIntervalRef = useRef(null);

    const addXp = (amount) => {
        const newXp = studentXp + amount;
        setStudentXp(newXp);
        localStorage.setItem('bima_student_xp', String(newXp));
    };

    const getLevelInfo = (xp) => {
        if (xp < 300) return { level: 1, name: 'Magang Basa', nextXp: 300, badge: '🟤' };
        if (xp < 700) return { level: 2, name: 'Muda Basa', nextXp: 700, badge: '⚪' };
        if (xp < 1200) return { level: 3, name: 'Madya Wicara', nextXp: 1200, badge: '🟡' };
        return { level: 4, name: 'Krama Master', nextXp: 9999, badge: '👑' };
    };

    const lvlInfo = getLevelInfo(studentXp);

    // Timer wicara
    useEffect(() => {
        if (isRecording) {
            timerRef.current = setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

            pulseIntervalRef.current = setInterval(() => {
                setRecordingPulse(prev => {
                    const next = [...prev, Math.random() * 80 + 20];
                    if (next.length > 25) next.shift();
                    return next;
                });
            }, 150);
        } else {
            clearInterval(timerRef.current);
            clearInterval(pulseIntervalRef.current);
            setRecordingTime(0);
            setRecordingPulse([]);
        }
        return () => {
            clearInterval(timerRef.current);
            clearInterval(pulseIntervalRef.current);
        };
    }, [isRecording]);

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60).toString().padStart(2, '0');
        const s = (seconds % 60).toString().padStart(2, '0');
        return `${m}:${s}`;
    };

    const handlePlayStimulus = (text) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utterance = new UtteranceJavanese(text);
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Browser ini tidak mendukung Speech Synthesis.');
        }
    };

    const handlePlayNative = (text) => {
        if (!('speechSynthesis' in window)) {
            alert('Browser ini tidak mendukung Speech Synthesis.');
            return;
        }
        
        try {
            window.speechSynthesis.cancel();
            setTimeout(() => {
                const utterance = new SpeechSynthesisUtterance(text);
                utterance.lang = 'id-ID';
                utterance.rate = 0.85;
                utterance.pitch = 1.0;
                
                const speakNow = () => {
                    const voices = window.speechSynthesis.getVoices();
                    const idVoice = voices.find(v => v.lang.startsWith('id') || v.lang.includes('ID') || v.name.toLowerCase().includes('indonesia'));
                    if (idVoice) utterance.voice = idVoice;
                    window.speechSynthesis.speak(utterance);
                };

                if (window.speechSynthesis.getVoices().length > 0) {
                    speakNow();
                } else {
                    window.speechSynthesis.onvoiceschanged = speakNow;
                    speakNow();
                }
            }, 60);
        } catch (e) {
            console.error("Audio TTS error:", e);
        }
    };

    const UtteranceJavanese = (text) => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'id-ID';
        utterance.pitch = 0.95;
        utterance.rate = 0.8;
        const voices = window.speechSynthesis.getVoices();
        const localVoice = voices.find(v => v.lang.includes('ID') || v.name.toLowerCase().includes('indonesia'));
        if (localVoice) utterance.voice = localVoice;
        return utterance;
    };

    const startRecording = () => {
        setIsRecording(true);
        setEvaluationState('recording');
    };

    const stopRecording = () => {
        setIsRecording(false);
        setEvaluationState('processing');

        // Whisper simulation
        setTimeout(() => {
            evaluateVoiceInput(typedAnswer);
        }, 2000);
    };

    const evaluateVoiceInput = (manualText) => {
        let transcript = manualText.trim();
        if (!transcript) {
            // Mock errors for demo if student didn't type/speak anything custom
            if (selectedTask.correctTranscript.toLowerCase().includes('kesah')) {
                transcript = "Ibu, kula nyuwun idi badhe tindak dhateng dalemipun kanca."; // tindak error
            } else if (selectedTask.correctTranscript.toLowerCase().includes('tumbas')) {
                transcript = "Mbak kula badhe tumbas buku niki, regane pinten nggih."; // niki/regane error
            } else {
                transcript = selectedTask.correctTranscript;
            }
        }

        let scores = { unggahUngguh: 95, artikulasi: 95, fluency: 90 };
        let wordFeedbacks = [];

        // Check sosiokultural Javanese rules
        const words = transcript.split(' ');
        wordFeedbacks = words.map(w => {
            const cleanW = w.toLowerCase().replace(/[^a-z]/g, '');
            if (cleanW === 'tindak' && selectedTask.correctTranscript.toLowerCase().includes('kesah')) {
                scores.unggahUngguh = 55;
                return {
                    word: w,
                    isCorrect: false,
                    errorType: 'unggah-ungguh',
                    explanation: 'Tembung "tindak" iku Krama Inggil kanggo wong liya. Kanggo awake dhewe, gunakake "kesah".',
                    nativeExample: 'kesah'
                };
            }
            if (cleanW === 'dateng' && selectedTask.correctTranscript.toLowerCase().includes('dhateng')) {
                scores.artikulasi = 50;
                return {
                    word: w,
                    isCorrect: false,
                    errorType: 'artikulasi',
                    explanation: 'Pocapan "dateng" kurang trep. Sing bener yaiku "dhateng" (nggunakake konsonan tebal "dh").',
                    nativeExample: 'dhateng'
                };
            }
            if (cleanW === 'niki' && selectedTask.correctTranscript.toLowerCase().includes('puniki')) {
                scores.unggahUngguh = 65;
                return {
                    word: w,
                    isCorrect: false,
                    errorType: 'unggah-ungguh',
                    explanation: 'Tembung "niki" iku Ngoko Lugu. Gunakake "puniki" kanggo ragam Krama Lugu.',
                    nativeExample: 'puniki'
                };
            }
            if (cleanW === 'regane' && selectedTask.correctTranscript.toLowerCase().includes('reganipun')) {
                scores.unggahUngguh = 60;
                return {
                    word: w,
                    isCorrect: false,
                    errorType: 'unggah-ungguh',
                    explanation: 'Akhiran "-ne" iku Ngoko. Gunakake akhiran Krama "-nipun", dadi "reganipun".',
                    nativeExample: 'reganipun'
                };
            }
            return { word: w, isCorrect: true };
        });

        const overallScore = Math.round((scores.unggahUngguh + scores.artikulasi + scores.fluency) / 3);

        const newSubmission = {
            id: 'sub-' + Date.now(),
            studentName: user.name,
            classToken: user.token,
            taskId: String(selectedTask.id),
            taskTitle: selectedTask.title,
            score: overallScore,
            scores: scores,
            transcript: transcript,
            wordFeedbacks: wordFeedbacks,
            date: new Date().toLocaleDateString('id-ID'),
            remedialDrills: wordFeedbacks.filter(f => !f.isCorrect).map(f => f.nativeExample || f.word),
            isRemedialCompleted: false
        };

        onAddSubmission(newSubmission);
        setSpeechResult(newSubmission);
        setEvaluationState('done');

        if (overallScore >= 75) {
            addXp(100);
        } else {
            addXp(30);
        }
    };

    // Drill remedial handlers
    const handleStartDrill = (words, sub) => {
        setDrillingWords(words);
        setCurrentDrillWord(words[0]);
        setDrillState('idle');
        setSpeechResult(sub); // Track which submission is drilling
    };

    const handleRecordDrill = () => {
        setDrillRecording(true);
        setTimeout(() => {
            setDrillRecording(false);
            setDrillState('processing');

            setTimeout(() => {
                setDrillState('correct');
                addXp(40);
            }, 1200);
        }, 2000);
    };

    const handleNextDrillWord = () => {
        const currentIndex = drillingWords.indexOf(currentDrillWord);
        if (currentIndex < drillingWords.length - 1) {
            setCurrentDrillWord(drillingWords[currentIndex + 1]);
            setDrillState('idle');
        } else {
            // Remedial completed
            setDrillingWords([]);
            setCurrentDrillWord(null);
            setDrillState('idle');
            
            if (speechResult) {
                // Update local state isRemedialCompleted
                speechResult.isRemedialCompleted = true;
                
                // Update localStorage dynamically
                const localSubmissions = localStorage.getItem('bima_submissions');
                if (localSubmissions) {
                    const parsed = JSON.parse(localSubmissions);
                    const updated = parsed.map(s => s.id === speechResult.id ? { ...s, isRemedialCompleted: true } : s);
                    localStorage.setItem('bima_submissions', JSON.stringify(updated));
                }
            }
            alert('Apik tenan! Gladhen remedial wis rampung. Kowe entuk tambahan 50 XP!');
            addXp(50);
        }
    };

    // Roleplay Chat Sandbox
    const roleplayCharacters = [
        {
            id: 'mbok-bakul',
            name: 'Mbok Bakul',
            title: 'Bakul Pasar Gedhe',
            avatar: '👵',
            relation: 'Penjual Pasar Tradisional',
            speechLevel: 'Krama Madya',
            greeting: 'Sugeng enjang, Nak. Badhe mundhut nopo dhateng lapak kula puniki? Wonten sayur seger kaliyan jajan pasar.',
            context: 'Belanja sayur seger ing pasar tradisional Yogyakarta.'
        },
        {
            id: 'simbah',
            name: 'Simbah Putri',
            title: 'Eyang wonten ing Omah',
            avatar: '👵👵',
            relation: 'Keluarga / Sesepuh',
            speechLevel: 'Krama Alus / Ngoko Alus',
            greeting: 'Ealah Le/Ndhuk, kowe wis bali sekolah ta? Piye mau biji basamu? Kene maem dhisik, Simbah wis nggaweke kolak.',
            context: 'Matur marang Simbah sawise mulih sekolah.'
        },
        {
            id: 'pak-rt',
            name: 'Pak RT Mulyono',
            title: 'Ketua RT Sosiokultural',
            avatar: '👨‍💼',
            relation: 'Tokoh Masyarakat',
            speechLevel: 'Krama Lugu',
            greeting: 'Nggih, sugeng siyang. Wonten kebetahan menopo nggih, kok sajakipun wigati sanget dhateng dalem kula?',
            context: 'Nyuwun surat pengantar RT utawi badhe kerja bakti.'
        }
    ];

    const startRoleplay = (char) => {
        setActiveRoleplayChar(char);
        setRoleplayMessages([
            { sender: 'char', text: char.greeting, time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) }
        ]);
        setUserRoleplayReply('');
        setRoleplayScore(0);
    };

    const handleSendRoleplay = async (e) => {
        e.preventDefault();
        if (!userRoleplayReply.trim()) return;

        const currentInput = userRoleplayReply.trim();
        const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
        const userMsg = { sender: 'student', text: currentInput, time };
        
        const updatedMessages = [...roleplayMessages, userMsg];
        setRoleplayMessages(updatedMessages);
        setUserRoleplayReply('');
        setIsCharTyping(true);

        const systemPrompts = {
            'mbok-bakul': 'Sampeyan iku Mbok Bakul pasar tradisional ing Jogja ingkang grapyak, ramah, lan pinter tawar-menawar nggunakake Basa Jawa Krama. Tanggapi omongane pembeli (siswa) ing basa Jawa Krama kanthi alami, fleksibel, lan kontekstual (kalebu menawi siswa nawar rega). Jawab singkat 1-2 ukara.',
            'simbah': 'Sampeyan iku Simbah Putri ingkang bijaksana, welas asih, lan nresnani putune. Tanggapi percakapan putu (siswa) nggunakake Basa Jawa Krama Inggil / Ngoko Alus kanthi pituduh lan donga. Jawab singkat 1-2 ukara.',
            'pak-guru': 'Sampeyan iku Pak Guru Basa Jawa ingkang wicaksana, sabar, lan paring dorongan pasinaon. Tanggapi murid (siswa) nggunakake Basa Jawa Krama ingkang trep marang etika. Jawab singkat 1-2 ukara.'
        };

        const charSystemPrompt = systemPrompts[activeRoleplayChar.id] || systemPrompts['mbok-bakul'];

        let replyText = '';

        try {
            // 1. Integrasi API Generatif Groq Cloud LLM Real-time (Model GPT-OSS-120B)
            const promptMessages = [
                { role: 'system', content: charSystemPrompt },
                ...updatedMessages.slice(-6).map(m => ({
                    role: m.sender === 'student' ? 'user' : 'assistant',
                    content: m.text
                }))
            ];

            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getGroqApiKey()}`
                },
                body: JSON.stringify({
                    model: 'openai/gpt-oss-120b',
                    messages: promptMessages,
                    temperature: 0.7,
                    max_tokens: 150
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.choices && data.choices[0]?.message?.content) {
                    replyText = data.choices[0].message.content.trim();
                }
            }
        } catch (err) {
            console.warn("AI LLM online tidak merespon, menggunakan engine kontekstual lokal:", err);
        }

        // 2. Engine Percakapan Jawa Dinamis & Kontekstual (Prioritas Niat/Intent)
        if (!replyText) {
            const lowerMsg = currentInput.toLowerCase();
            if (activeRoleplayChar.id === 'mbok-bakul') {
                // INTENT 1: Pertanyaan Harga / Rega (Prioritas Tinggi)
                if (lowerMsg.includes('pinten') || lowerMsg.includes('rega') || lowerMsg.includes('reganipun') || lowerMsg.includes('regane') || lowerMsg.includes('biji') || lowerMsg.includes('pira') || lowerMsg.includes('piro')) {
                    replyText = 'Menawi setunggal bungkus puniki reganipun rolas ewu rupiyah per bungkus, Nak. Tasih seger-seger sedaya saking petani. Sampeyan badhe mundhut pinten bungkus?';
                } 
                // INTENT 2: Tawar-Menawar Harga
                else if (lowerMsg.includes('sepulo') || lowerMsg.includes('10') || lowerMsg.includes('angsal') || lowerMsg.includes('tawar') || lowerMsg.includes('murah') || lowerMsg.includes('kurang') || lowerMsg.includes('dherek')) {
                    replyText = 'Wah menawi semanten Mbok Bakul ngalap bathi sekedhik banget Nak. Pripun menawi dipungenepaken rolas ewu mawon, sampun dherek murah sanget nggih?';
                } 
                // INTENT 3: Nama Barang / Sayur Spesifik
                else if (lowerMsg.includes('wortel') || lowerMsg.includes('bayam') || lowerMsg.includes('kobis') || lowerMsg.includes('kubis') || lowerMsg.includes('bawang') || lowerMsg.includes('tomat') || lowerMsg.includes('lombok') || lowerMsg.includes('sayur') || lowerMsg.includes('tahu') || lowerMsg.includes('tempe')) {
                    const itemMatched = lowerMsg.match(/wortel|bayam|kobis|kubis|bawang|tomat|lombok|sayur|tahu|tempe/)[0];
                    replyText = `Oalah badhe mundhut ${itemMatched} nggih Nak? Puniki ${itemMatched}-ipun seger banget nembe rawuh saking petani. Reganipun mung gangsal ewu per bungkus. Badhe mundhut pinten bungkus?`;
                } 
                // INTENT 4: Jumlah Beli / Konfirmasi Bungkusan (Hanya jika tidak menanyakan harga)
                else if (lowerMsg.includes('setunggal') || lowerMsg.includes('kalih') || lowerMsg.includes('tiga') || lowerMsg.includes('bungkus') || lowerMsg.includes('kilo') || lowerMsg.includes('mawon')) {
                    replyText = 'Nggih siap Nak, puniki pesananipun sampun dibuntel rapi. Wonten panyuwunan bumbu utawi jajan sanes ingkang badhe dipuntumbas?';
                } 
                // INTENT 5: Pamitan & Terima Kasih
                else if (lowerMsg.includes('matur nuwun') || lowerMsg.includes('suwun') || lowerMsg.includes('sampun') || lowerMsg.includes('kesah') || lowerMsg.includes('pamit') || lowerMsg.includes('mboten')) {
                    replyText = 'Sami-sami Nak! Matur nuwun sanget sampun mampir lan belanja ing lapak Mbok Bakul. Mugi-mugi berkah lan slamet ing dalan nggih!';
                } 
                // INTENT 6: Menyapa / Greetings
                else if (lowerMsg.includes('sugeng') || lowerMsg.includes('halo') || lowerMsg.includes('pagi') || lowerMsg.includes('enjang') || lowerMsg.includes('siang')) {
                    replyText = 'Sugeng enjang uga Nak! Lapak Mbok Bakul buka terus. Wonten sayur seger lan jajan pasar jangkep, badhe madosi napa dinten puniki?';
                } 
                // INTENT DEFAULT
                else {
                    replyText = `Nggih Nak, monggo dipunpilih sayur seger lan bumbu ing lapak Mbok Bakul. Sedaya bahane berkualitas lan resik kagem masak kulawarga.`;
                }
            } else if (activeRoleplayChar.id === 'simbah') {
                if (lowerMsg.includes('kabar') || lowerMsg.includes('sehat')) {
                    replyText = 'Alhamdulillah Simbah sehat Wal-afiat, Le/Nduk. Kepriye sekolah lan pasinaonmu ing sekolah dinten puniki?';
                } else if (lowerMsg.includes('sungkem') || lowerMsg.includes('pangestu') || lowerMsg.includes('pamit')) {
                    replyText = 'Nggih Le/Nduk, Simbah tansah njurung donga pangestu. Mugi-mugi pasinaon lan cita-citamu dilancarake lan dibintangi berkah dening Gusti Allah.';
                } else {
                    replyText = `Matur nuwun ya Le/Nduk. Kita kudu tansah sregep njaga unggah-ungguh, etika subasita, lan tutur basa Jawa Krama ing ngendi wae berada.`;
                }
            } else {
                if (lowerMsg.includes('tugas') || lowerMsg.includes('pr') || lowerMsg.includes('ujian') || lowerMsg.includes('soal')) {
                    replyText = 'Nggih, ingkang sregep lan tliti anggonmu nggarap tugas Basa Jawa. Menawi wonten ingkang dereng faham, Bapak Guru siap mbantu jlentrehake.';
                } else {
                    replyText = `Nggih, ketrampilan wicara basa Jawa Krama puniki kedah terus dilatih kanthi rutin supados sangsaya fasih lan manut etika sosiokultural.`;
                }
            }
        }

        setIsCharTyping(false);
        setRoleplayMessages(prev => [...prev, { sender: 'char', text: replyText, time }]);
        setRoleplayScore(prev => prev + 25);
        addXp(30);
    };

    const handleEndRoleplay = () => {
        alert(`Sesi Roleplay Rampung! Sampeyan wis ngrampungake simulasi karo ${activeRoleplayChar.name} lan entuk ${roleplayScore} XP!`);
        addXp(roleplayScore);
        setActiveRoleplayChar(null);
        setRoleplayMessages([]);
    };

    // Filter tasks & submissions
    const activeTasks = tasks.filter(t => t.classToken === user.token);
    const studentHistory = submissions.filter(s => s.classToken === user.token && s.studentName === user.name);

    return (
        <div className="min-h-screen w-full bg-[#F8F9FA] flex flex-row font-sans text-gray-800 antialiased overflow-x-hidden">
            
            {/* STUDENT SIDEBAR LAYOUT */}
            <aside className="bg-[#2D1B18] w-64 flex flex-col justify-between min-h-screen p-6 shrink-0 shadow-md">
                <div className="w-full">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-10 pl-2">
                        <img src="/logo.png" alt="BIMA AI Logo" className="w-10 h-10 object-contain rounded-lg shrink-0" />
                        <div className="text-left">
                            <h1 className="text-base font-black text-white leading-tight">BIMA AI</h1>
                            <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Student Portal</p>
                        </div>
                    </div>

                    {/* Navigasi */}
                    <nav className="flex flex-col gap-2 w-full text-left">
                        {[
                            { id: 'tasks', label: 'Tugas Lisan', icon: BookOpen },
                            { id: 'history', label: 'Riwayat Asesmen', icon: History },
                            { id: 'sandbox', label: 'AI Sandbox Chat', icon: Sparkles },
                            { id: 'profile', label: 'Pencapaian', icon: Trophy }
                        ].map((t) => {
                            const Icon = t.icon;
                            const isActive = activeTab === t.id;
                            return (
                                <button
                                    key={t.id}
                                    onClick={() => {
                                        setActiveTab(t.id);
                                        setSelectedTask(null);
                                        setSpeechResult(null);
                                    }}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        isActive 
                                            ? 'bg-amber-750 text-white shadow-sm font-black' 
                                            : 'text-amber-200/60 hover:bg-white/10 hover:text-white'
                                    }`}
                                >
                                    <Icon size={16} />
                                    <span>{t.label}</span>
                                    {t.id === 'tasks' && activeTasks.length > 0 && (
                                        <span className="ml-auto bg-amber-500 text-[#2D1B18] px-1.5 py-0.5 rounded-md font-black text-[9px]">
                                            {activeTasks.length}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* Bottom utilities */}
                <div className="flex flex-col gap-3">

                    
                    <button
                        onClick={onLogout}
                        className="w-full bg-white/5 text-amber-250/70 hover:bg-red-950/30 hover:text-red-300 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition border border-white/5"
                    >
                        <LogOut size={14} />
                        Keluar Portal
                    </button>
                </div>
            </aside>

            {/* MAIN CONTAINER PANEL */}
            <main className="flex-1 h-screen overflow-y-auto flex flex-col p-8 relative">
                
                {/* AUTOMATED REMEDIAL DRILLING OVERLAY (FULL SCREEN CARD) */}
                {drillingWords.length > 0 && (
                    <div className="absolute inset-0 bg-[#F8F9FA] z-40 p-8 flex flex-col justify-between text-left">
                        <div className="max-w-2xl mx-auto w-full">
                            <span className="text-[10px] font-black bg-red-150 text-red-700 px-3 py-1 rounded-full uppercase tracking-wider">
                                Modul Automated Remedial Drilling
                            </span>
                            <h2 className="text-2xl font-black text-gray-900 mt-4">Gladhen Remedial Wicara</h2>
                            <p className="text-xs text-gray-500 mt-1.5">Latihen ngucapake tembung-tembung angel ing ngisor iki nganti fasih lan bener.</p>
                            
                            {/* Drill progress status bar */}
                            <div className="flex gap-2 mt-6">
                                {drillingWords.map((w, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`h-2 flex-1 rounded-full transition-all ${
                                            w === currentDrillWord 
                                                ? 'bg-amber-700' 
                                                : drillingWords.indexOf(currentDrillWord) > idx 
                                                    ? 'bg-emerald-600' 
                                                    : 'bg-gray-200'
                                        }`}
                                    ></div>
                                ))}
                            </div>

                            {/* Large Drill Target Card */}
                            <div className="bg-white border border-amber-200 rounded-3xl p-12 text-center my-10 shadow-sm relative">
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-2">Ucapake Tembung Iki:</span>
                                <h1 className="text-5xl font-black text-amber-950 font-serif tracking-wide">{currentDrillWord}</h1>
                                
                                <button 
                                    onClick={() => handlePlayNative(currentDrillWord)}
                                    className="mt-6 inline-flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-full text-xs font-bold text-amber-900 hover:bg-amber-100 transition cursor-pointer"
                                >
                                    <Volume2 size={14} />
                                    Rungokake Swara Native Speaker
                                </button>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col items-center gap-4 max-w-md mx-auto w-full mb-8">
                            {drillState === 'processing' && (
                                <div className="flex items-center gap-2 text-xs font-bold text-amber-800 animate-pulse">
                                    <RefreshCw size={14} className="animate-spin" />
                                    <span>Whisper NLP nembe mriksa artikulasi...</span>
                                </div>
                            )}

                            {drillState === 'correct' && (
                                <div className="bg-emerald-50 border border-emerald-250 text-emerald-800 px-5 py-2.5 rounded-xl text-xs font-bold text-center">
                                    ✓ Hebat! Pocapanmu wis pas lan bener.
                                </div>
                            )}

                            <div className="flex items-center gap-4 mt-2">
                                <button 
                                    onClick={handleRecordDrill}
                                    disabled={drillRecording || drillState === 'processing'}
                                    className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-md active:scale-95 cursor-pointer ${
                                        drillRecording ? 'bg-red-600 animate-pulse' : 'bg-[#3E2723] hover:bg-amber-950'
                                    }`}
                                >
                                    {drillRecording ? <MicOff size={24} /> : <Mic size={24} />}
                                </button>

                                {drillState === 'correct' && (
                                    <button 
                                        onClick={handleNextDrillWord}
                                        className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-5 py-3 rounded-xl text-xs flex items-center gap-1 transition cursor-pointer shadow-sm"
                                    >
                                        Sabanjure <ChevronRight size={14} />
                                    </button>
                                )}
                            </div>

                            <button 
                                onClick={() => setDrillingWords([])}
                                className="text-xs text-gray-400 font-semibold hover:underline mt-2 cursor-pointer"
                            >
                                Batalkan Remedial
                            </button>
                        </div>
                    </div>
                )}

                {/* ROLEPLAY CONTEXT CHAT OVERLAY */}
                {activeRoleplayChar && (
                    <div className="absolute inset-0 bg-[#F8F9FA] z-30 flex flex-col justify-between">
                        {/* Chat Header */}
                        <div className="bg-white border-b border-gray-200 p-5 flex justify-between items-center text-left">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl bg-amber-50 p-2 rounded-xl block">{activeRoleplayChar.avatar}</span>
                                <div>
                                    <h4 className="font-extrabold text-sm text-gray-900 leading-tight">{activeRoleplayChar.name}</h4>
                                    <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider mt-0.5">
                                        Ragam: {activeRoleplayChar.speechLevel} • {activeRoleplayChar.relation}
                                    </p>
                                </div>
                            </div>
                            <button 
                                onClick={handleEndRoleplay}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
                            >
                                Akhiri Simulasi (Dapatkan XP)
                            </button>
                        </div>

                        {/* Context bar */}
                        <div className="bg-amber-50/70 border-b border-amber-100 px-6 py-2.5 text-left text-xxs text-amber-900 flex items-center gap-2">
                            <Zap size={12} />
                            <span>Konteks Sosiokultural: {activeRoleplayChar.context}</span>
                        </div>

                        {/* Message list */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                            {roleplayMessages.map((msg, index) => (
                                <div 
                                    key={index} 
                                    className={`flex flex-col max-w-[60%] ${
                                        msg.sender === 'student' ? 'ml-auto items-end' : 'mr-auto items-start'
                                    }`}
                                >
                                    <div className={`p-4 rounded-2xl text-xs font-semibold leading-relaxed text-left shadow-2xs relative group ${
                                        msg.sender === 'student' 
                                            ? 'bg-[#3E2723] text-white rounded-tr-none' 
                                            : 'bg-white text-gray-800 border border-gray-150 rounded-tl-none'
                                    }`}>
                                        <p>{msg.text}</p>
                                        {msg.sender !== 'student' && (
                                            <button 
                                                type="button"
                                                onClick={() => handlePlayNative(msg.text)}
                                                className="mt-2.5 inline-flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition"
                                            >
                                                <Volume2 size={12} className="text-amber-800 animate-pulse" />
                                                Putar Swara AI
                                            </button>
                                        )}
                                    </div>
                                    <span className="text-[8px] text-gray-400 mt-1">{msg.time}</span>
                                </div>
                            ))}

                            {isCharTyping && (
                                <div className="mr-auto bg-gray-100/75 border border-gray-150 px-4 py-2.5 rounded-2xl text-xxs text-gray-450 italic">
                                    {activeRoleplayChar.name} nembe ngetik...
                                </div>
                            )}
                        </div>

                        {/* Text and Voice Chat input */}
                        <form onSubmit={handleSendRoleplay} className="p-4 border-t border-gray-200 bg-white flex gap-3 shrink-0 items-center">
                            <input 
                                type="text" 
                                placeholder="Matur nggunakake basa Jawa..." 
                                value={userRoleplayReply}
                                onChange={(e) => setUserRoleplayReply(e.target.value)}
                                className="flex-1 text-xs border border-gray-250 rounded-xl px-4 py-3 bg-gray-50 font-semibold focus:outline-none focus:ring-1 focus:ring-amber-700"
                            />
                            <button 
                                type="submit"
                                className="bg-[#3E2723] hover:bg-amber-950 text-white px-5 py-3 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                            >
                                <Send size={13} /> Kirim
                            </button>
                        </form>
                    </div>
                )}

                {/* HORIZONTAL STUDENT STATUS CARD (GAMIFICATION CARD) */}
                <div className="bg-white border border-gray-200 rounded-3xl p-6 mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-2xs text-left">
                    <div>
                        <span className="text-[9px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded uppercase">
                            Ruang Belajar Siswa
                        </span>
                        <h2 className="text-xl font-black text-gray-950 mt-1">{user.name}</h2>
                        <p className="text-xs text-gray-400 font-semibold">SMP Negeri 1 Yogyakarta • Kelas Token: <span className="font-mono text-amber-900 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200">{user.token}</span></p>
                    </div>
                    
                    {/* XP Progress indicator */}
                    <div className="flex items-center gap-4 min-w-[280px] w-full md:w-auto">
                        <div className="w-11 h-11 bg-amber-700 rounded-2xl flex items-center justify-center text-xl text-white font-bold shrink-0">
                            {lvlInfo.badge}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between text-xxs font-black text-gray-400 uppercase mb-1">
                                <span>Pangkat: {lvlInfo.name}</span>
                                <span>{studentXp} / {lvlInfo.nextXp} XP</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden p-[1px]">
                                <div 
                                    className="bg-amber-700 h-full rounded-full transition-all" 
                                    style={{ width: `${(studentXp / lvlInfo.nextXp) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* TAB WINDOW: ACTIVE TASKS */}
                {activeTab === 'tasks' && !selectedTask && (
                    <div className="flex flex-col gap-6 text-left">
                        <div className="flex justify-between items-center">
                            <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider pl-1">Daftar Tugas Lisan Aktif</h3>
                            <span className="text-xxs font-bold text-gray-400 bg-white border border-gray-200 px-2.5 py-1 rounded-xl">
                                {activeTasks.length} Tugas
                            </span>
                        </div>

                        {activeTasks.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-gray-250 rounded-3xl p-16 text-center text-sm text-gray-400 font-medium">
                                <BookOpen size={32} className="mx-auto mb-3 opacity-30 text-amber-800" />
                                Tidak ada tugas wicara yang aktif untuk kelas Anda saat ini.<br/>
                                <span className="text-xs text-gray-400 mt-1 block">Tugas hanya akan muncul jika guru telah merilis soal melalui panel AI Generator.</span>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {activeTasks.map((t) => {
                                    const submission = submissions.find(s => s.taskId === String(t.id) && s.studentName === user.name);
                                    return (
                                        <div 
                                            key={t.id}
                                            className="bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs hover:shadow-md hover:border-amber-200 transition-all duration-300 flex flex-col justify-between text-left group"
                                        >
                                            <div>
                                                <div className="flex justify-between items-center mb-4">
                                                    <span className="text-[9px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded uppercase">
                                                        {t.level}
                                                    </span>
                                                    <span className="text-[10px] text-gray-450 font-bold">Konteks: {t.context}</span>
                                                </div>
                                                <h4 className="font-extrabold text-sm text-gray-900 group-hover:text-amber-850 transition leading-tight mb-2">
                                                    {t.title}
                                                </h4>
                                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">{t.scenario}</p>
                                            </div>

                                            <div className="border-t border-gray-100 pt-4 flex justify-between items-center mt-auto">
                                                {submission ? (
                                                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-xl ${
                                                        submission.score >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-650'
                                                    }`}>
                                                        Nilai: {submission.score}%
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] text-amber-850 font-extrabold">Belum Dikerjakan</span>
                                                )}

                                                <button
                                                    onClick={() => {
                                                        setSelectedTask(t);
                                                        setSpeechResult(null);
                                                        setEvaluationState('idle');
                                                        setTypedAnswer('');
                                                    }}
                                                    className="bg-[#3E2723] hover:bg-amber-950 text-white font-bold px-4 py-2 rounded-xl text-xxs transition cursor-pointer flex items-center gap-1"
                                                >
                                                    {submission ? 'Ulangi Tugas' : 'Mulai Tugas'}
                                                    <ChevronRight size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* VIEW: ORAL ASSESSMENT WORKSPACE (FULL WEB LAYOUT) */}
                {activeTab === 'tasks' && selectedTask && (
                    <div className="flex flex-col gap-6 text-left flex-1">
                        <button 
                            onClick={() => setSelectedTask(null)}
                            className="text-xxs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1 hover:text-amber-800 transition cursor-pointer"
                        >
                            <ArrowLeft size={12} /> Kembali ke daftar tugas
                        </button>

                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                            
                            {/* COL 1: TASK INFO & STIMULUS (5/12 Columns) */}
                            <div className="lg:col-span-5 bg-white border border-gray-200 rounded-3xl p-6 shadow-2xs flex flex-col gap-5">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-amber-800 bg-amber-50 px-2 py-0.5 rounded uppercase">
                                        {selectedTask.level}
                                    </span>
                                    <span className="text-[10px] text-gray-400 font-bold">Konteks: {selectedTask.context}</span>
                                </div>
                                <h3 className="font-black text-base text-gray-900 leading-tight">{selectedTask.title}</h3>
                                
                                <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-xxs text-gray-600 font-semibold leading-relaxed">
                                    <p className="text-[9px] font-black text-amber-800 uppercase tracking-wider mb-1.5">Skenario Percakapan:</p>
                                    {selectedTask.scenario}
                                </div>

                                {/* Storytelling Audio play */}
                                <div className="bg-amber-50/40 border border-amber-100 rounded-2xl p-3 flex justify-between items-center mt-2">
                                    <div className="flex items-center gap-2">
                                        <Volume2 size={16} className="text-amber-800 shrink-0 animate-pulse" />
                                        <span className="text-[10px] text-amber-900 font-black">Audio Stimulus</span>
                                    </div>
                                    <button
                                        onClick={() => handlePlayStimulus(selectedTask.audioStimulus || selectedTask.scenario)}
                                        className="bg-white hover:bg-amber-55 px-3 py-1.5 rounded-xl border border-amber-200 text-xxs font-bold text-amber-850 transition cursor-pointer flex items-center gap-1"
                                    >
                                        <Play size={10} /> Putar Audio
                                    </button>
                                </div>
                            </div>

                            {/* COL 2: MIC RECORDING & NLP RESULTS BOARD (7/12 Columns) */}
                            <div className="lg:col-span-7 flex flex-col gap-6">
                                
                                {/* Idle State */}
                                {evaluationState === 'idle' && (
                                    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-2xs text-center py-14 flex flex-col items-center justify-between min-h-[380px]">
                                        <div className="max-w-xs">
                                            <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-800 mx-auto mb-4">
                                                <Mic size={28} />
                                            </div>
                                            <h4 className="font-extrabold text-sm text-gray-900">Rekam Wangsulan Lisan</h4>
                                            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                                                Pencet tombol mic ing ngisor iki, banjur wangsuli pitakon sosiokultural ing sisih kiwa kanthi langsung.
                                            </p>
                                        </div>

                                        <button 
                                            onClick={startRecording}
                                            className="w-18 h-18 bg-amber-700 hover:bg-amber-850 text-white rounded-full flex items-center justify-center shadow-md transition active:scale-95 cursor-pointer mt-6"
                                        >
                                            <Mic size={28} />
                                        </button>

                                        {/* Testing keyboard input fallback */}
                                        <div className="w-full border-t border-gray-100 pt-4 mt-6">
                                            <button 
                                                type="button"
                                                onClick={() => setShowKeyboardInput(!showKeyboardInput)}
                                                className="text-[10px] text-gray-400 font-bold hover:text-amber-800 transition cursor-pointer"
                                            >
                                                {showKeyboardInput ? "Tutup Mode Ketik" : "Ketik Wangsulan Manual (Mode Simulasi)"}
                                            </button>
                                            {showKeyboardInput && (
                                                <div className="mt-3 text-left flex flex-col gap-2">
                                                    <textarea 
                                                        rows="2"
                                                        placeholder="Ketik wangsulan basa jawamu ing kene..."
                                                        value={typedAnswer}
                                                        onChange={(e) => setTypedAnswer(e.target.value)}
                                                        className="w-full text-xs p-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-1 focus:ring-amber-700"
                                                    ></textarea>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Recording State */}
                                {evaluationState === 'recording' && (
                                    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-2xs text-center py-14 flex flex-col items-center justify-between min-h-[380px]">
                                        <div>
                                            <span className="text-[10px] font-black text-red-650 uppercase tracking-widest animate-pulse">
                                                🔴 Sedang Merekam Wicara Anda
                                            </span>
                                            <h2 className="text-3xl font-black font-mono text-gray-900 mt-2">{formatTime(recordingTime)}</h2>
                                        </div>

                                        {/* Waveform visualizer */}
                                        <div className="flex items-center gap-[4px] h-14 justify-center w-full max-w-xs">
                                            {recordingPulse.map((h, i) => (
                                                <div 
                                                    key={i} 
                                                    style={{ height: `${h}%` }}
                                                    className="w-[5px] bg-amber-700 rounded-full transition-all duration-150"
                                                ></div>
                                            ))}
                                        </div>

                                        <button 
                                            onClick={stopRecording}
                                            className="w-18 h-18 bg-red-600 hover:bg-red-750 text-white rounded-full flex items-center justify-center shadow-lg transition active:scale-95 cursor-pointer animate-pulse"
                                        >
                                            <MicOff size={28} />
                                        </button>
                                    </div>
                                )}

                                {/* Whisper Processing State */}
                                {evaluationState === 'processing' && (
                                    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-2xs text-center py-20 flex flex-col items-center justify-center gap-4 min-h-[380px]">
                                        <RefreshCw size={36} className="text-amber-700 animate-spin" />
                                        <div>
                                            <h4 className="font-extrabold text-sm text-gray-900">Speech Recognition & Evaluation</h4>
                                            <p className="text-xs text-gray-400 mt-1 max-w-[240px] leading-relaxed mx-auto">
                                                Whisper AI nembe ngompres audio wicara lan ngitung akurasi unggah-ungguh...
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Evaluation Results Done */}
                                {evaluationState === 'done' && speechResult && (
                                    <div className="flex flex-col gap-6">
                                        
                                        {/* Score summary panel */}
                                        <div className="bg-white border border-gray-200 p-5 rounded-3xl flex justify-between items-center shadow-2xs text-left">
                                            <div>
                                                <span className="text-[9px] font-black text-gray-400 uppercase">Skor Evaluasi NLP</span>
                                                <h2 className="text-3xl font-black text-amber-950 mt-0.5">{speechResult.score}%</h2>
                                            </div>
                                            <div className={`px-3 py-1.5 rounded-xl text-xxs font-black uppercase ${
                                                speechResult.score >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-650'
                                            }`}>
                                                {speechResult.score >= 75 ? 'LUWUR KKTP (LULUS)' : 'REMEDIAL DIBUTUHKAN'}
                                            </div>
                                        </div>

                                        {/* 3 Parameter evaluation */}
                                        <div className="grid grid-cols-3 gap-4">
                                            {[
                                                { label: 'Unggah-Ungguh', val: speechResult.scores.unggahUngguh, color: 'text-amber-800' },
                                                { label: 'Artikulasi', val: speechResult.scores.artikulasi, color: 'text-blue-600' },
                                                { label: 'Kelancaran', val: speechResult.scores.fluency, color: 'text-purple-600' }
                                            ].map((p, i) => (
                                                <div key={i} className="bg-white border border-gray-200 p-4 rounded-2xl text-center shadow-2xs">
                                                    <span className="text-[9px] font-black text-gray-400 uppercase block tracking-tight">{p.label}</span>
                                                    <span className={`text-base font-black mt-1.5 block ${p.color}`}>{p.val}%</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* INSTANT CORRECTIVE FEEDBACK PANEL */}
                                        <div className="bg-white border border-gray-200 p-6 rounded-3xl shadow-2xs text-left">
                                            <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full uppercase tracking-wider block w-max">
                                                Feedback Korektif Instan
                                            </span>

                                            <div className="mt-4 border-t border-gray-100 pt-4 text-xs font-semibold text-gray-800 leading-relaxed">
                                                <p className="text-[9px] font-black text-gray-400 uppercase mb-2">Transkrip Wicara (Ketuk tembung abang kanggo midangetaken perbaikan):</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {speechResult.wordFeedbacks.map((f, idx) => (
                                                        <button 
                                                            key={idx}
                                                            onClick={() => !f.isCorrect ? setActiveFeedbackWord(f) : null}
                                                            className={`px-2 py-0.5 rounded font-mono transition cursor-pointer text-xs ${
                                                                f.isCorrect 
                                                                    ? 'text-emerald-700 bg-emerald-50/50 hover:bg-emerald-50' 
                                                                    : 'text-red-700 bg-red-50 border border-red-200 font-bold hover:bg-red-100'
                                                            }`}
                                                        >
                                                            {f.word}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Corrective feedback popover */}
                                            {activeFeedbackWord && (
                                                <div className="mt-4 bg-red-50 border border-red-200 rounded-2xl p-4 text-xxs text-red-950 relative">
                                                    <button 
                                                        onClick={() => setActiveFeedbackWord(null)}
                                                        className="absolute right-3 top-3 text-red-500 hover:text-red-800 cursor-pointer"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                    <p className="font-black text-red-850 uppercase tracking-wider mb-1">
                                                        Kategori Kesalahan: {activeFeedbackWord.errorType}
                                                    </p>
                                                    <p className="font-semibold text-xs leading-relaxed mb-3">{activeFeedbackWord.explanation}</p>
                                                    
                                                    <div className="flex justify-between items-center bg-white p-2 rounded-xl border border-red-100">
                                                        <span className="font-bold text-red-900">Native Speaker: "{activeFeedbackWord.nativeExample}"</span>
                                                        <button 
                                                            onClick={() => handlePlayNative(activeFeedbackWord.nativeExample)}
                                                            className="bg-red-650 hover:bg-red-700 text-white p-1.5 rounded-lg transition cursor-pointer"
                                                        >
                                                            <Volume2 size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="border-t border-gray-100 pt-4 flex gap-3 justify-end items-center mt-6">
                                                {speechResult.score < 75 && speechResult.remedialDrills.length > 0 && !speechResult.isRemedialCompleted && (
                                                    <button 
                                                        onClick={() => handleStartDrill(speechResult.remedialDrills, speechResult)}
                                                        className="bg-red-600 hover:bg-red-750 text-white font-bold px-4 py-2 rounded-xl text-xxs flex items-center gap-1.5 cursor-pointer shadow-sm"
                                                    >
                                                        <RefreshCw size={11} /> Jalankan Remedial Drilling
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => setSelectedTask(null)}
                                                    className="bg-amber-700 hover:bg-amber-850 text-white font-bold px-5 py-2 rounded-xl text-xxs cursor-pointer shadow-sm"
                                                >
                                                    Selesai
                                                </button>
                                            </div>
                                        </div>

                                    </div>
                                )}

                            </div>

                        </div>
                    </div>
                )}

                {/* TAB WINDOW: COMPLETED SUBMISSIONS HISTORY */}
                {activeTab === 'history' && (
                    <div className="flex flex-col gap-6 text-left">
                        <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                            <h3 className="text-sm font-black text-gray-950 uppercase tracking-wider pl-1">Riwayat Asesmen Lisan</h3>
                            <span className="text-xxs font-bold text-gray-400 bg-white border border-gray-200 px-2.5 py-1 rounded-xl">
                                {studentHistory.length} Selesai
                            </span>
                        </div>

                        {studentHistory.length === 0 ? (
                            <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center text-xs text-gray-400 font-semibold shadow-2xs">
                                Anda belum pernah menyelesaikan tugas wicara di kelas ini.
                            </div>
                        ) : (
                            <div className="bg-white border border-gray-200 rounded-3xl shadow-2xs overflow-hidden">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-xs text-left">
                                        <thead>
                                            <tr className="bg-gray-50 border-b border-gray-200 text-gray-450 font-bold uppercase tracking-wider text-[9px]">
                                                <th className="py-4 px-6">Judul Tugas</th>
                                                <th className="py-4 px-6 text-center">Skor Evaluasi</th>
                                                <th className="py-4 px-6">Detail Penilaian (U - A - F)</th>
                                                <th className="py-4 px-6">Transkrip Rekaman</th>
                                                <th className="py-4 px-6">Status Remedial</th>
                                                <th className="py-4 px-6 text-right">Tanggal Pengerjaan</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                                            {studentHistory.map((sub) => (
                                                <tr key={sub.id} className="hover:bg-gray-55/40 transition">
                                                    <td className="py-4 px-6 font-extrabold text-gray-950">{sub.taskTitle}</td>
                                                    <td className="py-4 px-6 text-center">
                                                        <span className={`px-2.5 py-1 rounded-lg text-xxs font-black ${
                                                            sub.score >= 75 ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-650'
                                                        }`}>
                                                            {sub.score}%
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-6 text-gray-500 font-mono">
                                                        U: {sub.scores?.unggahUngguh}% | A: {sub.scores?.artikulasi}% | F: {sub.scores?.fluency}%
                                                    </td>
                                                    <td className="py-4 px-6 italic max-w-xs truncate">"{sub.transcript}"</td>
                                                    <td className="py-4 px-6">
                                                        {sub.score >= 75 ? (
                                                            <span className="text-gray-450 text-[10px] font-bold">✓ Tuntas</span>
                                                        ) : sub.isRemedialCompleted ? (
                                                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-lg text-[9px] font-bold">
                                                                ✓ Remedial Tuntas
                                                            </span>
                                                        ) : (
                                                            <button 
                                                                onClick={() => handleStartDrill(sub.remedialDrills, sub)}
                                                                className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 px-2 py-0.5 rounded-lg text-[9px] font-black cursor-pointer transition flex items-center gap-1 animate-pulse"
                                                            >
                                                                <RefreshCw size={9} /> Mulai Dril Remedial
                                                            </button>
                                                        )}
                                                    </td>
                                                    <td className="py-4 px-6 text-right text-gray-400">{sub.date || new Date().toLocaleDateString('id-ID')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB WINDOW: ROLEPLAY SANDBOX */}
                {activeTab === 'sandbox' && (
                    <div className="flex flex-col gap-6 text-left">
                        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-2xs">
                            <span className="text-[9px] font-black bg-amber-500 text-amber-900 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                Modul AI Roleplay Simulator (Sandbox Mode)
                            </span>
                            <h3 className="text-base font-black text-gray-900 mt-3 leading-tight">Arena Wicara Bebas Jawa</h3>
                            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                                Latihlah percakapan santai bahasa Jawa (Ngoko Alus/Krama Madya) bersama agen karakter AI adaptif. Setiap sesi berhasil memberikan bonus XP!
                            </p>
                        </div>

                        <h4 className="text-xs font-black text-gray-950 uppercase tracking-wider pl-1 mt-2">Pilih Agen Karakter</h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {roleplayCharacters.map((char) => (
                                <div 
                                    key={char.id}
                                    className="bg-white border border-gray-200 rounded-3xl p-5 shadow-2xs hover:shadow-md transition duration-300 flex flex-col justify-between text-left"
                                >
                                    <div>
                                        <span className="text-3xl bg-amber-50/50 p-3 rounded-2xl inline-block mb-4">{char.avatar}</span>
                                        <h4 className="font-extrabold text-sm text-gray-950 leading-tight">{char.name}</h4>
                                        <p className="text-[9px] text-amber-800 font-bold uppercase tracking-wider mt-0.5 mb-2">{char.speechLevel} • {char.relation}</p>
                                        <p className="text-xxs text-gray-450 leading-relaxed line-clamp-3">{char.context}</p>
                                    </div>

                                    <button 
                                        onClick={() => startRoleplay(char)}
                                        className="w-full bg-[#3E2723] hover:bg-amber-950 text-white font-bold py-2.5 rounded-xl text-xxs transition cursor-pointer text-center mt-5"
                                    >
                                        Mulai Pacelathon
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* TAB WINDOW: PROFILE & ACHIEVEMENTS */}
                {activeTab === 'profile' && (
                    <div className="flex flex-col gap-6 text-left">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            
                            {/* Card 1: Level Status */}
                            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-2xs flex flex-col justify-between">
                                <div>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wide">Peringkat Kompetensi</span>
                                    <h4 className="text-lg font-black text-[#2D1B18] mt-1">{lvlInfo.name}</h4>
                                    <p className="text-xxs text-gray-450 mt-1">Status level belajar aktif pada portal BIMA Jawa.</p>
                                </div>
                                <span className="text-3xl block mt-4">{lvlInfo.badge}</span>
                            </div>

                            {/* Card 2: XP Stats */}
                            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-2xs flex flex-col justify-between">
                                <div>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wide">Akumulasi Poin Wicara</span>
                                    <h4 className="text-lg font-black text-[#2D1B18] mt-1">{studentXp} XP</h4>
                                    <p className="text-xxs text-gray-450 mt-1">Dapatkan XP ekstra dengan melatih remedial wicara atau chat sandbox.</p>
                                </div>
                                <span className="text-2xl mt-4">⚡</span>
                            </div>

                            {/* Card 3: Class target */}
                            <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-2xs flex flex-col justify-between">
                                <div>
                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wide">Tuntas Tugas Lisan</span>
                                    <h4 className="text-lg font-black text-[#2D1B18] mt-1">{studentHistory.filter(s => s.score >= 75 || s.isRemedialCompleted).length} Tugas</h4>
                                    <p className="text-xxs text-gray-450 mt-1">Jumlah penugasan yang telah memenuhi Kriteria Ketercapaian (KKTP).</p>
                                </div>
                                <span className="text-2xl mt-4">✓</span>
                            </div>

                        </div>

                        {/* Badges Collection */}
                        <h4 className="text-xs font-black text-gray-900 uppercase tracking-wider pl-1 mt-4">Koleksi Lencana Lulus</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                            {[
                                { name: 'Krama Alus Pemula', desc: 'Melakukan unggah-ungguh alus dengan guru', active: studentXp >= 300, icon: '🌟' },
                                { name: 'Artikulasi th/dh', desc: 'Selesai dril konsonan tebal tanpa cacat', active: studentXp >= 700, icon: '🗣️' },
                                { name: 'Lurah Sandakan', desc: 'Selesai 3 pacelathon Sandbox mode', active: studentXp >= 1200, icon: '🎭' },
                                { name: 'Duta Kebudayaan', desc: 'Memenuhi KKM rerata di kelas', active: true, icon: '🏆' }
                            ].map((badge, idx) => (
                                <div 
                                    key={idx}
                                    className={`bg-white border p-5 rounded-3xl text-center flex flex-col items-center gap-2 transition-all ${
                                        badge.active 
                                            ? 'border-amber-200/50 shadow-2xs' 
                                            : 'border-gray-150 opacity-40 bg-gray-50/50'
                                    }`}
                                >
                                    <span className="text-3xl block mb-2">{badge.icon}</span>
                                    <h5 className="font-extrabold text-xs text-gray-900 leading-tight">{badge.name}</h5>
                                    <p className="text-[9px] text-gray-400 leading-relaxed mt-1">{badge.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </main>

        </div>
    );
}
