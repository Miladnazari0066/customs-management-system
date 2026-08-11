import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { LoginGate } from './components/LoginGate';
import { ToastContainer, ToastMessage } from './components/Toast';
import { ConfirmModal } from './components/ConfirmModal';
import { PasswordModal } from './components/PasswordModal';
import { EntryForm } from './components/EntryForm';
import { EntryCard } from './components/EntryCard';
import { ConsolidationSection } from './components/ConsolidationSection';
import { ExitForm } from './components/ExitForm';
import { ExitCard } from './components/ExitCard';
import { LabRecordsSection } from './components/LabRecordsSection';
import { ReportsSection } from './components/ReportsSection';
import { JalaliDatePicker } from './components/JalaliDatePicker';
import { CloudDbSyncModal } from './components/CloudDbSyncModal';
import {
  EntryDoc,
  Batch,
  ExitDoc,
  LabRecord,
  MainTabType,
  EntrySubTab,
  ExitSubTab,
  EntryFilterType,
  ExitFilterType,
  JalaliDate,
} from './types';
import {
  loadAllData,
  saveAllData,
  clearAllTestData,
  DEFAULT_IMPORTERS,
  DEFAULT_CARRIERS,
  DEFAULT_GOODS,
  DEFAULT_BRANDS,
} from './utils/storage';
import { fa, uid, todayJ, en, j2d, d2j, jMonthLen } from './utils/jalali';
import { isSupabaseConfigured } from './lib/supabase';
import {
  fetchAllDataFromCloud,
  saveEntryDocCloud,
  deleteEntryDocCloud,
  saveBatchCloud,
  deleteBatchCloud,
  saveExitDocCloud,
  deleteExitDocCloud,
  saveLabRecordCloud,
  deleteLabRecordCloud,
  saveLookupOptionsCloud,
  AllAppData,
} from './services/db';
import {
  PackageCheck,
  LogOut,
  BarChart3,
  Layers,
  FlaskConical,
  Plus,
  Search,
  Truck,
  CheckCircle2,
  Clock,
  Layers3,
  Lock,
  Calendar,
  X,
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('gm_auth') === '1';
  });

  const [mainTab, setMainTab] = useState<MainTabType>('entry');
  const [entrySubTab, setEntrySubTab] = useState<EntrySubTab>('docs');
  const [exitSubTab, setExitSubTab] = useState<ExitSubTab>('docs');

  // Cloud Sync Modal State
  const [isCloudDbModalOpen, setIsCloudDbModalOpen] = useState(false);

  // Application Data States
  const [docs, setDocs] = useState<EntryDoc[]>([]);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [exits, setExits] = useState<ExitDoc[]>([]);
  const [labRecords, setLabRecords] = useState<LabRecord[]>([]);
  const [importers, setImporters] = useState<string[]>([]);
  const [carriers, setCarriers] = useState<string[]>([]);
  const [goodsList, setGoodsList] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  // Editing States
  const [editingDoc, setEditingDoc] = useState<EntryDoc | null>(null);
  const [editingExitDoc, setEditingExitDoc] = useState<ExitDoc | null>(null);

  // Search & Filter (Entry)
  const [entrySearch, setEntrySearch] = useState('');
  const [entryFilter, setEntryFilter] = useState<EntryFilterType>('all');
  const [entryStartDate, setEntryStartDate] = useState<JalaliDate | null>(null);
  const [entryEndDate, setEntryEndDate] = useState<JalaliDate | null>(null);
  const [showEntryDateFilter, setShowEntryDateFilter] = useState(false);

  // Search & Filter (Exit)
  const [exitSearch, setExitSearch] = useState('');
  const [exitFilter, setExitFilter] = useState<ExitFilterType>('all');
  const [exitStartDate, setExitStartDate] = useState<JalaliDate | null>(null);
  const [exitEndDate, setExitEndDate] = useState<JalaliDate | null>(null);
  const [showExitDateFilter, setShowExitDateFilter] = useState(false);

  // Preset Handlers
  const setEntryPreset = (type: 'today' | '7days' | '30days' | 'thisYear') => {
    const t = todayJ();
    const todayJdn = j2d(t.jy, t.jm, t.jd);
    if (type === 'today') {
      setEntryStartDate(t);
      setEntryEndDate(t);
    } else if (type === '7days') {
      setEntryStartDate(d2j(todayJdn - 6));
      setEntryEndDate(t);
    } else if (type === '30days') {
      setEntryStartDate(d2j(todayJdn - 29));
      setEntryEndDate(t);
    } else if (type === 'thisYear') {
      setEntryStartDate({ jy: t.jy, jm: 1, jd: 1 });
      setEntryEndDate({ jy: t.jy, jm: 12, jd: jMonthLen(t.jy, 12) });
    }
  };

  const setExitPreset = (type: 'today' | '7days' | '30days' | 'thisYear') => {
    const t = todayJ();
    const todayJdn = j2d(t.jy, t.jm, t.jd);
    if (type === 'today') {
      setExitStartDate(t);
      setExitEndDate(t);
    } else if (type === '7days') {
      setExitStartDate(d2j(todayJdn - 6));
      setExitEndDate(t);
    } else if (type === '30days') {
      setExitStartDate(d2j(todayJdn - 29));
      setExitEndDate(t);
    } else if (type === 'thisYear') {
      setExitStartDate({ jy: t.jy, jm: 1, jd: 1 });
      setExitEndDate({ jy: t.jy, jm: 12, jd: jMonthLen(t.jy, 12) });
    }
  };

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals
  const [passModal, setPassModal] = useState<{
    isOpen: boolean;
    message: string;
    action: () => void;
  }>({ isOpen: false, message: '', action: () => {} });

  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    text: string;
    action: () => void;
  }>({ isOpen: false, title: '', text: '', action: () => {} });

  // Load Initial Data on Mount (Cloud Database First, Fallback to localStorage)
  useEffect(() => {
    const initData = async () => {
      // 1. Load local data first for instant UI response
      const localData = loadAllData();
      setDocs(localData.docs);
      setBatches(localData.batches);
      setExits(localData.exits);
      setLabRecords(localData.labRecords);
      setImporters(localData.importers);
      setCarriers(localData.carriers);
      setGoodsList(localData.goodsList);
      setBrands(localData.brands);

      // 2. If Supabase is configured, fetch latest data from Cloud DB
      if (isSupabaseConfigured()) {
        try {
          const cloudData = await fetchAllDataFromCloud();
          if (cloudData) {
            setDocs(cloudData.docs);
            setBatches(cloudData.batches);
            setExits(cloudData.exits);
            setLabRecords(cloudData.labRecords);
            setImporters(cloudData.importers);
            setCarriers(cloudData.carriers);
            setGoodsList(cloudData.goodsList);
            setBrands(cloudData.brands);
            // Sync to local cache
            saveAllData({
              docs: cloudData.docs,
              batches: cloudData.batches,
              exits: cloudData.exits,
              labRecords: cloudData.labRecords,
              importers: cloudData.importers,
              carriers: cloudData.carriers,
              goodsList: cloudData.goodsList,
              brands: cloudData.brands,
            });
          }
        } catch (err: any) {
          if (err?.code === 'PGRST205' || err?.isTableMissing || err?.message?.includes('PGRST205') || err?.message?.includes('جداول دیتابیس')) {
            console.warn('Supabase tables not found (PGRST205). Database schema needs to be executed in Supabase SQL Editor.');
            addToast(
              'جداول دیتابیس ابری در Supabase ساخته نشده‌اند. لطفاً از بخش «دیتابیس ابری»، اسکریپت SQL را کپی و اجرا نمایید.',
              'err'
            );
          } else {
            console.warn('Could not load initial data from Supabase, falling back to local cache:', err?.message || err);
          }
        }
      }
    };

    initData();
  }, []);

  const addToast = (text: string, type: 'ok' | 'err' | 'info' = 'info') => {
    const newToast: ToastMessage = {
      id: uid(),
      text,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 3500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLoginSuccess = () => {
    sessionStorage.setItem('gm_auth', '1');
    setIsAuthenticated(true);
    addToast('به سامانه پایانه گمرک خوش آمدید', 'ok');
  };

  const handleLogout = () => {
    sessionStorage.removeItem('gm_auth');
    setIsAuthenticated(false);
  };

  const handleClearAllData = () => {
    setConfirmModal({
      isOpen: true,
      title: 'پاکسازی تمام داده‌های تستی',
      text: 'آیا از حذف تمامی اسناد ورود، تجمیع‌ها، اسناد خروج و سوابق آزمایشگاه اطمینان دارید؟ این عمل غیرقابل بازگشت است.',
      action: () => {
        clearAllTestData();
        setDocs([]);
        setBatches([]);
        setExits([]);
        setLabRecords([]);
        setEditingDoc(null);
        setEditingExitDoc(null);
        setConfirmModal({ isOpen: false, title: '', text: '', action: () => {} });
        addToast('تمامی داده‌های تستی با موفقیت پاکسازی شدند.', 'ok');
      },
    });
  };

  // Helper Stage Detector for Entry Docs
  const getStageOfDoc = (d: EntryDoc): number => {
    if (d.unloaded < d.trailers) return 1;
    if (!d.invoicePaid || !d.receipt.number) return 2;
    if (!(d.tasks.bl && d.tasks.arr && d.tasks.tali)) return 3;
    const b = batches.find((bt) => bt.docIds.includes(d.id));
    if (!b) return 4;
    return b.finalized ? 6 : 5;
  };

  // Option additions
  const handleAddImporter = (name: string) => {
    if (!importers.includes(name)) {
      const next = [...importers, name];
      setImporters(next);
      saveAllData({ importers: next });
      if (isSupabaseConfigured()) {
        saveLookupOptionsCloud({ importers: next }).catch((err) =>
          console.error('Failed to sync importers to Supabase:', err)
        );
      }
    }
  };

  const handleAddCarrier = (name: string) => {
    if (!carriers.includes(name)) {
      const next = [...carriers, name];
      setCarriers(next);
      saveAllData({ carriers: next });
      if (isSupabaseConfigured()) {
        saveLookupOptionsCloud({ carriers: next }).catch((err) =>
          console.error('Failed to sync carriers to Supabase:', err)
        );
      }
    }
  };

  const handleAddGoods = (name: string) => {
    if (!goodsList.includes(name)) {
      const next = [...goodsList, name];
      setGoodsList(next);
      saveAllData({ goodsList: next });
      if (isSupabaseConfigured()) {
        saveLookupOptionsCloud({ goodsList: next }).catch((err) =>
          console.error('Failed to sync goods to Supabase:', err)
        );
      }
    }
  };

  const handleAddBrand = (name: string) => {
    if (!brands.includes(name)) {
      const next = [...brands, name];
      setBrands(next);
      saveAllData({ brands: next });
      if (isSupabaseConfigured()) {
        saveLookupOptionsCloud({ brands: next }).catch((err) =>
          console.error('Failed to sync brands to Supabase:', err)
        );
      }
    }
  };

  // Entry Doc Actions
  const handleCreateOrUpdateEntryDoc = (
    data: Omit<EntryDoc, 'id' | 'createdAt' | 'unloaded' | 'invoicePaid' | 'receipt' | 'tasks'>
  ) => {
    if (editingDoc) {
      const updatedDoc: EntryDoc = {
        ...editingDoc,
        ...data,
        unloaded: Math.min(editingDoc.unloaded, data.trailers),
      };
      const updated = docs.map((d) => (d.id === editingDoc.id ? updatedDoc : d));
      setDocs(updated);
      saveAllData({ docs: updated });
      setEditingDoc(null);

      if (isSupabaseConfigured()) {
        saveEntryDocCloud(updatedDoc).catch((err) =>
          addToast(`خطا در ذخیره ابری: ${err.message || ''}`, 'err')
        );
      }

      addToast(`سند کوتاژ ${fa(data.cottage)} بروزرسانی شد`, 'ok');
    } else {
      const newDoc: EntryDoc = {
        ...data,
        id: uid(),
        unloaded: 0,
        invoicePaid: false,
        receipt: { number: '', count: '' },
        tasks: { bl: false, arr: false, tali: false },
        createdAt: Date.now(),
      };
      const updated = [newDoc, ...docs];
      setDocs(updated);
      saveAllData({ docs: updated });

      if (isSupabaseConfigured()) {
        saveEntryDocCloud(newDoc).catch((err) =>
          addToast(`خطا در ذخیره ابری: ${err.message || ''}`, 'err')
        );
      }

      addToast(`سند کوتاژ ${fa(data.cottage)} با موفقیت ثبت شد`, 'ok');
    }
  };

  const handleStartEditDoc = (doc: EntryDoc) => {
    setPassModal({
      isOpen: true,
      message: `برای ویرایش سند کوتاژ ${fa(doc.cottage)} رمز مدیریت را وارد کنید.`,
      action: () => {
        setEditingDoc(doc);
        setPassModal((prev) => ({ ...prev, isOpen: false }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  };

  const handleDeleteDoc = (id: string) => {
    const target = docs.find((d) => d.id === id);
    if (!target) return;

    setPassModal({
      isOpen: true,
      message: `برای حذف سند کوتاژ ${fa(target.cottage)} رمز مدیریت را وارد کنید.`,
      action: () => {
        // Remove from batch if in any
        const updatedBatches = batches.map((b) => ({
          ...b,
          docIds: b.docIds.filter((docId) => docId !== id),
        })).filter((b) => b.docIds.length > 0);

        const updatedDocs = docs.filter((d) => d.id !== id);
        setDocs(updatedDocs);
        setBatches(updatedBatches);
        saveAllData({ docs: updatedDocs, batches: updatedBatches });

        if (isSupabaseConfigured()) {
          deleteEntryDocCloud(id).catch((err) =>
            console.error('Failed to delete entry doc from Supabase:', err)
          );
        }

        setPassModal((prev) => ({ ...prev, isOpen: false }));
        addToast('سند کوتاژ حذف شد', 'info');
      },
    });
  };

  const handleUpdateUnloaded = (id: string, delta: number) => {
    let targetDoc: EntryDoc | null = null;
    const updated = docs.map((d) => {
      if (d.id === id) {
        const next = Math.max(0, Math.min(d.trailers, d.unloaded + delta));
        targetDoc = { ...d, unloaded: next };
        return targetDoc;
      }
      return d;
    });
    setDocs(updated);
    saveAllData({ docs: updated });

    if (targetDoc && isSupabaseConfigured()) {
      saveEntryDocCloud(targetDoc).catch((err) =>
        console.error('Failed to update unloaded in Supabase:', err)
      );
    }
  };

  const handleToggleInvoice = (id: string, paid: boolean) => {
    let targetDoc: EntryDoc | null = null;
    const updated = docs.map((d) => {
      if (d.id === id) {
        targetDoc = { ...d, invoicePaid: paid };
        return targetDoc;
      }
      return d;
    });
    setDocs(updated);
    saveAllData({ docs: updated });

    if (targetDoc && isSupabaseConfigured()) {
      saveEntryDocCloud(targetDoc).catch((err) =>
        console.error('Failed to update invoice in Supabase:', err)
      );
    }

    addToast(
      paid
        ? 'پرداخت صورت‌حساب ثبت شد — شماره قبض انبار فعال گردید'
        : 'پرداخت صورت‌حساب برداشته شد',
      'info'
    );
  };

  const handleUpdateReceipt = (id: string, number: string, count: string) => {
    // Unique receipt check
    if (number && docs.some((d) => d.id !== id && d.receipt.number === number)) {
      addToast('این شماره قبض انبار قبلاً برای سند دیگری ثبت شده است', 'err');
      return;
    }

    let targetDoc: EntryDoc | null = null;
    const updated = docs.map((d) => {
      if (d.id === id) {
        targetDoc = { ...d, receipt: { number, count } };
        return targetDoc;
      }
      return d;
    });
    setDocs(updated);
    saveAllData({ docs: updated });

    if (targetDoc && isSupabaseConfigured()) {
      saveEntryDocCloud(targetDoc).catch((err) =>
        console.error('Failed to update receipt in Supabase:', err)
      );
    }
  };

  const handleToggleTask = (id: string, taskKey: 'bl' | 'arr' | 'tali') => {
    let targetDoc: EntryDoc | null = null;
    const updated = docs.map((d) => {
      if (d.id === id) {
        targetDoc = {
          ...d,
          tasks: { ...d.tasks, [taskKey]: !d.tasks[taskKey] },
        };
        return targetDoc;
      }
      return d;
    });
    setDocs(updated);
    saveAllData({ docs: updated });

    if (targetDoc && isSupabaseConfigured()) {
      saveEntryDocCloud(targetDoc).catch((err) =>
        console.error('Failed to update task in Supabase:', err)
      );
    }
  };

  // Seed comprehensive intelligent test data covering all custom edge cases & workflow stages
  const handleSeedEntryDemo = () => {
    const t = todayJ();

    // 1. Define distinct test file numbers and multi-cottage entry docs
    const doc1Id = uid();
    const doc2Id = uid();
    const doc3Id = uid();
    const doc4Id = uid();
    const doc5Id = uid();

    const sampleDocs: EntryDoc[] = [
      // File 405101: Multi-Cottage File (Cottages 1, 2, 3)
      {
        id: doc1Id,
        cottage: '1402234',
        bl: 'SEETEC05022',
        file: '405101',
        importer: 'شرکت بازرگانی آریا تجارت',
        carrier: 'پارسیان حمل',
        goods: 'ام دی اف 1830*3800*16',
        brand: 'کرونوسپان',
        unloadDate: { jy: t.jy, jm: t.jm, jd: Math.max(1, t.jd - 4) },
        trailers: 5,
        unloaded: 5,
        pallets: 42,
        invoicePaid: true,
        receipt: { number: '20581', count: '420' },
        tasks: { bl: true, arr: true, tali: true },
        createdAt: Date.now() - 360000000,
      },
      {
        id: doc2Id,
        cottage: '1402235',
        bl: 'SEETEC05023',
        file: '405101', // Same file number for multi-cottage testing!
        importer: 'شرکت بازرگانی آریا تجارت',
        carrier: 'پارسیان حمل',
        goods: 'ام دی اف 1830*3800*16',
        brand: 'کرونوسپان',
        unloadDate: { jy: t.jy, jm: t.jm, jd: Math.max(1, t.jd - 3) },
        trailers: 4,
        unloaded: 4,
        pallets: 36,
        invoicePaid: true,
        receipt: { number: '20582', count: '360' },
        tasks: { bl: true, arr: true, tali: true },
        createdAt: Date.now() - 280000000,
      },
      {
        id: doc3Id,
        cottage: '1402236',
        bl: 'SEETEC05024',
        file: '405101', // Third cottage under same file number!
        importer: 'شرکت بازرگانی آریا تجارت',
        carrier: 'پارسیان حمل',
        goods: 'ام دی اف 1830*3800*16',
        brand: 'کرونوسپان',
        unloadDate: { jy: t.jy, jm: t.jm, jd: Math.max(1, t.jd - 1) },
        trailers: 6,
        unloaded: 3, // In discharging stage (3 out of 6)
        pallets: 25,
        invoicePaid: false,
        receipt: { number: '', count: '' },
        tasks: { bl: true, arr: false, tali: false },
        createdAt: Date.now() - 100000000,
      },

      // File 405202: Second File (Single Cottage, Yellow Route)
      {
        id: doc4Id,
        cottage: '1403112',
        bl: 'SEETEC06119',
        file: '405202',
        importer: 'صنایع چوب و فولاد نوین',
        carrier: 'باربری نوین',
        goods: 'چسب کاشی',
        brand: 'پارس چسب',
        unloadDate: { jy: t.jy, jm: t.jm, jd: Math.max(1, t.jd - 2) },
        trailers: 6,
        unloaded: 6,
        pallets: 28,
        invoicePaid: true,
        receipt: { number: '20590', count: '280' },
        tasks: { bl: true, arr: true, tali: false },
        createdAt: Date.now() - 180000000,
      },

      // File 405303: Third File (Newly Arrived)
      {
        id: doc5Id,
        cottage: '1404008',
        bl: 'SEETEC07200',
        file: '405303',
        importer: 'گروه صنعتی پارسیان',
        carrier: 'دریا طلایی خلیج فارس',
        goods: 'روکش پی‌وی‌سی',
        brand: 'ایزوفام',
        unloadDate: { jy: t.jy, jm: t.jm, jd: t.jd },
        trailers: 3,
        unloaded: 1,
        pallets: 15,
        invoicePaid: false,
        receipt: { number: '', count: '' },
        tasks: { bl: false, arr: false, tali: false },
        createdAt: Date.now() - 50000000,
      },
    ];

    // 2. Consolidation Batch under File 405101
    const batchId = 'SEETEC05022COMB1001';
    const sampleBatches: Batch[] = [
      {
        id: batchId,
        goods: 'ام دی اف 1830*3800*16',
        file: '405101',
        createdAt: { jy: t.jy, jm: t.jm, jd: Math.max(1, t.jd - 2) },
        docIds: [doc1Id, doc2Id],
        finalized: true,
      },
    ];

    // 3. Exit Documents covering all exit workflow states
    const sampleExits: ExitDoc[] = [
      // Exit Doc 1: Fully closed & exited (Red Route, Lab Tested & Approved, Paid, Gate Exited)
      {
        id: uid(),
        cottage: '1402234',
        bl: 'SEETEC05022',
        file: '405101',
        unloadDate: t,
        importer: 'شرکت بازرگانی آریا تجارت',
        carrier: 'پارسیان حمل',
        goods: 'ام دی اف 1830*3800*16',
        brand: 'کرونوسپان',
        trailers: 9,
        pallets: 78,
        batchId: batchId,
        route: 'red',
        evaluator: { done: true, comment: 'ارزیابی فیزیکی کالا با موفقیت تایید شد' },
        jihad: { done: true, comment: 'مجوز جهاد کشاورزی صادر گردید' },
        lab: {
          needed: true,
          sampled: true,
          sampleDate: t,
          sent: true,
          tested: true,
          comment: 'نتیجه آزمایشگاه: استاندارد و فاقد آلودگی (تایید نهایی)',
          reusedFrom: null,
          recordId: 'lab-rec-1',
          validity: 6,
        },
        expert: { done: true },
        gate: { done: true },
        invoice: { paid: true },
        createdAt: Date.now() - 36000000,
      },

      // Exit Doc 2: Yellow Route, Lab not needed, Pending payment at gate
      {
        id: uid(),
        cottage: '1403112',
        bl: 'SEETEC06119',
        file: '405202',
        unloadDate: t,
        importer: 'صنایع چوب و فولاد نوین',
        carrier: 'باربری نوین',
        goods: 'چسب کاشی',
        brand: 'پارس چسب',
        trailers: 6,
        pallets: 28,
        batchId: null,
        route: 'yellow',
        evaluator: { done: true, comment: 'بررسی اسنادی انجام شد' },
        jihad: { done: true, comment: 'استعلام سیستم تایید شد' },
        lab: {
          needed: false,
          sampled: false,
          sampleDate: null,
          sent: false,
          tested: false,
          comment: '',
          reusedFrom: null,
          recordId: null,
          validity: 6,
        },
        expert: { done: true },
        gate: { done: false },
        invoice: { paid: false },
        createdAt: Date.now() - 18000000,
      },

      // Exit Doc 3: Red Route, Lab testing in progress
      {
        id: uid(),
        cottage: '1404008',
        bl: 'SEETEC07200',
        file: '405303',
        unloadDate: t,
        importer: 'گروه صنعتی پارسیان',
        carrier: 'دریا طلایی خلیج فارس',
        goods: 'روکش پی‌وی‌سی',
        brand: 'ایزوفام',
        trailers: 3,
        pallets: 15,
        batchId: null,
        route: 'red',
        evaluator: { done: false, comment: '' },
        jihad: { done: false, comment: '' },
        lab: {
          needed: true,
          sampled: true,
          sampleDate: t,
          sent: true,
          tested: false,
          comment: 'نمونه به آزمایشگاه ارسال شده و در دست بررسی است',
          reusedFrom: null,
          recordId: null,
          validity: 6,
        },
        expert: { done: false },
        gate: { done: false },
        invoice: { paid: false },
        createdAt: Date.now() - 3600000,
      },
    ];

    // 4. Lab Record
    const sampleLabRecords: LabRecord[] = [
      {
        id: 'lab-rec-1',
        goods: 'ام دی اف 1830*3800*16',
        brand: 'کرونوسپان',
        sampleDate: t,
        validity: 6,
        comment: 'نتیجه آزمایشگاه: مطابق با استانداردهای گمرک و بهداشت',
        exitId: sampleExits[0].id,
        createdAt: Date.now() - 36000000,
      },
    ];

    // 5. Update state and dropdown option lists
    const newImporters = Array.from(
      new Set([...importers, 'شرکت بازرگانی آریا تجارت', 'صنایع چوب و فولاد نوین', 'گروه صنعتی پارسیان'])
    );
    const newCarriers = Array.from(
      new Set([...carriers, 'پارسیان حمل', 'باربری نوین', 'دریا طلایی خلیج فارس'])
    );
    const newGoods = Array.from(
      new Set([...goodsList, 'ام دی اف 1830*3800*16', 'چسب کاشی', 'روکش پی‌وی‌سی'])
    );
    const newBrands = Array.from(
      new Set([...brands, 'کرونوسپان', 'پارس چسب', 'ایزوفام'])
    );

    // Merge non-duplicate docs
    const existingCottages = new Set(docs.map((d) => d.cottage));
    const docsToAdd = sampleDocs.filter((d) => !existingCottages.has(d.cottage));

    const updatedDocs = [...docsToAdd, ...docs];
    const updatedBatches = [...sampleBatches, ...batches];
    const updatedExits = [...sampleExits, ...exits];
    const updatedLabRecords = [...sampleLabRecords, ...labRecords];

    setDocs(updatedDocs);
    setBatches(updatedBatches);
    setExits(updatedExits);
    setLabRecords(updatedLabRecords);

    setImporters(newImporters);
    setCarriers(newCarriers);
    setGoodsList(newGoods);
    setBrands(newBrands);

    saveAllData({
      docs: updatedDocs,
      batches: updatedBatches,
      exits: updatedExits,
      labRecords: updatedLabRecords,
      importers: newImporters,
      carriers: newCarriers,
      goodsList: newGoods,
      brands: newBrands,
    });

    addToast(
      'سناریوی جامع تست شامل پرونده‌های چند کوتاژی، مراحل ورود، تجمیع و خروج با موفقیت ثبت شد',
      'ok'
    );
  };

  // Consolidation Actions
  const handleCreateBatch = (
    batchId: string,
    docIds: string[],
    goods: string,
    file: string
  ) => {
    const newBatch: Batch = {
      id: batchId,
      goods,
      file,
      createdAt: todayJ(),
      docIds,
      finalized: false,
    };
    const updatedBatches = [...batches, newBatch];
    setBatches(updatedBatches);
    saveAllData({ batches: updatedBatches });

    if (isSupabaseConfigured()) {
      saveBatchCloud(newBatch).catch((err) =>
        console.error('Failed to save batch to Supabase:', err)
      );
    }

    addToast(`تجمیع ${fa(batchId)} با ${fa(docIds.length)} سند ثبت شد`, 'ok');
  };

  const handleFinalizeBatch = (batchId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'نهایی کردن تجمیع',
      text: 'پس از نهایی شدن، همه اسناد این تجمیع در وضعیت «آماده خروج» قرار می‌گیرند و قابل خروج می‌شوند.',
      action: () => {
        let updatedBatch: Batch | null = null;
        const updated = batches.map((b) => {
          if (b.id === batchId) {
            updatedBatch = { ...b, finalized: true };
            return updatedBatch;
          }
          return b;
        });
        setBatches(updated);
        saveAllData({ batches: updated });

        if (updatedBatch && isSupabaseConfigured()) {
          saveBatchCloud(updatedBatch).catch((err) =>
            console.error('Failed to finalize batch in Supabase:', err)
          );
        }

        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        addToast(`تجمیع ${fa(batchId)} نهایی شد`, 'ok');
      },
    });
  };

  const handleDeleteBatch = (batchId: string) => {
    setConfirmModal({
      isOpen: true,
      title: 'لغو تجمیع',
      text: 'این تجمیع حذف می‌شود و اسناد آن دوباره به وضعیت «کامل» باز می‌گردند.',
      action: () => {
        const updated = batches.filter((b) => b.id !== batchId);
        setBatches(updated);
        saveAllData({ batches: updated });

        if (isSupabaseConfigured()) {
          deleteBatchCloud(batchId).catch((err) =>
            console.error('Failed to delete batch from Supabase:', err)
          );
        }

        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        addToast('تجمیع لغو شد', 'info');
      },
    });
  };

  // Exit Actions
  const handleCreateOrUpdateExitDoc = (
    data: Omit<ExitDoc, 'id' | 'createdAt' | 'route' | 'evaluator' | 'jihad' | 'lab' | 'expert' | 'gate' | 'invoice'>
  ) => {
    if (editingExitDoc) {
      const updatedExitDoc: ExitDoc = {
        ...editingExitDoc,
        ...data,
      };
      const updated = exits.map((x) => (x.id === editingExitDoc.id ? updatedExitDoc : x));
      setExits(updated);
      saveAllData({ exits: updated });
      setEditingExitDoc(null);

      if (isSupabaseConfigured()) {
        saveExitDocCloud(updatedExitDoc).catch((err) =>
          addToast(`خطا در ذخیره ابری خروج: ${err.message || ''}`, 'err')
        );
      }

      addToast('سند خروج بروزرسانی شد', 'ok');
    } else {
      const newExit: ExitDoc = {
        ...data,
        id: uid(),
        route: null,
        evaluator: { done: false, comment: '' },
        jihad: { done: false, comment: '' },
        lab: {
          needed: false,
          sampled: false,
          sampleDate: null,
          sent: false,
          tested: false,
          comment: '',
          reusedFrom: null,
          recordId: null,
          validity: 6,
        },
        expert: { done: false },
        gate: { done: false },
        invoice: { paid: false },
        createdAt: Date.now(),
      };
      const updated = [newExit, ...exits];
      setExits(updated);
      saveAllData({ exits: updated });

      if (isSupabaseConfigured()) {
        saveExitDocCloud(newExit).catch((err) =>
          addToast(`خطا در ذخیره ابری خروج: ${err.message || ''}`, 'err')
        );
      }

      addToast('سند خروج با موفقیت ثبت شد', 'ok');
    }
  };

  const handleStartEditExit = (exitDoc: ExitDoc) => {
    setPassModal({
      isOpen: true,
      message: 'برای ویرایش سند خروج رمز مدیریت را وارد کنید.',
      action: () => {
        setEditingExitDoc(exitDoc);
        setPassModal((prev) => ({ ...prev, isOpen: false }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      },
    });
  };

  const handleDeleteExit = (id: string) => {
    setPassModal({
      isOpen: true,
      message: 'برای حذف سند خروج رمز مدیریت را وارد کنید.',
      action: () => {
        const updated = exits.filter((x) => x.id !== id);
        setExits(updated);
        saveAllData({ exits: updated });

        if (isSupabaseConfigured()) {
          deleteExitDocCloud(id).catch((err) =>
            console.error('Failed to delete exit doc from Supabase:', err)
          );
        }

        setPassModal((prev) => ({ ...prev, isOpen: false }));
        addToast('سند خروج حذف شد', 'info');
      },
    });
  };

  const handleUpdateExitDoc = (updatedDoc: ExitDoc) => {
    const updated = exits.map((x) => (x.id === updatedDoc.id ? updatedDoc : x));
    setExits(updated);
    saveAllData({ exits: updated });

    if (isSupabaseConfigured()) {
      saveExitDocCloud(updatedDoc).catch((err) =>
        console.error('Failed to update exit doc in Supabase:', err)
      );
    }
  };

  const handleAddLabRecord = (rec: LabRecord) => {
    const updated = [...labRecords, rec];
    setLabRecords(updated);
    saveAllData({ labRecords: updated });

    if (isSupabaseConfigured()) {
      saveLabRecordCloud(rec).catch((err) =>
        console.error('Failed to save lab record in Supabase:', err)
      );
    }

    addToast('سابقه آزمایشگاه جدید ذخیره شد', 'ok');
  };

  const handleSeedExitDemo = () => {
    const t = todayJ();
    const rand = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

    let fins = batches.filter((b) => b.finalized);
    if (!fins.length) {
      addToast('ابتدا حداقل یک تجمیع نهایی‌شده ایجاد کنید', 'err');
      return;
    }

    const sampleImps = importers.length ? importers : DEFAULT_IMPORTERS;
    const sampleCars = carriers.length ? carriers : DEFAULT_CARRIERS;
    const sampleBrands = brands.length ? brands : DEFAULT_BRANDS;

    const newExits: ExitDoc[] = [];
    for (let i = 0; i < 5; i++) {
      const cottage = String(rand(1400000, 1409999));
      if (exits.some((x) => x.cottage === cottage)) continue;
      const bl = 'SEETEC' + String(rand(10000, 99999));
      if (exits.some((x) => x.bl === bl)) continue;
      const file = String(rand(405000, 405999));
      const batch = fins[rand(0, fins.length - 1)];

      newExits.push({
        id: uid(),
        cottage,
        bl,
        file,
        unloadDate: { jy: t.jy, jm: t.jm, jd: Math.min(t.jd, 28) },
        importer: sampleImps[rand(0, sampleImps.length - 1)],
        carrier: sampleCars[rand(0, sampleCars.length - 1)],
        goods: batch.goods,
        brand: sampleBrands[rand(0, sampleBrands.length - 1)],
        trailers: rand(2, 8),
        pallets: rand(10, 50),
        batchId: String(batch.id),
        route: Math.random() > 0.5 ? 'red' : 'yellow',
        evaluator: { done: Math.random() > 0.4, comment: 'تکمیل شد' },
        jihad: { done: Math.random() > 0.3, comment: 'مجوز جهاد صادر گردید' },
        lab: {
          needed: Math.random() > 0.3,
          sampled: true,
          sampleDate: t,
          sent: true,
          tested: Math.random() > 0.4,
          comment: 'تایید شد',
          reusedFrom: null,
          recordId: null,
          validity: 6,
        },
        expert: { done: Math.random() > 0.5 },
        gate: { done: Math.random() > 0.6 },
        invoice: { paid: Math.random() > 0.5 },
        createdAt: Date.now() - rand(0, 10) * 86400000,
      });
    }

    const updated = [...newExits, ...exits];
    setExits(updated);
    saveAllData({ exits: updated });
    addToast('۵ سند خروج نمونه تصادفی ثبت شد', 'ok');
  };

  // Filtered lists
  const filteredEntryDocs = docs
    .filter((d) => {
      if (entryFilter === 'all') return true;
      const s = getStageOfDoc(d);
      if (entryFilter === '23') return s === 2 || s === 3;
      return s === parseInt(entryFilter, 10);
    })
    .filter((d) => {
      if (!entryStartDate && !entryEndDate) return true;
      if (!d.unloadDate) return false;
      const docDay = j2d(d.unloadDate.jy, d.unloadDate.jm, d.unloadDate.jd);
      if (entryStartDate) {
        const startDay = j2d(entryStartDate.jy, entryStartDate.jm, entryStartDate.jd);
        if (docDay < startDay) return false;
      }
      if (entryEndDate) {
        const endDay = j2d(entryEndDate.jy, entryEndDate.jm, entryEndDate.jd);
        if (docDay > endDay) return false;
      }
      return true;
    })
    .filter((d) => {
      if (!entrySearch.trim()) return true;
      const q = en(entrySearch.trim().toLowerCase());
      return [
        d.cottage,
        d.bl,
        d.file,
        d.importer,
        d.carrier,
        d.goods,
        d.brand,
        d.receipt.number,
      ].some((val) => en(String(val || '').toLowerCase()).includes(q));
    });

  const filteredExits = exits
    .filter((x) => {
      if (exitFilter === 'all') return true;
      const gateDone = x.gate.done;
      const isClosed = x.invoice.paid && gateDone;
      if (exitFilter === 'progress') return !isClosed;
      if (exitFilter === 'gate') return gateDone && !isClosed;
      if (exitFilter === 'done') return isClosed;
      return true;
    })
    .filter((x) => {
      if (!exitStartDate && !exitEndDate) return true;
      if (!x.unloadDate) return false;
      const docDay = j2d(x.unloadDate.jy, x.unloadDate.jm, x.unloadDate.jd);
      if (exitStartDate) {
        const startDay = j2d(exitStartDate.jy, exitStartDate.jm, exitStartDate.jd);
        if (docDay < startDay) return false;
      }
      if (exitEndDate) {
        const endDay = j2d(exitEndDate.jy, exitEndDate.jm, exitEndDate.jd);
        if (docDay > endDay) return false;
      }
      return true;
    })
    .filter((x) => {
      if (!exitSearch.trim()) return true;
      const q = en(exitSearch.trim().toLowerCase());
      return [
        x.cottage,
        x.bl,
        x.file,
        x.importer,
        x.carrier,
        x.goods,
        x.brand,
        x.batchId,
      ].some((val) => en(String(val || '').toLowerCase()).includes(q));
    });

  // Render Login Gate if not authenticated
  if (!isAuthenticated) {
    return <LoginGate onSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#0c0e14] text-[#f1f5f9] pb-24 relative overflow-hidden selection:bg-cyan-500/30">
      {/* Frosted Glass Ambient Orbs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50vw] h-[50vw] max-w-[600px] max-h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none z-0 animate-float-1" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] max-w-[700px] max-h-[700px] bg-purple-600/15 rounded-full blur-[160px] pointer-events-none z-0 animate-float-2" />
      <div className="fixed top-[25%] right-[10%] w-[35vw] h-[35vw] max-w-[450px] max-h-[450px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none z-0" />

      {/* Top Bar */}
      <div className="relative z-10">
        <Navbar
          onLogout={handleLogout}
          onClearAllData={handleClearAllData}
          onOpenCloudDb={() => setIsCloudDbModalOpen(true)}
        />
      </div>

      {/* Tabs Navigation (3 Main Sections) */}
      <nav className="relative z-10 max-w-[1460px] mx-auto px-4 sm:px-7 pt-4 sm:pt-5">
        <div className="flex items-center gap-2 sm:gap-3 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar max-w-full">
          {/* Section 1: ورود کالا */}
          <button
            onClick={() => setMainTab('entry')}
            className={`flex items-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-2xl font-bold text-xs sm:text-base shrink-0 transition-all border ${
              mainTab === 'entry'
                ? 'bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-cyan-500/10 border-cyan-400/60 text-white shadow-lg shadow-cyan-500/20 backdrop-blur-xl'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 backdrop-blur-md'
            }`}
          >
            <PackageCheck className={`w-4 h-4 sm:w-5 sm:h-5 ${mainTab === 'entry' ? 'text-cyan-400' : 'text-amber-400'}`} />
            <span>ورود کالا</span>
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-mono border border-cyan-500/30">
              {fa(docs.length)}
            </span>
          </button>

          {/* Section 2: خروج کالا */}
          <button
            onClick={() => setMainTab('exit')}
            className={`flex items-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-2xl font-bold text-xs sm:text-base shrink-0 transition-all border ${
              mainTab === 'exit'
                ? 'bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/10 border-blue-400/60 text-white shadow-lg shadow-blue-500/20 backdrop-blur-xl'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 backdrop-blur-md'
            }`}
          >
            <LogOut className={`w-4 h-4 sm:w-5 sm:h-5 ${mainTab === 'exit' ? 'text-blue-400' : 'text-slate-400'}`} />
            <span>خروج کالا</span>
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
              {fa(exits.length)}
            </span>
          </button>

          {/* Section 3: گزارش‌گیری */}
          <button
            onClick={() => setMainTab('reports')}
            className={`flex items-center gap-2 sm:gap-2.5 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-2xl font-bold text-xs sm:text-base shrink-0 transition-all border ${
              mainTab === 'reports'
                ? 'bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-emerald-500/10 border-emerald-400/60 text-white shadow-lg shadow-emerald-500/20 backdrop-blur-xl'
                : 'bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10 backdrop-blur-md'
            }`}
          >
            <BarChart3 className={`w-4 h-4 sm:w-5 sm:h-5 ${mainTab === 'reports' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>گزارش‌گیری</span>
            <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-mono border border-emerald-500/30">
              تحلیلی
            </span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-[1460px] mx-auto px-4 sm:px-7 pt-6">
        {/* Status Overview Widget (ویجت نمای کلی وضعیت) */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl shadow-2xl mb-6 relative overflow-hidden border border-white/10">
          <div className="flex items-center justify-between mb-3.5 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <div className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
              </div>
              <h3 className="font-lalezar text-lg font-normal text-slate-100 tracking-wide">
                نمای کلی وضعیت اسناد پایانه
              </h3>
            </div>
            <span className="text-[11px] font-medium text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-full backdrop-blur-md">
              آمار لحظه‌ای و زنده
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {/* Pending Docs */}
            <button
              onClick={() => {
                setMainTab('entry');
                setEntrySubTab('docs');
                setEntryFilter('all');
              }}
              className="glass-panel-subtle p-3.5 sm:p-4 rounded-xl border border-amber-500/20 hover:border-amber-400/50 hover:bg-amber-500/10 transition-all text-right group flex items-start justify-between"
            >
              <div>
                <div className="text-xs text-slate-400 font-medium group-hover:text-amber-300 transition-colors">
                  اسناد در حال انتظار
                </div>
                <div className="font-lalezar text-2xl text-amber-400 mt-1">
                  {fa(docs.filter((d) => d.unloaded === 0).length)}{' '}
                  <span className="text-xs text-slate-400 font-sans">سند</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  منتظر آغاز تخلیه یا تکمیل مدارک
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
            </button>

            {/* Discharging Docs */}
            <button
              onClick={() => {
                setMainTab('entry');
                setEntrySubTab('docs');
                setEntryFilter('1');
              }}
              className="glass-panel-subtle p-3.5 sm:p-4 rounded-xl border border-cyan-500/20 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-all text-right group flex items-start justify-between"
            >
              <div>
                <div className="text-xs text-slate-400 font-medium group-hover:text-cyan-300 transition-colors">
                  اسناد در حال تخلیه
                </div>
                <div className="font-lalezar text-2xl text-cyan-400 mt-1">
                  {fa(docs.filter((d) => d.unloaded > 0 && d.unloaded < d.trailers).length)}{' '}
                  <span className="text-xs text-slate-400 font-sans">سند</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  تریلی‌های فعال در حال تخلیه بار
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-110 transition-transform">
                <Truck className="w-5 h-5" />
              </div>
            </button>

            {/* Finalized Docs */}
            <button
              onClick={() => {
                setMainTab('entry');
                setEntrySubTab('consolidation');
              }}
              className="glass-panel-subtle p-3.5 sm:p-4 rounded-xl border border-emerald-500/20 hover:border-emerald-400/50 hover:bg-emerald-500/10 transition-all text-right group flex items-start justify-between"
            >
              <div>
                <div className="text-xs text-slate-400 font-medium group-hover:text-emerald-300 transition-colors">
                  اسناد نهایی‌شده
                </div>
                <div className="font-lalezar text-2xl text-emerald-400 mt-1">
                  {fa(batches.filter((b) => b.finalized).length)}{' '}
                  <span className="text-xs text-slate-400 font-sans">تجمیع نهایی</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  آماده خروج و تشریفات گمرکی
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </button>
          </div>
        </div>

        {/* SECTION 1: GOODS ENTRY (ورود کالا) */}
        {mainTab === 'entry' && (
          <div className="space-y-6">
            {/* Sub-Tabs for Goods Entry */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-white/10 w-fit max-w-full overflow-x-auto no-scrollbar backdrop-blur-md">
              <button
                onClick={() => setEntrySubTab('docs')}
                className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-all ${
                  entrySubTab === 'docs'
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <PackageCheck className="w-4 h-4 text-amber-400" />
                <span>دفتر اسناد ورود ({fa(docs.length)})</span>
              </button>

              <button
                onClick={() => setEntrySubTab('consolidation')}
                className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-all ${
                  entrySubTab === 'consolidation'
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-md shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <Layers className="w-4 h-4 text-cyan-400" />
                <span>تجمیع اسناد ({fa(batches.length)})</span>
              </button>
            </div>

            {/* Sub-tab 1: Entry Docs */}
            {entrySubTab === 'docs' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-lalezar text-2xl font-normal text-slate-100 tracking-wide">
                    دفتر اسناد ورود کالا
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    ثبت کوتاژ، بارنامه، تخلیه تریلی‌ها، صورت‌حساب منطقه ویژه و دریافت قبض انبار
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Form */}
                  <div className="lg:col-span-4">
                    <EntryForm
                      editingDoc={editingDoc}
                      onSubmit={handleCreateOrUpdateEntryDoc}
                      onCancelEdit={() => setEditingDoc(null)}
                      onSeedDemo={handleSeedEntryDemo}
                      importers={importers}
                      carriers={carriers}
                      goodsList={goodsList}
                      brands={brands}
                      onAddImporter={handleAddImporter}
                      onAddCarrier={handleAddCarrier}
                      onAddGoods={handleAddGoods}
                      onAddBrand={handleAddBrand}
                      existingDocs={docs}
                    />
                  </div>

                  {/* Right Column: Search & Cards List */}
                  <div className="lg:col-span-8 space-y-4">
                    {/* Search & Chips Toolbar */}
                    <div className="glass-panel p-3.5 sm:p-4 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Text Search Input */}
                        <div className="relative flex-1 min-w-[200px]">
                          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={entrySearch}
                            onChange={(e) => setEntrySearch(e.target.value)}
                            placeholder="جست‌وجو در کوتاژ، بارنامه، پرونده، شرکت، کالا..."
                            className="w-full glass-input rounded-xl py-2 pr-10 pl-8 text-xs outline-none"
                          />
                          {entrySearch && (
                            <button
                              onClick={() => setEntrySearch('')}
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                              title="پاکسازی جست‌وجو"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Toggle Date Range Filter Button */}
                        <button
                          onClick={() => setShowEntryDateFilter(!showEntryDateFilter)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                            entryStartDate || entryEndDate
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10 font-bold'
                              : showEntryDateFilter
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                              : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Calendar className="w-4 h-4 text-amber-400" />
                          <span>بازه زمانی</span>
                          {(entryStartDate || entryEndDate) && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          )}
                        </button>
                      </div>

                      {/* Status Filter Chips */}
                      <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-white/5">
                        <div className="flex gap-1.5 flex-wrap text-xs">
                          {[
                            { id: 'all', label: 'همه' },
                            { id: '1', label: 'در حال تخلیه' },
                            { id: '23', label: 'در حال تکمیل' },
                            { id: '4', label: 'کامل' },
                            { id: '5', label: 'در تجمیع' },
                            { id: '6', label: 'آماده خروج' },
                          ].map((f) => (
                            <button
                              key={f.id}
                              onClick={() => setEntryFilter(f.id as EntryFilterType)}
                              className={`px-3 py-1.5 rounded-xl border transition-all ${
                                entryFilter === f.id
                                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border-cyan-500/40 shadow-sm shadow-cyan-500/20 backdrop-blur-md'
                                  : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>

                        <div className="text-[11px] text-slate-400 font-mono">
                          نمایش {fa(filteredEntryDocs.length)} از {fa(docs.length)} سند
                        </div>
                      </div>

                      {/* Expandable Date Range Box */}
                      {(showEntryDateFilter || entryStartDate || entryEndDate) && (
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-white/10 space-y-3 animate-in fade-in slide-in-from-top-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                            <div className="flex items-center gap-1.5 text-amber-300">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>فیلتر بر اساس تاریخ تخلیه / ورود</span>
                            </div>
                            {(entryStartDate || entryEndDate) && (
                              <button
                                onClick={() => {
                                  setEntryStartDate(null);
                                  setEntryEndDate(null);
                                }}
                                className="flex items-center gap-1 text-[11px] text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded-lg border border-rose-500/30 transition-colors"
                              >
                                <X className="w-3 h-3" />
                                <span>حذف فیلتر تاریخ</span>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">از تاریخ:</label>
                              <JalaliDatePicker
                                value={entryStartDate}
                                onChange={setEntryStartDate}
                                placeholder="انتخاب تاریخ شروع"
                                allowClear
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">تا تاریخ:</label>
                              <JalaliDatePicker
                                value={entryEndDate}
                                onChange={setEntryEndDate}
                                placeholder="انتخاب تاریخ پایان"
                                allowClear
                              />
                            </div>
                          </div>

                          {/* Quick Presets */}
                          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/5 text-xs">
                            <span className="text-[11px] text-slate-400">میانبرهای زمان:</span>
                            <button
                              onClick={() => setEntryPreset('today')}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] transition-colors"
                            >
                              امروز
                            </button>
                            <button
                              onClick={() => setEntryPreset('7days')}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] transition-colors"
                            >
                              ۷ روز اخیر
                            </button>
                            <button
                              onClick={() => setEntryPreset('30days')}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] transition-colors"
                            >
                              ۳۰ روز اخیر
                            </button>
                            <button
                              onClick={() => setEntryPreset('thisYear')}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] transition-colors"
                            >
                              امسال ({fa(todayJ().jy)})
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Cards List */}
                    {filteredEntryDocs.length === 0 ? (
                      <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 text-xs">
                        سندی مطابق جست‌وجو یا فیلتر انتخاب‌شده یافت نشد.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredEntryDocs.map((doc) => {
                          const batch = batches.find((b) => b.docIds.includes(doc.id));

                          return (
                            <EntryCard
                              key={doc.id}
                              doc={doc}
                              batch={batch}
                              onEdit={handleStartEditDoc}
                              onDelete={handleDeleteDoc}
                              onUpdateUnloaded={handleUpdateUnloaded}
                              onToggleInvoice={handleToggleInvoice}
                              onUpdateReceipt={handleUpdateReceipt}
                              onToggleTask={handleToggleTask}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 2: Document Consolidation (تجمیع اسناد) */}
            {entrySubTab === 'consolidation' && (
              <ConsolidationSection
                docs={docs}
                batches={batches}
                onCreateBatch={handleCreateBatch}
                onFinalizeBatch={handleFinalizeBatch}
                onDeleteBatch={handleDeleteBatch}
                getStageOf={getStageOfDoc}
              />
            )}
          </div>
        )}

        {/* SECTION 2: GOODS EXIT (خروج کالا) */}
        {mainTab === 'exit' && (
          <div className="space-y-6">
            {/* Sub-Tabs for Goods Exit */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-900/60 p-1.5 rounded-2xl border border-white/10 w-fit max-w-full overflow-x-auto no-scrollbar backdrop-blur-md">
              <button
                onClick={() => setExitSubTab('docs')}
                className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-all ${
                  exitSubTab === 'docs'
                    ? 'bg-blue-500/25 text-blue-300 border border-blue-400/50 shadow-md shadow-blue-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <LogOut className="w-4 h-4 text-blue-400" />
                <span>تشریفات و خروج کالا ({fa(exits.length)})</span>
              </button>

              <button
                onClick={() => setExitSubTab('lab')}
                className={`flex items-center gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold shrink-0 transition-all ${
                  exitSubTab === 'lab'
                    ? 'bg-purple-500/25 text-purple-300 border border-purple-400/50 shadow-md shadow-purple-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <FlaskConical className="w-4 h-4 text-purple-400" />
                <span>سوابق آزمایشگاه ({fa(labRecords.length)})</span>
              </button>
            </div>

            {/* Sub-tab 1: Exit Docs */}
            {exitSubTab === 'docs' && (
              <div className="space-y-6">
                <div>
                  <h2 className="font-lalezar text-2xl font-normal text-slate-100 tracking-wide">
                    تشریفات و خروج کالا از گمرک
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    تعیین مسیر (قرمز/زرد)، ارزیاب، جهاد کشاورزی، آزمایشگاه، کارشناس مجازی، درب خروج و صورت‌حساب گمرک
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Form */}
                  <div className="lg:col-span-4">
                    <ExitForm
                      editingDoc={editingExitDoc}
                      batches={batches}
                      onSubmit={handleCreateOrUpdateExitDoc}
                      onCancelEdit={() => setEditingExitDoc(null)}
                      onSeedDemo={handleSeedExitDemo}
                      importers={importers}
                      carriers={carriers}
                      goodsList={goodsList}
                      brands={brands}
                      onAddImporter={handleAddImporter}
                      onAddCarrier={handleAddCarrier}
                      onAddGoods={handleAddGoods}
                      onAddBrand={handleAddBrand}
                      existingExits={exits}
                    />
                  </div>

                  {/* Right Column: Search & Cards */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="glass-panel p-3.5 sm:p-4 rounded-2xl space-y-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {/* Text Search Input */}
                        <div className="relative flex-1 min-w-[200px]">
                          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          <input
                            type="text"
                            value={exitSearch}
                            onChange={(e) => setExitSearch(e.target.value)}
                            placeholder="جست‌وجو در کوتاژ خروج، بارنامه، کالا، برند..."
                            className="w-full glass-input rounded-xl py-2 pr-10 pl-8 text-xs outline-none"
                          />
                          {exitSearch && (
                            <button
                              onClick={() => setExitSearch('')}
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                              title="پاکسازی جست‌وجو"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Toggle Date Range Filter Button */}
                        <button
                          onClick={() => setShowExitDateFilter(!showExitDateFilter)}
                          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                            exitStartDate || exitEndDate
                              ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-md shadow-amber-500/10 font-bold'
                              : showExitDateFilter
                              ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                              : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                          }`}
                        >
                          <Calendar className="w-4 h-4 text-amber-400" />
                          <span>بازه زمانی</span>
                          {(exitStartDate || exitEndDate) && (
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                          )}
                        </button>
                      </div>

                      {/* Status Filter Chips */}
                      <div className="flex items-center justify-between gap-2 flex-wrap pt-2 border-t border-white/5">
                        <div className="flex gap-1.5 flex-wrap text-xs">
                          {[
                            { id: 'all', label: 'همه' },
                            { id: 'progress', label: 'در حال انجام' },
                            { id: 'gate', label: 'خارج شده از درب' },
                            { id: 'done', label: 'مختومه' },
                          ].map((f) => (
                            <button
                              key={f.id}
                              onClick={() => setExitFilter(f.id as ExitFilterType)}
                              className={`px-3 py-1.5 rounded-xl border transition-all ${
                                exitFilter === f.id
                                  ? 'bg-blue-500/20 text-blue-300 font-bold border-blue-500/40 shadow-sm shadow-blue-500/20 backdrop-blur-md'
                                  : 'border-white/10 text-slate-400 hover:text-white hover:bg-white/5'
                              }`}
                            >
                              {f.label}
                            </button>
                          ))}
                        </div>

                        <div className="text-[11px] text-slate-400 font-mono">
                          نمایش {fa(filteredExits.length)} از {fa(exits.length)} سند
                        </div>
                      </div>

                      {/* Expandable Date Range Box */}
                      {(showExitDateFilter || exitStartDate || exitEndDate) && (
                        <div className="p-3 bg-slate-950/60 rounded-xl border border-white/10 space-y-3 animate-in fade-in slide-in-from-top-1">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                            <div className="flex items-center gap-1.5 text-amber-300">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>فیلتر بر اساس تاریخ تخلیه / خروج</span>
                            </div>
                            {(exitStartDate || exitEndDate) && (
                              <button
                                onClick={() => {
                                  setExitStartDate(null);
                                  setExitEndDate(null);
                                }}
                                className="flex items-center gap-1 text-[11px] text-rose-300 hover:text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 px-2 py-0.5 rounded-lg border border-rose-500/30 transition-colors"
                              >
                                <X className="w-3 h-3" />
                                <span>حذف فیلتر تاریخ</span>
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">از تاریخ:</label>
                              <JalaliDatePicker
                                value={exitStartDate}
                                onChange={setExitStartDate}
                                placeholder="انتخاب تاریخ شروع"
                                allowClear
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] text-slate-400 mb-1">تا تاریخ:</label>
                              <JalaliDatePicker
                                value={exitEndDate}
                                onChange={setExitEndDate}
                                placeholder="انتخاب تاریخ پایان"
                                allowClear
                              />
                            </div>
                          </div>

                          {/* Quick Presets */}
                          <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-white/5 text-xs">
                            <span className="text-[11px] text-slate-400">میانبرهای زمان:</span>
                            <button
                              onClick={() => setExitPreset('today')}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] transition-colors"
                            >
                              امروز
                            </button>
                            <button
                              onClick={() => setExitPreset('7days')}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] transition-colors"
                            >
                              ۷ روز اخیر
                            </button>
                            <button
                              onClick={() => setExitPreset('30days')}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] transition-colors"
                            >
                              ۳۰ روز اخیر
                            </button>
                            <button
                              onClick={() => setExitPreset('thisYear')}
                              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 text-[11px] transition-colors"
                            >
                              امسال ({fa(todayJ().jy)})
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {filteredExits.length === 0 ? (
                      <div className="glass-panel rounded-2xl p-12 text-center text-slate-400 text-xs">
                        سند خروجی مطابق با فیلتر انتخاب‌شده وجود ندارد.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredExits.map((exitDoc) => {
                          const batch = batches.find((b) => String(b.id) === String(exitDoc.batchId));

                          return (
                            <ExitCard
                              key={exitDoc.id}
                              doc={exitDoc}
                              batch={batch}
                              allDocs={docs}
                              labRecords={labRecords}
                              onEdit={handleStartEditExit}
                              onDelete={handleDeleteExit}
                              onUpdateExit={handleUpdateExitDoc}
                              onAddLabRecord={handleAddLabRecord}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Sub-tab 2: Lab Records (سوابق آزمایشگاه) */}
            {exitSubTab === 'lab' && <LabRecordsSection records={labRecords} />}
          </div>
        )}

        {/* SECTION 3: REPORTS & ANALYTICS (گزارش‌گیری تحلیلی بر اساس شماره پرونده) */}
        {mainTab === 'reports' && (
          <ReportsSection
            docs={docs}
            exits={exits}
            batches={batches}
            getStageOf={getStageOfDoc}
          />
        )}
      </main>

      {/* Toast Container */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Password Modal */}
      <PasswordModal
        isOpen={passModal.isOpen}
        message={passModal.message}
        onSuccess={passModal.action}
        onCancel={() => setPassModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        text={confirmModal.text}
        onConfirm={confirmModal.action}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Cloud Database Sync Modal */}
      <CloudDbSyncModal
        isOpen={isCloudDbModalOpen}
        onClose={() => setIsCloudDbModalOpen(false)}
        localData={{
          docs: docs || [],
          batches: batches || [],
          exits: exits || [],
          labRecords: labRecords || [],
          importers: importers || [],
          carriers: carriers || [],
          goodsList: goodsList || [],
          brands: brands || [],
        }}
        onSyncComplete={(cloudData) => {
          if (cloudData) {
            setDocs(cloudData.docs || []);
            setBatches(cloudData.batches || []);
            setExits(cloudData.exits || []);
            setLabRecords(cloudData.labRecords || []);
            setImporters(cloudData.importers || []);
            setCarriers(cloudData.carriers || []);
            setGoodsList(cloudData.goodsList || []);
            setBrands(cloudData.brands || []);
            saveAllData(cloudData);
            addToast('داده‌ها با پایگاه داده ابری همگام‌سازی شدند', 'ok');
          }
        }}
        addToast={addToast}
      />
    </div>
  );
}
