import React, { useState } from 'react';
import ScheduleImporter from '../components/ScheduleImporter';
import { Calendar as CalendarIcon, Clock, Plus, Upload, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCollection } from '../hooks/useFirestore';
import { useToast } from '../context/ToastContext';

export default function ScheduleView({ uid }) {
  const { items: events, add, loading } = useCollection(uid, 'schedule');
  const { add: addTask } = useCollection(uid, 'tasks');
  const { addToast } = useToast();
  const [importing, setImporting] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get week dates based on currentDate
  const today = new Date(); // Keep 'today' for highlighting the actual current day
  const weekDays = [];
  // Start from Sunday
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    weekDays.push(date);
  }

  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 8;
    return `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? 'PM' : 'AM'}`;
  });

  // Helper to check if an event occurs on a specific date/time
  const getEventsForSlot = (date, hour) => {
    const dayIndex = date.getDay(); // 0-6
    const dateStr = date.toISOString().split('T')[0];

    return events.filter(event => {
      // Check day of week match for recurring
      if (event.days && !event.days.includes(dayIndex)) return false;

      // Check specific date match
      if (event.date && event.date !== dateStr) return false;

      // Check time overlap
      const start = parseInt(event.startTime.split(':')[0]);
      // Simple hour check (events showing in the hour block they start or cover)
      // This is a basic implementation; for full timeline visualization we'd calculate height/offset
      return start === hour;
    });
  };

  const getDailyFocus = (date) => {
    const dayIndex = date.getDay();
    // Retrieve focus from events where type is 'focus' and day matches
    const focusEvent = events.find(e =>
      e.type === 'focus' &&
      (e.days?.includes(dayIndex) || e.date === date.toISOString().split('T')[0])
    );

    if (focusEvent) return focusEvent;

    // Fallback to seeded focuses if not found (optional, can remove later)
    return null;
  };

  const handleImport = async (data) => {
    try {
      // 1. Add Recurring Blocks
      for (const block of data.blocks) {
        await add(block);
      }

      // 2. Add Daily Focuses (as 'focus' type events)
      for (const focus of data.dailyFocus) {
        await add({
          title: focus.title,
          type: 'focus',
          days: [focus.dayIndex], // Recurring weekly focus
          color: focus.color,
          startTime: "00:00", // All day placeholder
          endTime: "23:59"
        });
      }

      // 3. Add Tasks
      // We need to calculate the actual date for these tasks based on the CURRENT VIEWED WEEK
      for (const task of data.tasks) {
        // Find the date object for this task's day index in the current view
        const taskDate = weekDays[task.dayIndex];
        if (taskDate) {
          await addTask({
            text: task.text,
            completed: false,
            dueDate: taskDate.toISOString(),
            priority: 'Medium'
          });
        }
      }

      addToast(`Imported schedule successfully!`, 'success');
    } catch (err) {
      console.error(err);
      addToast("Import failed", "error");
    }
  };

  const getEventStyle = (event) => {
    switch (event.color) {
      case 'blue': return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'purple': return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      case 'yellow': return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
      case 'emerald': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'orange': return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
      case 'indigo': return 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400';
      case 'slate': return 'bg-white/5 border-white/10 text-white/40 dashed-border';
      default: return 'bg-white/10 border-white/20 text-white';
    }
  };

  const handleMarkdownDrop = (e) => {
    e.preventDefault();
    setImporting(true);
  };

  return (
    <div
      className="flex flex-col h-full w-full overflow-hidden relative p-8 lg:p-10"
      onDragOver={(e) => {
        e.preventDefault();
        if (!importing) setImporting(true);
      }}
    >
      {importing && (
        <ScheduleImporter
          onImport={handleImport}
          onClose={() => setImporting(false)}
        />
      )}

      {/* Header - Floating Glass */}
      <div className="flex-none p-6 mb-6 flex items-center justify-between glass-panel rounded-3xl z-20">
        <div>
          <h1 className="text-3xl font-medium text-white mb-1 tracking-tight text-glow">Schedule</h1>
          <p className="text-xs text-white/50 font-medium uppercase tracking-widest pl-0.5">
            {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-black/20 p-1 rounded-xl border border-white/10 backdrop-blur-md">
            <button
              onClick={() => navigateWeek(-1)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-4 text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              Today
            </button>
            <button
              onClick={() => navigateWeek(1)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          <button
            onClick={() => setImporting(true)}
            className="p-3 glass-item rounded-xl text-white/70 hover:text-white transition-all group"
            title="Import Schedule"
          >
            <CalendarIcon size={18} />
          </button>
        </div>
      </div>

      {/* Calendar Grid - Floating Glass Panel */}
      <div className="flex-1 overflow-hidden flex flex-col relative glass-panel rounded-3xl backdrop-blur-2xl">
        {loading && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-20 backdrop-blur-sm">
            <div className="text-white/40 font-medium animate-pulse">Loading schedule...</div>
          </div>
        )}

        {/* Day Headers */}
        <div className="flex border-b border-white/10 bg-white/5">
          <div className="w-16 flex-none border-r border-white/10 bg-white/5" /> {/* Time column header */}
          {weekDays.map((date, i) => {
            const isToday = date.toDateString() === today.toDateString();
            const focus = getDailyFocus(date);

            return (
              <div key={i} className={`flex-1 py-4 text-center border-r border-white/5 last:border-r-0 ${isToday ? 'bg-white/[0.03]' : ''}`}>
                <div className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isToday ? 'text-blue-400' : 'text-white/40'}`}>
                  {date.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-xl font-light mb-2 ${isToday ? 'text-white scale-110 origin-bottom' : 'text-white/70'} transition-transform`}>
                  {date.getDate()}
                </div>

                {focus && (
                  <div className={`mx-auto inline-block px-2 py-0.5 rounded-full text-[9px] font-medium border ${focus.color === 'blue' ? 'border-blue-500/20 text-blue-300 bg-blue-500/10' :
                      focus.color === 'purple' ? 'border-purple-500/20 text-purple-300 bg-purple-500/10' :
                        'border-white/10 text-white/60 bg-white/5'
                    }`}>
                    {focus.title}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Scrollable Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-black/20">
          {/* Current Time Line */}
          {new Date().toDateString() === weekDays.find(d => d.toDateString() === new Date().toDateString())?.toDateString() && (
            <div
              className="absolute left-0 right-0 border-t border-red-500/50 z-20 pointer-events-none flex items-center shadow-[0_0_10px_rgba(239,68,68,0.4)]"
              style={{ top: '35%' }}
            >
              <div className="absolute left-0 -mt-[3px] w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_rgba(239,68,68,0.8)]"></div>
            </div>
          )}

          <div className="flex min-h-[600px]">
            {/* Time Labels */}
            <div className="w-16 flex-none flex flex-col border-r border-white/10 bg-white/5">
              {timeSlots.map((time) => (
                <div key={time} className="flex-1 h-20 text-[10px] text-white/30 font-medium pt-2 pr-2 text-right border-b border-white/5 relative">
                  <span className="-top-3 relative">{time}</span>
                </div>
              ))}
            </div>

            {/* Days Columns */}
            {weekDays.map((day, dayIndex) => (
              <div key={dayIndex} className="flex-1 flex flex-col border-r border-white/5 last:border-r-0 relative min-w-[120px] group">
                {/* Grid Lines */}
                {timeSlots.map((_, i) => (
                  <div key={i} className="flex-1 h-20 border-b border-white/5" />
                ))}

                {/* Events Logic - Render Events for this day */}
                {timeSlots.map((timeSlotText, hourIndex) => {
                  const hour24 = hourIndex + 8;
                  const dayEvents = getEventsForSlot(day, hour24);

                  return dayEvents.map(event => {
                    const start = parseInt(event.startTime.split(':')[0]);
                    const end = parseInt(event.endTime.split(':')[0]);
                    const duration = end - start;

                    // Calculate exact position based on start time relative to grid
                    const topPos = (start - 8) * 80; // 80px per hour
                    const height = duration * 80;

                    return (
                      <div
                        key={event.id}
                        className={`absolute left-1 right-1 z-10 p-2 rounded-xl glass-item border-l-2 text-xs overflow-hidden shadow-sm hover:scale-[1.02] hover:z-20 transition-all ${event.color === 'blue' ? 'border-blue-400' :
                            event.color === 'purple' ? 'border-purple-400' : 'border-white/50'
                          }`}
                        style={{
                          top: `${topPos}px`,
                          height: `${height - 4}px`, // -4 for margin
                        }}
                      >
                        <div className="font-semibold text-white truncate tracking-tight mb-0.5">{event.title}</div>
                        <div className="opacity-60 text-[10px] font-medium">{event.startTime} - {event.endTime}</div>
                      </div>
                    );
                  });
                })}

                {/* Simplified Events for demo if empty */}
                {/* Example Event purely for visual if no data */}
                {dayIndex === 1 && events.length === 0 && (
                  <div className="absolute top-20 left-1 right-1 h-32 rounded-xl glass-item p-3 border-l-2 border-blue-400 hover:scale-[1.02] transition-transform cursor-pointer group z-10">
                    <div className="text-xs font-semibold text-white mb-0.5 group-hover:text-blue-300 transition-colors">Deep Work</div>
                    <div className="text-[10px] text-white/50">10:00 AM - 12:00 PM</div>
                  </div>
                )}

                {/* Hover Add Button */}
                <button className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/[0.02] flex items-center justify-center transition-all z-0 cursor-copy pointer-events-none">
                  <Plus size={14} className="text-white/20" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
