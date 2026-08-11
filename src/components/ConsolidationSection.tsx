import React, { useState } from 'react';
import { Layers, Printer, Lock, CheckCircle2, Trash2, HelpCircle, AlertCircle } from 'lucide-react';
import { EntryDoc, Batch } from '../types';
import { fa, fmtJ, en, esc, todayJ } from '../utils/jalali';
import { printBatchReceipts } from '../utils/print';

interface ConsolidationSectionProps {
  docs: EntryDoc[];
  batches: Batch[];
  onCreateBatch: (batchId: string, docIds: string[], goods: string, file: string) => void;
  onFinalizeBatch: (batchId: string) => void;
  onDeleteBatch: (batchId: string) => void;
  getStageOf: (d: EntryDoc) => number;
}

export const ConsolidationSection: React.FC<ConsolidationSectionProps> = ({
  docs,
  batches,
  onCreateBatch,
  onFinalizeBatch,
  onDeleteBatch,
  getStageOf,
}) => {
  const [selectedDocIds, setSelectedDocIds] = useState<Set<string>>(new Set());
  const [batchNumInput, setBatchNumInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Eligible documents = Stage 4 (Complete) and not yet in a batch
  const eligibleDocs = docs.filter((d) => {
    const isComplete = getStageOf(d) === 4;
    const inBatch = batches.some((b) => b.docIds.includes(d.id));
    return isComplete && !inBatch;
  });

  // Keep only selected IDs that are still eligible
  const activeSelected = eligibleDocs.filter((d) => selectedDocIds.has(d.id));

  // Determine anchor group (File + Goods) from first selected document
  const anchorDoc = activeSelected.length > 0 ? activeSelected[0] : null;

  const toggleSelect = (id: string) => {
    const next = new Set(selectedDocIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setSelectedDocIds(next);
    setErrorMsg('');
  };

  const handleMerge = () => {
    setErrorMsg('');
    if (activeSelected.length < 2) {
      setErrorMsg('حداقل ۲ سند کامل انتخاب کنید');
      return;
    }

    const num = en(batchNumInput.trim()).toUpperCase();
    if (!num) {
      setErrorMsg('شناسه تجمیع الزامی است');
      return;
    }

    if (!/^SEETEC\d{5}COMB\d{4}$/.test(num)) {
      setErrorMsg('قالب شناسه: SEETEC + ۵ رقم + COMB + ۴ رقم (مانند SEETEC12345COMB1234)');
      return;
    }

    if (batches.some((b) => String(b.id) === num)) {
      setErrorMsg('این شناسه تجمیع قبلاً ثبت شده است');
      return;
    }

    onCreateBatch(
      num,
      activeSelected.map((d) => d.id),
      anchorDoc?.goods || '',
      anchorDoc?.file || ''
    );

    setSelectedDocIds(new Set());
    setBatchNumInput('');
  };

  // Group eligible documents by File # and Goods
  const groupedEligible: Record<string, EntryDoc[]> = {};
  eligibleDocs.forEach((d) => {
    const key = `${d.file || '—'}|${d.goods || '—'}`;
    if (!groupedEligible[key]) groupedEligible[key] = [];
    groupedEligible[key].push(d);
  });

  const totalSelectedPallets = activeSelected.reduce((a, d) => a + d.pallets, 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="font-lalezar text-2xl font-normal text-slate-100 tracking-wide">
          تجمیع اسناد گمرکی
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          فقط اسناد هم‌پرونده و هم‌نوع‌کالا · قالب شناسه تجمیع: SEETEC + ۵ رقم + COMB + ۴ رقم
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Eligible Documents Picker */}
        <div className="lg:col-span-5 glass-panel p-5 shadow-xl rounded-2xl">
          <div className="flex items-center gap-3 pb-4 mb-4 border-b border-white/10">
            <div className="w-9 h-9 rounded-xl bg-cyan-400/15 text-cyan-400 flex items-center justify-center backdrop-blur-md">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-lalezar text-lg text-slate-100">
                اسناد آماده تجمیع ({fa(eligibleDocs.length)})
              </h3>
              <p className="text-[11px] text-slate-400">
                تخلیه کامل + قبض انبار + هر سه مدرک
              </p>
            </div>
          </div>

          {/* List of Eligible Docs */}
          <div className="space-y-4 max-h-[480px] overflow-y-auto pl-1">
            {Object.keys(groupedEligible).length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs leading-relaxed">
                هنوز سند کاملی برای تجمیع آماده نشده است.
                <br />
                سند زمانی «کامل» می‌شود که تخلیه، قبض انبار و هر سه مدرک آن ثبت شده باشد.
              </div>
            ) : (
              Object.keys(groupedEligible).map((key) => {
                const groupDocs = groupedEligible[key];
                const sample = groupDocs[0];
                const isLocked =
                  anchorDoc !== null &&
                  !(sample.goods === anchorDoc.goods && sample.file === anchorDoc.file);

                return (
                  <div
                    key={key}
                    className={`glass-panel-subtle p-3 rounded-xl transition-all ${
                      isLocked ? 'opacity-40 border-dashed' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-2">
                      <span className="font-lalezar text-cyan-300">
                        پرونده {fa(sample.file)}
                      </span>
                      <span className="text-emerald-400 font-bold">{sample.goods}</span>
                      <span className="text-slate-400">{fa(groupDocs.length)} سند</span>
                    </div>

                    <div className="space-y-1.5">
                      {groupDocs.map((d) => {
                        const isChecked = selectedDocIds.has(d.id);

                        return (
                          <label
                            key={d.id}
                            className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                              isChecked
                                ? 'border-cyan-400 bg-cyan-400/10 text-slate-100 shadow-sm'
                                : 'border-white/5 bg-black/20 text-slate-300 hover:border-white/20'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              disabled={isLocked}
                              onChange={() => toggleSelect(d.id)}
                              className="w-4 h-4 accent-cyan-400 rounded cursor-pointer disabled:cursor-not-allowed"
                            />
                            <span className="font-lalezar text-sm text-slate-100">
                              {fa(d.cottage)}
                            </span>
                            <span className="ltr font-mono text-[11px] text-cyan-300">
                              {d.bl}
                            </span>
                            <span className="text-[11px] text-slate-400 mr-auto">
                              قبض: {d.receipt.number || '—'} ({fa(d.pallets)} پالت)
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Merge Control Bar */}
          <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
            <div className="text-xs text-slate-300 bg-cyan-400/5 border border-dashed border-cyan-400/30 rounded-xl p-3 backdrop-blur-md">
              {anchorDoc ? (
                <div>
                  پرونده <b className="text-slate-100">{fa(anchorDoc.file)}</b> · کالا{' '}
                  <b className="text-cyan-300">{anchorDoc.goods}</b>
                  <br />
                  <span className="text-emerald-400 font-bold">
                    {fa(activeSelected.length)} سند انتخاب‌شده ({fa(totalSelectedPallets)} پالت)
                  </span>
                </div>
              ) : (
                <span>فقط اسناد هم‌پرونده و هم‌نوع‌کالا با هم تجمیع می‌شوند</span>
              )}
            </div>

            <div className="space-y-1.5">
              <input
                type="text"
                value={batchNumInput}
                onChange={(e) => setBatchNumInput(e.target.value.toUpperCase())}
                placeholder="SEETEC12345COMB1234"
                className="glass-input w-full px-3 py-2.5 text-xs ltr text-left uppercase font-mono tracking-wider"
              />
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errorMsg}
              </p>
            )}

            <button
              onClick={handleMerge}
              disabled={activeSelected.length < 2}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs hover:from-amber-300 hover:to-amber-400 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-amber-500/20"
            >
              ایجاد تجمیع
            </button>
          </div>
        </div>

        {/* Right Side: Existing Batches List */}
        <div className="lg:col-span-7 space-y-4">
          <h3 className="font-lalezar text-lg text-slate-100">
            لیست تجمیع‌های ثبت‌شده ({fa(batches.length)})
          </h3>

          {batches.length === 0 ? (
            <div className="glass-panel p-8 rounded-2xl text-center text-slate-400 text-xs">
              هیچ تجمیعی ثبت نشده است. از پانل سمت راست اسناد هم‌پرونده را انتخاب و تجمیع کنید.
            </div>
          ) : (
            batches
              .slice()
              .reverse()
              .map((b) => {
                const memberDocs = b.docIds.map((id) => docs.find((d) => d.id === id)).filter(Boolean) as EntryDoc[];
                const totalPallets = memberDocs.reduce((a, d) => a + d.pallets, 0);

                return (
                  <div
                    key={b.id}
                    className={`glass-panel p-5 rounded-2xl relative space-y-3 shadow-xl transition-all ${
                      b.finalized ? 'border-amber-400/50' : ''
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="font-lalezar text-xl text-cyan-300">
                          تجمیع {fa(b.id)}
                        </span>
                        <span className="bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-lg text-xs ltr font-mono text-cyan-400">
                          {b.id}
                        </span>
                        <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs px-2.5 py-0.5 rounded-full font-bold backdrop-blur-md">
                          {b.goods}
                        </span>
                        <span
                          className={`text-xs px-3 py-0.5 rounded-full border backdrop-blur-md ${
                            b.finalized
                              ? 'bg-amber-500/10 border-amber-500/40 text-amber-300 font-bold'
                              : 'border-white/10 text-slate-300'
                          }`}
                        >
                          {b.finalized ? 'نهایی شده' : 'در انتظار نهایی'}
                        </span>
                      </div>

                      <button
                        onClick={() => printBatchReceipts(b, memberDocs)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-400/40 bg-cyan-400/10 text-cyan-300 hover:bg-cyan-400/20 text-xs transition-colors font-bold backdrop-blur-md"
                        title="پرینت قبض‌های انبار این تجمیع"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>پرینت قبض‌ها</span>
                      </button>
                    </div>

                    {/* Table of Members */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs text-right border-collapse">
                        <thead>
                          <tr className="border-b border-white/10 text-slate-400">
                            <th className="py-2 px-2 font-medium">کوتاژ</th>
                            <th className="py-2 px-2 font-medium">بارنامه</th>
                            <th className="py-2 px-2 font-medium">قبض انبار</th>
                            <th className="py-2 px-2 font-medium">برند</th>
                            <th className="py-2 px-2 font-medium">پالت</th>
                          </tr>
                        </thead>
                        <tbody>
                          {memberDocs.map((d) => (
                            <tr key={d.id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-2 px-2 font-lalezar text-sm text-slate-100">
                                {fa(d.cottage)}
                              </td>
                              <td className="py-2 px-2 ltr font-mono text-cyan-300">
                                {d.bl}
                              </td>
                              <td className="py-2 px-2 text-slate-300">
                                {d.receipt.number || '—'}
                              </td>
                              <td className="py-2 px-2 text-amber-300">
                                {d.brand || '—'}
                              </td>
                              <td className="py-2 px-2 text-slate-300">
                                {fa(d.pallets)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Footer Summary & Actions */}
                    <div className="flex items-center justify-between gap-3 pt-2 text-xs text-cyan-300">
                      <span>
                        {fa(memberDocs.length)} قبض انبار · {fa(totalPallets)} پالت مجموع
                      </span>

                      {!b.finalized && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onFinalizeBatch(b.id)}
                            className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors shadow-md"
                          >
                            نهایی کردن تجمیع
                          </button>
                          <button
                            onClick={() => onDeleteBatch(b.id)}
                            className="px-3 py-1.5 rounded-lg border border-rose-500/40 text-rose-400 hover:bg-rose-500/10 text-xs transition-colors backdrop-blur-md"
                          >
                            لغو تجمیع
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      </div>
    </div>
  );
};
