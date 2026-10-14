// credits.js
//
// 把 token 數換算成 GitHub AI credits。純算術，不用連線、不用登入。
//
// 定價是每 1M token 的美金，查證日期 2026-10-14，來源：
// https://docs.github.com/en/copilot/reference/copilot-billing/models-and-pricing
// 1 AI credit = $0.01 USD，所以 credits 就是美金乘以 100。
// 定價會變，過期請回官方頁面重查。

const PRICING = {
  'gpt-6-luna':  { input: 0.10,  cached: 0.01, cacheWrite: 0.125, output: 0.50 },
  'gpt-6.1-sol': { input: 2.00,  cached: 0.10, cacheWrite: 2.50,  output: 10.00 },
  'gpt-6-astra': { input: 10.00, cached: 1.00, cacheWrite: 12.50, output: 50.00 },
};

const PER_MILLION = 1_000_000;

// usage 的欄位都是 token 數，沒給的當 0。
function usd(model, usage) {
  const p = PRICING[model];
  if (!p) {
    throw new Error('定價表沒有這個模型：' + model);
  }
  return (
    ((usage.input || 0) / PER_MILLION) * p.input +
    ((usage.output || 0) / PER_MILLION) * p.output +
    ((usage.cached || 0) / PER_MILLION) * p.cached +
    ((usage.cacheWrite || 0) / PER_MILLION) * p.cacheWrite
  );
}

function credits(model, usage) {
  return usd(model, usage) * 100;
}

if (process.argv[1] && process.argv[1].endsWith('credits.js')) {
  const usage = { input: 12000, output: 800 };
  console.log('一次請求：input ' + usage.input + ' / output ' + usage.output + ' token');
  console.log('');
  for (const model of Object.keys(PRICING)) {
    console.log('  ' + model.padEnd(14) + credits(model, usage).toFixed(3).padStart(8) + ' credits');
  }
  console.log('');
  console.log('1 credit = $0.01 USD。定價查證日期 2026-10-14，過期請重查官方頁面。');
}

export { PRICING, usd, credits };
