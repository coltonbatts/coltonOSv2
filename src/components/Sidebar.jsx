import React from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Database,
  Calendar,
  Terminal
} from 'lucide-react';

const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'projects', icon: FolderKanban, label: 'Projects' },
  { id: 'vault', icon: Database, label: 'Asset Vault' },
  { id: 'schedule', icon: Calendar, label: 'Schedule' },
];

export default function Sidebar({ activeTab, setActiveTab }) {
  return (
    <div className="w-20 h-full border-r border-white/10 flex flex-col items-center py-8 bg-slate-950/50 backdrop-blur-sm">
      {/* Logo */}
      <div className="mb-12">
        <div className="w-10 h-10 bg-white/5 rounded-none border border-white/20 flex items-center justify-center hover:bg-white/10 hover:border-white/40 transition-all cursor-pointer">
          <Terminal size={20} className="text-white/80" />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-8">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`group relative p-3 transition-all duration-300 ${
              activeTab === item.id 
                ? 'text-white' 
                : 'text-white/40 hover:text-white/70'
            }`}
          >
            <item.icon size={24} strokeWidth={1.5} />
            
            {/* Active indicator */}
            {activeTab === item.id && (
              <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            )}
            
            {/* Tooltip */}
            <span className="absolute left-14 bg-slate-900 border border-white/10 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Version info at bottom */}
      <div className="mt-auto">
        <div className="text-[10px] text-white/20 font-mono tracking-wider -rotate-90 origin-center whitespace-nowrap">
          v0.2.0
        </div>
      </div>
    </div>
  );
}
