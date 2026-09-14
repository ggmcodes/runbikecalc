/**
 * Cycling Training Plan Generator
 * =============================================================================
 * Produces a periodized, FTP-anchored road/gran-fondo plan built from ride TYPES
 * (recovery spin, endurance, tempo, sweet spot, threshold, VO2, climbing, long
 * ride) whose mix shifts by phase. Volume is always expressed in HOURS per week.
 *
 * Research the parameters below are synthesised from (no text is copied):
 *
 *  - Coggan 7-level power zones (Z1 <55% FTP, Z2 56-75%, Z3 tempo 76-87%,
 *    sweet spot 88-94%, Z4 threshold 95-105%, Z5 VO2 106-120%, Z6 >120%).
 *    trainingpeaks.com/blog/power-training-levels/
 *    trainerroad.com/blog/cycling-power-zones-training-zones-explained/
 *  - Base/Build/Peak/Taper macro->meso structure and the 3:1 vs 4:1 loading
 *    cycle (3-week cycle for newer/older athletes, 4-week for experienced).
 *    trainingpeaks.com/blog/macrocycles-mesocycles-and-microcycles-understanding-the-3-cycles-of-periodization/
 *    help.trainingpeaks.com/hc/en-us/articles/224662768-Annual-Training-Plan-Methodologies
 *  - Intensity distribution: ~80% of weekly TIME below ~75% FTP, ~20% at
 *    threshold/VO2/long tempo; polarized/pyramidal base with targeted 4-6 week
 *    sweet-spot build blocks for time-limited riders (6-10 h/wk amateurs).
 *    rouvy.com/blog/polarized-training-cycling
 *    roadmancycling.com/blog/polarised-vs-sweet-spot-training
 *  - Weekly ramp: 5-10% per week for experienced athletes; injury risk climbs
 *    sharply past ~15%/wk. Progression is not linear - load weeks are punctuated
 *    by reduced weeks.
 *    fasterskier.com/2025/05/progressive-overload-and-ramp-rate-in-endurance-training/
 *    trainright.com/how-to-determine-weekly-run-training-volume/
 *  - Long ride: reaches 4-5 h in the build phase for a century; longest ride
 *    ~70-80 miles completed at least two weeks out; riding the full 100 in
 *    training adds fatigue without benefit. Beginners 5-7 h/wk, intermediates
 *    7-10 h/wk at peak.
 *    trainingpeaks.com/blog/best-cycling-training-plans-for-centuries-and-grand-fondos/
 *    trainerroad.com/blog/how-to-prepare-for-and-ride-your-first-century/
 *  - Gran fondo: replicate the event's climbing profile - if the event has
 *    30-minute climbs, train 30-minute climbs; emphasis on sustained power over
 *    varied terrain rather than short punchy work.
 *    roadmancycling.com/blog/gran-fondo-training-plan-12-weeks
 *  - Multi-day events: reconfigure the week into back-to-back blocks; a tour is
 *    2-3x a normal weekly load, so consecutive-day riding (Sat+Sun) is the
 *    specific adaptation, with endurance volume favoured over intensity.
 *    trainright.com/crushing-multi-day-cycling-tours-amateur-stage-race/
 *    trainingpeaks.com/blog/training-plan-multi-day-cycling-tour/
 *  - Taper: 1-2 weeks, cut duration by ~40-60% while holding intensity and
 *    frequency; space the remaining hard efforts 2-3 days apart.
 *    fascatcoaching.com/blogs/training-tips/tapering-in-cycling-for-peak-performance/
 *    trainerroad.com/blog/tapering-and-peaking-for-cyclists-be-ready-for-race-day/
 * =============================================================================
 */

// ---------------------------------------------------------------------------
// Event configurations. Keys, and the getDistanceConfigs() shape, are part of
// the public contract (form values + shared plan links depend on them).
// weeklyVolumeTargets are HOURS per week at peak, by rider level.
// ---------------------------------------------------------------------------
const CyclingDistanceConfigs = {
    '25mi': {
        name: '25 Miles',
        distance: 25,
        minWeeks: 4,
        optimalWeeks: 6,
        maxWeeks: 10,
        taperWeeks: 1,
        longRidePeakHours: 1.75,
        keyWorkouts: ['ENDURANCE_RIDE', 'SWEET_SPOT', 'TEMPO_RIDE'],
        weeklyVolumeTargets: { beginner: 4, intermediate: 6, advanced: 8 },
        description: 'Build steady aerobic fitness and comfort for a 25-mile ride'
    },
    '50mi': {
        name: '50 Miles (Half Century)',
        distance: 50,
        minWeeks: 6,
        optimalWeeks: 8,
        maxWeeks: 12,
        taperWeeks: 1,
        longRidePeakHours: 2.75,
        keyWorkouts: ['ENDURANCE_RIDE', 'SWEET_SPOT', 'TEMPO_RIDE'],
        weeklyVolumeTargets: { beginner: 5, intermediate: 8, advanced: 10 },
        description: 'Extend endurance and sustainable power for a half century'
    },
    '62mi': {
        name: '62 Miles (Metric Century / 100km)',
        distance: 62,
        minWeeks: 8,
        optimalWeeks: 10,
        maxWeeks: 14,
        taperWeeks: 1,
        longRidePeakHours: 3.25,
        keyWorkouts: ['ENDURANCE_RIDE', 'SWEET_SPOT', 'THRESHOLD'],
        weeklyVolumeTargets: { beginner: 6, intermediate: 9, advanced: 12 },
        description: 'Train the aerobic engine and fuelling for a metric century'
    },
    '75mi': {
        name: '75 Miles',
        distance: 75,
        minWeeks: 8,
        optimalWeeks: 12,
        maxWeeks: 16,
        taperWeeks: 1,
        longRidePeakHours: 4,
        keyWorkouts: ['ENDURANCE_RIDE', 'SWEET_SPOT', 'THRESHOLD'],
        weeklyVolumeTargets: { beginner: 7, intermediate: 10, advanced: 14 },
        description: 'Build the long-ride durability that 75 miles demands'
    },
    '100mi': {
        name: '100 Miles (Century)',
        distance: 100,
        minWeeks: 10,
        optimalWeeks: 14,
        maxWeeks: 20,
        taperWeeks: 1,
        // Longest training ride tops out near 4.5-5h (~70-80 miles), not 100.
        longRidePeakHours: 5,
        keyWorkouts: ['ENDURANCE_RIDE', 'SWEET_SPOT', 'TEMPO_RIDE', 'THRESHOLD'],
        weeklyVolumeTargets: { beginner: 8, intermediate: 12, advanced: 16 },
        description: 'Progress the long ride toward 4-5 hours for a full century'
    },
    'granfondo': {
        name: 'Gran Fondo (Hilly 100+ miles)',
        distance: 100,
        minWeeks: 12,
        optimalWeeks: 16,
        maxWeeks: 24,
        taperWeeks: 2,
        longRidePeakHours: 6,
        keyWorkouts: ['ENDURANCE_RIDE', 'CLIMBING', 'SWEET_SPOT', 'THRESHOLD'],
        weeklyVolumeTargets: { beginner: 10, intermediate: 14, advanced: 18 },
        climbingFocus: true,
        description: 'Sustained climbing power and long-day durability for a hilly fondo'
    },
    'multiday': {
        name: 'Multi-Day Event (Stage Race)',
        distance: 200,
        minWeeks: 14,
        optimalWeeks: 20,
        maxWeeks: 28,
        taperWeeks: 2,
        longRidePeakHours: 5,
        keyWorkouts: ['ENDURANCE_RIDE', 'SWEET_SPOT', 'RECOVERY_RIDE'],
        weeklyVolumeTargets: { beginner: 10, intermediate: 14, advanced: 20 },
        backToBack: true,
        description: 'Back-to-back riding blocks so consecutive hard days feel normal'
    }
};

// ---------------------------------------------------------------------------
// Ride library. `zone` is Coggan-anchored so the rider knows the target.
// `category` drives the UI colour (easy | moderate | hard) and `intensity`
// drives the weekly intensity-distribution accounting.
// ---------------------------------------------------------------------------
const CyclingRideLibrary = {
    LONG_RIDE: {
        type: 'ENDURANCE_RIDE', name: 'Long Ride', sport: 'bike',
        zone: 'Z2 (56-75% FTP)', rpe: '3-4', category: 'easy', intensity: 'easy',
        natural: 3, min: 0.75,
        purpose: 'Build aerobic durability and practise event-day fuelling'
    },
    BACK_TO_BACK: {
        type: 'ENDURANCE_RIDE', name: 'Back-to-Back Ride', sport: 'bike',
        zone: 'Z2 (56-75% FTP)', rpe: '4-5', category: 'easy', intensity: 'easy',
        natural: 2, min: 0.5,
        purpose: 'Ride a second long day on tired legs to rehearse stage racing'
    },
    ENDURANCE: {
        type: 'ENDURANCE_RIDE', name: 'Endurance Ride', sport: 'bike',
        zone: 'Z2 (56-75% FTP)', rpe: '3-4', category: 'easy', intensity: 'easy',
        natural: 1.2, min: 0.5,
        purpose: 'Accumulate low-stress aerobic time that drives most adaptation'
    },
    RECOVERY_SPIN: {
        type: 'RECOVERY_RIDE', name: 'Recovery Spin', sport: 'bike',
        zone: 'Z1 (<55% FTP)', rpe: '2', category: 'easy', intensity: 'easy',
        natural: 0.75, min: 0.33,
        purpose: 'Easy high-cadence spin to promote blood flow without adding load'
    },
    TEMPO: {
        type: 'TEMPO_RIDE', name: 'Tempo Ride', sport: 'bike',
        zone: 'Z3 (76-87% FTP)', rpe: '5-6', category: 'moderate', intensity: 'moderate',
        natural: 1.4, min: 0.5,
        purpose: 'Steady muscular endurance at a pace you could hold for hours'
    },
    SWEET_SPOT: {
        type: 'SWEET_SPOT', name: 'Sweet Spot Intervals', sport: 'bike',
        zone: '88-94% FTP', rpe: '6-7', category: 'moderate', intensity: 'moderate',
        natural: 1.25, min: 0.5,
        purpose: 'Time-efficient threshold-adjacent work: 3-4 x 12-20 min'
    },
    THRESHOLD: {
        type: 'TEMPO_RIDE', name: 'Threshold Intervals', sport: 'bike',
        zone: 'Z4 (95-105% FTP)', rpe: '7-8', category: 'hard', intensity: 'hard',
        natural: 1.15, min: 0.5,
        purpose: 'Raise FTP with 2-3 x 10-20 min at your one-hour power'
    },
    VO2: {
        type: 'VO2_INTERVALS', name: 'VO2 Max Intervals', sport: 'bike',
        zone: 'Z5 (106-120% FTP)', rpe: '9', category: 'hard', intensity: 'hard',
        natural: 1, min: 0.5,
        purpose: 'Lift the aerobic ceiling with 5-6 x 3 min hard, equal recovery'
    },
    CLIMBING_TEMPO: {
        type: 'CLIMBING', name: 'Sustained Climb', sport: 'bike',
        zone: 'Z3 (76-87% FTP) seated climbing', rpe: '6', category: 'moderate', intensity: 'moderate',
        natural: 1.5, min: 0.5,
        purpose: 'Long seated climbs that mirror the event profile'
    },
    CLIMBING_REPEATS: {
        type: 'CLIMBING', name: 'Climbing Repeats', sport: 'bike',
        zone: '88-105% FTP on gradient', rpe: '7-8', category: 'hard', intensity: 'hard',
        natural: 1.4, min: 0.5,
        purpose: 'Repeat the climb length your event actually contains'
    },
    OPENERS: {
        type: 'VO2_INTERVALS', name: 'Race Openers', sport: 'bike',
        zone: 'Z5 bursts inside an easy ride', rpe: '5 with short 9s', category: 'moderate', intensity: 'moderate',
        natural: 0.8, min: 0.4,
        purpose: 'Short sharp efforts that keep you sharp without adding fatigue'
    },
    REST: {
        type: 'REST', name: 'Rest Day', sport: 'rest',
        zone: 'Off the bike', rpe: '0', category: 'rest', intensity: 'rest',
        natural: 0, min: 0,
        purpose: 'Complete rest - adaptation happens now, not on the bike'
    }
};

/**
 * Cycling Plan Generator - extends TrainingPlanGenerator
 */
class CyclingPlanGenerator extends TrainingPlanGenerator {
    constructor(formId = 'training-plan-form', resultId = 'training-plan-result') {
        super(formId, resultId, 'cycling');
    }

    getDistanceConfigs() {
        return CyclingDistanceConfigs;
    }

    // -----------------------------------------------------------------------
    // Input handling
    // -----------------------------------------------------------------------

    /**
     * Normalise the form payload. The cycling form posts `fitnessLevel`,
     * `weeklyHours`, `trainingDays`, `longRideDay`; older shared links and the
     * generic base class use `experienceLevel`, `currentVolume`, `longDay`.
     * Accept all of them so a stale link never yields an empty plan.
     */
    normalizeInputs(inputs) {
        const levels = ['beginner', 'intermediate', 'advanced'];
        let level = String(inputs.fitnessLevel || inputs.experienceLevel || 'intermediate').toLowerCase();
        if (levels.indexOf(level) === -1) level = 'intermediate';
        inputs.fitnessLevel = level;
        inputs.experienceLevel = level;

        let days = parseInt(inputs.trainingDays, 10);
        if (!isFinite(days)) days = 4;
        inputs.trainingDays = Math.min(7, Math.max(3, days));

        let hours = parseFloat(inputs.weeklyHours);
        if (!isFinite(hours) || hours <= 0) hours = parseFloat(inputs.currentVolume);
        if (!isFinite(hours) || hours <= 0) hours = 8;
        inputs.weeklyHours = Math.min(30, Math.max(3, hours));
        inputs.currentVolume = inputs.weeklyHours;

        const day = String(inputs.longRideDay || inputs.longDay || 'saturday').toLowerCase();
        inputs.longRideDay = day;
        inputs.longDay = day;

        return inputs;
    }

    validateInputs(inputs) {
        this.normalizeInputs(inputs);

        const requested = inputs.weeksUntilRace || inputs.weeks || inputs.totalWeeks;
        if (!requested && !inputs.eventDate && !inputs.raceDate) {
            throw new Error('Please enter an event date or weeks until your event');
        }
        const configs = this.getDistanceConfigs();
        const key = inputs.goalDistance || inputs.distance;
        if (key && !configs[key]) {
            throw new Error('Invalid event selected');
        }
        return true;
    }

    // -----------------------------------------------------------------------
    // Periodization
    // -----------------------------------------------------------------------

    /**
     * Recovery cadence: 3:1 for newer riders, 4:1 for experienced riders.
     * Exposed on the summary so the plan can explain itself.
     */
    getRecoveryCadence(fitnessLevel) {
        return fitnessLevel === 'advanced' ? 4 : 3;
    }

    /**
     * Build Base / Build / Peak / Taper. Phases are contiguous and always sum
     * to inputs.totalWeeks, so every week belongs to exactly one phase.
     */
    calculatePhases(inputs, distanceConfig) {
        this.normalizeInputs(inputs);

        // Clamp the requested block to what the event can actually support.
        const requested = parseInt(inputs.weeksUntilRace || inputs.weeks || inputs.totalWeeks, 10) ||
            distanceConfig.optimalWeeks;
        const min = distanceConfig.minWeeks;
        const max = distanceConfig.maxWeeks;
        const totalWeeks = Math.min(max, Math.max(min, requested));

        inputs.requestedWeeks = requested;
        inputs.totalWeeks = totalWeeks;
        inputs.weeksAdjusted = totalWeeks !== requested;
        inputs.supportedMinWeeks = min;
        inputs.supportedMaxWeeks = max;

        // Taper: 1 week for shorter events, 2 for fondo/multi-day. Never eat
        // more than what leaves a real Base/Build/Peak behind.
        let taperWeeks = distanceConfig.taperWeeks || 1;
        taperWeeks = Math.max(1, Math.min(taperWeeks, totalWeeks - 3));

        const remaining = totalWeeks - taperWeeks;
        // Endurance-first split: the base is the largest block for mass-start
        // road events, peak is the shortest and sharpest.
        let baseWeeks = Math.max(1, Math.round(remaining * 0.40));
        let buildWeeks = Math.max(1, Math.round(remaining * 0.35));
        let peakWeeks = remaining - baseWeeks - buildWeeks;

        if (peakWeeks < 1) {
            peakWeeks = 1;
            if (baseWeeks >= buildWeeks && baseWeeks > 1) baseWeeks = remaining - buildWeeks - peakWeeks;
            else if (buildWeeks > 1) buildWeeks = remaining - baseWeeks - peakWeeks;
            else baseWeeks = remaining - buildWeeks - peakWeeks;
        }
        if (baseWeeks < 1) { baseWeeks = 1; peakWeeks = remaining - baseWeeks - buildWeeks; }
        if (buildWeeks < 1) { buildWeeks = 1; peakWeeks = remaining - baseWeeks - buildWeeks; }

        const climbing = distanceConfig.climbingFocus ? ' with climbing-specific work' : '';
        const stage = distanceConfig.backToBack ? ' and consecutive-day blocks' : '';

        const phases = [
            {
                name: 'Base',
                label: 'Base Building',
                duration: baseWeeks,
                volumeRange: { start: 0.72, end: 0.88 },
                qualityShare: 0.15,
                description: 'Mostly Z2 riding to build the aerobic engine' + stage +
                    '. Roughly 90% of weekly time stays below 75% FTP.'
            },
            {
                name: 'Build',
                label: 'Build Phase',
                duration: buildWeeks,
                volumeRange: { start: 0.88, end: 1.0 },
                qualityShare: 0.28,
                description: 'Sweet spot and threshold blocks' + climbing +
                    ' layered onto a still-growing long ride.'
            },
            {
                name: 'Peak',
                label: 'Peak Phase',
                duration: peakWeeks,
                volumeRange: { start: 1.0, end: 1.0 },
                qualityShare: 0.32,
                description: 'Longest rides of the plan plus event-specific intensity' +
                    climbing + '. Volume holds, sharpness rises.'
            },
            {
                name: 'Taper',
                label: 'Race Taper',
                duration: taperWeeks,
                volumeRange: { start: 0.60, end: 0.42 },
                qualityShare: 0.20,
                description: 'Duration drops 40-60% while intensity and ride frequency hold, ' +
                    'so you arrive fresh but not flat.'
            }
        ];

        let startWeek = 1;
        phases.forEach(p => {
            p.startWeek = startWeek;
            p.endWeek = startWeek + p.duration - 1;
            startWeek += p.duration;
        });

        return phases;
    }

    /**
     * Weekly hours curve. Ramps within each phase, drops on recovery weeks, and
     * is capped so no load week rises more than 10% over the previous one.
     */
    generateAllWeeks(inputs, phases, distanceConfig) {
        this.normalizeInputs(inputs);

        const budget = inputs.weeklyHours;
        const cadence = this.getRecoveryCadence(inputs.fitnessLevel);
        const weeks = [];
        let currentWeek = 1;
        let lastLoadVolume = 0;

        for (const phase of phases) {
            for (let i = 0; i < phase.duration; i++) {
                const weekProgress = phase.duration > 1 ? i / (phase.duration - 1) : 0;
                const isTaper = phase.name === 'Taper';
                // Recovery weeks never land in the taper - the taper is already a
                // reduced block, and a double reduction leaves the rider flat.
                const isRecovery = !isTaper && currentWeek % cadence === 0;

                let multiplier = phase.volumeRange.start +
                    (phase.volumeRange.end - phase.volumeRange.start) * weekProgress;
                let weekVolume = budget * multiplier;

                if (isRecovery) {
                    weekVolume *= 0.62;
                } else if (!isTaper && lastLoadVolume > 0) {
                    // 5-10% ramp guidance: never jump more than 10% week over week.
                    weekVolume = Math.min(weekVolume, lastLoadVolume * 1.10);
                }

                weekVolume = Math.max(1, Math.round(weekVolume * 10) / 10);
                if (!isRecovery && !isTaper) lastLoadVolume = weekVolume;

                const week = this.generateWeeklyPlan(currentWeek, phase, isRecovery, inputs, {
                    weekVolume,
                    distanceConfig,
                    weekProgress,
                    totalWeeks: inputs.totalWeeks
                });

                weeks.push(Object.assign({
                    weekNumber: currentWeek,
                    phase: phase.name,
                    phaseLabel: phase.label,
                    isRecovery,
                    targetVolume: weekVolume
                }, week));

                currentWeek++;
            }
        }

        return weeks;
    }

    // -----------------------------------------------------------------------
    // Week construction
    // -----------------------------------------------------------------------

    generateWeeklyPlan(weekNumber, phase, isRecovery, inputs, context) {
        const { weekVolume, distanceConfig, weekProgress } = context;
        const trainingDays = inputs.trainingDays;

        const sessions = this.planWeekSessions(phase, isRecovery, inputs, distanceConfig, weekVolume, weekProgress);
        const allocated = this.allocateSessionHours(sessions, weekVolume);

        const days = [];
        for (let i = 0; i < 7; i++) {
            days.push({
                dayIndex: i,
                dayName: DAYS[i],
                dayShort: DAYS_SHORT[i],
                workout: null
            });
        }

        this.assignSessionsToDays(days, allocated, this.getDayIndex(inputs.longRideDay));

        days.forEach(day => {
            if (!day.workout) day.workout = this.buildWorkout(CyclingRideLibrary.REST, 0, '');
        });

        const totalMinutes = days.reduce((sum, d) => sum + (d.workout.minutes || 0), 0);
        const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

        return {
            days,
            totalHours,
            totalMinutes,
            sessionCount: allocated.length,
            trainingDays,
            longestRide: Math.max.apply(null, allocated.map(s => s.hours).concat([0])),
            intensityDistribution: this.summariseIntensity(days, totalMinutes),
            focus: this.weekFocus(phase, isRecovery, distanceConfig)
        };
    }

    /**
     * Choose the ride types for one week. Exactly `trainingDays` sessions are
     * produced, so the plan can never exceed the rider's stated availability.
     */
    planWeekSessions(phase, isRecovery, inputs, distanceConfig, weekVolume, weekProgress) {
        const lib = CyclingRideLibrary;
        const N = inputs.trainingDays;
        const level = inputs.fitnessLevel;
        const sessions = [];

        // --- 1. The long ride anchors the week -----------------------------
        const longHours = this.calculateLongRideHours(phase, isRecovery, inputs, distanceConfig, weekVolume, weekProgress);
        sessions.push({
            def: lib.LONG_RIDE,
            desired: longHours,
            min: lib.LONG_RIDE.min,
            slot: 'long',
            note: distanceConfig.climbingFocus
                ? 'Ride the hilliest route you can reach and stay seated on the climbs'
                : 'Steady Z2, eat 60-90g carbohydrate per hour from the first hour'
        });
        let remaining = N - 1;

        // --- 2. Multi-day events: a second long day on tired legs ----------
        const wantsBackToBack = distanceConfig.backToBack && !isRecovery &&
            phase.name !== 'Taper' && N >= 4;
        if (wantsBackToBack && remaining > 0) {
            sessions.push({
                def: lib.BACK_TO_BACK,
                desired: longHours * 0.6,
                min: lib.BACK_TO_BACK.min,
                slot: 'afterLong',
                note: 'Day two of the block - start easy, this is the whole point'
            });
            remaining--;
        }

        // --- 3. Quality rides ----------------------------------------------
        let qualitySlots = this.qualitySlotCount(phase, isRecovery, N, level, distanceConfig);
        qualitySlots = Math.min(qualitySlots, Math.max(0, remaining - 1));

        const qualityKeys = this.selectQualityRides(phase, level, distanceConfig, qualitySlots);
        const qualityBudget = weekVolume * (isRecovery ? 0 : phase.qualityShare) *
            (distanceConfig.backToBack ? 0.75 : 1);
        const naturalSum = qualityKeys.reduce((s, k) => s + lib[k].natural, 0) || 1;

        qualityKeys.forEach((key, idx) => {
            const def = lib[key];
            sessions.push({
                def,
                desired: qualityBudget * (def.natural / naturalSum),
                min: def.min,
                slot: idx === 0 ? 'quality1' : 'quality2',
                note: this.qualityNote(key, distanceConfig)
            });
            remaining--;
        });

        // --- 4. Fill the rest with aerobic riding ---------------------------
        for (let i = 0; i < remaining; i++) {
            const useSpin = isRecovery ? i >= 1 : (N >= 5 && i === remaining - 1);
            const def = useSpin ? lib.RECOVERY_SPIN : lib.ENDURANCE;
            sessions.push({
                def,
                desired: def.natural,
                min: def.min,
                slot: 'easy',
                note: useSpin
                    ? 'Keep it genuinely easy - cadence high, power low'
                    : 'Conversational pace, nose-breathing effort'
            });
        }

        return sessions;
    }

    qualitySlotCount(phase, isRecovery, N, level, distanceConfig) {
        if (isRecovery) return 0;
        if (phase.name === 'Taper') return 1;
        if (N <= 3) {
            return (phase.name === 'Base' && level === 'beginner') ? 0 : 1;
        }
        if (N === 4) return 1;
        if (phase.name === 'Base') return level === 'advanced' ? 2 : 1;
        return 2;
    }

    /**
     * Intensity shifts by phase: tempo/sweet spot in base, sweet spot and
     * threshold in build, threshold/VO2 (or event-specific climbing) at peak,
     * and short openers only in the taper.
     */
    selectQualityRides(phase, level, distanceConfig, slots) {
        if (slots <= 0) return [];
        const climb = !!distanceConfig.climbingFocus;
        const keys = [];

        switch (phase.name) {
            case 'Base':
                keys.push(climb ? 'CLIMBING_TEMPO' : 'TEMPO');
                if (level !== 'beginner') keys.push('SWEET_SPOT');
                break;
            case 'Build':
                keys.push('SWEET_SPOT');
                keys.push(climb ? 'CLIMBING_REPEATS' : 'THRESHOLD');
                break;
            case 'Peak':
                keys.push(climb ? 'CLIMBING_REPEATS' : 'THRESHOLD');
                keys.push(level === 'beginner' ? 'SWEET_SPOT' : 'VO2');
                break;
            case 'Taper':
            default:
                keys.push('OPENERS');
                keys.push('SWEET_SPOT');
                break;
        }

        while (keys.length < slots) keys.push('SWEET_SPOT');
        return keys.slice(0, slots);
    }

    qualityNote(key, distanceConfig) {
        const notes = {
            TEMPO: 'One or two long blocks, steady breathing, no surges',
            SWEET_SPOT: '3-4 x 12-20 min at 88-94% FTP, 5 min easy between',
            THRESHOLD: '2-3 x 10-20 min at 95-105% FTP, equal easy recovery',
            VO2: '5-6 x 3 min at 106-120% FTP, 3 min easy between',
            CLIMBING_TEMPO: 'Find the longest climb you can and ride it seated at tempo',
            CLIMBING_REPEATS: 'Match the climb length in your event profile, repeat 3-4 times',
            OPENERS: '3 x 1 min hard inside an otherwise easy ride, then go home'
        };
        return notes[key] || 'Hold the prescribed zone and stop while it still feels repeatable';
    }

    /**
     * Long ride progression. Grows toward the event's peak duration, is capped
     * as a share of the week so it never crowds out everything else, and backs
     * off in the taper - the longest ride lands before the final two weeks.
     */
    calculateLongRideHours(phase, isRecovery, inputs, distanceConfig, weekVolume, weekProgress) {
        const peak = distanceConfig.longRidePeakHours;
        let fraction;

        switch (phase.name) {
            case 'Base':
                fraction = 0.60 + 0.18 * weekProgress;
                break;
            case 'Build':
                fraction = 0.80 + 0.15 * weekProgress;
                break;
            case 'Peak':
                fraction = 1.0;
                break;
            case 'Taper':
            default:
                fraction = 0.55 - 0.15 * weekProgress;
                break;
        }

        let hours = peak * fraction;

        if (inputs.fitnessLevel === 'beginner') hours *= 0.85;
        else if (inputs.fitnessLevel === 'advanced') hours *= 1.08;

        if (isRecovery) hours *= 0.65;

        // A long ride is 40-50% of the week's hours, more when riding only 3 days.
        const shareCap = inputs.trainingDays <= 3 ? 0.50 : 0.45;
        hours = Math.min(hours, weekVolume * shareCap);

        return Math.max(0.5, Math.round(hours * 20) / 20);
    }

    weekFocus(phase, isRecovery, distanceConfig) {
        if (isRecovery) return 'Recovery week - volume cut, intensity removed, let the adaptation land';
        switch (phase.name) {
            case 'Base':
                return distanceConfig.backToBack
                    ? 'Aerobic base plus your first back-to-back weekend blocks'
                    : 'Aerobic base - time in Z2 is the point';
            case 'Build':
                return 'Sweet spot and threshold work on top of a growing long ride';
            case 'Peak':
                return distanceConfig.climbingFocus
                    ? 'Event-specific climbing and the longest rides of the plan'
                    : 'Race-specific intensity and the longest rides of the plan';
            case 'Taper':
            default:
                return 'Shed fatigue, hold sharpness, arrive rested';
        }
    }

    // -----------------------------------------------------------------------
    // Hour allocation - guarantees the week hits the rider's stated budget
    // -----------------------------------------------------------------------

    /**
     * Scale the desired session durations so the week sums to `weekVolume`,
     * honouring per-session minimums where the budget allows. The result is
     * rounded to 5-minute steps with the residual absorbed by the longest ride.
     */
    allocateSessionHours(sessions, weekVolume) {
        const items = sessions.map(s => ({
            def: s.def,
            slot: s.slot,
            note: s.note || '',
            min: s.min || 0.33,
            hours: Math.max(s.min || 0.33, s.desired || s.min || 0.33),
            locked: false
        }));

        if (!items.length) return items;

        for (let pass = 0; pass < 6; pass++) {
            const total = items.reduce((a, b) => a + b.hours, 0);
            if (Math.abs(total - weekVolume) < 0.01) break;

            const flexible = items.filter(i => !i.locked);
            if (!flexible.length) break;

            const lockedSum = items.filter(i => i.locked).reduce((a, b) => a + b.hours, 0);
            const flexSum = flexible.reduce((a, b) => a + b.hours, 0);
            const target = weekVolume - lockedSum;
            if (flexSum <= 0 || target <= 0) break;

            const k = target / flexSum;
            let lockedAny = false;
            flexible.forEach(i => {
                let h = i.hours * k;
                if (h < i.min) { h = i.min; i.locked = true; lockedAny = true; }
                i.hours = h;
            });
            if (!lockedAny) break;
        }

        // If the minimums alone overshoot a very small week, scale everything.
        let total = items.reduce((a, b) => a + b.hours, 0);
        if (total > weekVolume + 0.01 && total > 0) {
            const k = weekVolume / total;
            items.forEach(i => { i.hours *= k; });
        }

        // Round to 5-minute steps and put the rounding residual on the long ride.
        items.forEach(i => { i.minutes = Math.max(5, Math.round(i.hours * 60 / 5) * 5); });
        const targetMinutes = Math.max(items.length * 5, Math.round(weekVolume * 60));
        const diff = targetMinutes - items.reduce((a, b) => a + b.minutes, 0);
        if (diff !== 0) {
            const biggest = items.reduce((a, b) => (b.minutes > a.minutes ? b : a), items[0]);
            biggest.minutes = Math.max(5, biggest.minutes + diff);
        }
        items.forEach(i => { i.hours = Math.round(i.minutes / 60 * 100) / 100; });

        return items;
    }

    // -----------------------------------------------------------------------
    // Scheduling
    // -----------------------------------------------------------------------

    /**
     * Place sessions on days: the long ride on the rider's chosen day, the
     * back-to-back ride immediately after it, hard days separated where the
     * week allows, and the day before the long ride kept light.
     */
    assignSessionsToDays(days, sessions, longDayIndex) {
        const used = new Set();
        const place = (session, index) => {
            days[index].workout = this.buildWorkout(session.def, session.hours, session.note);
            used.add(index);
        };

        const longIdx = longDayIndex >= 0 ? longDayIndex : 5;
        const pending = sessions.slice();

        const takeSlot = slot => {
            const i = pending.findIndex(s => s.slot === slot);
            return i === -1 ? null : pending.splice(i, 1)[0];
        };

        const longRide = takeSlot('long');
        if (longRide) place(longRide, longIdx);

        const b2b = takeSlot('afterLong');
        if (b2b) {
            let idx = (longIdx + 1) % 7;
            if (used.has(idx)) idx = this.firstFree(used, idx);
            if (idx >= 0) place(b2b, idx);
        }

        // Spread the remaining sessions away from the long ride: start three
        // days after it and walk forward, which keeps the pre-long day free
        // for as long as possible.
        const order = [];
        for (let offset = 3; offset < 10; offset++) {
            const idx = (longIdx + offset) % 7;
            if (order.indexOf(idx) === -1) order.push(idx);
        }

        const rest = pending.slice();
        // Quality rides first so they claim the well-spaced midweek days.
        rest.sort((a, b) => this.slotRank(a.slot) - this.slotRank(b.slot));

        rest.forEach(session => {
            let target = -1;
            for (const idx of order) {
                if (!used.has(idx)) { target = idx; break; }
            }
            if (target === -1) target = this.firstFree(used, 0);
            if (target >= 0) place(session, target);
        });
    }

    slotRank(slot) {
        if (slot === 'quality1') return 0;
        if (slot === 'quality2') return 1;
        return 2;
    }

    firstFree(used, from) {
        for (let i = 0; i < 7; i++) {
            const idx = (from + i) % 7;
            if (!used.has(idx)) return idx;
        }
        return -1;
    }

    // -----------------------------------------------------------------------
    // Workout objects
    // -----------------------------------------------------------------------

    buildWorkout(def, hours, note) {
        const isRest = def.type === 'REST';
        const minutes = isRest ? 0 : Math.max(5, Math.round((hours || 0) * 60));

        return {
            type: def.type,
            name: def.name,
            sport: def.sport,
            zone: def.zone,
            rpe: def.rpe,
            category: def.category,
            intensity: def.intensity,
            purpose: def.purpose,
            hours: isRest ? 0 : Math.round(minutes / 60 * 100) / 100,
            minutes,
            duration: isRest ? 'Rest' : this.formatDuration(minutes),
            note: note || ''
        };
    }

    summariseIntensity(days, totalMinutes) {
        const buckets = { easy: 0, moderate: 0, hard: 0 };
        days.forEach(d => {
            const w = d.workout;
            if (!w || !w.minutes) return;
            if (buckets.hasOwnProperty(w.intensity)) buckets[w.intensity] += w.minutes;
        });

        if (!totalMinutes) return { easy: 0, moderate: 0, hard: 0 };

        const easy = Math.round(buckets.easy / totalMinutes * 100);
        const moderate = Math.round(buckets.moderate / totalMinutes * 100);
        return { easy, moderate, hard: Math.max(0, 100 - easy - moderate) };
    }

    // -----------------------------------------------------------------------
    // Summary
    // -----------------------------------------------------------------------

    generateSummary(inputs, phases, weeks) {
        const totalHours = weeks.reduce((sum, w) => sum + (w.totalHours || 0), 0);
        const peakVolume = Math.max.apply(null, weeks.map(w => w.targetVolume));
        const longestRide = Math.max.apply(null, weeks.map(w => w.longestRide || 0));
        const recoveryWeeks = weeks.filter(w => w.isRecovery).length;
        const cadence = this.getRecoveryCadence(inputs.fitnessLevel);

        const weeksNote = inputs.weeksAdjusted
            ? 'You asked for ' + inputs.requestedWeeks + ' weeks. This event is planned over ' +
              inputs.supportedMinWeeks + '-' + inputs.supportedMaxWeeks +
              ' weeks, so your plan was adjusted to ' + inputs.totalWeeks + ' weeks.'
            : 'Plan matches your requested ' + inputs.totalWeeks + ' weeks.';

        return {
            sport: 'cycling',
            units: 'hours',
            totalWeeks: weeks.length,
            totalVolume: Math.round(totalHours),
            peakVolume: Math.round(peakVolume * 10) / 10,
            recoveryWeeks,
            recoveryCadence: cadence,
            weeklyHoursBudget: inputs.weeklyHours,
            trainingDays: inputs.trainingDays,
            longestRideHours: Math.round(longestRide * 10) / 10,
            requestedWeeks: inputs.requestedWeeks || weeks.length,
            weeksAdjusted: !!inputs.weeksAdjusted,
            weeksNote,
            intensityModel: 'Pyramidal base into a sweet spot and threshold build, ' +
                'roughly 80% of weekly time below 75% FTP',
            phases: phases.map(p => ({ name: p.name, weeks: p.duration }))
        };
    }

    // -----------------------------------------------------------------------
    // Utilities
    // -----------------------------------------------------------------------

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
        const idx = dayMap[String(dayName || '').toLowerCase()];
        return idx === undefined ? 5 : idx;
    }

    formatDuration(minutes) {
        if (!minutes) return 'Rest';
        if (minutes < 60) return minutes + ' min';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins === 0 ? hours + 'h' : hours + 'h ' + mins + 'm';
    }

    /**
     * Overview card. Peak volume is reported in HOURS - this sport never
     * reports mileage.
     */
    createOverviewSection(plan) {
        const section = document.createElement('div');
        section.className = 'text-center mb-8';

        const title = document.createElement('h2');
        title.className = 'text-3xl font-bold text-blue-600 mb-6';
        title.textContent = 'Your Personalized Cycling Plan';
        section.appendChild(title);

        const statsGrid = document.createElement('div');
        statsGrid.className = 'grid grid-cols-2 md:grid-cols-4 gap-4';

        const stats = [
            { value: plan.summary.totalWeeks, label: 'Total Weeks', color: 'blue' },
            { value: plan.summary.peakVolume + 'h', label: 'Peak Hours/Week', color: 'green' },
            { value: plan.summary.recoveryWeeks, label: 'Recovery Weeks', color: 'purple' },
            { value: plan.phases.length, label: 'Training Phases', color: 'orange' }
        ];

        stats.forEach(stat => {
            const card = document.createElement('div');
            card.className = 'bg-' + stat.color + '-50 p-4 rounded-lg';

            const value = document.createElement('div');
            value.className = 'text-2xl font-bold text-' + stat.color + '-800';
            value.textContent = stat.value;

            const label = document.createElement('div');
            label.className = 'text-sm text-' + stat.color + '-600';
            label.textContent = stat.label;

            card.appendChild(value);
            card.appendChild(label);
            statsGrid.appendChild(card);
        });

        section.appendChild(statsGrid);
        return section;
    }
}

/* Legacy option aliases: old form values and shared plan links must keep working. */
CyclingDistanceConfigs.metric = CyclingDistanceConfigs['62mi'];
CyclingDistanceConfigs.century = CyclingDistanceConfigs['100mi'];

window.CyclingPlanGenerator = CyclingPlanGenerator;
window.CyclingDistanceConfigs = CyclingDistanceConfigs;
window.CyclingRideLibrary = CyclingRideLibrary;
