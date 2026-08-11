import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, KeyRound, Cpu, Layers, Sparkles } from 'lucide-react';
import { fa } from '../utils/jalali';

interface LoginGateProps {
  onSuccess: () => void;
}

const ACCESS_CODE = '09159880572';

export const LoginGate: React.FC<LoginGateProps> = ({ onSuccess }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isAccessGranted, setIsAccessGranted] = useState(false);
  const [shake, setShake] = useState(false);

  // Handle typing code
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
    setCode(val);
    setError('');

    // Auto submit when 11 digits typed
    if (val.length === 11) {
      if (val === ACCESS_CODE) {
        triggerSuccess();
      } else {
        setError('کد دسترسی نا معتبر می‌باشد.');
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code === ACCESS_CODE) {
      triggerSuccess();
    } else {
      setError('کد دسترسی نا معتبر می‌باشد.');
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const triggerSuccess = () => {
    setIsAccessGranted(true);

    // Strictly 3 seconds (3000ms) delay as requested
    setTimeout(() => {
      onSuccess();
    }, 3000);
  };

  const correctCount = code.split('').filter((char, idx) => char === ACCESS_CODE[idx]).length;
  const hasErrors = code.split('').some((char, idx) => char !== ACCESS_CODE[idx]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#05070d] select-none text-slate-100 font-vazir dir-rtl">
      {/* 3D Horizon Grid Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,_var(--tw-gradient-stops))] from-cyan-950/40 via-[#05070d] to-[#020305]" />
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(6, 182, 212, 0.25) 1px, transparent 1px), linear-gradient(to bottom, rgba(6, 182, 212, 0.25) 1px, transparent 1px)`,
          backgroundSize: '40px 40px',
          transform: 'perspective(600px) rotateX(65deg) translateY(-80px) scale(2.2)'
        }}
      />

      {/* Floating 3D Depth Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/6 w-64 h-64 rounded-full bg-cyan-500/10 blur-[100px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/6 w-80 h-80 rounded-full bg-amber-500/10 blur-[120px] animate-pulse" />
      </div>

      {/* RETRACTABLE 3D HYDRAULIC CUSTOMS DOORS (LEFT & RIGHT PANELS) */}
      <motion.div
        initial={false}
        animate={isAccessGranted ? { x: '-102%', rotateY: -15 } : { x: 0, rotateY: 0 }}
        transition={{ duration: 1.4, ease: [0.77, 0, 0.175, 1], delay: 0.8 }}
        className="absolute top-0 bottom-0 left-0 w-[50.5%] z-30 bg-gradient-to-r from-[#0a0e17] via-[#0d1320] to-[#080c14] border-r-2 border-cyan-500/30 flex flex-col justify-between p-6 pointer-events-none shadow-[20px_0_50px_rgba(0,0,0,0.9)]"
        style={{ perspective: '1000px' }}
      >
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full transition-all duration-500 ${
            isAccessGranted 
              ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)] animate-pulse' 
              : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'
          }`} />
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            CUSTOMS BARRIER - SECTOR WEST
          </span>
        </div>
        <div className="text-[9px] text-slate-600 font-mono">PORT TERMINAL GATE #01</div>
      </motion.div>

      <motion.div
        initial={false}
        animate={isAccessGranted ? { x: '102%', rotateY: 15 } : { x: 0, rotateY: 0 }}
        transition={{ duration: 1.4, ease: [0.77, 0, 0.175, 1], delay: 0.8 }}
        className="absolute top-0 bottom-0 right-0 w-[50.5%] z-30 bg-gradient-to-l from-[#0a0e17] via-[#0d1320] to-[#080c14] border-l-2 border-cyan-500/30 flex flex-col justify-between p-6 pointer-events-none shadow-[-20px_0_50px_rgba(0,0,0,0.9)]"
        style={{ perspective: '1000px' }}
      >
        <div className="flex items-center justify-end gap-2">
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            CONTROL UNIT #402
          </span>
          <span className={`w-3 h-3 rounded-full transition-all duration-500 ${
            isAccessGranted 
              ? 'bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,1)] animate-pulse' 
              : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'
          }`} />
        </div>
        <div className="text-[9px] text-slate-600 font-mono text-left">CUSTOMS BARRIER - SECTOR EAST</div>
      </motion.div>

      {/* CENTRAL 3D FLOATING CARD MODAL */}
      <div className="relative z-40 w-full max-w-[400px] mx-4 px-2" style={{ perspective: '1200px' }}>
        <AnimatePresence mode="wait">
          {!isAccessGranted ? (
            /* MINIMALIST SLEEK 3D LOGIN CARD */
            <motion.div
              key="login-card"
              initial={{ opacity: 0, scale: 0.92, rotateX: 10, y: 20 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, rotateX: -10, y: -30 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`bg-slate-900/85 backdrop-blur-3xl border border-white/15 rounded-3xl p-6 sm:p-7 text-center shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] shadow-black/90 overflow-hidden ${
                shake ? 'animate-shake' : ''
              }`}
            >
              {/* Header Badge as requested: "ورود خروج کالا در گمرک" */}
              <div className="flex items-center justify-center gap-1.5 mb-5">
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  <span>ورود خروج کالا در گمرک</span>
                </div>
              </div>

              {/* Sleek 3D Metallic Emblem */}
              <div className="relative w-20 h-20 mx-auto mb-4" style={{ transformStyle: 'preserve-3d' }}>
                <div className={`absolute inset-0 rounded-2xl blur-xl transition-colors duration-500 ${
                  hasErrors ? 'bg-rose-500/40' : code.length === 11 ? 'bg-emerald-500/40' : 'bg-cyan-500/30'
                }`} />
                <div className="relative w-full h-full rounded-2xl bg-gradient-to-tr from-slate-800 via-slate-900 to-slate-800 border border-white/20 p-0.5 shadow-2xl flex items-center justify-center">
                  <div className="w-full h-full bg-[#080c14] rounded-[14px] flex flex-col items-center justify-center text-cyan-400 shadow-inner">
                    <KeyRound className={`w-9 h-9 transition-colors duration-300 ${
                      hasErrors ? 'text-rose-400' : code.length === 11 ? 'text-emerald-400' : 'text-cyan-400'
                    }`} />
                  </div>
                </div>
              </div>

              <h1 className="font-lalezar text-2xl sm:text-3xl font-normal text-slate-100 tracking-wide">
                گیت بازرسی اپراتور
              </h1>
              <p className="text-xs text-slate-400 mt-1 font-medium">
                کد دسترسی ۱۱ رقمی را وارد کنید
              </p>

              {/* Password Input & Real-Time Dot Verification */}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="relative">
                  <input
                    type="password"
                    inputMode="numeric"
                    maxLength={11}
                    value={code}
                    onChange={handleInput}
                    placeholder="•••••••••••"
                    autoFocus
                    className={`w-full bg-slate-950/80 border rounded-2xl py-3.5 px-4 text-center ltr tracking-[0.38em] text-xl font-bold outline-none transition-all shadow-inner ${
                      hasErrors
                        ? 'border-rose-500/60 text-rose-400 bg-rose-950/20 focus:ring-2 focus:ring-rose-500/30'
                        : code.length === 11
                        ? 'border-emerald-500/60 text-emerald-400 bg-emerald-950/20'
                        : 'border-white/20 text-cyan-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20'
                    }`}
                  />
                </div>

                {/* Real-time Smart Dot Indicators (Green for correct, Red for incorrect at position) */}
                <div className="space-y-1.5 my-3">
                  <div className="flex justify-center gap-1.5 sm:gap-2 ltr">
                    {Array.from({ length: 11 }).map((_, i) => {
                      const isTyped = i < code.length;
                      const isCorrect = isTyped && code[i] === ACCESS_CODE[i];

                      return (
                        <div
                          key={i}
                          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full transition-all duration-300 ${
                            !isTyped
                              ? 'bg-slate-800/90 border border-white/10 scale-90'
                              : isCorrect
                              ? 'bg-emerald-400 border border-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.9)] scale-110'
                              : 'bg-rose-500 border border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.9)] scale-110'
                          }`}
                          title={`رقم ${fa(i + 1)}`}
                        />
                      );
                    })}
                  </div>

                  {code.length > 0 && (
                    <div className="flex items-center justify-between text-[11px] px-1 font-medium">
                      <span className="text-slate-400">
                        {fa(code.length)} از {fa(11)} رقم
                      </span>
                      {hasErrors ? (
                        <span className="text-rose-400 font-bold">
                          {fa(code.length - correctCount)} رقم نامعتبر
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-bold">
                          {fa(correctCount)} رقم صحیح
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-1.5 text-xs text-rose-300 bg-rose-500/15 border border-rose-500/30 py-2.5 px-3 rounded-2xl font-medium shadow-md"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={code.length === 0}
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-500 to-blue-600 text-slate-950 font-black text-sm hover:from-cyan-300 hover:to-blue-500 transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
                >
                  <span>ورود به سامانه</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          ) : (
            /* SLEEK 3-SECOND LOADING STATE AS REQUESTED: "در حال اجرای برنامه..." */
            <motion.div
              key="loading-card"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="bg-slate-900/90 border border-emerald-500/40 backdrop-blur-3xl rounded-3xl p-8 text-center shadow-[0_25px_60px_-15px_rgba(16,185,129,0.3)] text-slate-100 space-y-6"
            >
              {/* Animated Bouncing 3D Shield */}
              <div className="relative w-20 h-20 mx-auto">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-xl animate-ping" />
                <div className="relative w-full h-full rounded-full bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.6)]">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
              </div>

              <div>
                <span className="inline-block px-3.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 mb-2">
                  مجوز دسترسی صادر شد
                </span>
                <h2 className="font-lalezar text-2xl text-slate-100 tracking-wide">
                  در حال اجرای برنامه...
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  بارگیری داده‌ها و راهبندهای پایانه گمرکی
                </p>
              </div>

              {/* 3-Second Progress Bar (3000ms) */}
              <div className="space-y-2">
                <div className="w-full bg-slate-950 h-2.5 rounded-full overflow-hidden p-0.5 border border-emerald-500/30">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 3, ease: 'easeInOut' }}
                    className="h-full bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 rounded-full shadow-[0_0_15px_rgba(52,211,153,0.9)]"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
