import { Bold, Italic, Underline, List, Link as LinkIcon, RemoveFormatting } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only clear if empty from outside to prevent cursor jumps
    if (editorRef.current && value === '' && editorRef.current.innerHTML !== '') {
      editorRef.current.innerHTML = '';
    }
  }, [value]);

  const execCommand = (command: string, arg?: string) => {
    document.execCommand(command, false, arg);
    editorRef.current?.focus();
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleLink = () => {
    const url = prompt('Enter link URL (e.g., https://google.com):');
    if (url) execCommand('createLink', url);
  };

  return (
    <div className="border border-white/10 rounded-lg overflow-hidden bg-obsidian-light/30 flex flex-col focus-within:border-accent transition-colors">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-white/10 bg-obsidian-light/50 shrink-0">
        <button type="button" onClick={() => execCommand('bold')} className="p-1.5 hover:bg-white/10 rounded text-text-main hover:text-white transition-colors" title="Bold">
          <Bold className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => execCommand('italic')} className="p-1.5 hover:bg-white/10 rounded text-text-main hover:text-white transition-colors" title="Italic">
          <Italic className="w-4 h-4" />
        </button>
        <button type="button" onClick={() => execCommand('underline')} className="p-1.5 hover:bg-white/10 rounded text-text-main hover:text-white transition-colors" title="Underline">
          <Underline className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-white/10 mx-1" />
        <button type="button" onClick={() => execCommand('insertUnorderedList')} className="p-1.5 hover:bg-white/10 rounded text-text-main hover:text-white transition-colors" title="Bullet List">
          <List className="w-4 h-4" />
        </button>
        <button type="button" onClick={handleLink} className="p-1.5 hover:bg-white/10 rounded text-text-main hover:text-white transition-colors" title="Add Link">
          <LinkIcon className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-white/10 mx-1" />
        <button type="button" onClick={() => execCommand('removeFormat')} className="p-1.5 hover:bg-white/10 rounded text-text-main hover:text-white transition-colors" title="Clear Formatting">
          <RemoveFormatting className="w-4 h-4" />
        </button>
      </div>

      {/* Editor Area */}
      <div
        ref={editorRef}
        contentEditable
        className="p-3 min-h-[120px] max-h-[250px] overflow-y-auto text-sm text-white focus:outline-none"
        onInput={(e) => onChange(e.currentTarget.innerHTML)}
        onBlur={(e) => onChange(e.currentTarget.innerHTML)}
        data-placeholder={placeholder}
        style={{ 
          outline: 'none',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap'
        }}
      />
    </div>
  );
}
