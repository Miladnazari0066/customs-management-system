import React, { useState } from 'react';
import {
  Cloud,
  CloudCheck,
  CloudOff,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Key,
  Globe,
  X,
  FileCode,
  Copy,
  Check,
  Clock,
  HardDrive,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  getSavedSupabaseCredentials,
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  isSupabaseConfigured,
} from '../lib/supabase';
import { fetchAllDataFromCloud, migrateLocalDataToCloud, AllAppData } from '../services/db';
import { SUPABASE_SQL_SCHEMA } from '../utils/sqlSchema';
import { fa, pad2, toJalali, WDN, JMONTHS } from '../utils/jalali';

interface CloudDbSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  localData?: AllAppData;
  lastCloudSyncTime?: Date | null;
  onSyncComplete?: (cloudData: AllAppData) => void;
  onDataReload?: (cloudData: AllAppData) => void;
  addToast?: (msg: string, type: 'ok' | 'err') => void;
}

export const CloudDbSyncModal: React.FC<CloudDbSyncModalProps> = ({
  isOpen,
  onClose,
  localData,
  lastCloudSyncTime,
  onSyncComplete,
  onDataReload,
  addToast,
}) => {
  const credentials = getSavedSupabaseCredentials();
  const [urlInput, setUrlInput] = useState<string>(credentials.url);
  const [keyInput, setKeyInput] = useState<string>(credentials.key);
  const [loading, setLoading] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [tableMissing, setTableMissing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'connection' | 'backup' | 'sql'>('connection');

  if (!isOpen) return null;

  const isConfigured = isSupabaseConfigured();

  const safeLocalData: AllAppData = {
    docs: localData?.docs || [],
    batches: localData?.batches || [],
    exits: localData?.exits || [],
    labRecords: localData?.labRecords || [],
    importers: localData?.importers || [],
    carriers: localData?.carriers || [],
    goodsList: localData?.goodsList || [],
    brands: localData?.brands || [],
  };

  const notify = (msg: string, type: 'ok' | 'err') => {
    if (addToast) addToast(msg, type);
  };

  const triggerSyncComplete = (cloudData: AllAppData) => {
    if (onSyncComplete) onSyncComplete(cloudData);
    if (onDataReload) onDataReload(cloudData);
  };

  const formatTimestamp = (d: Date | null | undefined) => {
    if (!d) return 'هنوز ذخیره نشده است';
    const j = toJalali(d.getFullYear(), d.getMonth() + 1, d.getDate());
    const datePart = `${WDN[d.getDay()]} ${fa(j.jd)} ${JMONTHS[j.jm - 1]} ${fa(j.jy)}`;
    const timePart = fa(`${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`);
    return `${timePart} — ${datePart}`;
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    notify('اسکریپت SQL ساخت جداول کپی شد', 'ok');
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleSaveConnection = async () => {
    if (!urlInput.trim() || !keyInput.trim()) {
      notify('لطفاً آدرس Supabase URL و Anon Key را وارد کنید', 'err');
      return;
    }

    setTesting(true);
    setTableMissing(false);
    const success = saveSupabaseCredentials(urlInput, keyInput);

    if (!success) {
      setTesting(false);
      notify('آدرس معتبر نیست (باید با https:// شروع شود)', 'err');
      return;
    }

    try {
      const data = await fetchAllDataFromCloud();
      setTesting(false);
      notify('اتصال به دیتابیس ابری Supabase برقرار شد', 'ok');
      if (data) {
        triggerSyncComplete(data);
      }
    } catch (err: any) {
      setTesting(false);
      if (err?.code === 'PGRST205' || err?.isTableMissing) {
        setTableMissing(true);
        notify('اتصال برقرار شد اما جداول در Supabase ایجاد نشده‌اند. اسکریپت SQL را اجرا کنید.', 'err');
      } else {
        notify(`خطا در برقراری ارتباط: ${err.message || 'نامشخص'}`, 'err');
      }
    }
  };

  const handleDisconnect = () => {
    clearSupabaseCredentials();
    setUrlInput('');
    setKeyInput('');
    setTableMissing(false);
    notify('اتصال ابری قطع گردید', 'ok');
  };

  const handleFetchLatest = async () => {
    setLoading(true);
    setTableMissing(false);
    try {
      const cloudData = await fetchAllDataFromCloud();
      setLoading(false);
      if (cloudData) {
        triggerSyncComplete(cloudData);
        notify('آخرین داده‌ها با موفقیت دریافت شدند', 'ok');
      } else {
        notify('دیتابیس ابری متصل نیست', 'err');
      }
    } catch (err: any) {
      setLoading(false);
      if (err?.code === 'PGRST205' || err?.isTableMissing) {
        setTableMissing(true);
        notify('جداول هنوز در Supabase ساخته نشده‌اند', 'err');
      } else {
        notify(`خطا در دریافت داده‌ها: ${err.message || 'مشکل در شبکه'}`, 'err');
      }
    }
  };

  const handleManualPushCloud = async () => {
    if (!isConfigured) {
      notify('ابتدا دیتابیس ابری را متصل کنید', 'err');
      return;
    }

    setLoading(true);
    try {
      await migrateLocalDataToCloud(safeLocalData);
      setLoading(false);
      notify('تمام داده‌های محلی با موفقیت به دیتابیس ابری منتقل گردیدند', 'ok');
    } catch (err: any) {
      setLoading(false);
      notify(`خطا در ذخیره داده‌ها: ${err.message || 'مشکل در شبکه'}`, 'err');
    }
  };

  const handleExportBackup = () => {
    const backupObj = {
      app: 'CustomsTerminal',
      version: '2.0',
      exportedAt: new Date().toISOString(),
      data: safeLocalData,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(backupObj, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `customs_terminal_backup_${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    notify('فایل پشتیبان کامل (JSON) دانلود شد', 'ok');
  };

  const handleImportBackupFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const text = evt.target?.result as string;
        const parsed = JSON.parse(text);

        const payload: AllAppData = parsed.data || parsed;

        if (
          !Array.isArray(payload.docs) &&
          !Array.isArray(payload.exits) &&
          !Array.isArray(payload.batches)
        ) {
          throw new Error('ساختار فایل پشتیبان معتبر نیست.');
        }

        const restoredData: AllAppData = {
          docs: Array.isArray(payload.docs) ? payload.docs : [],
          batches: Array.isArray(payload.batches) ? payload.batches : [],
          exits: Array.isArray(payload.exits) ? payload.exits : [],
          labRecords: Array.isArray(payload.labRecords) ? payload.labRecords : [],
          importers: Array.isArray(payload.importers) ? payload.importers : [],
          carriers: Array.isArray(payload.carriers) ? payload.carriers : [],
          goodsList: Array.isArray(payload.goodsList) ? payload.goodsList : [],
          brands: Array.isArray(payload.brands) ? payload.brands : [],
        };

        triggerSyncComplete(restoredData);

        if (isConfigured) {
          await migrateLocalDataToCloud(restoredData);
        }

        notify('اطلاعات سامانه با موفقیت از فایل پشتیبان بازیابی گردید', 'ok');
      } catch (err: any) {
        notify(`خطا در ایمپورت فایل پشتیبان: ${err.message || 'فایل نامعتبر است'}`, 'err');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between bg-slate-900/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                مدیریت دیتابیس ابری و پشتیبان‌گیری
                {isConfigured ? (
                  <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    ذخیره‌سازی خودکار (هر ۲ ثانیه)
                  </span>
                ) : (
                  <span className="text-[11px] font-normal px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    آفلاین (حافظه محلی)
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                همگام‌سازی ابری سریع، دانلود فایل پشتیبان کامل و ساخت اسکریپت SQL
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-100 hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-white/10 bg-slate-950/50 px-6 gap-2 pt-2">
          <button
            onClick={() => setActiveTab('connection')}
            className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'connection'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            {isConfigured ? (
              <CloudCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <CloudOff className="w-4 h-4 text-amber-400" />
            )}
            <span>اتصال و وضعیت ابری</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'backup'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <HardDrive className="w-4 h-4 text-purple-400" />
            <span>پشتیبان‌گیری و بازیابی (JSON)</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`px-4 py-3 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 border-b-2 ${
              activeTab === 'sql'
                ? 'border-cyan-400 text-cyan-300 bg-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-4 h-4 text-blue-400" />
            <span>اسکریپت SQL جداول</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">
          {/* TAB 1: Connection & Auto Sync Status */}
          {activeTab === 'connection' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              {/* Last Auto-Save Banner */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isConfigured
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isConfigured ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                    }`}
                  >
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-300 block">آخرین زمان ذخیره‌سازی اطلاعات:</span>
                    <strong className="text-sm font-mono text-cyan-300">
                      {formatTimestamp(lastCloudSyncTime)}
                    </strong>
                  </div>
                </div>

                <div className="text-left text-xs">
                  {isConfigured ? (
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                      ذخیره خودکار ابری فعال
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      ذخیره‌سازی روی حافظه مرورگر
                    </span>
                  )}
                </div>
              </div>

              {/* Data Statistics Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="bg-slate-800/80 p-3 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-slate-400 text-[11px]">اسناد ورود:</span>
                  <b className="text-cyan-300 text-base block font-mono">{safeLocalData.docs.length}</b>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-slate-400 text-[11px]">اسناد خروج:</span>
                  <b className="text-emerald-300 text-base block font-mono">{safeLocalData.exits.length}</b>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-slate-400 text-[11px]">کدهای تجمیع:</span>
                  <b className="text-amber-300 text-base block font-mono">{safeLocalData.batches.length}</b>
                </div>
                <div className="bg-slate-800/80 p-3 rounded-2xl border border-white/5 space-y-1">
                  <span className="text-slate-400 text-[11px]">سوابق آزمایشگاه:</span>
                  <b className="text-purple-300 text-base block font-mono">{safeLocalData.labRecords.length}</b>
                </div>
              </div>

              {/* Table Missing Warning */}
              {tableMissing && (
                <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-amber-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>جداول Supabase هنوز ساخت‌یافته نیستند!</span>
                  </div>
                  <p>
                    اتصال برقرار است اما جداول اطلاعاتی یافت نشدند. به تب «اسکریپت SQL جداول» بروید و
                    کد آماده را در Supabase SQL Editor اجرا کنید.
                  </p>
                </div>
              )}

              {/* Credentials Form */}
              <div className="p-5 rounded-2xl bg-slate-800/50 border border-white/10 space-y-4">
                <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  تنظیمات اتصال به Supabase
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Supabase Project URL:</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={urlInput}
                        onChange={(e) => setUrlInput(e.target.value)}
                        placeholder="https://xyzcompany.supabase.co"
                        className="w-full glass-input pr-9 pl-3 py-2.5 text-xs font-mono text-cyan-300"
                        dir="ltr"
                      />
                      <Globe className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Anon Public Key:</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={keyInput}
                        onChange={(e) => setKeyInput(e.target.value)}
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                        className="w-full glass-input pr-9 pl-3 py-2.5 text-xs font-mono text-amber-300"
                        dir="ltr"
                      />
                      <Key className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <button
                    onClick={handleSaveConnection}
                    disabled={testing}
                    className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-xs rounded-xl hover:from-cyan-400 hover:to-blue-500 transition-all shadow-md flex items-center gap-2 disabled:opacity-50"
                  >
                    {testing ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CloudCheck className="w-4 h-4" />
                    )}
                    <span>{isConfigured ? 'بروزرسانی اتصال ابری' : 'اتصال به Supabase'}</span>
                  </button>

                  {isConfigured && (
                    <>
                      <button
                        onClick={handleFetchLatest}
                        disabled={loading}
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-slate-200 font-bold text-xs rounded-xl transition-all border border-white/10 flex items-center gap-2 disabled:opacity-50"
                      >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        <span>دریافت آخرین اطلاعات از ابر</span>
                      </button>

                      <button
                        onClick={handleManualPushCloud}
                        disabled={loading}
                        className="px-4 py-2.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold text-xs rounded-xl transition-all flex items-center gap-2 disabled:opacity-50"
                      >
                        <UploadCloud className="w-4 h-4" />
                        <span>ذخیره دستی سریع به ابر</span>
                      </button>

                      <button
                        onClick={handleDisconnect}
                        className="px-3 py-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl transition-colors text-xs mr-auto"
                      >
                        قطع اتصال ابری
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Backup & Restore */}
          {activeTab === 'backup' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-white/10 space-y-2 text-xs">
                <h3 className="font-bold text-purple-300 flex items-center gap-2 text-sm">
                  <HardDrive className="w-4 h-4" />
                  پشتیبان‌گیری کامل و بازیابی اطلاعات سامانه
                </h3>
                <p className="text-slate-300">
                  شما می‌توانید در هر زمان، یک فایل بکاپ شامل تمام اسناد ورود، خروج، کدهای تجمیع، سوابق
                  آزمایشگاه و لیست‌های اختصاصی دانلود کرده و در صورت نیاز دوباره آن را به سامانه ایمپورت
                  کنید.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Export Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-500/10 to-slate-800/80 border border-purple-500/30 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
                      <DownloadCloud className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-purple-200">دانلود فایل بکاپ کامل (JSON)</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      دانلود تمامی اسناد و لیست‌های سامانه در قالب یک فایل استاندارد JSON جهت نگهداری امن
                      روی رایانه شما.
                    </p>
                  </div>

                  <button
                    onClick={handleExportBackup}
                    className="w-full py-3 px-4 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2"
                  >
                    <DownloadCloud className="w-4 h-4" />
                    <span>دانلود فایل بکاپ کامل (JSON)</span>
                  </button>
                </div>

                {/* Import Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-b from-cyan-500/10 to-slate-800/80 border border-cyan-500/30 space-y-4 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-sm text-cyan-200">بازیابی و ایمپورت بکاپ</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      بارگذاری فایل بکاپ قبلی جهت بازگردانی آنی تمام داده‌ها به سامانه و دیتابیس ابری.
                    </p>
                  </div>

                  <label className="w-full py-3 px-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer text-center">
                    <UploadCloud className="w-4 h-4" />
                    <span>انتخاب فایل بکاپ (JSON) جهت بازیابی</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackupFile}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SQL Script Setup */}
          {activeTab === 'sql' && (
            <div className="space-y-4 animate-in fade-in duration-200 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-200 text-sm">اسکریپت کد ساخت جداول در Supabase</h3>
                  <p className="text-slate-400 text-[11px]">
                    این کد را کپی کرده و در بخش SQL Editor پنل Supabase اجرا کنید.
                  </p>
                </div>

                <button
                  onClick={handleCopySql}
                  className="px-3.5 py-2 bg-amber-400 text-slate-950 font-bold rounded-xl hover:bg-amber-300 transition-colors flex items-center gap-2 shadow-sm"
                >
                  {copiedSql ? <Check className="w-4 h-4 text-emerald-950" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? 'کپی شد!' : 'کپی اسکریپت SQL'}</span>
                </button>
              </div>

              <div className="relative rounded-2xl bg-slate-950 border border-white/10 p-4 font-mono text-[11px] text-cyan-300 max-h-80 overflow-y-auto leading-relaxed dir-ltr">
                <pre>{SUPABASE_SQL_SCHEMA}</pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10 bg-slate-900/90 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-slate-400">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>سامانه گمرک — همگام‌سازی و ذخیره‌سازی اطلاعات</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-white/10 hover:bg-white/20 text-slate-200 font-bold rounded-xl transition-colors"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};
