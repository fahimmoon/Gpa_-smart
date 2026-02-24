import React, { useState } from 'react';
import { CustomNote } from '../types';
import { Plus, Trash2, FileText, ChevronDown, ChevronUp, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RichTextEditor } from './RichTextEditor';

interface CustomNotesManagerProps {
  notes: CustomNote[];
  onAddNote: () => void;
  onUpdateNote: (id: string, title: string, content: string) => void;
  onDeleteNote: (id: string) => void;
}

export const CustomNotesManager: React.FC<CustomNotesManagerProps> = ({ notes, onAddNote, onUpdateNote, onDeleteNote }) => {
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');

  const handleSaveTitle = (note: CustomNote) => {
    if (editedTitle.trim()) {
      onUpdateNote(note.id, editedTitle.trim(), note.content);
    }
    setEditingTitleId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <FileText size={20} className="text-purple-500" />
          Custom Notes
        </h3>
        <button
          onClick={onAddNote}
          className="btn-primary py-2 px-4 text-sm flex items-center gap-2 bg-purple-600 hover:bg-purple-700 shadow-purple-500/20"
        >
          <Plus size={16} /> New Note
        </button>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {notes.map((note) => (
            <motion.div
              key={note.id}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="gpa-card bg-white dark:bg-slate-900 border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 flex-1">
                  {editingTitleId === note.id ? (
                    <div className="flex items-center gap-2 flex-1">
                      <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle(note)}
                        className="input-field py-1 px-2 text-lg font-bold flex-1 border-purple-200 focus:border-purple-500 focus:ring-purple-500/20"
                        autoFocus
                      />
                      <button onClick={() => handleSaveTitle(note)} className="p-1 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded">
                        <Check size={18} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group flex-1 cursor-pointer" onClick={() => setExpandedNoteId(expandedNoteId === note.id ? null : note.id)}>
                      <h4 className="text-lg font-bold text-slate-800 dark:text-slate-100">{note.title}</h4>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditedTitle(note.title);
                          setEditingTitleId(note.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-purple-500 transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded hidden sm:inline-block">
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => onDeleteNote(note.id)}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  <button 
                    onClick={() => setExpandedNoteId(expandedNoteId === note.id ? null : note.id)} 
                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
                  >
                    {expandedNoteId === note.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {expandedNoteId === note.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800"
                  >
                    <RichTextEditor
                      value={note.content}
                      onChange={(newContent) => onUpdateNote(note.id, note.title, newContent)}
                      placeholder="Write your note here..."
                      className="min-h-[200px] border-purple-100 dark:border-purple-900/30 focus-within:border-purple-500 focus-within:ring-1 focus-within:ring-purple-500/20 transition-all"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {notes.length === 0 && (
          <div className="text-center py-12 text-slate-500 text-sm border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
            <FileText size={32} className="mx-auto mb-3 text-slate-300 dark:text-slate-700" />
            <p>No custom notes yet.</p>
            <p className="mt-1">Create one to get started!</p>
          </div>
        )}
      </div>
    </div>
  );
};
