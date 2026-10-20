import React from 'react';
import { ToastMessage } from '../store/useStore';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

interface ToastContainerProps {
  toasts: ToastMessage[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-11/12 max-w-sm pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all transform animate-in fade-in slide-in-from-bottom-2 ${
            toast.type === 'success'
              ? 'bg-[#1C1917] text-white border border-[#C5A059]/40'
              : toast.type === 'error'
              ? 'bg-[#53121C] text-white border border-rose-400/40'
              : 'bg-[#292524] text-white border border-stone-600'
          }`}
        >
          {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-[#C5A059] shrink-0" />}
          {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />}
          {toast.type === 'info' && <Info className="w-4 h-4 text-stone-300 shrink-0" />}
          <span className="flex-1">{toast.message}</span>
        </div>
      ))}
    </div>
  );
};
