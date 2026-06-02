import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';

const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prevToasts) => [...prevToasts, { id, message, type }]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-3 max-w-md w-full sm:w-96">
        {toasts.map((toast) => {
          let bgColor = 'bg-slate-800 border-slate-700 text-slate-100';
          let Icon = Info;
          let iconColor = 'text-brand-400';

          if (toast.type === 'success') {
            bgColor = 'bg-slate-900/90 border-emerald-500/30 text-slate-100';
            Icon = CheckCircle;
            iconColor = 'text-emerald-400';
          } else if (toast.type === 'error') {
            bgColor = 'bg-slate-900/90 border-rose-500/30 text-slate-100';
            Icon = AlertCircle;
            iconColor = 'text-rose-400';
          } else if (toast.type === 'warning') {
            bgColor = 'bg-slate-900/90 border-amber-500/30 text-slate-100';
            Icon = AlertTriangle;
            iconColor = 'text-amber-400';
          }

          return (
            <div
              key={toast.id}
              className={`flex items-start gap-3 p-4 rounded-xl border glass-panel shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 animate-slide-in`}
              style={{
                animation: 'slideIn 0.2s ease-out forwards',
              }}
            >
              <div className={`mt-0.5 shrink-0 ${iconColor}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 text-sm font-medium pr-2">
                {toast.message}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="shrink-0 text-slate-400 hover:text-slate-200 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add keyframe style tag */}
      <style>{`
        @keyframes slideIn {
          from {
            transform: translateY(1rem);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </ToastContext.Provider>
  );
};
