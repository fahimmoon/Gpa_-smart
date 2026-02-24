import React, { useState, useEffect, useMemo } from 'react';
import { 
  Calendar,
  Clock,
  MapPin,
  LayoutDashboard, 
  GraduationCap, 
  StickyNote, 
  BarChart3, 
  Settings, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Bell,
  Search,
  X,
  AlertCircle,
  CheckCircle2,
  Target,
  TrendingUp,
  Award,
  Zap,
  BookOpen,
  Sparkles,
  Wallet,
  UserCheck,
  Timer,
  Calculator,
  CalendarClock,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AppData, Semester, Course, Grade, STORAGE_KEY, TimetableEntry, MonthlyBudget, Expense, Income, AttendanceRecord, AttendanceStatus, Todo, TodoPriority, TodoCategory, CustomNote, NoteCategory, CourseGrading, Exam, StudySession, StudyTimerSettings, StudyStreak } from './types';
import { calculateSemesterGPA, calculateOverallCGPA, getNextSemesterName, percentageToGrade } from './utils';
import { SemesterCard } from './components/SemesterCard';
import { GPAChart } from './components/GPAChart';
import { Timetable } from './components/Timetable';
import { EnhancedTimetable } from './components/EnhancedTimetable';
import { RichTextEditor } from './components/RichTextEditor';
import { Forecast } from './components/Forecast';
import { TodoList } from './components/TodoList';
import { CustomNotesManager } from './components/CustomNotesManager';
import { EnhancedTodoList } from './components/EnhancedTodoList';
import { EnhancedNotesManager } from './components/EnhancedNotesManager';
import BudgetTracker from './components/BudgetTracker';
import EnhancedBudgetTracker from './components/EnhancedBudgetTracker';
import AttendanceTracker from './components/AttendanceTracker';
import GradingSystem from './components/GradingSystem';
import StudyTimer from './components/StudyTimer';
import GradeCalculator from './components/GradeCalculator';
import ExamCountdown from './components/ExamCountdown';
import StudyStatistics from './components/StudyStatistics';
import clsx from 'clsx';

const App: React.FC = () => {
  // --- State ---
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        ...parsed,
        timetable: parsed.timetable || [],
        todos: parsed.todos || [],
        customNotes: parsed.customNotes || [],
        globalNotes: parsed.globalNotes || ''
      };
    }
    
    // Initial state
    return {
      semesters: [
        {
          id: 'f22',
          name: 'Fall 2022',
          isCurrent: false,
          isCompleted: true,
          courses: [
            { id: 'f22-1', code: 'CSC 1101', name: 'Calculus and Analytical Geometry', credits: 3, grade: 'B+', notes: '' },
            { id: 'f22-2', code: 'CSC 1102', name: 'English Composition and Comprehension', credits: 3, grade: 'C+', notes: '' },
            { id: 'f22-3', code: 'CSC 1103', name: 'Fundamentals of Programming', credits: 3, grade: 'A-', notes: '' },
            { id: 'f22-4', code: 'CSCL 1103', name: 'Lab: Fundamentals of Programming', credits: 1, grade: 'A-', notes: '' },
            { id: 'f22-5', code: 'CSC 1107', name: 'Applied Physics', credits: 2, grade: 'B', notes: '' },
            { id: 'f22-6', code: 'CSCL 1107', name: 'Lab: Applied Physics', credits: 1, grade: 'B+', notes: '' },
            { id: 'f22-7', code: 'CSC 1108', name: 'Introduction to Computer Science', credits: 2, grade: 'B+', notes: '' },
            { id: 'f22-8', code: 'CSCL 1108', name: 'Lab: Introduction to Computer Science', credits: 1, grade: 'A-', notes: '' },
            { id: 'f22-9', code: 'CSC 1109', name: 'Pakistan Studies', credits: 2, grade: 'A-', notes: '' }
          ],
          notes: 'Completed first semester with a 3.19 GPA.'
        },
        {
          id: 's23',
          name: 'Spring 2023',
          isCurrent: false,
          isCompleted: true,
          courses: [
            { id: 's23-1', code: 'CSC 2101', name: 'Communication and Presentation Skills', credits: 3, grade: 'C-', notes: '' },
            { id: 's23-2', code: 'CSC 2103', name: 'Digital Logic Design', credits: 3, grade: 'A', notes: '' },
            { id: 's23-3', code: 'CSCL 2103', name: 'Lab: Digital Logic Design', credits: 1, grade: 'B', notes: '' },
            { id: 's23-4', code: 'CSC 1208', name: 'Object Oriented Programming Techniques', credits: 3, grade: 'B', notes: '' },
            { id: 's23-5', code: 'CSCL 1208', name: 'Lab: Object Oriented Programming Techniques', credits: 1, grade: 'A-', notes: '' },
            { id: 's23-6', code: 'CSC 1209', name: 'Islamic Studies / Humanities', credits: 2, grade: 'B+', notes: '' },
            { id: 's23-7', code: 'CSC 1206', name: 'Probability and Statistics', credits: 3, grade: 'B+', notes: '' }
          ],
          notes: 'Semester GPA: 2.97'
        },
        {
          id: 'f23',
          name: 'Fall 2023',
          isCurrent: false,
          isCompleted: true,
          courses: [
            { id: 'f23-1', code: 'CSC 1201', name: 'Discrete Mathematical Structures', credits: 3, grade: 'A-', notes: '' },
            { id: 'f23-2', code: 'CSC 2102', name: 'Data Structures and Algorithms', credits: 3, grade: 'A-', notes: '' },
            { id: 'f23-3', code: 'CSCL 2102', name: 'Lab: Data Structures and Algorithms', credits: 1, grade: 'A-', notes: '' },
            { id: 'f23-4', code: 'CSC 2201', name: 'Computer Organization and Assembly Language', credits: 3, grade: 'A-', notes: '' },
            { id: 'f23-5', code: 'CSC 3203', name: 'Numerical Computing', credits: 3, grade: 'B-', notes: '' },
            { id: 'f23-6', code: 'CSC 4605', name: 'Sociology', credits: 3, grade: 'A-', notes: '' },
            { id: 'f23-7', code: 'CSCL 2201', name: 'Lab: Computer Organization and Assembly Language', credits: 1, grade: 'A+', notes: '' }
          ],
          notes: 'Strong performance in Data Structures and Assembly. Semester GPA: 3.4'
        },
        {
          id: 's24',
          name: 'Spring 2024',
          isCurrent: false,
          isCompleted: true,
          courses: [
            { id: 's24-1', code: 'CSC 2203', name: 'Database Systems', credits: 3, grade: 'B+', notes: '' },
            { id: 's24-2', code: 'CSCL 2203', name: 'Lab: Database Systems', credits: 1, grade: 'A', notes: '' },
            { id: 's24-3', code: 'CSC 2204', name: 'Finite Automata Theory and Formal Languages', credits: 3, grade: 'B-', notes: '' },
            { id: 's24-4', code: 'CSC 3202', name: 'Design and Analysis of Algorithms', credits: 3, grade: 'A-', notes: '' },
            { id: 's24-5', code: 'CSC 4503', name: 'Introduction to Accounting', credits: 3, grade: 'A', notes: '' },
            { id: 's24-6', code: 'CSC 2206', name: 'Linear Algebra', credits: 3, grade: 'B+', notes: '' }
          ],
          notes: 'Semester GPA: 3.33'
        },
        {
          id: 'current',
          name: 'Fall 2024',
          isCurrent: true,
          isCompleted: false,
          courses: [
            { id: 'c-1', code: 'CSC 1205', name: 'Technical and Business Writing', credits: 3, grade: '', notes: '' },
            { id: 'c-2', code: 'CSC 4717', name: 'Web Technologies-I', credits: 3, grade: '', notes: '' },
            { id: 'c-3', code: 'CSC 4101', name: 'Artificial Intelligence', credits: 3, grade: '', notes: '' },
            { id: 'c-4', code: 'CSCL 4101', name: 'Lab: Artificial Intelligence', credits: 1, grade: '', notes: '' },
            { id: 'c-5', code: 'CSC 3205', name: 'Computer Networks and Data Communications', credits: 3, grade: '', notes: '' },
            { id: 'c-6', code: 'CSCL 3205', name: 'Lab: Computer Networks and Data Communications', credits: 1, grade: '', notes: '' },
            { id: 'c-7', code: 'CSC 4724', name: 'User Interface Design', credits: 3, grade: '', notes: '' }
          ],
          notes: 'Current semester goals: Master Web Technologies and AI.'
        }
      ],
      timetable: [
        { id: 't1', courseId: 'c-1', day: 'Monday', startTime: '11:30', endTime: '13:00', location: 'Room-309 (100-B)' },
        { id: 't2', courseId: 'c-3', day: 'Monday', startTime: '13:30', endTime: '15:00', location: 'Room-108 (100-B)' },
        { id: 't3', courseId: 'c-5', day: 'Tuesday', startTime: '11:30', endTime: '13:00', location: 'Room-408 (100-B)' },
        { id: 't4', courseId: 'c-4', day: 'Tuesday', startTime: '13:30', endTime: '15:00', location: 'Lab-4 (100-B)' },
        { id: 't5', courseId: 'c-7', day: 'Wednesday', startTime: '13:30', endTime: '15:00', location: 'Lab-4 (100-B)' },
        { id: 't6', courseId: 'c-6', day: 'Saturday', startTime: '11:30', endTime: '13:00', location: 'Smart Lab-3 (100-B)' }
      ],
      todos: [],
      customNotes: [],
      globalNotes: '',
      theme: 'dark',
      gpaGoal: 3.5,
      notificationsEnabled: false,
      customReminders: []
    };
  });

  const [activeTab, setActiveTab] = useState<'home' | 'semesters' | 'timetable' | 'notes' | 'chart' | 'settings' | 'budget' | 'attendance' | 'grading' | 'studyTimer' | 'gradeCalc' | 'examCountdown' | 'studyStats'>('home');
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
  const [isTimetableModalOpen, setIsTimetableModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<{ semesterId: string; course?: Course } | null>(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<{ type: 'complete' | 'clear'; semesterId?: string } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' }[]>([]);

  // --- Persistence ---
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Always dark mode
    document.body.classList.add('dark');
  }, [data]);

  // --- Helpers ---
  const addToast = (message: string, type: 'success' | 'error' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const { cgpa, totalCredits, totalPoints } = useMemo(() => calculateOverallCGPA(data.semesters), [data.semesters]);
  const currentSemester = useMemo(() => data.semesters.find(s => s.isCurrent), [data.semesters]);
  const currentGPA = useMemo(() => currentSemester ? calculateSemesterGPA(currentSemester.courses) : 0, [currentSemester]);

  // --- Actions ---
  const handleAddCourse = (semesterId: string) => {
    setEditingCourse({ semesterId });
    setIsCourseModalOpen(true);
  };

  const handleEditCourse = (semesterId: string, course: Course) => {
    setEditingCourse({ semesterId, course });
    setIsCourseModalOpen(true);
  };

  const saveCourse = (formData: any) => {
    if (!editingCourse) return;

    const newCourse: Course = {
      id: editingCourse.course?.id || Math.random().toString(36).substr(2, 9),
      code: formData.code,
      name: formData.name,
      credits: parseFloat(formData.credits),
      grade: formData.grade as Grade,
      notes: editingCourse.course?.notes || '',
      percentage: formData.percentage ? parseFloat(formData.percentage) : undefined
    };

    setData(prev => ({
      ...prev,
      semesters: prev.semesters.map(s => {
        if (s.id !== editingCourse.semesterId) return s;
        const courses = editingCourse.course 
          ? s.courses.map(c => c.id === editingCourse.course?.id ? newCourse : c)
          : [...s.courses, newCourse];
        return { ...s, courses };
      })
    }));

    setIsCourseModalOpen(false);
    setEditingCourse(null);
    addToast(editingCourse.course ? 'Course updated!' : 'Course added!');
  };

  const deleteCourse = (semesterId: string, courseId: string) => {
    setData(prev => ({
      ...prev,
      semesters: prev.semesters.map(s => {
        if (s.id !== semesterId) return s;
        return { ...s, courses: s.courses.filter(c => c.id !== courseId) };
      })
    }));
    addToast('Course deleted', 'error');
  };

  const updateCourseNotes = (semesterId: string, courseId: string, notes: string) => {
    setData(prev => ({
      ...prev,
      semesters: prev.semesters.map(s => {
        if (s.id !== semesterId) return s;
        return {
          ...s,
          courses: s.courses.map(c => c.id === courseId ? { ...c, notes } : c)
        };
      })
    }));
  };

  const updateSemesterNotes = (semesterId: string, notes: string) => {
    setData(prev => ({
      ...prev,
      semesters: prev.semesters.map(s => s.id === semesterId ? { ...s, notes } : s)
    }));
  };

  const updateEndDate = (semesterId: string, endDate: string) => {
    setData(prev => ({
      ...prev,
      semesters: prev.semesters.map(s => s.id === semesterId ? { ...s, endDate } : s)
    }));
  };

  const updateSemesterName = (semesterId: string, name: string) => {
    setData(prev => ({
      ...prev,
      semesters: prev.semesters.map(s => s.id === semesterId ? { ...s, name } : s)
    }));
  };

  const addTimetableEntry = (formData: any) => {
    const newEntry: TimetableEntry = {
      id: Math.random().toString(36).substr(2, 9),
      courseId: formData.courseId,
      day: formData.day as any,
      startTime: formData.startTime,
      endTime: formData.endTime,
      location: formData.location
    };

    setData(prev => ({
      ...prev,
      timetable: [...prev.timetable, newEntry]
    }));
    setIsTimetableModalOpen(false);
    addToast('Class added to schedule!');
  };

  const deleteTimetableEntry = (id: string) => {
    setData(prev => ({
      ...prev,
      timetable: prev.timetable.filter(e => e.id !== id)
    }));
    addToast('Class removed from schedule', 'error');
  };

  const completeSemester = (semesterId: string) => {
    const sem = data.semesters.find(s => s.id === semesterId);
    if (!sem) return;

    const allGraded = sem.courses.every(c => c.grade !== '');
    if (!allGraded) {
      addToast('Every course must have a grade assigned!', 'error');
      return;
    }

    setIsConfirmModalOpen({ type: 'complete', semesterId });
  };

  const confirmCompleteSemester = () => {
    if (!isConfirmModalOpen?.semesterId) return;
    const semesterId = isConfirmModalOpen.semesterId;
    const currentSem = data.semesters.find(s => s.id === semesterId);
    if (!currentSem) return;

    const nextName = getNextSemesterName(currentSem.name);
    const nextSem: Semester = {
      id: Math.random().toString(36).substr(2, 9),
      name: nextName,
      isCurrent: true,
      isCompleted: false,
      courses: [],
      notes: ''
    };

    setData(prev => ({
      ...prev,
      semesters: [
        ...prev.semesters.map(s => s.id === semesterId ? { ...s, isCurrent: false, isCompleted: true } : s),
        nextSem
      ]
    }));

    setIsConfirmModalOpen(null);
    addToast(`Semester archived! Welcome to ${nextName}`);
  };

  const addTodo = (todo: Omit<Todo, 'id' | 'createdAt'>) => {
    setData(prev => ({
      ...prev,
      todos: [
        {
          id: Math.random().toString(36).substr(2, 9),
          ...todo,
          createdAt: new Date().toISOString()
        },
        ...(prev.todos || [])
      ]
    }));
  };

  const updateTodo = (id: string, updates: Partial<Todo>) => {
    setData(prev => ({
      ...prev,
      todos: (prev.todos || []).map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  };

  const toggleTodo = (id: string) => {
    setData(prev => ({
      ...prev,
      todos: (prev.todos || []).map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    }));
  };

  const deleteTodo = (id: string) => {
    setData(prev => ({
      ...prev,
      todos: (prev.todos || []).filter(t => t.id !== id)
    }));
  };

  const addCustomNote = (note: Omit<CustomNote, 'id' | 'createdAt' | 'updatedAt'>) => {
    setData(prev => ({
      ...prev,
      customNotes: [
        {
          id: Math.random().toString(36).substr(2, 9),
          ...note,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        ...(prev.customNotes || [])
      ]
    }));
  };

  const updateCustomNoteEnhanced = (id: string, updates: Partial<CustomNote>) => {
    setData(prev => ({
      ...prev,
      customNotes: (prev.customNotes || []).map(n => 
        n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n
      )
    }));
  };

  const updateCustomNote = (id: string, title: string, content: string) => {
    setData(prev => ({
      ...prev,
      customNotes: (prev.customNotes || []).map(n => 
        n.id === id ? { ...n, title, content, updatedAt: new Date().toISOString() } : n
      )
    }));
  };

  const deleteCustomNote = (id: string) => {
    setData(prev => ({
      ...prev,
      customNotes: (prev.customNotes || []).filter(n => n.id !== id)
    }));
  };

  // --- Budget Handlers ---
  const addBudget = (month: string, totalBudget: number) => {
    setData(prev => ({
      ...prev,
      budgets: [
        ...(prev.budgets || []),
        { id: Math.random().toString(36).substr(2, 9), month, totalBudget, expenses: [] }
      ]
    }));
    addToast('Budget created!');
  };

  const updateBudget = (budgetId: string, totalBudget: number) => {
    setData(prev => ({
      ...prev,
      budgets: (prev.budgets || []).map(b => 
        b.id === budgetId ? { ...b, totalBudget } : b
      )
    }));
    addToast('Budget updated!');
  };

  const addExpense = (budgetId: string, expense: Omit<Expense, 'id'>) => {
    setData(prev => ({
      ...prev,
      budgets: (prev.budgets || []).map(b => 
        b.id === budgetId 
          ? { ...b, expenses: [...b.expenses, { ...expense, id: Math.random().toString(36).substr(2, 9) }] }
          : b
      )
    }));
    addToast('Expense added!');
  };

  const deleteExpense = (budgetId: string, expenseId: string) => {
    setData(prev => ({
      ...prev,
      budgets: (prev.budgets || []).map(b => 
        b.id === budgetId 
          ? { ...b, expenses: b.expenses.filter(e => e.id !== expenseId) }
          : b
      )
    }));
    addToast('Expense deleted!');
  };

  // --- Income Handlers ---
  const addIncome = (budgetId: string, income: Omit<Income, 'id'>) => {
    setData(prev => ({
      ...prev,
      budgets: (prev.budgets || []).map(b => 
        b.id === budgetId 
          ? { ...b, incomes: [...(b.incomes || []), { ...income, id: Math.random().toString(36).substr(2, 9) }] }
          : b
      )
    }));
    addToast('Income added!');
  };

  const deleteIncome = (budgetId: string, incomeId: string) => {
    setData(prev => ({
      ...prev,
      budgets: (prev.budgets || []).map(b => 
        b.id === budgetId 
          ? { ...b, incomes: (b.incomes || []).filter(i => i.id !== incomeId) }
          : b
      )
    }));
    addToast('Income deleted!');
  };

  // --- Attendance Handlers ---
  const addAttendance = (record: Omit<AttendanceRecord, 'id'>) => {
    setData(prev => ({
      ...prev,
      attendance: [
        ...(prev.attendance || []),
        { ...record, id: Math.random().toString(36).substr(2, 9) }
      ]
    }));
  };

  const updateAttendance = (id: string, status: AttendanceStatus) => {
    setData(prev => ({
      ...prev,
      attendance: (prev.attendance || []).map(a => 
        a.id === id ? { ...a, status } : a
      )
    }));
  };

  const deleteAttendance = (id: string) => {
    setData(prev => ({
      ...prev,
      attendance: (prev.attendance || []).filter(a => a.id !== id)
    }));
  };

  // --- Grading Handlers ---
  const addGrading = (grading: CourseGrading) => {
    setData(prev => ({
      ...prev,
      courseGradings: [...(prev.courseGradings || []), grading]
    }));
    addToast('Course grading added!');
  };

  const updateGrading = (grading: CourseGrading) => {
    setData(prev => ({
      ...prev,
      courseGradings: (prev.courseGradings || []).map(g =>
        g.id === grading.id ? grading : g
      )
    }));
  };

  const deleteGrading = (id: string) => {
    setData(prev => ({
      ...prev,
      courseGradings: (prev.courseGradings || []).filter(g => g.id !== id)
    }));
    addToast('Course grading deleted!');
  };

  // Helper function to update study streak
  const updateStudyStreak = (currentStreak?: StudyStreak): StudyStreak => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    if (!currentStreak) {
      return { currentStreak: 1, longestStreak: 1, lastStudyDate: today };
    }

    const lastDate = currentStreak.lastStudyDate.split('T')[0];
    
    if (lastDate === today) {
      // Already studied today
      return currentStreak;
    } else if (lastDate === yesterday) {
      // Consecutive day
      const newStreak = currentStreak.currentStreak + 1;
      return {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, currentStreak.longestStreak),
        lastStudyDate: today,
      };
    } else {
      // Streak broken
      return {
        currentStreak: 1,
        longestStreak: currentStreak.longestStreak,
        lastStudyDate: today,
      };
    }
  };

  const clearAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `smart_gpa_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    addToast('Data exported successfully!');
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        setData(imported);
        addToast('Data imported successfully!');
      } catch (err) {
        addToast('Invalid backup file', 'error');
      }
    };
    reader.readAsText(file);
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setData(prev => ({ ...prev, notificationsEnabled: true }));
        addToast('Notifications enabled!');
        new Notification('Smart GPA Tracker', { body: 'Notifications are now active!' });
      }
    }
  };

  const sendTestNotification = () => {
    if (data.notificationsEnabled) {
      new Notification('Test Notification', { body: 'This is a test reminder from Smart GPA Tracker Pro!' });
    } else {
      addToast('Please enable notifications first', 'error');
    }
  };

  // --- Reminders Logic ---
  useEffect(() => {
    if (!data.notificationsEnabled) return;

    const checkReminders = () => {
      const now = new Date();
      
      // 1. Semester End Reminder
      data.semesters.forEach(sem => {
        if (sem.isCurrent && sem.endDate) {
          const endDate = new Date(sem.endDate);
          const diffTime = endDate.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays === 7) {
            new Notification('Semester Ending Soon', { 
              body: `Your current semester "${sem.name}" ends in 7 days!` 
            });
          }
        }
      });

      // 2. GPA Drop Reminder
      if (currentGPA < 3.0 && currentGPA > 0) {
        new Notification('GPA Alert', { 
          body: `Your current semester GPA has dropped below 3.0 (${currentGPA.toFixed(2)})` 
        });
      }
    };

    // Check once a day (or on load)
    checkReminders();
    const interval = setInterval(checkReminders, 24 * 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [data.notificationsEnabled, data.semesters, currentGPA]);

  // --- Simple Markdown Preview ---
  const MarkdownPreview: React.FC<{ content: string }> = ({ content }) => {
    if (!content) return <span className="italic opacity-50">No notes yet...</span>;
    
    // Very basic markdown parsing for bold, italic, and lists
    const html = content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^\s*-\s+(.*)$/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/s, '<ul class="list-disc ml-4">$1</ul>');

    return <div className="prose prose-sm dark:prose-invert" dangerouslySetInnerHTML={{ __html: html }} />;
  };

  // --- Render Tabs ---
  const renderHome = () => {
    return (
      <div className="space-y-5 sm:space-y-6 pb-28">
        {/* Hero Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Current GPA Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={clsx(
              "stat-card border",
              currentGPA >= 3.5 
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400/20' 
                : currentGPA >= 2.5 
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-400/20' 
                : 'bg-gradient-to-br from-red-500 to-rose-600 text-white border-red-400/20'
            )}
          >
            <p className="text-[10px] sm:text-xs font-bold uppercase mb-1 opacity-80">Current GPA</p>
            <p className="text-3xl sm:text-4xl font-black">
              {currentGPA.toFixed(2)}
            </p>
            <p className="text-[10px] opacity-70 mt-1">This semester</p>
          </motion.div>
          
          {/* Overall CGPA Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={clsx(
              "stat-card border",
              cgpa >= 3.5 
                ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-emerald-400/20' 
                : cgpa >= 2.5 
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white border-amber-400/20' 
                : 'bg-gradient-to-br from-red-500 to-rose-600 text-white border-red-400/20'
            )}
          >
            <p className="text-[10px] sm:text-xs font-bold uppercase mb-1 opacity-80">Overall CGPA</p>
            <p className="text-3xl sm:text-4xl font-black">
              {cgpa.toFixed(2)}
            </p>
            <p className="text-[10px] opacity-70 mt-1">Cumulative</p>
          </motion.div>
          
          {/* Total Credits Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="stat-card bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700"
          >
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase mb-1">Total Credits</p>
            <p className="text-3xl sm:text-4xl font-black text-white">{totalCredits}</p>
            <p className="text-[10px] text-slate-500 mt-1">Earned</p>
          </motion.div>
          
          {/* Grade Points Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="stat-card bg-gradient-to-br from-violet-900/50 to-purple-900/50 border border-violet-700/50"
          >
            <p className="text-[10px] sm:text-xs font-bold text-violet-400 uppercase mb-1">Grade Points</p>
            <p className="text-3xl sm:text-4xl font-black text-violet-300">{totalPoints.toFixed(1)}</p>
            <p className="text-[10px] text-violet-500 mt-1">Quality points</p>
          </motion.div>
        </div>

        {/* Quick Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="grid grid-cols-3 gap-3"
        >
          <div className="gpa-card text-center py-4">
            <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
              <TrendingUp size={14} />
              <span className="text-xs font-bold">Best Semester</span>
            </div>
            <p className="text-lg font-black text-white">
              {data.semesters.length > 0 
                ? Math.max(...data.semesters.filter(s => s.courses.some(c => c.grade)).map(s => calculateSemesterGPA(s.courses))).toFixed(2)
                : 'N/A'
              }
            </p>
          </div>
          <div className="gpa-card text-center py-4">
            <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
              <BookOpen size={14} />
              <span className="text-xs font-bold">Courses</span>
            </div>
            <p className="text-lg font-black text-white">
              {data.semesters.reduce((acc, s) => acc + s.courses.length, 0)}
            </p>
          </div>
          <div className="gpa-card text-center py-4">
            <div className="flex items-center justify-center gap-1 text-cyan-400 mb-1">
              <Award size={14} />
              <span className="text-xs font-bold">Semesters</span>
            </div>
            <p className="text-lg font-black text-white">
              {data.semesters.filter(s => s.isCompleted).length}
            </p>
          </div>
        </motion.div>

        {/* Quick Access Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.48 }}
          className="grid grid-cols-3 gap-3"
        >
          <button
            onClick={() => setActiveTab('budget')}
            className="gpa-card flex flex-col sm:flex-row items-center gap-2 sm:gap-3 py-4 hover:scale-[1.02] transition-transform cursor-pointer text-center sm:text-left"
          >
            <div className="p-3 bg-gradient-to-br from-green-900/50 to-emerald-900/50 rounded-xl">
              <Wallet size={24} className="text-green-400" />
            </div>
            <div>
              <p className="font-bold text-sm">Budget</p>
              <p className="text-xs text-slate-400 hidden sm:block">Track expenses</p>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className="gpa-card flex flex-col sm:flex-row items-center gap-2 sm:gap-3 py-4 hover:scale-[1.02] transition-transform cursor-pointer text-center sm:text-left"
          >
            <div className="p-3 bg-gradient-to-br from-violet-900/50 to-purple-900/50 rounded-xl">
              <UserCheck size={24} className="text-violet-400" />
            </div>
            <div>
              <p className="font-bold text-sm">Attendance</p>
              <p className="text-xs text-slate-400 hidden sm:block">Track classes</p>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('grading')}
            className="gpa-card flex flex-col sm:flex-row items-center gap-2 sm:gap-3 py-4 hover:scale-[1.02] transition-transform cursor-pointer text-center sm:text-left"
          >
            <div className="p-3 bg-gradient-to-br from-amber-900/50 to-orange-900/50 rounded-xl">
              <Award size={24} className="text-amber-400" />
            </div>
            <div>
              <p className="font-bold text-sm">Grades</p>
              <p className="text-xs text-slate-400 hidden sm:block">Course marks</p>
            </div>
          </button>
        </motion.div>

        {/* Study Tools Quick Access */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.52 }}
          className="grid grid-cols-4 gap-2"
        >
          <button
            onClick={() => setActiveTab('studyTimer')}
            className="gpa-card flex flex-col items-center gap-2 py-3 hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <div className="p-2.5 bg-gradient-to-br from-rose-900/50 to-pink-900/50 rounded-xl">
              <Timer size={20} className="text-rose-400" />
            </div>
            <p className="font-bold text-xs">Timer</p>
          </button>
          <button
            onClick={() => setActiveTab('gradeCalc')}
            className="gpa-card flex flex-col items-center gap-2 py-3 hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <div className="p-2.5 bg-gradient-to-br from-blue-900/50 to-indigo-900/50 rounded-xl">
              <Calculator size={20} className="text-blue-400" />
            </div>
            <p className="font-bold text-xs">GPA Calc</p>
          </button>
          <button
            onClick={() => setActiveTab('examCountdown')}
            className="gpa-card flex flex-col items-center gap-2 py-3 hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <div className="p-2.5 bg-gradient-to-br from-orange-900/50 to-red-900/50 rounded-xl">
              <CalendarClock size={20} className="text-orange-400" />
            </div>
            <p className="font-bold text-xs">Exams</p>
          </button>
          <button
            onClick={() => setActiveTab('studyStats')}
            className="gpa-card flex flex-col items-center gap-2 py-3 hover:scale-[1.02] transition-transform cursor-pointer"
          >
            <div className="p-2.5 bg-gradient-to-br from-teal-900/50 to-cyan-900/50 rounded-xl">
              <Activity size={20} className="text-teal-400" />
            </div>
            <p className="font-bold text-xs">Stats</p>
          </button>
        </motion.div>

        {/* GPA Trend Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="gpa-card"
        >
          <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
            <div className="p-2 bg-emerald-900/30 rounded-xl">
              <BarChart3 size={18} className="text-emerald-400" />
            </div>
            <span>GPA Trend</span>
          </h3>
          <GPAChart semesters={data.semesters} />
        </motion.div>

        {currentSemester && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h3 className="text-base sm:text-lg font-bold mb-4 flex items-center gap-2">
              <div className="p-2 bg-emerald-900/30 rounded-xl">
                <GraduationCap size={18} className="text-emerald-400" />
              </div>
              <span>Current Semester</span>
              {currentSemester.name && (
                <span className="text-xs font-medium text-slate-500">• {currentSemester.name}</span>
              )}
            </h3>
            <SemesterCard
              semester={currentSemester}
              onAddCourse={handleAddCourse}
              onDeleteCourse={deleteCourse}
              onEditCourse={handleEditCourse}
              onUpdateCourseNotes={updateCourseNotes}
              onUpdateSemesterNotes={updateSemesterNotes}
              onUpdateSemesterName={updateSemesterName}
              onUpdateEndDate={updateEndDate}
              onComplete={completeSemester}
            />
          </motion.div>
        )}
      </div>
    );
  };

  const renderSemesters = () => {
    return (
      <div className="space-y-5 sm:space-y-6 pb-28">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <h2 className="text-xl sm:text-2xl font-bold">All Semesters</h2>
          <span className="text-xs font-medium text-slate-500">
            {data.semesters.length} total
          </span>
        </motion.div>
        
        <div className="space-y-4 sm:space-y-5">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/50 to-transparent"></div>
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Active</h3>
            <div className="h-px flex-1 bg-gradient-to-l from-emerald-500/50 to-transparent"></div>
          </div>
          {data.semesters.filter(s => !s.isCompleted).length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm italic">
              No active semesters
            </div>
          )}
          {data.semesters.filter(s => !s.isCompleted).map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <SemesterCard
                semester={s}
                onAddCourse={handleAddCourse}
                onDeleteCourse={deleteCourse}
                onEditCourse={handleEditCourse}
                onUpdateCourseNotes={updateCourseNotes}
                onUpdateSemesterNotes={updateSemesterNotes}
                onUpdateSemesterName={updateSemesterName}
                onUpdateEndDate={updateEndDate}
                onComplete={completeSemester}
              />
            </motion.div>
          ))}

          <div className="flex items-center gap-2 mt-8">
            <div className="h-px flex-1 bg-gradient-to-r from-slate-400/50 to-transparent"></div>
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Archived</h3>
            <div className="h-px flex-1 bg-gradient-to-l from-slate-400/50 to-transparent"></div>
          </div>
          {data.semesters.filter(s => s.isCompleted).map((s, i) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <SemesterCard
                semester={s}
                onAddCourse={handleAddCourse}
                onDeleteCourse={deleteCourse}
                onEditCourse={handleEditCourse}
                onUpdateCourseNotes={updateCourseNotes}
                onUpdateSemesterNotes={updateSemesterNotes}
                onUpdateSemesterName={updateSemesterName}
                onUpdateEndDate={updateEndDate}
                onComplete={completeSemester}
              />
            </motion.div>
          ))}
        </div>
      </div>
    );
  };

  const renderNotes = () => {
    const allNotes = data.semesters.flatMap(s => [
      { id: s.id, title: `${s.name} - General Notes`, content: s.notes, type: 'semester', semesterId: s.id },
      ...s.courses.map(c => ({ id: c.id, title: `${s.name} - ${c.name}`, content: c.notes, type: 'course', semesterId: s.id, courseId: c.id }))
    ]).filter(n => n.content.toLowerCase().includes(searchQuery.toLowerCase()) || n.title.toLowerCase().includes(searchQuery.toLowerCase()));

    // Get all courses for todo linking
    const allCourses = data.semesters.flatMap(s => s.courses);

    return (
      <div className="space-y-5 sm:space-y-6 pb-28">
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
        >
          <h2 className="text-xl sm:text-2xl font-bold">Tasks & Notes</h2>
        </motion.div>

        {/* Enhanced Todo List */}
        <EnhancedTodoList 
          todos={(data.todos || []).map(t => ({
            ...t,
            priority: t.priority || 'medium',
            category: t.category || 'other'
          }))} 
          courses={allCourses}
          onAddTodo={addTodo} 
          onToggleTodo={toggleTodo} 
          onDeleteTodo={deleteTodo}
          onUpdateTodo={updateTodo}
        />

        {/* Global Scratchpad */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="gpa-card border-l-4 border-l-blue-500"
        >
          <h4 className="font-bold mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-900/30 rounded-xl">
                <BookOpen size={16} className="text-blue-400" />
              </div>
              Global Scratchpad
            </div>
            <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-800 px-2 py-1 rounded">
              Quick Notes
            </span>
          </h4>
          <RichTextEditor
            value={data.globalNotes || ''}
            onChange={(newContent) => setData(prev => ({ ...prev, globalNotes: newContent }))}
            placeholder="Jot down quick thoughts, ideas, or links here..."
            className="min-h-[150px]"
          />
        </motion.div>

        {/* Enhanced Notes Manager */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <EnhancedNotesManager
            notes={(data.customNotes || []).map(n => ({
              ...n,
              category: n.category || 'other',
              isPinned: n.isPinned || false,
              tags: n.tags || []
            }))}
            onAddNote={addCustomNote}
            onUpdateNote={updateCustomNoteEnhanced}
            onDeleteNote={deleteCustomNote}
          />
        </motion.div>

        {/* Course & Semester Notes */}
        {searchQuery && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Search size={18} className="text-slate-400" />
              <h3 className="font-bold">Search Results for "{searchQuery}"</h3>
              <button 
                onClick={() => setSearchQuery('')}
                className="ml-auto text-xs text-slate-400 hover:text-white"
              >
                Clear
              </button>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {allNotes.map(note => (
                <div key={note.id} className="gpa-card border-l-4 border-l-emerald-500">
                  <h4 className="font-bold mb-4 flex items-center justify-between">
                    {note.title}
                    <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-800 px-2 py-1 rounded">
                      {note.type}
                    </span>
                  </h4>
                  <RichTextEditor
                    value={note.content}
                    onChange={(newContent) => {
                      if (note.type === 'semester') {
                        updateSemesterNotes(note.semesterId, newContent);
                      } else if (note.courseId) {
                        updateCourseNotes(note.semesterId, note.courseId, newContent);
                      }
                    }}
                    placeholder="Start writing..."
                    className="min-h-[150px]"
                  />
                </div>
              ))}
              {allNotes.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <Search size={40} className="mx-auto mb-3 opacity-30" />
                  <p>No notes found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    );
  };

  const renderSettings = () => {
    return (
      <div className="space-y-5 sm:space-y-6 pb-28">
        <motion.h2 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xl sm:text-2xl font-bold"
        >
          Settings
        </motion.h2>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="gpa-card space-y-6"
        >
          {/* GPA Goal */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-900/30 rounded-xl">
                <Target size={20} className="text-emerald-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base">GPA Goal</h4>
                <p className="text-xs sm:text-sm text-slate-400">Set your target cumulative GPA</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                max="4"
                step="0.1"
                value={data.gpaGoal || 3.5}
                onChange={(e) => setData(prev => ({ ...prev, gpaGoal: parseFloat(e.target.value) || 3.5 }))}
                className="w-20 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-center font-bold text-emerald-400 focus:ring-2 focus:ring-emerald-500/50 outline-none"
              />
              <span className="text-slate-500 text-sm">/4.0</span>
            </div>
          </div>

          {/* Goal Progress */}
          <div className="bg-slate-800/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Progress to Goal</span>
              <span className={clsx(
                "text-sm font-bold",
                cgpa >= (data.gpaGoal || 3.5) ? 'text-emerald-400' : 'text-amber-400'
              )}>
                {cgpa >= (data.gpaGoal || 3.5) ? '🎉 Goal Reached!' : `${((cgpa / (data.gpaGoal || 3.5)) * 100).toFixed(1)}%`}
              </span>
            </div>
            <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((cgpa / (data.gpaGoal || 3.5)) * 100, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={clsx(
                  "h-full rounded-full",
                  cgpa >= (data.gpaGoal || 3.5) 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400' 
                    : 'bg-gradient-to-r from-amber-500 to-orange-400'
                )}
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="border-t border-slate-800 pt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-900/30 rounded-xl">
                <Bell size={20} className="text-amber-400" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base">Notifications</h4>
                <p className="text-xs sm:text-sm text-slate-400">Enable push notifications</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={sendTestNotification} className="btn-secondary text-xs sm:text-sm py-2 px-3">Test</button>
              <button
                onClick={requestNotificationPermission}
                className={clsx("p-3 rounded-xl transition-all", data.notificationsEnabled ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-800 hover:bg-slate-700')}
              >
                <Bell size={20} />
              </button>
            </div>
          </div>

          {/* Data Management */}
          <div className="border-t border-slate-800 pt-6 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-blue-900/30 rounded-xl">
                <Download size={20} className="text-blue-400" />
              </div>
              <h4 className="font-bold text-sm sm:text-base">Data Management</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button onClick={exportData} className="btn-secondary flex items-center justify-center gap-2 text-sm">
                <Download size={16} /> Export Backup
              </button>
              <label className="btn-secondary flex items-center justify-center gap-2 cursor-pointer text-sm">
                <Upload size={16} /> Import Backup
                <input type="file" accept=".json" onChange={importData} className="hidden" />
              </label>
              <button onClick={() => setIsConfirmModalOpen({ type: 'clear' })} className="btn-secondary text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center gap-2 sm:col-span-2 text-sm">
                <Trash2 size={16} /> Clear All Data
              </button>
            </div>
          </div>
        </motion.div>

        {/* App Info Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white p-5 sm:p-6 shadow-xl shadow-emerald-500/20"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <GraduationCap size={24} />
              </div>
              <div>
                <h4 className="font-bold text-lg">Smart GPA Tracker Pro</h4>
                <p className="text-xs opacity-80">Version 3.0</p>
              </div>
            </div>
            <p className="text-sm opacity-90">Your data is stored locally on this device. Export backups regularly to avoid data loss.</p>
            <p className="text-xs opacity-70 mt-3">Built with ❤️ for students everywhere</p>
          </div>
        </motion.div>
      </div>
    );
  };

  return (
    <div className="min-h-screen max-w-4xl mx-auto px-3 sm:px-4 safe-top">
      {/* Header */}
      <header className="flex items-center justify-between mb-6 sm:mb-8 pt-2">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <GraduationCap size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black gradient-text">SmartGPA</h1>
            <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wider">Tracker Pro</p>
          </div>
        </motion.div>
        {/* Quick CGPA Display */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="text-right mr-2 hidden sm:block">
            <p className="text-[10px] text-slate-500 uppercase font-bold">CGPA</p>
            <p className={clsx("text-lg font-black", cgpa >= 3.5 ? 'text-emerald-400' : cgpa >= 2.5 ? 'text-amber-400' : 'text-red-400')}>
              {cgpa.toFixed(2)}
            </p>
          </div>
          <div className="relative w-10 h-10 sm:w-12 sm:h-12">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="16" fill="none" className="stroke-slate-700" strokeWidth="3" />
              <circle 
                cx="18" cy="18" r="16" fill="none" 
                className={clsx(cgpa >= 3.5 ? 'stroke-emerald-400' : cgpa >= 2.5 ? 'stroke-amber-400' : 'stroke-red-400')}
                strokeWidth="3" 
                strokeDasharray={`${(cgpa / 4) * 100} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold sm:hidden">
              {cgpa.toFixed(1)}
            </span>
          </div>
        </motion.div>
      </header>

      {/* Main Content */}
      <main>
        {activeTab === 'home' && renderHome()}
        {activeTab === 'semesters' && renderSemesters()}
        {activeTab === 'timetable' && (
          <div className="space-y-6 pb-24">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <h2 className="text-xl sm:text-2xl font-bold">Class Timetable</h2>
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
            </motion.div>
            <EnhancedTimetable 
              entries={data.timetable} 
              courses={data.semesters.flatMap(s => s.courses)}
              onAddEntry={() => setIsTimetableModalOpen(true)}
              onDeleteEntry={deleteTimetableEntry}
            />
          </div>
        )}
        {activeTab === 'notes' && renderNotes()}
        {activeTab === 'chart' && (
          <div className="space-y-6 pb-24">
            <h2 className="text-2xl font-bold">GPA Analytics</h2>
            <div className="gpa-card bg-slate-900">
              <GPAChart semesters={data.semesters} />
            </div>
            <Forecast currentCredits={totalCredits} currentPoints={totalPoints} semesters={data.semesters} />
          </div>
        )}
        {activeTab === 'budget' && (
          <div className="space-y-6 pb-28">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <h2 className="text-xl sm:text-2xl font-bold">Budget Tracker</h2>
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
            </motion.div>
            <EnhancedBudgetTracker
              budgets={data.budgets || []}
              onAddBudget={addBudget}
              onAddExpense={addExpense}
              onDeleteExpense={deleteExpense}
              onUpdateBudget={updateBudget}
              onAddIncome={addIncome}
              onDeleteIncome={deleteIncome}
            />
          </div>
        )}
        {activeTab === 'attendance' && (
          <div className="space-y-6 pb-28">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <h2 className="text-xl sm:text-2xl font-bold">Attendance</h2>
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
            </motion.div>
            <AttendanceTracker
              attendance={data.attendance || []}
              semesters={data.semesters}
              onAddAttendance={addAttendance}
              onUpdateAttendance={updateAttendance}
              onDeleteAttendance={deleteAttendance}
            />
          </div>
        )}
        {activeTab === 'grading' && (
          <div className="space-y-6 pb-28">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
            </motion.div>
            <GradingSystem
              gradings={data.courseGradings || []}
              semesters={data.semesters}
              onAddGrading={addGrading}
              onUpdateGrading={updateGrading}
              onDeleteGrading={deleteGrading}
            />
          </div>
        )}
        {activeTab === 'studyTimer' && (
          <div className="space-y-6 pb-28">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Timer size={24} className="text-rose-400" />
                Study Timer
              </h2>
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
            </motion.div>
            <StudyTimer
              sessions={(data.studySessions || []).map(s => ({
                id: s.id,
                date: s.date,
                duration: s.duration,
                type: 'focus' as const,
                completed: true,
              }))}
              onAddSession={(session) => {
                const newSession: StudySession = {
                  id: Date.now().toString(),
                  date: session.date,
                  duration: session.duration,
                  focusSessions: 1,
                };
                setData(prev => ({
                  ...prev,
                  studySessions: [...(prev.studySessions || []), newSession],
                  studyStreak: updateStudyStreak(prev.studyStreak),
                }));
              }}
            />
          </div>
        )}
        {activeTab === 'gradeCalc' && (
          <div className="space-y-6 pb-28">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Calculator size={24} className="text-blue-400" />
                GPA Calculator
              </h2>
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
            </motion.div>
            <GradeCalculator
              semesters={data.semesters}
              currentCGPA={cgpa}
            />
          </div>
        )}
        {activeTab === 'examCountdown' && (
          <div className="space-y-6 pb-28">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <CalendarClock size={24} className="text-orange-400" />
                Exam Countdown
              </h2>
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
            </motion.div>
            <ExamCountdown
              exams={data.exams || []}
              onAddExam={(exam) => {
                const newExam: Exam = {
                  ...exam,
                  id: Date.now().toString(),
                };
                setData(prev => ({ ...prev, exams: [...(prev.exams || []), newExam] }));
              }}
              onUpdateExam={(id, updates) => {
                setData(prev => ({
                  ...prev,
                  exams: (prev.exams || []).map(e => e.id === id ? { ...e, ...updates } : e),
                }));
              }}
              onDeleteExam={(id) => {
                setData(prev => ({
                  ...prev,
                  exams: (prev.exams || []).filter(e => e.id !== id),
                }));
              }}
            />
          </div>
        )}
        {activeTab === 'studyStats' && (
          <div className="space-y-6 pb-28">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between"
            >
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Activity size={24} className="text-teal-400" />
                Study Statistics
              </h2>
              <button
                onClick={() => setActiveTab('home')}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                ← Back
              </button>
            </motion.div>
            <StudyStatistics
              sessions={data.studySessions || []}
              currentStreak={data.studyStreak?.currentStreak || 0}
              longestStreak={data.studyStreak?.longestStreak || 0}
            />
          </div>
        )}
        {activeTab === 'settings' && renderSettings()}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 glass-bg border-t border-slate-700/50 px-2 sm:px-6 py-2 sm:py-3 z-50 safe-bottom">
        <div className="max-w-4xl mx-auto flex items-center justify-around sm:justify-between">
          <button onClick={() => setActiveTab('home')} className={clsx("nav-item", activeTab === 'home' && "active")}>
            <LayoutDashboard size={22} />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase hidden xs:block">Home</span>
          </button>
          <button onClick={() => setActiveTab('semesters')} className={clsx("nav-item", activeTab === 'semesters' && "active")}>
            <GraduationCap size={22} />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase hidden xs:block">Semesters</span>
          </button>
          <button onClick={() => setActiveTab('timetable')} className={clsx("nav-item", activeTab === 'timetable' && "active")}>
            <Calendar size={22} />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase hidden xs:block">Schedule</span>
          </button>
          <button onClick={() => setActiveTab('notes')} className={clsx("nav-item", activeTab === 'notes' && "active")}>
            <StickyNote size={22} />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase hidden xs:block">Notes</span>
          </button>
          <button onClick={() => setActiveTab('chart')} className={clsx("nav-item", activeTab === 'chart' && "active")}>
            <BarChart3 size={22} />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase hidden xs:block">Chart</span>
          </button>
          <button onClick={() => setActiveTab('settings')} className={clsx("nav-item", activeTab === 'settings' && "active")}>
            <Settings size={22} />
            <span className="text-[9px] sm:text-[10px] font-bold uppercase hidden xs:block">Settings</span>
          </button>
        </div>
      </nav>

      {/* Timetable Modal */}
      <AnimatePresence>
        {isTimetableModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsTimetableModalOpen(false)}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Add Class to Schedule</h3>
                <button onClick={() => setIsTimetableModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                addTimetableEntry(Object.fromEntries(formData));
              }} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Course</label>
                  <select name="courseId" className="input-field" required>
                    <option value="">Select a course</option>
                    {data.semesters.flatMap(s => s.courses).map(c => (
                      <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Day</label>
                  <select name="day" className="input-field" required>
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Start Time</label>
                    <input name="startTime" type="time" className="input-field" required />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">End Time</label>
                    <input name="endTime" type="time" className="input-field" required />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Location (Optional)</label>
                  <input name="location" placeholder="Room 302, Building B" className="input-field" />
                </div>
                <button type="submit" className="w-full btn-primary py-3 mt-4">
                  Add to Schedule
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isCourseModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCourseModalOpen(false)}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">{editingCourse?.course ? 'Edit Course' : 'Add New Course'}</h3>
                <button onClick={() => setIsCourseModalOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full">
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                saveCourse(Object.fromEntries(formData));
              }} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Course Code</label>
                    <input name="code" defaultValue={editingCourse?.course?.code} placeholder="CS101" className="input-field" required />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Credits</label>
                    <input name="credits" type="number" step="0.5" min="0.5" max="6" defaultValue={editingCourse?.course?.credits || 3} className="input-field" required />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Course Name</label>
                  <input name="name" defaultValue={editingCourse?.course?.name} placeholder="Introduction to Computing" className="input-field" required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Grade</label>
                    <select name="grade" defaultValue={editingCourse?.course?.grade} className="input-field">
                      <option value="">Select Grade</option>
                      {Object.keys(percentageToGrade(100)).map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                      {['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'].map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Percentage (%)</label>
                    <input 
                      name="percentage" 
                      type="number" 
                      placeholder="Optional" 
                      className="input-field"
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          const grade = percentageToGrade(val);
                          const select = (e.target.form as HTMLFormElement).elements.namedItem('grade') as HTMLSelectElement;
                          if (select) select.value = grade;
                        }
                      }}
                    />
                  </div>
                </div>
                <button type="submit" className="w-full btn-primary py-3 mt-4">
                  {editingCourse?.course ? 'Update Course' : 'Add Course'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsConfirmModalOpen(null)}
              className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold mb-2">
                {isConfirmModalOpen.type === 'complete' ? 'Archive Semester?' : 'Clear All Data?'}
              </h3>
              <p className="text-slate-500 text-sm mb-6">
                {isConfirmModalOpen.type === 'complete' 
                  ? 'This will mark the current semester as completed and start a new one. You can still edit it later.'
                  : 'This action is irreversible. All your semesters, courses, and notes will be permanently deleted.'}
              </p>
              <div className="flex flex-col gap-2">
                <button
                  onClick={isConfirmModalOpen.type === 'complete' ? confirmCompleteSemester : clearAllData}
                  className={clsx("w-full py-3 rounded-xl font-bold text-white", isConfirmModalOpen.type === 'complete' ? 'bg-emerald-600' : 'bg-red-600')}
                >
                  {isConfirmModalOpen.type === 'complete' ? 'Yes, Archive & Continue' : 'Yes, Delete Everything'}
                </button>
                <button onClick={() => setIsConfirmModalOpen(null)} className="w-full py-3 btn-secondary">
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toasts */}
      <div className="fixed top-6 right-6 z-[200] flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              className={clsx(
                "px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 min-w-[200px] pointer-events-auto border",
                toast.type === 'success' ? 'bg-white dark:bg-slate-900 border-emerald-500 text-emerald-600' : 'bg-white dark:bg-slate-900 border-red-500 text-red-600'
              )}
            >
              {toast.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
              <span className="text-sm font-bold">{toast.message}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default App;
