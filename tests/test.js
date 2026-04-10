#!/usr/bin/env node

/**
 * Basic test suite for openclaw-twitter-skill
 * Zero dependencies — uses Node.js assert.
 */

'use strict';

const assert = require('assert');
const { validateContent } = require('../index');

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✔ ${name}`);
  } catch (e) {
    failed++;
    console.log(`  ✖ ${name}`);
    console.log(`    ${e.message}`);
  }
}

console.log('\n🧪 Running tests...\n');

// ─── Empty / null ──────────────────────────────────────────

test('empty string is invalid', () => {
  const r = validateContent('');
  assert.strictEqual(r.valid, false);
  assert.ok(r.errors.length > 0);
});

test('null is invalid', () => {
  const r = validateContent(null);
  assert.strictEqual(r.valid, false);
});

test('whitespace-only is invalid', () => {
  const r = validateContent('   ');
  assert.strictEqual(r.valid, false);
});

// ─── Valid content ─────────────────────────────────────────

test('short tweet with hashtag is valid', () => {
  const r = validateContent('Hello world! #test');
  assert.strictEqual(r.valid, true);
  assert.strictEqual(r.stats.hashtags, 1);
});

test('tweet under 200 chars has no warnings about length', () => {
  const r = validateContent('Short tweet #ok');
  assert.strictEqual(r.valid, true);
  const lengthWarnings = r.warnings.filter(w => w.includes('chars'));
  assert.strictEqual(lengthWarnings.length, 0);
});

// ─── Length limits ─────────────────────────────────────────

test('tweet over 280 chars is invalid', () => {
  const content = 'A'.repeat(281) + ' #test';
  const r = validateContent(content);
  assert.strictEqual(r.valid, false);
  assert.ok(r.errors[0].includes('280'));
});

test('tweet 201-280 chars is valid but warns', () => {
  const content = 'B'.repeat(201) + ' #test';
  const r = validateContent(content);
  assert.strictEqual(r.valid, true);
  assert.ok(r.warnings.some(w => w.includes('chars')));
});

test('tweet exactly 200 chars has no length warning', () => {
  const content = 'C'.repeat(193) + ' #test';  // 193 + 1 + 5 = 199
  const r = validateContent(content);
  assert.strictEqual(r.valid, true);
  const lengthWarnings = r.warnings.filter(w => w.includes('Recommended < 200'));
  assert.strictEqual(lengthWarnings.length, 0);
});

// ─── Hashtags ──────────────────────────────────────────────

test('no hashtag triggers warning', () => {
  const r = validateContent('No tags here');
  assert.strictEqual(r.valid, true);
  assert.ok(r.warnings.some(w => w.includes('hashtag')));
});

test('3 hashtags is fine', () => {
  const r = validateContent('Hello #a #b #c');
  assert.strictEqual(r.stats.hashtags, 3);
  assert.ok(!r.warnings.some(w => w.includes('Too many')));
});

test('4+ hashtags triggers warning', () => {
  const r = validateContent('Hello #a #b #c #d');
  assert.strictEqual(r.stats.hashtags, 4);
  assert.ok(r.warnings.some(w => w.includes('Too many')));
});

test('Chinese hashtags are counted', () => {
  const r = validateContent('测试 #人工智能 #开源');
  assert.strictEqual(r.stats.hashtags, 2);
});

// ─── Emojis ────────────────────────────────────────────────

test('emojis are counted', () => {
  const r = validateContent('Hello 🚀🌟 #test');
  assert.ok(r.stats.emojis >= 2);
});

test('6+ emojis triggers warning', () => {
  const r = validateContent('Hello 🚀🌟😀🎉💡🔥 #test');
  assert.ok(r.stats.emojis >= 6);
  assert.ok(r.warnings.some(w => w.includes('emojis')));
});

// ─── Edge cases ────────────────────────────────────────────

test('@mention at start triggers reply warning', () => {
  const r = validateContent('@someone hello #test');
  assert.strictEqual(r.valid, true);
  assert.ok(r.warnings.some(w => w.includes('@mention')));
});

test('unicode content is valid', () => {
  const r = validateContent('こんにちは世界 🌍 #hello');
  assert.strictEqual(r.valid, true);
});

// ─── Summary ───────────────────────────────────────────────

console.log(`\n${'─'.repeat(40)}`);
console.log(`  Results: ${passed} passed, ${failed} failed`);
console.log(`${'─'.repeat(40)}\n`);

process.exit(failed > 0 ? 1 : 0);
