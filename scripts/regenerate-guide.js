#!/usr/bin/env node
/**
 * Batch driver: regenerate a gear guide page from its config.
 *
 * Usage:
 *   node scripts/regenerate-guide.js --slug best-running-watches-2026
 *   node scripts/regenerate-guide.js --all
 *   node scripts/regenerate-guide.js --dry-run --slug best-running-watches-2026
 *
 * Config files live at scripts/guide-configs/<slug>.js and export a guide config
 * plus a `catalogFilter` spec. The driver loads the catalog, resolves each
 * pick's keyword to a real catalog product, then calls renderGuide().
 */

const fs = require('fs');
const path = require('path');
const { loadCatalog, dedupeByParent } = require('./backcountry-lib');
const { renderGuide } = require('./render-guide');

const CONFIG_DIR = path.join(__dirname, 'guide-configs');
const BLOG_DIR = path.join(__dirname, '..', 'blog');

/**
 * Find a catalog product whose parent name contains all the + -separated tokens.
 * E.g., findProduct(catalog, 'forerunner+265') matches 'Forerunner 265 Music Watch'.
 * Returns null if not found (non-fatal — caller decides fallback).
 */
function findProduct(catalog, keyword) {
    if (!keyword) return null;
    const dedup = dedupeByParent(catalog.products);
    const tokens = keyword.toLowerCase().split('+').map(t => t.trim()).filter(Boolean);
    return dedup.find(p => {
        const name = (p.parentName || p.name || '').toLowerCase();
        return tokens.every(t => name.includes(t));
    }) || null;
}

function loadGuideConfig(slug) {
    const configPath = path.join(CONFIG_DIR, `${slug}.js`);
    if (!fs.existsSync(configPath)) {
        throw new Error(`No config for slug "${slug}" at ${configPath}`);
    }
    // Clear require cache for repeat runs
    delete require.cache[require.resolve(configPath)];
    return require(configPath);
}

function resolveCards(rawCards, catalog) {
    // Each rawCard has either:
    //   (a) { keyword: 'forerunner+265', ...cardOpts }  → resolve to catalog product
    //   (b) { amazonOnly: true, title, imageUrl, price, ... }  → pass through directly
    const resolved = [];
    const missing = [];
    for (const c of rawCards) {
        if (c.amazonOnly) {
            resolved.push({ ...c });
            continue;
        }
        if (!c.keyword) {
            throw new Error(`Card missing 'keyword' or 'amazonOnly' flag: ${JSON.stringify(c).slice(0, 200)}`);
        }
        const product = findProduct(catalog, c.keyword);
        if (!product) {
            missing.push(c.keyword);
            // Graceful fallback: render as Amazon-only if imageUrl is provided; otherwise skip
            if (c.fallbackImageUrl) {
                resolved.push({
                    ...c,
                    amazonOnly: true,
                    imageUrl: c.fallbackImageUrl,
                    amazonSearchTerm: c.amazonSearchTerm || c.title
                });
            } else {
                console.warn(`  ⚠️  No catalog product for "${c.keyword}" — skipping card`);
            }
            continue;
        }
        resolved.push({ ...c, product });
    }
    return { cards: resolved, missing };
}

function regenerate(slug, { dryRun = false } = {}) {
    const config = loadGuideConfig(slug);
    console.log(`\n→ ${slug}`);

    const catalog = loadCatalog(config.catalogFilter || {});
    const { cards: resolvedCards, missing } = resolveCards(config.picks || [], catalog);

    if (missing.length) {
        console.warn(`  ⚠️  ${missing.length} products not found in catalog: ${missing.join(', ')}`);
    }
    console.log(`  ✓ Resolved ${resolvedCards.length} cards (${resolvedCards.filter(c => !c.amazonOnly).length} BC, ${resolvedCards.filter(c => c.amazonOnly).length} Amazon-only)`);

    const finalConfig = { ...config, cards: resolvedCards };
    delete finalConfig.picks;
    delete finalConfig.catalogFilter;

    const html = renderGuide(finalConfig);
    const outPath = path.join(BLOG_DIR, `${slug}.html`);

    if (dryRun) {
        console.log(`  [DRY-RUN] Would write ${html.split('\n').length} lines to ${outPath}`);
        return { slug, lines: html.split('\n').length, cards: resolvedCards.length };
    }

    fs.writeFileSync(outPath, html, 'utf8');
    console.log(`  ✓ Wrote ${outPath} (${html.split('\n').length} lines)`);
    return { slug, lines: html.split('\n').length, cards: resolvedCards.length };
}

function listConfigs() {
    if (!fs.existsSync(CONFIG_DIR)) return [];
    return fs.readdirSync(CONFIG_DIR)
        .filter(f => f.endsWith('.js'))
        .map(f => f.replace(/\.js$/, ''))
        .sort();
}

function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const all = args.includes('--all');
    const slugIdx = args.indexOf('--slug');
    const slug = slugIdx >= 0 ? args[slugIdx + 1] : null;

    if (!slug && !all) {
        console.error('Usage:');
        console.error('  node scripts/regenerate-guide.js --slug <slug>');
        console.error('  node scripts/regenerate-guide.js --all');
        console.error('  (append --dry-run to preview without writing)');
        console.error('');
        console.error('Available configs:');
        listConfigs().forEach(s => console.error('  - ' + s));
        process.exit(1);
    }

    const targets = all ? listConfigs() : [slug];
    if (targets.length === 0) {
        console.error('No configs found in scripts/guide-configs/');
        process.exit(1);
    }

    const results = [];
    for (const t of targets) {
        try {
            results.push(regenerate(t, { dryRun }));
        } catch (err) {
            console.error(`  ✗ Failed: ${err.message}`);
            if (process.env.DEBUG) console.error(err.stack);
        }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`Generated ${results.length}/${targets.length} pages`);
    if (dryRun) console.log('*** DRY-RUN — no files written ***');
}

if (require.main === module) main();

module.exports = { regenerate, loadGuideConfig, findProduct, resolveCards };
