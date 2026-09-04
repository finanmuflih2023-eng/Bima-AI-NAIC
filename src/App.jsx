import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient'; // Mengimpor koneksi database Supabase
import Sidebar from './components/Sidebar';   // PENTING: Mengimpor Sidebar agar tidak hilang!
import Dashboard from './pages/Dashboard';
import MyClasses from './pages/MyClasses';
import AiGenerator from './pages/AiGenerator';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Login from './pages/Login';
import StudentPwa from './pages/StudentPwa'; // Impor PWA Siswa

export default function App() {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('teacher'); // 'teacher' | 'student'
  const [classes, setClasses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState(null);
  
  // Shared state untuk integrasi real-time Guru & Siswa
  const [tasks, setTasks] = useState([]);
  const [studentSubmissions, setStudentSubmissions] = useState([]);

  // --- 1. READ: Mengambil Data dari Supabase Saat Guru/Siswa Login ---
  useEffect(() => {
    // Jalankan pengambilan kelas (yang bersifat publik untuk verifikasi token siswa juga)
    const fetchClasses = async () => {
      const { data: classesData, error: classesError } = await supabase
        .from('classes')
        .select('*')
        .order('id', { ascending: true });

      const localCustom = localStorage.getItem('bima_custom_classes');
      const customClasses = localCustom ? JSON.parse(localCustom) : [];

      const fallbackClasses = [
        { id: 1, title: 'Kelas 9A - Sesi Remen Basa', level: 'SMP', school_type: 'Negeri', token: 'BIMA-SMP9A', school_name: 'SMP Negeri 1 Yogyakarta', students: 3, latest: 'Evaluasi Pacelathon Ibu', progress: 71, is_default: true },
        { id: 2, title: 'Kelas 9B - Gladhen Krama', level: 'SMP', school_type: 'Negeri', token: 'BIMA-SMP9B', school_name: 'SMP Negeri 1 Yogyakarta', students: 1, latest: 'Tuku Buku ing Toko (Krama Lugu)', progress: 55, is_default: true },
        { id: 3, title: 'Kelas 9C - Aksara Jawa', level: 'SMP', school_type: 'Negeri', token: 'BIMA-SMP9C', school_name: 'SMP Negeri 1 Yogyakarta', students: 0, latest: 'Belum ada asesmen', progress: 0, is_default: true }
      ];

      let rawList = fallbackClasses;
      if (!classesError && classesData && classesData.length > 0) {
        // Merge without duplicates by token
        const combined = [...classesData, ...customClasses];
        const uniqueMap = new Map();
        combined.forEach(c => uniqueMap.set(c.token, c));
        rawList = Array.from(uniqueMap.values());
      } else {
        const combined = [...fallbackClasses, ...customClasses];
        const uniqueMap = new Map();
        combined.forEach(c => uniqueMap.set(c.token, c));
        rawList = Array.from(uniqueMap.values());
      }

      // Teacher Class Isolation: Show 3 default classes + classes created by CURRENT teacher only
      if (user && userRole === 'teacher') {
        const teacherName = user.name;
        const isolated = rawList.filter(c => 
          c.is_default || 
          ['BIMA-SMP9A', 'BIMA-SMP9B', 'BIMA-SMP9C'].includes(c.token) || 
          c.created_by === teacherName
        );
        setClasses(isolated);
      } else {
        setClasses(rawList);
      }
    };

    fetchClasses();
  }, [user, userRole]);

  // Fetch quizzes, released tasks, and student submissions
  useEffect(() => {
    const fetchQuizzes = async () => {
      if (!user || userRole !== 'teacher') return;
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('id', { ascending: false });
      if (!error && data) setQuizzes(data);
    };

    const fetchReleasedTasks = async () => {
      try {
        const { data, error } = await supabase
          .from('released_tasks')
          .select('*')
          .order('id', { ascending: false });

        if (!error && data) {
          // Map snake_case to camelCase
          const mapped = data.map(t => ({
            id: t.id,
            classToken: t.class_token,
            title: t.title,
            scenario: t.scenario,
            level: t.level,
            context: t.context,
            correctTranscript: t.correct_transcript,
            audioStimulus: t.audio_stimulus,
            audioNativeExample: t.correct_transcript
          }));
          setTasks(mapped);
          localStorage.setItem('bima_tasks', JSON.stringify(mapped));
        } else {
          throw new Error(error?.message || "Fetch failed");
        }
      } catch (e) {
        console.warn("Table 'released_tasks' not found or empty. Using LocalStorage fallback.");
        const local = localStorage.getItem('bima_tasks');
        if (local) {
          setTasks(JSON.parse(local));
        } else {
          // Initialize empty for tasks to ensure we start clean (tasks only show if released by teacher)
          setTasks([]);
        }
      }
    };

    const fetchStudentSubmissions = async () => {
      try {
        const { data, error } = await supabase
          .from('student_submissions')
          .select('*')
          .order('id', { ascending: false });

        if (!error && data) {
          const mapped = data.map(s => ({
            id: s.id,
            studentName: s.student_name,
            classToken: s.class_token,
            taskId: String(s.task_id),
            taskTitle: s.task_title,
            score: s.score,
            scores: {
              unggahUngguh: s.score_unggah_ungguh,
              artikulasi: s.score_artikulasi,
              fluency: s.score_fluency
            },
            transcript: s.transcript,
            wordFeedbacks: s.word_feedbacks,
            remedialDrills: s.remedial_drills,
            isRemedialCompleted: s.is_remedial_completed,
            date: new Date(s.created_at || Date.now()).toLocaleDateString('id-ID')
          }));
          setStudentSubmissions(mapped);
          localStorage.setItem('bima_submissions', JSON.stringify(mapped));
        } else {
          throw new Error(error?.message || "Fetch failed");
        }
      } catch (e) {
        console.warn("Table 'student_submissions' not found or empty. Using LocalStorage fallback.");
        const local = localStorage.getItem('bima_submissions');
        if (local) {
          setStudentSubmissions(JSON.parse(local));
        } else {
          setStudentSubmissions([]);
        }
      }
    };

    fetchQuizzes();
    fetchReleasedTasks();
    fetchStudentSubmissions();
  }, [user, userRole]);

  // --- 2. AUTHENTICATION ---
  const handleLogin = (userData) => {
    setUser(userData);
    setUserRole('teacher');
    setCurrentTab('dashboard');
  };

  const handleStudentLogin = (studentData) => {
    setUser({
      id: 'student-' + Date.now(),
      name: studentData.name,
      role: 'Student',
      token: studentData.token
    });
    setUserRole('student');
  };

  const handleLogout = () => {
    setUser(null);
    setUserRole('teacher');
  };

  // --- 3. CREATE CLASS ---
  const handleCreateClass = async (classData) => {
    const generateToken = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let result = '';
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return `BIMA-${result}`;
    };

    const newClassRow = {
      title: classData.title,
      level: classData.level,
      school_type: classData.schoolType,
      token: generateToken(),
      school_name: classData.schoolName,
      students: 0,
      latest: 'Belum ada asesmen',
      progress: 0,
      created_by: user?.name || 'Ki Hadjar'
    };

    const { data, error } = await supabase
      .from('classes')
      .insert([newClassRow])
      .select();

    let createdObj = null;
    if (!error && data) {
      createdObj = data[0];
    } else {
      createdObj = {
        id: Date.now(),
        ...newClassRow
      };
    }

    const updatedClasses = [...classes, createdObj];
    setClasses(updatedClasses);

    // Save to localStorage for instant student login availability
    const existingCustom = JSON.parse(localStorage.getItem('bima_custom_classes') || '[]');
    localStorage.setItem('bima_custom_classes', JSON.stringify([...existingCustom, createdObj]));
  };

  // --- 4. DELETE CLASS ---
  const handleDeleteClass = async (classId) => {
    const { error } = await supabase
      .from('classes')
      .delete()
      .eq('id', classId);

    if (!error) {
      setClasses(classes.filter(cls => cls.id !== classId));
    } else {
      setClasses(classes.filter(cls => cls.id !== classId));
    }
  };

  // --- 5. CREATE QUIZ ---
  const handlePublishQuiz = async (topic, type, count) => {
    const newQuizRow = {
      topic: topic === 'aksara-jawa' ? 'Aksara Jawa & Pasangan' : 'Unggah-Ungguh Basa',
      type: type,
      count: parseInt(count, 10),
      date: new Date().toLocaleDateString('id-ID')
    };

    const { data, error } = await supabase
      .from('quizzes')
      .insert([newQuizRow])
      .select();

    if (!error && data) {
      setQuizzes([data[0], ...quizzes]);
    } else {
      const generated = {
        id: Date.now(),
        ...newQuizRow
      };
      setQuizzes([generated, ...quizzes]);
    }
  };

  // --- 6. STUDENT SUBMISSION SAVE HANDLER ---
  const handleAddSubmission = async (newSub) => {
    let savedSub = newSub;
    try {
      const dbRow = {
        student_name: newSub.studentName,
        class_token: newSub.classToken,
        task_id: parseInt(newSub.taskId) || null,
        task_title: newSub.taskTitle,
        score: newSub.score,
        score_unggah_ungguh: newSub.scores.unggahUngguh,
        score_artikulasi: newSub.scores.artikulasi,
        score_fluency: newSub.scores.fluency,
        transcript: newSub.transcript,
        word_feedbacks: newSub.wordFeedbacks,
        remedial_drills: newSub.remedialDrills,
        is_remedial_completed: newSub.isRemedialCompleted
      };

      const { data, error } = await supabase
        .from('student_submissions')
        .insert([dbRow])
        .select();

      if (!error && data) {
        savedSub = {
          id: data[0].id,
          studentName: data[0].student_name,
          classToken: data[0].class_token,
          taskId: String(data[0].task_id),
          taskTitle: data[0].task_title,
          score: data[0].score,
          scores: {
            unggahUngguh: data[0].score_unggah_ungguh,
            artikulasi: data[0].score_artikulasi,
            fluency: data[0].score_fluency
          },
          transcript: data[0].transcript,
          wordFeedbacks: data[0].word_feedbacks,
          remedialDrills: data[0].remedial_drills,
          isRemedialCompleted: data[0].is_remedial_completed,
          date: new Date(data[0].created_at || Date.now()).toLocaleDateString('id-ID')
        };
      } else {
        throw new Error(error?.message || "Supabase save error");
      }
    } catch (e) {
      console.warn("Failed to save submission to Supabase. Saving to LocalStorage instead.", e);
    }

    const updated = [savedSub, ...studentSubmissions];
    setStudentSubmissions(updated);
    localStorage.setItem('bima_submissions', JSON.stringify(updated));

    // Update statistics kelas secara dinamis
    setClasses(prevClasses => {
      return prevClasses.map(cls => {
        if (cls.token === savedSub.classToken) {
          const classSubs = updated.filter(s => s.classToken === cls.token);
          const totalScore = classSubs.reduce((sum, s) => sum + s.score, 0);
          const avgScore = classSubs.length > 0 ? Math.round(totalScore / classSubs.length) : cls.progress;
          return {
            ...cls,
            students: classSubs.length,
            latest: savedSub.taskTitle,
            progress: avgScore
          };
        }
        return cls;
      });
    });
  };

  // --- 7. TEACHER PUBLISH ORAL TASK HANDLER ---
  const handlePublishTask = async (newTask) => {
    let savedTask = newTask;
    try {
      const dbRow = {
        class_token: newTask.classToken,
        title: newTask.title,
        scenario: newTask.scenario,
        level: newTask.level,
        context: newTask.context,
        correct_transcript: newTask.correctTranscript,
        audio_stimulus: newTask.audioStimulus
      };

      const { data, error } = await supabase
        .from('released_tasks')
        .insert([dbRow])
        .select();

      if (!error && data) {
        savedTask = {
          id: data[0].id,
          classToken: data[0].class_token,
          title: data[0].title,
          scenario: data[0].scenario,
          level: data[0].level,
          context: data[0].context,
          correctTranscript: data[0].correct_transcript,
          audioStimulus: data[0].audio_stimulus,
          audioNativeExample: data[0].correct_transcript
        };
      } else {
        throw new Error(error?.message || "Supabase insert error");
      }
    } catch (e) {
      console.warn("Failed to save task to Supabase. Saving to LocalStorage instead.", e);
    }

    const updated = [...tasks, savedTask];
    setTasks(updated);
    localStorage.setItem('bima_tasks', JSON.stringify(updated));
    
    setClasses(prev => prev.map(c => {
      if (c.token === savedTask.classToken) {
        return {
          ...c,
          latest: savedTask.title
        };
      }
      return c;
    }));
    alert(`Tugas "${savedTask.title}" berhasil dirilis ke kelas!`);
  };

  // --- 8. DELETE TASK HANDLER ---
  const handleDeleteTask = async (taskId) => {
    try {
      const { error } = await supabase
        .from('released_tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
    } catch (e) {
      console.warn("Failed to delete task from Supabase. Deleting from LocalStorage fallback.");
    }
    
    const updated = tasks.filter(t => t.id !== taskId);
    setTasks(updated);
    localStorage.setItem('bima_tasks', JSON.stringify(updated));
  };

  const handleUpdateUser = (updatedData) => {
    setUser(prev => ({
      ...prev,
      ...updatedData
    }));
  };

  // Proteksi halaman jika belum melakukan login
  if (!user) {
    return <Login onLogin={handleLogin} onStudentLogin={handleStudentLogin} classes={classes} />;
  }

  // --- RENDERING STUDENT WEB PORTAL GATE ---
  if (userRole === 'student') {
    return (
      <StudentPwa 
        user={user}
        classes={classes}
        tasks={tasks}
        submissions={studentSubmissions}
        onAddSubmission={handleAddSubmission}
        onLogout={handleLogout}
        onSwitchToTeacher={() => setUserRole('teacher')}
      />
    );
  }

  // Paket data props yang dibagikan ke komponen Sidebar dan Halaman Guru
  const sharedProps = {
    currentTab,
    setCurrentTab,
    isSidebarOpen,
    setIsSidebarOpen,
    handleLogout,
    user,
    selectedClassId,
    setSelectedClassId,
    handleUpdateUser,
    userRole,
    setUserRole
  };

  // --- RENDERING TEACHER WEB DASHBOARD GATE ---
  return (
    <div className="flex w-full min-h-screen bg-[#F8F9FA]">

      {/* Menampilkan Sidebar Menu di Sisi Kiri Layar */}
      <Sidebar {...sharedProps} />

      {/* Area Konten Utama di Sisi Kanan Sidebar */}
      <main className="flex-1 h-screen overflow-y-auto">
        {currentTab === 'dashboard' && (
          <Dashboard
            {...sharedProps}
            classes={classes}
            quizzesCount={quizzes.length}
            onCreateClass={handleCreateClass}
          />
        )}
        {currentTab === 'classes' && (
          <MyClasses
            classes={classes}
            selectedClassId={selectedClassId}
            setSelectedClassId={setSelectedClassId}
            onDeleteClass={handleDeleteClass}
            user={user}
            tasks={tasks}
            onDeleteTask={handleDeleteTask}
          />
        )}
        {currentTab === 'ai-generator' && (
          <AiGenerator 
            {...sharedProps} 
            onPublishQuiz={handlePublishQuiz} 
            classes={classes}
            onPublishTask={handlePublishTask}
          />
        )}
        {currentTab === 'analytics' && (
          <Analytics 
            classes={classes} 
            submissions={studentSubmissions}
          />
        )}
        {currentTab === 'settings' && (
          <Settings {...sharedProps} />
        )}
      </main>

    </div>
  );
}