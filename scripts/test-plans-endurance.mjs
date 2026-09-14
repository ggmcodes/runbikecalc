#!/usr/bin/env node
/**
 * Endurance training plan test harness (cycling + triathlon).
 *
 * The generators are browser globals, not modules, so this loads the real file
 * text into a `vm` context with a `window` stub - the same load order the page
 * uses - and then drives them through the EXACT code path premium-plans.js
 * uses in the browser (Object.create(prototype) + generatePlanFromInputs).
 *
 * Every distance x fitness level x training days x plan length combination is
 * generated and asserted against. Exits non-zero on any failure.
 *
 * Usage: node scripts/test-plans-endurance.mjs
 */

import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// ---------------------------------------------------------------------------
// Load the browser globals into a vm context
// ---------------------------------------------------------------------------

function loadGenerators() {
    const windowStub = {};
    const elementStub = () => ({
        className: '', textContent: '', title: '', style: {},
        classList: { add() {}, toggle() {}, remove() {} },
        appendChild() {}, setAttribute() {}, querySelectorAll: () => []
    });

    const sandbox = {
        console,
        window: windowStub,
        document: {
            getElementById: () => null,
            createElement: elementStub,
            querySelectorAll: () => [],
            addEventListener() {}
        },
        localStorage: { getItem: () => null, setItem() {}, removeItem() {} },
        setTimeout, clearTimeout
    };
    sandbox.globalThis = sandbox;
    const context = createContext(sandbox);

    // Minimal stand-ins for the two base globals the plan files inherit from.
    // Nothing constructs them here - premium-plans.js builds generators with
    // Object.create(prototype), so no constructor ever runs.
    runInContext(
        'class Calculator { constructor() {} init() {} saveValues() {} displayResult() {} }\n' +
        'class URLParamsHandler { getFromURL() { return null; } updateURL() {} }',
        context,
        { filename: 'stubs.js' }
    );

    for (const file of [
        'js/training-plan-base.js',
        'js/training-plan-cycling.js',
        'js/training-plan-triathlon.js'
    ]) {
        runInContext(readFileSync(join(ROOT, file), 'utf8'), context, { filename: file });
    }

    return windowStub;
}

/**
 * Mirror of premium-plans.js createTempGenerator + generatePlanFromInputs.
 * Kept byte-faithful in behaviour so a green test means the page works.
 */
function generatePlanFromInputs(GeneratorClass, sport, inputs) {
    const generator = Object.create(GeneratorClass.prototype);
    generator.sport = sport;
    generator.plan = null;

    generator.validateInputs(inputs);
    inputs.totalWeeks = inputs.weeksUntilRace || inputs.weeks || 12;

    const distanceConfigs = generator.getDistanceConfigs();
    const distanceKey = inputs.goalDistance || inputs.distance || Object.keys(distanceConfigs)[0];
    const distanceConfig = distanceConfigs[distanceKey];
    if (!distanceConfig) throw new Error('Invalid distance selected');

    const phases = generator.calculatePhases(inputs, distanceConfig);
    const weeks = generator.generateAllWeeks(inputs, phases, distanceConfig);

    return {
        inputs,
        phases,
        weeks,
        distanceConfig,
        summary: generator.generateSummary(inputs, phases, weeks)
    };
}

// ---------------------------------------------------------------------------
// Assertions
// ---------------------------------------------------------------------------

const failures = [];

function check(label, condition, detail) {
    if (!condition) failures.push(label + (detail ? ' -> ' + detail : ''));
    return !!condition;
}

/** Walk the live object looking for the values that produce broken UI copy. */
function findBadValues(node, path, out, seen) {
    if (out.length > 6) return out;
    if (node === null) { out.push(path + ' = null'); return out; }
    if (node === undefined) { out.push(path + ' = undefined'); return out; }

    const t = typeof node;
    if (t === 'number') {
        if (!Number.isFinite(node)) out.push(path + ' = ' + node);
        return out;
    }
    if (t === 'string') {
        if (node.includes('[object Object]')) out.push(path + ' contains [object Object]');
        if (node === 'undefined' || node === 'NaN' || node === 'null') out.push(path + ' = "' + node + '"');
        return out;
    }
    if (t !== 'object') return out;

    if (seen.has(node)) return out;
    seen.add(node);

    if (Array.isArray(node)) {
        node.forEach((v, i) => findBadValues(v, path + '[' + i + ']', out, seen));
        return out;
    }
    for (const key of Object.keys(node)) {
        findBadValues(node[key], path + '.' + key, out, seen);
    }
    return out;
}

function assertPlan(ctx, plan) {
    const { sport, distance, level, days, weeks: requestedWeeks, hours } = ctx;
    const tag = `${sport}/${distance}/${level}/${days}d/${requestedWeeks}w`;

    if (!check(tag + ': plan returned', plan && typeof plan === 'object')) return;

    const summary = plan.summary || {};
    const phases = plan.phases || [];
    const weeks = plan.weeks || [];

    // --- structure ---------------------------------------------------------
    check(tag + ': totalWeeks matches request',
        summary.totalWeeks === requestedWeeks,
        'got ' + summary.totalWeeks + ' want ' + requestedWeeks);
    check(tag + ': weeks array length', weeks.length === requestedWeeks,
        'got ' + weeks.length);

    // --- phases cover every week, no gaps or overlaps -----------------------
    let cursor = 1;
    let phasesOk = true;
    for (const phase of phases) {
        if (phase.startWeek !== cursor) {
            phasesOk = false;
            check(tag + ': phase ' + phase.name + ' starts at ' + cursor, false,
                'startWeek=' + phase.startWeek);
        }
        if (!(phase.duration >= 1)) {
            phasesOk = false;
            check(tag + ': phase ' + phase.name + ' duration >= 1', false, String(phase.duration));
        }
        cursor += phase.duration;
    }
    if (phasesOk) {
        check(tag + ': phases cover all weeks', cursor - 1 === requestedWeeks,
            'covered ' + (cursor - 1) + ' of ' + requestedWeeks);
    }
    check(tag + ': four phases present', phases.length === 4, 'got ' + phases.length);

    const phaseOfWeek = {};
    phases.forEach(p => {
        for (let w = p.startWeek; w <= p.startWeek + p.duration - 1; w++) phaseOfWeek[w] = p.name;
    });

    // --- per-week checks ---------------------------------------------------
    const cadence = summary.recoveryCadence;
    check(tag + ': recovery cadence exposed', cadence === 3 || cadence === 4, String(cadence));

    let peakSeen = 0;
    let maxNonTaper = 0;
    let minTaper = Infinity;
    let taperMax = 0;

    for (const week of weeks) {
        const wtag = tag + ' wk' + week.weekNumber;

        check(wtag + ': 7 days', Array.isArray(week.days) && week.days.length === 7,
            'got ' + (week.days ? week.days.length : 'none'));
        if (!Array.isArray(week.days)) continue;

        const training = week.days.filter(d => d.workout && d.workout.type !== 'REST');
        check(wtag + ': training days match request', training.length === days,
            'got ' + training.length + ' want ' + days);

        for (const day of week.days) {
            const w = day.workout;
            if (!check(wtag + ' ' + day.dayShort + ': workout present', !!w)) continue;
            check(wtag + ' ' + day.dayShort + ': workout has a name',
                typeof w.name === 'string' && w.name.length > 0, JSON.stringify(w.name));
            check(wtag + ' ' + day.dayShort + ': workout has a duration',
                typeof w.duration === 'string' && w.duration.length > 0, JSON.stringify(w.duration));
            if (w.type !== 'REST') {
                check(wtag + ' ' + day.dayShort + ': positive minutes',
                    Number.isFinite(w.minutes) && w.minutes > 0, String(w.minutes));
                check(wtag + ' ' + day.dayShort + ': has a zone',
                    typeof w.zone === 'string' && w.zone.length > 0, JSON.stringify(w.zone));
                check(wtag + ' ' + day.dayShort + ': has a purpose',
                    typeof w.purpose === 'string' && w.purpose.length > 0, JSON.stringify(w.purpose));
            }
        }

        // volume honours the rider's stated hours budget
        check(wtag + ': targetVolume positive',
            Number.isFinite(week.targetVolume) && week.targetVolume > 0, String(week.targetVolume));
        const drift = Math.abs((week.totalHours || 0) - week.targetVolume);
        check(wtag + ': scheduled hours within 15% of target',
            drift <= Math.max(0.3, week.targetVolume * 0.15),
            'scheduled ' + week.totalHours + ' vs target ' + week.targetVolume);

        // recovery weeks land on the expected cadence, never inside the taper
        const phaseName = phaseOfWeek[week.weekNumber];
        const expectRecovery = phaseName !== 'Taper' && week.weekNumber % cadence === 0;
        check(wtag + ': recovery cadence ' + cadence + ':1',
            !!week.isRecovery === expectRecovery,
            'isRecovery=' + week.isRecovery + ' expected=' + expectRecovery);

        check(wtag + ': week phase matches phase table', week.phase === phaseName,
            week.phase + ' vs ' + phaseName);

        if (phaseName === 'Taper') {
            taperMax = Math.max(taperMax, week.targetVolume);
            minTaper = Math.min(minTaper, week.targetVolume);
        } else {
            maxNonTaper = Math.max(maxNonTaper, week.targetVolume);
        }
        peakSeen = Math.max(peakSeen, week.targetVolume);
    }

    // --- summary -----------------------------------------------------------
    check(tag + ': peakVolume positive',
        Number.isFinite(summary.peakVolume) && summary.peakVolume > 0, String(summary.peakVolume));
    check(tag + ': peakVolume <= 1.5x requested hours',
        summary.peakVolume <= hours * 1.5 + 0.01,
        'peak ' + summary.peakVolume + ' vs budget ' + hours);
    check(tag + ': peakVolume equals max week', Math.abs(summary.peakVolume - peakSeen) < 0.05,
        summary.peakVolume + ' vs ' + peakSeen);

    const recoveryCount = weeks.filter(w => w.isRecovery).length;
    check(tag + ': summary recoveryWeeks matches weeks',
        summary.recoveryWeeks === recoveryCount,
        summary.recoveryWeeks + ' vs ' + recoveryCount);

    check(tag + ': volume reported in hours', summary.units === 'hours', String(summary.units));

    // --- taper actually reduces volume before the event --------------------
    check(tag + ': taper below peak', taperMax < maxNonTaper,
        'taper max ' + taperMax + ' vs pre-taper max ' + maxNonTaper);
    const finalWeek = weeks[weeks.length - 1];
    check(tag + ': final week is the lightest',
        finalWeek.targetVolume <= minTaper + 0.001,
        'final ' + finalWeek.targetVolume + ' vs taper min ' + minTaper);

    // --- no broken values anywhere in the serialized plan ------------------
    const bad = findBadValues(plan, 'plan', [], new WeakSet());
    check(tag + ': no NaN/undefined/null/[object Object]', bad.length === 0, bad.join('; '));

    let serialized = '';
    try {
        serialized = JSON.stringify(plan);
    } catch (err) {
        check(tag + ': plan serializes', false, err.message);
    }
    if (serialized) {
        check(tag + ': serialized plan is clean',
            !serialized.includes('[object Object]') &&
            !serialized.includes('"NaN"') &&
            !serialized.includes('undefined'),
            'serialized output contains a broken token');
    }

    // --- sport separation: these sports never speak in miles ---------------
    const volumeWords = /\b(miles?|mileage)\b/i;
    const offenders = [];
    weeks.forEach(w => w.days.forEach(d => {
        const w2 = d.workout;
        if (w2 && (volumeWords.test(w2.duration) || volumeWords.test(String(w2.name)))) {
            offenders.push(w2.name + '/' + w2.duration);
        }
    }));
    check(tag + ': no mileage language in workouts', offenders.length === 0, offenders.slice(0, 3).join(', '));
}

// ---------------------------------------------------------------------------
// Sport-specific structural checks (the two plans must differ meaningfully)
// ---------------------------------------------------------------------------

function assertCyclingShape(ctx, plan) {
    const tag = `cycling/${ctx.distance}/${ctx.level}/${ctx.days}d/${ctx.weeks}w`;
    const sports = new Set();
    const names = new Set();
    plan.weeks.forEach(w => w.days.forEach(d => {
        if (d.workout && d.workout.type !== 'REST') {
            sports.add(d.workout.sport);
            names.add(d.workout.name);
        }
    }));
    check(tag + ': every session is a bike session',
        [...sports].every(s => s === 'bike'), [...sports].join(','));
    check(tag + ': a long ride appears every week',
        plan.weeks.every(w => w.days.some(d => d.workout && d.workout.name === 'Long Ride')),
        'missing long ride');
    check(tag + ': ride types vary across the plan', names.size >= 3, [...names].join(', '));
    check(tag + ': FTP-anchored zones present',
        plan.weeks.some(w => w.days.some(d => d.workout && /FTP/.test(d.workout.zone || ''))),
        'no FTP zone found');
}

function assertTriathlonShape(ctx, plan) {
    const tag = `triathlon/${ctx.distance}/${ctx.level}/${ctx.days}d/${ctx.weeks}w`;
    const sports = new Set();
    plan.weeks.forEach(w => w.days.forEach(d => {
        if (d.workout && d.workout.type !== 'REST') sports.add(d.workout.sport);
    }));
    check(tag + ': swim, bike and run all appear',
        sports.has('swim') && sports.has('bike') && sports.has('run'),
        [...sports].join(','));

    // Bricks are the sport-defining session; they must show up once the build
    // phase starts (with 3 training days the long ride itself becomes a brick).
    check(tag + ': bricks scheduled', (plan.summary.brickSessions || 0) > 0,
        'brickSessions=' + plan.summary.brickSessions);

    check(tag + ': every week includes a swim',
        plan.weeks.every(w => w.days.some(d => d.workout && d.workout.sport === 'swim')),
        'a week has no swim');
    check(tag + ': swims carry a distance',
        plan.weeks.every(w => w.days.every(d =>
            !d.workout || d.workout.sport !== 'swim' || (d.workout.distance || '').length > 0)),
        'swim without distance');
    check(tag + ': bike carries the largest share of hours',
        plan.summary.sportSplit.bike >= plan.summary.sportSplit.run &&
        plan.summary.sportSplit.bike >= plan.summary.sportSplit.swim,
        JSON.stringify(plan.summary.sportSplit));
}

// ---------------------------------------------------------------------------
// Run every combination
// ---------------------------------------------------------------------------

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const TRAINING_DAYS = [3, 4, 5, 6];

function weekValues(config) {
    const mid = Math.round((config.minWeeks + config.maxWeeks) / 2);
    return [...new Set([config.minWeeks, mid, config.maxWeeks])];
}

function main() {
    const win = loadGenerators();

    const sports = [
        {
            sport: 'cycling',
            Generator: win.CyclingPlanGenerator,
            configs: win.CyclingDistanceConfigs,
            // only the canonical form values, not the legacy aliases
            keys: ['25mi', '50mi', '62mi', '75mi', '100mi', 'granfondo', 'multiday'],
            levelField: 'fitnessLevel',
            shape: assertCyclingShape
        },
        {
            sport: 'triathlon',
            Generator: win.TriathlonPlanGenerator,
            configs: win.TriathlonDistanceConfigs,
            keys: ['sprint', 'olympic', '70.3', 'ironman'],
            levelField: 'experienceLevel',
            shape: assertTriathlonShape
        }
    ];

    const rows = [];
    let total = 0;

    for (const spec of sports) {
        if (!spec.Generator) {
            failures.push(spec.sport + ': generator class did not load onto window');
            continue;
        }

        for (const distance of spec.keys) {
            const config = spec.configs[distance];
            if (!config) { failures.push(spec.sport + '/' + distance + ': missing config'); continue; }

            let combos = 0;
            const before = failures.length;

            for (const level of LEVELS) {
                for (const days of TRAINING_DAYS) {
                    for (const weeks of weekValues(config)) {
                        const hours = config.weeklyVolumeTargets[level];
                        const ctx = { sport: spec.sport, distance, level, days, weeks, hours };

                        const inputs = {
                            sport: spec.sport,
                            distance,
                            goalDistance: distance,
                            weeks,
                            weeksUntilRace: weeks,
                            weeklyHours: hours,
                            currentVolume: hours,
                            trainingDays: days,
                            longRideDay: 'saturday',
                            swimPreference: 'pool',
                            eventDate: '',
                            raceDate: ''
                        };
                        inputs[spec.levelField] = level;

                        combos++;
                        total++;

                        let plan = null;
                        try {
                            plan = generatePlanFromInputs(spec.Generator, spec.sport, inputs);
                        } catch (err) {
                            failures.push(
                                `${spec.sport}/${distance}/${level}/${days}d/${weeks}w: threw ${err.message}`
                            );
                            continue;
                        }

                        assertPlan(ctx, plan);
                        if (plan) spec.shape(ctx, plan);
                    }
                }
            }

            rows.push({
                sport: spec.sport,
                distance,
                combos,
                failed: failures.length - before
            });
        }
    }

    // --- summary table -----------------------------------------------------
    const pad = (s, n) => String(s).padEnd(n);
    console.log('');
    console.log('  ' + pad('SPORT', 11) + pad('EVENT', 12) + pad('COMBOS', 9) + pad('RESULT', 10));
    console.log('  ' + '-'.repeat(42));
    for (const r of rows) {
        console.log('  ' + pad(r.sport, 11) + pad(r.distance, 12) + pad(r.combos, 9) +
            (r.failed === 0 ? 'PASS' : 'FAIL (' + r.failed + ')'));
    }
    console.log('  ' + '-'.repeat(42));
    console.log('  ' + pad('TOTAL', 23) + pad(total, 9) +
        (failures.length === 0 ? 'PASS' : 'FAIL'));
    console.log('');

    if (failures.length) {
        console.error('  ' + failures.length + ' assertion failure(s):');
        const shown = failures.slice(0, 40);
        shown.forEach(f => console.error('   - ' + f));
        if (failures.length > shown.length) {
            console.error('   ... and ' + (failures.length - shown.length) + ' more');
        }
        console.error('');
        process.exit(1);
    }

    console.log('  All ' + total + ' plan combinations passed.');
    console.log('');
}

main();
