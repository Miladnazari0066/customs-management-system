import { getSupabase, isSupabaseConfigured } from '../lib/supabase';
import { EntryDoc, Batch, LabRecord, ExitDoc } from '../types';

export interface AllAppData {
  docs: EntryDoc[];
  batches: Batch[];
  exits: ExitDoc[];
  labRecords: LabRecord[];
  importers: string[];
  carriers: string[];
  goodsList: string[];
  brands: string[];
}

export function formatSupabaseError(err: any): Error {
  if (!err) return new Error('خطای نامشخص در دیتابیس');
  if (typeof err === 'string') return new Error(err);

  const code = err.code || '';
  const message = err.message || '';

  if (code === 'PGRST205' || message.includes('schema cache') || message.includes('Could not find the table') || message.includes('relation') && message.includes('does not exist')) {
    const error = new Error('جداول دیتابیس در پروژه‌ی Supabase ساخته نشده‌اند. لطفاً کد SQL را در Supabase SQL Editor اجرا کنید.');
    (error as any).code = 'PGRST205';
    (error as any).isTableMissing = true;
    return error;
  }

  if (code === 'PGRST301' || code === '42501' || message.includes('permission denied') || message.includes('row-level security')) {
    const error = new Error('خطای دسترسی دیتابیس (RLS). لطفاً سیاست‌های دسترسی را در Supabase چک کنید.');
    (error as any).code = code;
    return error;
  }

  const friendlyMsg = err.message || err.details || 'خطای برقراری ارتباط با دیتابیس ابری Supabase';
  const error = new Error(friendlyMsg);
  (error as any).code = code;
  return error;
}

// Map Database Row -> EntryDoc
function mapEntryDocFromDb(row: any): EntryDoc {
  return {
    id: row.id,
    cottage: row.cottage || '',
    bl: row.bl || '',
    file: row.file || '',
    importer: row.importer || '',
    carrier: row.carrier || '',
    goods: row.goods || '',
    brand: row.brand || '',
    unloadDate: row.unload_date || { jy: 1402, jm: 1, jd: 1 },
    trailers: Number(row.trailers || 0),
    unloaded: Number(row.unloaded || 0),
    pallets: Number(row.pallets || 0),
    invoicePaid: Boolean(row.invoice_paid),
    receipt: row.receipt || { number: '', count: '' },
    tasks: row.tasks || { bl: false, arr: false, tali: false },
    createdAt: Number(row.created_at || Date.now()),
  };
}

// Map EntryDoc -> Database Row
function mapEntryDocToDb(doc: EntryDoc) {
  return {
    id: doc.id,
    cottage: doc.cottage,
    bl: doc.bl,
    file: doc.file,
    importer: doc.importer,
    carrier: doc.carrier,
    goods: doc.goods,
    brand: doc.brand,
    unload_date: doc.unloadDate,
    trailers: doc.trailers,
    unloaded: doc.unloaded,
    pallets: doc.pallets,
    invoice_paid: doc.invoicePaid,
    receipt: doc.receipt,
    tasks: doc.tasks,
    created_at: doc.createdAt,
    updated_at: new Date().toISOString(),
  };
}

// Map Database Row -> Batch
function mapBatchFromDb(row: any): Batch {
  return {
    id: row.id,
    goods: row.goods || '',
    file: row.file || '',
    createdAt: row.created_at || { jy: 1402, jm: 1, jd: 1 },
    docIds: Array.isArray(row.doc_ids) ? row.doc_ids : [],
    finalized: Boolean(row.finalized),
    exited: Boolean(row.exited),
  };
}

// Map Batch -> Database Row
function mapBatchToDb(batch: Batch) {
  return {
    id: batch.id,
    goods: batch.goods,
    file: batch.file,
    created_at: batch.createdAt,
    doc_ids: batch.docIds,
    finalized: batch.finalized,
    exited: Boolean(batch.exited),
    updated_at: new Date().toISOString(),
  };
}

// Map Database Row -> LabRecord
function mapLabRecordFromDb(row: any): LabRecord {
  return {
    id: row.id,
    goods: row.goods || '',
    brand: row.brand || '',
    sampleDate: row.sample_date || { jy: 1402, jm: 1, jd: 1 },
    validity: Number(row.validity || 6),
    comment: row.comment || '',
    exitId: row.exit_id || undefined,
    createdAt: Number(row.created_at || Date.now()),
  };
}

// Map LabRecord -> Database Row
function mapLabRecordToDb(lab: LabRecord) {
  return {
    id: lab.id,
    goods: lab.goods,
    brand: lab.brand,
    sample_date: lab.sampleDate,
    validity: lab.validity,
    comment: lab.comment,
    exit_id: lab.exitId || null,
    created_at: lab.createdAt,
    updated_at: new Date().toISOString(),
  };
}

// Map Database Row -> ExitDoc
function mapExitDocFromDb(row: any): ExitDoc {
  return {
    id: row.id,
    cottage: row.cottage || '',
    bl: row.bl || '',
    file: row.file || '',
    unloadDate: row.unload_date || { jy: 1402, jm: 1, jd: 1 },
    importer: row.importer || '',
    carrier: row.carrier || '',
    goods: row.goods || '',
    brand: row.brand || '',
    trailers: Number(row.trailers || 0),
    pallets: Number(row.pallets || 0),
    batchId: row.batch_id || '',
    route: row.route || 'yellow',
    evaluator: row.evaluator || { done: false, comment: '' },
    jihad: row.jihad || { done: false, comment: '' },
    lab: row.lab || {
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
    expert: row.expert || { done: false },
    gate: row.gate || { done: false },
    invoice: row.invoice || { paid: false },
    createdAt: Number(row.created_at || Date.now()),
  };
}

// Map ExitDoc -> Database Row
function mapExitDocToDb(exit: ExitDoc) {
  return {
    id: exit.id,
    cottage: exit.cottage,
    bl: exit.bl,
    file: exit.file,
    unload_date: exit.unloadDate,
    importer: exit.importer,
    carrier: exit.carrier,
    goods: exit.goods,
    brand: exit.brand,
    trailers: exit.trailers,
    pallets: exit.pallets,
    batch_id: exit.batchId,
    route: exit.route,
    evaluator: exit.evaluator,
    jihad: exit.jihad,
    lab: exit.lab,
    expert: exit.expert,
    gate: exit.gate,
    invoice: exit.invoice,
    created_at: exit.createdAt,
    updated_at: new Date().toISOString(),
  };
}

// ----------------------------------------------------------------------
// API / DATABASE SERVICE METHODS
// ----------------------------------------------------------------------

export async function fetchAllDataFromCloud(): Promise<AllAppData | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const [
      { data: docsData, error: docsErr },
      { data: batchesData, error: batchesErr },
      { data: exitsData, error: exitsErr },
      { data: labData, error: labErr },
      { data: lookupData, error: lookupErr },
    ] = await Promise.all([
      supabase.from('entry_docs').select('*').order('created_at', { ascending: false }),
      supabase.from('batches').select('*'),
      supabase.from('exit_docs').select('*').order('created_at', { ascending: false }),
      supabase.from('lab_records').select('*').order('created_at', { ascending: false }),
      supabase.from('lookup_options').select('*').eq('id', 'global_options').maybeSingle(),
    ]);

    if (docsErr) throw formatSupabaseError(docsErr);
    if (batchesErr) throw formatSupabaseError(batchesErr);
    if (exitsErr) throw formatSupabaseError(exitsErr);
    if (labErr) throw formatSupabaseError(labErr);

    const docs = (docsData || []).map(mapEntryDocFromDb);
    const batches = (batchesData || []).map(mapBatchFromDb);
    const exits = (exitsData || []).map(mapExitDocFromDb);
    const labRecords = (labData || []).map(mapLabRecordFromDb);

    const importers = Array.isArray(lookupData?.importers) ? lookupData.importers : [];
    const carriers = Array.isArray(lookupData?.carriers) ? lookupData.carriers : [];
    const goodsList = Array.isArray(lookupData?.goods_list) ? lookupData.goods_list : [];
    const brands = Array.isArray(lookupData?.brands) ? lookupData.brands : [];

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
  } catch (err) {
    const formatted = formatSupabaseError(err);
    if ((formatted as any).isTableMissing) {
      console.warn('Supabase DB notice:', formatted.message);
    } else {
      console.error('Supabase DB error:', formatted.message);
    }
    throw formatted;
  }
}

// Save or Update EntryDoc
export async function saveEntryDocCloud(doc: EntryDoc): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const row = mapEntryDocToDb(doc);
  const { error } = await supabase.from('entry_docs').upsert(row);
  if (error) throw formatSupabaseError(error);
}

// Delete EntryDoc
export async function deleteEntryDocCloud(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from('entry_docs').delete().eq('id', id);
  if (error) throw formatSupabaseError(error);
}

// Save or Update Batch
export async function saveBatchCloud(batch: Batch): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const row = mapBatchToDb(batch);
  const { error } = await supabase.from('batches').upsert(row);
  if (error) throw formatSupabaseError(error);
}

// Delete Batch
export async function deleteBatchCloud(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from('batches').delete().eq('id', id);
  if (error) throw formatSupabaseError(error);
}

// Save or Update ExitDoc
export async function saveExitDocCloud(exit: ExitDoc): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const row = mapExitDocToDb(exit);
  const { error } = await supabase.from('exit_docs').upsert(row);
  if (error) throw formatSupabaseError(error);
}

// Delete ExitDoc
export async function deleteExitDocCloud(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from('exit_docs').delete().eq('id', id);
  if (error) throw formatSupabaseError(error);
}

// Save or Update LabRecord
export async function saveLabRecordCloud(lab: LabRecord): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const row = mapLabRecordToDb(lab);
  const { error } = await supabase.from('lab_records').upsert(row);
  if (error) throw formatSupabaseError(error);
}

// Delete LabRecord
export async function deleteLabRecordCloud(id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;
  const { error } = await supabase.from('lab_records').delete().eq('id', id);
  if (error) throw formatSupabaseError(error);
}

// Save Lookup Options
export async function saveLookupOptionsCloud(options: {
  importers?: string[];
  carriers?: string[];
  goodsList?: string[];
  brands?: string[];
}): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) return;

  const payload: any = {
    id: 'global_options',
    updated_at: new Date().toISOString(),
  };

  if (options.importers !== undefined) payload.importers = options.importers;
  if (options.carriers !== undefined) payload.carriers = options.carriers;
  if (options.goodsList !== undefined) payload.goods_list = options.goodsList;
  if (options.brands !== undefined) payload.brands = options.brands;

  const { error } = await supabase.from('lookup_options').upsert(payload);
  if (error) throw formatSupabaseError(error);
}

// Bulk Sync All Local Data to Cloud Database (Migration)
export async function migrateLocalDataToCloud(localData: AllAppData): Promise<{
  docsSynced: number;
  batchesSynced: number;
  exitsSynced: number;
  labSynced: number;
}> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('اتصال دیتابیس ابری برقرار نیست');

  let docsSynced = 0;
  let batchesSynced = 0;
  let exitsSynced = 0;
  let labSynced = 0;

  // 1. Sync Docs
  if (localData.docs && localData.docs.length > 0) {
    const rows = localData.docs.map(mapEntryDocToDb);
    const { error } = await supabase.from('entry_docs').upsert(rows);
    if (error) throw formatSupabaseError(error);
    docsSynced = rows.length;
  }

  // 2. Sync Batches
  if (localData.batches && localData.batches.length > 0) {
    const rows = localData.batches.map(mapBatchToDb);
    const { error } = await supabase.from('batches').upsert(rows);
    if (error) throw formatSupabaseError(error);
    batchesSynced = rows.length;
  }

  // 3. Sync Exits
  if (localData.exits && localData.exits.length > 0) {
    const rows = localData.exits.map(mapExitDocToDb);
    const { error } = await supabase.from('exit_docs').upsert(rows);
    if (error) throw formatSupabaseError(error);
    exitsSynced = rows.length;
  }

  // 4. Sync Lab Records
  if (localData.labRecords && localData.labRecords.length > 0) {
    const rows = localData.labRecords.map(mapLabRecordToDb);
    const { error } = await supabase.from('lab_records').upsert(rows);
    if (error) throw formatSupabaseError(error);
    labSynced = rows.length;
  }

  // 5. Sync Lookup Options
  await saveLookupOptionsCloud({
    importers: localData.importers,
    carriers: localData.carriers,
    goodsList: localData.goodsList,
    brands: localData.brands,
  });

  return {
    docsSynced,
    batchesSynced,
    exitsSynced,
    labSynced,
  };
}
