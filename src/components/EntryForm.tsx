import React, { useState, useEffect } from 'react';
import { HelpCircle, FilePlus, Save, TestTube } from 'lucide-react';
import { EntryDoc, JalaliDate } from '../types';
import { JalaliDatePicker } from './JalaliDatePicker';
import { ComboboxField } from './ComboboxField';
import { en, parseJ, todayJ, fa } from '../utils/jalali';

interface EntryFormProps {
  editingDoc: EntryDoc | null;
  onSubmit: (data: Omit<EntryDoc, 'id' | 'createdAt' | 'unloaded' | 'invoicePaid' | 'receipt' | 'tasks'>) => void;
  onCancelEdit: () => void;
  onSeedDemo: () => void;
  importers: string[];
  carriers: string[];
  goodsList: string[];
  brands: string[];
  onAddImporter: (name: string) => void;
  onAddCarrier: (name: string) => void;
  onAddGoods: (name: string) => void;
  onAddBrand: (name: string) => void;
  existingDocs: EntryDoc[];
}

export const EntryForm: React.FC<EntryFormProps> = ({
  editingDoc,
  onSubmit,
  onCancelEdit,
  onSeedDemo,
  importers,
  carriers,
  goodsList,
  brands,
  onAddImporter,
  onAddCarrier,
  onAddGoods,
  onAddBrand,
  existingDocs,
}) => {
  const [cottage, setCottage] = useState('');
  const [bl, setBl] = useState('');
  const [file, setFile] = useState('');
  const [importer, setImporter] = useState('');
  const [carrier, setCarrier] = useState('');
  const [goods, setGoods] = useState('');
  const [brand, setBrand] = useState('');
  const [unloadDate, setUnloadDate] = useState<JalaliDate>(todayJ());
  const [trailers, setTrailers] = useState('5');
  const [pallets, setPallets] = useState('40');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [activeHint, setActiveHint] = useState<string | null>(null);

  useEffect(() => {
    if (editingDoc) {
      setCottage(editingDoc.cottage);
      setBl(editingDoc.bl);
      setFile(editingDoc.file);
      setImporter(editingDoc.importer);
      setCarrier(editingDoc.carrier);
      setGoods(editingDoc.goods);
      setBrand(editingDoc.brand || '');
      setUnloadDate(editingDoc.unloadDate);
      setTrailers(String(editingDoc.trailers));
      setPallets(String(editingDoc.pallets || '0'));
      setErrors({});
    } else {
      setCottage('');
      setBl('');
      setFile('');
      setImporter('');
      setCarrier('');
      setGoods('');
      setBrand('');
      setUnloadDate(todayJ());
      setTrailers('5');
      setPallets('40');
      setErrors({});
    }
  }, [editingDoc]);

  const validate = () => {
    const errs: Record<string, string> = {};
    const cot = en(cottage.trim());
    const blVal = bl.trim().toUpperCase();
    const fileVal = en(file.trim());

    if (!/^\d{7}$/.test(cot)) {
      errs.cottage = 'شماره کوتاژ باید دقیقاً ۷ رقم عددی باشد';
    } else if (existingDocs.some((d) => d.cottage === cot && d.id !== editingDoc?.id)) {
      errs.cottage = 'این شماره کوتاژ قبلاً ثبت شده است';
    }

    if (!/^SEETEC\d{5}$/.test(blVal)) {
      errs.bl = 'بارنامه باید SEETEC + ۵ رقم باشد (مانند SEETEC05022)';
    } else if (existingDocs.some((d) => d.bl === blVal && d.id !== editingDoc?.id)) {
      errs.bl = 'این شماره بارنامه قبلاً ثبت شده است';
    }

    if (!/^\d{6}$/.test(fileVal)) {
      errs.file = 'شماره پرونده باید دقیقاً ۶ رقم باشد';
    }

    if (!importer) errs.importer = 'شرکت واردکننده را انتخاب کنید';
    if (!carrier) errs.carrier = 'شرکت حمل‌ونقل را انتخاب کنید';
    if (!goods) errs.goods = 'نوع کالا را انتخاب کنید';

    const trNum = parseInt(en(trailers), 10);
    if (isNaN(trNum) || trNum < 1) {
      errs.trailers = 'تعداد تریلی حداقل ۱ باشد';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      cottage: en(cottage.trim()),
      bl: bl.trim().toUpperCase(),
      file: en(file.trim()),
      importer,
      carrier,
      goods,
      brand,
      unloadDate,
      trailers: parseInt(en(trailers), 10) || 1,
      pallets: parseInt(en(pallets), 10) || 0,
    });
  };

  return (
    <aside className="glass-panel p-5.5 rounded-2xl shadow-xl sticky top-24">
      <div className="flex items-center gap-3 pb-4 mb-5 border-b border-white/10">
        <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
          <FilePlus className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-lalezar text-xl text-slate-100 font-normal tracking-wide">
            {editingDoc ? 'ویرایش سند ورود کالا' : 'ثبت سند ورود کالا'}
          </h3>
          <p className="text-[11px] text-slate-400">
            کوتاژ و بارنامه از طریق شماره پرونده متصل می‌شوند
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Row 1: Cottage & BL */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300 flex items-center gap-1">
              شماره کوتاژ <span className="text-amber-400">*</span>
              <button
                type="button"
                onClick={() => setActiveHint(activeHint === 'cottage' ? null : 'cottage')}
                className="text-cyan-400 border border-dashed border-cyan-400/50 rounded-full text-[10px] px-1 hover:bg-cyan-400/10"
              >
                ؟
              </button>
            </label>
            {activeHint === 'cottage' && (
              <p className="text-[10px] text-cyan-300 bg-white/5 p-2 rounded-lg border border-cyan-400/30">
                شناسه ۷ رقمی عددی و یکتا برای اظهارنامه گمرکی
              </p>
            )}
            <input
              type="text"
              inputMode="numeric"
              maxLength={7}
              value={cottage}
              onChange={(e) => setCottage(e.target.value)}
              placeholder="1402234"
              className={`w-full glass-input rounded-xl px-3 py-2.5 text-sm ltr text-left outline-none ${
                errors.cottage ? 'border-rose-500' : ''
              }`}
            />
            {errors.cottage && <p className="text-[10px] text-rose-400">{errors.cottage}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300 flex items-center gap-1">
              شماره بارنامه <span className="text-amber-400">*</span>
              <button
                type="button"
                onClick={() => setActiveHint(activeHint === 'bl' ? null : 'bl')}
                className="text-cyan-400 border border-dashed border-cyan-400/50 rounded-full text-[10px] px-1 hover:bg-cyan-400/10"
              >
                ؟
              </button>
            </label>
            {activeHint === 'bl' && (
              <p className="text-[10px] text-cyan-300 bg-white/5 p-2 rounded-lg border border-cyan-400/30">
                با SEETEC شروع می‌شود و با ۵ رقم تمام می‌شود
              </p>
            )}
            <input
              type="text"
              maxLength={11}
              value={bl}
              onChange={(e) => setBl(e.target.value.toUpperCase())}
              placeholder="SEETEC05022"
              className={`w-full glass-input rounded-xl px-3 py-2.5 text-sm ltr text-left outline-none uppercase ${
                errors.bl ? 'border-rose-500' : ''
              }`}
            />
            {errors.bl && <p className="text-[10px] text-rose-400">{errors.bl}</p>}
          </div>
        </div>

        {/* Row 2: File & Date */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              شماره پرونده <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={file}
              onChange={(e) => setFile(e.target.value)}
              placeholder="405101"
              className={`w-full glass-input rounded-xl px-3 py-2.5 text-sm ltr text-left outline-none ${
                errors.file ? 'border-rose-500' : ''
              }`}
            />
            {errors.file && <p className="text-[10px] text-rose-400">{errors.file}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              تاریخ تخلیه <span className="text-amber-400">*</span>
            </label>
            <JalaliDatePicker value={unloadDate} onChange={setUnloadDate} />
          </div>
        </div>

        {/* Comboboxes */}
        <ComboboxField
          label="شرکت واردکننده"
          required
          value={importer}
          onChange={setImporter}
          options={importers}
          onAddNew={onAddImporter}
          placeholder="— انتخاب واردکننده —"
          error={errors.importer}
        />

        <ComboboxField
          label="شرکت حمل‌ونقل"
          required
          value={carrier}
          onChange={setCarrier}
          options={carriers}
          onAddNew={onAddCarrier}
          placeholder="— انتخاب شرکت حمل —"
          error={errors.carrier}
        />

        <ComboboxField
          label="نوع کالا"
          required
          value={goods}
          onChange={setGoods}
          options={goodsList}
          onAddNew={onAddGoods}
          placeholder="— انتخاب نوع کالا —"
          error={errors.goods}
        />

        <ComboboxField
          label="برند کالا"
          value={brand}
          onChange={setBrand}
          options={brands}
          onAddNew={onAddBrand}
          placeholder="— انتخاب برند کالا —"
        />

        {/* Row 3: Trailers & Pallets */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">
              تعداد تریلی <span className="text-amber-400">*</span>
            </label>
            <input
              type="number"
              min={1}
              value={trailers}
              onChange={(e) => setTrailers(e.target.value)}
              placeholder="مثلاً 5"
              className={`w-full glass-input rounded-xl px-3 py-2.5 text-sm outline-none ${
                errors.trailers ? 'border-rose-500' : ''
              }`}
            />
            {errors.trailers && <p className="text-[10px] text-rose-400">{errors.trailers}</p>}
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-medium text-slate-300">تعداد پالت</label>
            <input
              type="number"
              min={0}
              value={pallets}
              onChange={(e) => setPallets(e.target.value)}
              placeholder="مثلاً 40"
              className="w-full glass-input rounded-xl px-3 py-2.5 text-sm outline-none"
            />
          </div>
        </div>

        {/* Submit / Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-sm hover:from-amber-300 hover:to-amber-400 transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{editingDoc ? 'بروزرسانی سند ورود' : 'ذخیره سند ورود'}</span>
          </button>

          {editingDoc && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="w-full py-2 px-4 rounded-xl border border-white/10 text-slate-400 hover:text-slate-100 hover:bg-white/5 transition-colors text-xs"
            >
              انصراف از ویرایش
            </button>
          )}

          {!editingDoc && (
            <button
              type="button"
              onClick={onSeedDemo}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300 hover:bg-purple-500/25 font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              title="ایجاد داده‌های جامع تست با تمام سناریوها و پرونده‌های چند کوتاژی"
            >
              <TestTube className="w-3.5 h-3.5 text-purple-400" />
              <span>ثبت داده‌های نمونه هوشمند تست</span>
            </button>
          )}
        </div>
      </form>
    </aside>
  );
};
