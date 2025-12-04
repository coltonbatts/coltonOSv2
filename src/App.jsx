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
let app, db, auth;
let firebaseError = null;
try {
  if (!firebaseConfig.apiKey) throw new Error("Missing API Key");
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  auth = getAuth(app);
} catch (error) {
  console.error("App.jsx: Firebase initialization failed:", error);
  firebaseError = error;
}

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
    if (!uid || !db) return;
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
    if (!newTask.trim() || !uid || !db) return;
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
    if (!db) return;
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
    if (!uid || !db) return;
    const unsubscribe = onSnapshot(doc(db, `users/${uid}/notes`, 'scratchpad'), (doc) => {
      if (doc.exists()) {
        setNote(doc.data().content);
      }
    });
    return () => unsubscribe();
  }, [uid]);

  const saveNote = async (content) => {
    setNote(content);
    if (!uid || !db) return;
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

const ProjectsView = ({ uid }) => {
  const [projects, setProjects] = useState([]);
  const [newProject, setNewProject] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid || !db) return;
    const q = query(collection(db, `users/${uid}/projects`), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      console.error("Error fetching projects:", error);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [uid]);

  const addProject = async (e) => {
    e.preventDefault();
    if (!newProject.trim() || !uid || !db) return;
    try {
      await addDoc(collection(db, `users/${uid}/projects`), {
        title: newProject,
        status: 'Active',
        progress: 0,
        createdAt: new Date().toISOString()
      });
      setNewProject('');
    } catch (error) {
      console.error("Error adding project:", error);
    }
  };

  const deleteProject = async (id) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, `users/${uid}/projects`, id));
    } catch (error) {
      console.error("Error deleting project:", error);
    }
  };

  const updateProjectStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Done' : 'Active';
    const newProgress = newStatus === 'Done' ? 100 : 0;
    if (!db) return;
    try {
      await setDoc(doc(db, `users/${uid}/projects`, id), {
        status: newStatus,
        progress: newProgress
      }, { merge: true });
    } catch (error) {
      console.error("Error updating project:", error);
    }
  };


  return (
    <div className="h-full p-12 flex flex-col gap-8">
      <div className="flex items-end justify-between border-b border-white/10 pb-6">
        <div>
          <h1 className="text-4xl font-light text-white mb-2">Projects</h1>
          <div className="flex items-center gap-2 text-xs text-white/40 font-mono uppercase tracking-widest">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            Active Workflows
          </div>
        </div>
        <form onSubmit={addProject} className="flex gap-4">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto custom-scrollbar pr-2">
        {loading ? (
          <div className="col-span-full text-center text-white/30 font-mono animate-pulse">Loading Projects...</div>
        ) : projects.length === 0 ? (
          <div className="col-span-full text-center text-white/30 font-mono">No active projects found. Initialize new workflow.</div>
        ) : (
          projects.map(project => (
            <div key={project.id} className="bg-white/5 border border-white/10 p-6 backdrop-blur-md group hover:border-white/30 transition-all relative">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl text-white font-light">{project.title}</h3>
                <button
                  onClick={() => deleteProject(project.id)}
                  className="text-white/20 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => updateProjectStatus(project.id, project.status)}
                    className={`px-2 py-1 text-xs font-mono uppercase tracking-wider border ${project.status === 'Active'
                      ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10'
                      : 'border-white/20 text-white/40 bg-white/5'
                      } hover:opacity-80 transition-opacity`}
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
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- MAIN APP COMPONENT ---

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!auth) return;
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

  if (firebaseError) {
    return (
      <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-white p-8">
        <div className="max-w-md border border-red-500/50 bg-red-500/10 p-6 backdrop-blur-md">
          <h1 className="text-xl font-bold text-red-400 mb-4">System Error</h1>
          <p className="text-sm text-white/80 mb-4">
            Firebase configuration is missing or invalid. Please check your .env file.
          </p>
          <pre className="text-xs font-mono bg-black/50 p-4 overflow-x-auto text-red-300">
            {firebaseError.message}
          </pre>
        </div>
      </div>
    );
  }

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
        {activeTab === 'projects' && <ProjectsView uid={user?.uid} />}
        {activeTab !== 'dashboard' && activeTab !== 'projects' && (
          <div className="h-full flex items-center justify-center text-white/20 font-mono text-xl uppercase tracking-widest">
            Module: {activeTab} [Offline]
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
