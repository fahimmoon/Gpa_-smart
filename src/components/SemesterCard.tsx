import React, { useState } from 'react';
import { Semester, Course } from '../types';
import { calculateSemesterGPA } from '../utils';
import { CourseCard } from './CourseCard';
import { Plus, CheckCircle2, Archive, ChevronDown, ChevronUp, StickyNote, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RichTextEditor } from './RichTextEditor';

interface SemesterCardProps {
  semester: Semester;
  onAddCourse: (semesterId: string) => void;
  onDeleteCourse: (semesterId: string, courseId: string) => void;
  onEditCourse: (semesterId: string, course: Course) => void;
  onUpdateCourseNotes: (semesterId: string, courseId: string, notes: string) => void;
  onUpdateSemesterNotes: (semesterId: string, notes: string) => void;
  onUpdateSemesterName: (semesterId: string, name: string) => void;
  onUpdateEndDate: (semesterId: string, date: string) => void;
  onComplete: (semesterId: string) => void;
}

export const SemesterCard: React.FC<SemesterCardProps> = ({
  semester,
  onAddCourse,
  onDeleteCourse,
  onEditCourse,
  onUpdateCourseNotes,
  onUpdateSemesterNotes,
  onUpdateSemesterName,
  onUpdateEndDate,
  onComplete
}) => {
  const [isExpanded, setIsExpanded] = React.useState(semester.isCurrent);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(semester.name);
  
  const gpa = calculateSemesterGPA(semester.courses);
  
  const gpaColor = gpa >= 3.5 ? 'text-emerald-500' : gpa >= 2.5 ? 'text-orange-500' : 'text-red-500';
  const gpaBg = gpa >= 3.5 ? 'bg-emerald-500/10' : gpa >= 2.5 ? 'bg-orange-500/10' : 'bg-red-500/10';

  const handleSaveName = () => {
    if (editedName.trim()) {
      onUpdateSemesterName(semester.id, editedName.trim());
    } else {
      setEditedName(semester.name);
    }
    setIsEditingName(false);
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`gpa-card mb-6 ${semester.isCurrent ? 'ring-2 ring-emerald-500 bg-white dark:bg-slate-900' : 'bg-slate-100/50 dark:bg-slate-900/50'}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className="input-field py-1 px-2 text-xl font-bold w-48"
                autoFocus
              />
              <button onClick={handleSaveName} className="p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded">
                <Check size={18} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 group">
              <h2 className="text-xl font-bold">{semester.name}</h2>
              <button 
                onClick={() => setIsEditingName(true)}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-emerald-500 transition-all"
              >
                <Edit2 size={14} />
              </button>
            </div>
          )}
          {semester.isCurrent && (
            <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Current
            </span>
          )}
          {semester.isCompleted && (
            <span className="bg-slate-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              Completed
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className={`px-3 py-1 rounded-lg ${gpaBg} ${gpaColor} font-bold`}>
            GPA: {gpa.toFixed(2)}
          </div>
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors">
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            {semester.isCurrent && (
              <div className="mb-6 space-y-4">
                <button
                  onClick={() => onComplete(semester.id)}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 size={20} />
                  Complete Current Semester & Start Next One
                </button>
                
                <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="flex-1">
                    <p className="text-xs font-bold text-slate-500 uppercase">Semester End Date</p>
                    <p className="text-[10px] text-slate-400">Used for 7-day reminder notifications</p>
                  </div>
                  <input 
                    type="date" 
                    value={semester.endDate || ''} 
                    onChange={(e) => onUpdateEndDate(semester.id, e.target.value)}
                    className="bg-transparent border-none outline-none text-sm font-medium"
                  />
                </div>
              </div>
            )}

            <div className="space-y-1">
              {semester.courses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onDelete={(id) => onDeleteCourse(semester.id, id)}
                  onEdit={(c) => onEditCourse(semester.id, c)}
                  onUpdateNotes={(id, notes) => onUpdateCourseNotes(semester.id, id, notes)}
                />
              ))}
            </div>

            <button
              onClick={() => onAddCourse(semester.id)}
              className="w-full mt-4 py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 hover:text-emerald-500 hover:border-emerald-500 transition-all flex items-center justify-center gap-2 font-medium"
            >
              <Plus size={20} />
              Add New Course
            </button>

            <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800">
              <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1 mb-3">
                <StickyNote size={14} /> Semester Notes
              </label>
              <RichTextEditor
                value={semester.notes}
                onChange={(notes) => onUpdateSemesterNotes(semester.id, notes)}
                placeholder="Write overall semester reflections, goals, or important dates..."
                className="min-h-[200px]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
