// style-report.js
//
// 比較三種做法：什麼都不加、規則檔加一行「回答盡量簡短」、用 caveman 的 skill。
// 下面的數字是我用 Copilot CLI 跑 prompts/task.txt、各跑一次量到的。
// VS Code 的系統說明跟工具不一樣，數字會不同，做練習時換成你自己量到的。
//
// 用法：node scripts/style-report.js

import { credits } from './credits.js';

const MODEL = 'gpt-6.1-sol';
const RUNS = 1;   // 各跑了幾次；跑三次就填 3，下面的 token 填平均

// 換成你的實測（從回覆下方的 Response details 抄下來）
// cacheWrite 是快取寫入，畫面上沒有分開顯示的話填 0
// A：什麼都不加，B：規則檔加一行「回答盡量簡短」，C：用 caveman 的 skill
// pass 是測試通過幾次
const arms = [
  { name: 'A', input: 94202,  cached: 82850,  cacheWrite: 11337, output: 2300, pass: 1 },
  { name: 'B', input: 94291,  cached: 83042,  cacheWrite: 11234, output: 2189, pass: 1 },
  { name: 'C', input: 115520, cached: 103642, cacheWrite: 11860, output: 2078, pass: 1 },
];

// input 是全部送進去的 token，已經包含命中快取跟快取寫入的部分，
// 所以沒命中的 = input - cached - cacheWrite，各用各的單價算。
function cost(u) {
  const cacheWrite = u.cacheWrite || 0;
  return credits(MODEL, { input: u.input - u.cached - cacheWrite, cached: u.cached, cacheWrite, output: u.output });
}

function pct(n) {
  return (n >= 0 ? '+' : '') + n.toFixed(1) + '%';
}

const base = arms[0];
const baseCredits = cost(base);
const basePerPass = (baseCredits * RUNS) / base.pass;

console.log('模型：' + MODEL);
console.log('');
console.log('  版本    output  每次 credits  output 佔幾成  每個通過的 credits');
for (const a of arms) {
  const c = cost(a);
  const outShare = credits(MODEL, { output: a.output }) / c;
  const perPass = a.pass > 0 ? (c * RUNS) / a.pass : Infinity;
  console.log(
    '  ' + a.name.padEnd(4) +
    String(a.output).padStart(10) +
    c.toFixed(2).padStart(14) +
    ((outShare * 100).toFixed(0) + '%').padStart(14) +
    perPass.toFixed(2).padStart(20)
  );
}
console.log('');
console.log('  跟 A 比：');
for (const a of arms.slice(1)) {
  const c = cost(a);
  const perPass = a.pass > 0 ? (c * RUNS) / a.pass : Infinity;
  console.log(
    '  ' + a.name + '  output ' + pct((a.output / base.output - 1) * 100).padStart(7) +
    '    每次 credits ' + pct((c / baseCredits - 1) * 100).padStart(7) +
    '    每個通過的 ' + pct((perPass / basePerPass - 1) * 100).padStart(7)
  );
}
