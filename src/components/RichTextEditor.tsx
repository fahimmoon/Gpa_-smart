import React, { useRef } from 'react';
import { Bold, Italic, List, ListOrdered, Type } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, placeholder, className }) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end);
    
    onChange(newValue);
    
    // Reset focus and selection
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <div className={`flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950 ${className}`}>
      <div className="flex items-center gap-1 p-2 border-bottom border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
        <button
          type="button"
          onClick={() => insertText('**', '**')}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
          title="Bold"
        >
          <Bold size={16} />
        </button>
        <button
          type="button"
          onClick={() => insertText('*', '*')}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
          title="Italic"
        >
          <Italic size={16} />
        </button>
        <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />
        <button
          type="button"
          onClick={() => insertText('\n- ')}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
          title="Bullet List"
        >
          <List size={16} />
        </button>
        <button
          type="button"
          onClick={() => insertText('\n1. ')}
          className="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors"
          title="Numbered List"
        >
          <ListOrdered size={16} />
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-4 text-sm outline-none bg-transparent min-h-[150px] resize-none"
      />
    </div>
  );
};
