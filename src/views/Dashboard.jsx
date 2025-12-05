import React from 'react';
import {
  FolderOpen,
  FileText,
  Link2,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Clock as ClockIcon
} from 'lucide-react';
import { useCollection } from '../hooks/useFirestore';
import { Clock, TaskWidget, Scratchpad, StatCard, Widget } from '../components/UI';

export default function Dashboard({ uid, onNavigate }) {
  // Fetch vault collections for stats
  const { items: projects } = useCollection(uid, 'projects');
  const { items: assets } = useCollection(uid, 'assets');
  const { items: prompts } = useCollection(uid, 'prompts');
  const { items: links } = useCollection(uid, 'links');

  // Combine all items for recent activity
  const allItems = [
    ...projects.map(p => ({ ...p, _type: 'project' })),
    ...assets.map(a => ({ ...a, _type: 'asset' })),
    ...prompts.map(p => ({ ...p, _type: 'prompt' })),
    ...links.map(l => ({ ...l, _type: 'link' }))
  ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);

  const vaultStats = [
    {
      label: 'Projects',
      value: projects.length,
      icon: FolderOpen,
      color: 'blue',
      active: projects.filter(p => p.status === 'Active').length
    },
    {
      label: 'Assets',
      value: assets.length,
      icon: FileText,
      color: 'green',
      active: assets.filter(a => a.status === 'Active').length
    },
    {
      label: 'Prompts',
      value: prompts.length,
      icon: MessageSquare,
      color: 'purple',
      active: prompts.filter(p => p.status === 'Active').length
    },
    {
      label: 'Links',
      value: links.length,
      icon: Link2,
      color: 'yellow',
      active: links.filter(l => l.status === 'Active').length
    },
  ];

  const getTypeIcon = (type) => {
    switch (type) {
      case 'project': return FolderOpen;
      case 'asset': return FileText;
      case 'prompt': return MessageSquare;
      case 'link': return Link2;
      default: return FileText;
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'project': return 'text-blue-400';
      case 'asset': return 'text-emerald-400';
      case 'prompt': return 'text-purple-400';
      case 'link': return 'text-yellow-400';
      default: return 'text-white/40';
    }
  };

  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="h-full p-8 lg:p-10 grid grid-cols-12 grid-rows-[auto_1fr] gap-8 overflow-y-auto custom-scrollbar">
      {/* Header Section */}
      <div className="col-span-12 flex items-end justify-between pb-2 pl-2">
        <div>
          <h1 className="text-4xl lg:text-5xl font-medium text-white mb-3 text-glow tracking-tight">
            Good afternoon, {import.meta.env.VITE_USER_NAME || 'Colton'}.
          </h1>
          <div className="flex items-center gap-3 text-xs text-white/60 font-medium uppercase tracking-widest pl-1">
            <span className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.6)] animate-pulse" />
            System Online
            <span className="w-1 h-1 bg-white/20 rounded-full" />
            <span>{projects.length + assets.length + prompts.length + links.length} Items Vaulted</span>
          </div>
        </div>
        <Clock />
      </div>

      {/* Main Grid Content */}
      <div className="col-span-12 lg:col-span-8 grid grid-rows-[auto_1fr] gap-8">
        {/* Vault Stats Row - Glass Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {vaultStats.map((stat) => (
            <button
              key={stat.label}
              onClick={() => onNavigate?.({ view: 'vault', category: stat.id })}
              className="glass-panel rounded-3xl p-5 hover:bg-white/10 transition-all duration-300 group text-left relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="flex items-center justify-between mb-4 relative z-10">
                <div className={`p-2 rounded-xl bg-white/5 ${stat.color === 'blue' ? 'text-blue-300' : stat.color === 'green' ? 'text-emerald-300' : stat.color === 'purple' ? 'text-purple-300' : 'text-yellow-300'}`}>
                  <stat.icon size={20} strokeWidth={1.5} />
                </div>
                <ArrowRight size={16} className="text-white/20 group-hover:text-white transition-all transform group-hover:translate-x-1" />
              </div>

              <div className="relative z-10">
                <div className="text-3xl font-semibold text-white mb-1 tracking-tight text-shadow-sm">{stat.value}</div>
                <div className="text-[11px] text-white/50 font-medium uppercase tracking-wider">{stat.label}</div>
              </div>
            </button>
          ))}
        </div>

        {/* Recent Activity - Large Glass Panel */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col min-h-[400px]">
          <div className="flex items-center gap-3 mb-6 pl-2">
            <ClockIcon size={20} className="text-white/40" />
            <h2 className="text-lg font-medium text-white/90">Recent Activity</h2>
          </div>

          {allItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-white/30 font-medium text-sm mb-3">No activity yet</div>
                <button
                  onClick={() => onNavigate?.('vault')}
                  className="px-4 py-2 rounded-full glass-item text-xs text-white/70 hover:text-white transition-all hover:bg-white/10"
                >
                  Start adding to your vault →
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
              {allItems.map((item) => {
                const Icon = getTypeIcon(item._type);
                return (
                  <div
                    key={`${item._type}-${item.id}`}
                    className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-all duration-200 group cursor-pointer border border-transparent hover:border-white/5"
                    onClick={() => {
                      if (item._type === 'project') {
                        onNavigate({ view: 'project-detail', id: item.id });
                      } else {
                        onNavigate({ view: 'vault', category: item._type + 's' });
                      }
                    }}
                  >
                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 ${getTypeColor(item._type)} shadow-inner`}>
                      <Icon size={18} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-medium truncate mb-0.5">{item.title}</div>
                      <div className="text-xs text-white/40 font-medium flex items-center gap-2">
                        <span className="capitalize">{item._type}</span>
                        {item.type && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-white/20" />
                            <span>{item.type}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-white/20 font-medium">
                      {formatRelativeTime(item.createdAt)}
                    </div>
                    <ArrowRight size={16} className="text-white/0 group-hover:text-white/30 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Quick Actions & Widgets */}
      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
        {/* Quick Actions */}
        <div className="glass-panel rounded-3xl p-6">
          <div className="text-xs text-white/40 font-medium uppercase tracking-wider mb-4 pl-1">Quick Actions</div>
          <div className="grid grid-cols-1 gap-2">
            {[
              { label: 'Project', cat: 'projects' },
              { label: 'Asset', cat: 'assets' },
              { label: 'Prompt', cat: 'prompts' },
              { label: 'Link', cat: 'links' }
            ].map((action) => (
              <button
                key={action.label}
                onClick={() => onNavigate?.({ view: 'vault', category: action.cat, action: 'add' })}
                className="px-4 py-3 glass-item rounded-xl text-xs font-medium text-white/70 hover:text-white transition-all text-left flex items-center justify-between group"
              >
                <span>+  New {action.label}</span>
                <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>

        {/* Widgets */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Wrapping widgets in glass containers */}
          <div className="glass-panel rounded-3xl p-1 flex-1 overflow-hidden">
            <TaskWidget uid={uid} />
          </div>
          <div className="glass-panel rounded-3xl p-1 flex-1 overflow-hidden">
            <Scratchpad uid={uid} />
          </div>
        </div>
      </div>
    </div>
  );
}
