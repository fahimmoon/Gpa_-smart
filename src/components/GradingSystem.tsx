import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp,
  BookOpen, User, Award, Calculator, FileText, Percent, Target, TrendingUp
} from 'lucide-react';
import clsx from 'clsx';
import { CourseGrading, MarksHead, MarksHeadType, Grade, GRADE_SCALE, Course, Semester } from '../types';

interface GradingSystemProps {
  gradings: CourseGrading[];
  semesters: Semester[];
  onAddGrading: (grading: CourseGrading) => void;
  onUpdateGrading: (grading: CourseGrading) => void;
  onDeleteGrading: (id: string) => void;
}

const MARKS_HEAD_TYPES: { value: MarksHeadType; label: string; icon: string }[] = [
  { value: 'assignment', label: 'Assignment', icon: '📝' },
  { value: 'quiz', label: 'Quiz', icon: '❓' },
  { value: 'midterm', label: 'Mid Term', icon: '📋' },
  { value: 'final', label: 'Final Paper', icon: '📄' },
  { value: 'project', label: 'Project', icon: '🎯' },
  { value: 'test', label: 'Test', icon: '✏️' },
  { value: 'presentation', label: 'Presentation', icon: '📊' },
  { value: 'lab', label: 'Lab Work', icon: '🔬' },
  { value: 'participation', label: 'Class Participation', icon: '🙋' },
  { value: 'other', label: 'Other', icon: '📌' },
];

const calculateGrade = (percentage: number): Grade | '' => {
  if (percentage >= 90) return 'A+';
  if (percentage >= 86) return 'A';
  if (percentage >= 82) return 'A-';
  if (percentage >= 78) return 'B+';
  if (percentage >= 74) return 'B';
  if (percentage >= 70) return 'B-';
  if (percentage >= 66) return 'C+';
  if (percentage >= 62) return 'C';
  if (percentage >= 58) return 'C-';
  if (percentage >= 54) return 'D+';
  if (percentage >= 50) return 'D';
  if (percentage >= 46) return 'D-';
  return 'F';
};

const getGradeColor = (grade: Grade | ''): string => {
  if (!grade) return 'text-slate-400';
  const gradePoint = GRADE_SCALE[grade];
  if (gradePoint >= 3.5) return 'text-emerald-400';
  if (gradePoint >= 3.0) return 'text-green-400';
  if (gradePoint >= 2.5) return 'text-lime-400';
  if (gradePoint >= 2.0) return 'text-yellow-400';
  if (gradePoint >= 1.0) return 'text-orange-400';
  return 'text-red-400';
};

const getPercentageColor = (percentage: number): string => {
  if (percentage >= 80) return 'from-emerald-500 to-teal-500';
  if (percentage >= 60) return 'from-green-500 to-lime-500';
  if (percentage >= 40) return 'from-yellow-500 to-amber-500';
  if (percentage >= 20) return 'from-orange-500 to-red-500';
  return 'from-red-500 to-rose-500';
};

export default function GradingSystem({ 
  gradings, 
  semesters,
  onAddGrading, 
  onUpdateGrading, 
  onDeleteGrading 
}: GradingSystemProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<CourseGrading>>({
    courseName: '',
    courseCode: '',
    instructor: '',
    program: 'BSCS',
    section: 'A',
    marksHeads: [],
    semesterId: ''
  });
  
  const [newMarksHead, setNewMarksHead] = useState<Partial<MarksHead>>({
    name: '',
    type: 'assignment',
    maxMarks: 0,
    marksObtained: null
  });

  // Get current semester
  const currentSemester = semesters.find(s => s.isCurrent);
  const currentSemesterGradings = gradings.filter(g => g.semesterId === currentSemester?.id);

  const resetForm = () => {
    setFormData({
      courseName: '',
      courseCode: '',
      instructor: '',
      program: 'BSCS',
      section: 'A',
      marksHeads: [],
      semesterId: currentSemester?.id || ''
    });
    setNewMarksHead({
      name: '',
      type: 'assignment',
      maxMarks: 0,
      marksObtained: null
    });
  };

  const addMarksHead = () => {
    if (!newMarksHead.name || !newMarksHead.maxMarks) return;
    
    const head: MarksHead = {
      id: `mh_${Date.now()}`,
      name: newMarksHead.name || '',
      type: newMarksHead.type || 'other',
      maxMarks: newMarksHead.maxMarks || 0,
      marksObtained: newMarksHead.marksObtained ?? null
    };
    
    setFormData(prev => ({
      ...prev,
      marksHeads: [...(prev.marksHeads || []), head]
    }));
    
    setNewMarksHead({
      name: '',
      type: 'assignment',
      maxMarks: 0,
      marksObtained: null
    });
  };

  const removeMarksHead = (headId: string) => {
    setFormData(prev => ({
      ...prev,
      marksHeads: (prev.marksHeads || []).filter(h => h.id !== headId)
    }));
  };

  const updateMarksHead = (headId: string, field: keyof MarksHead, value: any) => {
    setFormData(prev => ({
      ...prev,
      marksHeads: (prev.marksHeads || []).map(h => 
        h.id === headId ? { ...h, [field]: value } : h
      )
    }));
  };

  const calculateTotals = (heads: MarksHead[]) => {
    const totalMaxMarks = heads.reduce((sum, h) => sum + h.maxMarks, 0);
    const totalObtained = heads.reduce((sum, h) => sum + (h.marksObtained ?? 0), 0);
    const percentage = totalMaxMarks > 0 ? (totalObtained / totalMaxMarks) * 100 : 0;
    const grade = calculateGrade(percentage);
    return { totalMaxMarks, totalObtained, percentage, grade };
  };

  const handleSave = () => {
    if (!formData.courseName || !formData.courseCode) return;
    
    const { totalMaxMarks, totalObtained, percentage, grade } = calculateTotals(formData.marksHeads || []);
    
    const grading: CourseGrading = {
      id: editingId || `grading_${Date.now()}`,
      courseId: formData.courseId || `course_${Date.now()}`,
      semesterId: formData.semesterId || currentSemester?.id || '',
      courseName: formData.courseName || '',
      courseCode: formData.courseCode || '',
      instructor: formData.instructor || '',
      program: formData.program || 'BSCS',
      section: formData.section || 'A',
      marksHeads: formData.marksHeads || [],
      totalMaxMarks,
      totalObtained,
      percentage,
      grade
    };

    if (editingId) {
      onUpdateGrading(grading);
      setEditingId(null);
    } else {
      onAddGrading(grading);
    }
    
    setIsAddingNew(false);
    resetForm();
  };

  const startEdit = (grading: CourseGrading) => {
    setFormData(grading);
    setEditingId(grading.id);
    setIsAddingNew(true);
  };

  const handleUpdateMarks = (gradingId: string, headId: string, marks: number | null) => {
    const grading = gradings.find(g => g.id === gradingId);
    if (!grading) return;

    const updatedHeads = grading.marksHeads.map(h => 
      h.id === headId ? { ...h, marksObtained: marks } : h
    );
    
    const { totalMaxMarks, totalObtained, percentage, grade } = calculateTotals(updatedHeads);
    
    onUpdateGrading({
      ...grading,
      marksHeads: updatedHeads,
      totalMaxMarks,
      totalObtained,
      percentage,
      grade
    });
  };

  // Calculate overall stats
  const overallStats = {
    totalCourses: currentSemesterGradings.length,
    avgPercentage: currentSemesterGradings.length > 0 
      ? currentSemesterGradings.reduce((sum, g) => sum + g.percentage, 0) / currentSemesterGradings.length 
      : 0,
    coursesWithGrades: currentSemesterGradings.filter(g => g.grade).length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <div className="p-2 bg-violet-900/30 rounded-xl">
              <GraduationCap size={24} className="text-violet-400" />
            </div>
            Grading System
          </h2>
          {currentSemester && (
            <p className="text-slate-400 text-sm mt-1">
              {currentSemester.name} • {currentSemesterGradings.length} Courses
            </p>
          )}
        </div>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => {
            setIsAddingNew(true);
            resetForm();
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          Add Course
        </motion.button>
      </motion.div>

      {/* Stats Overview */}
      {currentSemesterGradings.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          <div className="gpa-card border-l-4 border-l-violet-500">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-900/30 rounded-xl">
                <BookOpen size={20} className="text-violet-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Total Courses</p>
                <p className="text-2xl font-bold">{overallStats.totalCourses}</p>
              </div>
            </div>
          </div>
          
          <div className="gpa-card border-l-4 border-l-emerald-500">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-900/30 rounded-xl">
                <Percent size={20} className="text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Average Percentage</p>
                <p className="text-2xl font-bold">{overallStats.avgPercentage.toFixed(1)}%</p>
              </div>
            </div>
          </div>
          
          <div className="gpa-card border-l-4 border-l-amber-500">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-900/30 rounded-xl">
                <Award size={20} className="text-amber-400" />
              </div>
              <div>
                <p className="text-xs text-slate-400">Expected GPA</p>
                <p className="text-2xl font-bold">
                  {currentSemesterGradings.length > 0 
                    ? (currentSemesterGradings.reduce((sum, g) => sum + (GRADE_SCALE[g.grade as Grade] || 0), 0) / currentSemesterGradings.length).toFixed(2)
                    : '-'}
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Add/Edit Form Modal */}
      <AnimatePresence>
        {isAddingNew && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setIsAddingNew(false);
              setEditingId(null);
              resetForm();
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-700">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <GraduationCap size={24} className="text-violet-400" />
                  {editingId ? 'Edit Course Grading' : 'Add New Course'}
                </h3>
              </div>

              <div className="p-6 space-y-4">
                {/* Course Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Program</label>
                    <input
                      type="text"
                      value={formData.program || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, program: e.target.value }))}
                      className="input-field"
                      placeholder="BSCS-6"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Section</label>
                    <input
                      type="text"
                      value={formData.section || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, section: e.target.value }))}
                      className="input-field"
                      placeholder="A"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Course Name *</label>
                  <input
                    type="text"
                    value={formData.courseName || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, courseName: e.target.value }))}
                    className="input-field"
                    placeholder="Artificial Intelligence"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Course Code *</label>
                    <input
                      type="text"
                      value={formData.courseCode || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, courseCode: e.target.value }))}
                      className="input-field"
                      placeholder="CS-401"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Instructor</label>
                    <input
                      type="text"
                      value={formData.instructor || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                      className="input-field"
                      placeholder="Muhammad Ahsan Nisar"
                    />
                  </div>
                </div>

                {/* Marks Heads */}
                <div className="border-t border-slate-700 pt-4">
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText size={18} className="text-slate-400" />
                    Assessment Components
                  </h4>
                  
                  {/* Existing Heads */}
                  {(formData.marksHeads || []).length > 0 && (
                    <div className="space-y-2 mb-4">
                      {formData.marksHeads?.map((head) => (
                        <div key={head.id} className="flex items-center gap-2 bg-slate-800/50 p-3 rounded-lg">
                          <span className="text-lg">
                            {MARKS_HEAD_TYPES.find(t => t.value === head.type)?.icon || '📌'}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-sm">{head.name}</p>
                            <p className="text-xs text-slate-400">Max: {head.maxMarks}</p>
                          </div>
                          <input
                            type="number"
                            value={head.marksObtained ?? ''}
                            onChange={(e) => updateMarksHead(head.id, 'marksObtained', e.target.value ? Number(e.target.value) : null)}
                            className="input-field w-24 text-center"
                            placeholder="Marks"
                            min="0"
                            max={head.maxMarks}
                          />
                          <button
                            onClick={() => removeMarksHead(head.id)}
                            className="p-2 text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Add New Head */}
                  <div className="grid grid-cols-12 gap-2 bg-slate-800/30 p-3 rounded-lg">
                    <select
                      value={newMarksHead.type}
                      onChange={(e) => setNewMarksHead(prev => ({ ...prev, type: e.target.value as MarksHeadType }))}
                      className="input-field col-span-3 text-sm"
                    >
                      {MARKS_HEAD_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      value={newMarksHead.name || ''}
                      onChange={(e) => setNewMarksHead(prev => ({ ...prev, name: e.target.value }))}
                      className="input-field col-span-4"
                      placeholder="Name (e.g., Assignment 1)"
                    />
                    <input
                      type="number"
                      value={newMarksHead.maxMarks || ''}
                      onChange={(e) => setNewMarksHead(prev => ({ ...prev, maxMarks: Number(e.target.value) }))}
                      className="input-field col-span-2 text-center"
                      placeholder="Max"
                      min="0"
                    />
                    <input
                      type="number"
                      value={newMarksHead.marksObtained ?? ''}
                      onChange={(e) => setNewMarksHead(prev => ({ ...prev, marksObtained: e.target.value ? Number(e.target.value) : null }))}
                      className="input-field col-span-2 text-center"
                      placeholder="Got"
                      min="0"
                    />
                    <button
                      onClick={addMarksHead}
                      disabled={!newMarksHead.name || !newMarksHead.maxMarks}
                      className="btn-secondary col-span-1 flex items-center justify-center"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Preview Totals */}
                {(formData.marksHeads || []).length > 0 && (
                  <div className="bg-gradient-to-r from-violet-900/30 to-purple-900/30 p-4 rounded-xl border border-violet-700/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-400">Total</p>
                        <p className="text-lg font-bold">
                          {calculateTotals(formData.marksHeads || []).totalObtained} / {calculateTotals(formData.marksHeads || []).totalMaxMarks}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-slate-400">Percentage</p>
                        <p className="text-lg font-bold">{calculateTotals(formData.marksHeads || []).percentage.toFixed(1)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Grade</p>
                        <p className={clsx('text-2xl font-bold', getGradeColor(calculateTotals(formData.marksHeads || []).grade))}>
                          {calculateTotals(formData.marksHeads || []).grade || '-'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-slate-700 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setIsAddingNew(false);
                    setEditingId(null);
                    resetForm();
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.courseName || !formData.courseCode}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save size={18} />
                  {editingId ? 'Update' : 'Save'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Course Cards */}
      <div className="space-y-4">
        {currentSemesterGradings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <GraduationCap size={48} className="mx-auto mb-4 text-slate-600" />
            <p className="text-slate-400 mb-4">No courses added yet</p>
            <button
              onClick={() => {
                setIsAddingNew(true);
                resetForm();
              }}
              className="btn-primary"
            >
              Add Your First Course
            </button>
          </motion.div>
        ) : (
          currentSemesterGradings.map((grading, index) => (
            <motion.div
              key={grading.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="gpa-card overflow-hidden"
            >
              {/* Course Header */}
              <div 
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === grading.id ? null : grading.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-400">
                      {grading.program} • Section {grading.section}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg">{grading.courseName}</h3>
                  <p className="text-slate-400 text-sm flex items-center gap-2 mt-1">
                    <User size={14} />
                    {grading.instructor || 'No instructor assigned'}
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  {/* Progress Ring */}
                  <div className="relative w-16 h-16">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="4"
                        className="text-slate-700"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        fill="none"
                        stroke="url(#gradient)"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeDasharray={`${grading.percentage * 1.76} 176`}
                        className="transition-all duration-500"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#a855f7" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className={clsx('text-sm font-bold', getGradeColor(grading.grade))}>
                        {grading.grade || '-'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-2xl font-bold">{grading.percentage.toFixed(0)}%</p>
                    <p className="text-xs text-slate-400">
                      {grading.totalObtained}/{grading.totalMaxMarks}
                    </p>
                  </div>
                  
                  <button className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                    {expandedId === grading.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {expandedId === grading.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-slate-700 mt-4 pt-4">
                      {/* Marks Breakdown */}
                      <div className="space-y-2">
                        <div className="grid grid-cols-12 gap-2 text-xs text-slate-400 font-medium px-3 mb-2">
                          <div className="col-span-5">Marks Head</div>
                          <div className="col-span-2 text-center">Max</div>
                          <div className="col-span-3 text-center">Obtained</div>
                          <div className="col-span-2 text-center">%</div>
                        </div>
                        
                        {grading.marksHeads.map((head) => (
                          <div 
                            key={head.id} 
                            className="grid grid-cols-12 gap-2 items-center bg-slate-800/30 p-3 rounded-lg"
                          >
                            <div className="col-span-5 flex items-center gap-2">
                              <span>{MARKS_HEAD_TYPES.find(t => t.value === head.type)?.icon}</span>
                              <span className="font-medium text-sm">{head.name}</span>
                            </div>
                            <div className="col-span-2 text-center text-slate-400">{head.maxMarks}</div>
                            <div className="col-span-3">
                              <input
                                type="number"
                                value={head.marksObtained ?? ''}
                                onChange={(e) => handleUpdateMarks(
                                  grading.id, 
                                  head.id, 
                                  e.target.value ? Number(e.target.value) : null
                                )}
                                className="input-field w-full text-center text-sm"
                                placeholder="Not Entered"
                                min="0"
                                max={head.maxMarks}
                              />
                            </div>
                            <div className="col-span-2 text-center">
                              {head.marksObtained !== null ? (
                                <span className={clsx(
                                  'font-medium',
                                  (head.marksObtained / head.maxMarks) >= 0.5 ? 'text-emerald-400' : 'text-red-400'
                                )}>
                                  {((head.marksObtained / head.maxMarks) * 100).toFixed(0)}%
                                </span>
                              ) : (
                                <span className="text-slate-500">-</span>
                              )}
                            </div>
                          </div>
                        ))}
                        
                        {/* Total Row */}
                        <div className="grid grid-cols-12 gap-2 items-center bg-gradient-to-r from-violet-900/30 to-purple-900/30 p-3 rounded-lg border border-violet-700/30 mt-4">
                          <div className="col-span-5 font-bold">Total Marks</div>
                          <div className="col-span-2 text-center font-bold">{grading.totalMaxMarks}</div>
                          <div className="col-span-3 text-center font-bold text-lg">{grading.totalObtained}</div>
                          <div className="col-span-2 text-center">
                            <span className={clsx('font-bold text-lg', getGradeColor(grading.grade))}>
                              {grading.percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={() => startEdit(grading)}
                          className="btn-secondary flex items-center gap-2 text-sm"
                        >
                          <Edit3 size={16} />
                          Edit
                        </button>
                        <button
                          onClick={() => onDeleteGrading(grading.id)}
                          className="px-3 py-2 bg-red-900/30 text-red-400 rounded-lg hover:bg-red-900/50 transition-colors flex items-center gap-2 text-sm"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
