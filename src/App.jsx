import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Database,
  Calendar,
  Plus,
  Trash2,
  Save,
  Terminal,
  Activity
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
  doc,
  setDoc,
  query,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// --- COMPONENTS ---

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'projects', icon: FolderKanban, label: 'Projects' },
    { id: 'vault', icon: Database, label: 'Asset Vault' },
    { id: 'schedule', icon: Calendar, label: 'Schedule' },
  ];

  return (
    <div className="w-20 h-full border-r border-white/10 flex flex-col items-center py-8 bg-slate-950/50 backdrop-blur-sm">
      <div className="mb-12">
        <div className="w-10 h-10 bg-white/5 rounded-none border border-white/20 flex items-center justify-center">
          <Terminal size={20} className="text-white/80" />
        </div>
      </div>
      <div className="flex flex-col gap-8">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`group relative p-3 transition-all duration-300 ${activeTab === item.id ? 'text-white' : 'text-white/40 hover:text-white/70'
              }`}
          >
            <item.icon size={24} strokeWidth={1.5} />
            {activeTab === item.id && (
              <div className="absolute right-0 top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
            )}
            <span className="absolute left-14 bg-slate-900 border border-white/10 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none">
              {item.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

const Clock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="font-mono">
      <div className="text-6xl font-light tracking-tighter text-white">
        {time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit' })}
      </div>
      <div className="text-sm text-white/40 mt-1 tracking-widest uppercase">
        {time.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
    </div>
  );
};

const TaskWidget = ({ uid }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, `users/${uid}/tasks`), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching tasks:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [uid]);

  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim() || !uid) return;
    try {
      await addDoc(collection(db, `users/${uid}/tasks`), {
        text: newTask,
        completed: false,
        createdAt: new Date().toISOString()
      });
      setNewTask('');
    } catch (error) {
      console.error("Error adding task:", error);
      alert("Failed to add task. Check Firebase config.");
    }
  };

  const deleteTask = async (id) => {
    try {
      await deleteDoc(doc(db, `users/${uid}/tasks`, id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white/5 border border-white/10 p-6 backdrop-blur-md relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold tracking-widest uppercase text-white/70">Inbox / Tasks</h3>
        <Activity size={14} className="text-white/40 animate-pulse" />
      </div>

      <form onSubmit={addTask} className="mb-6 relative">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New directive..."
          className="w-full bg-black/20 border-b border-white/10 py-2 pr-8 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/50 transition-colors font-mono"
        />
        <button
          type="submit"
          className="absolute right-0 top-2 text-white/40 hover:text-white transition-colors"
        >
          <Plus size={16} />
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
        {loading ? (
          <div className="text-xs text-white/30 font-mono">Initializing uplink...</div>
        ) : tasks.length === 0 ? (
          <div className="text-xs text-white/30 font-mono">No active directives.</div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="group/item flex items-center justify-between py-2 border-b border-white/5 hover:bg-white/5 px-2 transition-colors">
              <span className="text-sm text-white/80 font-light">{task.text}</span>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-white/20 hover:text-red-400 opacity-0 group-hover/item:opacity-100 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const Scratchpad = ({ uid }) => {
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!uid) return;
    const unsubscribe = onSnapshot(doc(db, `users/${uid}/notes`, 'scratchpad'), (doc) => {
      if (doc.exists()) {
        setNote(doc.data().content);
      }
    });
    return () => unsubscribe();
  }, [uid]);

  const saveNote = async (content) => {
    setNote(content);
    if (!uid) return;
    setSaving(true);
    try {
      await setDoc(doc(db, `users/${uid}/notes`, 'scratchpad'), {
        content,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error saving note:", error);
    } finally {
      setTimeout(() => setSaving(false), 500);
    }
  };

  return (
    <div className="h-full flex flex-col bg-white/5 border border-white/10 p-6 backdrop-blur-md relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold tracking-widest uppercase text-white/70">Scratchpad</h3>
        {saving ? (
          <Save size={14} className="text-white/40 animate-pulse" />
        ) : (
          <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
        )}
      </div>

      <textarea
        value={note}
        onChange={(e) => saveNote(e.target.value)}
        placeholder="Type to decrypt thoughts..."
        className="flex-1 w-full bg-transparent resize-none focus:outline-none text-sm text-white/80 font-mono leading-relaxed placeholder-white/20 custom-scrollbar"
        spellCheck="false"
      />
    </div>
  );
};

const Dashboard = ({ uid }) => {
  return (
    <div className="h-full p-12 grid grid-cols-12 grid-rows-6 gap-6">
      {/* Header Section */}
      <div className="col-span-12 row-span-1 flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-light text-white mb-2">Welcome back, Colton.</h1>
          <div className="flex items-center gap-2 text-xs text-white/40 font-mono uppercase tracking-widest">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            System Online
            <span className="mx-2">|</span>
            v0.1.0 Alpha
          </div>
        </div>
        <Clock />
      </div>

      {/* Main Content Area */}
      <div className="col-span-8 row-span-5 grid grid-rows-2 gap-6">
        <div className="bg-white/5 border border-white/10 p-8 backdrop-blur-md flex items-center justify-center text-white/20 font-mono text-sm uppercase tracking-widest">
          Project Overview Visualization [Placeholder]
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white/5 border border-white/10 p-6 backdrop-blur-md flex items-center justify-center text-white/20 font-mono text-sm uppercase tracking-widest">
            System Metrics
          </div>
          <div className="bg-white/5 border border-white/10 p-6 backdrop-blur-md flex items-center justify-center text-white/20 font-mono text-sm uppercase tracking-widest">
            Recent Activity
          </div>
        </div>
      </div>

      {/* Side Widgets */}
      <div className="col-span-4 row-span-5 grid grid-rows-2 gap-6">
        <TaskWidget uid={uid} />
        <Scratchpad uid={uid} />
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        signInAnonymously(auth).catch((error) => {
          console.error("Auth Error:", error);
        });
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex h-screen w-screen bg-slate-950 overflow-hidden selection:bg-white/20 selection:text-white">
      {/* Background Grid Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }}
      />

      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="flex-1 relative z-10">
        {activeTab === 'dashboard' && <Dashboard uid={user?.uid} />}
        {activeTab !== 'dashboard' && (
          <div className="h-full flex items-center justify-center text-white/20 font-mono text-xl uppercase tracking-widest">
            Module: {activeTab} [Offline]
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
