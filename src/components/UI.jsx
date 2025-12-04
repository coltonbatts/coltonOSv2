import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, Activity, ExternalLink, Edit2, X, Check } from 'lucide-react';
import { useCollection, useDocument } from '../hooks/useFirestore';

// ============================================
// CLOCK
// ============================================
export function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="font-mono text-right">
      <div className="text-5xl font-light tracking-tighter text-white">
        {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-sm text-white/40 mt-1 tracking-widest uppercase">
        {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
}

// ============================================
// WIDGET WRAPPER
// ============================================
export function Widget({ title, icon: Icon, children, className = '' }) {
  return (
    <div className={`h-full flex flex-col bg-white/5 border border-white/10 p-6 backdrop-blur-md relative overflow-hidden group ${className}`}>
      {/* Top accent line */}
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold tracking-widest uppercase text-white/70">{title}</h3>
        {Icon && <Icon size={14} className="text-white/40" />}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {children}
      </div>
    </div>
  );
}

// ============================================
// TASK WIDGET
// ============================================
export function TaskWidget({ uid }) {
  const { items: tasks, loading, add, remove } = useCollection(uid, 'tasks');
  const [newTask, setNewTask] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    await add({ text: newTask, completed: false });
    setNewTask('');
  };

  return (
    <Widget title="Inbox / Tasks" icon={Activity}>
      <form onSubmit={handleAdd} className="mb-4 relative">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New directive..."
          className="w-full bg-black/20 border-b border-white/10 py-2 pr-8 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/50 transition-colors font-mono"
        />
        <button
          type="submit"
          className="absolute right-0 top-2 text-white/40 hover:text-white transition-colors"
        >
          <Plus size={16} />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
        {loading ? (
          <div className="text-xs text-white/30 font-mono animate-pulse">Initializing...</div>
        ) : tasks.length === 0 ? (
          <div className="text-xs text-white/30 font-mono">No active directives.</div>
        ) : (
          tasks.map(task => (
            <div 
              key={task.id} 
              className="group/item flex items-center justify-between py-2 border-b border-white/5 hover:bg-white/5 px-2 transition-colors"
            >
              <span className="text-sm text-white/80 font-light">{task.text}</span>
              <button
                onClick={() => remove(task.id)}
                className="text-white/20 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </Widget>
  );
}

// ============================================
// SCRATCHPAD WIDGET
// ============================================
export function Scratchpad({ uid }) {
  const { data, saving, save } = useDocument(uid, 'notes', 'scratchpad');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (data?.content !== undefined) {
      setNote(data.content);
    }
  }, [data]);

  const handleChange = (e) => {
    const content = e.target.value;
    setNote(content);
    save({ content });
  };

  return (
    <Widget 
      title="Scratchpad" 
      icon={saving ? Save : null}
    >
      <textarea
        value={note}
        onChange={handleChange}
        placeholder="Type to decrypt thoughts..."
        className="flex-1 w-full bg-transparent resize-none focus:outline-none text-sm text-white/80 font-mono leading-relaxed placeholder-white/20 custom-scrollbar"
        spellCheck="false"
      />
    </Widget>
  );
}

// ============================================
// STAT CARD
// ============================================
export function StatCard({ label, value, sublabel, trend }) {
  return (
    <div className="bg-white/5 border border-white/10 p-4 hover:bg-white/[0.07] transition-colors">
      <div className="text-xs text-white/40 font-mono uppercase tracking-wider mb-2">{label}</div>
      <div className="text-3xl font-light text-white mb-1">{value}</div>
      {sublabel && (
        <div className="text-xs text-white/30 font-mono">{sublabel}</div>
      )}
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================
export function EmptyState({ icon: Icon, title, description, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      {Icon && <Icon size={48} className="text-white/20 mb-4" strokeWidth={1} />}
      <h3 className="text-lg text-white/60 font-light mb-2">{title}</h3>
      <p className="text-sm text-white/30 font-mono mb-6 max-w-md">{description}</p>
      {action && (
        <button
          onClick={onAction}
          className="bg-white/10 border border-white/20 px-4 py-2 text-sm text-white/80 hover:bg-white/20 transition-colors font-mono uppercase tracking-wider"
        >
          {action}
        </button>
      )}
    </div>
  );
}

// ============================================
// TAG
// ============================================
export function Tag({ children, color = 'white', onRemove }) {
  const colors = {
    white: 'border-white/20 text-white/60 bg-white/5',
    blue: 'border-blue-500/30 text-blue-400 bg-blue-500/10',
    green: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    yellow: 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10',
    red: 'border-red-500/30 text-red-400 bg-red-500/10',
    purple: 'border-purple-500/30 text-purple-400 bg-purple-500/10',
  };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono border ${colors[color]}`}>
      {children}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-white transition-colors">
          <X size={10} />
        </button>
      )}
    </span>
  );
}

// ============================================
// MODAL
// ============================================
export function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-900 border border-white/10 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-lg font-light text-white">{title}</h2>
          <button 
            onClick={onClose}
            className="text-white/40 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// ============================================
// INPUT
// ============================================
export function Input({ label, ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs text-white/40 font-mono uppercase tracking-wider">
          {label}
        </label>
      )}
      <input
        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors font-mono text-sm"
        {...props}
      />
    </div>
  );
}

// ============================================
// TEXTAREA
// ============================================
export function TextArea({ label, ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs text-white/40 font-mono uppercase tracking-wider">
          {label}
        </label>
      )}
      <textarea
        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors font-mono text-sm resize-none"
        {...props}
      />
    </div>
  );
}

// ============================================
// SELECT
// ============================================
export function Select({ label, options, ...props }) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-xs text-white/40 font-mono uppercase tracking-wider">
          {label}
        </label>
      )}
      <select
        className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white focus:outline-none focus:border-white/30 transition-colors font-mono text-sm appearance-none cursor-pointer"
        {...props}
      >
        {options.map(opt => (
          <option key={opt.value} value={opt.value} className="bg-slate-900">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
