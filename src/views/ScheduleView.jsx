import ScheduleImporter from '../components/ScheduleImporter';
import { Calendar, Clock, Plus, Upload, CheckCircle2 } from 'lucide-react';
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
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM

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

  return (
    <div
      className="h-full p-8 lg:p-12 flex flex-col gap-6 relative"
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

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-3xl lg:text-4xl font-light text-white mb-2 flex items-center gap-3">
            <Calendar size={32} strokeWidth={1.5} className="text-white/60" />
            Schedule
          </h1>
          <div className="flex items-center gap-2 text-xs text-white/40 font-mono uppercase tracking-widest">
            <span className="w-2 h-2 bg-yellow-500 rounded-full" />
            Week View
            <span className="mx-2 text-white/20">|</span>
            {/* Week navigation controls */}
            <button onClick={() => navigateWeek(-1)} className="hover:text-white transition-colors">{'<'}</button>
            <span>{startOfWeek.toLocaleDateString([], { month: 'short', day: 'numeric' })} - {weekDays[6].toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            <button onClick={() => navigateWeek(1)} className="hover:text-white transition-colors">{'>'}</button>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 font-mono text-sm hover:text-white hover:border-white/30 transition-all"
          >
            Today
          </button>
          <button
            onClick={() => setImporting(true)}
            className="px-4 py-2 bg-white/5 border border-white/10 text-white/60 font-mono text-sm hover:text-white hover:border-white/30 transition-all flex items-center gap-2"
          >
            <Upload size={14} />
            Import Schedule
          </button>
          <button className="bg-white text-black px-4 py-2 font-mono text-sm uppercase tracking-wider hover:bg-white/90 transition-colors flex items-center gap-2">
            <Plus size={16} /> Add Event
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden flex flex-col bg-white/5 border border-white/10 relative">
        {loading && (
          <div className="absolute inset-0 bg-slate-950/50 flex items-center justify-center z-10 backdrop-blur-sm">
            <div className="text-white/30 font-mono animate-pulse">Loading schedule...</div>
          </div>
        )}

        {/* Day Headers */}
        <div className="grid grid-cols-8 border-b border-white/10">
          <div className="p-3 text-xs text-white/20 font-mono border-r border-white/5"></div>
          {weekDays.map((date, i) => {
            const isToday = date.toDateString() === today.toDateString();
            const focus = getDailyFocus(date);

            return (
              <div
                key={i}
                className={`p-3 text-center border-r border-white/5 last:border-r-0 ${isToday ? 'bg-white/5' : ''}`}
              >
                <div className="text-xs text-white/40 font-mono uppercase mb-1">{dayNames[i]}</div>
                <div className={`text-xl font-light mb-2 ${isToday ? 'text-white' : 'text-white/60'}`}>
                  {date.getDate()}
                </div>
                {focus && (
                  <div className={`text-[10px] font-mono uppercase tracking-wider py-1 px-2 border rounded ${focus.color === 'blue' ? 'border-blue-500/30 text-blue-400 bg-blue-500/10' :
                    focus.color === 'purple' ? 'border-purple-500/30 text-purple-400 bg-purple-500/10' :
                      focus.color === 'yellow' ? 'border-yellow-500/30 text-yellow-400 bg-yellow-500/10' :
                        focus.color === 'orange' ? 'border-orange-500/30 text-orange-400 bg-orange-500/10' :
                          focus.color === 'emerald' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' :
                            'border-white/20 text-white/40'
                    }`}>
                    {focus.title}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Time Grid */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {hours.map((hour) => (
            <div key={hour} className="grid grid-cols-8 border-b border-white/5 min-h-[80px]">
              {/* Time Label */}
              <div className="p-2 text-xs text-white/20 font-mono text-right pr-3 border-r border-white/5">
                {hour > 12 ? hour - 12 : hour}{hour >= 12 ? 'PM' : 'AM'}
              </div>

              {/* Days */}
              {weekDays.map((date, i) => {
                const dayEvents = getEventsForSlot(date, hour);
                const isToday = date.toDateString() === today.toDateString();

                return (
                  <div
                    key={i}
                    className={`border-r border-white/5 last:border-r-0 relative group ${isToday ? 'bg-white/[0.02]' : ''}`}
                  >
                    {/* Render Events */}
                    {dayEvents.map(event => {
                      // Calculate simplistic height based on duration (assuming whole hours for now from seed)
                      // In a real app, this would be pixel math based on start/end timestamps
                      const start = parseInt(event.startTime.split(':')[0]);
                      const end = parseInt(event.endTime.split(':')[0]);
                      const duration = end - start;
                      // Determine if we should render the block here (only if it matches start hour)
                      if (start !== hour) return null;

                      return (
                        <div
                          key={event.id}
                          className={`absolute inset-x-1 top-1 z-10 p-2 rounded-sm border text-xs font-mono overflow-hidden ${getEventStyle(event)}`}
                          style={{
                            height: `calc(${duration * 100}% + ${duration * 1}px - 8px)`,
                            minHeight: '40px'
                          }}
                        >
                          <div className="font-bold truncate">{event.title}</div>
                          <div className="opacity-60">{event.startTime}-{event.endTime}</div>
                        </div>
                      );
                    })}

                    {/* Hover Add Button */}
                    <button className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-white/5 flex items-center justify-center transition-all z-0">
                      <Plus size={14} className="text-white/40" />
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
