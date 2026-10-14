// ab-report.js
//
// 把一個省錢的做法做成 A/B 報告：每次花多少、每做對一次花多少、差距是不是雜訊。
//
// 下面的數字是我用 Copilot CLI 跑 prompts/task.txt 量到的，各跑三次。
// VS Code 的系統說明跟工具不一樣，數字會不同，做練習時換成你自己量到的。
//
// 用法：node scripts/ab-report.js

// credits：每次做完從 context window 控制項抄下來的累計 credits
// pass：那一次 npm test 有沒有過
const A = { label: '全部 GPT-6.1 Sol', credits: [5.97, 6.14, 6.35], pass: [true, true, true] };
const B = { label: 'Sol 規劃、Luna 實作', credits: [3.64, 3.77, 3.94], pass: [true, true, true] };

function mean(xs) {
  return xs.reduce((s, x) => s + x, 0) / xs.length;
}

function summarize(arm) {
  const avg = mean(arm.credits);
  const spread = Math.max(...arm.credits) - Math.min(...arm.credits);
  const passed = arm.pass.filter(Boolean).length;
  const perPass = passed > 0 ? arm.credits.reduce((s, x) => s + x, 0) / passed : Infinity;
  return { avg, spread, passed, perPass };
}

function pct(n) {
  return (n >= 0 ? '+' : '') + n.toFixed(1) + '%';
}

const a = summarize(A);
const b = summarize(B);
const runs = A.credits.length;

console.log('A：' + A.label);
console.log('B：' + B.label);
console.log('');
console.log('                      A                   B');
console.log('  每次 credits        ' + A.credits.map((x) => x.toFixed(2)).join(' ').padEnd(20) + B.credits.map((x) => x.toFixed(2)).join(' '));
console.log('  平均                ' + a.avg.toFixed(2).padEnd(20) + b.avg.toFixed(2));
console.log('  最高減最低          ' + a.spread.toFixed(2).padEnd(20) + b.spread.toFixed(2));
console.log('  ' + runs + ' 次通過幾次        ' + String(a.passed).padEnd(20) + b.passed);
console.log('  每個通過的 credits  ' + a.perPass.toFixed(2).padEnd(20) + b.perPass.toFixed(2));
console.log('');
console.log('  B 比 A 每次省下        ' + pct((1 - b.avg / a.avg) * 100));
console.log('  B 比 A 每個通過的省下  ' + pct((1 - b.perPass / a.perPass) * 100));
console.log('');
const gap = Math.abs(a.avg - b.avg);
const noise = Math.max(a.spread, b.spread);
console.log('  A、B 平均差 ' + gap.toFixed(2) + '，組內最大的起伏 ' + noise.toFixed(2) + '：' +
  (gap > noise ? '差距比起伏大，不太像是雜訊' : '差距沒有比起伏大，可能只是雜訊，多跑幾次再說'));
