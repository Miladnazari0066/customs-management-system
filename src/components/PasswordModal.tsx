import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, KeyRound } from 'lucide-react';

interface PasswordModalProps {
  isOpen: boolean;
  message: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const PasswordModal: React.FC<PasswordModalProps> = ({
  isOpen,
  message,
  onSuccess,
  onCancel,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
      setShake(false);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim().toLowerCase() === 'milad') {
      onSuccess();
    } else {
      setError('رمز مدیریت اشتباه است (راهنما: milad)');
      setShake(true);
      setPassword('');
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className={`w-full max-w-md glass-panel p-6 shadow-2xl rounded-2xl border-white/10 ${
              shake ? 'animate-shake' : ''
            }`}
          >
            <h3 className="font-lalezar text-xl font-normal text-slate-100 flex items-center gap-2 mb-2">
              <Lock className="w-5 h-5 text-amber-400" />
              رمز دسترسی مدیریتی
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed mb-4">{message}</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <KeyRound className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="رمز دسترسی مدیریت را وارد کنید"
                  autoFocus
                  className="glass-input w-full py-3 pr-10 pl-4 text-center ltr tracking-wider"
                />
              </div>

              {error && (
                <p className="text-xs text-rose-400 font-medium text-center">{error}</p>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-sm hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20"
                >
                  تأیید رمز
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-white/10 text-slate-300 hover:text-slate-100 hover:border-white/20 transition-colors text-sm font-semibold backdrop-blur-md"
                >
                  انصراف
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
