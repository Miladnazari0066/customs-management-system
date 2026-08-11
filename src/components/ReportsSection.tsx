import React from 'react';
import { BarChart3, Truck, Package, Layers, CheckCircle2, Clock, AlertTriangle, Layers3 } from 'lucide-react';
import { EntryDoc, ExitDoc, Batch } from '../types';
import { fa } from '../utils/jalali';

interface ReportsSectionProps {
  docs: EntryDoc[];
  exits: ExitDoc[];
  batches: Batch[];
  getStageOf: (d: EntryDoc) => number;
}

export const ReportsSection: React.FC<ReportsSectionProps> = ({
  docs,
  exits,
  batches,
  getStageOf,
}) => {
  const totalDocs = docs.length;
  const dischargingDocs = docs.filter((d) => getStageOf(d) === 1).length;
  const completingDocs = docs.filter((d) => {
    const s = getStageOf(d);
    return s === 2 || s === 3;
  }).length;
  const completeDocs = docs.filter((d) => getStageOf(d) === 4).length;
  const batchedDocs = docs.filter((d) => getStageOf(d) === 5).length;
  const readyExitDocs = docs.filter((d) => getStageOf(d) === 6).length;

  const totalTrailers = docs.reduce((a, d) => a + d.trailers, 0);
  const unloadedTrailers = docs.reduce((a, d) => a + d.unloaded, 0);
  const totalPallets = docs.reduce((a, d) => a + d.pallets, 0);

  const totalExits = exits.length;
  const gateExited = exits.filter((x) => x.gate.done).length;
  const closedExits = exits.filter((x) => x.invoice.paid && x.gate.done).length;

  const unloadRatio = totalTrailers > 0 ? Math.round((unloadedTrailers / totalTrailers) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-lalezar text-2xl font-normal text-slate-100 tracking-wide">
          داشبورد تحلیلی و گزارش‌گیری پایانه
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          خلاصه وضعیت عملیات تخلیه، تکمیل اسناد، تجمیع و روند خروج کالا در پایانه گمرک
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 shadow-xl rounded-2xl border-r-4 border-r-amber-400 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-2">
            <span>کل اسناد ورود</span>
            <Package className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-lalezar text-3xl text-slate-100">{fa(totalDocs)}</div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span>تریلی تخلیه‌شده:</span>
            <b className="text-amber-400">{fa(unloadedTrailers)}</b> از <b>{fa(totalTrailers)}</b>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-2 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${unloadRatio}%` }}
            />
          </div>
        </div>

        <div className="glass-panel p-5 shadow-xl rounded-2xl border-r-4 border-r-cyan-400 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-2">
            <span>مجموع پالت‌های ورود</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-lalezar text-3xl text-slate-100">{fa(totalPallets)}</div>
          <div className="text-[11px] text-slate-400 mt-2">
            ثبت‌شده در {fa(batches.length)} تجمیع فعال
          </div>
        </div>

        <div className="glass-panel p-5 shadow-xl rounded-2xl border-r-4 border-r-blue-400 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-2">
            <span>کل اسناد خروج</span>
            <Truck className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-lalezar text-3xl text-slate-100">{fa(totalExits)}</div>
          <div className="text-[11px] text-slate-400 mt-2">
            خارج‌شده از درب: <b className="text-cyan-400">{fa(gateExited)}</b> پرونده
          </div>
        </div>

        <div className="glass-panel p-5 shadow-xl rounded-2xl border-r-4 border-r-emerald-400 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-2">
            <span>پرونده‌های مختومه</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-lalezar text-3xl text-slate-100">{fa(closedExits)}</div>
          <div className="text-[11px] text-emerald-400 mt-2 font-semibold">
            پرونده‌های کامل و تسویه‌شده
          </div>
        </div>
      </div>

      {/* Breakdown Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Entry Breakdown Bar Chart Simulation */}
        <div className="glass-panel p-6 shadow-xl rounded-2xl space-y-4">
          <h3 className="font-lalezar text-lg text-slate-100 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-amber-400" />
            تفکیک وضعیت اسناد ورود
          </h3>

          <div className="space-y-3 pt-2 text-xs">
            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>در حال تخلیه تریلی</span>
                <span className="font-bold text-amber-400">{fa(dischargingDocs)} سند</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-amber-400 rounded-full"
                  style={{ width: `${totalDocs ? (dischargingDocs / totalDocs) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>در حال تکمیل (صورت‌حساب/مدارک)</span>
                <span className="font-bold text-blue-400">{fa(completingDocs)} سند</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-blue-400 rounded-full"
                  style={{ width: `${totalDocs ? (completingDocs / totalDocs) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>کامل (آماده تجمیع)</span>
                <span className="font-bold text-emerald-400">{fa(completeDocs)} سند</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-emerald-400 rounded-full"
                  style={{ width: `${totalDocs ? (completeDocs / totalDocs) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>در تجمیع</span>
                <span className="font-bold text-cyan-400">{fa(batchedDocs)} سند</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-cyan-400 rounded-full"
                  style={{ width: `${totalDocs ? (batchedDocs / totalDocs) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1 text-slate-300">
                <span>آماده خروج</span>
                <span className="font-bold text-amber-300">{fa(readyExitDocs)} سند</span>
              </div>
              <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-amber-300 rounded-full"
                  style={{ width: `${totalDocs ? (readyExitDocs / totalDocs) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Operational Bottlenecks / Insights */}
        <div className="glass-panel p-6 shadow-xl rounded-2xl space-y-4">
          <h3 className="font-lalezar text-lg text-slate-100 flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            شاخص‌های کلیدی پایانه
          </h3>

          <div className="space-y-3 text-xs pt-2">
            <div className="glass-panel-subtle p-3.5 rounded-xl flex items-center justify-between">
              <span className="text-slate-300">نرخ پیشرفت تخلیه تریلی‌ها:</span>
              <span className="font-lalezar text-base text-amber-400">{fa(unloadRatio)}٪</span>
            </div>

            <div className="glass-panel-subtle p-3.5 rounded-xl flex items-center justify-between">
              <span className="text-slate-300">تعداد تجمیع‌های نهایی‌شده:</span>
              <span className="font-lalezar text-base text-cyan-400">
                {fa(batches.filter((b) => b.finalized).length)} تجمیع
              </span>
            </div>

            <div className="glass-panel-subtle p-3.5 rounded-xl flex items-center justify-between">
              <span className="text-slate-300">خروج‌های در حال بررسی (گمرک/آزمایشگاه):</span>
              <span className="font-lalezar text-base text-blue-400">
                {fa(exits.filter((x) => !x.gate.done).length)} پرونده
              </span>
            </div>

            <div className="glass-panel-subtle p-3.5 rounded-xl flex items-center justify-between">
              <span className="text-slate-300">اسناد ورود بدون تجمیع (آماده تجمیع):</span>
              <span className="font-lalezar text-base text-emerald-400">{fa(completeDocs)} سند</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
