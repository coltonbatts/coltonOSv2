import React, { useState } from 'react';
import { Plus, Trash2, FolderKanban } from 'lucide-react';
import { useCollection } from '../hooks/useFirestore';

export default function ProjectsView({ uid }) {
  const { items: projects, loading, add, update, remove } = useCollection(uid, 'projects');
  const [newProject, setNewProject] = useState('');

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!newProject.trim()) return;
    await add({
      title: newProject,
      status: 'Active',
      progress: 0
    });
    setNewProject('');
  };

  const toggleStatus = async (project) => {
    const newStatus = project.status === 'Active' ? 'Done' : 'Active';
    const newProgress = newStatus === 'Done' ? 100 : 0;
    await update(project.id, { status: newStatus, progress: newProgress });
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
        
        <form onSubmit={handleAdd} className="flex gap-4">
          <input
            type="text"
            value={newProject}
            onChange={(e) => setNewProject(e.target.value)}
            placeholder="New Project Name..."
            className="bg-white/5 border border-white/10 px-4 py-2 text-white placeholder-white/30 focus:outline-none focus:border-white/50 transition-colors font-mono text-sm w-64"
          />
          <button
            type="submit"
            className="bg-white text-black px-4 py-2 font-mono text-sm uppercase tracking-wider hover:bg-white/90 transition-colors flex items-center gap-2"
          >
            <Plus size={16} /> Create
          </button>
        </form>
      </div>

      {/* Projects Grid */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-white/30 font-mono animate-pulse">Loading projects...</div>
          </div>
        ) : projects.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <FolderKanban size={48} className="text-white/10 mx-auto mb-4" strokeWidth={1} />
              <div className="text-white/30 font-mono text-sm mb-2">No projects yet</div>
              <div className="text-xs text-white/20 font-mono">Create your first project above</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map(project => (
              <div 
                key={project.id} 
                className="bg-white/5 border border-white/10 p-6 backdrop-blur-md group hover:border-white/30 transition-all"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl text-white font-light">{project.title}</h3>
                  <button
                    onClick={() => remove(project.id)}
                    className="text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <button
                      onClick={() => toggleStatus(project)}
                      className={`px-2 py-1 text-xs font-mono uppercase tracking-wider border transition-colors ${
                        project.status === 'Active'
                          ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20'
                          : 'border-white/20 text-white/40 bg-white/5 hover:bg-white/10'
                      }`}
                    >
                      {project.status}
                    </button>
                    <span className="text-xs text-white/40 font-mono">{project.progress}%</span>
                  </div>

                  <div className="h-1 w-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-white/80 transition-all duration-500 ease-out"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>

                  <div className="text-xs text-white/20 font-mono">
                    Created {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
