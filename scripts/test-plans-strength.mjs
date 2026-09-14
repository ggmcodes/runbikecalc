#!/usr/bin/env node
/**
 * test-plans-strength.mjs
 *
 * Exhaustive structural test for the running and Hyrox training plan
 * generators. Plain node, no dependencies.
 *
 * The generators are browser globals, so the file text is read and evaluated in
 * a `vm` context with a `window` stub and a stand-in for the Calculator base
 * class. All three files run inside one script so the `class X extends Y`
 * declarations can see each other.
 *
 * The inputs are assembled exactly the way js/premium-plans.js assembles them
 * from the form, including its quirks (it maps `distance` to `goalDistance` and
 * never looks at `division`), and the plan is generated through the same call
 * sequence, so a pass here means the real page path works.
 *
 * Run: node scripts/test-plans-strength.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const readJs = (name) => fs.readFileSync(path.join(ROOT, 'js', name), 'utf8');

// ---------------------------------------------------------------------------
// Load the generators
// ---------------------------------------------------------------------------

const PRELUDE = `
class Calculator {
    constructor() { this.form = null; this.resultContainer = null; }
    saveValues() {}
    displayResult() {}
    displayError() {}
}
class URLParamsHandler {
    getFromURL() { return null; }
    updateURL() {}
}
`;

const sandbox = { console };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
const context = vm.createContext(sandbox);

vm.runInContext(
    PRELUDE +
    readJs('training-plan-base.js') + '\n' +
    readJs('training-plan-running.js') + '\n' +
    readJs('training-plan-hyrox.js'),
    context,
    { filename: 'training-plans-bundle.js' }
);

const {
    RunningPlanGenerator,
    RunningDistanceConfigs,
    HyroxPlanGenerator,
    HyroxDistanceConfigs,
    HyroxStations
} = sandbox.window;

if (!RunningPlanGenerator || !HyroxPlanGenerator) {
    console.error('FATAL: generators did not load from the js/ files.');
    process.exit(1);
}

// ---------------------------------------------------------------------------
// Plan generation, mirroring js/premium-plans.js createTempGenerator()
// ---------------------------------------------------------------------------

function generatePlan(GeneratorClass, sport, inputs) {
    const generator = Object.create(GeneratorClass.prototype);
    generator.sport = sport;
    generator.plan = null;

    generator.validateInputs(inputs);
    inputs.totalWeeks = inputs.weeksUntilRace || inputs.weeks || 12;

    const distanceConfigs = generator.getDistanceConfigs();
    const distanceKey = inputs.goalDistance || inputs.distance || Object.keys(distanceConfigs)[0];
    const distanceConfig = distanceConfigs[distanceKey];
    if (!distanceConfig) throw new Error('Invalid distance selected: ' + distanceKey);

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

// The premium form posts these field names. Reproduced exactly, including the
// fact that the Hyrox form has no `distance` field at all.
function buildRunningInputs(key, level, days, weeks, config) {
    const inputs = {
        sport: 'running',
        distance: key,
        weeks,
        fitnessLevel: level,
        weeklyMileage: config.weeklyVolumeTargets[level],
        trainingDays: days,
        longRunDay: 'saturday'
    };
    inputs.goalDistance = inputs.distance;
    inputs.weeksUntilRace = inputs.weeks;
    inputs.currentVolume = inputs.weeklyMileage || inputs.weeklyHours || 20;
    return inputs;
}

function buildHyroxInputs(key, level, days, weeks, config) {
    const inputs = {
        sport: 'hyrox',
        division: key,
        weeks,
        experienceLevel: level,
        weeklyHours: config.weeklyVolumeTargets[level],
        trainingDays: days,
        longWorkoutDay: 'saturday'
    };
    inputs.goalDistance = inputs.distance; // undefined, exactly as premium-plans.js leaves it
    inputs.weeksUntilRace = inputs.weeks;
    inputs.currentVolume = inputs.weeklyMileage || inputs.weeklyHours || 20;
    return inputs;
}

// ---------------------------------------------------------------------------
// Assertions
// ---------------------------------------------------------------------------

function scanBadValues(node, where, out) {
    if (out.length >= 4) return;
    if (node === undefined) { out.push(`${where} is undefined`); return; }
    if (node === null) { out.push(`${where} is null`); return; }

    const type = typeof node;
    if (type === 'number') {
        if (!Number.isFinite(node)) out.push(`${where} is ${node}`);
        return;
    }
    if (type === 'string') {
        if (node.includes('[object Object]')) out.push(`${where} contains "[object Object]"`);
        else if (/\bundefined\b/.test(node)) out.push(`${where} contains "undefined": "${node}"`);
        else if (/\bNaN\b/.test(node)) out.push(`${where} contains "NaN": "${node}"`);
        return;
    }
    if (type === 'boolean') return;
    if (Array.isArray(node)) {
        node.forEach((v, i) => scanBadValues(v, `${where}[${i}]`, out));
        return;
    }
    if (type === 'object') {
        for (const key of Object.keys(node)) scanBadValues(node[key], `${where}.${key}`, out);
        return;
    }
    out.push(`${where} has unsupported type ${type}`);
}

const MILEAGE_LANGUAGE = /(\bmiles?\b|\bmileage\b|\d\s?mi\b)/i;

function checkPlan(plan, ctx) {
    const fails = [];
    const add = (msg) => fails.push(msg);

    if (!plan) { return ['no plan returned']; }
    if (!plan.summary || !plan.phases || !plan.weeks) { return ['plan missing summary/phases/weeks']; }

    const { sport, key, level, days, weeks: requestedWeeks, volume } = ctx;
    const summary = plan.summary;
    const planWeeks = plan.weeks;

    // --- totalWeeks honours the request (every request here is inside the
    // config's supported range, so no clamping should occur).
    if (summary.totalWeeks !== requestedWeeks) {
        add(`summary.totalWeeks ${summary.totalWeeks} != requested ${requestedWeeks}`);
    }
    if (planWeeks.length !== requestedWeeks) {
        add(`weeks.length ${planWeeks.length} != requested ${requestedWeeks}`);
    }
    if (summary.weeksAdjusted) {
        add(`weeks were clamped for an in-range request (${summary.note})`);
    }

    // --- Hyrox: the selected division must actually reach the plan. This is the
    // regression that made every Hyrox plan come out as a first-timer plan.
    if (sport === 'hyrox' && plan.distanceConfig.division !== key) {
        add(`division "${key}" resolved to config "${plan.distanceConfig.division}"`);
    }

    // --- Phases cover every week, no gaps and no overlaps.
    const phases = plan.phases.slice().sort((a, b) => a.startWeek - b.startWeek);
    let expected = 1;
    let phaseWeeks = 0;
    for (const phase of phases) {
        if (phase.startWeek !== expected) {
            add(`phase ${phase.name} starts at week ${phase.startWeek}, expected ${expected}`);
            break;
        }
        if (phase.duration < 1) add(`phase ${phase.name} has duration ${phase.duration}`);
        if (phase.endWeek !== phase.startWeek + phase.duration - 1) {
            add(`phase ${phase.name} endWeek ${phase.endWeek} inconsistent with duration ${phase.duration}`);
        }
        expected = phase.endWeek + 1;
        phaseWeeks += phase.duration;
    }
    if (phaseWeeks !== requestedWeeks) {
        add(`phase durations sum to ${phaseWeeks}, plan is ${requestedWeeks} weeks`);
    }
    if (phases.length && phases[phases.length - 1].endWeek !== requestedWeeks) {
        add(`last phase ends at week ${phases[phases.length - 1].endWeek}, plan is ${requestedWeeks} weeks`);
    }

    // --- Week-level checks.
    let peak = 0;
    const taperVolumes = [];
    for (const week of planWeeks) {
        const w = `week ${week.weekNumber}`;

        if (!Array.isArray(week.days) || week.days.length !== 7) {
            add(`${w} has ${week.days ? week.days.length : 'no'} days, expected 7`);
            continue;
        }

        const training = week.days.filter((d) => d.workout && d.workout.type !== 'REST');
        if (training.length !== days) {
            add(`${w} has ${training.length} training days, requested ${days}`);
        }

        for (const day of week.days) {
            const workout = day.workout;
            if (!workout) { add(`${w} ${day.dayName} has no workout`); continue; }
            if (!workout.name || typeof workout.name !== 'string') {
                add(`${w} ${day.dayName} workout has no name`);
            }
            if (workout.type !== 'REST') {
                const hasDuration = typeof workout.duration === 'string' && workout.duration.length > 0 && workout.duration !== '-';
                const hasDistance = typeof workout.distance === 'string' && workout.distance.length > 0;
                if (!hasDuration && !hasDistance) {
                    add(`${w} ${day.dayName} "${workout.name}" has neither duration nor distance`);
                }
                if (!workout.intensity) add(`${w} ${day.dayName} "${workout.name}" has no intensity`);
                if (!workout.purpose) add(`${w} ${day.dayName} "${workout.name}" has no purpose`);
            }
        }

        // Recovery weeks land on the documented cadence and never inside the taper.
        const shouldRecover = week.weekNumber % summary.recoveryCadence === 0 && week.phase !== 'Taper';
        if (!!week.isRecovery !== shouldRecover) {
            add(`${w} isRecovery=${!!week.isRecovery}, cadence ${summary.recoveryCadence} implies ${shouldRecover}`);
        }

        // The scheduled volume must land on the week's budget.
        const planned = week.plannedVolume;
        const actual = week.targetVolume;
        if (!(actual > 0)) add(`${w} scheduled volume is ${actual}`);
        if (planned > 0 && Math.abs(actual - planned) > planned * 0.15) {
            add(`${w} scheduled ${actual} against a budget of ${planned} (more than 15% out)`);
        }

        if (actual > peak) peak = actual;
        if (week.phase === 'Taper') taperVolumes.push(actual);
    }

    // --- Peak volume is real and not wildly above what was asked for.
    if (!(summary.peakVolume > 0)) add(`summary.peakVolume is ${summary.peakVolume}`);
    if (summary.peakVolume > volume * 1.5) {
        add(`summary.peakVolume ${summary.peakVolume} is more than 1.5x the requested ${volume}`);
    }

    // --- The taper actually tapers.
    if (!taperVolumes.length) {
        add('plan has no taper weeks');
    } else {
        if (taperVolumes[0] >= peak) {
            add(`first taper week ${taperVolumes[0]} is not below peak ${peak}`);
        }
        for (let i = 1; i < taperVolumes.length; i++) {
            if (taperVolumes[i] > taperVolumes[i - 1] + 0.05) {
                add(`taper volume rises at taper week ${i + 1}: ${taperVolumes[i - 1]} -> ${taperVolumes[i]}`);
            }
        }
        if (taperVolumes[taperVolumes.length - 1] >= peak) {
            add(`race week volume ${taperVolumes[taperVolumes.length - 1]} is not below peak ${peak}`);
        }
    }

    // --- Recovery week count agrees with the weeks themselves.
    const actualRecovery = planWeeks.filter((w) => w.isRecovery).length;
    if (summary.recoveryWeeks !== actualRecovery) {
        add(`summary.recoveryWeeks ${summary.recoveryWeeks} != ${actualRecovery} weeks flagged`);
    }

    // --- The cadence itself has to be a real mesocycle. Checking each week
    // against summary.recoveryCadence alone would pass for any cadence the
    // generator cared to report, including one that removes recovery entirely,
    // so the shape is asserted independently: this library uses 3:1 or 4:1.
    if (summary.recoveryCadence !== 3 && summary.recoveryCadence !== 4) {
        add(`summary.recoveryCadence is ${summary.recoveryCadence}, expected 3 or 4`);
    }
    const loadingWeeks = planWeeks.filter((w) => w.phase !== 'Taper').length;
    const expectedRecovery = Math.floor(loadingWeeks / summary.recoveryCadence);
    if (Math.abs(actualRecovery - expectedRecovery) > 1) {
        add(`${actualRecovery} recovery weeks across ${loadingWeeks} loading weeks, cadence ${summary.recoveryCadence} implies about ${expectedRecovery}`);
    }
    const recoveryNumbers = planWeeks.filter((w) => w.isRecovery).map((w) => w.weekNumber);
    for (let i = 1; i < recoveryNumbers.length; i++) {
        if (recoveryNumbers[i] - recoveryNumbers[i - 1] !== summary.recoveryCadence) {
            add(`recovery weeks ${recoveryNumbers[i - 1]} and ${recoveryNumbers[i]} are not ${summary.recoveryCadence} weeks apart`);
        }
    }

    // --- Nothing broken anywhere in the serialized plan.
    const bad = [];
    scanBadValues(plan, 'plan', bad);
    bad.forEach(add);

    const serialized = JSON.stringify(plan);

    // --- Units stay in their lane.
    if (sport === 'running') {
        if (summary.unit !== 'mi') add(`running summary.unit is "${summary.unit}"`);
        if (!/\d\.\d mi/.test(serialized)) add('running plan never states a distance in miles');
    } else {
        if (summary.unit !== 'hours') add(`hyrox summary.unit is "${summary.unit}"`);
        const match = serialized.match(MILEAGE_LANGUAGE);
        if (match) add(`hyrox plan uses mileage language: "${match[0]}"`);

        // --- Every one of the 8 stations is actually practised, and not only as
        // part of a race simulation, which would otherwise satisfy a naive check
        // while the station rotation was broken.
        const practised = new Set();
        for (const week of planWeeks) {
            for (const day of week.days) {
                const workout = day.workout;
                if (!workout || !Array.isArray(workout.stations)) continue;
                if (workout.category === 'simulation') continue;
                workout.stations.forEach((s) => practised.add(s));
            }
        }
        for (const stationKey of Object.keys(HyroxStations)) {
            if (!practised.has(stationKey)) {
                add(`station ${stationKey} is never trained outside a simulation`);
            }
            if (!serialized.includes(HyroxStations[stationKey].name)) {
                add(`station ${stationKey} is never named in the plan`);
            }
        }
    }

    return fails;
}

// ---------------------------------------------------------------------------
// Run every combination
// ---------------------------------------------------------------------------

const LEVELS = ['beginner', 'intermediate', 'advanced'];
const TRAINING_DAYS = [3, 4, 5, 6];

const SUITES = [
    {
        sport: 'running',
        Generator: RunningPlanGenerator,
        configs: RunningDistanceConfigs,
        keys: Object.keys(RunningDistanceConfigs),
        buildInputs: buildRunningInputs
    },
    {
        sport: 'hyrox',
        Generator: HyroxPlanGenerator,
        configs: HyroxDistanceConfigs,
        // 'first' is a legacy alias for 'first-timer' and is covered separately.
        keys: ['first-timer', 'open', 'pro', 'doubles'],
        buildInputs: buildHyroxInputs
    }
];

const rows = [];
const failureSamples = [];
let combinations = 0;
let passed = 0;

for (const suite of SUITES) {
    for (const key of suite.keys) {
        const config = suite.configs[key];
        const middle = Math.round((config.minWeeks + config.maxWeeks) / 2);
        const weekOptions = [...new Set([config.minWeeks, middle, config.maxWeeks])];

        let rowTotal = 0;
        let rowPassed = 0;

        for (const level of LEVELS) {
            for (const days of TRAINING_DAYS) {
                for (const weeks of weekOptions) {
                    combinations += 1;
                    rowTotal += 1;

                    const label = `${suite.sport}/${key} ${level} ${days}d ${weeks}w`;
                    let fails;
                    try {
                        const inputs = suite.buildInputs(key, level, days, weeks, config);
                        const volume = inputs.currentVolume;
                        const plan = generatePlan(suite.Generator, suite.sport, inputs);
                        fails = checkPlan(plan, {
                            sport: suite.sport, key, level, days, weeks, volume
                        });
                    } catch (error) {
                        fails = [`threw: ${error && error.message ? error.message : error}`];
                    }

                    if (fails.length === 0) {
                        passed += 1;
                        rowPassed += 1;
                    } else if (failureSamples.length < 15) {
                        failureSamples.push({ label, fails });
                    }
                }
            }
        }

        rows.push({
            suite: suite.sport,
            name: `${config.name}`,
            key,
            weeks: weekOptions.join('/'),
            total: rowTotal,
            passed: rowPassed
        });
    }
}

// --- Legacy alias check: old shared links posted division=first.
combinations += 1;
let aliasFails = [];
try {
    const config = HyroxDistanceConfigs.first;
    const inputs = buildHyroxInputs('first', 'intermediate', 4, config.optimalWeeks, config);
    const plan = generatePlan(HyroxPlanGenerator, 'hyrox', inputs);
    if (!plan || !plan.weeks.length) aliasFails.push('legacy division "first" produced no plan');
} catch (error) {
    aliasFails = [`legacy division "first" threw: ${error.message}`];
}
if (aliasFails.length === 0) {
    passed += 1;
} else if (failureSamples.length < 15) {
    failureSamples.push({ label: 'hyrox/first (legacy alias)', fails: aliasFails });
}
rows.push({ suite: 'hyrox', name: 'Legacy alias "first"', key: 'first', weeks: '-', total: 1, passed: aliasFails.length === 0 ? 1 : 0 });

// ---------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------

const pad = (s, n) => String(s).padEnd(n);
const padStart = (s, n) => String(s).padStart(n);

console.log('');
console.log('Training plan strength test');
console.log('Every distance/division x level (beginner/intermediate/advanced) x training days (3-6) x weeks (min/mid/max)');
console.log('');
console.log(pad('SPORT', 9) + pad('PLAN', 26) + pad('WEEKS', 14) + padStart('COMBOS', 8) + padStart('PASS', 7) + padStart('FAIL', 7));
console.log('-'.repeat(71));
for (const row of rows) {
    const failed = row.total - row.passed;
    console.log(
        pad(row.suite, 9) +
        pad(row.name, 26) +
        pad(row.weeks, 14) +
        padStart(row.total, 8) +
        padStart(row.passed, 7) +
        padStart(failed, 7) +
        (failed ? '   <-- FAIL' : '')
    );
}
console.log('-'.repeat(71));
console.log(
    pad('TOTAL', 9) + pad('', 26) + pad('', 14) +
    padStart(combinations, 8) + padStart(passed, 7) + padStart(combinations - passed, 7)
);
console.log('');

if (failureSamples.length) {
    console.log('Failures (first ' + failureSamples.length + '):');
    for (const sample of failureSamples) {
        console.log('  ' + sample.label);
        for (const f of sample.fails.slice(0, 6)) console.log('      - ' + f);
    }
    console.log('');
}

if (passed === combinations) {
    console.log(`PASS: ${combinations} combinations, 0 failures.`);
    process.exit(0);
} else {
    console.log(`FAIL: ${combinations - passed} of ${combinations} combinations failed.`);
    process.exit(1);
}
