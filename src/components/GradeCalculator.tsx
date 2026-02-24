import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, Target, TrendingUp, Plus, Trash2, 
  ChevronDown, ChevronUp, Sparkles, AlertTriangle, CheckCircle,
  GraduationCap, BookOpen, Lightbulb
} from 'lucide-react';
import clsx from 'clsx';
import { Semester } from '../types';

interface GradeCalculatorProps {
  semesters: Semester[];
  currentCGPA: number;
}

interface WhatIfCourse {
  id: string;
  name: string;
  credits: number;
  expectedGrade: string;
}

const GRADE_POINTS: Record<string, number> = {
  'A+': 4.0, 'A': 4.0, 'A-': 3.7,
  'B+': 3.3, 'B': 3.0, 'B-': 2.7,
  'C+': 2.3, 'C': 2.0, 'C-': 1.7,
  'D+': 1.3, 'D': 1.0, 'D-': 0.7,
  'F': 0.0,
};

const GRADE_COLORS: Record<string, string> = {
  'A+': 'text-emerald-400 bg-emerald-900/30',
  'A': 'text-emerald-400 bg-emerald-900/30',
  'A-': 'text-emerald-400 bg-emerald-900/30',
  'B+': 'text-blue-400 bg-blue-900/30',
  'B': 'text-blue-400 bg-blue-900/30',
  'B-': 'text-blue-400 bg-blue-900/30',
  'C+': 'text-amber-400 bg-amber-900/30',
  'C': 'text-amber-400 bg-amber-900/30',
  'C-': 'text-amber-400 bg-amber-900/30',
  'D+': 'text-orange-400 bg-orange-900/30',
  'D': 'text-orange-400 bg-orange-900/30',
  'D-': 'text-orange-400 bg-orange-900/30',
  'F': 'text-red-400 bg-red-900/30',
};

export default function GradeCalculator({ semesters, currentCGPA }: GradeCalculatorProps) {
  const [targetGPA, setTargetGPA] = useState(3.5);
  const [whatIfCourses, setWhatIfCourses] = useState<WhatIfCourse[]>([
    { id: '1', name: 'Course 1', credits: 3, expectedGrade: 'A' },
    { id: '2', name: 'Course 2', credits: 3, expectedGrade: 'B+' },
  ]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [newCourse, setNewCourse] = useState({ name: '', credits: 3, expectedGrade: 'A' });

  // Calculate total credits and points from existing semesters
  const existingStats = useMemo(() => {
    let totalCredits = 0;
    let totalPoints = 0;

    semesters.forEach(sem => {
      sem.courses.forEach(course => {
        if (course.grade) {
          const gradePoint = GRADE_POINTS[course.grade] || 0;
          totalCredits += course.credits;
          totalPoints += course.credits * gradePoint;
        }
      });
    });

    return { totalCredits, totalPoints };
  }, [semesters]);

  // Calculate projected GPA with what-if courses
  const projectedGPA = useMemo(() => {
    let newCredits = existingStats.totalCredits;
    let newPoints = existingStats.totalPoints;

    whatIfCourses.forEach(course => {
      const gradePoint = GRADE_POINTS[course.expectedGrade] || 0;
      newCredits += course.credits;
      newPoints += course.credits * gradePoint;
    });

    return newCredits > 0 ? newPoints / newCredits : 0;
  }, [existingStats, whatIfCourses]);

  // Calculate what grades needed to reach target
  const gradesNeeded = useMemo(() => {
    const totalWhatIfCredits = whatIfCourses.reduce((sum, c) => sum + c.credits, 0);
    if (totalWhatIfCredits === 0) return null;

    const pointsNeeded = targetGPA * (existingStats.totalCredits + totalWhatIfCredits) - existingStats.totalPoints;
    const avgGradePointNeeded = pointsNeeded / totalWhatIfCredits;

    // Find corresponding grade
    let requiredGrade = 'F';
    for (const [grade, points] of Object.entries(GRADE_POINTS)) {
      if (avgGradePointNeeded <= points) {
        requiredGrade = grade;
      }
    }

    return {
      avgPointsNeeded: avgGradePointNeeded,
      requiredGrade,
      isAchievable: avgGradePointNeeded <= 4.0,
      isPassing: avgGradePointNeeded <= 2.0,
    };
  }, [existingStats, whatIfCourses, targetGPA]);

  // Calculate semester GPA for what-if courses only
  const whatIfSemesterGPA = useMemo(() => {
    let credits = 0;
    let points = 0;

    whatIfCourses.forEach(course => {
      const gradePoint = GRADE_POINTS[course.expectedGrade] || 0;
      credits += course.credits;
      points += course.credits * gradePoint;
    });

    return credits > 0 ? points / credits : 0;
  }, [whatIfCourses]);

  const addCourse = () => {
    if (newCourse.name.trim()) {
      setWhatIfCourses([
        ...whatIfCourses,
        {
          id: Date.now().toString(),
          name: newCourse.name,
          credits: newCourse.credits,
          expectedGrade: newCourse.expectedGrade,
        },
      ]);
      setNewCourse({ name: '', credits: 3, expectedGrade: 'A' });
    }
  };

  const removeCourse = (id: string) => {
    setWhatIfCourses(whatIfCourses.filter(c => c.id !== id));
  };

  const updateCourse = (id: string, field: keyof WhatIfCourse, value: string | number) => {
    setWhatIfCourses(whatIfCourses.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    ));
  };

  const gpaChange = projectedGPA - currentCGPA;

  return (
    <div className="space-y-5">
      {/* Current Status */}
      <div className="grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="gpa-card text-center"
        >
          <p className="text-xs text-slate-400 mb-1">Current CGPA</p>
          <p className="text-3xl font-black text-white">{currentCGPA.toFixed(2)}</p>
          <p className="text-xs text-slate-500">{existingStats.totalCredits} credits</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="gpa-card text-center"
        >
          <p className="text-xs text-slate-400 mb-1">Projected CGPA</p>
          <p className={clsx(
            "text-3xl font-black",
            projectedGPA >= targetGPA ? 'text-emerald-400' : 
            projectedGPA >= currentCGPA ? 'text-blue-400' : 'text-amber-400'
          )}>
            {projectedGPA.toFixed(2)}
          </p>
          <div className={clsx(
            "flex items-center justify-center gap-1 text-xs",
            gpaChange >= 0 ? 'text-emerald-400' : 'text-red-400'
          )}>
            {gpaChange >= 0 ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
            {gpaChange >= 0 ? '+' : ''}{gpaChange.toFixed(2)}
          </div>
        </motion.div>
      </div>

      {/* Target GPA Setting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="gpa-card"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-violet-400" />
            <span className="font-bold">Target GPA</span>
          </div>
          <span className="text-2xl font-black text-violet-400">{targetGPA.toFixed(1)}</span>
        </div>
        <input
          type="range"
          min="2.0"
          max="4.0"
          step="0.1"
          value={targetGPA}
          onChange={(e) => setTargetGPA(parseFloat(e.target.value))}
          className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-500"
        />
        <div className="flex justify-between text-xs text-slate-400 mt-1">
          <span>2.0</span>
          <span>3.0</span>
          <span>4.0</span>
        </div>
      </motion.div>

      {/* What-If Courses */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="gpa-card"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calculator size={18} className="text-cyan-400" />
            <span className="font-bold">What-If Analysis</span>
          </div>
          <span className="text-sm text-slate-400">
            Semester GPA: <span className="font-bold text-white">{whatIfSemesterGPA.toFixed(2)}</span>
          </span>
        </div>

        <div className="space-y-3">
          {whatIfCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-xl"
            >
              <input
                type="text"
                value={course.name}
                onChange={(e) => updateCourse(course.id, 'name', e.target.value)}
                placeholder="Course name..."
                className="flex-1 bg-transparent border-none outline-none text-sm"
              />
              
              <select
                value={course.credits}
                onChange={(e) => updateCourse(course.id, 'credits', parseInt(e.target.value))}
                className="bg-slate-700 rounded-lg px-2 py-1 text-sm"
              >
                {[1, 2, 3, 4, 5].map(c => (
                  <option key={c} value={c}>{c} cr</option>
                ))}
              </select>

              <select
                value={course.expectedGrade}
                onChange={(e) => updateCourse(course.id, 'expectedGrade', e.target.value)}
                className={clsx(
                  "rounded-lg px-2 py-1 text-sm font-bold",
                  GRADE_COLORS[course.expectedGrade]
                )}
              >
                {Object.keys(GRADE_POINTS).map(grade => (
                  <option key={grade} value={grade}>{grade}</option>
                ))}
              </select>

              <button
                onClick={() => removeCourse(course.id)}
                className="p-1.5 rounded-lg bg-red-900/30 text-red-400 hover:bg-red-900/50"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}

          {/* Add Course Form */}
          <div className="flex items-center gap-2 p-3 border-2 border-dashed border-slate-700 rounded-xl">
            <input
              type="text"
              value={newCourse.name}
              onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Add a course..."
              className="flex-1 bg-transparent border-none outline-none text-sm"
              onKeyDown={(e) => e.key === 'Enter' && addCourse()}
            />
            
            <select
              value={newCourse.credits}
              onChange={(e) => setNewCourse(prev => ({ ...prev, credits: parseInt(e.target.value) }))}
              className="bg-slate-700 rounded-lg px-2 py-1 text-sm"
            >
              {[1, 2, 3, 4, 5].map(c => (
                <option key={c} value={c}>{c} cr</option>
              ))}
            </select>

            <select
              value={newCourse.expectedGrade}
              onChange={(e) => setNewCourse(prev => ({ ...prev, expectedGrade: e.target.value }))}
              className="bg-slate-700 rounded-lg px-2 py-1 text-sm"
            >
              {Object.keys(GRADE_POINTS).map(grade => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>

            <button
              onClick={addCourse}
              disabled={!newCourse.name.trim()}
              className="p-1.5 rounded-lg bg-emerald-900/30 text-emerald-400 hover:bg-emerald-900/50 disabled:opacity-50"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Grades Needed Card */}
      {gradesNeeded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={clsx(
            "gpa-card border-l-4",
            gradesNeeded.isAchievable 
              ? gradesNeeded.isPassing 
                ? 'border-l-emerald-500' 
                : 'border-l-amber-500'
              : 'border-l-red-500'
          )}
        >
          <div className="flex items-start gap-3">
            {gradesNeeded.isAchievable ? (
              gradesNeeded.isPassing ? (
                <CheckCircle className="text-emerald-400 mt-0.5" size={20} />
              ) : (
                <Lightbulb className="text-amber-400 mt-0.5" size={20} />
              )
            ) : (
              <AlertTriangle className="text-red-400 mt-0.5" size={20} />
            )}
            <div>
              <h4 className="font-bold mb-1">
                {gradesNeeded.isAchievable 
                  ? `You need an average of ${gradesNeeded.requiredGrade}` 
                  : 'Target not achievable'}
              </h4>
              <p className="text-sm text-slate-400">
                {gradesNeeded.isAchievable 
                  ? `To reach ${targetGPA.toFixed(1)} CGPA, you need an average grade point of ${gradesNeeded.avgPointsNeeded.toFixed(2)} across your planned courses.`
                  : `Even with all A+ grades, you won't be able to reach ${targetGPA.toFixed(1)} CGPA with your current credits. Consider more courses or adjust your target.`
                }
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Scenarios */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="gpa-card"
      >
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={18} className="text-amber-400" />
          <span className="font-bold">Quick Scenarios</span>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'All A', grade: 'A' },
            { label: 'All B+', grade: 'B+' },
            { label: 'All B', grade: 'B' },
          ].map(scenario => {
            // Calculate GPA for this scenario
            let credits = existingStats.totalCredits;
            let points = existingStats.totalPoints;
            const gradePoint = GRADE_POINTS[scenario.grade];
            
            whatIfCourses.forEach(course => {
              credits += course.credits;
              points += course.credits * gradePoint;
            });
            
            const scenarioGPA = credits > 0 ? points / credits : 0;
            
            return (
              <button
                key={scenario.label}
                onClick={() => {
                  setWhatIfCourses(whatIfCourses.map(c => ({
                    ...c,
                    expectedGrade: scenario.grade
                  })));
                }}
                className="p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl text-center transition-colors"
              >
                <p className="text-xs text-slate-400">{scenario.label}</p>
                <p className={clsx(
                  "text-lg font-black",
                  scenarioGPA >= targetGPA ? 'text-emerald-400' : 'text-white'
                )}>
                  {scenarioGPA.toFixed(2)}
                </p>
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* GPA Scale Reference */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="w-full gpa-card flex items-center justify-between"
        >
          <div className="flex items-center gap-2">
            <GraduationCap size={18} className="text-slate-400" />
            <span className="font-bold">GPA Scale Reference</span>
          </div>
          {showAdvanced ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="gpa-card mt-2">
                <div className="grid grid-cols-4 gap-2">
                  {Object.entries(GRADE_POINTS).map(([grade, points]) => (
                    <div
                      key={grade}
                      className={clsx(
                        "p-2 rounded-lg text-center",
                        GRADE_COLORS[grade]
                      )}
                    >
                      <p className="font-bold">{grade}</p>
                      <p className="text-xs opacity-80">{points.toFixed(1)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
