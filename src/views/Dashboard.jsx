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
  const { items: projects } = useCollection(uid, 'vault_projects');
  const { items: assets } = useCollection(uid, 'vault_assets');
  const { items: prompts } = useCollection(uid, 'vault_prompts');
  const { items: links } = useCollection(uid, 'vault_links');

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
    switch(type) {
      case 'project': return FolderOpen;
      case 'asset': return FileText;
      case 'prompt': return MessageSquare;
      case 'link': return Link2;
      default: return FileText;
    }
  };

  const getTypeColor = (type) => {
    switch(type) {
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
    <div className="h-full p-8 lg:p-12 grid grid-cols-12 grid-rows-6 gap-6">
      {/* Header Section */}
      <div className="col-span-12 row-span-1 flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-light text-white mb-2">
            Welcome back, Colton.
          </h1>
          <div className="flex items-center gap-2 text-xs text-white/40 font-mono uppercase tracking-widest">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            System Online
            <span className="mx-2 text-white/20">|</span>
            <span>{projects.length + assets.length + prompts.length + links.length} items in vault</span>
          </div>
        </div>
        <Clock />
      </div>

      {/* Vault Stats Row */}
      <div className="col-span-12 lg:col-span-8 row-span-1">
        <div className="grid grid-cols-4 gap-4 h-full">
          {vaultStats.map((stat) => (
            <button
              key={stat.label}
              onClick={() => onNavigate?.('vault')}
              className="bg-white/5 border border-white/10 p-4 hover:bg-white/[0.07] hover:border-white/20 transition-all group text-left"
            >
              <div className="flex items-center justify-between mb-3">
                <stat.icon size={18} className="text-white/40 group-hover:text-white/60 transition-colors" />
                <ArrowRight size={14} className="text-white/0 group-hover:text-white/40 transition-all transform group-hover:translate-x-1" />
              </div>
              <div className="text-2xl lg:text-3xl font-light text-white mb-1">{stat.value}</div>
              <div className="text-xs text-white/40 font-mono uppercase tracking-wider">{stat.label}</div>
              {stat.active > 0 && (
                <div className="text-xs text-white/20 font-mono mt-1">{stat.active} active</div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="col-span-12 lg:col-span-4 row-span-1">
        <div className="h-full bg-white/5 border border-white/10 p-4 flex flex-col justify-center">
          <div className="text-xs text-white/40 font-mono uppercase tracking-wider mb-3">Quick Actions</div>
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={() => onNavigate?.('vault')}
              className="px-3 py-2 bg-white/5 border border-white/10 text-xs font-mono text-white/60 hover:text-white hover:border-white/30 transition-all text-left"
            >
              + Add Project
            </button>
            <button 
              onClick={() => onNavigate?.('vault')}
              className="px-3 py-2 bg-white/5 border border-white/10 text-xs font-mono text-white/60 hover:text-white hover:border-white/30 transition-all text-left"
            >
              + Add Asset
            </button>
            <button 
              onClick={() => onNavigate?.('vault')}
              className="px-3 py-2 bg-white/5 border border-white/10 text-xs font-mono text-white/60 hover:text-white hover:border-white/30 transition-all text-left"
            >
              + Add Prompt
            </button>
            <button 
              onClick={() => onNavigate?.('vault')}
              className="px-3 py-2 bg-white/5 border border-white/10 text-xs font-mono text-white/60 hover:text-white hover:border-white/30 transition-all text-left"
            >
              + Add Link
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="col-span-12 lg:col-span-8 row-span-4">
        <Widget title="Recent Activity" icon={ClockIcon} className="h-full">
          {allItems.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="text-white/20 font-mono text-sm mb-2">No activity yet</div>
                <button
                  onClick={() => onNavigate?.('vault')}
                  className="text-xs text-white/40 hover:text-white transition-colors font-mono underline underline-offset-4"
                >
                  Start adding to your vault →
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-1">
              {allItems.map((item) => {
                const Icon = getTypeIcon(item._type);
                return (
                  <div
                    key={`${item._type}-${item.id}`}
                    className="flex items-center gap-4 p-3 hover:bg-white/5 transition-colors group cursor-pointer"
                    onClick={() => onNavigate?.('vault')}
                  >
                    <div className={`w-8 h-8 flex items-center justify-center bg-white/5 ${getTypeColor(item._type)}`}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white font-light truncate">{item.title}</div>
                      <div className="text-xs text-white/30 font-mono flex items-center gap-2">
                        <span className="capitalize">{item._type}</span>
                        {item.type && (
                          <>
                            <span className="text-white/10">•</span>
                            <span>{item.type}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-white/20 font-mono">
                      {formatRelativeTime(item.createdAt)}
                    </div>
                    <ArrowRight size={14} className="text-white/0 group-hover:text-white/40 transition-all" />
                  </div>
                );
              })}
            </div>
          )}
        </Widget>
      </div>

      {/* Side Widgets */}
      <div className="col-span-12 lg:col-span-4 row-span-4 grid grid-rows-2 gap-6">
        <TaskWidget uid={uid} />
        <Scratchpad uid={uid} />
      </div>
    </div>
  );
}
