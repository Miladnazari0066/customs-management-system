import React, { useState } from 'react';
import {
  Printer,
  Edit2,
  Trash2,
  Check,
  Calendar,
  Building2,
  Truck,
  Package,
  Tag,
  Layers,
  FlaskConical,
  UserCheck,
  CheckCircle2,
  Sparkles,
  Route,
  Search,
  Leaf,
  LogOut,
  CreditCard,
  MoreVertical,
} from 'lucide-react';
import { ExitDoc, Batch, LabRecord, EntryDoc } from '../types';
import { fa, fmtJ, daysUntil, remTxt, esc, addMonthsJ } from '../utils/jalali';
import { printExitReceipts } from '../utils/print';

interface ExitCardProps {
  doc: ExitDoc;
  batch?: Batch;
  allDocs: EntryDoc[];
  labRecords: LabRecord[];
  onEdit: (doc: ExitDoc) => void;
  onDelete: (id: string) => void;
  onUpdateExit: (doc: ExitDoc) => void;
  onAddLabRecord: (rec: LabRecord) => void;
}

export const ExitCard: React.FC<ExitCardProps> = ({
  doc,
  batch,
  allDocs,
  labRecords,
  onEdit,
  onDelete,
  onUpdateExit,
  onAddLabRecord,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  // Calculate current stage (0 to 7)
  const isLabDone = !!(doc.lab.reusedFrom || doc.lab.tested);

  let stage = 0;
  if (!doc.route) stage = 0;
  else if (doc.route === 'red' && !doc.evaluator.done) stage = 1;
  else if (!doc.jihad.done) stage = 2;
  else if (doc.lab.needed && !isLabDone) stage = 3;
  else if (!doc.expert.done) stage = 4;
  else if (!doc.gate.done) stage = 5;
  else if (!doc.invoice.paid) stage = 6;
  else stage = 7; // Case Closed (مختومه)

  const STAGES_CONFIG: Record<number, { label: string; badgeCls: string; color: string }> = {
    0: { label: 'در انتظار تعیین مسیر', badgeCls: 'bg-amber-500/10 border-amber-500/40 text-amber-400', color: '#f59e0b' },
    1: { label: 'در انتظار ارزیاب گمرک', badgeCls: 'bg-rose-500/10 border-rose-500/40 text-rose-400', color: '#f43f5e' },
    2: { label: 'در انتظار جهاد کشاورزی', badgeCls: 'bg-blue-500/10 border-blue-500/40 text-blue-400', color: '#3b82f6' },
    3: { label: 'در انتظار آزمایشگاه', badgeCls: 'bg-cyan-500/10 border-cyan-500/40 text-cyan-400', color: '#06b6d4' },
    4: { label: 'در انتظار کارشناس مجازی', badgeCls: 'bg-blue-500/10 border-blue-500/40 text-blue-400', color: '#3b82f6' },
    5: { label: 'آماده خروج از درب', badgeCls: 'bg-teal-500/10 border-teal-500/40 text-teal-300', color: '#14b8a6' },
    6: { label: 'در انتظار پرداخت صورت‌حساب', badgeCls: 'bg-amber-500/15 border-amber-500/50 text-amber-300', color: '#f59e0b' },
    7: { label: 'پرونده مختومه شد ✓', badgeCls: 'bg-emerald-500/15 border-emerald-500/50 text-emerald-300', color: '#10b981' },
  };

  const currentCfg = STAGES_CONFIG[stage] || STAGES_CONFIG[0];

  // Find valid reusable lab record for the same goods
  const validLabRecord = React.useMemo(() => {
    if (!doc.goods) return null;
    for (let i = labRecords.length - 1; i >= 0; i--) {
      const r = labRecords[i];
      if (r.goods === doc.goods) {
        const days = daysUntil(addMonthsJ(r.sampleDate, r.validity));
        if (days > 0) {
          return { rec: r, days };
        }
      }
    }
    return null;
  }, [doc.goods, labRecords]);

  // Handle updates
  const updateRoute = (r: 'red' | 'yellow') => {
    onUpdateExit({
      ...doc,
      route: r,
    });
  };

  const handlePrint = () => {
    const memberDocs = batch
      ? (batch.docIds.map((id) => allDocs.find((d) => d.id === id)).filter(Boolean) as EntryDoc[])
      : [];
    printExitReceipts(doc, batch, memberDocs);
  };

  const handleLabTestedToggle = (tested: boolean) => {
    let recId = doc.lab.recordId;
    if (tested && !recId) {
      const newRec: LabRecord = {
        id: `lab-${Date.now()}`,
        goods: doc.goods,
        brand: doc.brand || '',
        sampleDate: doc.lab.sampleDate || doc.unloadDate,
        validity: doc.lab.validity || 6,
        comment: doc.lab.comment || 'نتیجه آزمایشگاه: مطابق استانداردهای لازم',
        exitId: doc.id,
        createdAt: Date.now(),
      };
      onAddLabRecord(newRec);
      recId = newRec.id;
    }

    onUpdateExit({
      ...doc,
      lab: {
        ...doc.lab,
        tested,
        recordId: recId,
      },
    });
  };

  const reuseLabRecord = (recId: string) => {
    onUpdateExit({
      ...doc,
      lab: {
        ...doc.lab,
        reusedFrom: recId,
      },
    });
  };

  return (
    <div
      className={`glass-panel p-5 relative transition-all shadow-xl hover:shadow-2xl hover:border-white/20 rounded-2xl ${
        stage === 7 ? 'opacity-85' : ''
      }`}
      style={{ borderRightWidth: '4px', borderRightColor: currentCfg.color }}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <div className="flex items-center gap-3">
          <span className="font-lalezar text-2xl text-slate-100 tracking-wide">
            {fa(doc.cottage)}
          </span>
          <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-xl text-xs ltr font-mono text-cyan-400 tracking-widest backdrop-blur-md">
            {doc.bl}
          </span>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border backdrop-blur-md ${currentCfg.badgeCls}`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {currentCfg.label}
          </span>
          {batch && (
            <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs px-3 py-0.5 rounded-full backdrop-blur-md">
              تجمیع {doc.batchId}
            </span>
          )}
        </div>

        {/* Action Buttons */}
        {/* Desktop View */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-cyan-400/30 bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/25 text-xs font-bold transition-all backdrop-blur-md"
            title="پرینت قبض‌های خروج"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>پرینت</span>
          </button>
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
              <div className="absolute left-0 top-10 z-50 min-w-[140px] glass-panel p-1.5 rounded-xl border border-white/20 shadow-2xl space-y-1">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handlePrint();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-cyan-300 hover:bg-cyan-500/20 transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-cyan-400" />
                  <span>پرینت قبض‌ها</span>
                </button>
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

      {/* Meta Bar */}
      <div className="flex items-center gap-4 flex-wrap text-xs text-slate-300 mb-4">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          پرونده: {fa(doc.file)}
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
          {esc(doc.goods)}
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

      {/* Pipe Diagram */}
      <div className="flex items-center py-3 my-2 border-t border-b border-white/10">
        {[
          { label: 'مسیر', icon: Route, done: !!doc.route, skip: false },
          { label: 'ارزیاب', icon: Search, done: doc.evaluator.done, skip: doc.route === 'yellow' },
          { label: 'جهاد', icon: Leaf, done: doc.jihad.done, skip: false },
          { label: 'آزمایشگاه', icon: FlaskConical, done: isLabDone, skip: !doc.lab.needed },
          { label: 'کارشناس', icon: UserCheck, done: doc.expert.done, skip: false },
          { label: 'درب خروج', icon: LogOut, done: doc.gate.done, skip: false },
          { label: 'پرداخت', icon: CreditCard, done: doc.invoice.paid, skip: false },
        ].map((node, i) => {
          const NodeIcon = node.icon;
          const isCur = stage === i;

          return (
            <React.Fragment key={i}>
              {i > 0 && (
                <div
                  className={`flex-1 h-0.5 transition-colors ${
                    node.done || node.skip ? 'bg-emerald-400' : 'bg-white/10'
                  }`}
                />
              )}
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs border transition-all ${
                    node.done
                      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-400'
                      : node.skip
                      ? 'border-dashed border-white/20 text-slate-500 opacity-50'
                      : isCur
                      ? 'border-amber-400 bg-amber-500/15 text-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.4)]'
                      : 'border-white/10 bg-white/5 text-slate-400'
                  }`}
                >
                  <NodeIcon className="w-3.5 h-3.5" />
                </div>
                <span
                  className={`text-[10px] ${
                    node.done
                      ? 'text-slate-300'
                      : isCur
                      ? 'text-amber-400 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {node.label}
                </span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {/* Stage Control Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 text-xs">
        {/* 1. Customs Route */}
        <div className="glass-panel-subtle p-3.5 rounded-xl space-y-2">
          <h5 className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Route className="w-3.5 h-3.5 text-slate-400" />
            مسیر کوتاژ
          </h5>

          <div className="flex gap-2">
            <button
              onClick={() => updateRoute('red')}
              className={`flex-1 py-2 rounded-lg font-bold border transition-all ${
                doc.route === 'red'
                  ? 'border-rose-500 text-rose-400 bg-rose-500/15 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                  : 'border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              قرمز
            </button>
            <button
              onClick={() => updateRoute('yellow')}
              className={`flex-1 py-2 rounded-lg font-bold border transition-all ${
                doc.route === 'yellow'
                  ? 'border-amber-400 text-amber-300 bg-amber-500/15 shadow-[0_0_10px_rgba(251,191,36,0.2)]'
                  : 'border-white/10 text-slate-400 hover:text-slate-200'
              }`}
            >
              زرد
            </button>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed">
            {doc.route === 'red'
              ? 'مسیر قرمز: نیازمند تاییدیه ارزیاب فیزیکی گمرک'
              : doc.route === 'yellow'
              ? 'مسیر زرد: مرحله ارزیابی فیزیکی حذف می‌شود'
              : 'مسیر گمرکی را مشخص کنید'}
          </p>
        </div>

        {/* 2. Evaluator (If Red Route) */}
        {doc.route === 'red' && (
          <div className="glass-panel-subtle p-3.5 rounded-xl space-y-2">
            <h5 className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              ارزیاب گمرک
            </h5>

            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-200">
              <input
                type="checkbox"
                checked={doc.evaluator.done}
                onChange={(e) =>
                  onUpdateExit({
                    ...doc,
                    evaluator: { ...doc.evaluator, done: e.target.checked },
                  })
                }
                className="w-4 h-4 accent-emerald-400 rounded"
              />
              <span>تاییدیه ارزیاب دریافت شد</span>
            </label>

            <textarea
              value={doc.evaluator.comment}
              onChange={(e) =>
                onUpdateExit({
                  ...doc,
                  evaluator: { ...doc.evaluator, comment: e.target.value },
                })
              }
              placeholder="کامنت ارزیاب..."
              rows={2}
              className="w-full glass-input rounded-lg p-2 text-xs outline-none resize-none"
            />
          </div>
        )}

        {/* 3. Jihad Agriculture */}
        <div className="glass-panel-subtle p-3.5 rounded-xl space-y-2">
          <h5 className="font-semibold text-slate-300 flex items-center gap-1.5">
            <Leaf className="w-3.5 h-3.5 text-slate-400" />
            جهاد کشاورزی
          </h5>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-200">
            <input
              type="checkbox"
              checked={doc.jihad.done}
              onChange={(e) =>
                onUpdateExit({
                  ...doc,
                  jihad: { ...doc.jihad, done: e.target.checked },
                })
              }
              className="w-4 h-4 accent-emerald-400 rounded"
            />
            <span>تاییدیه جهاد کشاورزی دریافت شد</span>
          </label>

          <textarea
            value={doc.jihad.comment}
            onChange={(e) =>
              onUpdateExit({
                ...doc,
                jihad: { ...doc.jihad, comment: e.target.value },
              })
            }
            placeholder="کامنت جهاد کشاورزی..."
            rows={2}
            className="w-full glass-input rounded-lg p-2 text-xs outline-none resize-none"
          />
        </div>

        {/* 4. Lab Testing Block (Wide) */}
        <div className="glass-panel-subtle p-3.5 rounded-xl space-y-2 lg:col-span-3">
          <h5 className="font-semibold text-slate-300 flex items-center gap-1.5">
            <FlaskConical className="w-3.5 h-3.5 text-slate-400" />
            آزمایشگاه
          </h5>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-200">
            <input
              type="checkbox"
              checked={doc.lab.needed}
              onChange={(e) =>
                onUpdateExit({
                  ...doc,
                  lab: { ...doc.lab, needed: e.target.checked },
                })
              }
              className="w-4 h-4 accent-emerald-400 rounded"
            />
            <span>نیاز به نمونه‌برداری و آزمایشگاه دارد</span>
          </label>

          {doc.lab.needed && (
            <div className="pt-2 space-y-2">
              {doc.lab.reusedFrom ? (
                <div className="bg-emerald-500/10 border border-emerald-500/40 rounded-lg p-2.5 text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>از سابقه آزمایشگاه قبلی استفاده شد</span>
                </div>
              ) : (
                <>
                  {validLabRecord && !doc.lab.tested && (
                    <div className="bg-cyan-500/10 border border-dashed border-cyan-400/40 rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap">
                      <div className="text-xs text-cyan-300">
                        <span className="font-bold flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          سابقه معتبر آزمایشگاهی برای این کالا موجود است!
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          نمونه‌برداری قبلی: {fmtJ(validLabRecord.rec.sampleDate)} — باقی‌مانده:{' '}
                          <b className="text-amber-400">{remTxt(validLabRecord.days)}</b>
                        </span>
                      </div>
                      <button
                        onClick={() => reuseLabRecord(validLabRecord.rec.id)}
                        className="px-3 py-1.5 rounded-lg border border-cyan-400/50 text-cyan-300 hover:bg-cyan-500/15 font-bold text-xs transition-colors"
                      >
                        استفاده از سابقه
                      </button>
                    </div>
                  )}

                  <div className="flex gap-4 flex-wrap">
                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-200">
                      <input
                        type="checkbox"
                        checked={doc.lab.sampled}
                        onChange={(e) =>
                          onUpdateExit({
                            ...doc,
                            lab: {
                              ...doc.lab,
                              sampled: e.target.checked,
                              sampleDate: e.target.checked ? doc.unloadDate : null,
                            },
                          })
                        }
                        className="w-4 h-4 accent-emerald-400 rounded"
                      />
                      <span>نمونه‌برداری انجام شد</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-200">
                      <input
                        type="checkbox"
                        checked={doc.lab.sent}
                        onChange={(e) =>
                          onUpdateExit({
                            ...doc,
                            lab: { ...doc.lab, sent: e.target.checked },
                          })
                        }
                        className="w-4 h-4 accent-emerald-400 rounded"
                      />
                      <span>ارسال به آزمایشگاه</span>
                    </label>

                    <label className="flex items-center gap-1.5 cursor-pointer text-slate-200">
                      <input
                        type="checkbox"
                        checked={doc.lab.tested}
                        onChange={(e) => handleLabTestedToggle(e.target.checked)}
                        className="w-4 h-4 accent-emerald-400 rounded"
                      />
                      <span>تست انجام شد</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <textarea
                      value={doc.lab.comment}
                      onChange={(e) =>
                        onUpdateExit({
                          ...doc,
                          lab: { ...doc.lab, comment: e.target.value },
                        })
                      }
                      placeholder="کامنت / نتیجه آزمایشگاه..."
                      rows={2}
                      className="sm:col-span-2 glass-input rounded-lg p-2 text-xs outline-none resize-none"
                    />

                    <div className="flex flex-col justify-center gap-1">
                      <span className="text-[11px] text-slate-300">اعتبار سابقه (ماه):</span>
                      <input
                        type="number"
                        min={1}
                        max={24}
                        value={doc.lab.validity}
                        onChange={(e) =>
                          onUpdateExit({
                            ...doc,
                            lab: {
                              ...doc.lab,
                              validity: parseInt(e.target.value, 10) || 6,
                            },
                          })
                        }
                        className="w-20 glass-input rounded-lg px-2.5 py-1.5 text-xs outline-none"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* 5. Virtual Expert */}
        <div className="glass-panel-subtle p-3.5 rounded-xl space-y-2">
          <h5 className="font-semibold text-slate-300 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            کارشناس مجازی
          </h5>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-200">
            <input
              type="checkbox"
              checked={doc.expert.done}
              onChange={(e) =>
                onUpdateExit({
                  ...doc,
                  expert: { done: e.target.checked },
                })
              }
              className="w-4 h-4 accent-emerald-400 rounded"
            />
            <span>تاییدیه کارشناس مجازی دریافت شد</span>
          </label>
        </div>

        {/* 6. Gate Exit */}
        <div className="glass-panel-subtle p-3.5 rounded-xl space-y-2">
          <h5 className="font-semibold text-slate-300 flex items-center gap-1.5">
            <LogOut className="w-3.5 h-3.5 text-slate-400" />
            درب خروج
          </h5>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-200">
            <input
              type="checkbox"
              checked={doc.gate.done}
              onChange={(e) =>
                onUpdateExit({
                  ...doc,
                  gate: { done: e.target.checked },
                })
              }
              className="w-4 h-4 accent-emerald-400 rounded"
            />
            <span>کالا از درب گمرک خارج شد</span>
          </label>
        </div>

        {/* 7. Customs Invoice */}
        <div className="glass-panel-subtle p-3.5 rounded-xl space-y-2">
          <h5 className="font-semibold text-slate-300 flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
            صورت‌حساب گمرک
          </h5>

          <label className="flex items-center gap-2 cursor-pointer select-none text-slate-200">
            <input
              type="checkbox"
              checked={doc.invoice.paid}
              onChange={(e) =>
                onUpdateExit({
                  ...doc,
                  invoice: { paid: e.target.checked },
                })
              }
              className="w-4 h-4 accent-emerald-400 rounded"
            />
            <span>صورت‌حساب گمرک پرداخت شد</span>
          </label>

          {stage === 7 && (
            <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-400 text-center font-bold p-2 rounded-lg text-xs mt-2 backdrop-blur-md">
              پرونده این خروج مختومه شد — بار خارج گردید ✓
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
