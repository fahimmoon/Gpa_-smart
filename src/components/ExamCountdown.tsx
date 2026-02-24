import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, Plus, Trash2, Edit2, Clock, AlertTriangle,
  CheckCircle, BookOpen, ChevronDown, ChevronUp, Bell,
  FileText, Presentation, FlaskConical, Target, Sparkles
} from 'lucide-react';
import clsx from 'clsx';

interface Exam {
  id: string;
  name: string;
  courseName: string;
  date: string;
  time?: string;
  location?: string;
  type: 'midterm' | 'final' | 'quiz' | 'presentation' | 'lab' | 'assignment';
  notes?: string;
  isCompleted: boolean;
}

interface ExamCountdownProps {
  exams: Exam[];
  onAddExam: (exam: Omit<Exam, 'id'>) => void;
  onUpdateExam: (id: string, exam: Partial<Exam>) => void;
  onDeleteExam: (id: string) => void;
}

const EXAM_TYPES = {
  midterm: { icon: FileText, color: 'text-orange-400 bg-orange-900/30', label: 'Midterm' },
  final: { icon: BookOpen, color: 'text-red-400 bg-red-900/30', label: 'Final' },
  quiz: { icon: Target, color: 'text-blue-400 bg-blue-900/30', label: 'Quiz' },
  presentation: { icon: Presentation, color: 'text-purple-400 bg-purple-900/30', label: 'Presentation' },
  lab: { icon: FlaskConical, color: 'text-emerald-400 bg-emerald-900/30', label: 'Lab' },
  assignment: { icon: FileText, color: 'text-cyan-400 bg-cyan-900/30', label: 'Assignment' },
};

export default function ExamCountdown({ 
  exams, 
  onAddExam, 
  onUpdateExam, 
  onDeleteExam 
}: ExamCountdownProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('upcoming');
  const [now, setNow] = useState(new Date());

  const [newExam, setNewExam] = useState({
    name: '',
    courseName: '',
    date: '',
    time: '',
    location: '',
    type: 'midterm' as Exam['type'],
    notes: '',
  });

  // Update time every minute
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Process and sort exams
  const processedExams = useMemo(() => {
    return exams
      .map(exam => {
        const examDate = new Date(exam.date + (exam.time ? `T${exam.time}` : 'T23:59'));
        const diff = examDate.getTime() - now.getTime();
        const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
        const hoursLeft = Math.ceil(diff / (1000 * 60 * 60));
        const isPast = diff < 0;
        
        return {
          ...exam,
          examDate,
          daysLeft,
          hoursLeft,
          isPast,
        };
      })
      .sort((a, b) => a.examDate.getTime() - b.examDate.getTime());
  }, [exams, now]);

  const filteredExams = useMemo(() => {
    switch (filter) {
      case 'upcoming':
        return processedExams.filter(e => !e.isCompleted && !e.isPast);
      case 'completed':
        return processedExams.filter(e => e.isCompleted);
      default:
        return processedExams;
    }
  }, [processedExams, filter]);

  // Stats
  const upcomingCount = processedExams.filter(e => !e.isCompleted && !e.isPast).length;
  const thisWeekCount = processedExams.filter(e => !e.isCompleted && e.daysLeft >= 0 && e.daysLeft <= 7).length;
  const nextExam = processedExams.find(e => !e.isCompleted && !e.isPast);

  const handleSubmit = () => {
    if (newExam.name && newExam.courseName && newExam.date) {
      if (editingId) {
        onUpdateExam(editingId, newExam);
        setEditingId(null);
      } else {
        onAddExam({ ...newExam, isCompleted: false });
      }
      setNewExam({
        name: '',
        courseName: '',
        date: '',
        time: '',
        location: '',
        type: 'midterm',
        notes: '',
      });
      setShowAddForm(false);
    }
  };

  const startEdit = (exam: Exam) => {
    setEditingId(exam.id);
    setNewExam({
      name: exam.name,
      courseName: exam.courseName,
      date: exam.date,
      time: exam.time || '',
      location: exam.location || '',
      type: exam.type,
      notes: exam.notes || '',
    });
    setShowAddForm(true);
  };

  const getUrgencyColor = (daysLeft: number, isPast: boolean) => {
    if (isPast) return 'text-slate-500';
    if (daysLeft <= 1) return 'text-red-400';
    if (daysLeft <= 3) return 'text-orange-400';
    if (daysLeft <= 7) return 'text-amber-400';
    return 'text-emerald-400';
  };

  const formatCountdown = (daysLeft: number, hoursLeft: number, isPast: boolean) => {
    if (isPast) return 'Past';
    if (hoursLeft <= 24) return `${hoursLeft}h`;
    return `${daysLeft}d`;
  };

  return (
    <div className="space-y-5">
      {/* Stats Header */}
      <div className="grid grid-cols-3 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="gpa-card text-center"
        >
          <div className="flex items-center justify-center gap-1 text-blue-400 mb-1">
            <Calendar size={16} />
            <span className="text-xs font-bold">Total</span>
          </div>
          <p className="text-2xl font-black">{upcomingCount}</p>
          <p className="text-[10px] text-slate-400">upcoming</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="gpa-card text-center"
        >
          <div className="flex items-center justify-center gap-1 text-amber-400 mb-1">
            <AlertTriangle size={16} />
            <span className="text-xs font-bold">This Week</span>
          </div>
          <p className="text-2xl font-black">{thisWeekCount}</p>
          <p className="text-[10px] text-slate-400">exams</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="gpa-card text-center"
        >
          <div className="flex items-center justify-center gap-1 text-emerald-400 mb-1">
            <CheckCircle size={16} />
            <span className="text-xs font-bold">Completed</span>
          </div>
          <p className="text-2xl font-black">{exams.filter(e => e.isCompleted).length}</p>
          <p className="text-[10px] text-slate-400">done</p>
        </motion.div>
      </div>

      {/* Next Exam Highlight */}
      {nextExam && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="gpa-card border-l-4 border-l-emerald-500 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-bl-full" />
          
          <div className="flex items-start justify-between relative">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Bell size={16} className="text-emerald-400" />
                <span className="text-xs text-emerald-400 font-bold uppercase">Next Up</span>
              </div>
              <h3 className="text-xl font-black mb-1">{nextExam.name}</h3>
              <p className="text-sm text-slate-400">{nextExam.courseName}</p>
              <div className="flex items-center gap-2 mt-2 text-xs text-slate-400">
                <Calendar size={12} />
                <span>
                  {new Date(nextExam.date).toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                  {nextExam.time && ` at ${nextExam.time}`}
                </span>
              </div>
            </div>
            
            <div className="text-center">
              <p className={clsx(
                "text-4xl font-black",
                getUrgencyColor(nextExam.daysLeft, nextExam.isPast)
              )}>
                {formatCountdown(nextExam.daysLeft, nextExam.hoursLeft, nextExam.isPast)}
              </p>
              <p className="text-xs text-slate-400">
                {nextExam.daysLeft === 0 ? 'Today!' : nextExam.daysLeft === 1 ? 'Tomorrow' : 'days left'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Filter & Add Button */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex bg-slate-800 rounded-xl p-1">
          {(['upcoming', 'all', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={clsx(
                "flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all capitalize",
                filter === f ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              {f}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn-primary"
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Add/Edit Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="gpa-card space-y-4">
              <h4 className="font-bold flex items-center gap-2">
                {editingId ? <Edit2 size={16} /> : <Plus size={16} />}
                {editingId ? 'Edit Exam' : 'Add New Exam'}
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newExam.name}
                  onChange={(e) => setNewExam(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Exam name..."
                  className="input-field col-span-2"
                />
                <input
                  type="text"
                  value={newExam.courseName}
                  onChange={(e) => setNewExam(prev => ({ ...prev, courseName: e.target.value }))}
                  placeholder="Course name..."
                  className="input-field col-span-2"
                />
                <input
                  type="date"
                  value={newExam.date}
                  onChange={(e) => setNewExam(prev => ({ ...prev, date: e.target.value }))}
                  className="input-field"
                />
                <input
                  type="time"
                  value={newExam.time}
                  onChange={(e) => setNewExam(prev => ({ ...prev, time: e.target.value }))}
                  className="input-field"
                />
                <input
                  type="text"
                  value={newExam.location}
                  onChange={(e) => setNewExam(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Location (optional)"
                  className="input-field"
                />
                <select
                  value={newExam.type}
                  onChange={(e) => setNewExam(prev => ({ ...prev, type: e.target.value as Exam['type'] }))}
                  className="input-field"
                >
                  {Object.entries(EXAM_TYPES).map(([key, { label }]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <textarea
                value={newExam.notes}
                onChange={(e) => setNewExam(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Study notes or topics to cover..."
                className="input-field w-full min-h-[80px] resize-none"
              />

              <div className="flex gap-2">
                <button onClick={handleSubmit} className="btn-primary flex-1">
                  {editingId ? 'Update' : 'Add'} Exam
                </button>
                <button 
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingId(null);
                    setNewExam({
                      name: '',
                      courseName: '',
                      date: '',
                      time: '',
                      location: '',
                      type: 'midterm',
                      notes: '',
                    });
                  }} 
                  className="btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Exam List */}
      <div className="space-y-3">
        {filteredExams.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="gpa-card text-center py-8"
          >
            <Sparkles className="mx-auto text-slate-600 mb-3" size={32} />
            <p className="text-slate-400">No exams to show</p>
            <p className="text-xs text-slate-500 mt-1">
              {filter === 'upcoming' 
                ? 'All clear! No upcoming exams.' 
                : 'Add your first exam to get started.'}
            </p>
          </motion.div>
        ) : (
          filteredExams.map((exam, index) => {
            const { icon: Icon, color } = EXAM_TYPES[exam.type];
            
            return (
              <motion.div
                key={exam.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={clsx(
                  "gpa-card group",
                  exam.isCompleted && 'opacity-60'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => onUpdateExam(exam.id, { isCompleted: !exam.isCompleted })}
                    className={clsx(
                      "mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                      exam.isCompleted 
                        ? 'bg-emerald-500 border-emerald-500' 
                        : 'border-slate-600 hover:border-emerald-500'
                    )}
                  >
                    {exam.isCompleted && <CheckCircle size={12} className="text-white" />}
                  </button>

                  {/* Type Icon */}
                  <div className={clsx("p-2 rounded-lg", color.split(' ')[1])}>
                    <Icon size={16} className={color.split(' ')[0]} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <h4 className={clsx(
                      "font-bold",
                      exam.isCompleted && 'line-through'
                    )}>
                      {exam.name}
                    </h4>
                    <p className="text-sm text-slate-400">{exam.courseName}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(exam.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                      {exam.time && (
                        <span className="flex items-center gap-1">
                          <Clock size={12} />
                          {exam.time}
                        </span>
                      )}
                      {exam.location && (
                        <span className="truncate">{exam.location}</span>
                      )}
                    </div>
                  </div>

                  {/* Countdown */}
                  {!exam.isCompleted && (
                    <div className="text-center">
                      <p className={clsx(
                        "text-2xl font-black",
                        getUrgencyColor(exam.daysLeft, exam.isPast)
                      )}>
                        {formatCountdown(exam.daysLeft, exam.hoursLeft, exam.isPast)}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {exam.isPast ? 'past due' : exam.daysLeft === 0 ? 'today' : 'left'}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEdit(exam)}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={() => onDeleteExam(exam.id)}
                      className="p-1.5 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Notes Preview */}
                {exam.notes && (
                  <div className="mt-3 pt-3 border-t border-slate-700/50">
                    <p className="text-xs text-slate-400 line-clamp-2">{exam.notes}</p>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
