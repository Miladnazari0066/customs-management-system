import React, { useState, useEffect, useRef } from 'react';
import { Calendar, ChevronRight, ChevronLeft, X } from 'lucide-react';
import { JalaliDate } from '../types';
import {
  todayJ,
  fmtJ,
  JMONTHS,
  fa,
  jMonthLen,
  j2d,
  d2g,
} from '../utils/jalali';

interface JalaliDatePickerProps {
  value: JalaliDate | null;
  onChange: (d: JalaliDate | null) => void;
  placeholder?: string;
  allowClear?: boolean;
}

export const JalaliDatePicker: React.FC<JalaliDatePickerProps> = ({
  value,
  onChange,
  placeholder = '1405/05/12',
  allowClear = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [textInput, setTextInput] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);

  const activeDate = value || todayJ();
  const [viewYear, setViewYear] = useState(activeDate.jy);
  const [viewMonth, setViewMonth] = useState(activeDate.jm);

  useEffect(() => {
    if (value) {
      setTextInput(fmtJ(value));
      setViewYear(value.jy);
      setViewMonth(value.jm);
    } else {
      setTextInput('');
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handlePrevMonth = () => {
    if (viewMonth === 1) {
      setViewMonth(12);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 12) {
      setViewMonth(1);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const newDate: JalaliDate = { jy: viewYear, jm: viewMonth, jd: day };
    onChange(newDate);
    setIsOpen(false);
  };

  const handleToday = () => {
    const t = todayJ();
    onChange(t);
    setViewYear(t.jy);
    setViewMonth(t.jm);
    setIsOpen(false);
  };

  // Generate day cells for calendar view
  const jdn = j2d(viewYear, viewMonth, 1);
  const gFirst = d2g(jdn);
  const firstDayOfWeek = (new Date(gFirst.gy, gFirst.gm - 1, gFirst.gd).getDay() + 1) % 7;
  const monthDays = jMonthLen(viewYear, viewMonth);

  const t = todayJ();

  const yearOptions = [];
  for (let y = 1395; y <= 1415; y++) {
    yearOptions.push(y);
  }

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative flex items-center">
        <input
          type="text"
          readOnly
          value={textInput}
          onClick={() => setIsOpen(!isOpen)}
          placeholder={placeholder}
          className="glass-input w-full py-2.5 pr-3 pl-10 text-sm ltr text-left cursor-pointer"
        />
        <div className="absolute left-1.5 flex items-center gap-0.5">
          {allowClear && value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
                setIsOpen(false);
              }}
              className="text-slate-400 hover:text-rose-400 p-1 rounded-lg transition-colors"
              title="پاکسازی تاریخ"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="text-slate-400 hover:text-amber-400 p-1 rounded-lg transition-colors"
            title="تقویم"
          >
            <Calendar className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-50 w-72 glass-panel p-3 shadow-2xl rounded-2xl border-white/10 animate-in fade-in slide-in-from-top-2">
          {/* Calendar Header */}
          <div className="flex items-center justify-between gap-1 mb-3">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="w-8 h-8 rounded-lg border border-white/10 hover:border-amber-400 hover:text-amber-300 flex items-center justify-center text-sm text-slate-300 transition-colors backdrop-blur-md"
            >
              <ChevronRight className="w-4 h-4" />
            </button>

            <div className="flex gap-1.5 flex-1 justify-center">
              <select
                value={viewMonth}
                onChange={(e) => setViewMonth(parseInt(e.target.value, 10))}
                className="bg-slate-900/80 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-100 outline-none text-center"
              >
                {JMONTHS.map((m, i) => (
                  <option key={i} value={i + 1} className="bg-slate-900 text-slate-100">
                    {m}
                  </option>
                ))}
              </select>

              <select
                value={viewYear}
                onChange={(e) => setViewYear(parseInt(e.target.value, 10))}
                className="bg-slate-900/80 border border-white/10 rounded-lg px-2 py-1 text-xs text-slate-100 outline-none text-center"
              >
                {yearOptions.map((y) => (
                  <option key={y} value={y} className="bg-slate-900 text-slate-100">
                    {fa(y)}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleNextMonth}
              className="w-8 h-8 rounded-lg border border-white/10 hover:border-amber-400 hover:text-amber-300 flex items-center justify-center text-sm text-slate-300 transition-colors backdrop-blur-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Weekday headers */}
          <div className="grid grid-cols-7 text-center text-[10px] text-slate-400 mb-1 font-semibold">
            <span>ش</span>
            <span>ی</span>
            <span>د</span>
            <span>س</span>
            <span>چ</span>
            <span>پ</span>
            <span>ج</span>
          </div>

          {/* Grid Days */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <span key={`empty-${i}`} />
            ))}

            {Array.from({ length: monthDays }).map((_, i) => {
              const d = i + 1;
              const isSelected =
                value &&
                value.jy === viewYear &&
                value.jm === viewMonth &&
                value.jd === d;
              const isToday =
                t.jy === viewYear && t.jm === viewMonth && t.jd === d;

              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => handleSelectDay(d)}
                  className={`py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-md'
                      : isToday
                      ? 'border border-cyan-400 text-cyan-300'
                      : 'text-slate-300 hover:bg-white/10 hover:text-slate-100'
                  }`}
                >
                  {fa(d)}
                </button>
              );
            })}
          </div>

          {/* Today Button */}
          <div className="mt-3 text-center border-t border-white/10 pt-2">
            <button
              type="button"
              onClick={handleToday}
              className="text-xs text-cyan-300 hover:bg-cyan-400/10 border border-cyan-400/30 px-3 py-1 rounded-full transition-colors backdrop-blur-md"
            >
              امروز ({fmtJ(t)})
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
