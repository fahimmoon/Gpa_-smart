import React from 'react';
import { Course, Grade } from '../types';
import { Trash2, Edit3, ChevronDown, ChevronUp, StickyNote } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RichTextEditor } from './RichTextEditor';

interface CourseCardProps {
  course: Course;
  onDelete: (id: string) => void;
  onEdit: (course: Course) => void;
  onUpdateNotes: (id: string, notes: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onDelete, onEdit, onUpdateNotes }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden mb-3 transition-all">
      <div className="p-4 flex items-center justify-between">
        <div className="flex-1 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500 uppercase">{course.code}</span>
            <span className="font-medium">{course.name}</span>
          </div>
          <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
            <span>{course.credits} Credits</span>
            <span className={`font-bold ${course.grade === 'F' ? 'text-red-500' : 'text-emerald-500'}`}>
              Grade: {course.grade || 'N/A'}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(course)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <Edit3 size={18} className="text-slate-500" />
          </button>
          <button onClick={() => onDelete(course.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
            <Trash2 size={18} className="text-red-500" />
          </button>
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-4 border-t border-slate-100 dark:border-slate-800"
          >
            <div className="mt-3">
              <label className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1 mb-2">
                <StickyNote size={12} /> Course Notes
              </label>
              <RichTextEditor
                value={course.notes}
                onChange={(notes) => onUpdateNotes(course.id, notes)}
                placeholder="Add notes for this course..."
                className="min-h-[120px]"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
