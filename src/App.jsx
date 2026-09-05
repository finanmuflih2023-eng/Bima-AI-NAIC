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
  // 6-Hour Session Persistence & URL Path Initializer
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('bima_auth_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const isExpired = Date.now() - (parsed.loginTime || 0) > 6 * 60 * 60 * 1000;
        if (!isExpired && parsed.user) return parsed.user;
      } catch (e) {}
    }
    return null;
  });

  const [userRole, setUserRole] = useState(() => {
    const saved = localStorage.getItem('bima_auth_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const isExpired = Date.now() - (parsed.loginTime || 0) > 6 * 60 * 60 * 1000;
        if (!isExpired && parsed.userRole) return parsed.userRole;
      } catch (e) {}
    }
    return 'teacher';
  });

  const [classes, setClasses] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  
  const [currentTab, setCurrentTab] = useState(() => {
    const pathTab = window.location.pathname.replace('/', '').toLowerCase();
    const validTabs = ['dashboard', 'classes', 'ai-generator', 'analytics', 'settings'];
    if (validTabs.includes(pathTab)) return pathTab;

    const saved = localStorage.getItem('bima_auth_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.currentTab && validTabs.includes(parsed.currentTab)) return parsed.currentTab;
      } catch (e) {}
    }
    return 'dashboard';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedClassId, setSelectedClassId] = useState(null);
  
  // Shared state untuk integrasi real-time Guru & Siswa
  const [tasks, setTasks] = useState([]);
  const [studentSubmissions, setStudentSubmissions] = useState([]);
  
  // Google Classroom-style state: Enrollments, Announcements, & Comments
  const [enrollments, setEnrollments] = useState(() => {
    const local = localStorage.getItem('bima_enrollments');
    return local ? JSON.parse(local) : [
      { id: 'enr-1', class_token: 'BIMA-SMP9A', student_name: 'Budi Santoso', student_username: 'budi', joined_at: '01/09/2026' },
      { id: 'enr-2', class_token: 'BIMA-SMP9A', student_name: 'Siti Aminah', student_username: 'siti', joined_at: '02/09/2026' },
      { id: 'enr-3', class_token: 'BIMA-SMP9A', student_name: 'Rudi Hartono', student_username: 'rudi', joined_at: '03/09/2026' }
    ];
  });

  const [announcements, setAnnouncements] = useState(() => {
    const local = localStorage.getItem('bima_announcements');
    return local ? JSON.parse(local) : [
      { 
        id: 'ann-1', 
        class_token: 'BIMA-SMP9A', 
        teacher_name: 'Ki Hadjar', 
        content: 'Sugeng enjang para siswa. Asesmen wicara bab Krama Alus ing pasar wis dibuka. Silakan kerjakan tugas lisan di portal siswa!', 
        created_at: '04/09/2026 08:00' 
      }
    ];
  });

  const [comments, setComments] = useState(() => {
    const local = localStorage.getItem('bima_comments');
    return local ? JSON.parse(local) : [
      {
        id: 'comm-1',
        announcement_id: 'ann-1',
        author_name: 'Budi Santoso',
        content: 'Sugeng enjang Pak Guru, siap nggarap tugas wicara!',
        created_at: '04/09/2026 08:15'
      }
    ];
  });

  // --- 1. READ & SYNC REALTIME: Mengambil Data & Roster dari Supabase ---
  const fetchEnrollments = async () => {
    try {
      const { data: enrData } = await supabase.from('class_enrollments').select('*');
      const { data: stdData } = await supabase.from('students').select('*');

      let combinedEnrollments = [];

      if (stdData && stdData.length > 0) {
        stdData.forEach(s => {
          if (s.token && s.token.trim()) {
            combinedEnrollments.push({
              id: 'std-' + s.id,
              class_token: s.token.trim().toUpperCase(),
              student_name: s.name,
              student_username: s.username || s.name,
              joined_at: s.created_at ? new Date(s.created_at).toLocaleDateString('id-ID') : 'Terdaftar'
            });
          }
        });
      }

      if (enrData && enrData.length > 0) {
        enrData.forEach(e => {
          if (e.class_token && e.class_token.trim()) {
            combinedEnrollments.push({
              id: e.id,
              class_token: e.class_token.trim().toUpperCase(),
              student_name: e.student_name,
              student_username: e.student_username || e.student_name,
              joined_at: e.joined_at || 'Terdaftar'
            });
          }
        });
      }

      if (combinedEnrollments.length > 0) {
        const uniqueMap = new Map();
        combinedEnrollments.forEach(item => {
          const key = `${item.class_token}_${(item.student_username || item.student_name).toLowerCase()}`;
          if (!uniqueMap.has(key)) {
            uniqueMap.set(key, item);
          }
        });
        const finalRoster = Array.from(uniqueMap.values());
        setEnrollments(finalRoster);
        localStorage.setItem('bima_enrollments', JSON.stringify(finalRoster));
      }
    } catch (e) {
      console.warn("Failed to fetch enrollments from Supabase:", e);
    }
  };

  const fetchAnnouncements = async () => {
    try {
      const { data, error } = await supabase.from('class_announcements').select('*').order('id', { ascending: false });
      if (!error && data && data.length > 0) {
        setAnnouncements(data);
        localStorage.setItem('bima_announcements', JSON.stringify(data));
      }
    } catch (e) {}
  };

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase.from('class_comments').select('*').order('id', { ascending: true });
      if (!error && data && data.length > 0) {
        setComments(data);
        localStorage.setItem('bima_comments', JSON.stringify(data));
      }
    } catch (e) {}
  };

  useEffect(() => {
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

      if (user && userRole === 'teacher') {
        const teacherName = user.name;
        if (teacherName === 'Ki Hadjar') {
          const isolated = rawList.filter(c => 
            c.is_default || 
            ['BIMA-SMP9A', 'BIMA-SMP9B', 'BIMA-SMP9C'].includes(c.token) || 
            c.created_by === 'Ki Hadjar'
          );
          setClasses(isolated);
        } else {
          const teacherClasses = rawList.filter(c => c.created_by === teacherName);
          if (teacherClasses.length > 0) {
            setClasses(teacherClasses);
          } else {
            const generateRandomToken = () => {
              const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
              let result = '';
              for (let i = 0; i < 6; i++) {
                result += chars.charAt(Math.floor(Math.random() * chars.length));
              }
              return `BIMA-${result}`;
            };
            const starterToken = generateRandomToken();
            const starterClass = {
              id: Date.now(),
              title: `Kelas Basa Jawa (${teacherName})`,
              level: 'SMP',
              school_type: 'Negeri',
              token: starterToken,
              school_name: user.school || 'SMP Negeri 1 Yogyakarta',
              students: 0,
              latest: 'Belum ada asesmen',
              progress: 0,
              created_by: teacherName
            };
            try {
              supabase.from('classes').insert([starterClass]);
            } catch (e) {}

            const existingCustom = JSON.parse(localStorage.getItem('bima_custom_classes') || '[]');
            localStorage.setItem('bima_custom_classes', JSON.stringify([...existingCustom, starterClass]));

            setClasses([starterClass]);
          }
        }
      } else {
        setClasses(rawList);
      }
    };

    fetchClasses();
    fetchEnrollments();
    fetchAnnouncements();
    fetchComments();

    const interval = setInterval(() => {
      fetchEnrollments();
      fetchAnnouncements();
      fetchComments();
    }, 5000);

    return () => clearInterval(interval);
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

  // Dynamic URL Router & 6-Hour Session Sync
  const handleTabChange = (tabName) => {
    setCurrentTab(tabName);
    if (userRole === 'teacher') {
      window.history.pushState(null, '', `/${tabName}`);
    }
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem('bima_auth_session', JSON.stringify({
        user,
        userRole,
        currentTab,
        loginTime: Date.now()
      }));
    }
  }, [user, userRole, currentTab]);

  useEffect(() => {
    if (user && userRole === 'teacher') {
      const validTabs = ['dashboard', 'classes', 'ai-generator', 'analytics', 'settings'];
      if (validTabs.includes(currentTab)) {
        window.history.replaceState(null, '', `/${currentTab}`);
      }
    } else if (user && userRole === 'student') {
      window.history.replaceState(null, '', '/student');
    }
  }, [user, userRole, currentTab]);

  useEffect(() => {
    const handlePopState = () => {
      const pathTab = window.location.pathname.replace('/', '').toLowerCase();
      const validTabs = ['dashboard', 'classes', 'ai-generator', 'analytics', 'settings'];
      if (validTabs.includes(pathTab)) {
        setCurrentTab(pathTab);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // --- 2. AUTHENTICATION ---
  const handleLogin = (userData) => {
    setUser(userData);
    setUserRole('teacher');
    setCurrentTab('dashboard');
    window.history.pushState(null, '', '/dashboard');
    localStorage.setItem('bima_auth_session', JSON.stringify({
      user: userData,
      userRole: 'teacher',
      currentTab: 'dashboard',
      loginTime: Date.now()
    }));
  };

  const handleStudentLogin = (studentData) => {
    const studentUser = {
      id: 'student-' + Date.now(),
      name: studentData.name,
      username: studentData.username || studentData.name,
      role: 'Student',
      token: studentData.token
    };
    setUser(studentUser);
    setUserRole('student');
    window.history.pushState(null, '', '/student');
    localStorage.setItem('bima_auth_session', JSON.stringify({
      user: studentUser,
      userRole: 'student',
      currentTab: 'student',
      loginTime: Date.now()
    }));

    // Auto-enroll student into token class roster if not already enrolled
    if (studentData.token) {
      const cleanToken = studentData.token.trim().toUpperCase();
      const isAlreadyEnrolled = enrollments.some(e => 
        e.class_token === cleanToken && 
        (e.student_name === studentData.name || e.student_username === (studentData.username || studentData.name))
      );
      if (!isAlreadyEnrolled) {
        handleJoinClass(studentUser, cleanToken);
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    setUserRole('teacher');
    localStorage.removeItem('bima_auth_session');
    window.history.pushState(null, '', '/');
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

  // --- 9. CLASS ENROLLMENTS & KICK STUDENT HANDLERS ---
  const handleJoinClass = async (studentObj, token) => {
    const cleanToken = token.trim().toUpperCase();
    const newEnrollment = {
      id: 'enr-' + Date.now(),
      class_token: cleanToken,
      student_name: studentObj.name,
      student_username: studentObj.username || studentObj.name,
      joined_at: new Date().toLocaleDateString('id-ID')
    };

    try {
      await supabase.from('class_enrollments').insert([newEnrollment]);
      await supabase.from('students').update({ token: cleanToken }).eq('username', studentObj.username || studentObj.name);
    } catch (e) {
      console.warn("Supabase class_enrollments insert error");
    }

    const updated = [...enrollments, newEnrollment];
    setEnrollments(updated);
    localStorage.setItem('bima_enrollments', JSON.stringify(updated));

    if (user && userRole === 'student') {
      const updatedUser = { ...user, token: cleanToken };
      setUser(updatedUser);
      localStorage.setItem('bima_auth_session', JSON.stringify({
        user: updatedUser,
        userRole: 'student',
        currentTab: 'student',
        loginTime: Date.now()
      }));
    }
  };

  const handleKickStudent = async (enrollmentId) => {
    try {
      await supabase.from('class_enrollments').delete().eq('id', enrollmentId);
    } catch (e) {
      console.warn("Supabase kick student error");
    }

    const updated = enrollments.filter(e => e.id !== enrollmentId);
    setEnrollments(updated);
    localStorage.setItem('bima_enrollments', JSON.stringify(updated));
    alert('Siswa berhasil dikeluarkan dari daftar kelas!');
  };

  const handleLeaveClass = async (studentObj, token) => {
    const cleanToken = token.trim().toUpperCase();
    try {
      await supabase
        .from('class_enrollments')
        .delete()
        .eq('class_token', cleanToken)
        .or(`student_username.eq.${studentObj.username || studentObj.name},student_name.eq.${studentObj.name}`);
    } catch (e) {
      console.warn("Supabase leave class error");
    }

    const updated = enrollments.filter(e => 
      !(e.class_token === cleanToken && (e.student_username === (studentObj.username || studentObj.name) || e.student_name === studentObj.name))
    );
    setEnrollments(updated);
    localStorage.setItem('bima_enrollments', JSON.stringify(updated));

    if (user && userRole === 'student') {
      const updatedUser = { ...user, token: '' };
      setUser(updatedUser);
      localStorage.setItem('bima_auth_session', JSON.stringify({
        user: updatedUser,
        userRole: 'student',
        currentTab: 'student',
        loginTime: Date.now()
      }));
    }
  };

  // --- 10. CLASSROOM ANNOUNCEMENTS & COMMENTS HANDLERS ---
  const handlePostAnnouncement = async (classToken, content) => {
    const newAnn = {
      id: 'ann-' + Date.now(),
      class_token: classToken,
      teacher_name: user?.name || 'Ki Hadjar',
      content: content,
      created_at: new Date().toLocaleString('id-ID')
    };

    try {
      await supabase.from('class_announcements').insert([newAnn]);
    } catch (e) {
      console.warn("Supabase announcement insert error");
    }

    const updated = [newAnn, ...announcements];
    setAnnouncements(updated);
    localStorage.setItem('bima_announcements', JSON.stringify(updated));
  };

  const handlePostComment = async (announcementId, authorName, content) => {
    const newComm = {
      id: 'comm-' + Date.now(),
      announcement_id: announcementId,
      author_name: authorName,
      content: content,
      created_at: new Date().toLocaleString('id-ID')
    };

    try {
      await supabase.from('class_comments').insert([newComm]);
    } catch (e) {
      console.warn("Supabase comment insert error");
    }

    const updated = [...comments, newComm];
    setComments(updated);
    localStorage.setItem('bima_comments', JSON.stringify(updated));
  };

  // --- 11. TEACHER SCORE OVERRIDE & MANUAL COMMENT HANDLER ---
  const handleUpdateSubmission = async (submissionId, updatedFields) => {
    const updatedSubmissions = studentSubmissions.map(sub => {
      if (sub.id === submissionId) {
        return {
          ...sub,
          ...updatedFields,
          score: updatedFields.score !== undefined ? updatedFields.score : sub.score,
          teacherComment: updatedFields.teacherComment !== undefined ? updatedFields.teacherComment : sub.teacherComment
        };
      }
      return sub;
    });

    setStudentSubmissions(updatedSubmissions);
    localStorage.setItem('bima_submissions', JSON.stringify(updatedSubmissions));

    try {
      await supabase
        .from('student_submissions')
        .update({
          score: updatedFields.score,
          teacher_comment: updatedFields.teacherComment
        })
        .eq('id', submissionId);
    } catch (e) {
      console.warn("Supabase submission update error");
    }
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
        enrollments={enrollments}
        announcements={announcements}
        comments={comments}
        onJoinClass={handleJoinClass}
        onLeaveClass={handleLeaveClass}
        onPostComment={handlePostComment}
      />
    );
  }

  // Paket data props yang dibagikan ke komponen Sidebar dan Halaman Guru
  const sharedProps = {
    currentTab,
    setCurrentTab: handleTabChange,
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
            submissions={studentSubmissions}
            enrollments={enrollments}
            announcements={announcements}
            comments={comments}
            onKickStudent={handleKickStudent}
            onPostAnnouncement={handlePostAnnouncement}
            onPostComment={handlePostComment}
            onUpdateSubmission={handleUpdateSubmission}
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