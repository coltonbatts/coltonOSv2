import React, { useState, useEffect } from 'react';
import { auth, firebaseError, signInAnonymously, onAuthStateChanged } from './lib/firebase';
import Sidebar from './components/Sidebar';
import Dashboard from './views/Dashboard';
import ProjectsView from './views/ProjectsView';
import VaultView from './views/VaultView';
import ScheduleView from './views/ScheduleView';
import ProjectDetailView from './views/ProjectDetailView';
import { ToastProvider } from './context/ToastContext';

// ============================================
// ERROR SCREEN
// ============================================
function ErrorScreen({ error }) {
  return (
    <div className="h-screen w-screen bg-slate-950 flex items-center justify-center text-white p-8">
      <div className="max-w-md border border-red-500/50 bg-red-500/10 p-6 backdrop-blur-md">
        <h1 className="text-xl font-bold text-red-400 mb-4">System Error</h1>
        <p className="text-sm text-white/80 mb-4">
          Firebase configuration is missing or invalid. Create a <code className="bg-black/30 px-1">.env</code> file with your Firebase credentials.
        </p>
        <pre className="text-xs font-mono bg-black/50 p-4 overflow-x-auto text-red-300 mb-4">
          {error.message}
        </pre>
        <div className="text-xs text-white/40 font-mono">
          Required variables:<br />
          VITE_FIREBASE_API_KEY<br />
          VITE_FIREBASE_AUTH_DOMAIN<br />
          VITE_FIREBASE_PROJECT_ID<br />
          VITE_FIREBASE_STORAGE_BUCKET<br />
          VITE_FIREBASE_MESSAGING_SENDER_ID<br />
          VITE_FIREBASE_APP_ID
        </div>
      </div>
    </div>
  );
}

// ============================================
// LOADING SCREEN
// ============================================
function LoadingScreen() {
  return (
    <div className="h-screen w-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border border-white/20 flex items-center justify-center mb-4 mx-auto">
          <div className="w-6 h-6 border-t border-white/60 animate-spin" />
        </div>
        <div className="text-white/40 font-mono text-sm uppercase tracking-widest">
          Initializing System...
        </div>
      </div>
    </div>
  );
}

// ============================================
// MAIN APP
// ============================================
function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setLoading(false);
      } else {
        signInAnonymously(auth)
          .then(() => {
            // onAuthStateChanged will fire again with the new user
          })
          .catch((error) => {
            console.error("Auth Error:", error);
            setAuthError(error);
            setLoading(false);
          });
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle Firebase configuration error
  if (firebaseError) {
    return <ErrorScreen error={firebaseError} />;
  }

  // Handle Authentication error
  if (authError) {
    return <ErrorScreen error={authError} />;
  }

  // Show loading while authenticating
  if (loading) {
    return <LoadingScreen />;
  }

  // Render active view
  const renderView = () => {
    const viewName = typeof activeTab === 'string' ? activeTab : activeTab.view;
    const viewProps = typeof activeTab === 'object' ? activeTab : {};

    switch (viewName) {
      case 'dashboard':
        return <Dashboard uid={user?.uid} onNavigate={setActiveTab} />;
      case 'projects':
        return <ProjectsView uid={user?.uid} />;
      case 'vault':
        return <VaultView uid={user?.uid} initialState={viewProps} />;
      case 'schedule':
        return <ScheduleView uid={user?.uid} />;
      case 'project-detail':
        return (
          <ProjectDetailView
            uid={user?.uid}
            projectId={viewProps.id}
            onBack={() => setActiveTab('projects')}
          />
        );
      default:
        return <Dashboard uid={user?.uid} onNavigate={setActiveTab} />;
    }
  };

  return (
    <ToastProvider>
      <div className="flex h-screen w-screen bg-black overflow-hidden selection:bg-blue-500/30 selection:text-white font-[system-ui] relative">
        {/* === AMBIENT ENVIRONMENT BACKGROUND === */}
        <div className="fixed inset-0 pointer-events-none bg-[#050505]">
          {/* Top Right - Blue/Purple */}
          <div className="ambient-blob w-[800px] h-[800px] bg-blue-600/20 top-[-200px] right-[-200px] rounded-full blur-[120px]" />
          {/* Bottom Left - Purple/Pink */}
          <div className="ambient-blob w-[600px] h-[600px] bg-purple-600/10 bottom-[-100px] left-[-100px] rounded-full blur-[100px] animation-delay-2000" />
          {/* Top Left - Subtle Cyan */}
          <div className="ambient-blob w-[400px] h-[400px] bg-cyan-900/10 top-[-100px] left-[200px] rounded-full blur-[80px]" />
        </div>

        {/* Sidebar */}
        <Sidebar activeTab={typeof activeTab === 'string' ? activeTab : activeTab.view} setActiveTab={setActiveTab} />

        {/* Main Content - No solid background, letting glass shine through */}
        <main className="flex-1 relative z-10 h-full overflow-hidden flex flex-col my-4 mr-4 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-sm bg-black/10">
          {renderView()}
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;
