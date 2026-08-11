import { EntryDoc, Batch, LabRecord, ExitDoc } from '../types';
import { todayJ, uid } from './jalali';

const KEYS = {
  DOCS: 'gm_docs',
  BATCHES: 'gm_batches',
  CARRIERS: 'gm_carriers',
  IMPORTERS: 'gm_importers',
  GOODS: 'gm_goods',
  BRANDS: 'gm_brands',
  EXITS: 'gm_exits',
  LABRECS: 'gm_labrecs',
  INITIALIZED: 'gm_initialized',
};

export const DEFAULT_IMPORTERS = [
  'شرکت بازرگانی آریا تجارت',
  'صنایع فولاد شرق',
  'گروه صنعتی پارسیان',
  'تجارت بین‌الملل خلیج',
];

export const DEFAULT_CARRIERS = [
  'پارسیان حمل',
  'دریا طلایی خلیج فارس',
  'باربری نوین',
  'حمل‌ونقل سریع',
];

export const DEFAULT_GOODS = [
  'ام دی اف 1830*3800*16',
  'ام دی اف 1200*2800*16',
  'روکش پی‌وی‌سی',
  'چسب کاشی',
  'لترون 16 میل',
];

export const DEFAULT_BRANDS = [
  'کرونوسپان',
  'ایزوفام',
  'پارس چسب',
  'ملامینه',
  'وود تک',
];

export function getItem<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch (e) {
    console.error(`Error reading ${key} from storage:`, e);
    return fallback;
  }
}

export function setItem<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Error writing ${key} to storage:`, e);
  }
}

export function loadAllData() {
  const t = todayJ();

  let importers = getItem<string[]>(KEYS.IMPORTERS, DEFAULT_IMPORTERS);
  let carriers = getItem<string[]>(KEYS.CARRIERS, DEFAULT_CARRIERS);
  let goodsList = getItem<string[]>(KEYS.GOODS, DEFAULT_GOODS);
  let brands = getItem<string[]>(KEYS.BRANDS, DEFAULT_BRANDS);

  let docs = getItem<EntryDoc[]>(KEYS.DOCS, []);
  let batches = getItem<Batch[]>(KEYS.BATCHES, []);
  let exits = getItem<ExitDoc[]>(KEYS.EXITS, []);
  let labRecords = getItem<LabRecord[]>(KEYS.LABRECS, []);

  const isInitialized = getItem<boolean>(KEYS.INITIALIZED, false);

  // Seed default items if completely empty and not previously initialized
  if (!isInitialized && docs.length === 0) {
    setItem(KEYS.INITIALIZED, true);
    const doc1Id = uid();
    const doc2Id = uid();
    const doc3Id = uid();
    const doc4Id = uid();

    docs = [
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
        file: '405101',
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
        cottage: '1403112',
        bl: 'SEETEC06119',
        file: '405202',
        importer: 'صنایع فولاد شرق',
        carrier: 'دریا طلایی خلیج فارس',
        goods: 'چسب کاشی',
        brand: 'پارس چسب',
        unloadDate: { jy: t.jy, jm: t.jm, jd: Math.max(1, t.jd - 2) },
        trailers: 6,
        unloaded: 3,
        pallets: 28,
        invoicePaid: false,
        receipt: { number: '', count: '' },
        tasks: { bl: true, arr: false, tali: false },
        createdAt: Date.now() - 180000000,
      },
      {
        id: doc4Id,
        cottage: '1404008',
        bl: 'SEETEC07200',
        file: '405303',
        importer: 'گروه صنعتی پارسیان',
        carrier: 'باربری نوین',
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

    // Create 1 finalized consolidation batch for doc1 and doc2
    const batchId = 'SEETEC05022COMB1001';
    batches = [
      {
        id: batchId,
        goods: 'ام دی اف 1830*3800*16',
        file: '405101',
        createdAt: { jy: t.jy, jm: t.jm, jd: Math.max(1, t.jd - 2) },
        docIds: [doc1Id, doc2Id],
        finalized: true,
      },
    ];

    // Seed 1 exit document
    exits = [
      {
        id: uid(),
        cottage: '1409821',
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
          comment: 'نتیجه تست: منفی (تایید استاندارد)',
          reusedFrom: null,
          recordId: 'lab-rec-1',
          validity: 6,
        },
        expert: { done: true },
        gate: { done: false },
        invoice: { paid: false },
        createdAt: Date.now() - 3600000,
      },
    ];

    labRecords = [
      {
        id: 'lab-rec-1',
        goods: 'ام دی اف 1830*3800*16',
        brand: 'کرونوسپان',
        sampleDate: t,
        validity: 6,
        comment: 'نتیجه آزمایشگاه: مطابق با استانداردهای گمرک و بهداشت',
        exitId: 'exit-1',
        createdAt: Date.now() - 3600000,
      },
    ];

    setItem(KEYS.DOCS, docs);
    setItem(KEYS.BATCHES, batches);
    setItem(KEYS.EXITS, exits);
    setItem(KEYS.LABRECS, labRecords);
    setItem(KEYS.IMPORTERS, importers);
    setItem(KEYS.CARRIERS, carriers);
    setItem(KEYS.GOODS, goodsList);
    setItem(KEYS.BRANDS, brands);
  }

  return {
    docs,
    batches,
    exits,
    labRecords,
    importers,
    carriers,
    goodsList,
    brands,
  };
}

export function saveAllData(data: {
  docs?: EntryDoc[];
  batches?: Batch[];
  exits?: ExitDoc[];
  labRecords?: LabRecord[];
  importers?: string[];
  carriers?: string[];
  goodsList?: string[];
  brands?: string[];
}) {
  if (data.docs !== undefined) setItem(KEYS.DOCS, data.docs);
  if (data.batches !== undefined) setItem(KEYS.BATCHES, data.batches);
  if (data.exits !== undefined) setItem(KEYS.EXITS, data.exits);
  if (data.labRecords !== undefined) setItem(KEYS.LABRECS, data.labRecords);
  if (data.importers !== undefined) setItem(KEYS.IMPORTERS, data.importers);
  if (data.carriers !== undefined) setItem(KEYS.CARRIERS, data.carriers);
  if (data.goodsList !== undefined) setItem(KEYS.GOODS, data.goodsList);
  if (data.brands !== undefined) setItem(KEYS.BRANDS, data.brands);
}

export function clearAllTestData(): void {
  setItem(KEYS.INITIALIZED, true);
  setItem(KEYS.DOCS, []);
  setItem(KEYS.BATCHES, []);
  setItem(KEYS.EXITS, []);
  setItem(KEYS.LABRECS, []);
}
