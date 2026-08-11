import React, { useState } from 'react';
import {
  Truck,
  Calendar,
  Building2,
  Package,
  Tag,
  Receipt,
  FileCheck,
  Edit2,
  Trash2,
  Check,
  Layers,
  HelpCircle,
  MoreVertical,
} from 'lucide-react';
import { EntryDoc, Batch } from '../types';
import { fa, fmtJ, esc } from '../utils/jalali';

interface EntryCardProps {
  doc: EntryDoc;
  batch?: Batch;
  onEdit: (doc: EntryDoc) => void;
  onDelete: (id: string) => void;
  onUpdateUnloaded: (id: string, delta: number) => void;
  onToggleInvoice: (id: string, paid: boolean) => void;
  onUpdateReceipt: (id: string, number: string, count: string) => void;
  onToggleTask: (id: string, taskKey: 'bl' | 'arr' | 'tali') => void;
}

export const EntryCard: React.FC<EntryCardProps> = ({
  doc,
  batch,
  onEdit,
  onDelete,
  onUpdateUnloaded,
  onToggleInvoice,
  onUpdateReceipt,
  onToggleTask,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Determine current stage & color theme
  let stage = 1;
  if (doc.unloaded < doc.trailers) stage = 1;
  else if (!doc.invoicePaid || !doc.receipt.number) stage = 2;
  else if (!(doc.tasks.bl && doc.tasks.arr && doc.tasks.tali)) stage = 3;
  else if (!batch) stage = 4;
  else stage = batch.finalized ? 6 : 5;

  const STAGE_CONFIG: Record<number, { label: string; badgeCls: string; color: string }> = {
    1: { label: 'در حال تخلیه', badgeCls: 'bg-amber-500/10 border-amber-500/40 text-amber-400', color: '#f59e0b' },
    2: { label: 'در حال تکمیل', badgeCls: 'bg-blue-500/10 border-blue-500/40 text-blue-400', color: '#3b82f6' },
    3: { label: 'در حال تکمیل', badgeCls: 'bg-blue-500/10 border-blue-500/40 text-blue-400', color: '#3b82f6' },
    4: { label: 'کامل · آماده تجمیع', badgeCls: 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400', color: '#10b981' },
    5: { label: 'در تجمیع', badgeCls: 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400', color: '#06b6d4' },
    6: { label: 'آماده خروج', badgeCls: 'bg-purple-500/15 border-purple-500/50 text-purple-300', color: '#a855f7' },
  };

  const currentStageCfg = STAGE_CONFIG[stage] || STAGE_CONFIG[1];

  // Calculate percentage progress
  let progress = (doc.trailers ? doc.unloaded / doc.trailers : 0) * 30;
  if (doc.invoicePaid) progress += 10;
  if (doc.receipt.number) progress += 10;
  progress += ((doc.tasks.bl ? 1 : 0) + (doc.tasks.arr ? 1 : 0) + (doc.tasks.tali ? 1 : 0)) / 3 * 30;
  if (batch) {
    progress += 10;
    if (batch.finalized) progress += 10;
  }
  progress = Math.min(100, Math.round(progress));

  return (
    <div
      className="glass-panel p-5 relative transition-all shadow-xl hover:shadow-2xl hover:border-white/20 rounded-2xl"
      style={{ borderRightWidth: '4px', borderRightColor: currentStageCfg.color }}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-center gap-3">
          <span className="font-lalezar text-2xl text-slate-100 tracking-wide">
            {fa(doc.cottage)}
          </span>
          <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-xs ltr font-mono text-cyan-400 tracking-widest backdrop-blur-md">
            {esc(doc.bl)}
          </span>
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${currentStageCfg.badgeCls}`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {currentStageCfg.label}
          </span>
          {batch && (
            <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs px-3 py-0.5 rounded-full backdrop-blur-md">
              تجمیع {fa(batch.id)}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {/* Desktop View */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => onEdit(doc)}
            className="w-8 h-8 rounded-xl border border-white/10 hover:border-cyan-400/40 hover:bg-cyan-500/10 text-slate-400 hover:text-cyan-300 flex items-center justify-center transition-all backdrop-blur-md"
            title="ویرایش"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(doc.id)}
            className="w-8 h-8 rounded-xl border border-white/10 hover:border-rose-500/40 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-all backdrop-blur-md"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile View - 3 Dots Dropdown */}
        <div className="sm:hidden relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 rounded-xl border border-white/15 bg-white/5 text-slate-300 hover:text-white flex items-center justify-center transition-all backdrop-blur-md active:scale-95"
            title="منوی عملیات"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute left-0 top-10 z-50 min-w-[130px] glass-panel p-1.5 rounded-xl border border-white/20 shadow-2xl space-y-1">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onEdit(doc);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-cyan-500/20 hover:text-cyan-300 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>ویرایش سند</span>
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    onDelete(doc.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  <span>حذف سند</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Meta Badges */}
      <div className="flex items-center gap-4 flex-wrap text-xs text-slate-300 mb-4">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          تخلیه: {fmtJ(doc.unloadDate)}
        </span>
        <span className="flex items-center gap-1.5">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          {esc(doc.importer)}
        </span>
        <span className="flex items-center gap-1.5">
          <Truck className="w-3.5 h-3.5 text-slate-400" />
          {esc(doc.carrier)}
        </span>
        <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
          <Package className="w-3.5 h-3.5" />
          {esc(doc.goods) || '—'}
        </span>
        {doc.brand && (
          <span className="flex items-center gap-1.5 text-amber-400">
            <Tag className="w-3.5 h-3.5" />
            {esc(doc.brand)}
          </span>
        )}
        {doc.pallets > 0 && (
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            {fa(doc.pallets)} پالت
          </span>
        )}
      </div>

      {/* Progress Pipe */}
      <div className="flex items-center py-3 my-2 border-t border-b border-white/10">
        {[
          { label: 'تخلیه', stageIdx: 1 },
          { label: 'صورت‌حساب', stageIdx: 2 },
          { label: 'مدارک', stageIdx: 3 },
          { label: 'تجمیع', stageIdx: 4 },
          { label: 'خروج', stageIdx: 5 },
        ].map((node, i) => {
          const isDone = stage > node.stageIdx || stage === 6;
          const isCur = stage === node.stageIdx && stage < 6;

          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <div
                  className={`flex-1 h-0.5 transition-colors ${
                    isDone ? 'bg-emerald-400' : 'bg-white/10'
                  }`}
                />
              )}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
                    isDone
                      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-400'
                      : isCur
                      ? 'border-amber-400 bg-amber-500/15 text-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                      : 'border-white/10 bg-white/5 text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : fa(i + 1)}
                </div>
                <span
                  className={`text-[10px] ${
                    isDone ? 'text-slate-300' : isCur ? 'text-amber-400 font-bold' : 'text-slate-400'
                  }`}
                >
                  {node.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Controls Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {/* Stepper: Unloading */}
        <div className="glass-panel-subtle p-3.5 rounded-xl">
          <h5 className="text-xs text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-slate-400" />
            تخلیه تریلی
          </h5>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateUnloaded(doc.id, -1)}
              disabled={doc.unloaded <= 0}
              className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 text-lg text-slate-300 hover:border-amber-400 hover:text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
            >
              −
            </button>
            <span className="font-lalezar text-2xl min-w-[32px] text-center text-slate-100">
              {fa(doc.unloaded)}
            </span>
            <button
              onClick={() => onUpdateUnloaded(doc.id, 1)}
              disabled={doc.unloaded >= doc.trailers}
              className="w-8 h-8 rounded-lg border border-white/10 bg-white/5 text-lg text-slate-300 hover:border-amber-400 hover:text-amber-400 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-all"
            >
              +
            </button>
            <span className="text-xs text-slate-400">از {fa(doc.trailers)} تریلی</span>
          </div>
          {doc.unloaded >= doc.trailers && (
            <div className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1 font-medium">
              <Check className="w-3.5 h-3.5" /> تخلیه کامل شد
            </div>
          )}
        </div>

        {/* Invoice & Receipt */}
        <div className="glass-panel-subtle p-3.5 rounded-xl">
          <h5 className="text-xs text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-slate-400" />
            صورت‌حساب و قبض انبار
          </h5>

          <label className="flex items-center gap-2 text-xs cursor-pointer select-none mb-2 text-slate-200">
            <input
              type="checkbox"
              checked={doc.invoicePaid}
              onChange={(e) => onToggleInvoice(doc.id, e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-400"
            />
            <span>صورت‌حساب منطقه ویژه پرداخت شد</span>
          </label>

          <div className="grid grid-cols-2 gap-2">
            <input
              type="text"
              disabled={!doc.invoicePaid}
              value={doc.receipt.number}
              onChange={(e) => onUpdateReceipt(doc.id, e.target.value, doc.receipt.count)}
              placeholder="شماره قبض انبار"
              className="w-full glass-input rounded-lg px-2.5 py-1.5 text-xs ltr text-left outline-none disabled:opacity-35"
            />
            <input
              type="text"
              disabled={!doc.invoicePaid}
              value={doc.receipt.count}
              onChange={(e) => onUpdateReceipt(doc.id, doc.receipt.number, e.target.value)}
              placeholder="تعداد اقلام"
              className="w-full glass-input rounded-lg px-2.5 py-1.5 text-xs outline-none disabled:opacity-35"
            />
          </div>
        </div>

        {/* Milestones / Stamps */}
        <div className="glass-panel-subtle p-3.5 rounded-xl">
          <h5 className="text-xs text-slate-300 font-semibold mb-2 flex items-center gap-1.5">
            <FileCheck className="w-3.5 h-3.5 text-slate-400" />
            تکمیل مدارک
          </h5>

          <div className="grid grid-cols-3 gap-1.5">
            <button
              onClick={() => onToggleTask(doc.id, 'bl')}
              className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1 text-[11px] ${
                doc.tasks.bl
                  ? 'border-emerald-400 bg-emerald-500/10 text-emerald-400'
                  : 'border-dashed border-white/10 text-slate-400 hover:border-amber-400 hover:text-amber-400'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>بارنامه</span>
            </button>

            <button
              onClick={() => onToggleTask(doc.id, 'arr')}
              className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1 text-[11px] ${
                doc.tasks.arr
                  ? 'border-emerald-400 bg-emerald-500/10 text-emerald-400'
                  : 'border-dashed border-white/10 text-slate-400 hover:border-amber-400 hover:text-amber-400'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>وصول</span>
            </button>

            <button
              onClick={() => onToggleTask(doc.id, 'tali')}
              className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1 text-[11px] ${
                doc.tasks.tali
                  ? 'border-emerald-400 bg-emerald-500/10 text-emerald-400'
                  : 'border-dashed border-white/10 text-slate-400 hover:border-amber-400 hover:text-amber-400'
              }`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>تالی</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Bar Footer */}
      <div className="mt-4 flex items-center gap-3">
        <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all duration-500 rounded-full"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="font-lalezar text-sm text-slate-300 min-w-[40px] text-left">
          {fa(progress)}٪
        </span>
      </div>
    </div>
  );
};
