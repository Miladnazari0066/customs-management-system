import React, { useState, useMemo, useEffect } from 'react';
import {
  Truck,
  Package,
  Layers,
  CheckCircle2,
  Printer,
  Search,
  FolderSearch,
  FileText,
  X,
  Sparkles,
  Info,
  RefreshCw,
  Download,
  FileDown,
} from 'lucide-react';
import { EntryDoc, ExitDoc, Batch } from '../types';
import { fa, todayJ } from '../utils/jalali';

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
  // Extract all distinct file numbers available in system
  const availableFileNos = useMemo(() => {
    const set = new Set<string>();
    docs.forEach((d) => d.file && set.add(d.file.trim()));
    exits.forEach((x) => x.file && set.add(x.file.trim()));
    batches.forEach((b) => b.file && set.add(b.file.trim()));
    return Array.from(set).sort();
  }, [docs, exits, batches]);

  // States
  const [selectedFileNo, setSelectedFileNo] = useState<string | null>(null);
  const [fileInputModal, setFileInputModal] = useState<string>('');
  const [showFileModal, setShowFileModal] = useState<boolean>(true);
  const [listSearch, setListSearch] = useState<string>('');

  // Automatically pre-fill modal with the first available file number if any
  useEffect(() => {
    if (!selectedFileNo && availableFileNos.length > 0) {
      setFileInputModal(availableFileNos[0]);
    }
  }, [availableFileNos, selectedFileNo]);

  // Handler to submit file number selection
  const handleSelectFileNo = (fileNo: string) => {
    const trimmed = fileNo.trim();
    if (!trimmed) return;
    setSelectedFileNo(trimmed);
    setShowFileModal(false);
  };

  // Filter docs, exits, and batches based on selectedFileNo
  const fileDocs = useMemo(() => {
    if (!selectedFileNo) return [];
    if (selectedFileNo === 'ALL') return docs;
    return docs.filter((d) => d.file && d.file.trim() === selectedFileNo);
  }, [docs, selectedFileNo]);

  const fileExits = useMemo(() => {
    if (!selectedFileNo) return [];
    if (selectedFileNo === 'ALL') return exits;
    return exits.filter((x) => x.file && x.file.trim() === selectedFileNo);
  }, [exits, selectedFileNo]);

  const fileBatches = useMemo(() => {
    if (!selectedFileNo) return [];
    if (selectedFileNo === 'ALL') return batches;
    return batches.filter((b) => b.file && b.file.trim() === selectedFileNo);
  }, [batches, selectedFileNo]);

  // Secondary search filter for the List view
  const filteredListDocs = useMemo(() => {
    if (!listSearch.trim()) return fileDocs;
    const q = listSearch.trim().toLowerCase();
    return fileDocs.filter((d) => {
      const matchText = [
        d.cottage,
        d.bl,
        d.file,
        d.importer,
        d.carrier,
        d.goods,
        d.brand,
        d.receipt?.number,
      ]
        .join(' ')
        .toLowerCase();
      return matchText.includes(q);
    });
  }, [fileDocs, listSearch]);

  const filteredListExits = useMemo(() => {
    if (!listSearch.trim()) return fileExits;
    const q = listSearch.trim().toLowerCase();
    return fileExits.filter((x) => {
      const matchText = [
        x.cottage,
        x.bl,
        x.file,
        x.importer,
        x.carrier,
        x.goods,
        x.brand,
        x.batchId,
      ]
        .join(' ')
        .toLowerCase();
      return matchText.includes(q);
    });
  }, [fileExits, listSearch]);

  // File Number Level Metrics
  const totalCottages = useMemo(() => {
    const cottagesSet = new Set<string>();
    fileDocs.forEach((d) => d.cottage && cottagesSet.add(d.cottage.trim()));
    fileExits.forEach((x) => x.cottage && cottagesSet.add(x.cottage.trim()));
    return cottagesSet.size;
  }, [fileDocs, fileExits]);

  const primaryCompany = useMemo(() => {
    if (fileDocs.length > 0) return fileDocs[0].importer;
    if (fileExits.length > 0) return fileExits[0].importer;
    return 'نامشخص';
  }, [fileDocs, fileExits]);

  const primaryCargo = useMemo(() => {
    if (fileDocs.length > 0) return fileDocs[0].goods;
    if (fileExits.length > 0) return fileExits[0].goods;
    return 'نامشخص';
  }, [fileDocs, fileExits]);

  const totalTrailers = fileDocs.reduce((a, d) => a + (d.trailers || 0), 0);
  const unloadedTrailers = fileDocs.reduce((a, d) => a + (d.unloaded || 0), 0);
  const totalPallets = fileDocs.reduce((a, d) => a + (d.pallets || 0), 0);
  const gateExitedCount = fileExits.filter((x) => x.gate?.done).length;
  const closedExitsCount = fileExits.filter((x) => x.invoice?.paid && x.gate?.done).length;

  const unloadRatio = totalTrailers > 0 ? Math.round((unloadedTrailers / totalTrailers) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* PRINT-ONLY OFFICIAL REPORT HEADER */}
      <div className="hidden print:block border-b-2 border-slate-900 pb-4 mb-6 text-right font-sans">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-black">سامانه مدیریت گمرک و انبارداری</h1>
            <h2 className="text-sm font-semibold text-slate-700 mt-1">گزارش رسمی پرونده گمرکی</h2>
          </div>
          <div className="text-left text-xs text-slate-600 space-y-1">
            <p>شماره پرونده: <b>{selectedFileNo === 'ALL' ? 'تمامی پرونده‌ها' : fa(selectedFileNo || '-')}</b></p>
            <p>تاریخ تنظیم گزارش: <b>{fa(`${todayJ().jy}/${todayJ().jm}/${todayJ().jd}`)}</b></p>
          </div>
        </div>
        <div className="mt-3 pt-2 border-t border-slate-300 grid grid-cols-3 text-xs text-slate-800">
          <div>صاحب کالا: <b>{primaryCompany}</b></div>
          <div>نوع کالا: <b>{primaryCargo}</b></div>
          <div>تعداد کوتاژها: <b>{fa(totalCottages)}</b></div>
        </div>
      </div>

      {/* POP-UP MODAL: ENTER / SELECT FILE NUMBER */}
      {showFileModal && (
        <div className="print:hidden fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900/95 border border-cyan-500/30 rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 text-slate-100 shadow-2xl shadow-cyan-500/10">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400">
                  <FolderSearch className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-lalezar text-xl text-slate-100">ورود و جست‌وجوی شماره پرونده</h3>
                  <p className="text-xs text-slate-400">گزارش‌گیری تخصصی بر اساس شماره پرونده گمرکی</p>
                </div>
              </div>

              {selectedFileNo && (
                <button
                  onClick={() => setShowFileModal(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Input & Form */}
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-slate-300">
                لطفاً شماره پرونده مورد نظر را وارد کنید:
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={fileInputModal}
                  onChange={(e) => setFileInputModal(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSelectFileNo(fileInputModal);
                  }}
                  placeholder="مثال: ۱۰۲۳ یا 1023 ..."
                  className="w-full glass-input rounded-2xl py-3 pr-4 pl-12 text-sm text-cyan-300 font-mono outline-none border border-cyan-500/40 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20"
                  autoFocus
                />
                <button
                  onClick={() => handleSelectFileNo(fileInputModal)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition-all"
                >
                  نمایش
                </button>
              </div>
            </div>

            {/* Quick Chips of Available File Numbers */}
            {availableFileNos.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-white/10">
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>پرونده‌های فعال ثبت‌شده در سامانه:</span>
                </div>
                <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto pr-1">
                  {availableFileNos.map((fileNo) => (
                    <button
                      key={fileNo}
                      onClick={() => {
                        setFileInputModal(fileNo);
                        handleSelectFileNo(fileNo);
                      }}
                      className={`px-3 py-1.5 rounded-xl text-xs font-mono transition-all border ${
                        fileInputModal === fileNo
                          ? 'bg-cyan-500/30 text-cyan-200 border-cyan-400 font-bold shadow-md shadow-cyan-500/20'
                          : 'bg-white/5 hover:bg-white/10 text-slate-300 border-white/10'
                      }`}
                    >
                      پرونده {fa(fileNo)}
                    </button>
                  ))}
                  <button
                    onClick={() => {
                      setFileInputModal('ALL');
                      handleSelectFileNo('ALL');
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-mono bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold"
                  >
                    نمایش همه پرونده‌ها (جامع)
                  </button>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => handleSelectFileNo(fileInputModal)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/20 transition-all"
              >
                تأیید و مشاهده گزارش پرونده
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOP BAR: ACTIVE FILE NUMBER */}
      <div className="glass-panel p-5 rounded-2xl border border-white/10 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Active File Info */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/40 text-cyan-400">
            <FolderSearch className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">گزارش پرونده شماره:</span>
              <span className="font-lalezar text-2xl text-cyan-300 tracking-wider">
                {selectedFileNo === 'ALL' ? 'تمامی پرونده‌ها' : fa(selectedFileNo || '-')}
              </span>
              <button
                onClick={() => setShowFileModal(true)}
                className="print:hidden flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-all font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>تغییر شماره پرونده</span>
              </button>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              صاحب کالا: <b className="text-slate-200">{primaryCompany}</b> | کالا: <b className="text-slate-200">{primaryCargo}</b> | تعداد کوتاژ: <b className="text-amber-400">{fa(totalCottages)}</b>
            </p>
          </div>
        </div>

        {/* Action Buttons: Print & Export PDF */}
        <div className="print:hidden flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-xs font-bold text-cyan-300 hover:text-cyan-200 transition-all shadow-md"
            title="چاپ مستقیم گزارش روی کاغذ"
          >
            <Printer className="w-4 h-4 text-cyan-400" />
            <span>چاپ گزارش (Print)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-xs font-bold text-emerald-300 hover:text-emerald-200 transition-all shadow-md"
            title="دانلود فایل PDF گزارش (در پنجره بازشده گزینه Save as PDF را انتخاب کنید)"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>خروجی PDF</span>
          </button>
        </div>
      </div>

      {/* KPI METRICS CARDS FOR SELECTED FILE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 shadow-xl rounded-2xl border-r-4 border-r-cyan-400 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-2">
            <span>تعداد کوتاژهای ورودی</span>
            <Package className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-lalezar text-3xl text-slate-100">{fa(fileDocs.length)}</div>
          <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span>تریلی تخلیه‌شده:</span>
            <b className="text-cyan-400">{fa(unloadedTrailers)}</b> از <b>{fa(totalTrailers)}</b>
          </div>
          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-2 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${unloadRatio}%` }}
            />
          </div>
        </div>

        <div className="glass-panel p-5 shadow-xl rounded-2xl border-r-4 border-r-emerald-400 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-2">
            <span>اسناد خروج مرتبط</span>
            <Truck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="font-lalezar text-3xl text-slate-100">{fa(fileExits.length)}</div>
          <div className="text-[11px] text-slate-400 mt-2">
            خارج‌شده از درب: <b className="text-emerald-400">{fa(gateExitedCount)}</b> پرونده
          </div>
        </div>

        <div className="glass-panel p-5 shadow-xl rounded-2xl border-r-4 border-r-amber-400 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-2">
            <span>مجموع پالت‌های پرونده</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-lalezar text-3xl text-slate-100">{fa(totalPallets)}</div>
          <div className="text-[11px] text-slate-400 mt-2">
            تجمیع‌های فعال مرتبط: <b className="text-amber-400">{fa(fileBatches.length)}</b>
          </div>
        </div>

        <div className="glass-panel p-5 shadow-xl rounded-2xl border-r-4 border-r-purple-400 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-300 text-xs mb-2">
            <span>مختومه‌شده کامل</span>
            <CheckCircle2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-lalezar text-3xl text-slate-100">{fa(closedExitsCount)}</div>
          <div className="text-[11px] text-purple-300 mt-2 font-semibold">
            پرداخت‌شده و تسویه نهایی
          </div>
        </div>
      </div>

      {/* FILTER SEARCH BAR */}
      <div className="print:hidden glass-panel p-4 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={listSearch}
            onChange={(e) => setListSearch(e.target.value)}
            placeholder="جست‌وجو در اسناد این پرونده (کوتاژ، کالا، برند...)"
            className="w-full glass-input rounded-xl py-2 pr-10 pl-4 text-xs outline-none"
          />
        </div>

        <div className="text-xs text-slate-400 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>
            اسناد ورودی: <b className="text-cyan-300">{fa(filteredListDocs.length)}</b> | اسناد خروج: <b className="text-emerald-300">{fa(filteredListExits.length)}</b>
          </span>
        </div>
      </div>

      {/* Table 1: Entry Documents under this File Number */}
      <div className="glass-panel p-6 shadow-2xl rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-lalezar text-lg text-slate-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-cyan-400" />
            <span>۱. لیست اسناد و کوتاژهای ورودی ثبت‌شده بر اساس پرونده {selectedFileNo === 'ALL' ? '' : fa(selectedFileNo || '')}</span>
          </h3>
          <span className="text-xs text-cyan-400 font-mono">
            {fa(filteredListDocs.length)} کوتاژ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-300">
            <thead className="bg-white/5 text-slate-400 text-[11px] font-bold border-b border-white/10">
              <tr>
                <th className="p-3">شماره کوتاژ</th>
                <th className="p-3">بارنامه (BL)</th>
                <th className="p-3">شرکت صاحب کالا</th>
                <th className="p-3">نوع کالا و برند</th>
                <th className="p-3">تعداد تریلی</th>
                <th className="p-3">تعداد پالت</th>
                <th className="p-3">تاریخ تخلیه</th>
                <th className="p-3">مرحله و وضعیت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredListDocs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-500">
                    هیچ سند ورودی برای این شماره پرونده ثبت نشده است
                  </td>
                </tr>
              ) : (
                filteredListDocs.map((doc) => {
                  const stage = getStageOf(doc);
                  return (
                    <tr key={doc.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-3 font-mono text-cyan-300 font-bold">{fa(doc.cottage)}</td>
                      <td className="p-3 font-mono">{doc.bl || '-'}</td>
                      <td className="p-3 font-semibold text-slate-200">{doc.importer}</td>
                      <td className="p-3">{doc.goods} ({doc.brand})</td>
                      <td className="p-3">
                        {fa(doc.unloaded)} از {fa(doc.trailers)} تریلی
                      </td>
                      <td className="p-3 font-mono text-amber-300 font-bold">{fa(doc.pallets)}</td>
                      <td className="p-3 font-mono">
                        {doc.unloadDate ? `${fa(doc.unloadDate.jy)}/${fa(doc.unloadDate.jm)}/${fa(doc.unloadDate.jd)}` : '-'}
                      </td>
                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-block ${
                          stage === 1
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : stage === 4
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : stage === 5
                            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                            : stage === 6
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {stage === 1 ? 'در حال تخلیه' : stage === 4 ? 'کامل' : stage === 5 ? 'در تجمیع' : stage === 6 ? 'آماده خروج' : 'در حال تکمیل'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table 2: Exit Documents under this File Number */}
      <div className="glass-panel p-6 shadow-2xl rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h3 className="font-lalezar text-lg text-slate-100 flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-400" />
            <span>۲. لیست اسناد خروج ثبت‌شده بر اساس پرونده {selectedFileNo === 'ALL' ? '' : fa(selectedFileNo || '')}</span>
          </h3>
          <span className="text-xs text-emerald-400 font-mono">
            {fa(filteredListExits.length)} سند خروج
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs text-slate-300">
            <thead className="bg-white/5 text-slate-400 text-[11px] font-bold border-b border-white/10">
              <tr>
                <th className="p-3">کد تجمیع خروج</th>
                <th className="p-3">شماره کوتاژ</th>
                <th className="p-3">مسیر گمرکی</th>
                <th className="p-3">ارزیاب / جهاد</th>
                <th className="p-3">آزمایشگاه</th>
                <th className="p-3">صورت‌حساب</th>
                <th className="p-3">درب خروج</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredListExits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-500">
                    هیچ سند خروجی برای این شماره پرونده ثبت نشده است
                  </td>
                </tr>
              ) : (
                filteredListExits.map((exit) => (
                  <tr key={exit.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-3 font-mono text-cyan-300 font-bold">{exit.batchId || '-'}</td>
                    <td className="p-3 font-mono text-amber-300">{fa(exit.cottage)}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        exit.route === 'red' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      }`}>
                        {exit.route === 'red' ? 'مسیر قرمز' : 'مسیر زرد'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={exit.evaluator?.done ? 'text-emerald-400' : 'text-slate-500'}>
                        ارزیاب: {exit.evaluator?.done ? '✓' : '✗'}
                      </span>
                    </td>
                    <td className="p-3">
                      {exit.lab?.needed ? (
                        <span className={exit.lab?.tested ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
                          {exit.lab?.tested ? 'تأیید شد' : 'در حال آزمایش'}
                        </span>
                      ) : (
                        <span className="text-slate-500">نیازمند نیست</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className={exit.invoice?.paid ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                        {exit.invoice?.paid ? 'تسویه شد' : 'پرداخت نشده'}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={exit.gate?.done ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {exit.gate?.done ? 'خارج شده' : 'منتظر خروج'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
