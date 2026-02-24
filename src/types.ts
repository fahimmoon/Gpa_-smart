export type Grade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F';

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  grade: Grade | '';
  percentage?: number;
  notes: string;
}

export interface Semester {
  id: string;
  name: string;
  isCurrent: boolean;
  isCompleted: boolean;
  courses: Course[];
  notes: string;
  endDate?: string;
}

export interface TimetableEntry {
  id: string;
  courseId: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  startTime: string;
  endTime: string;
  location?: string;
}

export type TodoPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TodoCategory = 'assignment' | 'exam' | 'project' | 'reading' | 'meeting' | 'personal' | 'other';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
  dueDate?: string;
  priority: TodoPriority;
  category: TodoCategory;
  courseId?: string;
  reminder?: string;
}

export type NoteCategory = 'lecture' | 'study' | 'ideas' | 'important' | 'personal' | 'other';

export interface CustomNote {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  category: NoteCategory;
  isPinned: boolean;
  color?: string;
  tags?: string[];
}

export type ExpenseCategory = 'food' | 'transport' | 'books' | 'entertainment' | 'utilities' | 'rent' | 'other';
export type IncomeSource = 'allowance' | 'parttime' | 'scholarship' | 'freelance' | 'gift' | 'other';

export interface Expense {
  id: string;
  amount: number;
  category: ExpenseCategory;
  description: string;
  date: string;
}

export interface Income {
  id: string;
  amount: number;
  source: IncomeSource;
  description: string;
  date: string;
}

export interface MonthlyBudget {
  id: string;
  month: string; // YYYY-MM format
  totalBudget: number;
  expenses: Expense[];
  incomes: Income[];
}

export interface StudySession {
  id: string;
  courseId?: string;
  courseName?: string;
  subject?: string;
  duration: number; // in minutes
  focusSessions: number;
  date: string;
  notes?: string;
}

export type ExamType = 'midterm' | 'final' | 'quiz' | 'presentation' | 'lab' | 'assignment';

export interface Exam {
  id: string;
  name: string;
  courseName: string;
  date: string;
  time?: string;
  location?: string;
  type: ExamType;
  notes?: string;
  isCompleted: boolean;
}

export interface StudyTimerSettings {
  focusDuration: number; // minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  sessionsBeforeLongBreak: number;
  autoStartBreaks: boolean;
  soundEnabled: boolean;
}

export interface StudyStreak {
  currentStreak: number;
  longestStreak: number;
  lastStudyDate: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceRecord {
  id: string;
  courseId: string;
  semesterId: string;
  date: string;
  status: AttendanceStatus;
  notes?: string;
}

// Grading System Types
export type MarksHeadType = 'assignment' | 'quiz' | 'midterm' | 'final' | 'project' | 'test' | 'presentation' | 'lab' | 'participation' | 'other';

export interface MarksHead {
  id: string;
  name: string;
  type: MarksHeadType;
  maxMarks: number;
  marksObtained: number | null; // null means not entered
  weightage?: number; // percentage weightage if applicable
}

export interface CourseGrading {
  id: string;
  courseId: string;
  semesterId: string;
  courseName: string;
  courseCode: string;
  instructor: string;
  program: string;
  section: string;
  marksHeads: MarksHead[];
  totalMaxMarks: number;
  totalObtained: number;
  percentage: number;
  grade: Grade | '';
  notes?: string;
}

export interface AppData {
  semesters: Semester[];
  timetable: TimetableEntry[];
  todos?: Todo[];
  customNotes?: CustomNote[];
  globalNotes?: string;
  theme: 'dark';
  gpaGoal?: number;
  notificationsEnabled: boolean;
  customReminders: { id: string; text: string; date: string }[];
  // Budget features
  budgets?: MonthlyBudget[];
  // Study tracking
  studySessions?: StudySession[];
  studyGoalMinutes?: number; // daily study goal in minutes
  studyTimerSettings?: StudyTimerSettings;
  studyStreak?: StudyStreak;
  // Exam tracking
  exams?: Exam[];
  // Attendance
  attendance?: AttendanceRecord[];
  courseGradings?: CourseGrading[];
}

export const GRADE_SCALE: Record<Grade, number> = {
  'A+': 4.0,
  'A': 3.75,
  'A-': 3.5,
  'B+': 3.25,
  'B': 3.0,
  'B-': 2.75,
  'C+': 2.5,
  'C': 2.0,
  'C-': 1.5,
  'D+': 1.0,
  'D': 0.5,
  'D-': 0.0,
  'F': 0.0,
};

export const STORAGE_KEY = 'smartGPAData_v3';
