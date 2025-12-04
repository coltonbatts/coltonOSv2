import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
}

export function ToastProvider({ children }) {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now().toString();
        setToasts(prev => [...prev, { id, message, type }]);

        if (duration) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast, removeToast }}>
            {children}
            <div className="fixed bottom-8 right-8 z-50 flex flex-col gap-2 pointer-events-none">
                {toasts.map(toast => (
                    <div
                        key={toast.id}
                        className={`
              pointer-events-auto min-w-[300px] p-4 border backdrop-blur-md shadow-lg flex items-start gap-3 animate-in slide-in-from-right-full duration-300
              ${toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-200' : ''}
              ${toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' : ''}
              ${toast.type === 'info' ? 'bg-blue-500/10 border-blue-500/20 text-blue-200' : ''}
            `}
                    >
                        {toast.type === 'success' && <CheckCircle size={20} className="text-emerald-400 shrink-0" />}
                        {toast.type === 'error' && <AlertCircle size={20} className="text-red-400 shrink-0" />}
                        {toast.type === 'info' && <Info size={20} className="text-blue-400 shrink-0" />}

                        <div className="flex-1 text-sm font-light">{toast.message}</div>

                        <button
                            onClick={() => removeToast(toast.id)}
                            className="opacity-50 hover:opacity-100 transition-opacity"
                        >
                            <X size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}
