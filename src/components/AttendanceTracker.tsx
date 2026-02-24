import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  UserCheck, UserX, Clock, FileText, Plus, ChevronLeft, ChevronRight,
  Calendar, TrendingUp, AlertTriangle, CheckCircle2, XCircle, AlertCircle
} from 'lucide-react';
import clsx from 'clsx';
import { AttendanceRecord, AttendanceStatus, Course, Semester } from '../types';

interface AttendanceTrackerProps {
  attendance: AttendanceRecord[];
  semesters: Semester[];
  onAddAttendance: (record: Omit<AttendanceRecord, 'id'>) => void;
  onUpdateAttendance: (id: string, status: AttendanceStatus) => void;
  onDeleteAttendance: (id: string) => void;
}

const STATUS_CONFIG: Record<AttendanceStatus, { icon: typeof UserCheck; color: string; bgColor: string; label: string }> = {
  present: { icon: CheckCircle2, color: 'text-emerald-400', bgColor: 'bg-emerald-900/30', label: 'Present' },
  absent: { icon: XCircle, color: 'text-red-400', bgColor: 'bg-red-900/30', label: 'Absent' },
  late: { icon: Clock, color: 'text-amber-400', bgColor: 'bg-amber-900/30', label: 'Late' },
  excused: { icon: AlertCircle, color: 'text-blue-400', bgColor: 'bg-blue-900/30', label: 'Excused' },
};

export default function AttendanceTracker({
  attendance,
  semesters,
  onAddAttendance,
  onUpdateAttendance,
  onDeleteAttendance,
}: AttendanceTrackerProps) {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<AttendanceStatus>('present');
  const [notes, setNotes] = useState('');
  const [viewMode, setViewMode] = useState<'daily' | 'summary'>('daily');

  // Get all courses from active semesters
  const allCourses = useMemo(() => {
    return semesters
      .filter(s => !s.isCompleted)
      .flatMap(s => s.courses.map(c => ({ ...c, semesterName: s.name })));
  }, [semesters]);

  // Get attendance for selected date
  const dailyAttendance = useMemo(() => {
    return attendance.filter(a => a.date === selectedDate);
  }, [attendance, selectedDate]);

  // Calculate attendance stats per course
  const courseStats = useMemo(() => {
    return allCourses.map(course => {
      const records = attendance.filter(a => a.courseId === course.id);
      const total = records.length;
      const present = records.filter(r => r.status === 'present').length;
      const late = records.filter(r => r.status === 'late').length;
      const absent = records.filter(r => r.status === 'absent').length;
      const excused = records.filter(r => r.status === 'excused').length;
      const attendanceRate = total > 0 ? ((present + late + excused) / total) * 100 : 100;
      
      return {
        course,
        total,
        present,
        late,
        absent,
        excused,
        attendanceRate,
      };
    });
  }, [allCourses, attendance]);

  // Overall attendance rate
  const overallStats = useMemo(() => {
    const total = attendance.length;
    const present = attendance.filter(r => r.status === 'present').length;
    const late = attendance.filter(r => r.status === 'late').length;
    const absent = attendance.filter(r => r.status === 'absent').length;
    const excused = attendance.filter(r => r.status === 'excused').length;
    const rate = total > 0 ? ((present + late + excused) / total) * 100 : 100;
    
    return { total, present, late, absent, excused, rate };
  }, [attendance]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const date = new Date(selectedDate);
    date.setDate(date.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(date.toISOString().split('T')[0]);
  };

  const handleAddAttendance = () => {
    if (selectedCourse) {
      onAddAttendance({
        courseId: selectedCourse,
        date: selectedDate,
        status: selectedStatus,
        notes: notes || undefined,
      });
      setShowAddModal(false);
      setSelectedCourse('');
      setSelectedStatus('present');
      setNotes('');
    }
  };

  const getStatusColor = (rate: number) => {
    if (rate >= 90) return 'text-emerald-400';
    if (rate >= 75) return 'text-amber-400';
    return 'text-red-400';
  };

  const getStatusBg = (rate: number) => {
    if (rate >= 90) return 'from-emerald-500 to-teal-400';
    if (rate >= 75) return 'from-amber-500 to-orange-400';
    return 'from-red-500 to-rose-400';
  };

  return (
    <div className="space-y-5">
      {/* Header with View Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-900/30 rounded-xl">
            <UserCheck size={20} className="text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Attendance Tracker</h3>
            <p className="text-xs text-slate-400">Track your class attendance</p>
          </div>
        </div>
        <div className="flex bg-slate-800 rounded-xl p-1">
          <button
            onClick={() => setViewMode('daily')}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              viewMode === 'daily' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
            )}
          >
            Daily
          </button>
          <button
            onClick={() => setViewMode('summary')}
            className={clsx(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all",
              viewMode === 'summary' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'
            )}
          >
            Summary
          </button>
        </div>
      </motion.div>

      {/* Overall Stats Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="gpa-card"
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold flex items-center gap-2">
            <TrendingUp size={18} className="text-cyan-400" />
            Overall Attendance
          </h4>
          <span className={clsx("text-2xl font-black", getStatusColor(overallStats.rate))}>
            {overallStats.rate.toFixed(1)}%
          </span>
        </div>

        <div className="h-3 bg-slate-700 rounded-full overflow-hidden mb-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${overallStats.rate}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={clsx("h-full rounded-full bg-gradient-to-r", getStatusBg(overallStats.rate))}
          />
        </div>

        <div className="grid grid-cols-4 gap-2">
          {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map(status => {
            const { icon: Icon, color, bgColor, label } = STATUS_CONFIG[status];
            const count = overallStats[status];
            return (
              <div key={status} className="text-center">
                <div className={clsx("inline-flex p-2 rounded-lg mb-1", bgColor)}>
                  <Icon size={16} className={color} />
                </div>
                <p className="text-lg font-bold">{count}</p>
                <p className="text-[10px] text-slate-400 uppercase">{label}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      {viewMode === 'daily' ? (
        <>
          {/* Date Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="gpa-card"
          >
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => navigateDate('prev')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex items-center gap-2">
                <Calendar className="text-violet-400" size={18} />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-transparent text-center font-bold focus:outline-none cursor-pointer"
                />
              </div>
              <button
                onClick={() => navigateDate('next')}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Quick Add Buttons for Each Course */}
            {allCourses.length > 0 ? (
              <div className="space-y-3">
                <p className="text-xs text-slate-400 uppercase font-bold">Mark Attendance</p>
                {allCourses.map((course, index) => {
                  const existingRecord = dailyAttendance.find(a => a.courseId === course.id);
                  
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-slate-800/50 rounded-xl p-3"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="font-medium text-sm">{course.name}</p>
                          <p className="text-xs text-slate-400">{course.code}</p>
                        </div>
                        {existingRecord && (
                          <span className={clsx(
                            "text-xs px-2 py-1 rounded-full font-bold",
                            STATUS_CONFIG[existingRecord.status].bgColor,
                            STATUS_CONFIG[existingRecord.status].color
                          )}>
                            {STATUS_CONFIG[existingRecord.status].label}
                          </span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {(Object.keys(STATUS_CONFIG) as AttendanceStatus[]).map(status => {
                          const { icon: Icon, color, bgColor } = STATUS_CONFIG[status];
                          const isActive = existingRecord?.status === status;
                          
                          return (
                            <button
                              key={status}
                              onClick={() => {
                                if (existingRecord) {
                                  if (existingRecord.status === status) {
                                    onDeleteAttendance(existingRecord.id);
                                  } else {
                                    onUpdateAttendance(existingRecord.id, status);
                                  }
                                } else {
                                  onAddAttendance({
                                    courseId: course.id,
                                    date: selectedDate,
                                    status,
                                  });
                                }
                              }}
                              className={clsx(
                                "flex-1 p-2 rounded-lg transition-all flex items-center justify-center gap-1",
                                isActive 
                                  ? `${bgColor} ring-2 ring-offset-2 ring-offset-slate-900 ring-current ${color}` 
                                  : 'bg-slate-700/50 hover:bg-slate-700 text-slate-400'
                              )}
                              title={STATUS_CONFIG[status].label}
                            >
                              <Icon size={16} />
                              <span className="hidden sm:inline text-xs">{STATUS_CONFIG[status].label}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <UserX size={40} className="mx-auto mb-2 opacity-50" />
                <p>No active courses found</p>
                <p className="text-xs mt-1">Add courses to your current semester first</p>
              </div>
            )}
          </motion.div>
        </>
      ) : (
        <>
          {/* Course-by-Course Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-3"
          >
            {courseStats.length > 0 ? (
              courseStats.map((stat, index) => (
                <motion.div
                  key={stat.course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="gpa-card"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold">{stat.course.name}</h4>
                      <p className="text-xs text-slate-400">{stat.course.code} • {stat.total} classes recorded</p>
                    </div>
                    <div className="text-right">
                      <p className={clsx("text-xl font-black", getStatusColor(stat.attendanceRate))}>
                        {stat.attendanceRate.toFixed(1)}%
                      </p>
                      {stat.attendanceRate < 75 && (
                        <p className="text-xs text-red-400 flex items-center gap-1">
                          <AlertTriangle size={12} /> Low attendance
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stat.attendanceRate}%` }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className={clsx("h-full rounded-full bg-gradient-to-r", getStatusBg(stat.attendanceRate))}
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-sm font-bold text-emerald-400">{stat.present}</p>
                      <p className="text-[10px] text-slate-400">Present</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-amber-400">{stat.late}</p>
                      <p className="text-[10px] text-slate-400">Late</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-red-400">{stat.absent}</p>
                      <p className="text-[10px] text-slate-400">Absent</p>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-400">{stat.excused}</p>
                      <p className="text-[10px] text-slate-400">Excused</p>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="gpa-card text-center py-8 text-slate-400">
                <FileText size={40} className="mx-auto mb-2 opacity-50" />
                <p>No courses to show</p>
                <p className="text-xs mt-1">Add courses to track attendance</p>
              </div>
            )}
          </motion.div>

          {/* Attendance Warning */}
          {courseStats.some(s => s.attendanceRate < 75 && s.total > 0) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="gpa-card bg-gradient-to-r from-red-900/30 to-orange-900/30 border border-red-500/30"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-900/50 rounded-xl">
                  <AlertTriangle size={20} className="text-red-400" />
                </div>
                <div>
                  <h4 className="font-bold text-red-400">Attendance Alert</h4>
                  <p className="text-sm text-slate-300">
                    Some of your courses have attendance below 75%. 
                    This may affect your eligibility to sit for exams.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
