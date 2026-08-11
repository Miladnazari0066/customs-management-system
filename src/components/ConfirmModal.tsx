import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  text: string;
  okLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  text,
  okLabel = 'تأیید',
  cancelLabel = 'انصراف',
  onConfirm,
  onCancel,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="w-full max-w-md glass-panel p-6 shadow-2xl rounded-2xl border-white/10"
          >
            <h3 className="font-lalezar text-xl font-normal text-slate-100 flex items-center gap-2 mb-3">
              <HelpCircle className="w-5 h-5 text-amber-400" />
              {title}
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-6">{text}</p>
            <div className="flex gap-3">
              <button
                onClick={onConfirm}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-sm hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20"
              >
                {okLabel}
              </button>
              <button
                onClick={onCancel}
                className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 text-slate-300 hover:text-slate-100 hover:border-white/20 transition-colors text-sm font-semibold backdrop-blur-md"
              >
                {cancelLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
