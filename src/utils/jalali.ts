import { JalaliDate } from '../types';

const FAD = '۰۱۲۳۴۵۶۷۸۹';

/**
 * Convert English digits to Persian digits
 */
export function fa(v: string | number): string {
  return String(v).replace(/[0-9]/g, (d) => FAD[parseInt(d, 10)]);
}

/**
 * Convert Persian/Arabic digits to English digits
 */
export function en(s: string | number): string {
  return String(s)
    .replace(/[۰-۹]/g, (d) => String(FAD.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));
}

export function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

export const JMONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export const WDN = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
  'شنبه',
];

const div = (a: number, b: number) => ~~(a / b);
const mod = (a: number, b: number) => a - ~~(a / b) * b;

function jalCal(jy: number) {
  const breaks = [
    -61, 9, 38, 473, 521, 575, 629, 683, 737, 791, 845, 899, 953, 1007, 1061,
    1115, 1169, 1223, 1277, 1331, 1385, 1439, 1493, 1547, 1601, 1655, 1709,
    1763, 1817, 1871, 1925, 1979, 2033, 2087, 2141, 2195, 2249, 2303, 2357,
    2411, 2465, 2519, 2573, 2627, 2681, 2735, 2789, 2843, 2897, 2951, 3005, 3059,
  ];
  const bl = breaks.length;
  const gy = jy + 621;
  let leapJ = -14;
  let jp = breaks[0];
  let jump = 1;

  for (let i = 1; i < bl && jy >= breaks[i]; i += 1) {
    const jm = breaks[i];
    jump = jm - jp;
    leapJ += div(jump, 33) * 8 + div(mod(jump, 33), 4);
    jp = jm;
  }
  const n = jy - jp;
  leapJ += div(n, 33) * 8 + div(mod(n, 33) + 3, 4);
  if (mod(jump, 33) === 4 && jump - n === 4) leapJ += 1;
  const leapG = div(gy, 4) - div((div(gy, 100) + 1) * 3, 4) - 150;
  const march = 20 + leapJ - leapG;
  let nn = n;
  if (jump - n < 6) nn = n - jump + div(jump + 4, 33) * 33;
  let leap = mod(mod(nn + 1, 33) - 1, 4);
  if (leap === -1) leap = 4;

  return { leap, gy, march };
}

function g2d(gy: number, gm: number, gd: number) {
  let d =
    div((gy + div(gm - 8, 6) + 100100) * 1461, 4) +
    div(153 * mod(gm + 9, 12) + 2, 5) +
    gd -
    34840408;
  d = d - div(div(gy + 100100 + div(gm - 8, 6), 100) * 3, 4) + 752;
  return d;
}

export function d2g(jdn: number) {
  let j = 4 * jdn + 139361631;
  j = j + div(div(4 * jdn + 183187720, 146097) * 3, 4) * 4 - 3908;
  const i = div(mod(j, 1461), 4) * 5 + 308;
  const gd = div(mod(i, 153), 5) + 1;
  const gm = mod(div(i, 153), 12) + 1;
  const gy = div(j, 1461) - 100100 + div(8 - gm, 6);
  return { gy, gm, gd };
}

export function j2d(jy: number, jm: number, jd: number): number {
  const r = jalCal(jy);
  return g2d(r.gy, 3, r.march) + (jm - 1) * 31 - div(jm, 7) * (jm - 7) + jd - 1;
}

export function d2j(jdn: number): JalaliDate {
  const gy = d2g(jdn).gy;
  let jy = gy - 621;
  const r = jalCal(jy);
  const jdn1f = g2d(gy, 3, r.march);
  let k = jdn - jdn1f;
  if (k >= 0) {
    if (k <= 185) return { jy, jm: 1 + div(k, 31), jd: mod(k, 31) + 1 };
    k -= 186;
  } else {
    jy -= 1;
    k += 179;
    if (r.leap === 1) k += 1;
  }
  return { jy, jm: 7 + div(k, 30), jd: mod(k, 30) + 1 };
}

export function toJalali(gy: number, gm: number, gd: number): JalaliDate {
  return d2j(g2d(gy, gm, gd));
}

export function jMonthLen(jy: number, jm: number): number {
  return jm <= 6 ? 31 : jm <= 11 ? 30 : jalCal(jy).leap === 0 ? 30 : 29;
}

export function todayJ(): JalaliDate {
  const n = new Date();
  return toJalali(n.getFullYear(), n.getMonth() + 1, n.getDate());
}

export function fmtJ(d: JalaliDate | null | undefined): string {
  if (!d) return '—';
  return `${fa(d.jy)}/${fa(pad2(d.jm))}/${fa(pad2(d.jd))}`;
}

export function parseJ(s: string): JalaliDate | null {
  const cleaned = en(String(s).trim());
  const m = cleaned.match(/^(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})$/);
  if (!m) return null;
  const jy = parseInt(m[1], 10);
  const jm = parseInt(m[2], 10);
  const jd = parseInt(m[3], 10);
  if (jm < 1 || jm > 12 || jd < 1 || jd > jMonthLen(jy, jm)) return null;
  return { jy, jm, jd };
}

export function addMonthsJ(d: JalaliDate, m: number): JalaliDate {
  let jm = d.jm + m;
  let jy = d.jy + Math.floor((jm - 1) / 12);
  jm = ((jm - 1) % 12) + 1;
  if (jm <= 0) jm += 12;
  return { jy, jm, jd: Math.min(d.jd, jMonthLen(jy, jm)) };
}

export function daysUntil(d: JalaliDate): number {
  const t = todayJ();
  return j2d(d.jy, d.jm, d.jd) - j2d(t.jy, t.jm, t.jd);
}

export function remTxt(days: number): string {
  if (days <= 0) return 'منقضی شده';
  const m = Math.floor(days / 30);
  const d = days % 30;
  if (m > 0) {
    return `${fa(m)} ماه و ${fa(d)} روز`;
  }
  return `${fa(days)} روز`;
}

export function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function esc(s: string | null | undefined): string {
  return String(s ?? '')
    .replace(/[&<>"']/g, (c) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }[c] || c));
}
