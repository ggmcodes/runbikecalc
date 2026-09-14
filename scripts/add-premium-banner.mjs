#!/usr/bin/env node
/**
 * Add the RunBikeCalc Premium sticky banner to every content page.
 *
 * Idempotent: a page that already carries the banner is left untouched, so the
 * script can be re-run safely after new pages are added.
 *
 * Excluded pages are listed in EXCLUDED below, with the reason each one is out.
 */

import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

const ROOT = resolve(new URL('..', import.meta.url).pathname);

/** Pages that must never show the banner, with the reason. */
const EXCLUDED = new Map([
  ['premium-training-plans.html', 'the premium page itself'],
  ['premium-unlocked.html', 'post-purchase page'],
  ['success.html', 'checkout thank-you'],
  ['race-card-success.html', 'checkout thank-you'],
  ['offline.html', 'offline fallback'],
  ['setups/download.html', 'lead-magnet delivery/thank-you'],
  ['downloads/runbikecalc-setup-shopping-list.html', 'printable asset, no site chrome'],
  ['images/eaglenos-lactate-meter.html', 'bare image holder, no site chrome'],
  ['bike-finder-embed.html', 'embeddable widget served in an iframe'],
  ['running-training-plan-generator.html', 'meta-refresh redirect stub'],
  ['cycling-training-plan-generator.html', 'meta-refresh redirect stub'],
  ['triathlon-training-plan-generator.html', 'meta-refresh redirect stub'],
  ['hyrox-training-plan-generator.html', 'meta-refresh redirect stub'],
]);

const CSS_LINK = '<link rel="stylesheet" href="/css/sticky-banner.css">';

const BANNER_BLOCK = [
  "<script>window.BANNER_CONFIG={message:'Training plans with PDF, Excel and saved plans',highlight:'$12',detail:'One-time unlock, no subscription',ctaText:'See Premium',ctaUrl:'/premium-training-plans',bgColor:'#1A1A1A',textColor:'#FAF8F5',excludePaths:['/premium-training-plans','/premium-unlocked','/success','/race-card-success','/offline']};</script>",
  '<script src="/js/sticky-banner.js"></script>',
].join('\n');

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === '.git') continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry.endsWith('.html')) out.push(full);
  }
  return out;
}

const files = walk(ROOT).sort();
let added = 0;
let skippedExisting = 0;
const skippedExcluded = [];
const problems = [];

for (const file of files) {
  const rel = relative(ROOT, file);

  if (EXCLUDED.has(rel)) {
    skippedExcluded.push(rel);
    continue;
  }

  let html = readFileSync(file, 'utf8');

  // Idempotency guard: never touch a page that already has the banner.
  if (html.includes('/js/sticky-banner.js')) {
    skippedExisting += 1;
    continue;
  }

  if (!html.includes('</head>') || !html.includes('</body>')) {
    problems.push(`${rel}: missing </head> or </body>`);
    continue;
  }

  if (!html.includes(CSS_LINK)) {
    html = html.replace('</head>', `${CSS_LINK}\n</head>`);
  }

  const lastBody = html.lastIndexOf('</body>');
  html = html.slice(0, lastBody) + BANNER_BLOCK + '\n' + html.slice(lastBody);

  writeFileSync(file, html);
  added += 1;
}

console.log(`banner added:      ${added}`);
console.log(`already had it:    ${skippedExisting}`);
console.log(`excluded:          ${skippedExcluded.length}`);
for (const rel of skippedExcluded) {
  console.log(`  - ${rel} (${EXCLUDED.get(rel)})`);
}
if (problems.length) {
  console.log('problems:');
  for (const p of problems) console.log(`  ! ${p}`);
  process.exitCode = 1;
}
