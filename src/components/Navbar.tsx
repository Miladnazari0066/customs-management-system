import React, { useState, useEffect } from 'react';
import { LogOut, PackageCheck, Trash2 } from 'lucide-react';
import { toJalali, WDN, JMONTHS, fa, pad2 } from '../utils/jalali';

interface NavbarProps {
  onLogout: () => void;
  onClearAllData?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onLogout, onClearAllData }) => {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const j = toJalali(now.getFullYear(), now.getMonth() + 1, now.getDate());
      setDateStr(`${WDN[now.getDay()]} ${fa(j.jd)} ${JMONTHS[j.jm - 1]} ${fa(j.jy)}`);
      setTimeStr(fa(`${pad2(now.getHours())}:${pad2(now.getMinutes())}:${pad2(now.getSeconds())}`));
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-2xl">
        <div className="max-w-[1460px] mx-auto px-4 sm:px-7 py-3 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-400 to-blue-600 p-0.5 shadow-lg shadow-cyan-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-[#0c0e14] rounded-[10px] flex items-center justify-center text-cyan-400 overflow-hidden">
                <img 
                  src="/src/assets/images/customs_app_logo_1786469780372.jpg" 
                  alt="لوگوی گمرک"
                  className="w-full h-full object-cover" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to icon if image fails
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <PackageCheck className="w-6 h-6" />
              </div>
            </div>
            <div>
              <h1 className="font-lalezar text-xl sm:text-2xl font-normal leading-none text-slate-100 tracking-wide">
                پایانه گمرک
              </h1>
              <small className="block text-[10px] text-cyan-400/80 tracking-widest mt-0.5 font-semibold">
                CARGO TERMINAL OS
              </small>
            </div>
          </div>

          {/* Live Jalali Clock (Desktop & Tablet) */}
          <div className="hidden sm:flex items-center gap-2.5 text-xs text-slate-300 bg-white/5 backdrop-blur-md border border-white/10 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full shadow-inner">
            <span className="text-[11px] sm:text-xs">{dateStr}</span>
            <span className="w-px h-3 bg-white/15" />
            <span className="font-lalezar text-xs sm:text-sm text-cyan-400 tracking-wider">{timeStr}</span>
          </div>

          {/* User Chip & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {onClearAllData && (
              <button
                onClick={onClearAllData}
                className="hidden md:flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-amber-300 hover:text-rose-300 bg-amber-500/10 hover:bg-rose-500/20 border border-amber-500/30 hover:border-rose-500/40 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-full transition-all backdrop-blur-md active:scale-95"
                title="حذف تمام اسناد تستی ایجادشده"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span className="inline">حذف اسناد تستی</span>
              </button>
            )}

            <div className="hidden lg:flex items-center gap-2 text-xs text-slate-300 bg-white/5 backdrop-blur-md border border-white/10 px-3.5 py-2 rounded-full">
              <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
              <span>اپراتور پایانه</span>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-1 sm:gap-1.5 text-[11px] sm:text-xs text-slate-300 hover:text-rose-400 bg-white/5 hover:bg-rose-500/10 border border-white/10 hover:border-rose-500/30 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-full transition-all backdrop-blur-md active:scale-95"
              title="خروج از سامانه"
            >
              <span>خروج</span>
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Glowing Strip */}
        <div className="h-0.5 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />
      </header>
    </>
  );
};
