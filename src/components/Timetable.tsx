import React from 'react';
import { TimetableEntry, Course } from '../types';
import { Clock, MapPin, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TimetableProps {
  entries: TimetableEntry[];
  courses: Course[];
  onAddEntry: () => void;
  onDeleteEntry: (id: string) => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;

export const Timetable: React.FC<TimetableProps> = ({ entries, courses, onAddEntry, onDeleteEntry }) => {
  const getCourseName = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.name || 'Unknown Course';
  };

  const getCourseCode = (courseId: string) => {
    return courses.find(c => c.id === courseId)?.code || '???';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Clock size={20} className="text-emerald-500" />
          Weekly Schedule
        </h3>
        <button
          onClick={onAddEntry}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
        >
          <Plus size={16} /> Add Class
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {DAYS.map(day => {
          const dayEntries = entries
            .filter(e => e.day === day)
            .sort((a, b) => a.startTime.localeCompare(b.startTime));

          return (
            <div key={day} className="flex flex-col gap-3">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest text-center mb-1">
                {day.substring(0, 3)}
              </h4>
              <div className="flex flex-col gap-3 min-h-[100px] p-2 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                <AnimatePresence mode="popLayout">
                  {dayEntries.map(entry => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="group relative bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all"
                    >
                      <button
                        onClick={() => onDeleteEntry(entry.id)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <Trash2 size={10} />
                      </button>
                      <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold mb-1">
                        {entry.startTime} - {entry.endTime}
                      </div>
                      <div className="text-xs font-bold leading-tight mb-1">
                        {getCourseCode(entry.courseId)}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {getCourseName(entry.courseId)}
                      </div>
                      {entry.location && (
                        <div className="flex items-center gap-1 mt-2 text-[9px] text-slate-400">
                          <MapPin size={8} /> {entry.location}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {dayEntries.length === 0 && (
                  <div className="flex-1 flex items-center justify-center text-[10px] text-slate-400 italic text-center px-2">
                    No classes
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
