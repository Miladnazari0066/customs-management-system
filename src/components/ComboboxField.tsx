import React, { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface ComboboxFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  onAddNew: (name: string) => void;
  onDeleteOption?: (name: string) => void;
  error?: string;
}

export const ComboboxField: React.FC<ComboboxFieldProps> = ({
  label,
  required,
  value,
  onChange,
  options,
  placeholder = 'انتخاب کنید...',
  onAddNew,
  onDeleteOption,
  error,
}) => {
  const [showAddRow, setShowAddRow] = useState(false);
  const [newInput, setNewInput] = useState('');

  const handleAddSubmit = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (e) e.preventDefault();
    const trimmed = newInput.trim();
    if (!trimmed) return;
    onAddNew(trimmed);
    onChange(trimmed);
    setNewInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSubmit(e);
    }
  };

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-slate-300">
        {label} {required && <span className="text-amber-400">*</span>}
      </label>

      <div className="flex gap-2">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`flex-1 glass-input px-3 py-2.5 text-sm appearance-none bg-[url("data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='12'%20height='12'%20viewBox='0%200%2024%2024'%20fill='none'%20stroke='%2394A3B8'%20stroke-width='2'%3E%3Cpath%20d='m6%209%206%206%206-6'/%3E%3C/svg%3E")] bg-no-repeat bg-[left_12px_center] pl-9 ${
            error ? 'border-rose-500/80 focus:border-rose-400' : ''
          }`}
        >
          <option value="" className="bg-slate-900 text-slate-300">{placeholder}</option>
          {options.map((opt) => (
            <option key={opt} value={opt} className="bg-slate-900 text-slate-100">
              {opt}
            </option>
          ))}
        </select>

        <button
          type="button"
          onClick={() => setShowAddRow(!showAddRow)}
          className={`w-11 flex-none rounded-xl border border-dashed transition-all flex items-center justify-center backdrop-blur-md ${
            showAddRow
              ? 'border-amber-400 text-amber-300 bg-amber-400/10'
              : 'border-white/20 text-slate-300 hover:border-amber-400 hover:text-amber-300 hover:bg-amber-400/10'
          }`}
          title="افزودن و مدیریت گزینه‌ها"
        >
          <Plus className={`w-5 h-5 transition-transform ${showAddRow ? 'rotate-45' : ''}`} />
        </button>
      </div>

      {showAddRow && (
        <div className="p-3 rounded-2xl bg-slate-900/90 border border-amber-500/30 space-y-3 animate-in fade-in duration-150">
          <div className="flex gap-2">
            <input
              type="text"
              value={newInput}
              onChange={(e) => setNewInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`نام ${label} جدید...`}
              className="flex-1 glass-input px-3 py-2 text-xs"
              autoFocus
            />
            <button
              type="button"
              onClick={handleAddSubmit}
              className="px-4 py-2 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-300 transition-colors shadow-sm shrink-0"
            >
              افزودن
            </button>
          </div>

          {options.length > 0 && onDeleteOption && (
            <div className="pt-2 border-t border-white/10 space-y-1.5">
              <span className="text-[11px] text-slate-400 font-medium block">
                لیست {label}های ثبت‌شده (برای حذف کلیک کنید):
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                {options.map((opt) => (
                  <div
                    key={opt}
                    className="flex items-center justify-between py-1 px-2.5 rounded-lg bg-white/5 border border-white/5 hover:border-white/15 text-xs text-slate-200"
                  >
                    <span className="truncate">{opt}</span>
                    <button
                      type="button"
                      onClick={() => {
                        if (value === opt) onChange('');
                        onDeleteOption(opt);
                      }}
                      className="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition-colors shrink-0 flex items-center gap-1"
                      title={`حذف ${opt}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {error && <p className="text-[11px] text-rose-400 mt-1">{error}</p>}
    </div>
  );
};
