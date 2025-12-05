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
    <div className="w-20 h-full border-r border-white/5 flex flex-col items-center py-6 glass-sidebar z-20 relative">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all cursor-pointer shadow-lg group">
          <Terminal size={18} className="text-white/60 group-hover:text-white transition-colors" strokeWidth={2} />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-4 w-full px-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`group relative p-3 rounded-2xl transition-all duration-300 flex justify-center ${activeTab === item.id
                ? 'glass-item text-white shadow-[0_0_20px_rgba(255,255,255,0.1)]'
                : 'text-white/30 hover:text-white hover:bg-white/5'
              }`}
          >
            <item.icon size={22} strokeWidth={1.5} className="transition-transform duration-300 group-hover:scale-110" />

            {/* Tooltip */}
            <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-[#2c2c2e] border border-white/10 px-3 py-1.5 text-xs text-white font-medium opacity-0 group-hover:opacity-100 transition-all whitespace-nowrap z-50 pointer-events-none rounded-lg shadow-xl translate-x-2 group-hover:translate-x-0 backdrop-blur-md">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Version info at bottom */}
      <div className="mt-auto pb-4 opacity-30 text-[9px] font-mono tracking-widest text-white hover:opacity-100 transition-opacity cursor-default">
        v0.2
      </div>
    </div>
  );
}
