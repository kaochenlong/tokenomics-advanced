// usage-report.js
//
// 讀團隊的 AI 用量報表，依人彙總 credits、用了哪些模型、快取命中率。
//
// reports/ai-usage-2026-09.csv 是練習用的假資料。欄位名稱照 GitHub 帳務報表頁的
// AI usage report，只留下這個練習用得到的幾欄：
// https://docs.github.com/en/billing/reference/billing-reports
// 這份假資料把 input 當成沒命中快取的部分，cache_read、cache_write 另外列。
//
// credits 用 credits.js 的定價重算，Auto 的九折沒有算進去。
//
// 用法：node scripts/usage-report.js [csv 路徑]

import { readFileSync } from 'node:fs';
import { credits } from './credits.js';

const FILE = process.argv[2] || 'reports/ai-usage-2026-09.csv';

// Copilot Business 每個席次每月含 1,900 AI credits，整個帳務單位共用
// https://docs.github.com/en/copilot/concepts/billing/usage-based-billing-for-organizations-and-enterprises
const SEATS = 10;
const INCLUDED_PER_SEAT = 1900;

const [header, ...lines] = readFileSync(FILE, 'utf8').trim().split(/\r?\n/);
const cols = header.split(',');
const rows = lines.map((line) => {
  const v = line.split(',');
  const r = Object.fromEntries(cols.map((c, i) => [c, v[i]]));
  for (const k of ['input', 'output', 'cache_read', 'cache_write']) r[k] = Number(r[k]);
  return r;
});

const users = new Map();
for (const r of rows) {
  const u = users.get(r.username) || { credits: 0, read: 0, allInput: 0, out: 0, models: {} };
  const c = credits(r.model, { input: r.input, cached: r.cache_read, cacheWrite: r.cache_write, output: r.output });
  u.credits += c;
  u.read += r.cache_read;
  u.allInput += r.input + r.cache_read + r.cache_write;
  u.out += credits(r.model, { output: r.output });
  u.models[r.model] = (u.models[r.model] || 0) + c;
  users.set(r.username, u);
}

const sorted = [...users.entries()].sort((a, b) => b[1].credits - a[1].credits);
const total = sorted.reduce((s, [, u]) => s + u.credits, 0);
const pool = SEATS * INCLUDED_PER_SEAT;

console.log('報表：' + FILE + '（' + rows.length + ' 列）');
console.log('');
console.log('  使用者   credits   快取命中率   花在哪個模型');
for (const [name, u] of sorted) {
  const mix = Object.entries(u.models)
    .sort((a, b) => b[1] - a[1])
    .map(([m, c]) => m + ' ' + Math.round((c / u.credits) * 100) + '%')
    .join('、');
  console.log(
    '  ' + name.padEnd(7) +
    Math.round(u.credits).toLocaleString('en-US').padStart(8) +
    (Math.round((u.read / u.allInput) * 100) + '%').padStart(11) +
    '     ' + mix
  );
}
console.log('');
console.log('  合計 ' + Math.round(total).toLocaleString('en-US') + ' credits，' +
  SEATS + ' 個席次共用 ' + pool.toLocaleString('en-US') + ' credits，' +
  (total > pool ? '超出 ' + Math.round(total - pool).toLocaleString('en-US') + ' credits（約 ' + ((total - pool) / 100).toFixed(0) + ' 美金）' : '還剩 ' + Math.round(pool - total).toLocaleString('en-US')));
