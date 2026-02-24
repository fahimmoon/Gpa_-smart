import React, { useState, useMemo } from 'react';
import { CustomNote, NoteCategory } from '../types';
import { 
  Plus, Trash2, FileText, ChevronDown, ChevronUp, Edit2, Check, 
  Search, Pin, PinOff, BookOpen, Lightbulb, AlertCircle, User, 
  MoreHorizontal, Tag, Palette, Filter, SortAsc, Grid, List, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { RichTextEditor } from './RichTextEditor';
import clsx from 'clsx';

interface EnhancedNotesManagerProps {
  notes: CustomNote[];
  onAddNote: (note: Omit<CustomNote, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdateNote: (id: string, updates: Partial<CustomNote>) => void;
  onDeleteNote: (id: string) => void;
}

const CATEGORY_CONFIG: Record<NoteCategory, { icon: typeof FileText; color: string; bgColor: string; label: string }> = {
  lecture: { icon: BookOpen, color: 'text-blue-400', bgColor: 'bg-blue-900/30', label: 'Lecture' },
  study: { icon: FileText, color: 'text-emerald-400', bgColor: 'bg-emerald-900/30', label: 'Study' },
  ideas: { icon: Lightbulb, color: 'text-amber-400', bgColor: 'bg-amber-900/30', label: 'Ideas' },
  important: { icon: AlertCircle, color: 'text-red-400', bgColor: 'bg-red-900/30', label: 'Important' },
  personal: { icon: User, color: 'text-pink-400', bgColor: 'bg-pink-900/30', label: 'Personal' },
  other: { icon: MoreHorizontal, color: 'text-slate-400', bgColor: 'bg-slate-700', label: 'Other' },
};

const NOTE_COLORS = [
  { id: 'default', color: 'border-slate-700', bg: 'bg-slate-800/50' },
  { id: 'emerald', color: 'border-emerald-600', bg: 'bg-emerald-900/20' },
  { id: 'blue', color: 'border-blue-600', bg: 'bg-blue-900/20' },
  { id: 'purple', color: 'border-purple-600', bg: 'bg-purple-900/20' },
  { id: 'amber', color: 'border-amber-600', bg: 'bg-amber-900/20' },
  { id: 'pink', color: 'border-pink-600', bg: 'bg-pink-900/20' },
  { id: 'red', color: 'border-red-600', bg: 'bg-red-900/20' },
  { id: 'cyan', color: 'border-cyan-600', bg: 'bg-cyan-900/20' },
];

export const EnhancedNotesManager: React.FC<EnhancedNotesManagerProps> = ({ 
  notes, 
  onAddNote, 
  onUpdateNote, 
  onDeleteNote 
}) => {
  const [expandedNoteId, setExpandedNoteId] = useState<string | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<NoteCategory | 'all'>('all');
  const [sortBy, setSortBy] = useState<'updated' | 'created' | 'title'>('updated');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newNote, setNewNote] = useState({
    title: '',
    category: 'other' as NoteCategory,
    color: 'default',
    tags: '',
  });
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);

  const handleSaveTitle = (note: CustomNote) => {
    if (editedTitle.trim()) {
      onUpdateNote(note.id, { title: editedTitle.trim() });
    }
    setEditingTitleId(null);
  };

  const handleAddNote = () => {
    if (newNote.title.trim()) {
      onAddNote({
        title: newNote.title.trim(),
        content: '',
        category: newNote.category,
        isPinned: false,
        color: newNote.color,
        tags: newNote.tags ? newNote.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      });
      setNewNote({ title: '', category: 'other', color: 'default', tags: '' });
      setShowAddModal(false);
    }
  };

  const togglePin = (note: CustomNote) => {
    onUpdateNote(note.id, { isPinned: !note.isPinned });
  };

  const filteredAndSortedNotes = useMemo(() => {
    let result = [...notes];
    
    // Search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(n => 
        n.title.toLowerCase().includes(query) || 
        n.content.toLowerCase().includes(query) ||
        n.tags?.some(t => t.toLowerCase().includes(query))
      );
    }
    
    // Filter by category
    if (filterCategory !== 'all') {
      result = result.filter(n => n.category === filterCategory);
    }
    
    // Sort
    result.sort((a, b) => {
      // Pinned first
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      
      if (sortBy === 'updated') {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      }
      if (sortBy === 'created') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return a.title.localeCompare(b.title);
    });
    
    return result;
  }, [notes, searchQuery, filterCategory, sortBy]);

  const stats = useMemo(() => ({
    total: notes.length,
    pinned: notes.filter(n => n.isPinned).length,
    categories: Object.entries(
      notes.reduce((acc, n) => {
        acc[n.category] = (acc[n.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ),
  }), [notes]);

  const getNoteColor = (colorId?: string) => {
    return NOTE_COLORS.find(c => c.id === colorId) || NOTE_COLORS[0];
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-900/30 rounded-xl">
            <FileText size={20} className="text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Smart Notes</h3>
            <p className="text-xs text-slate-400">{stats.total} notes • {stats.pinned} pinned</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary py-2 px-4 text-sm bg-purple-600 hover:bg-purple-700 shadow-purple-500/20"
        >
          <Plus size={16} /> New Note
        </button>
      </div>

      {/* Search and Filters */}
      <div className="gpa-card p-3 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes, tags..."
            className="input-field w-full pl-10"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Filter size={14} className="text-slate-400" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value as NoteCategory | 'all')}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="all">All Categories</option>
              {Object.entries(CATEGORY_CONFIG).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1">
            <SortAsc size={14} className="text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'updated' | 'created' | 'title')}
              className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-purple-500"
            >
              <option value="updated">Last Updated</option>
              <option value="created">Created Date</option>
              <option value="title">Title</option>
            </select>
          </div>
          <div className="flex items-center gap-1 ml-auto bg-slate-800 rounded-lg p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={clsx(
                "p-1.5 rounded transition-colors",
                viewMode === 'list' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              <List size={14} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={clsx(
                "p-1.5 rounded transition-colors",
                viewMode === 'grid' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
              )}
            >
              <Grid size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Add Note Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="gpa-card border-purple-500/30"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold">Create New Note</h4>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            <div className="space-y-3">
              <input
                type="text"
                value={newNote.title}
                onChange={(e) => setNewNote(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Note title..."
                className="input-field w-full"
                autoFocus
              />
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-400 uppercase mb-1 block">Category</label>
                  <select
                    value={newNote.category}
                    onChange={(e) => setNewNote(prev => ({ ...prev, category: e.target.value as NoteCategory }))}
                    className="input-field w-full py-2 text-sm"
                  >
                    {Object.entries(CATEGORY_CONFIG).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 uppercase mb-1 block">Color</label>
                  <div className="flex gap-1 flex-wrap">
                    {NOTE_COLORS.map(({ id, color }) => (
                      <button
                        key={id}
                        onClick={() => setNewNote(prev => ({ ...prev, color: id }))}
                        className={clsx(
                          "w-6 h-6 rounded-full border-2 transition-transform",
                          color,
                          newNote.color === id ? 'scale-110 ring-2 ring-white/30' : 'hover:scale-105'
                        )}
                      />
                    ))}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-[10px] text-slate-400 uppercase mb-1 block">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newNote.tags}
                  onChange={(e) => setNewNote(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="exam, chapter1, review..."
                  className="input-field w-full"
                />
              </div>
              
              <div className="flex justify-end gap-2">
                <button onClick={() => setShowAddModal(false)} className="btn-secondary py-2 px-4 text-sm">
                  Cancel
                </button>
                <button 
                  onClick={handleAddNote}  
                  disabled={!newNote.title.trim()}
                  className="btn-primary py-2 px-4 text-sm bg-purple-600 hover:bg-purple-700"
                >
                  Create Note
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notes List/Grid */}
      <div className={clsx(
        viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-4'
      )}>
        <AnimatePresence mode="popLayout">
          {filteredAndSortedNotes.map((note, index) => {
            const categoryConfig = CATEGORY_CONFIG[note.category || 'other'];
            const CategoryIcon = categoryConfig.icon;
            const noteColor = getNoteColor(note.color);

            return (
              <motion.div
                key={note.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.02 }}
                className={clsx(
                  "gpa-card border-l-4 transition-all group",
                  noteColor.color,
                  noteColor.bg,
                  note.isPinned && 'ring-1 ring-amber-500/30'
                )}
              >
                {/* Note Header */}
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    {note.isPinned && (
                      <Pin size={14} className="text-amber-400 mt-1 flex-shrink-0" />
                    )}
                    {editingTitleId === note.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={editedTitle}
                          onChange={(e) => setEditedTitle(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveTitle(note)}
                          className="input-field py-1 px-2 font-bold flex-1"
                          autoFocus
                        />
                        <button onClick={() => handleSaveTitle(note)} className="p-1 text-emerald-400 hover:bg-emerald-900/20 rounded">
                          <Check size={16} />
                        </button>
                      </div>
                    ) : (
                      <h4 
                        className="font-bold text-slate-100 cursor-pointer hover:text-white truncate flex-1"
                        onClick={() => setExpandedNoteId(expandedNoteId === note.id ? null : note.id)}
                      >
                        {note.title}
                      </h4>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => togglePin(note)}
                      className={clsx(
                        "p-1.5 rounded-lg transition-colors",
                        note.isPinned 
                          ? 'text-amber-400 bg-amber-900/20' 
                          : 'text-slate-500 hover:text-amber-400 opacity-0 group-hover:opacity-100'
                      )}
                      title={note.isPinned ? 'Unpin' : 'Pin to top'}
                    >
                      {note.isPinned ? <PinOff size={14} /> : <Pin size={14} />}
                    </button>
                    <button
                      onClick={() => {
                        setEditedTitle(note.title);
                        setEditingTitleId(note.id);
                      }}
                      className="p-1.5 text-slate-500 hover:text-purple-400 hover:bg-purple-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Edit2 size={14} />
                    </button>
                    <div className="relative">
                      <button
                        onClick={() => setShowColorPicker(showColorPicker === note.id ? null : note.id)}
                        className="p-1.5 text-slate-500 hover:text-purple-400 hover:bg-purple-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <Palette size={14} />
                      </button>
                      {showColorPicker === note.id && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="absolute right-0 top-full mt-1 p-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-10 flex gap-1"
                        >
                          {NOTE_COLORS.map(({ id, color }) => (
                            <button
                              key={id}
                              onClick={() => {
                                onUpdateNote(note.id, { color: id });
                                setShowColorPicker(null);
                              }}
                              className={clsx(
                                "w-5 h-5 rounded-full border-2 transition-transform hover:scale-110",
                                color
                              )}
                            />
                          ))}
                        </motion.div>
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={14} />
                    </button>
                    <button 
                      onClick={() => setExpandedNoteId(expandedNoteId === note.id ? null : note.id)} 
                      className="p-1.5 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      {expandedNoteId === note.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {/* Meta info */}
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={clsx(
                    "flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold",
                    categoryConfig.bgColor, categoryConfig.color
                  )}>
                    <CategoryIcon size={10} />
                    {categoryConfig.label}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Updated {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex items-center gap-1">
                      <Tag size={10} className="text-slate-500" />
                      {note.tags.slice(0, 3).map(tag => (
                        <span key={tag} className="text-[10px] text-slate-400 bg-slate-700 px-1.5 py-0.5 rounded">
                          {tag}
                        </span>
                      ))}
                      {note.tags.length > 3 && (
                        <span className="text-[10px] text-slate-500">+{note.tags.length - 3}</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Content Preview / Expanded */}
                <AnimatePresence>
                  {expandedNoteId === note.id ? (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mt-3 pt-3 border-t border-slate-700/50"
                    >
                      <RichTextEditor
                        value={note.content}
                        onChange={(content) => onUpdateNote(note.id, { content })}
                        placeholder="Start writing..."
                        className="min-h-[200px]"
                      />
                    </motion.div>
                  ) : note.content && (
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                      {note.content.replace(/<[^>]*>/g, '').slice(0, 150)}...
                    </p>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {filteredAndSortedNotes.length === 0 && (
          <div className="text-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl col-span-full">
            <FileText size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No notes found</p>
            <p className="text-xs mt-1">
              {notes.length > 0 ? 'Try adjusting your search or filters' : 'Create your first note!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
