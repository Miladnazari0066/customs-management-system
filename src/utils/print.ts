import { EntryDoc, Batch, ExitDoc } from '../types';
import { fa, fmtJ, todayJ, esc } from './jalali';

export function printBatchReceipts(batch: Batch, memberDocs: EntryDoc[]) {
  const rows = memberDocs
    .map(
      (d) => `
    <tr>
      <td>${fa(d.cottage)}</td>
      <td>${esc(d.bl)}</td>
      <td>${esc(d.receipt.number) || '—'}</td>
      <td>${esc(d.goods) || '—'}</td>
      <td>${esc(d.brand) || '—'}</td>
      <td>${esc(d.receipt.count) || '—'}</td>
      <td>${d.pallets ? fa(d.pallets) : '—'}</td>
    </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <title>قبض‌های انبار تجمیع ${fa(batch.id)}</title>
  <style>
    * { font-family: Tahoma, Arial, sans-serif; box-sizing: border-box; }
    body { padding: 30px; color: #000; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 16px; }
    h1 { font-size: 20px; margin: 0; }
    .meta { color: #333; font-size: 13px; margin: 10px 0 18px; line-height: 2; background: #f5f5f5; padding: 14px; border-radius: 6px; border: 1px solid #ddd; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #555; padding: 9px 12px; text-align: right; font-size: 13px; }
    th { background: #eee; font-weight: bold; }
    .foot { margin-top: 24px; font-size: 12px; color: #555; border-top: 1px solid #ccc; padding-top: 12px; display: flex; justify-content: space-between; }
    @media print { body { padding: 15px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>پایانه گمرک — قبض‌های انبار تجمیع‌یافته</h1>
    <div>تاریخ چاپ: ${fmtJ(todayJ())}</div>
  </div>
  <div class="meta">
    <b>شناسه تجمیع:</b> ${esc(String(batch.id))} &nbsp;|&nbsp;
    <b>نوع کالا:</b> ${esc(batch.goods)} &nbsp;|&nbsp;
    <b>شماره پرونده:</b> ${fa(batch.file)} &nbsp;|&nbsp;
    <b>تاریخ تجمیع:</b> ${fmtJ(batch.createdAt)}<br>
    <b>تعداد کل اقلام تجمیع:</b> ${fa(memberDocs.length)} قبض انبار &nbsp;|&nbsp;
    <b>مجموع پالت‌ها:</b> ${fa(memberDocs.reduce((a, d) => a + d.pallets, 0))} پالت
  </div>
  <table>
    <thead>
      <tr>
        <th>شماره کوتاژ</th>
        <th>شماره بارنامه</th>
        <th>شماره قبض انبار</th>
        <th>نوع کالا</th>
        <th>برند</th>
        <th>تعداد اقلام</th>
        <th>تعداد پالت</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="7" style="text-align:center">هیچ سندی یافت نشد</td></tr>'}
    </tbody>
  </table>
  <div class="foot">
    <span>تعداد کل قبض‌ها: ${fa(memberDocs.length)}</span>
    <span>جهت ارائه به گمرک جمهوری اسلامی ایران</span>
  </div>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) {
    alert('لطفاً پنجره‌های بازشو (Pop-up) را در مرورگر خود مجاز کنید.');
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => {
    try {
      w.print();
    } catch (e) {
      console.error(e);
    }
  }, 400);
}

export function printExitReceipts(
  exitDoc: ExitDoc,
  batch: Batch | undefined,
  memberDocs: EntryDoc[]
) {
  const rows = memberDocs
    .map(
      (d) => `
    <tr>
      <td>${fa(d.cottage)}</td>
      <td>${esc(d.bl)}</td>
      <td>${esc(d.receipt.number) || '—'}</td>
      <td>${esc(d.goods) || '—'}</td>
      <td>${esc(d.brand) || '—'}</td>
      <td>${esc(d.receipt.count) || '—'}</td>
      <td>${d.pallets ? fa(d.pallets) : '—'}</td>
    </tr>`
    )
    .join('');

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="fa">
<head>
  <meta charset="UTF-8">
  <title>مجوز خروج کالا ${fa(exitDoc.cottage)}</title>
  <style>
    * { font-family: Tahoma, Arial, sans-serif; box-sizing: border-box; }
    body { padding: 30px; color: #000; background: #fff; }
    .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #333; padding-bottom: 12px; margin-bottom: 16px; }
    h1 { font-size: 20px; margin: 0; }
    .meta { color: #222; font-size: 13px; margin: 10px 0 18px; line-height: 2; background: #f5f5f5; padding: 14px; border-radius: 6px; border: 1px solid #ccc; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { border: 1px solid #555; padding: 9px 12px; text-align: right; font-size: 13px; }
    th { background: #eee; font-weight: bold; }
    .foot { margin-top: 24px; font-size: 12px; color: #555; border-top: 1px solid #ccc; padding-top: 12px; display: flex; justify-content: space-between; }
    .seal { display: inline-block; border: 2px solid #16a34a; color: #16a34a; font-weight: bold; padding: 4px 16px; border-radius: 4px; font-size: 14px; margin-top: 10px; }
    @media print { body { padding: 15px; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>پایانه گمرک — پروانه و قبض‌های خروج کالا</h1>
    <div>تاریخ صادر: ${fmtJ(todayJ())}</div>
  </div>
  <div class="meta">
    <b>کوتاژ خروج:</b> ${fa(exitDoc.cottage)} &nbsp;|&nbsp;
    <b>بارنامه خروج:</b> ${esc(exitDoc.bl)} &nbsp;|&nbsp;
    <b>شماره پرونده:</b> ${fa(exitDoc.file)} &nbsp;|&nbsp;
    <b>تجمیع مربوطه:</b> ${esc(String(exitDoc.batchId))}<br>
    <b>شرکت واردکننده:</b> ${esc(exitDoc.importer)} &nbsp;|&nbsp;
    <b>شرکت حمل‌ونقل:</b> ${esc(exitDoc.carrier)}<br>
    <b>نوع کالا:</b> ${esc(exitDoc.goods)} &nbsp;|&nbsp;
    <b>برند:</b> ${esc(exitDoc.brand) || '—'} &nbsp;|&nbsp;
    <b>تریلی / پالت:</b> ${fa(exitDoc.trailers)} تریلی / ${fa(exitDoc.pallets)} پالت
    <div>
      <span class="seal">تاییدیه تشریفات خروج گمرکی صادر شد ✓</span>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>شماره کوتاژ ورود</th>
        <th>شماره بارنامه</th>
        <th>شماره قبض انبار</th>
        <th>نوع کالا</th>
        <th>برند</th>
        <th>تعداد اقلام</th>
        <th>تعداد پالت</th>
      </tr>
    </thead>
    <tbody>
      ${rows || '<tr><td colspan="7" style="text-align:center">اقلام تجمیعی یافت نشد</td></tr>'}
    </tbody>
  </table>
  <div class="foot">
    <span>تعداد اقلام تجمیعی خروجی: ${fa(memberDocs.length)}</span>
    <span>صادرشده جهت ارائه به درب خروج گمرک پایانه</span>
  </div>
</body>
</html>`;

  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) {
    alert('لطفاً پنجره‌های بازشو (Pop-up) را در مرورگر خود مجاز کنید.');
    return;
  }
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => {
    try {
      w.print();
    } catch (e) {
      console.error(e);
    }
  }, 400);
}
