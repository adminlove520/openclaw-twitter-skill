#!/usr/bin/env node

/**
 * OpenClaw Twitter Skill CLI (oct-post)
 *
 * Provides a CLI interface for the standardized 5-step Twitter posting workflow.
 * In standalone mode, this validates and previews the workflow.
 * When used by an OpenClaw agent, the SKILL.md drives the actual browser execution.
 *
 * Zero dependencies — uses only Node.js built-in modules.
 */

'use strict';

const fs = require('fs');
const path = require('path');

// ─── Helpers ───────────────────────────────────────────────

const NO_COLOR = process.env.NO_COLOR || !process.stdout.isTTY;

const C = NO_COLOR
  ? { reset: '', red: '', green: '', yellow: '', cyan: '', dim: '', bold: '' }
  : {
      reset: '\x1b[0m',
      red: '\x1b[31m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      cyan: '\x1b[36m',
      dim: '\x1b[2m',
      bold: '\x1b[1m',
    };

function log(icon, msg) { console.log(`${icon}  ${msg}`); }
function ok(msg)   { log(`${C.green}✔${C.reset}`, msg); }
function warn(msg) { log(`${C.yellow}⚠${C.reset}`, msg); }
function fail(msg) { log(`${C.red}✖${C.reset}`, msg); }
function info(msg) { log(`${C.cyan}ℹ${C.reset}`, msg); }
function step(n, msg) { console.log(`\n${C.cyan}[Step ${n}/5]${C.reset} ${msg}`); }

function getPkg() {
  return JSON.parse(fs.readFileSync(path.join(__dirname, 'package.json'), 'utf-8'));
}

// ─── Content Validation ────────────────────────────────────

/**
 * Validate tweet content against posting rules.
 * Returns { valid, errors[], warnings[], stats{} }
 */
function validateContent(text) {
  const errors = [];
  const warnings = [];

  if (!text || text.trim().length === 0) {
    errors.push('Content is empty.');
    return { valid: false, errors, warnings, stats: {} };
  }

  const trimmed = text.trim();
  const len = trimmed.length;

  // Hashtags: support ASCII and Unicode word chars (CJK, etc.)
  const hashtags = trimmed.match(/#[\w\u4e00-\u9fff\u3400-\u4dbf\uF900-\uFAFF]+/gu) || [];

  // Emojis: broad Unicode emoji detection
  const emojis = trimmed.match(
    /[\u{1F600}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2702}-\u{27B0}\u{FE00}-\u{FE0F}\u{200D}\u{20E3}]/gu
  ) || [];

  // Hard limit: Twitter's 280 chars
  if (len > 280) {
    errors.push(`Exceeds Twitter limit: ${len}/280 characters.`);
  } else if (len > 200) {
    warnings.push(`Content is ${len} chars. Recommended < 200 for readability.`);
  }

  // Hashtag guidance
  if (hashtags.length > 3) {
    warnings.push(`Too many hashtags (${hashtags.length}). Recommended 1–3.`);
  } else if (hashtags.length === 0) {
    warnings.push('No hashtags found. Consider adding 1–3 relevant tags.');
  }

  // Emoji guidance
  if (emojis.length > 5) {
    warnings.push(`Many emojis (${emojis.length}). Recommended 1–3.`);
  }

  // Check for potential reply patterns
  if (trimmed.startsWith('@')) {
    warnings.push('Content starts with @mention — this may create a reply instead of a new post.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    stats: { length: len, hashtags: hashtags.length, emojis: emojis.length },
  };
}

// Expose for testing
module.exports = { validateContent };

// ─── Commands ──────────────────────────────────────────────

function cmdPost(content, opts) {
  console.log(`\n${'─'.repeat(50)}`);
  console.log(`  🐦  OpenClaw Twitter Posting Workflow`);
  console.log(`${'─'.repeat(50)}`);

  const result = validateContent(content);

  if (!result.valid) {
    result.errors.forEach(e => fail(e));
    process.exit(1);
  }
  result.warnings.forEach(w => warn(w));

  info(`Content: ${result.stats.length} chars | ${result.stats.hashtags} hashtags | ${result.stats.emojis} emojis`);

  step(1, 'Navigate to https://x.com/compose/post');
  ok('Open compose page');

  step(2, 'Verify login status');
  ok('Check for compose text area');

  step(3, 'Type content');
  console.log(`${C.dim}   "${content}"${C.reset}`);
  ok('Content entered');

  step(4, 'Screenshot for confirmation');
  if (opts.skipConfirm) {
    warn('--skip-confirm: Skipping user confirmation (use with caution)');
  } else {
    ok('Screenshot taken → awaiting user confirmation');
  }

  step(5, 'Click Post & verify');
  ok('Click "Post" button → check success toast');

  console.log(`\n${'─'.repeat(50)}`);
  if (opts.dryRun) {
    warn('DRY RUN — No actual posting. Workflow validated successfully.');
  } else {
    ok('Workflow ready. Agent will execute via browser tools.');
  }
  console.log(`${'─'.repeat(50)}\n`);
}

function cmdValidate(content) {
  console.log('\n🔍 Validating tweet content...\n');
  const result = validateContent(content);

  if (result.valid) {
    ok('Content is valid');
  } else {
    result.errors.forEach(e => fail(e));
  }
  result.warnings.forEach(w => warn(w));

  console.log(`\n📊 Stats:`);
  console.log(`   Length:   ${result.stats.length}/280 (recommended < 200)`);
  console.log(`   Hashtags: ${result.stats.hashtags} (recommended 1–3)`);
  console.log(`   Emojis:   ${result.stats.emojis} (recommended 1–3)`);

  process.exit(result.valid ? 0 : 1);
}

function cmdInfo() {
  const pkg = getPkg();
  console.log(`\n🐦  ${C.bold}${pkg.name}${C.reset} v${pkg.version}`);
  console.log(`   ${pkg.description}\n`);
  console.log(`${C.bold}Workflow:${C.reset} 5-step standardized posting`);
  console.log('  1. Open  → https://x.com/compose/post');
  console.log('  2. Login → verify compose box visible');
  console.log('  3. Type  → enter content (< 200 chars)');
  console.log('  4. Shot  → screenshot for user confirmation');
  console.log('  5. Post  → click button & verify success\n');
  console.log(`${C.dim}Homepage: ${pkg.homepage}${C.reset}`);
}

// ─── CLI Parsing (zero-dependency) ─────────────────────────

function printHelp() {
  const pkg = getPkg();
  console.log(`
${C.bold}${pkg.name}${C.reset} v${pkg.version}

${C.bold}USAGE${C.reset}
  oct-post <command> [options]

${C.bold}COMMANDS${C.reset}
  post <content>       Simulate the 5-step posting workflow
  validate <content>   Validate tweet content against rules
  info                 Show skill info and workflow summary

${C.bold}OPTIONS${C.reset}
  --dry-run            Validate only, don't mark as ready to post
  --skip-confirm       Skip screenshot confirmation step
  -h, --help           Show this help message
  -v, --version        Show version number

${C.bold}EXAMPLES${C.reset}
  oct-post post "Hello from OpenClaw! 🚀 #AI #Automation"
  oct-post post "Draft tweet #draft" --dry-run
  oct-post validate "Testing content #test"
  oct-post info
`);
}

function main() {
  const args = process.argv.slice(2);

  if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
    printHelp();
    process.exit(0);
  }

  if (args[0] === '--version' || args[0] === '-v') {
    console.log(getPkg().version);
    process.exit(0);
  }

  const cmd = args[0];

  switch (cmd) {
    case 'post': {
      const content = args.find((a, i) => i > 0 && !a.startsWith('--'));
      if (!content) {
        fail('Missing content. Usage: oct-post post "your tweet"');
        process.exit(1);
      }
      cmdPost(content, {
        dryRun: args.includes('--dry-run'),
        skipConfirm: args.includes('--skip-confirm'),
      });
      break;
    }
    case 'validate': {
      const content = args.find((a, i) => i > 0 && !a.startsWith('--'));
      if (!content) {
        fail('Missing content. Usage: oct-post validate "your tweet"');
        process.exit(1);
      }
      cmdValidate(content);
      break;
    }
    case 'info':
      cmdInfo();
      break;
    default:
      fail(`Unknown command: ${cmd}`);
      printHelp();
      process.exit(1);
  }
}

// Only run CLI when executed directly (not when require'd for testing)
if (require.main === module) {
  main();
}
