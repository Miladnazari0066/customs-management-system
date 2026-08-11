import React, { useState } from 'react';
import { Plus } from 'lucide-react';

interface ComboboxFieldProps {
  label: string;
  required?: boolean;
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  onAddNew: (name: string) => void;
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
  error,
}) => {
  const [showAddRow, setShowAddRow] = useState(false);
  const [newInput, setNewInput] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newInput.trim();
    if (!trimmed) return;
    onAddNew(trimmed);
    onChange(trimmed);
    setNewInput('');
    setShowAddRow(false);
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
          className="w-11 flex-none rounded-xl border border-dashed border-white/20 text-slate-300 hover:border-amber-400 hover:text-amber-300 hover:bg-amber-400/10 flex items-center justify-center transition-all backdrop-blur-md"
          title="افزودن گزینه‌ی جدید"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {showAddRow && (
        <form onSubmit={handleAddSubmit} className="flex gap-2 pt-1 animate-in fade-in">
          <input
            type="text"
            value={newInput}
            onChange={(e) => setNewInput(e.target.value)}
            placeholder={`نام ${label} جدید...`}
            className="flex-1 glass-input px-3 py-1.5 text-xs"
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold text-xs rounded-xl hover:bg-amber-300 transition-colors shadow-sm"
          >
            افزودن
          </button>
        </form>
      )}

      {error && <p className="text-[11px] text-rose-400 mt-1">{error}</p>}
    </div>
  );
};
