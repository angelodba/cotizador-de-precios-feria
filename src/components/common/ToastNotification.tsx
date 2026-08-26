import React from 'react';
import { Sparkles } from 'lucide-react';

interface ToastNotificationProps {
  message: string | null;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div 
      role="status" 
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900/95 dark:bg-[#0f172a]/95 border border-indigo-500/50 text-white px-4 py-3 rounded-xl shadow-2xl animate-fade-in-scale text-xs sm:text-sm font-bold backdrop-blur-xl"
    >
      <Sparkles size={18} className="text-indigo-400 animate-pulse flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};
