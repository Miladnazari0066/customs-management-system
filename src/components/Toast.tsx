import React from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertTriangle, Info, XCircle } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'ok' | 'err' | 'info';
  text: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border text-sm shadow-xl glass-panel ${
              t.type === 'ok'
                ? 'border-emerald-500/50 text-slate-100 border-r-4 border-r-emerald-400'
                : t.type === 'err'
                ? 'border-rose-500/50 text-slate-100 border-r-4 border-r-rose-400'
                : 'border-cyan-400/50 text-slate-100 border-r-4 border-r-cyan-400'
            }`}
          >
            {t.type === 'ok' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />}
            {t.type === 'err' && <XCircle className="w-5 h-5 text-rose-400 shrink-0" />}
            {t.type === 'info' && <Info className="w-5 h-5 text-cyan-400 shrink-0" />}
            <span className="flex-1 leading-relaxed font-medium">{t.text}</span>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-slate-400 hover:text-slate-100 transition-colors"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
