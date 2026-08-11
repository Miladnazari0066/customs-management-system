import React, { useState } from 'react';
import {
  Database,
  Cloud,
  CloudCheck,
  CloudOff,
  RefreshCw,
  UploadCloud,
  DownloadCloud,
  Key,
  Globe,
  X,
  CheckCircle2,
  AlertTriangle,
  Info,
  ShieldCheck,
  FileCode,
  Copy,
  Check,
} from 'lucide-react';
import {
  getSavedSupabaseCredentials,
  saveSupabaseCredentials,
  clearSupabaseCredentials,
  isSupabaseConfigured,
} from '../lib/supabase';
import { fetchAllDataFromCloud, migrateLocalDataToCloud, AllAppData } from '../services/db';
import { SUPABASE_SQL_SCHEMA } from '../utils/sqlSchema';

interface CloudDbSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  localData?: AllAppData;
  onSyncComplete?: (cloudData: AllAppData) => void;
  onDataReload?: (cloudData: AllAppData) => void;
  addToast?: (msg: string, type: 'ok' | 'err') => void;
}

export const CloudDbSyncModal: React.FC<CloudDbSyncModalProps> = ({
  isOpen,
  onClose,
  localData,
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
  const [activeTab, setActiveTab] = useState<'status' | 'setup' | 'sql' | 'migration' | 'backup'>('status');

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

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    notify('اسکریپت SQL ساخت جداول با موفقیت کپی شد', 'ok');
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
      notify('آدرس دیتابیس معتبر نیست (باید با https:// شروع شود)', 'err');
      return;
    }

    try {
      const data = await fetchAllDataFromCloud();
      setTesting(false);
      notify('اتصال به دیتابیس ابری Supabase با موفقیت برقرار شد', 'ok');
      if (data) {
        triggerSyncComplete(data);
      }
    } catch (err: any) {
      setTesting(false);
      if (err?.code === 'PGRST205' || err?.isTableMissing) {
        setTableMissing(true);
        notify('اتصال برقرار شد اما جداول در Supabase ساخته نشده‌اند. لطفاً تب اسکریپت SQL را ببینید.', 'err');
      } else {
        notify(`خطا در برقراری ارتباط با دیتابیس ابری: ${err.message || 'نامشخص'}`, 'err');
      }
    }
  };

  const handleDisconnect = () => {
    clearSupabaseCredentials();
    setUrlInput('');
    setKeyInput('');
    setTableMissing(false);
    notify('اتصال ابری قطع شد. برنامه به حافظه محلی متصل است', 'ok');
  };

  const handleFetchLatest = async () => {
    setLoading(true);
    setTableMissing(false);
    try {
      const cloudData = await fetchAllDataFromCloud();
      setLoading(false);
      if (cloudData) {
        triggerSyncComplete(cloudData);
        notify('آخرین اطلاعات با موفقیت از دیتابیس ابری دریافت گردید', 'ok');
      } else {
        notify('دیتابیس ابری پیکربندی نشده است', 'err');
      }
    } catch (err: any) {
      setLoading(false);
      if (err?.code === 'PGRST205' || err?.isTableMissing) {
        setTableMissing(true);
        notify('جداول در دیتابیس Supabase هنوز ایجاد نشده‌اند. لطفاً کد SQL را اجرا کنید.', 'err');
      } else {
        notify(`خطا در همگام‌سازی: ${err.message || 'مشکل در شبکه'}`, 'err');
      }
    }
  };

  const handleMigrateLocalData = async () => {
    if (!isConfigured) {
      notify('ابتدا اتصال دیتابیس ابری Supabase را پیکربندی کنید', 'err');
      return;
    }

    setLoading(true);
    try {
      const res = await migrateLocalDataToCloud(safeLocalData);
      setLoading(false);
      notify(
        `مهاجرت با موفقیت انجام شد: ${res.docsSynced} سند ورود، ${res.exitsSynced} سند خروج و ${res.batchesSynced} تجمیع منتقل شدند.`,
        'ok'
      );
      // Refresh state from cloud
      const updated = await fetchAllDataFromCloud();
      if (updated) triggerSyncComplete(updated);
    } catch (err: any) {
      setLoading(false);
      notify(`خطا در انتقال داده‌های محلی: ${err.message || 'مشکل در ارزیابی'}`, 'err');
    }
  };

  const handleExportJsonBackup = () => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(safeLocalData, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `gomrok_backup_${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    notify('فایل پشتیبان JSON با موفقیت دانلود شد', 'ok');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in dir-rtl font-sans">
      <div className="bg-slate-900 border border-cyan-500/30 rounded-3xl p-6 sm:p-7 max-w-2xl w-full text-slate-100 shadow-2xl space-y-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-2xl border ${
              isConfigured
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : 'bg-amber-500/20 border-amber-500/40 text-amber-400'
            }`}>
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-lalezar text-xl text-slate-100 flex items-center gap-2">
                <span>مدیریت دیتابیس ابری (Cloud Database)</span>
              </h3>
              <p className="text-xs text-slate-400">
                ذخیره‌سازی دائم اطلاعات در Supabase PostgreSQL و دسترسی از تمامی دستگاه‌ها
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-white/5 hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-3 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('status')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'status'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>وضعیت اتصال</span>
          </button>

          <button
            onClick={() => setActiveTab('setup')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'setup'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>تنظیمات Supabase</span>
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : tableMissing
                ? 'bg-amber-500/10 text-amber-400 animate-pulse border border-amber-500/30'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>اسکریپت SQL جداول</span>
            {tableMissing && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('migration')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'migration'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>انتقال داده محلی به ابری</span>
          </button>

          <button
            onClick={() => setActiveTab('backup')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'backup'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                : 'bg-white/5 text-slate-400 hover:text-white'
            }`}
          >
            <DownloadCloud className="w-4 h-4" />
            <span>پشتیبان‌گیری و بکاپ</span>
          </button>
        </div>

        {/* TAB 1: STATUS */}
        {activeTab === 'status' && (
          <div className="space-y-4">
            {tableMissing && (
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-amber-300">
                  <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                  <span>خطای عدم وجود جداول در Supabase (کد PGRST205)</span>
                </div>
                <p className="leading-relaxed opacity-90">
                  اتصال به Supabase برقرار است اما جداول پایگاه داده هنوز در پروژه Supabase شما ساخته نشده‌اند.
                  لطفاً اسکریپت SQL را از تب «اسکریپت SQL جداول» کپی کرده و در بخش SQL Editor داشبورد Supabase خود اجرا نمایید.
                </p>
                <button
                  onClick={() => setActiveTab('sql')}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold flex items-center gap-1.5 transition-all mt-1"
                >
                  <FileCode className="w-4 h-4" />
                  <span>مشاهده و کپی کد SQL ساخت جداول</span>
                </button>
              </div>
            )}

            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              isConfigured
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}>
              <div className="flex items-center gap-3">
                {isConfigured ? (
                  <CloudCheck className="w-7 h-7 text-emerald-400" />
                ) : (
                  <CloudOff className="w-7 h-7 text-amber-400" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {isConfigured
                      ? 'دیتابیس ابری Supabase متصل است'
                      : 'حالت آفلاین (ذخیره‌سازی روی مرورگر LocalStorage)'}
                  </h4>
                  <p className="text-xs opacity-80 mt-0.5">
                    {isConfigured
                      ? 'اطلاعات شما به صورت همزمان در پایگاه داده PostgreSQL ابری ثبت می‌شود.'
                      : 'اطلاعات فقط روی این مرورگر ذخیره شده است. برای عدم از دست رفتن اطلاعات، Supabase را وصل کنید.'}
                  </p>
                </div>
              </div>

              {isConfigured && (
                <button
                  onClick={handleFetchLatest}
                  disabled={loading}
                  className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>بروزرسانی</span>
                </button>
              )}
            </div>

            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 space-y-3">
              <h5 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-cyan-400" />
                <span>آمار رکوردها در سیستم:</span>
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[11px]">اسناد ورود:</span>
                  <b className="text-cyan-300 text-sm">{safeLocalData.docs.length}</b>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[11px]">اسناد خروج:</span>
                  <b className="text-emerald-300 text-sm">{safeLocalData.exits.length}</b>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[11px]">کدهای تجمیع:</span>
                  <b className="text-amber-300 text-sm">{safeLocalData.batches.length}</b>
                </div>
                <div className="bg-slate-800/80 p-2.5 rounded-xl border border-white/5">
                  <span className="text-slate-400 block text-[11px]">آزمایشگاه:</span>
                  <b className="text-purple-300 text-sm">{safeLocalData.labRecords.length}</b>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SETUP */}
        {activeTab === 'setup' && (
          <div className="space-y-4">
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-cyan-400" />
                  <span>آدرس پروژه Supabase (Supabase URL):</span>
                </label>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://your-project.supabase.co"
                  className="w-full glass-input rounded-xl p-2.5 text-xs text-cyan-300 font-mono outline-none border border-cyan-500/30 dir-ltr"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>کلید عمومی Supabase (Anon Key):</span>
                </label>
                <textarea
                  rows={2}
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full glass-input rounded-xl p-2.5 text-xs text-amber-300 font-mono outline-none border border-amber-500/30 dir-ltr resize-none"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 text-[11px] space-y-1">
              <p className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
                <span>نکته مهم امنیتی برای GitHub Pages:</span>
              </p>
              <p className="opacity-90">
                کلید `anon_key` تنها دسترسی سطح عمومی دارد و هیچ‌گاه کلید مدیر (`service_role`) را در فرانت‌اند قرار ندهید. همچنین می‌توانید این مقادیر را در `VITE_SUPABASE_URL` و `VITE_SUPABASE_ANON_KEY` در گیت‌هاب ست کنید.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              {isConfigured && (
                <button
                  onClick={handleDisconnect}
                  className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-all"
                >
                  قطع اتصال دیتابیس
                </button>
              )}

              <button
                onClick={handleSaveConnection}
                disabled={testing}
                className="mr-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{testing ? 'در حال آزمایش اتصال...' : 'ثبت و اتصال به Supabase'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SQL SCHEMA */}
        {activeTab === 'sql' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-slate-300">
              <h4 className="font-bold text-amber-300 text-sm flex items-center gap-2">
                <FileCode className="w-5 h-5 text-amber-400" />
                <span>اسکریپت ساخت جداول در Supabase (حل خطای PGRST205)</span>
              </h4>
              <p className="leading-relaxed opacity-90">
                اگر پیام خطای «PGRST205» دریافت می‌کنید، به این معناست که جداول دیتابیس هنوز در پروژه‌ی Supabase شما ساخته نشده‌اند.
                کافیست اسکریپت زیر را کپی کرده و در داشبورد Supabase بخش <b>SQL Editor</b> چسبانده و دکمه <b>Run</b> را بزنید:
              </p>
            </div>

            <div className="relative group">
              <pre className="p-3.5 rounded-xl bg-slate-950 border border-white/10 font-mono text-[11px] text-amber-200/90 overflow-x-auto max-h-56 dir-ltr leading-relaxed">
                {SUPABASE_SQL_SCHEMA}
              </pre>

              <button
                onClick={handleCopySql}
                className="absolute top-2.5 left-2.5 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md"
              >
                {copiedSql ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی اسکریپت SQL</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={handleCopySql}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs shadow-lg transition-all flex items-center gap-2"
              >
                {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copiedSql ? 'کد SQL کپی گردید' : 'کپی کل اسکریپت SQL جهت اجرا در Supabase'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: MIGRATION */}
        {activeTab === 'migration' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 space-y-2">
              <h4 className="font-bold text-cyan-300 text-sm flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-cyan-400" />
                <span>انتقال داده‌های محلی موجود به Supabase</span>
              </h4>
              <p className="text-slate-300 leading-relaxed">
                اگر قبلاً اطلاعاتی در مرورگر ثبت کرده‌اید، می‌توانید با زدن دکمه زیر، تمامی اسناد، پرونده‌ها، کدهای تجمیع و آزمایشگاه را بدون هیچ‌گونه حذف یا تغییر به دیتابیس ابری جدید منتقل کنید.
              </p>
            </div>

            <div className="bg-slate-800/60 p-3 rounded-xl border border-white/5 space-y-1">
              <p className="text-slate-400 text-[11px]">تعداد رکوردهای آماده انتقال:</p>
              <p className="font-mono text-cyan-300">
                {safeLocalData.docs.length} سند ورود | {safeLocalData.exits.length} سند خروج | {safeLocalData.batches.length} کد تجمیع
              </p>
            </div>

            <button
              onClick={handleMigrateLocalData}
              disabled={loading || !isConfigured}
              className={`w-full py-3 rounded-xl font-bold text-xs shadow-xl transition-all flex items-center justify-center gap-2 ${
                isConfigured
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950'
                  : 'bg-slate-700 text-slate-400 cursor-not-allowed'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>
                {loading
                  ? 'در حال انتقال داده‌ها به دیتابیس ابری...'
                  : 'انتقال داده‌های موجود به دیتابیس ابری (Import to Cloud)'}
              </span>
            </button>
          </div>
        )}

        {/* TAB 4: BACKUP & RESTORE */}
        {activeTab === 'backup' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 space-y-2">
              <h4 className="font-bold text-purple-300 text-sm flex items-center gap-2">
                <FileCode className="w-5 h-5 text-purple-400" />
                <span>پشتیبان‌گیری (Backup) فایل JSON</span>
              </h4>
              <p className="leading-relaxed text-slate-300">
                جهت اطمینان کامل از حفظ داده‌ها، می‌توانید همیشه یک نسخه پشتیبان آفلاین با فرمت استاندارد JSON روی رایانه خود دانلود و نگهداری کنید.
              </p>
            </div>

            <button
              onClick={handleExportJsonBackup}
              className="w-full py-3 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <DownloadCloud className="w-4 h-4 text-purple-400" />
              <span>دانلود نسخه پشتیبان کامل سیستم (JSON Backup)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
