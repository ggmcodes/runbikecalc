/**
 * Running Training Plan Generator
 * Periodized plans for 5K through 100 miles. Volume is always MILES per week.
 *
 * ---------------------------------------------------------------------------
 * RESEARCH BASIS (synthesised into parameters below, nothing copied verbatim)
 * ---------------------------------------------------------------------------
 * 1. Intensity distribution. Seiler's polarised / 80-20 model: roughly 80% of
 *    weekly volume easy and conversational, ~20% moderate-to-hard, delivered as
 *    two structured quality sessions a week for recreational runners and two to
 *    three for trained runners. The split tightens toward race-specific work in
 *    the Peak block rather than staying fixed all year.
 *    (marathonhandbook.com/polarized-training, runningmagazine.ca 80/20,
 *     onepeloton.com/blog/80-20-running)
 * 2. Progression. The 10% guideline: weekly mileage rises by no more than about
 *    10% week over week, and the long run is held to roughly a third or less of
 *    weekly mileage. RRCA teaches 20-30% of the week as the long-run share.
 *    (swift-running.com weekly mileage guide, rogueruncoaching.com long-run
 *     article, coachcorkyruns.com "The Long Run - myths, science")
 * 3. Long run ceiling. The real limiter is time, not distance: Daniels caps the
 *    long run near 2.5-3 hours regardless of pace, which is why a 3:30 marathoner
 *    tops out near 20 miles and a slower runner should top out sooner. Hence both
 *    a mileage cap and a minutes cap per distance below.
 * 4. Mesocycle shape. 3:1 loading (three progressive weeks, one reduced week) is
 *    the standard block; beginners and ultra athletes benefit from the same 3:1
 *    while experienced road runners often run 4:1. Macro structure is
 *    Base -> Build -> Peak -> Taper.
 *    (svexa.com periodization guide, myprocoach.net periodization)
 * 5. Workout order within the block. Threshold work is built first, VO2max
 *    intervals at 5K-10K effort are layered on closer to race day, with strides
 *    and hills carrying the fast-twitch stimulus through the Base block
 *    (Pfitzinger's threshold-first progression; Daniels Phase I-III).
 *    (runningwithrock.com Pfitz explainers, run.wxm.be Daniels notes)
 * 6. Taper. Length scales with race distance: ~1 week for 5K/10K, 2 for the half,
 *    3 for the marathon. A 27-study meta-analysis puts the sweet spot at a 41-60%
 *    volume cut over roughly two weeks with frequency and intensity held; cutting
 *    more than 60% is worse than cutting nothing.
 *    (runnersconnect.net/how-to-taper-for-a-marathon,
 *     marathonhandbook.com/optimal-marathon-taper-length, PMC8506252)
 * 7. Ultras. Back-to-back long weekends are a specific-phase tool layered on top
 *    of easy volume, not the foundation. Time on feet, accumulated vert and
 *    rehearsed fuelling are trained explicitly. Taper runs 10-14 days for a 50K,
 *    2-3 weeks for 100K and 3+ weeks for 100 miles.
 *    (vert.run back-to-back / 50-mile / 100-mile guides,
 *     marathonhandbook.com/ultramarathon-long-runs, trainright.com ultra taper,
 *     ultra-x.co "The Perfect Ultramarathon Taper")
 * ---------------------------------------------------------------------------
 */

// Running distance configurations.
// longRunShare / longRunCapMinutes encode research notes 2 and 3.
// easyShareByPhase encodes note 1 (the 80/20 split shifting by phase).
const RunningDistanceConfigs = {
    '5k': {
        name: '5K',
        distance: 3.1,
        minWeeks: 6,
        optimalWeeks: 10,
        maxWeeks: 16,
        taperWeeks: 1,
        longRunPeakMiles: 9,
        longRunShare: { Base: 0.26, Build: 0.28, Peak: 0.30, Taper: 0.25 },
        longRunCapMinutes: 100,
        peakFactor: 1.18,
        isUltra: false,
        keyWorkouts: ['INTERVALS', 'TEMPO', 'HILLS', 'LONG_RUN'],
        easyShareByPhase: { Base: 0.90, Build: 0.82, Peak: 0.76, Taper: 0.84 },
        weeklyVolumeTargets: { beginner: 20, intermediate: 30, advanced: 45 },
        description: 'Build speed and aerobic capacity for a fast 5K'
    },
    '10k': {
        name: '10K',
        distance: 6.2,
        minWeeks: 8,
        optimalWeeks: 12,
        maxWeeks: 18,
        taperWeeks: 1,
        longRunPeakMiles: 12,
        longRunShare: { Base: 0.27, Build: 0.29, Peak: 0.31, Taper: 0.26 },
        longRunCapMinutes: 115,
        peakFactor: 1.20,
        isUltra: false,
        keyWorkouts: ['TEMPO', 'INTERVALS', 'RACE_PACE', 'LONG_RUN'],
        easyShareByPhase: { Base: 0.90, Build: 0.82, Peak: 0.78, Taper: 0.84 },
        weeklyVolumeTargets: { beginner: 25, intermediate: 35, advanced: 50 },
        description: 'Develop speed endurance and threshold for 10K racing'
    },
    'half': {
        name: 'Half Marathon',
        distance: 13.1,
        minWeeks: 10,
        optimalWeeks: 14,
        maxWeeks: 20,
        taperWeeks: 2,
        longRunPeakMiles: 15,
        longRunShare: { Base: 0.28, Build: 0.31, Peak: 0.33, Taper: 0.27 },
        longRunCapMinutes: 145,
        peakFactor: 1.22,
        isUltra: false,
        keyWorkouts: ['TEMPO', 'CRUISE', 'RACE_PACE', 'LONG_RUN_FAST_FINISH'],
        easyShareByPhase: { Base: 0.90, Build: 0.83, Peak: 0.79, Taper: 0.85 },
        weeklyVolumeTargets: { beginner: 30, intermediate: 40, advanced: 55 },
        description: 'Threshold-led build for a strong half marathon'
    },
    'marathon': {
        name: 'Marathon',
        distance: 26.2,
        minWeeks: 14,
        optimalWeeks: 18,
        maxWeeks: 24,
        taperWeeks: 3,
        longRunPeakMiles: 21,
        longRunShare: { Base: 0.29, Build: 0.32, Peak: 0.34, Taper: 0.28 },
        longRunCapMinutes: 180,
        peakFactor: 1.24,
        isUltra: false,
        keyWorkouts: ['LONG_RUN_MP', 'TEMPO', 'CRUISE', 'RACE_PACE'],
        easyShareByPhase: { Base: 0.91, Build: 0.85, Peak: 0.80, Taper: 0.86 },
        weeklyVolumeTargets: { beginner: 35, intermediate: 50, advanced: 70 },
        description: 'Marathon build with goal-pace long runs and a three-week taper'
    },
    '50k': {
        name: '50K Ultra',
        distance: 31.1,
        minWeeks: 16,
        optimalWeeks: 20,
        maxWeeks: 28,
        taperWeeks: 2,
        longRunPeakMiles: 24,
        longRunShare: { Base: 0.30, Build: 0.34, Peak: 0.36, Taper: 0.28 },
        longRunCapMinutes: 240,
        peakFactor: 1.22,
        isUltra: true,
        backToBack: true,
        vertFocus: true,
        keyWorkouts: ['ULTRA_LONG', 'B2B_LONG', 'VERT', 'TEMPO'],
        easyShareByPhase: { Base: 0.93, Build: 0.88, Peak: 0.86, Taper: 0.90 },
        weeklyVolumeTargets: { beginner: 40, intermediate: 55, advanced: 75 },
        description: 'First ultra build: easy volume, vert and back-to-back weekends'
    },
    '50mi': {
        name: '50 Mile Ultra',
        distance: 50,
        minWeeks: 18,
        optimalWeeks: 24,
        maxWeeks: 32,
        taperWeeks: 3,
        longRunPeakMiles: 30,
        longRunShare: { Base: 0.30, Build: 0.34, Peak: 0.37, Taper: 0.28 },
        longRunCapMinutes: 300,
        peakFactor: 1.22,
        isUltra: true,
        backToBack: true,
        vertFocus: true,
        keyWorkouts: ['ULTRA_LONG', 'B2B_LONG', 'VERT', 'MEDIUM_LONG'],
        easyShareByPhase: { Base: 0.93, Build: 0.89, Peak: 0.87, Taper: 0.91 },
        weeklyVolumeTargets: { beginner: 45, intermediate: 60, advanced: 85 },
        description: 'Time-on-feet build for 50 miles with rehearsed fuelling'
    },
    '100k': {
        name: '100K Ultra',
        distance: 62.1,
        minWeeks: 20,
        optimalWeeks: 28,
        maxWeeks: 36,
        taperWeeks: 3,
        longRunPeakMiles: 34,
        longRunShare: { Base: 0.30, Build: 0.35, Peak: 0.38, Taper: 0.28 },
        longRunCapMinutes: 360,
        peakFactor: 1.20,
        isUltra: true,
        backToBack: true,
        vertFocus: true,
        keyWorkouts: ['ULTRA_LONG', 'B2B_LONG', 'VERT', 'MEDIUM_LONG'],
        easyShareByPhase: { Base: 0.94, Build: 0.90, Peak: 0.88, Taper: 0.92 },
        weeklyVolumeTargets: { beginner: 50, intermediate: 70, advanced: 95 },
        description: 'High-volume 100K preparation built on back-to-back weekends'
    },
    '100mi': {
        name: '100 Mile Ultra',
        distance: 100,
        minWeeks: 24,
        optimalWeeks: 32,
        maxWeeks: 52,
        taperWeeks: 3,
        longRunPeakMiles: 38,
        longRunShare: { Base: 0.30, Build: 0.35, Peak: 0.38, Taper: 0.27 },
        longRunCapMinutes: 420,
        peakFactor: 1.20,
        isUltra: true,
        backToBack: true,
        multiDayBackToBack: true,
        vertFocus: true,
        keyWorkouts: ['ULTRA_LONG', 'B2B_LONG', 'VERT', 'MEDIUM_LONG'],
        easyShareByPhase: { Base: 0.94, Build: 0.91, Peak: 0.89, Taper: 0.93 },
        weeklyVolumeTargets: { beginner: 55, intermediate: 75, advanced: 100 },
        description: 'Full 100-mile build: night running, vert, and multi-day long weekends'
    }
};

// Minutes per easy mile, used only to turn planned miles into a duration estimate.
const RUN_EASY_PACE = { beginner: 11.5, intermediate: 9.6, advanced: 8.2 };

// Multiplier on easy pace for each intensity band.
const RUN_PACE_FACTOR = {
    recovery: 1.10,
    easy: 1.00,
    steady: 0.94,
    marathon: 0.91,
    threshold: 0.88,
    interval: 0.83
};

/**
 * Running workout library. Every entry carries a name, an intensity label and a
 * one-line purpose so no workout can render as a bare row in the table.
 */
const RunWorkoutLibrary = {
    REST: {
        name: 'Rest Day', rpe: '0', intensity: 'Rest', category: 'rest', pace: 'easy',
        purpose: 'Full rest is when the week of training actually turns into fitness'
    },
    RECOVERY_RUN: {
        name: 'Recovery Run', rpe: '2-3', intensity: 'Very easy', category: 'easy', pace: 'recovery',
        purpose: 'Deliberately slow miles to clear the legs after a hard session'
    },
    EASY_RUN: {
        name: 'Easy Run', rpe: '3-4', intensity: 'Conversational', category: 'easy', pace: 'easy',
        purpose: 'The easy 80% of the week: aerobic volume at a pace you could talk through'
    },
    EASY_STRIDES: {
        name: 'Easy Run + Strides', rpe: '3-4', intensity: 'Easy plus 6 x 20s', category: 'easy', pace: 'easy',
        purpose: 'Easy miles plus short relaxed strides to hold turnover without adding fatigue'
    },
    MEDIUM_LONG: {
        name: 'Medium-Long Run', rpe: '4-5', intensity: 'Steady aerobic', category: 'easy', pace: 'easy',
        purpose: 'A midweek second long run that raises endurance without a second hard day'
    },
    LONG_RUN: {
        name: 'Long Run', rpe: '3-4', intensity: 'Easy, conversational', category: 'easy', pace: 'easy',
        purpose: 'The endurance anchor of the week, kept easy and capped near a third of the miles'
    },
    LONG_RUN_FAST_FINISH: {
        name: 'Long Run, Fast Finish', rpe: '4-6', intensity: 'Easy into race effort', category: 'moderate', pace: 'steady',
        purpose: 'Long run with the final third at goal race effort to rehearse closing strong'
    },
    LONG_RUN_MP: {
        name: 'Long Run with Race-Pace Miles', rpe: '5-6', intensity: 'Easy with goal-pace blocks', category: 'moderate', pace: 'marathon',
        purpose: 'Goal race pace inside the long run, the most race-specific session in the plan'
    },
    ULTRA_LONG: {
        name: 'Ultra Long Run', rpe: '3-4', intensity: 'All-day easy effort', category: 'easy', pace: 'easy',
        purpose: 'Time on feet: rehearse pacing, fuelling and kit for hours rather than miles'
    },
    B2B_LONG: {
        name: 'Back-to-Back Long Run', rpe: '3-4', intensity: 'Easy on tired legs', category: 'easy', pace: 'easy',
        purpose: 'A second long day in a row so the legs learn to keep moving already fatigued'
    },
    VERT: {
        name: 'Vert Session', rpe: '5-6', intensity: 'Steady climbing', category: 'moderate', pace: 'steady',
        purpose: 'Accumulate climbing so race-day vert is something you have trained, not survived'
    },
    FARTLEK: {
        name: 'Fartlek', rpe: '5-7', intensity: 'Surges by feel', category: 'moderate', pace: 'steady',
        purpose: 'Unstructured speed play: a first taste of faster running with no track required'
    },
    HILLS: {
        name: 'Hill Repeats', rpe: '7-8', intensity: 'Hard climbs, jog down', category: 'hard', pace: 'threshold',
        purpose: 'Strength and running economy with far less impact than flat intervals'
    },
    TEMPO: {
        name: 'Tempo Run', rpe: '6-7', intensity: 'Comfortably hard', category: 'hard', pace: 'threshold',
        purpose: 'Threshold running, the pace you could hold for about an hour, built before speed'
    },
    CRUISE: {
        name: 'Cruise Intervals', rpe: '6-7', intensity: 'Threshold with short floats', category: 'hard', pace: 'threshold',
        purpose: 'Threshold volume broken into repeats so the pace holds with cleaner form'
    },
    INTERVALS: {
        name: '5K-10K Intervals', rpe: '8-9', intensity: '5K to 10K effort', category: 'hard', pace: 'interval',
        purpose: 'VO2max repeats layered on once threshold is established, closer to race day'
    },
    RACE_PACE: {
        name: 'Race-Pace Run', rpe: '5-6', intensity: 'Goal race effort', category: 'moderate', pace: 'marathon',
        purpose: 'Lock in goal pace and rehearse the rhythm you want to feel on race day'
    },
    SHARPENER: {
        name: 'Taper Sharpener', rpe: '6-7', intensity: 'Short race-effort reps', category: 'hard', pace: 'interval',
        purpose: 'A brief touch of race effort that keeps you sharp while volume falls away'
    },
    SHAKEOUT: {
        name: 'Shakeout Run', rpe: '2-3', intensity: 'Very easy plus strides', category: 'easy', pace: 'recovery',
        purpose: 'Short and very easy the day before the race to wake the legs up'
    }
};

/**
 * Split a number of weeks across phases so the parts always sum exactly to the
 * whole. Guarantees phase coverage with no gaps and no overlaps.
 */
function runAllocateWeeks(total, weights, minima) {
    const n = weights.length;
    const out = minima.map(function (m) { return Math.max(0, m); });
    let used = out.reduce(function (a, b) { return a + b; }, 0);

    // Minima do not fit: trim from the last phase backwards, never below one week.
    for (let i = n - 1; i >= 0 && used > total; i--) {
        while (out[i] > 1 && used > total) { out[i] -= 1; used -= 1; }
    }
    // Still over: drop whole phases from the end.
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
 * Running Plan Generator - extends TrainingPlanGenerator
 */
class RunningPlanGenerator extends TrainingPlanGenerator {
    constructor(formId = 'training-plan-form', resultId = 'training-plan-result') {
        super(formId, resultId, 'running');
    }

    /**
     * Get running distance configurations
     */
    getDistanceConfigs() {
        return RunningDistanceConfigs;
    }

    // ------------------------------------------------------------------
    // Input handling
    // ------------------------------------------------------------------

    /**
     * Accept every field name the site has ever posted for a running plan.
     * The premium form posts distance / weeks / weeklyMileage / fitnessLevel /
     * trainingDays / longRunDay; the standalone form posts the kebab-case
     * equivalents. A missing alias used to make the generator throw and return
     * nothing at all, which is what a reader saw as a blank result.
     */
    normalizeInputs(inputs) {
        if (!inputs || typeof inputs !== 'object') return inputs;

        inputs.goalDistance = inputs.goalDistance || inputs.distance || inputs.raceDistance || '5k';
        if (!RunningDistanceConfigs[inputs.goalDistance]) {
            inputs.goalDistance = '5k';
        }

        const weeks = parseInt(inputs.weeksUntilRace || inputs.weeks || inputs.totalWeeks, 10);
        inputs.weeksUntilRace = Number.isFinite(weeks) && weeks > 0
            ? weeks
            : RunningDistanceConfigs[inputs.goalDistance].optimalWeeks;

        const level = String(inputs.fitnessLevel || inputs.experienceLevel || 'intermediate').toLowerCase();
        inputs.fitnessLevel = ['beginner', 'intermediate', 'advanced'].indexOf(level) >= 0 ? level : 'intermediate';
        inputs.experienceLevel = inputs.experienceLevel || inputs.fitnessLevel;

        const volume = parseFloat(inputs.currentVolume || inputs.weeklyMileage || inputs.weeklyVolume);
        inputs.currentVolume = Number.isFinite(volume) && volume > 0
            ? volume
            : RunningDistanceConfigs[inputs.goalDistance].weeklyVolumeTargets[inputs.fitnessLevel];
        inputs.weeklyMileage = inputs.currentVolume;

        const days = parseInt(inputs.trainingDays, 10);
        inputs.trainingDays = Number.isFinite(days) ? Math.min(7, Math.max(3, days)) : 4;

        inputs.longDay = inputs.longDay || inputs.longRunDay || inputs.longWorkoutDay || 'saturday';
        if (!Array.isArray(inputs.restDays)) inputs.restDays = [];
        inputs.unit = 'mi';

        return inputs;
    }

    /**
     * Validate inputs. Runs first in every code path, so it doubles as the
     * place where field aliases are normalised.
     */
    validateInputs(inputs) {
        this.normalizeInputs(inputs);
        if (!RunningDistanceConfigs[inputs.goalDistance]) {
            throw new Error('Please select a goal race distance');
        }
        if (!inputs.trainingDays || inputs.trainingDays < 3 || inputs.trainingDays > 7) {
            throw new Error('Training days must be between 3 and 7');
        }
        return true;
    }

    // ------------------------------------------------------------------
    // Periodization
    // ------------------------------------------------------------------

    /**
     * Build Base / Build / Peak / Taper so the durations sum exactly to the
     * requested number of weeks. The requested weeks are clamped to the range
     * the distance can actually support and the clamp is reported in the summary.
     */
    calculatePhases(inputs, distanceConfig) {
        this.normalizeInputs(inputs);
        const config = distanceConfig && distanceConfig.longRunShare
            ? distanceConfig
            : RunningDistanceConfigs[inputs.goalDistance];

        const requested = inputs.totalWeeks || inputs.weeksUntilRace;
        const clamped = Math.min(config.maxWeeks, Math.max(config.minWeeks, requested));

        inputs.weeksRequested = requested;
        inputs.weeksAdjusted = clamped !== requested;
        inputs.totalWeeks = clamped;

        // Taper length scales with race distance (research note 6 and 7).
        let taperWeeks = config.taperWeeks || 2;
        if (inputs.fitnessLevel === 'beginner' && config.distance >= 26.2) {
            taperWeeks = Math.min(taperWeeks + 1, 4);
        }
        taperWeeks = Math.max(1, Math.min(taperWeeks, clamped - 3));

        const trainingWeeks = clamped - taperWeeks;
        // Base carries the most weeks: aerobic volume is the slowest adaptation.
        const parts = runAllocateWeeks(trainingWeeks, [0.40, 0.35, 0.25], [2, 2, 1]);

        const phases = [];
        let cursor = 1;
        const spec = [
            {
                name: 'Base', label: 'Base Building', duration: parts[0],
                description: 'Easy aerobic volume, strides and hills. Mileage climbs by no more than 10% a week.'
            },
            {
                name: 'Build', label: 'Build Phase', duration: parts[1],
                description: 'Threshold work goes in first: tempo runs and cruise intervals on top of the base.'
            },
            {
                name: 'Peak', label: 'Peak Phase', duration: parts[2],
                description: 'Highest mileage and the most race-specific sessions of the plan.'
            },
            {
                name: 'Taper', label: 'Race Taper', duration: taperWeeks,
                description: 'Volume falls 40-60% while the intensity that made you fit stays in.'
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
                intensityDistribution: {
                    easy: Math.round(config.easyShareByPhase[p.name] * 100),
                    hard: 100 - Math.round(config.easyShareByPhase[p.name] * 100)
                }
            });
            cursor += p.duration;
        });

        return phases;
    }

    /**
     * 3:1 loading for beginners and ultra athletes, 4:1 for experienced road
     * runners. Taper weeks are never also recovery weeks.
     */
    getRecoveryCadence(inputs, config) {
        if (inputs.fitnessLevel === 'beginner') return 3;
        if (config && config.isUltra) return 3;
        return 4;
    }

    isRecoveryWeek(weekNumber, inputs) {
        const config = RunningDistanceConfigs[(inputs && inputs.goalDistance) || '5k'];
        return weekNumber % this.getRecoveryCadence(inputs || {}, config) === 0;
    }

    /**
     * Week-by-week mileage curve.
     * Loading weeks ramp from a conservative start to the distance peak factor,
     * recovery weeks drop to ~72%, and the taper steps down to a 40-60% cut.
     * A hard 10% week-over-week ceiling is applied on top (research note 2).
     */
    buildVolumeCurve(inputs, phases, config) {
        const base = inputs.currentVolume;
        const level = inputs.fitnessLevel;
        const startFactor = level === 'beginner' ? 0.78 : level === 'advanced' ? 0.90 : 0.84;
        const peakFactor = config.peakFactor * (level === 'beginner' ? 0.94 : level === 'advanced' ? 1.04 : 1.0);
        const cadence = this.getRecoveryCadence(inputs, config);

        const taperPhase = phases.filter(function (p) { return p.name === 'Taper'; })[0];
        const taperStart = taperPhase ? taperPhase.startWeek : phases[phases.length - 1].endWeek + 1;
        const taperLen = taperPhase ? taperPhase.duration : 0;

        // Step-downs as a share of peak, by taper length (research note 6).
        const taperSteps = {
            1: [0.58],
            2: [0.72, 0.52],
            3: [0.82, 0.62, 0.48],
            4: [0.88, 0.72, 0.58, 0.46]
        }[Math.min(4, Math.max(1, taperLen))] || [0.60];

        // Count loading weeks so the ramp is monotone across them.
        const loadWeeks = [];
        for (let w = 1; w < taperStart; w++) {
            if (w % cadence !== 0) loadWeeks.push(w);
        }

        const curve = new Array(inputs.totalWeeks).fill(0);
        let previousLoad = 0;
        let peakLoad = 0;

        // Pass one: the loading block, ramped and capped by the 10% guideline.
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
                // 10% guideline: never jump more than 10% above the last loading week.
                if (previousLoad > 0) volume = Math.min(volume, previousLoad * 1.10);
                previousLoad = volume;
                if (volume > peakLoad) peakLoad = volume;
            }
            curve[w - 1] = Math.round(Math.max(base * 0.25, volume) * 10) / 10;
        }

        // Pass two: the taper steps down from the volume actually reached, so
        // every taper week is genuinely lighter than the peak week.
        if (peakLoad <= 0) peakLoad = base;
        for (let w = taperStart; w <= inputs.totalWeeks; w++) {
            const step = taperSteps[Math.min(taperSteps.length - 1, w - taperStart)];
            curve[w - 1] = Math.round(Math.max(base * 0.2, peakLoad * step) * 10) / 10;
        }

        return curve;
    }

    /**
     * Generate every week of the plan.
     */
    generateAllWeeks(inputs, phases, distanceConfig) {
        this.normalizeInputs(inputs);
        const config = distanceConfig && distanceConfig.longRunShare
            ? distanceConfig
            : RunningDistanceConfigs[inputs.goalDistance];

        const curve = this.buildVolumeCurve(inputs, phases, config);
        const cadence = this.getRecoveryCadence(inputs, config);
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

    /**
     * Build one training week: long run, quality sessions, easy volume and
     * (for ultras) the back-to-back second long day.
     */
    generateWeeklyPlan(weekNumber, phase, isRecovery, inputs, context) {
        const config = (context && context.distanceConfig && context.distanceConfig.longRunShare)
            ? context.distanceConfig
            : RunningDistanceConfigs[inputs.goalDistance];
        const targetMiles = (context && context.weekVolume) || inputs.currentVolume;
        const phaseProgress = (context && typeof context.weekProgress === 'number') ? context.weekProgress : 0.5;
        const isRaceWeek = !!(context && context.isRaceWeek);
        const level = inputs.fitnessLevel;
        const trainingDays = inputs.trainingDays;
        const longDayIndex = this.getDayIndex(inputs.longDay);

        const sessions = isRaceWeek
            ? this.buildRaceWeekSessions(targetMiles, trainingDays, config, level)
            : this.buildSessions({
                weekNumber: weekNumber,
                phase: phase,
                isRecovery: isRecovery,
                inputs: inputs,
                config: config,
                targetMiles: targetMiles,
                phaseProgress: phaseProgress,
                level: level,
                trainingDays: trainingDays
            });

        this.balanceToTarget(sessions, targetMiles);

        const days = [];
        for (let i = 0; i < 7; i++) {
            days.push({
                dayIndex: i,
                dayName: DAYS[i],
                dayShort: DAYS_SHORT[i],
                isRest: false,
                workout: this.runMakeWorkout('REST', 0, level)
            });
        }

        const excluded = isRaceWeek ? [longDayIndex] : [];
        const wantsNextDay = sessions.some(function (s) { return s.slot === 'afterLong'; });
        // In race week the day before the race is reserved for the shakeout.
        const forced = isRaceWeek ? [(longDayIndex + 6) % 7] : [];
        const chosen = this.pickTrainingDays(longDayIndex, trainingDays, wantsNextDay, excluded, forced);
        this.placeSessions(days, sessions, chosen, longDayIndex, level);

        days.forEach(function (d) { d.isRest = d.workout.type === 'REST'; });

        let totalMiles = 0;
        let totalMinutes = 0;
        let easyMiles = 0;
        let hardMiles = 0;
        days.forEach(function (d) {
            totalMiles += d.workout.miles || 0;
            totalMinutes += d.workout.minutes || 0;
            if (d.workout.category === 'easy') easyMiles += d.workout.miles || 0;
            if (d.workout.category === 'hard' || d.workout.category === 'moderate') hardMiles += d.workout.miles || 0;
        });
        totalMiles = Math.round(totalMiles * 10) / 10;

        const measured = totalMiles > 0 ? totalMiles : 1;
        return {
            days: days,
            unit: 'mi',
            totalMiles: totalMiles,
            totalMinutes: totalMinutes,
            // targetVolume is the volume actually scheduled, so peak volume in
            // the summary reflects the real plan rather than an intention.
            targetVolume: totalMiles,
            trainingDayCount: days.filter(function (d) { return !d.isRest; }).length,
            intensitySplit: {
                easyPct: Math.round((easyMiles / measured) * 100),
                hardPct: Math.round((hardMiles / measured) * 100)
            },
            note: isRaceWeek
                ? 'Race week. Race day is ' + DAYS[longDayIndex] + ', so that day is left clear.'
                : (isRecovery ? 'Down week. Same shape, about a third less mileage, so the last block sticks.' : '')
        };
    }

    /**
     * Choose the sessions that make up a normal training week.
     */
    buildSessions(ctx) {
        const phase = ctx.phase;
        const config = ctx.config;
        const level = ctx.level;
        const days = ctx.trainingDays;
        const sessions = [];

        // --- Long run. Held to the distance-specific share of weekly miles and
        // to a minutes cap, whichever binds first (research notes 2 and 3).
        const share = config.longRunShare[phase.name] || 0.30;
        const phaseFactor = {
            Base: 0.55 + 0.20 * ctx.phaseProgress,
            Build: 0.78 + 0.14 * ctx.phaseProgress,
            Peak: 0.92 + 0.08 * ctx.phaseProgress,
            Taper: 0.72 - 0.28 * ctx.phaseProgress
        }[phase.name] || 0.7;

        const minutesCap = config.longRunCapMinutes / RUN_EASY_PACE[level];
        let longMiles = Math.min(
            ctx.targetMiles * share,
            config.longRunPeakMiles * phaseFactor,
            minutesCap
        );
        if (ctx.isRecovery) longMiles *= 0.70;
        longMiles = Math.max(longMiles, Math.min(ctx.targetMiles * 0.18, 4));

        let longType = 'LONG_RUN';
        if (config.isUltra) {
            longType = 'ULTRA_LONG';
        } else if (!ctx.isRecovery && phase.name === 'Peak' && config.distance >= 26.2) {
            longType = 'LONG_RUN_MP';
        } else if (!ctx.isRecovery && phase.name === 'Peak' && config.distance >= 13.1) {
            longType = 'LONG_RUN_FAST_FINISH';
        }
        sessions.push({ type: longType, miles: longMiles, slot: 'long', filler: false });

        // --- Ultra back-to-back long day. A specific-phase tool, not the
        // foundation, so it only appears outside the Base block and needs room
        // in the week (research note 7).
        const wantsB2B = config.backToBack && !ctx.isRecovery && days >= 4 &&
            (phase.name === 'Build' || phase.name === 'Peak');
        if (wantsB2B) {
            const share2 = phase.name === 'Peak' ? 0.55 : 0.45;
            sessions.push({
                type: 'B2B_LONG',
                miles: longMiles * share2,
                slot: 'afterLong',
                filler: false
            });
        }

        // --- Quality sessions.
        const quality = this.qualityCount(phase, level, ctx.isRecovery, days, config, wantsB2B);
        const menu = this.qualityMenu(phase, config, level);
        for (let q = 0; q < quality; q++) {
            // Rotate the menu by week so a phase never repeats one session forever.
            const type = menu[(ctx.weekNumber + q) % menu.length];
            const def = RunWorkoutLibrary[type];
            // A quality session is a slice of the week, never a rival to the long
            // run: that is what keeps the week near the 80/20 split.
            const cap = def.category === 'hard' ? 0.22 : 0.20;
            let miles = Math.min(ctx.targetMiles * cap, config.longRunPeakMiles * 0.6, 12);
            if (ctx.isRecovery) miles *= 0.7;
            sessions.push({
                type: type,
                miles: Math.max(3, miles),
                slot: 'quality',
                filler: false
            });
        }

        // --- Easy volume fills whatever is left of the mileage budget.
        const fillerCount = Math.max(1, days - sessions.length);
        for (let f = 0; f < fillerCount; f++) {
            const afterQuality = quality > 0 && f === 0;
            sessions.push({
                type: afterQuality ? 'RECOVERY_RUN' : (phase.name === 'Taper' ? 'EASY_RUN' : 'EASY_STRIDES'),
                miles: 0,
                slot: 'easy',
                filler: true
            });
        }

        return sessions;
    }

    /**
     * Race week: short, easy, and the long day is left clear for the race.
     */
    buildRaceWeekSessions(targetMiles, trainingDays, config, level) {
        const sessions = [];
        sessions.push({ type: 'SHAKEOUT', miles: Math.min(3, targetMiles * 0.15), slot: 'preRace', filler: false });
        if (trainingDays >= 4) {
            sessions.push({
                type: 'SHARPENER',
                miles: Math.min(5, targetMiles * 0.25),
                slot: 'quality',
                filler: false
            });
        }
        const fillers = Math.max(1, trainingDays - sessions.length);
        for (let f = 0; f < fillers; f++) {
            sessions.push({ type: 'EASY_RUN', miles: 0, slot: 'easy', filler: true });
        }
        return sessions;
    }

    /**
     * How many hard sessions the week can absorb. Two is the recreational
     * baseline in the 80/20 literature; ultras trade intensity for volume.
     */
    qualityCount(phase, level, isRecovery, days, config, hasB2B) {
        if (isRecovery) {
            return (level === 'advanced' && phase.name !== 'Base') ? 1 : 0;
        }
        let q;
        if (phase.name === 'Base') q = level === 'beginner' ? 0 : 1;
        else if (phase.name === 'Taper') q = 1;
        else q = level === 'beginner' ? 1 : 2;

        if (config.isUltra) q = Math.min(q, 1);

        const reserved = 1 + (hasB2B ? 1 : 0) + 1; // long run, back-to-back, at least one easy day
        return Math.max(0, Math.min(q, days - reserved));
    }

    /**
     * The workout menu for a phase. Threshold first, VO2max later, strides and
     * hills through the base (research note 5).
     */
    qualityMenu(phase, config, level) {
        const short = config.distance <= 6.2;
        const mid = config.distance > 6.2 && config.distance <= 26.2;

        if (config.isUltra) {
            if (phase.name === 'Base') return ['VERT', 'FARTLEK'];
            if (phase.name === 'Build') return ['VERT', 'TEMPO'];
            if (phase.name === 'Peak') return ['TEMPO', 'VERT'];
            return ['TEMPO'];
        }
        if (phase.name === 'Base') {
            return level === 'beginner' ? ['FARTLEK'] : ['HILLS', 'FARTLEK'];
        }
        if (phase.name === 'Build') {
            return short ? ['TEMPO', 'HILLS'] : ['TEMPO', 'CRUISE'];
        }
        if (phase.name === 'Peak') {
            if (short) return ['INTERVALS', 'TEMPO'];
            if (mid) return ['CRUISE', 'RACE_PACE'];
            return ['TEMPO', 'RACE_PACE'];
        }
        return ['SHARPENER'];
    }

    /**
     * Force the scheduled miles to land on the weekly budget. Fixed sessions
     * keep their shape; the easy runs absorb the difference. If that is not
     * enough, everything scales together so the budget is never missed.
     */
    balanceToTarget(sessions, targetMiles) {
        const fixed = sessions.filter(function (s) { return !s.filler; });
        const fillers = sessions.filter(function (s) { return s.filler; });
        const sumFixed = function () {
            return fixed.reduce(function (a, s) { return a + s.miles; }, 0);
        };

        const minFiller = Math.max(1.5, Math.min(3, targetMiles * 0.06));
        let fixedTotal = sumFixed();
        let budget = targetMiles - fixedTotal;

        if (fillers.length > 0 && budget < fillers.length * minFiller) {
            const allowed = Math.max(targetMiles * 0.3, targetMiles - fillers.length * minFiller);
            const k = fixedTotal > 0 ? allowed / fixedTotal : 1;
            fixed.forEach(function (s) { s.miles = s.miles * k; });
            fixedTotal = sumFixed();
            budget = Math.max(fillers.length * minFiller, targetMiles - fixedTotal);
        }

        if (fillers.length > 0) {
            const per = budget / fillers.length;
            fillers.forEach(function (s) { s.miles = per; });
        } else if (fixedTotal > 0) {
            const k = targetMiles / fixedTotal;
            fixed.forEach(function (s) { s.miles = s.miles * k; });
        }

        // Round to a tenth and push the rounding residual onto the biggest run.
        sessions.forEach(function (s) { s.miles = Math.max(1, Math.round(s.miles * 10) / 10); });
        let total = sessions.reduce(function (a, s) { return a + s.miles; }, 0);
        let residual = Math.round((targetMiles - total) * 10) / 10;
        if (Math.abs(residual) >= 0.1) {
            let biggest = sessions[0];
            sessions.forEach(function (s) { if (s.miles > biggest.miles) biggest = s; });
            biggest.miles = Math.max(1, Math.round((biggest.miles + residual) * 10) / 10);
        }

        // A filler that has grown past the long run reads better as a medium-long run.
        const longest = sessions.reduce(function (a, s) { return Math.max(a, s.miles); }, 0);
        sessions.forEach(function (s) {
            if (s.filler && s.miles >= Math.max(10, longest * 0.75)) s.type = 'MEDIUM_LONG';
        });
    }

    // ------------------------------------------------------------------
    // Scheduling
    // ------------------------------------------------------------------

    /**
     * Pick which days of the week are training days, spread as evenly as the
     * requested day count allows, with the long day always included.
     */
    pickTrainingDays(longDayIndex, trainingDays, wantsNextDay, excluded, forced) {
        const blocked = excluded || [];
        const isBlocked = function (d) { return blocked.indexOf(d) >= 0; };
        const chosen = [];

        if (!isBlocked(longDayIndex)) chosen.push(longDayIndex);
        if (wantsNextDay && chosen.length < trainingDays) {
            const next = (longDayIndex + 1) % 7;
            if (!isBlocked(next) && chosen.indexOf(next) < 0) chosen.push(next);
        }
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

    /**
     * Put each session on a day: long run on the long day, back-to-back the
     * morning after, quality sessions as far from the long run and from each
     * other as the week allows, easy runs everywhere else.
     */
    placeSessions(days, sessions, chosen, longDayIndex, level) {
        const available = chosen.slice();
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
        const assign = function (session, dayIndex, self) {
            if (dayIndex < 0) return;
            days[dayIndex].workout = self.runMakeWorkout(
                session.type,
                session.miles,
                level,
                { details: self.runSessionDetails(session.type, session.miles, level) }
            );
            placed.push(dayIndex);
        };

        const longSession = sessions.filter(function (s) { return s.slot === 'long'; })[0];
        if (longSession) assign(longSession, take(longDayIndex), this);

        const preRace = sessions.filter(function (s) { return s.slot === 'preRace'; })[0];
        if (preRace) assign(preRace, take((longDayIndex + 6) % 7), this);

        const b2b = sessions.filter(function (s) { return s.slot === 'afterLong'; })[0];
        if (b2b) assign(b2b, take((longDayIndex + 1) % 7), this);

        const quality = sessions.filter(function (s) { return s.slot === 'quality'; });
        quality.forEach(function (session) {
            let best = -1;
            let bestScore = -1;
            available.forEach(function (d) {
                let score = distance(d, longDayIndex);
                placed.forEach(function (p) { score = Math.min(score, distance(d, p)); });
                if (score > bestScore) { bestScore = score; best = d; }
            });
            assign(session, take(best), this);
        }, this);

        const easy = sessions.filter(function (s) {
            return s.slot !== 'long' && s.slot !== 'afterLong' && s.slot !== 'quality' && s.slot !== 'preRace';
        });
        easy.forEach(function (session) {
            assign(session, take(available[0] !== undefined ? available[0] : -1), this);
        }, this);
    }

    // ------------------------------------------------------------------
    // Workout objects
    // ------------------------------------------------------------------

    runMakeWorkout(type, miles, level, extra) {
        const def = RunWorkoutLibrary[type] || RunWorkoutLibrary.EASY_RUN;
        const options = extra || {};

        if (type === 'REST') {
            return {
                type: 'REST',
                name: def.name,
                miles: 0,
                minutes: 0,
                duration: '-',
                distance: '',
                rpe: def.rpe,
                intensity: def.intensity,
                purpose: def.purpose,
                category: def.category,
                note: options.note || '',
                details: options.details || ''
            };
        }

        const m = Math.max(1, Math.round((miles || 0) * 10) / 10);
        const pace = RUN_EASY_PACE[level] || RUN_EASY_PACE.intermediate;
        const minutes = Math.max(10, Math.round(m * pace * (RUN_PACE_FACTOR[def.pace] || 1)));

        return {
            type: type,
            name: def.name,
            miles: m,
            minutes: minutes,
            duration: this.formatDuration(minutes),
            distance: m.toFixed(1) + ' mi',
            rpe: def.rpe,
            intensity: def.intensity,
            purpose: def.purpose,
            category: def.category,
            note: options.note || '',
            details: options.details || ''
        };
    }

    /**
     * One concrete line describing how to run the session.
     */
    runSessionDetails(type, miles, level) {
        const m = Math.max(1, Math.round((miles || 0) * 10) / 10);
        const clamp = function (v, lo, hi) { return Math.max(lo, Math.min(hi, v)); };

        switch (type) {
            case 'INTERVALS':
                return clamp(Math.round(m * 0.5), 4, 8) + ' x 1000m at 5K to 10K effort with 2 min jog, inside ' + m.toFixed(1) + ' mi total';
            case 'TEMPO':
                return clamp(Math.round(m * 0.5), 2, 8).toFixed(0) + ' mi continuous at comfortably hard effort, warm up and cool down either side';
            case 'CRUISE':
                return clamp(Math.round(m * 0.35), 3, 6) + ' x 1 mi at threshold with 60 seconds easy float between';
            case 'HILLS':
                return clamp(Math.round(m * 1.2), 6, 12) + ' x 60 to 90 seconds hard uphill, jog the descent';
            case 'FARTLEK':
                return clamp(Math.round(m * 0.8), 5, 10) + ' x 2 minutes quicker with 2 minutes easy between, all by feel';
            case 'RACE_PACE':
                return clamp(Math.round(m * 0.6), 2, 10).toFixed(0) + ' mi at goal race effort in the middle of the run';
            case 'SHARPENER':
                return '2 x 1 mi at goal race effort with full recovery, then stop while it still feels easy';
            case 'LONG_RUN_MP':
                return clamp(Math.round(m * 0.35), 3, 12) + ' mi of the long run at goal race pace, split into two or three blocks';
            case 'LONG_RUN_FAST_FINISH':
                return 'Easy for the first two thirds, then the last third at goal race effort';
            case 'ULTRA_LONG':
                return 'Practise race fuelling from the first hour: 60 to 90g of carbs an hour, plus the kit you plan to carry';
            case 'B2B_LONG':
                return 'Run this the morning after the long run, all easy, and eat the same way you plan to race';
            case 'VERT':
                return 'Climb-focused: aim for ' + (clamp(Math.round(m * 200), 800, 6000)) + ' ft of vert and hike the steep pitches on purpose';
            case 'EASY_STRIDES':
                return 'Easy miles, then 6 x 20 seconds relaxed and quick with a full walk back';
            case 'MEDIUM_LONG':
                return 'A steady aerobic run, comfortably slower than any race pace the whole way';
            case 'SHAKEOUT':
                return 'Very easy, plus three or four 20 second strides to wake the legs up';
            case 'RECOVERY_RUN':
                return 'Slower than you think it should be. This run exists to recover, not to train';
            default:
                return 'Conversational effort the whole way';
        }
    }

    // ------------------------------------------------------------------
    // Summary
    // ------------------------------------------------------------------

    generateSummary(inputs, phases, weeks) {
        const config = RunningDistanceConfigs[inputs.goalDistance];
        let totalVolume = 0;
        let peakVolume = 0;
        let recoveryWeeks = 0;

        weeks.forEach(function (w) {
            totalVolume += w.targetVolume || 0;
            if ((w.targetVolume || 0) > peakVolume) peakVolume = w.targetVolume;
            if (w.isRecovery) recoveryWeeks += 1;
        });

        const notes = [];
        if (inputs.weeksAdjusted) {
            notes.push('You asked for ' + inputs.weeksRequested + ' weeks. A ' + config.name +
                ' build works between ' + config.minWeeks + ' and ' + config.maxWeeks +
                ' weeks, so this plan runs ' + inputs.totalWeeks + '.');
        }
        notes.push('Volume is in miles per week. Roughly ' +
            Math.round(config.easyShareByPhase.Build * 100) +
            '% of it stays easy, which is where the fitness actually comes from.');

        return {
            totalWeeks: weeks.length,
            totalVolume: Math.round(totalVolume),
            peakVolume: Math.round(peakVolume * 10) / 10,
            recoveryWeeks: recoveryWeeks,
            unit: 'mi',
            volumeUnit: 'miles per week',
            recoveryCadence: this.getRecoveryCadence(inputs, config),
            weeksRequested: inputs.weeksRequested || inputs.totalWeeks,
            weeksAdjusted: !!inputs.weeksAdjusted,
            trainingDays: inputs.trainingDays,
            longRunDay: inputs.longDay,
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
}

// Export for use
window.RunningPlanGenerator = RunningPlanGenerator;
window.RunningDistanceConfigs = RunningDistanceConfigs;
window.RunWorkoutLibrary = RunWorkoutLibrary;
