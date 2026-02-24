import React, { useState } from 'react';
import { Todo } from '../types';
import { Check, Trash2, Plus, Circle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TodoListProps {
  todos: Todo[];
  onAddTodo: (text: string) => void;
  onToggleTodo: (id: string) => void;
  onDeleteTodo: (id: string) => void;
}

export const TodoList: React.FC<TodoListProps> = ({ todos, onAddTodo, onToggleTodo, onDeleteTodo }) => {
  const [newTodo, setNewTodo] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTodo.trim()) {
      onAddTodo(newTodo.trim());
      setNewTodo('');
    }
  };

  const sortedTodos = [...todos].sort((a, b) => {
    if (a.completed === b.completed) {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    return a.completed ? 1 : -1;
  });

  return (
    <div className="gpa-card bg-white dark:bg-slate-900">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <CheckCircle2 size={20} className="text-emerald-500" />
        Tasks & Todos
      </h3>
      
      <form onSubmit={handleAdd} className="flex items-center gap-2 mb-6">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a new task..."
          className="input-field flex-1"
        />
        <button
          type="submit"
          disabled={!newTodo.trim()}
          className="p-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
        </button>
      </form>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {sortedTodos.map((todo) => (
            <motion.div
              key={todo.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${
                todo.completed 
                  ? 'bg-slate-50 border-slate-100 dark:bg-slate-950 dark:border-slate-800 opacity-60' 
                  : 'bg-white border-slate-200 dark:bg-slate-900 dark:border-slate-700'
              }`}
            >
              <button
                onClick={() => onToggleTodo(todo.id)}
                className={`p-1 rounded-full transition-colors ${
                  todo.completed ? 'text-emerald-500' : 'text-slate-400 hover:text-emerald-500'
                }`}
              >
                {todo.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
              </button>
              
              <span className={`flex-1 text-sm ${todo.completed ? 'line-through text-slate-500' : 'text-slate-700 dark:text-slate-300'}`}>
                {todo.text}
              </span>

              <button
                onClick={() => onDeleteTodo(todo.id)}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {todos.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            No tasks yet. Add one above!
          </div>
        )}
      </div>
    </div>
  );
};
