// compact-breakeven.js
//
// 算 compact 要再跑幾輪才回本。
//
// compact 本身是一次模型呼叫：把整段對話送進去請模型寫摘要，
// 這筆要付 input 加 output。之後每一輪重送的歷史變短，才開始省。
// 這支算：摘要費要靠幾輪的差額才攤平？
// 這裡假設 compact 那一次送進去的對話全部照全價算，沒有命中快取。
// 如果有命中，摘要費會少很多，用實測的 credits 為準。
//
// 純算術，直接 node 執行。把 HISTORY_TOKENS 換成你 compact 前量到的對話大小。

const HISTORY_TOKENS = 30000;   // compact 前對話歷史的大小
const SUMMARY_TOKENS = 800;     // compact 後摘要的大小（自己量，這只是預設值）

// 以 GPT-6.1 Sol 計，每 1M token 美金。查證日期 2026-10-14。
const INPUT_PRICE = 2.00 / 1_000_000;
const OUTPUT_PRICE = 10.00 / 1_000_000;

// 連續對話的歷史通常走快取價（GPT-6.1 Sol 是 input 的 0.05 倍）。
// 想看快取沒命中的情況，把這個改成 1.0。
const CACHE_READ_MULT = 0.05;

const compactCost = HISTORY_TOKENS * INPUT_PRICE + SUMMARY_TOKENS * OUTPUT_PRICE;
const savedPerTurn = (HISTORY_TOKENS - SUMMARY_TOKENS) * INPUT_PRICE * CACHE_READ_MULT;
const turns = Math.ceil(compactCost / savedPerTurn);

function credits(usd) {
  return (usd * 100).toFixed(4) + ' credits';
}

console.log('對話歷史 ' + HISTORY_TOKENS + ' token，compact 後剩 ' + SUMMARY_TOKENS + ' token');
console.log('歷史走快取價 ' + CACHE_READ_MULT + 'x');
console.log('');
console.log('一次 compact 的摘要費：' + credits(compactCost));
console.log('compact 後每輪省下：  ' + credits(savedPerTurn));
console.log('');
console.log('要再跑約 ' + turns + ' 輪，才把摘要費賺回來');
