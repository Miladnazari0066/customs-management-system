import React from 'react';
import { FlaskConical, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { LabRecord } from '../types';
import { fa, fmtJ, daysUntil, remTxt, addMonthsJ } from '../utils/jalali';

interface LabRecordsSectionProps {
  records: LabRecord[];
}

export const LabRecordsSection: React.FC<LabRecordsSectionProps> = ({ records }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-lalezar text-2xl font-normal text-slate-100 tracking-wide">
          سوابق آزمایشگاهی کالاها
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          نمونه‌های آزمایش‌شده که برای خروج‌های بعدی همان نوع کالا تا پایان اعتبار قابل استفاده مجدد هستند
        </p>
      </div>

      <div className="glass-panel p-6 shadow-xl rounded-2xl">
        {records.length === 0 ? (
          <div className="text-center py-12 text-slate-400 text-xs">
            هنوز هیچ سابقه آزمایشگاهی در سامانه ثبت نشده است.
            <br />
            با انجام تست آزمایشگاه در بخش خروج کالا، سوابق به صورت خودکار در این بخش ذخیره می‌شوند.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {records
              .slice()
              .reverse()
              .map((r) => {
                const daysRem = daysUntil(addMonthsJ(r.sampleDate, r.validity));
                const isValid = daysRem > 0;

                return (
                  <div
                    key={r.id}
                    className={`glass-panel-subtle p-4 space-y-2 relative transition-all rounded-xl ${
                      isValid ? 'hover:border-cyan-400/40' : 'border-rose-500/30 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-sm text-cyan-300 flex items-center gap-1.5">
                        <FlaskConical className="w-4 h-4 text-cyan-400" />
                        {r.goods}
                      </span>

                      {r.brand && (
                        <span className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs px-2.5 py-0.5 rounded-full backdrop-blur-md">
                          {r.brand}
                        </span>
                      )}

                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border backdrop-blur-md ${
                          isValid
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                            : 'bg-rose-500/10 border-rose-500/40 text-rose-400'
                        }`}
                      >
                        {isValid ? 'معتبر' : 'منقضی'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 flex items-center gap-3 pt-1">
                      <span>نمونه‌برداری: {fmtJ(r.sampleDate)}</span>
                      <span>•</span>
                      <span>اعتبار: {fa(r.validity)} ماه</span>
                    </div>

                    <div className="text-xs font-medium text-cyan-300 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>{isValid ? `باقی‌مانده: ${remTxt(daysRem)}` : 'اعتبار این آزمایش پایان یافته است'}</span>
                    </div>

                    {r.comment && (
                      <p className="text-xs text-slate-300 bg-black/20 p-2.5 rounded-lg border border-white/5 mt-2 leading-relaxed">
                        {r.comment}
                      </p>
                    )}
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
};
