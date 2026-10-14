// cache-breakeven.js
//
// 算快取要命中幾次才回本。
//
// 這門課用的三個模型，快取寫入都是 input 的 1.25 倍；
// 命中價 GPT-6 Luna 跟 GPT-6 Astra 是 input 的 0.1 倍，GPT-6.1 Sol 是 0.05 倍。
// 來源：https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing
//
// 純算術，直接 node 執行。

const CACHED_TOKENS = 10000;            // 被快取的那段前綴多大
const INPUT_PRICE = 2.00 / 1_000_000;   // 以 GPT-6.1 Sol 的 input 單價計

const WRITE_MULT = 1.25;  // 寫入倍數
const READ_MULT = 0.05;   // 命中倍數（GPT-6.1 Sol）

function noCache(n) {
  return n * CACHED_TOKENS * INPUT_PRICE;
}

function withCache(n) {
  if (n <= 0) return 0;
  return CACHED_TOKENS * INPUT_PRICE * (WRITE_MULT + (n - 1) * READ_MULT);
}

function breakeven() {
  for (let n = 1; n <= 100; n++) {
    if (withCache(n) < noCache(n)) return n;
  }
  return null;
}

function credits(usd) {
  return (usd * 100).toFixed(4) + ' credits';
}

console.log('快取內容：' + CACHED_TOKENS + ' token，單價以 GPT-6.1 Sol 的 input 計');
console.log('');
console.log('用到第幾次   不快取            有快取');
for (let n = 1; n <= 4; n++) {
  console.log('  ' + String(n).padEnd(11) + credits(noCache(n)).padEnd(18) + credits(withCache(n)));
}
console.log('');
console.log('回本次數（快取總成本首次低於不快取）：第 ' + breakeven() + ' 次');
