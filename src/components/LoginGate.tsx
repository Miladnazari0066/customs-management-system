import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Lock, ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react';
import { fa } from '../utils/jalali';

interface LoginGateProps {
  onSuccess: () => void;
}

const ACCESS_CODE = '09159880572';

export const LoginGate: React.FC<LoginGateProps> = ({ onSuccess }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isAccessGranted, setIsAccessGranted] = useState(false);
  const [stepText, setStepText] = useState('تأیید کد دسترسی اپراتور...');
  const [shake, setShake] = useState(false);

  // Handle typing code
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 11);
    setCode(val);
    setError('');

    // Auto submit on 11 digits
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
    
    // 5-second dynamic sequence step text updates
    setTimeout(() => {
      setStepText('صدور مجوز ترخیص و بازرسی...');
    }, 1200);

    setTimeout(() => {
      setStepText('بازگشایی هیدرولیک گیت ورودی...');
    }, 2800);

    setTimeout(() => {
      setStepText('ورود به داشبورد گمرک...');
    }, 4200);

    // Call onSuccess after 5 seconds total
    setTimeout(() => {
      onSuccess();
    }, 5000);
  };

  const correctCount = code.split('').filter((char, idx) => char === ACCESS_CODE[idx]).length;
  const hasErrors = code.split('').some((char, idx) => char !== ACCESS_CODE[idx]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#07090e] select-none text-slate-100 font-vazir dir-rtl">
      {/* Sleek Minimal Background & Ambient Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900/90 via-[#07090e] to-[#030407]" />
      
      {/* Subtle Mesh Grid */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px)`,
          backgroundSize: '28px 28px'
        }}
      />

      {/* Ambient Radial Lighting */}
      <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none transition-colors duration-1000 ${
        isAccessGranted ? 'bg-emerald-500/20' : 'bg-cyan-500/15'
      }`} />

      {/* RETRACTABLE GATE DOORS (MINIMAL SLEEK SLIDING PANELS) */}
      <motion.div
        initial={false}
        animate={isAccessGranted ? { x: '-102%' } : { x: 0 }}
        transition={{ duration: 1.8, ease: [0.77, 0, 0.175, 1], delay: 1.5 }}
        className="absolute top-0 bottom-0 left-0 w-[50.5%] z-30 bg-[#080b12] border-r border-cyan-500/20 flex flex-col justify-between p-6 pointer-events-none shadow-2xl"
      >
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
            isAccessGranted 
              ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)] animate-pulse' 
              : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'
          }`} />
          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
            GATE BARRIER L
          </span>
        </div>
        <div className="text-[9px] text-slate-600 font-mono">PORT GATEWAY // SECTOR A</div>
      </motion.div>

      <motion.div
        initial={false}
        animate={isAccessGranted ? { x: '102%' } : { x: 0 }}
        transition={{ duration: 1.8, ease: [0.77, 0, 0.175, 1], delay: 1.5 }}
        className="absolute top-0 bottom-0 right-0 w-[50.5%] z-30 bg-[#080b12] border-l border-cyan-500/20 flex flex-col justify-between p-6 pointer-events-none shadow-2xl"
      >
        <div className="flex items-center justify-end gap-2">
          <span className="text-[10px] font-mono tracking-widest text-slate-500 uppercase">
            CONTROL UNIT #402
          </span>
          <span className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${
            isAccessGranted 
              ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,1)] animate-pulse' 
              : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'
          }`} />
        </div>
        <div className="text-[9px] text-slate-600 font-mono text-left">PORT GATEWAY // SECTOR B</div>
      </motion.div>

      {/* CENTRAL CARD CONTAINER */}
      <div className="relative z-40 w-full max-w-[390px] mx-4">
        <AnimatePresence mode="wait">
          {!isAccessGranted ? (
            /* MINIMALIST LOGIN FORM CARD */
            <motion.div
              key="login-card"
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -20 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className={`bg-slate-900/80 backdrop-blur-2xl border border-white/10 rounded-3xl p-6 sm:p-7 text-center shadow-2xl shadow-black/80 ${
                shake ? 'animate-shake' : ''
              }`}
            >
              {/* Top Minimal Badge */}
              <div className="flex items-center justify-center gap-1.5 mb-6">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[11px] font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>سامانه بازرسی و ورود گمرک</span>
                </div>
              </div>

              {/* Icon Emblem */}
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className={`absolute inset-0 rounded-2xl blur-md transition-colors duration-500 ${
                  hasErrors ? 'bg-rose-500/30' : code.length === 11 ? 'bg-emerald-500/30' : 'bg-cyan-500/20'
                }`} />
                <div className="relative w-full h-full rounded-2xl bg-gradient-to-b from-slate-800 to-slate-900 border border-white/15 p-0.5 flex items-center justify-center shadow-lg">
                  <KeyRound className={`w-7 h-7 transition-colors duration-300 ${
                    hasErrors ? 'text-rose-400' : code.length === 11 ? 'text-emerald-400' : 'text-cyan-400'
                  }`} />
                </div>
              </div>

              <h1 className="font-lalezar text-2xl text-slate-100 font-normal">
                گیت ورود اپراتور
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                کد ۱۱ رقمی دسترسی را وارد نمایید
              </p>

              {/* Form Input & Smart Dot Indicators */}
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
                    className={`w-full bg-slate-950/70 border rounded-2xl py-3 px-4 text-center ltr tracking-[0.35em] text-lg font-bold outline-none transition-all ${
                      hasErrors
                        ? 'border-rose-500/60 text-rose-400 bg-rose-950/10 focus:ring-2 focus:ring-rose-500/20'
                        : code.length === 11
                        ? 'border-emerald-500/60 text-emerald-400 bg-emerald-950/10'
                        : 'border-white/15 text-cyan-400 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20'
                    }`}
                  />
                </div>

                {/* Real-time Digit Dot Indicators */}
                <div className="space-y-1.5 my-2">
                  <div className="flex justify-center gap-1.5 ltr">
                    {Array.from({ length: 11 }).map((_, i) => {
                      const isTyped = i < code.length;
                      const isCorrect = isTyped && code[i] === ACCESS_CODE[i];

                      return (
                        <div
                          key={i}
                          className={`w-3 h-3 rounded-full transition-all duration-300 ${
                            !isTyped
                              ? 'bg-slate-800 border border-white/10'
                              : isCorrect
                              ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.9)] scale-110'
                              : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.9)] scale-110'
                          }`}
                        />
                      );
                    })}
                  </div>

                  {code.length > 0 && (
                    <div className="text-[11px] text-center font-medium">
                      {hasErrors ? (
                        <span className="text-rose-400">{fa(code.length - correctCount)} رقم اشتباه است</span>
                      ) : (
                        <span className="text-emerald-400">{fa(correctCount)} رقم صحیح</span>
                      )}
                    </div>
                  )}
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-center gap-1.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 py-2 px-3 rounded-xl"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{error}</span>
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={code.length === 0}
                  className="w-full py-3 px-5 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-bold text-sm hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
                >
                  <span>ورود به سامانه</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          ) : (
            /* SLEEK 5-SECOND UNLOCK ANIMATION & PROGRESS CARD */
            <motion.div
              key="loading-card"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="bg-slate-900/90 border border-emerald-500/30 backdrop-blur-2xl rounded-3xl p-7 text-center shadow-2xl shadow-emerald-950/40 space-y-5"
            >
              {/* Bouncing Success Badge */}
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full bg-emerald-500/20 blur-md animate-ping" />
                <div className="relative w-full h-full rounded-full bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.5)]">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
              </div>

              <div>
                <span className="inline-block px-3 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 mb-2">
                  مجوز ورود تأیید شد
                </span>
                <h2 className="font-lalezar text-2xl text-emerald-300">
                  بازگشایی گیت گمرک
                </h2>
                <p className="text-xs text-slate-300 mt-1 h-5 font-medium transition-all">
                  {stepText}
                </p>
              </div>

              {/* 5-second Animated Smooth Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden p-0.5 border border-white/10">
                  <motion.div
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 5, ease: 'easeInOut' }}
                    className="h-full bg-gradient-to-r from-emerald-500 via-teal-300 to-cyan-400 rounded-full shadow-[0_0_12px_rgba(52,211,153,0.8)]"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                  <span>SYSTEM STATUS: OK</span>
                  <span>5000ms LOCK DELAY</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
