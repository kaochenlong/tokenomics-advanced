import { test } from 'node:test';
import assert from 'node:assert/strict';
import { credits } from '../scripts/credits.js';

test('GPT-6 Luna 送進去 12000、回出來 800 是 0.16 credits', () => {
  assert.equal(credits('gpt-6-luna', { input: 12000, output: 800 }).toFixed(3), '0.160');
});

test('GPT-6 Astra 同樣的量是 16 credits', () => {
  assert.equal(credits('gpt-6-astra', { input: 12000, output: 800 }).toFixed(3), '16.000');
});

test('命中快取的部分用快取價算', () => {
  assert.equal(credits('gpt-6.1-sol', { cached: 1_000_000 }).toFixed(3), '10.000');
});

test('定價表沒有的模型會丟出錯誤', () => {
  assert.throws(() => credits('gpt-0', { input: 1 }), /定價表沒有這個模型/);
});
