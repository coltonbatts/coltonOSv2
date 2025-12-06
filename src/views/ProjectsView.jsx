import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FolderKanban, Edit2, Calendar, MoreHorizontal, ArrowRight, CheckCircle, Circle, Clock } from 'lucide-react';
import { useCollection } from '../hooks/useFirestore';
import { useToast } from '../context/ToastContext';
import { Modal, Input, TextArea, Select, Tag, EmptyState } from '../components/UI';

// ============================================
// PROJECT MODAL
// ============================================
function ProjectModal({ isOpen, onClose, onSave, title, initialData }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'Todo',
    priority: 'Medium',
    dueDate: '',
    tags: [],
    progress: 0
  });
  const [tagInput, setTagInput] = useState('');

  // Reset/Populate form
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          description: initialData.description || '',
          status: initialData.status || 'Todo',
          priority: initialData.priority || 'Medium',
          dueDate: initialData.dueDate || '',
          tags: initialData.tags || [],
          progress: initialData.progress || 0
        });
      } else {
        setFormData({
          title: '',
          description: '',
          status: 'Todo',
          priority: 'Medium',
          dueDate: '',
          tags: [],
          progress: 0
        });
      }
      setTagInput('');
    }
  }, [isOpen, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSave(formData);
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tagToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Project Name"
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          placeholder="Enter project name..."
          required
        />

        <TextArea
          label="Description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Project goals and details..."
          rows={4}
        />

        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Status"
            value={formData.status}
            onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
            options={[
              { value: 'Todo', label: 'Todo' },
              { value: 'Doing', label: 'In Progress' },
              { value: 'Done', label: 'Done' }
            ]}
          />

          <Select
            label="Priority"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
            options={[
              { value: 'Low', label: 'Low' },
              { value: 'Medium', label: 'Medium' },
              { value: 'High', label: 'High' },
              { value: 'Urgent', label: 'Urgent' }
            ]}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
          />
          <Input
            label="Progress (%)"
            type="number"
            min="0"
            max="100"
            value={formData.progress}
            onChange={(e) => setFormData(prev => ({ ...prev, progress: parseInt(e.target.value) || 0 }))}
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-xs text-white/40 font-mono uppercase tracking-wider">
            Tags
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              placeholder="Add tag..."
              className="flex-1 bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors font-mono text-sm"
            />
            <button
              type="button"
              onClick={addTag}
              className="px-4 py-2 bg-white/10 border border-white/10 text-white/60 hover:text-white transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag, i) => (
                <Tag key={i} color="blue" onRemove={() => removeTag(tag)}>{tag}</Tag>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-white/60 hover:text-white transition-colors font-mono text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-white text-black px-6 py-2 font-mono text-sm uppercase tracking-wider hover:bg-white/90 transition-colors"
          >
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}

// ============================================
// MAIN PROJECTS VIEW
// ============================================
export default function ProjectsView({ uid }) {
  const { items: projects, loading, add, update, remove } = useCollection(uid, 'projects');
  const { addToast } = useToast();

  const [showModal, setShowModal] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);

  // Optimistic Updates
  const [optimisticProjects, setOptimisticProjects] = useState([]);

  useEffect(() => {
    setOptimisticProjects(projects);
  }, [projects]);

  // Keyboard support for Quick Add
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Create new project shortcut: 'n' (if not typing in input)
      if (e.key === 'n' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setShowModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);


  const handleAdd = async (data) => {
    const id = await add(data); // Optimism handled by Firestone listener usually, but for drag/drop below we do optimism
    if (id) {
      addToast('Project created successfully', 'success');
      setShowModal(false);
    } else {
      addToast('Failed to create project', 'error');
    }
  };

  const handleUpdate = async (data) => {
    if (editingProject) {
      const success = await update(editingProject.id, data);
      if (success) {
        addToast('Project updated successfully', 'success');
        setEditingProject(null);
      } else {
        addToast('Failed to update project', 'error');
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this project?')) {
      const success = await remove(id);
      if (success) {
        addToast('Project deleted', 'info');
      } else {
        addToast('Failed to delete project', 'error');
      }
    }
  };

  const onDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent drag image or default
    // e.dataTransfer.setDragImage(img, 0, 0);
  };

  const onDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  const onDrop = async (e, status) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.status === status) return;

    // Optimistic Update
    const originalStatus = draggedItem.status;
    const updatedItem = { ...draggedItem, status };

    setOptimisticProjects(prev => prev.map(p => p.id === draggedItem.id ? updatedItem : p));

    // API Call
    try {
      await update(draggedItem.id, { status });
      addToast(`Moved to ${status}`, 'success');
    } catch (error) {
      // Rollback
      console.error("Move failed", error);
      setOptimisticProjects(prev => prev.map(p => p.id === draggedItem.id ? { ...p, status: originalStatus } : p));
      addToast('Failed to move item', 'error');
    }
    setDraggedItem(null);
  };


  const COLUMNS = [
    { id: 'Todo', label: 'To Do', icon: Circle, color: 'text-white/40' },
    { id: 'Doing', label: 'In Progress', icon: Clock, color: 'text-blue-400' },
    { id: 'Done', label: 'Done', icon: CheckCircle, color: 'text-green-400' }
  ];

  /* 
    Ensure we map old statuses to new ones if necessary 
    (Active -> Doing, etc. or just handle existing)
    For this impl, we assume statuses are mapped or we fallback 'Active' -> 'Doing'
  */
  const getProjectsByStatus = (status) => {
    return optimisticProjects.filter(p => {
      if (status === 'Doing' && (p.status === 'Active' || p.status === 'Doing')) return true;
      if (status === 'Todo' && (p.status === 'Todo' || !p.status)) return true; // Default to Todo
      return p.status === status;
    });
  };

  return (
    <div className="h-full flex flex-col p-6 lg:p-8">
      {/* Header */}
      <div className="flex-none mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light text-white mb-1 flex items-center gap-3">
            <FolderKanban size={28} strokeWidth={1.5} className="text-white/60" />
            Projects Board
          </h1>
          <p className="text-xs text-white/40 font-mono">
            Keypad: Press <span className="text-white bg-white/10 px-1 rounded">N</span> to create
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-black px-4 py-2 font-mono text-sm uppercase tracking-wider hover:bg-white/90 transition-colors flex items-center gap-2 rounded-lg"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden flex gap-6 pb-2">
        {loading && optimisticProjects.length === 0 ? (
          <div className="w-full h-full flex items-center justify-center text-white/30 font-mono animate-pulse">Loading board...</div>
        ) : (
          COLUMNS.map(col => (
            <div
              key={col.id}
              className="flex-1 min-w-[300px] flex flex-col bg-white/5 rounded-2xl border border-white/5 backdrop-blur-sm"
              onDragOver={onDragOver}
              onDrop={(e) => onDrop(e, col.id)}
            >
              {/* Column Header */}
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <col.icon size={16} className={col.color} />
                  <span className="font-medium text-white/80 text-sm tracking-wide">{col.label}</span>
                </div>
                <span className="text-xs text-white/30 font-mono bg-white/5 px-2 py-0.5 rounded-full">
                  {getProjectsByStatus(col.id).length}
                </span>
              </div>

              {/* Column Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
                {getProjectsByStatus(col.id).map(project => (
                  <div
                    key={project.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, project)}
                    className="bg-black/20 hover:bg-white/5 border border-white/5 hover:border-white/20 p-4 rounded-xl cursor-move transition-all group relative"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-sm font-medium text-white/90 line-clamp-2 leading-relaxed">
                        {project.title}
                      </h3>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingProject(project); }}
                        className="opacity-0 group-hover:opacity-100 text-white/30 hover:text-white transition-opacity"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </div>

                    {project.description && (
                      <p className="text-xs text-white/50 line-clamp-2 mb-3">{project.description}</p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                      <div className="flex gap-1.5">
                        <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border ${project.priority === 'Urgent' ? 'text-red-400 border-red-500/20 bg-red-500/10' :
                            project.priority === 'High' ? 'text-orange-400 border-orange-500/20 bg-orange-500/10' :
                              'text-blue-400 border-blue-500/20 bg-blue-500/10'
                          }`}>
                          {project.priority || 'MED'}
                        </span>
                      </div>

                      {project.dueDate && (
                        <div className="flex items-center gap-1 text-[10px] text-white/30 font-mono">
                          <Calendar size={10} />
                          {new Date(project.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      <ProjectModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleAdd}
        title="Create New Project"
      />

      <ProjectModal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        onSave={handleUpdate}
        title="Edit Project"
        initialData={editingProject}
      />
    </div>
  );
}
