import React, { useState, useMemo } from 'react';
import { Todo, TodoPriority, TodoCategory, Course } from '../types';
import { 
  Check, Trash2, Plus, Circle, CheckCircle2, Calendar, Flag, 
  Filter, SortAsc, Clock, AlertTriangle, Book, Users, Briefcase,
  FileText, User, MoreHorizontal, ChevronDown, X, Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';

interface EnhancedTodoListProps {
  todos: Todo[];
  courses: Course[];
  onAddTodo: (todo: Omit<Todo, 'id' | 'createdAt'>) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
  onUpdateTodo: (id: string, updates: Partial<Todo>) => void;
}

const PRIORITY_CONFIG: Record<TodoPriority, { color: string; bgColor: string; label: string; icon: typeof Flag }> = {
  urgent: { color: 'text-red-400', bgColor: 'bg-red-900/30', label: 'Urgent', icon: AlertTriangle },
  high: { color: 'text-orange-400', bgColor: 'bg-orange-900/30', label: 'High', icon: Flag },
  medium: { color: 'text-amber-400', bgColor: 'bg-amber-900/30', label: 'Medium', icon: Flag },
  low: { color: 'text-slate-400', bgColor: 'bg-slate-700', label: 'Low', icon: Flag },
};

const CATEGORY_CONFIG: Record<TodoCategory, { color: string; bgColor: string; label: string; icon: typeof Book }> = {
  assignment: { color: 'text-blue-400', bgColor: 'bg-blue-900/30', label: 'Assignment', icon: FileText },
  exam: { color: 'text-red-400', bgColor: 'bg-red-900/30', label: 'Exam', icon: AlertTriangle },
  project: { color: 'text-purple-400', bgColor: 'bg-purple-900/30', label: 'Project', icon: Briefcase },
  reading: { color: 'text-emerald-400', bgColor: 'bg-emerald-900/30', label: 'Reading', icon: Book },
  meeting: { color: 'text-cyan-400', bgColor: 'bg-cyan-900/30', label: 'Meeting', icon: Users },
  personal: { color: 'text-pink-400', bgColor: 'bg-pink-900/30', label: 'Personal', icon: User },
  other: { color: 'text-slate-400', bgColor: 'bg-slate-700', label: 'Other', icon: MoreHorizontal },
};

export const EnhancedTodoList: React.FC<EnhancedTodoListProps> = ({ 
  todos, 
  courses,
  onAddTodo, 
  onToggleTodo, 
  onDeleteTodo,
  onUpdateTodo 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTodo, setNewTodo] = useState({
    text: '',
    priority: 'medium' as TodoPriority,
    category: 'other' as TodoCategory,
    dueDate: '',
    courseId: '',
  });
  const [filterCategory, setFilterCategory] = useState<TodoCategory | 'all'>('all');
  const [filterPriority, setFilterPriority] = useState<TodoPriority | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'dueDate'>('date');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.text.trim()) {
      onAddTodo({
        text: newTodo.text.trim(),
        completed: false,
        priority: newTodo.priority,
        category: newTodo.category,
        dueDate: newTodo.dueDate || undefined,
        courseId: newTodo.courseId || undefined,
      });
      setNewTodo({ text: '', priority: 'medium', category: 'other', dueDate: '', courseId: '' });
      setShowAddForm(false);
    }
  };

  const filteredAndSortedTodos = useMemo(() => {
    let result = [...todos];
    
    // Filter by category
    if (filterCategory !== 'all') {
      result = result.filter(t => t.category === filterCategory);
    }
    
    // Filter by priority
    if (filterPriority !== 'all') {
      result = result.filter(t => t.priority === filterPriority);
    }
    
    // Filter completed
    if (!showCompleted) {
      result = result.filter(t => !t.completed);
    }
    
    // Sort
    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
    result.sort((a, b) => {
      // Always put incomplete before complete
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      
      if (sortBy === 'priority') {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
    
    return result;
  }, [todos, filterCategory, filterPriority, showCompleted, sortBy]);

  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter(t => t.completed).length;
    const overdue = todos.filter(t => !t.completed && t.dueDate && new Date(t.dueDate) < new Date()).length;
    const urgent = todos.filter(t => !t.completed && t.priority === 'urgent').length;
    return { total, completed, overdue, urgent, progress: total > 0 ? (completed / total) * 100 : 0 };
  }, [todos]);

  const getDueStatus = (dueDate?: string) => {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return { label: 'Overdue', color: 'text-red-400 bg-red-900/30' };
    if (diffDays === 0) return { label: 'Today', color: 'text-amber-400 bg-amber-900/30' };
    if (diffDays === 1) return { label: 'Tomorrow', color: 'text-yellow-400 bg-yellow-900/30' };
    if (diffDays <= 7) return { label: `${diffDays} days`, color: 'text-blue-400 bg-blue-900/30' };
    return { label: due.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: 'text-slate-400 bg-slate-700' };
  };

  return (
    <div className="gpa-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <div className="p-2 bg-emerald-900/30 rounded-xl">
            <CheckCircle2 size={18} className="text-emerald-400" />
          </div>
          Tasks & Todos
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary py-2 px-4 text-sm"
        >
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-white">{stats.total}</p>
          <p className="text-[10px] text-slate-400 uppercase">Total</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-emerald-400">{stats.completed}</p>
          <p className="text-[10px] text-slate-400 uppercase">Done</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-red-400">{stats.overdue}</p>
          <p className="text-[10px] text-slate-400 uppercase">Overdue</p>
        </div>
        <div className="bg-slate-800/50 rounded-xl p-3 text-center">
          <p className="text-2xl font-black text-amber-400">{stats.urgent}</p>
          <p className="text-[10px] text-slate-400 uppercase">Urgent</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-slate-400">Progress</span>
          <span className="text-emerald-400 font-bold">{stats.progress.toFixed(0)}%</span>
        </div>
        <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4 p-3 bg-slate-800/30 rounded-xl">
        <div className="flex items-center gap-1">
          <Filter size={14} className="text-slate-400" />
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value as TodoCategory | 'all')}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_CONFIG).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as TodoPriority | 'all')}
          className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
        >
          <option value="all">All Priorities</option>
          {Object.entries(PRIORITY_CONFIG).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <div className="flex items-center gap-1">
          <SortAsc size={14} className="text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'date' | 'priority' | 'dueDate')}
            className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="date">Created Date</option>
            <option value="priority">Priority</option>
            <option value="dueDate">Due Date</option>
          </select>
        </div>
        <label className="flex items-center gap-1 text-xs text-slate-400 cursor-pointer ml-auto">
          <input
            type="checkbox"
            checked={showCompleted}
            onChange={(e) => setShowCompleted(e.target.checked)}
            className="rounded border-slate-600"
          />
          Show completed
        </label>
      </div>

      {/* Add Form Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700"
          >
            <form onSubmit={handleAdd} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm">New Task</h4>
                <button type="button" onClick={() => setShowAddForm(false)} className="text-slate-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              
              <input
                type="text"
                value={newTodo.text}
                onChange={(e) => setNewTodo(prev => ({ ...prev, text: e.target.value }))}
                placeholder="What needs to be done?"
                className="input-field w-full"
                autoFocus
              />
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase mb-1 block">Priority</label>
                  <select
                    value={newTodo.priority}
                    onChange={(e) => setNewTodo(prev => ({ ...prev, priority: e.target.value as TodoPriority }))}
                    className="input-field w-full py-2 text-sm"
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase mb-1 block">Category</label>
                  <select
                    value={newTodo.category}
                    onChange={(e) => setNewTodo(prev => ({ ...prev, category: e.target.value as TodoCategory }))}
                    className="input-field w-full py-2 text-sm"
                  >
                    {Object.entries(CATEGORY_CONFIG).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase mb-1 block">Due Date</label>
                  <input
                    type="date"
                    value={newTodo.dueDate}
                    onChange={(e) => setNewTodo(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="input-field w-full py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase mb-1 block">Course</label>
                  <select
                    value={newTodo.courseId}
                    onChange={(e) => setNewTodo(prev => ({ ...prev, courseId: e.target.value }))}
                    className="input-field w-full py-2 text-sm"
                  >
                    <option value="">None</option>
                    {courses.map(c => (
                      <option key={c.id} value={c.id}>{c.code}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary py-2 px-4 text-sm">
                  Cancel
                </button>
                <button type="submit" disabled={!newTodo.text.trim()} className="btn-primary py-2 px-4 text-sm">
                  Add Task
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Todo List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {filteredAndSortedTodos.map((todo, index) => {
            const priorityConfig = PRIORITY_CONFIG[todo.priority];
            const categoryConfig = CATEGORY_CONFIG[todo.category];
            const dueStatus = getDueStatus(todo.dueDate);
            const course = courses.find(c => c.id === todo.courseId);
            const PriorityIcon = priorityConfig.icon;
            const CategoryIcon = categoryConfig.icon;

            return (
              <motion.div
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.02 }}
                className={clsx(
                  "group p-3 rounded-xl border transition-all",
                  todo.completed 
                    ? 'bg-slate-900/50 border-slate-800 opacity-60' 
                    : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                )}
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => onToggleTodo(todo.id)}
                    className={clsx(
                      "mt-0.5 p-1 rounded-full transition-colors flex-shrink-0",
                      todo.completed ? 'text-emerald-500' : 'text-slate-500 hover:text-emerald-500'
                    )}
                  >
                    {todo.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className={clsx(
                        "text-sm font-medium",
                        todo.completed ? 'line-through text-slate-500' : 'text-slate-200'
                      )}>
                        {todo.text}
                      </span>
                      <button
                        onClick={() => onDeleteTodo(todo.id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-all flex-shrink-0"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2 mt-2">
                      {/* Priority Badge */}
                      <span className={clsx("flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold", priorityConfig.bgColor, priorityConfig.color)}>
                        <PriorityIcon size={10} />
                        {priorityConfig.label}
                      </span>
                      
                      {/* Category Badge */}
                      <span className={clsx("flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold", categoryConfig.bgColor, categoryConfig.color)}>
                        <CategoryIcon size={10} />
                        {categoryConfig.label}
                      </span>
                      
                      {/* Due Date */}
                      {dueStatus && (
                        <span className={clsx("flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold", dueStatus.color)}>
                          <Clock size={10} />
                          {dueStatus.label}
                        </span>
                      )}
                      
                      {/* Course */}
                      {course && (
                        <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-violet-900/30 text-violet-400">
                          <Book size={10} />
                          {course.code}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredAndSortedTodos.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <CheckCircle2 size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No tasks found</p>
            <p className="text-xs mt-1">
              {todos.length > 0 ? 'Try adjusting your filters' : 'Add your first task to get started!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
