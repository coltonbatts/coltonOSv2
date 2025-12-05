import React, { useState } from 'react';
import {
    ArrowLeft,
    Calendar,
    CheckCircle2,
    Clock,
    Layout,
    MessageSquare,
    FileText,
    Link2,
    Plus,
    MoreVertical,
    Activity
} from 'lucide-react';
import { useCollection, useDocument } from '../hooks/useFirestore';
import { useToast } from '../context/ToastContext';
import { Tag, EmptyState, Modal, Input, TextArea, Select } from '../components/UI';

// ============================================
// PROJECT HEADER
// ============================================
function ProjectHeader({ project, onBack }) {
    const getStatusColor = (status) => {
        switch (status) {
            case 'Active': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            case 'Done': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            case 'On Hold': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
            default: return 'text-white/40 bg-white/5 border-white/10';
        }
    };

    return (
        <div className="flex flex-col gap-6 border-b border-white/10 pb-6 mb-8">
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60 hover:text-white"
                >
                    <ArrowLeft size={20} />
                </button>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                        <h1 className="text-3xl font-light text-white">{project?.title || 'Loading...'}</h1>
                        {project?.status && (
                            <span className={`px-2 py-0.5 text-xs font-mono border ${getStatusColor(project.status)}`}>
                                {project.status}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-white/40 font-mono">
                        {project?.dueDate && (
                            <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                Due {new Date(project.dueDate).toLocaleDateString()}
                            </span>
                        )}
                        <span className="flex items-center gap-1">
                            <Activity size={12} />
                            {project?.progress || 0}% Complete
                        </span>
                    </div>
                </div>
            </div>

            {project?.description && (
                <p className="text-white/60 max-w-4xl text-sm leading-relaxed pl-14">
                    {project.description}
                </p>
            )}

            {project?.tags && project.tags.length > 0 && (
                <div className="flex gap-2 pl-14">
                    {project.tags.map((tag, i) => (
                        <Tag key={i} color="blue">{tag}</Tag>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================
// TASK LIST (Refactored for Project Context)
// ============================================
function ProjectTasks({ uid, projectId }) {
    // Ideally, we'd query tasks where projectId == projectId
    // For now, we'll fetch all and filter client-side or assume we implement the query later
    // Implementation Note: In a real app, use a compound query index.
    const { items: allTasks, add, remove, update } = useCollection(uid, 'tasks');
    const [newTask, setNewTask] = useState('');

    // Filter for this project (simulated relation)
    // We need to actually start saving projectId on tasks to make this real
    const tasks = allTasks.filter(t => t.projectId === projectId);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        await add({
            text: newTask,
            completed: false,
            projectId: projectId // Link task to project
        });
        setNewTask('');
    };

    const toggleTask = (task) => {
        update(task.id, { completed: !task.completed });
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-light text-white flex items-center gap-2">
                    <CheckCircle2 size={18} className="text-white/40" />
                    Directives
                </h3>
                <span className="text-xs font-mono text-white/30">{tasks.filter(t => t.completed).length}/{tasks.length}</span>
            </div>

            <form onSubmit={handleAdd} className="mb-4 relative">
                <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="New directive..."
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 pr-10 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors font-mono"
                />
                <button
                    type="submit"
                    className="absolute right-3 top-3 text-white/40 hover:text-white transition-colors"
                >
                    <Plus size={16} />
                </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {tasks.length === 0 ? (
                    <div className="text-center py-8 border border-white/5 border-dashed">
                        <div className="text-white/20 font-mono text-xs">No active directives for this project.</div>
                    </div>
                ) : (
                    tasks.map(task => (
                        <div
                            key={task.id}
                            className={`flex items-start gap-3 p-3 border border-white/5 hover:bg-white/5 transition-all group ${task.completed ? 'opacity-50' : ''}`}
                        >
                            <button
                                onClick={() => toggleTask(task)}
                                className={`mt-0.5 w-4 h-4 border transition-colors flex items-center justify-center ${task.completed ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 'border-white/20 hover:border-white/50'}`}
                            >
                                {task.completed && <CheckCircle2 size={10} />}
                            </button>
                            <span className={`flex-1 text-sm font-light ${task.completed ? 'text-white/30 line-through' : 'text-white/80'}`}>
                                {task.text}
                            </span>
                            <button
                                onClick={() => remove(task.id)}
                                className="text-white/0 group-hover:text-white/20 hover:!text-red-400 transition-all"
                            >
                                <MoreVertical size={14} />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

// ============================================
// ASSET BROWSER (Refactored for Project Context)
// ============================================
function ProjectAssets({ uid, projectId }) {
    // Similar logic: fetch all, filter by projectId
    const { items: allAssets } = useCollection(uid, 'assets');
    const { items: allPrompts } = useCollection(uid, 'prompts');

    const assets = [
        ...allAssets.filter(a => a.projectId === projectId).map(a => ({ ...a, _type: 'asset' })),
        ...allPrompts.filter(p => p.projectId === projectId).map(p => ({ ...p, _type: 'prompt' }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-light text-white flex items-center gap-2">
                    <Layout size={18} className="text-white/40" />
                    Workspace
                </h3>
                <button className="text-xs font-mono text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider">
                    + Link Asset
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {assets.length === 0 ? (
                    <EmptyState
                        icon={FileText}
                        title="Empty Workspace"
                        description="Link prompts and assets to this project to organize your work."
                    />
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {assets.map(item => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 hover:border-white/30 transition-all group"
                            >
                                <div className={`w-10 h-10 flex items-center justify-center bg-white/5 ${item._type === 'prompt' ? 'text-purple-400' : 'text-emerald-400'}`}>
                                    {item._type === 'prompt' ? <MessageSquare size={18} /> : <FileText size={18} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-white font-light truncate">{item.title}</div>
                                    <div className="text-xs text-white/40 font-mono capitalize">{item._type}</div>
                                </div>
                                <button className="text-white/20 hover:text-white transition-colors">
                                    <Link2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}


// ============================================
// MAIN VIEW
// ============================================
export default function ProjectDetailView({ uid, projectId, onBack }) {
    const { data: project, loading } = useDocument(uid, 'projects', projectId);

    if (loading) {
        return (
            <div className="h-full flex items-center justify-center">
                <div className="text-white/30 font-mono animate-pulse">Loading workspace...</div>
            </div>
        );
    }

    if (!project) {
        return (
            <div className="h-full flex items-center justify-center flex-col gap-4">
                <div className="text-white/40 font-mono">Project not found or access denied.</div>
                <button onClick={onBack} className="text-white underline">Return</button>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col p-8 lg:p-12 overflow-hidden">
            <ProjectHeader project={project} onBack={onBack} />

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
                {/* Left Column: Tasks/Directives */}
                <div className="bg-white/[0.02] border border-white/5 p-6 backdrop-blur-sm">
                    <ProjectTasks uid={uid} projectId={projectId} />
                </div>

                {/* Right Column: Assets/Workspace */}
                <div className="bg-white/[0.02] border border-white/5 p-6 backdrop-blur-sm">
                    <ProjectAssets uid={uid} projectId={projectId} />
                </div>
            </div>
        </div>
    );
}
