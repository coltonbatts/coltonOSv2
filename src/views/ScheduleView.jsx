import React from 'react';
import { Calendar, Clock, Plus } from 'lucide-react';

export default function ScheduleView({ uid }) {
  // Get current week dates
  const today = new Date();
  const weekDays = [];
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay());

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    weekDays.push(date);
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

  return (
    <div className="h-full p-8 lg:p-12 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-light text-white mb-2 flex items-center gap-3">
            <Calendar size={32} strokeWidth={1.5} className="text-white/60" />
            Schedule
          </h1>
          <div className="flex items-center gap-2 text-xs text-white/40 font-mono uppercase tracking-widest">
            <span className="w-2 h-2 bg-yellow-500 rounded-full" />
            Week View
            <span className="mx-2 text-white/20">|</span>
            <span>{today.toLocaleDateString([], { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 font-mono text-sm hover:text-white hover:border-white/30 transition-all">
            Today
          </button>
          <button className="bg-white text-black px-4 py-2 font-mono text-sm uppercase tracking-wider hover:bg-white/90 transition-colors flex items-center gap-2">
            <Plus size={16} /> Add Event
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden flex flex-col bg-white/5 border border-white/10">
        {/* Day Headers */}
        <div className="grid grid-cols-8 border-b border-white/10">
          <div className="p-3 text-xs text-white/20 font-mono"></div>
          {weekDays.map((date, i) => {
            const isToday = date.toDateString() === today.toDateString();
            return (
              <div 
                key={i} 
                className={`p-3 text-center border-l border-white/10 ${isToday ? 'bg-white/5' : ''}`}
              >
                <div className="text-xs text-white/40 font-mono uppercase">{dayNames[i]}</div>
                <div className={`text-lg font-light ${isToday ? 'text-white' : 'text-white/60'}`}>
                  {date.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Time Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-white/5 min-h-[60px]">
              <div className="p-2 text-xs text-white/20 font-mono text-right pr-3">
                {hour > 12 ? hour - 12 : hour}{hour >= 12 ? 'PM' : 'AM'}
              </div>
              {weekDays.map((_, i) => (
                <div 
                  key={i} 
                  className="border-l border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 flex items-center gap-4">
        <Clock size={20} className="text-yellow-500/60" />
        <div>
          <div className="text-sm text-white/80">Google Calendar Integration Coming Soon</div>
          <div className="text-xs text-white/40 font-mono">Connect your calendar to sync events automatically</div>
        </div>
      </div>
    </div>
  );
}
