import React, { useState } from 'react';
import { Plus, Trash2, FolderKanban, Edit2, Calendar, AlertCircle } from 'lucide-react';
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
    status: 'Active',
    priority: 'Medium',
    dueDate: '',
    tags: [],
    progress: 0
  });
  const [tagInput, setTagInput] = useState('');

  // Reset/Populate form
  React.useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          description: initialData.description || '',
          status: initialData.status || 'Active',
          priority: initialData.priority || 'Medium',
          dueDate: initialData.dueDate || '',
          tags: initialData.tags || [],
          progress: initialData.progress || 0
        });
      } else {
        setFormData({
          title: '',
          description: '',
          status: 'Active',
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
              { value: 'Active', label: 'Active' },
              { value: 'On Hold', label: 'On Hold' },
              { value: 'Done', label: 'Done' },
              { value: 'Archived', label: 'Archived' }
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

  const handleAdd = async (data) => {
    const id = await add(data);
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Urgent': return 'text-red-400 border-red-500/30 bg-red-500/10';
      case 'High': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      case 'Medium': return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
      default: return 'text-blue-400 border-blue-500/30 bg-blue-500/10';
    }
  };

  return (
    <div className="h-full p-8 lg:p-12 flex flex-col gap-8">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between border-b border-white/10 pb-6 gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-light text-white mb-2 flex items-center gap-3">
            <FolderKanban size={32} strokeWidth={1.5} className="text-white/60" />
            Projects
          </h1>
          <div className="flex items-center gap-2 text-xs text-white/40 font-mono uppercase tracking-widest">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Active Workflows
            <span className="mx-2 text-white/20">|</span>
            <span>{projects.filter(p => p.status === 'Active').length} active</span>
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-white text-black px-4 py-2 font-mono text-sm uppercase tracking-wider hover:bg-white/90 transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Projects Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white/30 font-mono animate-pulse">Loading projects...</div>
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            icon={FolderKanban}
            title="No Active Projects"
            description="Start managing your workflows by creating a new project."
            action="Create Project"
            onAction={() => setShowModal(true)}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div
                key={project.id}
                className="bg-white/5 border border-white/10 p-6 backdrop-blur-md group hover:border-white/30 transition-all flex flex-col h-full"
              >
                {/* Card Header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0 pr-4">
                    {project.dueDate && (
                      <div className="flex items-center gap-2 text-xs text-white/40 font-mono mb-2">
                        <Calendar size={12} />
                        {new Date(project.dueDate).toLocaleDateString()}
                      </div>
                    )}
                    <h3 className="text-xl text-white font-light truncate" title={project.title}>
                      {project.title}
                    </h3>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingProject(project)}
                      className="p-1 text-white/40 hover:text-white transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(project.id)}
                      className="p-1 text-white/40 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Description */}
                {project.description && (
                  <p className="text-sm text-white/50 mb-6 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>
                )}

                {/* Tags */}
                {project.tags && project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6 mt-auto">
                    {project.tags.slice(0, 3).map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 text-xs font-mono border border-white/10 text-white/40">
                        {tag}
                      </span>
                    ))}
                    {project.tags.length > 3 && (
                      <span className="text-xs text-white/30 pt-1">+{project.tags.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Meta / Footer */}
                <div className="pt-4 border-t border-white/5 flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-0.5 text-xs font-mono border ${getPriorityColor(project.priority)}`}>
                      {project.priority || 'Normal'}
                    </span>
                    <span className="text-xs text-white/40 font-mono">
                      {project.status}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs font-mono text-white/30">
                      <span>Progress</span>
                      <span>{project.progress || 0}%</span>
                    </div>
                    <div className="h-1 w-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full bg-white/80 transition-all duration-500 ease-out"
                        style={{ width: `${project.progress || 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
