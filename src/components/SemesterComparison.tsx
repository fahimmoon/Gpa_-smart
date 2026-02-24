import React from 'react';
import { Semester } from '../types';
import { calculateSemesterGPA } from '../utils';
import { X, Trophy, BookOpen } from 'lucide-react';

interface Props {
  semesters: Semester[];
  onClose: () => void;
}

export const SemesterComparison: React.FC<Props> = ({ semesters, onClose }) => {
  const stats = semesters.map(s => {
    const gpa = calculateSemesterGPA(s.courses);
    const credits = s.courses.reduce((acc, c) => acc + c.credits, 0);
    return { ...s, gpa, credits };
  });

  const maxGpa = Math.max(...stats.map(s => s.gpa));
  const maxCredits = Math.max(...stats.map(s => s.credits));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between mb-6 shrink-0">
          <div>
            <h2 className="text-2xl font-bold">Semester Comparison</h2>
            <p className="text-sm text-slate-500">Comparing {semesters.length} semesters side-by-side</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-auto custom-scrollbar">
          <div className="flex gap-6 min-w-max pb-4">
            {stats.map(sem => (
              <div key={sem.id} className="w-80 shrink-0 gpa-card bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col">
                <h3 className="text-xl font-bold mb-4 text-center">{sem.name}</h3>
                
                <div className="space-y-4 mb-6">
                  <div className={`p-4 rounded-xl flex items-center justify-between ${sem.gpa === maxGpa && sem.gpa > 0 ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-white dark:bg-slate-900'}`}>
                    <span className="text-sm font-bold text-slate-500">GPA</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-xl font-black ${sem.gpa === maxGpa && sem.gpa > 0 ? 'text-emerald-500' : ''}`}>
                        {sem.gpa.toFixed(2)}
                      </span>
                      {sem.gpa === maxGpa && sem.gpa > 0 && <Trophy size={16} className="text-emerald-500" />}
                    </div>
                  </div>
                  
                  <div className={`p-4 rounded-xl flex items-center justify-between ${sem.credits === maxCredits && sem.credits > 0 ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-white dark:bg-slate-900'}`}>
                    <span className="text-sm font-bold text-slate-500">Credits</span>
                    <span className={`text-xl font-black ${sem.credits === maxCredits && sem.credits > 0 ? 'text-blue-500' : ''}`}>
                      {sem.credits}
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-2">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                    <BookOpen size={14} /> Courses ({sem.courses.length})
                  </h4>
                  {sem.courses.map(course => (
                    <div key={course.id} className="bg-white dark:bg-slate-900 p-3 rounded-lg text-sm border border-slate-100 dark:border-slate-800">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold">{course.code}</span>
                        <span className="font-bold text-emerald-500">{course.grade || '-'}</span>
                      </div>
                      <p className="text-slate-500 text-xs truncate" title={course.name}>{course.name}</p>
                      <p className="text-slate-400 text-[10px] mt-1">{course.credits} Credits</p>
                    </div>
                  ))}
                  {sem.courses.length === 0 && (
                    <p className="text-sm text-slate-500 italic text-center py-4">No courses</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
