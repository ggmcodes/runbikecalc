/**
 * Hyrox Training Plan Generator
 * Periodized plans for Hyrox racing. Volume is always HOURS per week.
 *
 * Race format: 8 x 1km runs, each one followed by a station, in this order:
 * SkiErg 1000m, Sled Push 50m, Sled Pull 50m, Burpee Broad Jumps 80m,
 * Row 1000m, Farmers Carry 200m, Sandbag Lunges 100m, Wall Balls 75/100 reps.
 *
 * ---------------------------------------------------------------------------
 * RESEARCH BASIS (synthesised into parameters below, nothing copied verbatim)
 * ---------------------------------------------------------------------------
 * 1. Divisions. Open and Pro run the identical 8km and the identical station
 *    order; only the loads change (sled push, sled pull, farmers carry, sandbag
 *    lunges, wall balls). Doubles partners both run all eight kilometres side by
 *    side, so the aerobic demand does not halve, only the station work splits.
 *    Pro athletes need heavy loads from the start of the build rather than a
 *    late switch, which is why the strength share below is highest for Pro.
 *    (hyroxfitness.com divisions, findyouredge.app divisions, kracey.com
 *     divisions, repz.app doubles blueprint, official Hyrox singles rulebook)
 * 2. Weekly structure. Every week should contain four stimuli: a Zone 2 aerobic
 *    run, one quality run (threshold or 1km repeats at race pace), one
 *    Hyrox-specific hybrid session combining station work with running under
 *    fatigue, and dedicated strength or station practice. Typical athletes train
 *    five days with an optional sixth: three to four runs, two to three strength
 *    or station sessions.
 *    (hybridprocoach.com weekly schedule, rb100.fitness weekly cardio template,
 *     davidefitcoach.com 8-12 week plan, stridefitness.com 12-week guide)
 * 3. Compromised running is the defining skill. Running 1km fresh is a different
 *    event from running 1km straight off the sled or the lunges, so brick work
 *    (run 1km, station, repeat) appears from the Base block and grows through
 *    the plan rather than being saved for race day.
 *    (roxzone.training running for Hyrox, puregym.com Hyrox plan,
 *     hyroxhub "training for hyrox")
 * 4. Simulation cadence. Build to race specificity: a half simulation (four runs
 *    and four stations) around the midpoint, then a full simulation at slightly
 *    lighter loads to rehearse pacing and the Roxzone transitions.
 *    (ifastfitness.com Hyrox workout guide, puregym.com Hyrox plan)
 * 5. Station bias. Wall balls arrive last and are trained fatigued; sandbag
 *    lunges are a muscular endurance problem rather than a strength problem;
 *    farmers carry and sled pull are grip-limited. Station practice below
 *    rotates through all eight so none is left untrained.
 *    (roxlyfe.com sandbag lunges guide, pliability.com 8 Hyrox exercises,
 *     hungerinthewild.com strength training for Hyrox, roxfit.app stations)
 * 6. Balance. The most common programming error is over-weighting strength and
 *    under-running, because running is the largest single share of race time.
 *    Running therefore keeps the largest share of weekly hours in every division.
 *    (findyouredge.app "how much running per week for Hyrox",
 *     traversefitness.com beginner guide)
 * 7. Taper. Cut volume, keep a little intensity. Resting completely leaves
 *    athletes flat; training hard through race week leaves residual fatigue.
 *    (hybridprocoach.com, davidefitcoach.com)
 * ---------------------------------------------------------------------------
 */

// Hyrox event configurations.
// `mix` is the share of weekly HOURS by phase: run / station / strength / hybrid.
const HyroxDistanceConfigs = {
    'first-timer': {
        name: 'First Hyrox (Beginner)',
        category: 'open',
        division: 'first-timer',
        minWeeks: 8,
        optimalWeeks: 12,
        maxWeeks: 16,
        taperWeeks: 1,
        taperDays: 7,
        peakFactor: 1.16,
        loadLabel: 'light, technique-first loads',
        partnerWork: false,
        keyWorkouts: ['EASY_RUN', 'STATION_TECHNIQUE', 'COMPROMISED_RUN', 'HALF_SIMULATION'],
        weeklyVolumeTargets: { beginner: 5, intermediate: 7, advanced: 9 },
        focusAreas: ['running_base', 'station_technique', 'aerobic_capacity'],
        mix: {
            Base: { run: 0.48, station: 0.24, strength: 0.20, hybrid: 0.08 },
            Build: { run: 0.44, station: 0.24, strength: 0.18, hybrid: 0.14 },
            Peak: { run: 0.40, station: 0.24, strength: 0.16, hybrid: 0.20 },
            Taper: { run: 0.46, station: 0.24, strength: 0.12, hybrid: 0.18 }
        },
        description: 'Build the engine and learn all 8 stations properly before your first race'
    },
    'open': {
        name: 'Hyrox Open',
        category: 'open',
        division: 'open',
        minWeeks: 10,
        optimalWeeks: 14,
        maxWeeks: 20,
        taperWeeks: 2,
        taperDays: 10,
        peakFactor: 1.20,
        loadLabel: 'Open race weights',
        partnerWork: false,
        keyWorkouts: ['INTERVAL_RUN', 'STATION_DRILLS', 'COMPROMISED_RUN', 'FULL_SIMULATION'],
        weeklyVolumeTargets: { beginner: 6, intermediate: 9, advanced: 12 },
        focusAreas: ['running_capacity', 'station_endurance', 'lactate_threshold'],
        mix: {
            Base: { run: 0.46, station: 0.22, strength: 0.22, hybrid: 0.10 },
            Build: { run: 0.42, station: 0.24, strength: 0.18, hybrid: 0.16 },
            Peak: { run: 0.38, station: 0.24, strength: 0.15, hybrid: 0.23 },
            Taper: { run: 0.44, station: 0.24, strength: 0.12, hybrid: 0.20 }
        },
        description: 'Race the Open division with confident pacing and clean station work'
    },
    'pro': {
        name: 'Hyrox Pro',
        category: 'pro',
        division: 'pro',
        minWeeks: 12,
        optimalWeeks: 16,
        maxWeeks: 24,
        taperWeeks: 2,
        taperDays: 12,
        peakFactor: 1.22,
        loadLabel: 'Pro race weights, trained heavy from week one',
        partnerWork: false,
        keyWorkouts: ['INTERVAL_RUN', 'HEAVY_STATION_WORK', 'COMPROMISED_RUN', 'FULL_SIMULATION'],
        weeklyVolumeTargets: { beginner: 8, intermediate: 11, advanced: 15 },
        focusAreas: ['running_speed', 'strength_endurance', 'heavy_sled_capacity'],
        mix: {
            Base: { run: 0.42, station: 0.22, strength: 0.28, hybrid: 0.08 },
            Build: { run: 0.38, station: 0.24, strength: 0.24, hybrid: 0.14 },
            Peak: { run: 0.36, station: 0.24, strength: 0.18, hybrid: 0.22 },
            Taper: { run: 0.42, station: 0.24, strength: 0.14, hybrid: 0.20 }
        },
        description: 'Pro division build: the same 8km with materially heavier sleds and carries'
    },
    'doubles': {
        name: 'Hyrox Doubles',
        category: 'doubles',
        division: 'doubles',
        minWeeks: 8,
        optimalWeeks: 12,
        maxWeeks: 16,
        taperWeeks: 1,
        taperDays: 7,
        peakFactor: 1.18,
        loadLabel: 'Doubles weights with split station reps',
        partnerWork: true,
        keyWorkouts: ['INTERVAL_RUN', 'PARTNER_WORKOUT', 'COMPROMISED_RUN', 'HALF_SIMULATION'],
        weeklyVolumeTargets: { beginner: 5, intermediate: 7, advanced: 10 },
        focusAreas: ['running_capacity', 'station_proficiency', 'partner_strategy'],
        mix: {
            Base: { run: 0.46, station: 0.22, strength: 0.20, hybrid: 0.12 },
            Build: { run: 0.42, station: 0.22, strength: 0.16, hybrid: 0.20 },
            Peak: { run: 0.40, station: 0.22, strength: 0.14, hybrid: 0.24 },
            Taper: { run: 0.44, station: 0.22, strength: 0.12, hybrid: 0.22 }
        },
        description: 'Both partners still run all 8km, so train the engine and split only the stations'
    }
};

// Hyrox station specifications, in race order.
const HyroxStations = {
    SKIERG: {
        name: 'SkiErg',
        distance: '1000m',
        muscles: ['lats', 'triceps', 'core'],
        tips: 'Set a rhythm you can hold. Drive with the legs and hips, not just the arms.',
        order: 1
    },
    SLED_PUSH: {
        name: 'Sled Push',
        distance: '50m',
        weights: {
            open: { women: '102kg', men: '152kg' },
            pro: { women: '152kg', men: '202kg' }
        },
        muscles: ['quads', 'glutes', 'calves', 'core'],
        tips: 'Stay low with straight arms. Short choppy steps beat long powerful ones.',
        order: 2
    },
    SLED_PULL: {
        name: 'Sled Pull',
        distance: '50m',
        weights: {
            open: { women: '78kg', men: '103kg' },
            pro: { women: '103kg', men: '153kg' }
        },
        muscles: ['back', 'biceps', 'grip', 'core'],
        tips: 'Hand over hand, sit back into your bodyweight, keep the rope moving.',
        order: 3
    },
    BURPEE_BROAD_JUMPS: {
        name: 'Burpee Broad Jumps',
        distance: '80m',
        muscles: ['full body', 'legs', 'shoulders'],
        tips: 'Jump forward, not up. Minimise time on the floor and keep the pace boring.',
        order: 4
    },
    ROWING: {
        name: 'Rowing',
        distance: '1000m',
        muscles: ['legs', 'back', 'arms', 'core'],
        tips: 'Legs supply most of the power. Pick a split you can hold and do not chase it.',
        order: 5
    },
    FARMERS_CARRY: {
        name: 'Farmers Carry',
        distance: '200m',
        weights: {
            open: { women: '2x16kg', men: '2x24kg' },
            pro: { women: '2x24kg', men: '2x32kg' }
        },
        muscles: ['grip', 'traps', 'core', 'legs'],
        tips: 'Grip decides this one. Fast short strides, breathe, and plan your drop points.',
        order: 6
    },
    SANDBAG_LUNGES: {
        name: 'Sandbag Lunges',
        distance: '100m',
        weights: {
            open: { women: '10kg', men: '20kg' },
            pro: { women: '20kg', men: '30kg' }
        },
        muscles: ['quads', 'glutes', 'core'],
        tips: 'A muscular endurance problem, not a strength one. Knee down, torso tall, repeat.',
        order: 7
    },
    WALL_BALLS: {
        name: 'Wall Balls',
        reps: { women: 75, men: 100 },
        weights: { women: '4kg', men: '6kg' },
        target: '9ft / 2.74m',
        muscles: ['quads', 'shoulders', 'core'],
        tips: 'Break into planned sets from the first rep. Catch and throw in one motion.',
        order: 8
    }
};

// Race order, used to rotate station practice so all 8 get trained.
const HYROX_STATION_ORDER = [
    'SKIERG', 'SLED_PUSH', 'SLED_PULL', 'BURPEE_BROAD_JUMPS',
    'ROWING', 'FARMERS_CARRY', 'SANDBAG_LUNGES', 'WALL_BALLS'
];

// Minutes per kilometre, used to turn planned hours into a run distance estimate.
const HYROX_RUN_PACE = {
    beginner: { easy: 7.0, tempo: 5.8, interval: 5.3, race: 6.1 },
    intermediate: { easy: 6.2, tempo: 5.0, interval: 4.6, race: 5.3 },
    advanced: { easy: 5.5, tempo: 4.4, interval: 4.1, race: 4.7 }
};

/**
 * Hyrox workout library. Every entry carries a name, an intensity label and a
 * one-line purpose.
 */
const HyroxWorkoutTypes = {
    // --- Running
    EASY_RUN: {
        name: 'Zone 2 Run', rpe: '3-4', intensity: 'Conversational', category: 'running', sport: 'run', pace: 'easy',
        purpose: 'Aerobic base. Running is the biggest single share of race time, so it gets the biggest share of the week'
    },
    LONG_RUN: {
        name: 'Long Zone 2 Run', rpe: '3-4', intensity: 'Easy, sustained', category: 'running', sport: 'run', pace: 'easy',
        purpose: 'Extend aerobic capacity so eight kilometres never feels like the hard part'
    },
    TEMPO_RUN: {
        name: 'Threshold Run', rpe: '6-7', intensity: 'Comfortably hard', category: 'running', sport: 'run', pace: 'tempo',
        purpose: 'Raise the ceiling you can hold while your heart rate is already pinned by station work'
    },
    INTERVAL_RUN: {
        name: '1km Repeats', rpe: '7-8', intensity: 'Race effort repeats', category: 'running', sport: 'run', pace: 'interval',
        purpose: 'The race is eight separate kilometres, so train them as repeats rather than as one long run'
    },
    HYROX_PACE_RUN: {
        name: 'Race Pace Run', rpe: '5-6', intensity: 'Target race pace', category: 'running', sport: 'run', pace: 'race',
        purpose: 'Rehearse the exact kilometre pace you plan to hold on the day'
    },

    // --- Stations
    STATION_TECHNIQUE: {
        name: 'Station Technique', rpe: '4-5', intensity: 'Light, form first', category: 'stations', sport: 'functional',
        purpose: 'Learn the movement pattern at a load you can hold perfectly, before it has to survive fatigue'
    },
    STATION_DRILLS: {
        name: 'Station Drills', rpe: '6-7', intensity: 'Race weights', category: 'stations', sport: 'functional',
        purpose: 'Repeat each station at race weight until pacing and break points become automatic'
    },
    HEAVY_STATION_WORK: {
        name: 'Heavy Station Work', rpe: '7-8', intensity: 'At or above race weight', category: 'stations', sport: 'functional',
        purpose: 'Train above race load so the Pro sled feels like something you have already done'
    },
    ROXZONE_PRACTICE: {
        name: 'Roxzone Transitions', rpe: '5-6', intensity: 'Moderate, tightly timed', category: 'conditioning', sport: 'mixed',
        purpose: 'The transitions between run and station are free time if you practise them and lost time if you do not'
    },

    // --- Strength
    LEG_STRENGTH: {
        name: 'Leg Strength', rpe: '6-7', intensity: 'Heavy compound work', category: 'strength', sport: 'strength',
        purpose: 'Squat and hinge strength is what moves the sled and what survives the lunges'
    },
    PULL_STRENGTH: {
        name: 'Pull Strength', rpe: '6-7', intensity: 'Heavy pulling', category: 'strength', sport: 'strength',
        purpose: 'Back and pulling strength for the sled pull, the row and the ski'
    },
    GRIP_STRENGTH: {
        name: 'Grip and Carry Work', rpe: '6-7', intensity: 'Loaded carries to failure point', category: 'strength', sport: 'strength',
        purpose: 'Grip is the hidden limiter on sled pull, farmers carry and the end of the wall balls'
    },
    STRENGTH_ENDURANCE: {
        name: 'Strength Endurance', rpe: '6-7', intensity: 'High rep, short rest', category: 'strength', sport: 'strength',
        purpose: 'Muscular endurance under short rest, which is what a station actually demands'
    },
    STATION_STRENGTH: {
        name: 'Strength + Station Block', rpe: '6-7', intensity: 'Heavy then race weight', category: 'strength', sport: 'strength',
        purpose: 'One combined session for shorter weeks: compound lifts first, then station practice fatigued'
    },

    // --- Hybrid and race specific
    COMPROMISED_RUN: {
        name: 'Compromised Running', rpe: '7-8', intensity: 'Race effort, fatigued legs', category: 'conditioning', sport: 'mixed',
        purpose: 'Run 1km, hit a station, run again. The transition into running on ruined legs is the whole sport'
    },
    MIXED_CONDITIONING: {
        name: 'Mixed Conditioning', rpe: '5-6', intensity: 'Moderate continuous', category: 'conditioning', sport: 'mixed',
        purpose: 'Keep the hybrid stimulus in a down week without the cost of a full compromised session'
    },
    PARTNER_WORKOUT: {
        name: 'Partner Session', rpe: '6-7', intensity: 'Alternating race effort', category: 'partner', sport: 'mixed',
        purpose: 'Rehearse the switch pattern with your partner: you still both run every kilometre'
    },
    HALF_SIMULATION: {
        name: 'Half Hyrox Simulation', rpe: '7-8', intensity: 'Race effort, half distance', category: 'simulation', sport: 'hyrox',
        purpose: 'Four runs and four stations at race effort to test pacing without a full recovery cost'
    },
    FULL_SIMULATION: {
        name: 'Full Hyrox Simulation', rpe: '8-9', intensity: 'Full race effort', category: 'simulation', sport: 'hyrox',
        purpose: 'All 8 runs and all 8 stations so nothing about race day is new'
    },
    RACE_REHEARSAL: {
        name: 'Race Rehearsal', rpe: '6-7', intensity: 'Short, race pace, low volume', category: 'simulation', sport: 'hyrox',
        purpose: 'Taper sharpener: a short run and station sequence at race pace to stay sharp without fatigue'
    },

    // --- Recovery
    ACTIVE_RECOVERY: {
        name: 'Active Recovery', rpe: '2-3', intensity: 'Very easy movement', category: 'recovery', sport: 'recovery',
        purpose: 'Walk, easy bike or mobility. Movement that helps you recover rather than adding to the load'
    },
    REST: {
        name: 'Rest Day', rpe: '0', intensity: 'Rest', category: 'recovery', sport: 'rest',
        purpose: 'Complete rest is when the sessions you already did turn into fitness'
    }
};

/**
 * Split a number of weeks across phases so the parts always sum exactly to the
 * whole. Guarantees phase coverage with no gaps and no overlaps.
 */
function hyroxAllocateWeeks(total, weights, minima) {
    const n = weights.length;
    const out = minima.map(function (m) { return Math.max(0, m); });
    let used = out.reduce(function (a, b) { return a + b; }, 0);

    for (let i = n - 1; i >= 0 && used > total; i--) {
        while (out[i] > 1 && used > total) { out[i] -= 1; used -= 1; }
    }
    for (let i = n - 1; i > 0 && used > total; i--) {
        used -= out[i];
        out[i] = 0;
    }

    let remaining = total - used;
    if (remaining > 0) {
        let wsum = 0;
        for (let k = 0; k < n; k++) { if (out[k] > 0) wsum += weights[k]; }
        if (wsum <= 0) wsum = 1;
        const raw = [];
        const add = [];
        for (let k = 0; k < n; k++) {
            raw[k] = out[k] > 0 ? (remaining * weights[k]) / wsum : 0;
            add[k] = Math.floor(raw[k]);
        }
        let left = remaining - add.reduce(function (a, b) { return a + b; }, 0);
        const order = [];
        for (let k = 0; k < n; k++) order.push([raw[k] - Math.floor(raw[k]), k]);
        order.sort(function (a, b) { return b[0] - a[0] || a[1] - b[1]; });
        for (let k = 0; k < order.length && left > 0; k++) {
            const idx = order[k][1];
            if (out[idx] > 0) { add[idx] += 1; left -= 1; }
        }
        while (left > 0) { add[0] += 1; left -= 1; }
        for (let k = 0; k < n; k++) out[k] += add[k];
    }
    return out;
}

/**
 * Hyrox Plan Generator - extends TrainingPlanGenerator
 */
class HyroxPlanGenerator extends TrainingPlanGenerator {
    constructor(formId = 'training-plan-form', resultId = 'training-plan-result') {
        super(formId, resultId, 'hyrox');
    }

    /**
     * Get Hyrox event configurations
     */
    getDistanceConfigs() {
        return HyroxDistanceConfigs;
    }

    // ------------------------------------------------------------------
    // Input handling
    // ------------------------------------------------------------------

    /**
     * The Hyrox form posts `division`, `experienceLevel`, `weeklyHours` and
     * `longWorkoutDay`, while the shared plumbing looks for `goalDistance`,
     * `fitnessLevel`, `currentVolume` and `longDay`. Reconciling the two here is
     * what stops the generator from silently producing nothing, and it is also
     * what makes the chosen division actually reach the plan rather than
     * falling back to the first entry in the config table.
     */
    normalizeInputs(inputs) {
        if (!inputs || typeof inputs !== 'object') return inputs;

        let division = inputs.goalDistance || inputs.division || inputs.distance || 'open';
        if (!HyroxDistanceConfigs[division]) division = 'open';
        inputs.goalDistance = division;
        inputs.division = division;

        const weeks = parseInt(inputs.weeksUntilRace || inputs.weeks || inputs.totalWeeks, 10);
        inputs.weeksUntilRace = Number.isFinite(weeks) && weeks > 0
            ? weeks
            : HyroxDistanceConfigs[division].optimalWeeks;

        const level = String(inputs.fitnessLevel || inputs.experienceLevel || 'intermediate').toLowerCase();
        inputs.fitnessLevel = ['beginner', 'intermediate', 'advanced'].indexOf(level) >= 0 ? level : 'intermediate';
        inputs.experienceLevel = inputs.experienceLevel || inputs.fitnessLevel;

        const volume = parseFloat(inputs.currentVolume || inputs.weeklyHours || inputs.weeklyVolume);
        inputs.currentVolume = Number.isFinite(volume) && volume > 0
            ? volume
            : HyroxDistanceConfigs[division].weeklyVolumeTargets[inputs.fitnessLevel];
        inputs.weeklyHours = inputs.currentVolume;

        const days = parseInt(inputs.trainingDays, 10);
        inputs.trainingDays = Number.isFinite(days) ? Math.min(7, Math.max(3, days)) : 4;

        inputs.longDay = inputs.longDay || inputs.longWorkoutDay || inputs.longRunDay || 'saturday';
        if (!Array.isArray(inputs.restDays)) inputs.restDays = [];
        inputs.unit = 'hours';

        return inputs;
    }

    validateInputs(inputs) {
        this.normalizeInputs(inputs);
        if (!HyroxDistanceConfigs[inputs.goalDistance]) {
            throw new Error('Please select a Hyrox division');
        }
        if (!inputs.trainingDays || inputs.trainingDays < 3 || inputs.trainingDays > 7) {
            throw new Error('Training days must be between 3 and 7');
        }
        return true;
    }

    // ------------------------------------------------------------------
    // Periodization
    // ------------------------------------------------------------------

    calculatePhases(inputs, distanceConfig) {
        this.normalizeInputs(inputs);
        const config = (distanceConfig && distanceConfig.mix)
            ? distanceConfig
            : HyroxDistanceConfigs[inputs.goalDistance];

        const requested = inputs.totalWeeks || inputs.weeksUntilRace;
        const clamped = Math.min(config.maxWeeks, Math.max(config.minWeeks, requested));

        inputs.weeksRequested = requested;
        inputs.weeksAdjusted = clamped !== requested;
        inputs.totalWeeks = clamped;

        let taperWeeks = config.taperWeeks || 1;
        taperWeeks = Math.max(1, Math.min(taperWeeks, clamped - 3));

        const trainingWeeks = clamped - taperWeeks;
        // Build carries the most weeks in Hyrox: station capacity and compromised
        // running both need repeated exposure, not just an aerobic base.
        const parts = hyroxAllocateWeeks(trainingWeeks, [0.36, 0.38, 0.26], [2, 2, 1]);

        const phases = [];
        let cursor = 1;
        const spec = [
            {
                name: 'Base', label: 'Base Building', duration: parts[0],
                description: 'Aerobic running plus station technique at loads you can hold perfect form under.'
            },
            {
                name: 'Build', label: 'Build Phase', duration: parts[1],
                description: 'Race weights on the stations, threshold running, and compromised running every week.'
            },
            {
                name: 'Peak', label: 'Peak Phase', duration: parts[2],
                description: 'Highest hours, full simulations and the Roxzone rehearsed until it is automatic.'
            },
            {
                name: 'Taper', label: 'Race Taper', duration: taperWeeks,
                description: 'Hours drop sharply, race-pace touches stay in. Sharp beats rested and flat.'
            }
        ];

        spec.forEach(function (p) {
            if (p.duration <= 0) return;
            phases.push({
                name: p.name,
                label: p.label,
                startWeek: cursor,
                endWeek: cursor + p.duration - 1,
                duration: p.duration,
                description: p.description,
                mix: config.mix[p.name]
            });
            cursor += p.duration;
        });

        return phases;
    }

    getRecoveryCadence(inputs) {
        return inputs && inputs.fitnessLevel === 'beginner' ? 3 : 4;
    }

    isRecoveryWeek(weekNumber, inputs) {
        return weekNumber % this.getRecoveryCadence(inputs || {}) === 0;
    }

    /**
     * Weekly hours curve. Same logic as the running plan, expressed in hours:
     * a ramped loading block with recovery weeks, then a taper that steps down
     * from the hours actually reached.
     */
    buildVolumeCurve(inputs, phases, config) {
        const base = inputs.currentVolume;
        const level = inputs.fitnessLevel;
        const startFactor = level === 'beginner' ? 0.80 : level === 'advanced' ? 0.90 : 0.85;
        const peakFactor = config.peakFactor * (level === 'beginner' ? 0.95 : level === 'advanced' ? 1.03 : 1.0);
        const cadence = this.getRecoveryCadence(inputs);

        const taperPhase = phases.filter(function (p) { return p.name === 'Taper'; })[0];
        const taperStart = taperPhase ? taperPhase.startWeek : phases[phases.length - 1].endWeek + 1;
        const taperLen = taperPhase ? taperPhase.duration : 0;

        // Hyrox tapers are short. Volume falls hard, intensity stays (note 7).
        const taperSteps = {
            1: [0.55],
            2: [0.70, 0.48],
            3: [0.80, 0.60, 0.45]
        }[Math.min(3, Math.max(1, taperLen))] || [0.55];

        const loadWeeks = [];
        for (let w = 1; w < taperStart; w++) {
            if (w % cadence !== 0) loadWeeks.push(w);
        }

        const curve = new Array(inputs.totalWeeks).fill(0);
        let previousLoad = 0;
        let peakLoad = 0;

        for (let w = 1; w < taperStart; w++) {
            const isRecovery = w % cadence === 0;
            const idx = loadWeeks.indexOf(w);
            const span = Math.max(1, loadWeeks.length - 1);
            const progress = idx >= 0
                ? idx / span
                : Math.min(1, (w - 1) / Math.max(1, taperStart - 2));

            let volume = base * (startFactor + (peakFactor - startFactor) * progress);
            if (isRecovery) {
                volume *= 0.72;
            } else {
                if (previousLoad > 0) volume = Math.min(volume, previousLoad * 1.12);
                previousLoad = volume;
                if (volume > peakLoad) peakLoad = volume;
            }
            curve[w - 1] = Math.round(Math.max(base * 0.3, volume) * 10) / 10;
        }

        if (peakLoad <= 0) peakLoad = base;
        for (let w = taperStart; w <= inputs.totalWeeks; w++) {
            const step = taperSteps[Math.min(taperSteps.length - 1, w - taperStart)];
            curve[w - 1] = Math.round(Math.max(base * 0.25, peakLoad * step) * 10) / 10;
        }

        return curve;
    }

    /**
     * Decide which weeks carry a simulation. Half simulations come first, from
     * the middle of the Build block, then full simulations in Peak (note 4).
     */
    planSimulationWeeks(phases, inputs, config) {
        const cadence = this.getRecoveryCadence(inputs);
        const sims = {};
        const build = phases.filter(function (p) { return p.name === 'Build'; })[0];
        const peak = phases.filter(function (p) { return p.name === 'Peak'; })[0];

        if (build) {
            const first = build.startWeek + Math.floor(build.duration / 2);
            for (let w = first; w <= build.endWeek; w += 3) {
                if (w % cadence !== 0) sims[w] = 'half';
            }
        }
        if (peak) {
            let placed = false;
            for (let w = peak.startWeek; w <= peak.endWeek; w++) {
                if (w % cadence === 0) continue;
                if (!placed || (w - peak.startWeek) % 3 === 0) {
                    sims[w] = 'full';
                    placed = true;
                }
            }
            // A Peak block made entirely of recovery weeks is possible on very
            // short plans; put the full simulation in anyway.
            if (!placed) sims[peak.startWeek] = 'full';
        }
        return sims;
    }

    generateAllWeeks(inputs, phases, distanceConfig) {
        this.normalizeInputs(inputs);
        const config = (distanceConfig && distanceConfig.mix)
            ? distanceConfig
            : HyroxDistanceConfigs[inputs.goalDistance];

        const curve = this.buildVolumeCurve(inputs, phases, config);
        const cadence = this.getRecoveryCadence(inputs);
        const sims = this.planSimulationWeeks(phases, inputs, config);
        const totalWeeks = inputs.totalWeeks;
        const weeks = [];

        phases.forEach(function (phase) {
            for (let i = 0; i < phase.duration; i++) {
                const weekNumber = phase.startWeek + i;
                const isRecovery = phase.name !== 'Taper' && weekNumber % cadence === 0;
                const isRaceWeek = weekNumber === totalWeeks;
                const week = this.generateWeeklyPlan(weekNumber, phase, isRecovery, inputs, {
                    weekVolume: curve[weekNumber - 1],
                    distanceConfig: config,
                    weekProgress: phase.duration > 1 ? i / (phase.duration - 1) : 1,
                    simulation: sims[weekNumber] || '',
                    isRaceWeek: isRaceWeek,
                    totalWeeks: totalWeeks
                });

                weeks.push(Object.assign({
                    weekNumber: weekNumber,
                    phase: phase.name,
                    phaseLabel: phase.label,
                    isRecovery: isRecovery,
                    isRaceWeek: isRaceWeek,
                    plannedVolume: curve[weekNumber - 1]
                }, week));
            }
        }, this);

        return weeks;
    }

    // ------------------------------------------------------------------
    // Week construction
    // ------------------------------------------------------------------

    generateWeeklyPlan(weekNumber, phase, isRecovery, inputs, context) {
        const config = (context && context.distanceConfig && context.distanceConfig.mix)
            ? context.distanceConfig
            : HyroxDistanceConfigs[inputs.goalDistance];
        const targetHours = (context && context.weekVolume) || inputs.currentVolume;
        const simulation = (context && context.simulation) || '';
        const isRaceWeek = !!(context && context.isRaceWeek);
        const level = inputs.fitnessLevel;
        const trainingDays = inputs.trainingDays;
        const longDayIndex = this.getDayIndex(inputs.longDay);

        const sessions = this.buildSessions({
            weekNumber: weekNumber,
            phase: phase,
            isRecovery: isRecovery,
            isRaceWeek: isRaceWeek,
            simulation: simulation,
            config: config,
            level: level,
            trainingDays: trainingDays
        });

        this.balanceToTarget(sessions, targetHours);

        const days = [];
        for (let i = 0; i < 7; i++) {
            days.push({
                dayIndex: i,
                dayName: DAYS[i],
                dayShort: DAYS_SHORT[i],
                isRest: false,
                workout: this.hyroxMakeWorkout('REST', 0, level, weekNumber, config)
            });
        }

        const excluded = isRaceWeek ? [longDayIndex] : [];
        // Race week keeps race day clear, so the rehearsal anchors two days out.
        const anchorDay = isRaceWeek ? (longDayIndex + 5) % 7 : longDayIndex;
        const chosen = this.pickTrainingDays(longDayIndex, trainingDays, excluded, isRaceWeek ? [anchorDay] : []);
        this.placeSessions(days, sessions, chosen, anchorDay, level, weekNumber, config);

        days.forEach(function (d) { d.isRest = d.workout.type === 'REST'; });

        let totalHours = 0;
        let totalMinutes = 0;
        days.forEach(function (d) {
            totalHours += d.workout.hours || 0;
            totalMinutes += d.workout.minutes || 0;
        });
        totalHours = Math.round(totalHours * 10) / 10;

        const notes = [];
        if (isRaceWeek) {
            notes.push('Race week. Race day is ' + DAYS[longDayIndex] + ', so that day is kept clear.');
        } else if (isRecovery) {
            notes.push('Down week. Same four stimuli, about a third fewer hours.');
        }
        if (simulation === 'full') notes.push('Full simulation week: treat it like a dress rehearsal, kit included.');
        if (simulation === 'half') notes.push('Half simulation week: four runs and four stations at race effort.');
        if (trainingDays > 0 && totalHours / trainingDays > 2.5) {
            notes.push('These sessions are long for one block. Split the longest ones into a morning and an evening.');
        }

        return {
            days: days,
            unit: 'hours',
            totalHours: totalHours,
            totalMinutes: totalMinutes,
            // targetVolume is the volume actually scheduled, in hours.
            targetVolume: totalHours,
            trainingDayCount: days.filter(function (d) { return !d.isRest; }).length,
            simulation: simulation,
            distribution: this.calculateTrainingDistribution(days),
            note: notes.join(' ')
        };
    }

    /**
     * Build the week from the four stimuli that every Hyrox week should contain
     * (research note 2), scaled to the number of days the athlete actually has.
     */
    buildSessions(ctx) {
        const phase = ctx.phase;
        const config = ctx.config;
        const days = ctx.trainingDays;
        const isRecovery = ctx.isRecovery;
        const sessions = [];

        // --- 1. The hybrid session. This is the one that makes a Hyrox plan a
        // Hyrox plan rather than a running plan with squats attached.
        let hybridType;
        if (ctx.isRaceWeek) {
            hybridType = 'RACE_REHEARSAL';
        } else if (ctx.simulation === 'full') {
            hybridType = 'FULL_SIMULATION';
        } else if (ctx.simulation === 'half') {
            hybridType = 'HALF_SIMULATION';
        } else if (isRecovery) {
            hybridType = 'MIXED_CONDITIONING';
        } else if (config.partnerWork && ctx.weekNumber % 2 === 0) {
            hybridType = 'PARTNER_WORKOUT';
        } else if (phase.name === 'Taper') {
            hybridType = 'ROXZONE_PRACTICE';
        } else {
            hybridType = 'COMPROMISED_RUN';
        }
        const hybridWeight = hybridType === 'FULL_SIMULATION' ? 2.2
            : hybridType === 'HALF_SIMULATION' ? 1.5
                : hybridType === 'RACE_REHEARSAL' ? 0.7 : 1.2;
        sessions.push({ type: hybridType, weight: hybridWeight, slot: 'long', stationCount: hybridType === 'FULL_SIMULATION' ? 8 : 4 });

        // --- 2. The quality run.
        let runType;
        if (isRecovery) runType = 'EASY_RUN';
        else if (phase.name === 'Base') runType = 'TEMPO_RUN';
        else if (phase.name === 'Build') runType = 'INTERVAL_RUN';
        else if (phase.name === 'Peak') runType = 'INTERVAL_RUN';
        else runType = 'HYROX_PACE_RUN';
        sessions.push({ type: runType, weight: 1.0, slot: 'quality', stationCount: 0 });

        // --- 3. Stations and strength. Short weeks combine them into one block.
        const stationType = phase.name === 'Base' ? 'STATION_TECHNIQUE'
            : phase.name === 'Taper' ? 'STATION_TECHNIQUE'
                : (config.category === 'pro' && phase.name === 'Peak') ? 'HEAVY_STATION_WORK'
                    : 'STATION_DRILLS';

        const strengthType = phase.name === 'Base' ? 'LEG_STRENGTH'
            : phase.name === 'Build' ? (config.category === 'pro' ? 'PULL_STRENGTH' : 'GRIP_STRENGTH')
                : phase.name === 'Peak' ? 'STRENGTH_ENDURANCE'
                    : 'GRIP_STRENGTH';

        if (days <= 3) {
            sessions.push({ type: 'STATION_STRENGTH', weight: 1.1, slot: 'strength', stationCount: 4 });
        } else {
            sessions.push({ type: stationType, weight: 1.0, slot: 'station', stationCount: 4 });
            sessions.push({ type: strengthType, weight: 0.9, slot: 'strength', stationCount: 0 });
        }

        // --- 4. Aerobic running fills the rest of the week, because running is
        // the largest share of race time (research note 6).
        if (days >= 5) sessions.push({ type: 'EASY_RUN', weight: 0.85, slot: 'easy', stationCount: 0 });
        if (days >= 6) sessions.push({ type: 'LONG_RUN', weight: 1.3, slot: 'easy', stationCount: 0 });
        if (days >= 7) sessions.push({ type: 'ACTIVE_RECOVERY', weight: 0.5, slot: 'easy', stationCount: 0 });

        // Trim or pad so exactly `days` sessions exist.
        while (sessions.length > days) sessions.pop();
        while (sessions.length < days) {
            sessions.push({ type: 'EASY_RUN', weight: 0.85, slot: 'easy', stationCount: 0 });
        }

        return sessions;
    }

    /**
     * Turn relative session weights into hours that sum to the weekly budget.
     */
    balanceToTarget(sessions, targetHours) {
        const totalWeight = sessions.reduce(function (a, s) { return a + s.weight; }, 0) || 1;
        const minHours = 0.25;

        sessions.forEach(function (s) {
            s.hours = Math.max(minHours, (targetHours * s.weight) / totalWeight);
        });

        // Round to a tenth of an hour and push the residual onto the longest session.
        sessions.forEach(function (s) { s.hours = Math.round(s.hours * 10) / 10; });
        const total = sessions.reduce(function (a, s) { return a + s.hours; }, 0);
        const residual = Math.round((targetHours - total) * 10) / 10;
        if (Math.abs(residual) >= 0.1) {
            let biggest = sessions[0];
            sessions.forEach(function (s) { if (s.hours > biggest.hours) biggest = s; });
            biggest.hours = Math.max(minHours, Math.round((biggest.hours + residual) * 10) / 10);
        }
    }

    // ------------------------------------------------------------------
    // Scheduling
    // ------------------------------------------------------------------

    pickTrainingDays(longDayIndex, trainingDays, excluded, forced) {
        const blocked = excluded || [];
        const isBlocked = function (d) { return blocked.indexOf(d) >= 0; };
        const chosen = [];
        if (!isBlocked(longDayIndex)) chosen.push(longDayIndex);
        (forced || []).forEach(function (d) {
            if (chosen.length < trainingDays && !isBlocked(d) && chosen.indexOf(d) < 0) chosen.push(d);
        });

        const distance = function (a, b) {
            const d = Math.abs(a - b);
            return Math.min(d, 7 - d);
        };

        while (chosen.length < trainingDays) {
            let best = -1;
            let bestScore = -1;
            for (let d = 0; d < 7; d++) {
                if (chosen.indexOf(d) >= 0 || isBlocked(d)) continue;
                let score = 7;
                chosen.forEach(function (c) { score = Math.min(score, distance(d, c)); });
                if (score > bestScore) { bestScore = score; best = d; }
            }
            if (best < 0) break;
            chosen.push(best);
        }

        return chosen.sort(function (a, b) { return a - b; });
    }

    placeSessions(days, sessions, chosen, longDayIndex, level, weekNumber, config) {
        const available = chosen.slice();
        const self = this;
        const take = function (index) {
            const at = available.indexOf(index);
            if (at >= 0) { available.splice(at, 1); return index; }
            return available.length ? available.shift() : -1;
        };
        const distance = function (a, b) {
            const d = Math.abs(a - b);
            return Math.min(d, 7 - d);
        };

        const placed = [];
        const assign = function (session, dayIndex) {
            if (dayIndex < 0) return;
            days[dayIndex].workout = self.hyroxMakeWorkout(
                session.type, session.hours, level, weekNumber, config, session.stationCount
            );
            placed.push(dayIndex);
        };

        // The hybrid or simulation session goes on the athlete's long workout day.
        const hybrid = sessions.filter(function (s) { return s.slot === 'long'; })[0];
        if (hybrid) assign(hybrid, take(longDayIndex));

        // Quality run as far from the hybrid session as the week allows.
        ['quality', 'strength', 'station'].forEach(function (slot) {
            sessions.filter(function (s) { return s.slot === slot; }).forEach(function (session) {
                let best = -1;
                let bestScore = -1;
                available.forEach(function (d) {
                    let score = distance(d, longDayIndex);
                    placed.forEach(function (p) { score = Math.min(score, distance(d, p)); });
                    if (score > bestScore) { bestScore = score; best = d; }
                });
                assign(session, take(best));
            });
        });

        sessions.filter(function (s) { return s.slot === 'easy'; }).forEach(function (session) {
            assign(session, take(available.length ? available[0] : -1));
        });
    }

    // ------------------------------------------------------------------
    // Workout objects
    // ------------------------------------------------------------------

    /**
     * Rotate through the eight stations in race order so that across any two
     * consecutive weeks every station has been trained (research note 5).
     */
    stationsForWeek(weekNumber, count) {
        const n = Math.max(0, Math.min(8, count || 0));
        if (n === 0) return [];
        if (n >= 8) return HYROX_STATION_ORDER.slice();
        const offset = ((weekNumber - 1) * n) % 8;
        const out = [];
        for (let i = 0; i < n; i++) out.push(HYROX_STATION_ORDER[(offset + i) % 8]);
        return out;
    }

    hyroxMakeWorkout(type, hours, level, weekNumber, config, stationCount) {
        const def = HyroxWorkoutTypes[type] || HyroxWorkoutTypes.REST;

        if (type === 'REST') {
            return {
                type: 'REST',
                name: def.name,
                hours: 0,
                minutes: 0,
                duration: '-',
                distance: '',
                rpe: def.rpe,
                intensity: def.intensity,
                purpose: def.purpose,
                category: def.category,
                sport: def.sport,
                stations: [],
                note: '',
                details: ''
            };
        }

        const h = Math.max(0.25, Math.round((hours || 0) * 10) / 10);
        const minutes = Math.max(15, Math.round(h * 60));
        const stations = this.stationsForWeek(weekNumber, stationCount);

        // Runs get a kilometre estimate. Hyrox is a metric event, so no mileage.
        let distance = '';
        if (def.pace) {
            const paceTable = HYROX_RUN_PACE[level] || HYROX_RUN_PACE.intermediate;
            // A structured session is mostly warm-up, recovery jogs and cool-down,
            // so total distance is estimated at easy pace rather than work pace.
            const paceKey = (def.pace === 'tempo' || def.pace === 'interval') ? 'easy' : def.pace;
            const km = minutes / paceTable[paceKey];
            distance = (Math.round(km * 10) / 10).toFixed(1) + ' km';
        }

        return {
            type: type,
            name: def.name,
            hours: h,
            minutes: minutes,
            duration: this.formatDuration(minutes),
            distance: distance,
            rpe: def.rpe,
            intensity: def.intensity,
            purpose: def.purpose,
            category: def.category,
            sport: def.sport,
            stations: stations,
            note: '',
            details: this.hyroxSessionDetails(type, minutes, stations, config, level)
        };
    }

    /**
     * One concrete line describing how to run the session, naming the stations
     * it covers so the plan is actually followable.
     */
    hyroxSessionDetails(type, minutes, stations, config, level) {
        const names = stations.map(function (key) { return HyroxStations[key].name; });
        const list = names.join(', ');
        const load = config.loadLabel;
        const clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };

        switch (type) {
            case 'FULL_SIMULATION':
                return 'Full race: 8 x 1km with all 8 stations in order (' + list + ') at ' + load + '. Time your Roxzone transitions.';
            case 'HALF_SIMULATION':
                return 'Half race: 4 x 1km alternating with ' + list + ' at ' + load + '. Hold the pace you would hold on the day.';
            case 'RACE_REHEARSAL':
                return 'Short and sharp: 2 x 1km at race pace with ' + (names[0] || 'one station') + ' between. Stop while it still feels easy.';
            case 'COMPROMISED_RUN':
                return clamp(Math.round(minutes / 12), 3, 6) + ' rounds of 1km run straight into ' + list + '. Do not stop between the station and the next run.';
            case 'PARTNER_WORKOUT':
                return 'With your partner: both run each 1km together, then split ' + list + ' in agreed blocks. Practise the switch, not the heroics.';
            case 'MIXED_CONDITIONING':
                return 'Easy continuous work: ' + list + ' at conversational effort, no clock.';
            case 'ROXZONE_PRACTICE':
                return 'Transitions only: ' + list + ' with a 400m jog between each, timing every changeover.';
            case 'STATION_TECHNIQUE':
                return 'Technique at light load: ' + list + '. Perfect reps and clean setups, stop each set before form goes.';
            case 'STATION_DRILLS':
                return 'Race weight repeats: ' + list + ' at ' + load + ', full race distance each, 2 min rest.';
            case 'HEAVY_STATION_WORK':
                return 'Above race weight: ' + list + ' with 10 to 20% extra load over shorter distances.';
            case 'STATION_STRENGTH':
                return 'Compound lifts first (squat, deadlift, press), then ' + list + ' at ' + load + ' while already tired.';
            case 'LEG_STRENGTH':
                return 'Back squat and deadlift in the 4 to 6 rep range, then walking lunges. This is what moves the sled.';
            case 'PULL_STRENGTH':
                return 'Rows, pull ups and heavy sled pulls. Build the back that survives the rope.';
            case 'GRIP_STRENGTH':
                return 'Loaded carries and hangs: 4 x 100m heavy farmers carry plus dead hangs to near failure.';
            case 'STRENGTH_ENDURANCE':
                return 'High rep circuits with 30 to 45 seconds rest: wall balls, lunges, burpees. Short rest is the point.';
            case 'INTERVAL_RUN':
                return clamp(Math.round(minutes / 8), 4, 8) + ' x 1km at target race pace with 90 seconds jog. Race the repeats, not the recovery.';
            case 'TEMPO_RUN': {
                const work = clamp(Math.round(minutes * 0.55), 15, 60);
                return work > 35
                    ? '2 x ' + Math.round(work / 2) + ' minutes at comfortably hard effort with 3 minutes easy between.'
                    : work + ' minutes continuous at comfortably hard effort.';
            }
            case 'HYROX_PACE_RUN':
                return 'Steady at your goal kilometre pace. If you cannot hold it fresh, it is not your race pace.';
            case 'LONG_RUN':
                return 'Easy Zone 2 the whole way. This is the session that makes the eight race kilometres feel routine.';
            case 'EASY_RUN':
                return 'Conversational pace. If you could not hold a conversation, slow down.';
            case 'ACTIVE_RECOVERY':
                return 'Walk, easy bike or mobility. Nothing that leaves a mark on tomorrow.';
            default:
                return 'Steady effort throughout.';
        }
    }

    calculateTrainingDistribution(days) {
        const distribution = { running: 0, stations: 0, strength: 0, mixed: 0 };

        days.forEach(function (day) {
            if (!day.workout || !day.workout.category) return;
            const cat = day.workout.category;
            const hours = day.workout.hours || 0;
            if (cat === 'running') distribution.running += hours;
            else if (cat === 'stations' || cat === 'simulation') distribution.stations += hours;
            else if (cat === 'strength') distribution.strength += hours;
            else if (cat === 'conditioning' || cat === 'partner') distribution.mixed += hours;
        });

        return {
            running: Math.round(distribution.running * 10) / 10,
            stations: Math.round(distribution.stations * 10) / 10,
            strength: Math.round(distribution.strength * 10) / 10,
            mixed: Math.round(distribution.mixed * 10) / 10
        };
    }

    // ------------------------------------------------------------------
    // Summary
    // ------------------------------------------------------------------

    generateSummary(inputs, phases, weeks) {
        const config = HyroxDistanceConfigs[inputs.goalDistance];
        let totalVolume = 0;
        let peakVolume = 0;
        let recoveryWeeks = 0;
        let simulations = 0;

        weeks.forEach(function (w) {
            totalVolume += w.targetVolume || 0;
            if ((w.targetVolume || 0) > peakVolume) peakVolume = w.targetVolume;
            if (w.isRecovery) recoveryWeeks += 1;
            if (w.simulation) simulations += 1;
        });

        const notes = [];
        if (inputs.weeksAdjusted) {
            notes.push('You asked for ' + inputs.weeksRequested + ' weeks. A ' + config.name +
                ' build works between ' + config.minWeeks + ' and ' + config.maxWeeks +
                ' weeks, so this plan runs ' + inputs.totalWeeks + '.');
        }
        notes.push('Volume is in hours per week, split across running, station work, strength and compromised running at ' +
            config.loadLabel + '.');

        return {
            totalWeeks: weeks.length,
            totalVolume: Math.round(totalVolume),
            peakVolume: Math.round(peakVolume * 10) / 10,
            recoveryWeeks: recoveryWeeks,
            unit: 'hours',
            volumeUnit: 'hours per week',
            recoveryCadence: this.getRecoveryCadence(inputs),
            simulationWeeks: simulations,
            division: config.name,
            weeksRequested: inputs.weeksRequested || inputs.totalWeeks,
            weeksAdjusted: !!inputs.weeksAdjusted,
            trainingDays: inputs.trainingDays,
            longWorkoutDay: inputs.longDay,
            note: notes.join(' '),
            phases: phases.map(function (p) { return { name: p.name, weeks: p.duration }; })
        };
    }

    // ------------------------------------------------------------------
    // Small helpers
    // ------------------------------------------------------------------

    getDayIndex(dayName) {
        const dayMap = {
            monday: 0, mon: 0,
            tuesday: 1, tue: 1,
            wednesday: 2, wed: 2,
            thursday: 3, thu: 3,
            friday: 4, fri: 4,
            saturday: 5, sat: 5,
            sunday: 6, sun: 6
        };
        const key = String(dayName || 'saturday').toLowerCase();
        const idx = dayMap[key];
        return typeof idx === 'number' ? idx : 5;
    }

    formatDuration(minutes) {
        if (!minutes || minutes <= 0) return '-';
        if (minutes < 60) return minutes + ' min';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins === 0 ? hours + 'h' : hours + 'h ' + mins + 'm';
    }

    /**
     * Override overview section for Hyrox specifics
     */
    createOverviewSection(plan) {
        const section = document.createElement('div');
        section.className = 'text-center mb-8';

        const title = document.createElement('h2');
        title.className = 'text-3xl font-bold text-orange-600 mb-6';
        title.textContent = 'Your Personalized Hyrox Plan';
        section.appendChild(title);

        const statsGrid = document.createElement('div');
        statsGrid.className = 'grid grid-cols-2 md:grid-cols-4 gap-4';

        const stats = [
            { value: plan.summary.totalWeeks, label: 'Total Weeks', color: 'orange' },
            { value: plan.summary.peakVolume + 'h', label: 'Peak Hours/Week', color: 'blue' },
            { value: plan.summary.recoveryWeeks, label: 'Recovery Weeks', color: 'green' },
            { value: plan.phases.length, label: 'Training Phases', color: 'purple' }
        ];

        stats.forEach(stat => {
            const card = document.createElement('div');
            card.className = `bg-${stat.color}-50 p-4 rounded-lg`;

            const value = document.createElement('div');
            value.className = `text-2xl font-bold text-${stat.color}-800`;
            value.textContent = stat.value;

            const label = document.createElement('div');
            label.className = `text-sm text-${stat.color}-600`;
            label.textContent = stat.label;

            card.appendChild(value);
            card.appendChild(label);
            statsGrid.appendChild(card);
        });

        section.appendChild(statsGrid);

        const focusInfo = document.createElement('div');
        focusInfo.className = 'mt-6 p-4 bg-orange-50 rounded-lg';

        const focusTitle = document.createElement('h4');
        focusTitle.className = 'font-semibold text-orange-700 mb-2';
        focusTitle.textContent = 'Hyrox Training Focus';
        focusInfo.appendChild(focusTitle);

        const focusText = document.createElement('p');
        focusText.className = 'text-orange-600 text-sm';
        focusText.textContent = '8 x 1km runs alternating with 8 stations. This plan balances running, station work, strength endurance and compromised running for ' +
            (plan.distanceConfig?.name || 'your division') + '.';
        focusInfo.appendChild(focusText);

        section.appendChild(focusInfo);

        return section;
    }
}

// Export for use

/* Legacy option aliases: old form values and shared plan links must keep working. */
HyroxDistanceConfigs.first = HyroxDistanceConfigs['first-timer'];
window.HyroxPlanGenerator = HyroxPlanGenerator;
window.HyroxDistanceConfigs = HyroxDistanceConfigs;
window.HyroxWorkoutTypes = HyroxWorkoutTypes;
window.HyroxStations = HyroxStations;
