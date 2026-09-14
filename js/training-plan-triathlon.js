/**
 * Triathlon Training Plan Generator
 * =============================================================================
 * Produces a periodized multisport plan built from PER-DISCIPLINE sessions
 * (swim / bike / run) plus bricks, with a weekly long ride and long run and a
 * volume split that changes by race distance. Volume is expressed in HOURS per
 * week; swim sessions also carry a distance in metres.
 *
 * Research the parameters below are synthesised from (no text is copied):
 *
 *  - Weekly volume by distance: Olympic ~6-10 h/wk, 70.3 ~8-14 h/wk, Ironman
 *    ~10-18+ h/wk.
 *    tri247.com/triathlon-training/ironman-vs-70-3-vs-olympic-triathlon
 *  - Discipline frequency for 70.3: swim 2-3/wk, bike 3-4/wk, run 3-4/wk; a
 *    typical week is two swims (one technique, one steady endurance), two to
 *    three rides (long, tempo/threshold, sometimes a brick), two runs (one long,
 *    one short or brick), and one full rest day.
 *    trainingpeaks.com/training-plans/triathlon/half-ironman/tp-500151/24-week-70-3-triathlon-plan-half-ironman
 *    triathlete.com/training/20-week-training-plan-first-70-3-triathlon/
 *  - Volume split: bike takes the largest share, and a ~20/50/30 swim/bike/run
 *    split mirrors the time actually spent in each discipline on race day; the
 *    bike share grows with race distance.
 *    medium.com/@thrillchester - typical distribution of training swim/bike/run
 *  - Bricks: one to two per week is the working dose for age-groupers. Sprint
 *    and Olympic athletes typically start with one short midweek brick (about an
 *    hour ride with a 15-20 min run); the weekend brick is a 1-2 h ride with a
 *    ~30 min run. Bricks are periodized: short transition runs in base, longer
 *    tempo runs off moderate rides in build, race-specific efforts at peak.
 *    triathlete.com/training/dear-coach-how-often-should-i-run-off-the-bike/
 *    usatriathlon.org/articles/training-tips/run-strong-off-the-bike
 *    roadmancycling.com/blog/brick-workouts-for-ironman
 *  - Run off the bike is the priority skill: the bike-to-run transition is the
 *    hardest part of the race for most athletes, and splitting bike and run into
 *    separate sessions on the same day does not train that specific stress.
 *    trainingbible.com/joesblog - specificity of training
 *  - Swim frequency for beginners: at least 2-3 swims per week, 3-4 while the
 *    stroke is still being built; in that phase frequency matters more than
 *    distance because swimming is so technique-dependent.
 *    usatriathlon.org/articles/training-tips/how-often-should-i-be-swimming
 *  - Taper by distance: roughly 5-7 days sprint, ~10 days Olympic, 7-14 days
 *    70.3, 14-21+ days Ironman, cutting total volume 40-60% off the pre-taper
 *    peak while holding frequency and some intensity.
 *    scientifictriathlon.com/tapering-for-triathlon/
 *    triathlete.com/training/triathletes-expert-guide-on-how-to-taper/
 *  - Recovery cadence and base/build/peak/taper structure follow the same
 *    3:1 (newer athlete) vs 4:1 (experienced athlete) loading pattern used in
 *    endurance periodization generally.
 *    help.trainingpeaks.com/hc/en-us/articles/224662768-Annual-Training-Plan-Methodologies
 * =============================================================================
 */

// ---------------------------------------------------------------------------
// Event configurations. Keys and shape are part of the public contract.
// weeklyVolumeTargets are HOURS per week at peak; sportDistribution is the
// share of weekly hours per discipline (brick hours are split bike/run when
// the weekly breakdown is reported).
// ---------------------------------------------------------------------------
const TriathlonDistanceConfigs = {
    'sprint': {
        name: 'Sprint Triathlon',
        swim: 750,      // metres
        bike: 20,       // km
        run: 5,         // km
        minWeeks: 8,
        optimalWeeks: 12,
        maxWeeks: 16,
        taperDays: 7,
        keyWorkouts: ['SWIM_TECHNIQUE', 'SWEET_SPOT', 'TEMPO_RUN', 'BRICK'],
        weeklyVolumeTargets: { beginner: 5, intermediate: 7, advanced: 9 },
        sportDistribution: { swim: 0.22, bike: 0.38, run: 0.30, brick: 0.10 },
        longRidePeakHours: 1.75,
        longRunPeakHours: 1,
        description: 'Sharpen speed and transitions for sprint-distance racing'
    },
    'olympic': {
        name: 'Olympic Triathlon',
        swim: 1500,
        bike: 40,
        run: 10,
        minWeeks: 10,
        optimalWeeks: 14,
        maxWeeks: 20,
        taperDays: 10,
        keyWorkouts: ['SWIM_ENDURANCE', 'SWEET_SPOT', 'TEMPO_RUN', 'BRICK'],
        weeklyVolumeTargets: { beginner: 7, intermediate: 9, advanced: 12 },
        sportDistribution: { swim: 0.20, bike: 0.42, run: 0.28, brick: 0.10 },
        longRidePeakHours: 2.5,
        longRunPeakHours: 1.25,
        description: 'Balance endurance and race-pace efficiency for Olympic distance'
    },
    '70.3': {
        name: 'Half Ironman (70.3)',
        swim: 1900,
        bike: 90,
        run: 21.1,
        minWeeks: 14,
        optimalWeeks: 20,
        maxWeeks: 28,
        taperDays: 14,
        keyWorkouts: ['SWIM_ENDURANCE', 'ENDURANCE_RIDE', 'LONG_RUN', 'BRICK'],
        weeklyVolumeTargets: { beginner: 9, intermediate: 12, advanced: 16 },
        sportDistribution: { swim: 0.16, bike: 0.46, run: 0.28, brick: 0.10 },
        longRidePeakHours: 4,
        longRunPeakHours: 1.75,
        description: 'Build the aerobic base and race-specific endurance a 70.3 demands'
    },
    'ironman': {
        name: 'Ironman (140.6)',
        swim: 3800,
        bike: 180,
        run: 42.2,
        minWeeks: 20,
        optimalWeeks: 28,
        maxWeeks: 36,
        taperDays: 21,
        keyWorkouts: ['OPEN_WATER', 'ENDURANCE_RIDE', 'LONG_RUN', 'BRICK'],
        weeklyVolumeTargets: { beginner: 11, intermediate: 15, advanced: 20 },
        sportDistribution: { swim: 0.13, bike: 0.50, run: 0.27, brick: 0.10 },
        longRidePeakHours: 6,
        longRunPeakHours: 2.5,
        description: 'Full-distance preparation: long-course volume, fuelling and pacing'
    }
};

// ---------------------------------------------------------------------------
// Session library, grouped by discipline.
// `category` drives UI colour (easy | moderate | hard); `intensity` drives the
// weekly intensity-distribution accounting.
// ---------------------------------------------------------------------------
const TriathlonWorkoutTypes = {
    // ---- Swim -------------------------------------------------------------
    SWIM_TECHNIQUE: {
        type: 'SWIM_TECHNIQUE', name: 'Swim Technique', sport: 'swim',
        zone: 'Easy aerobic with drill sets', rpe: '3-4',
        category: 'easy', intensity: 'easy', natural: 0.75, min: 0.5,
        purpose: 'Frequency beats distance while the stroke is still being built'
    },
    SWIM_ENDURANCE: {
        type: 'SWIM_ENDURANCE', name: 'Swim Endurance', sport: 'swim',
        zone: 'Steady aerobic, continuous sets', rpe: '5-6',
        category: 'easy', intensity: 'easy', natural: 1, min: 0.5,
        purpose: 'Continuous aerobic swimming at race effort or just under'
    },
    SWIM_INTERVALS: {
        type: 'SWIM_INTERVALS', name: 'Swim Intervals', sport: 'swim',
        zone: 'Threshold repeats on short rest', rpe: '7-8',
        category: 'hard', intensity: 'hard', natural: 0.85, min: 0.5,
        purpose: 'Raise swim threshold with repeats on a tight send-off'
    },
    OPEN_WATER: {
        type: 'OPEN_WATER', name: 'Open Water Swim', sport: 'swim',
        zone: 'Steady with sighting practice', rpe: '5-6',
        category: 'moderate', intensity: 'moderate', natural: 1, min: 0.5,
        purpose: 'Sighting, straight-line swimming and wetsuit familiarity'
    },

    // ---- Bike -------------------------------------------------------------
    LONG_RIDE: {
        type: 'ENDURANCE_RIDE', name: 'Long Ride', sport: 'bike',
        zone: 'Z2 (56-75% FTP)', rpe: '3-4',
        category: 'easy', intensity: 'easy', natural: 3, min: 0.75,
        purpose: 'The aerobic anchor of the week and your fuelling rehearsal'
    },
    ENDURANCE_RIDE: {
        type: 'ENDURANCE_RIDE', name: 'Endurance Ride', sport: 'bike',
        zone: 'Z2 (56-75% FTP)', rpe: '3-4',
        category: 'easy', intensity: 'easy', natural: 1.25, min: 0.5,
        purpose: 'Low-stress aerobic time on the bike'
    },
    RECOVERY_RIDE: {
        type: 'RECOVERY_RIDE', name: 'Recovery Spin', sport: 'bike',
        zone: 'Z1 (<55% FTP)', rpe: '2',
        category: 'easy', intensity: 'easy', natural: 0.75, min: 0.33,
        purpose: 'Flush the legs without adding training load'
    },
    SWEET_SPOT: {
        type: 'SWEET_SPOT', name: 'Sweet Spot Intervals', sport: 'bike',
        zone: '88-94% FTP', rpe: '6-7',
        category: 'moderate', intensity: 'moderate', natural: 1.25, min: 0.5,
        purpose: 'Time-efficient sustainable power: 3-4 x 12-20 min'
    },
    TEMPO_RIDE: {
        type: 'TEMPO_RIDE', name: 'Race-Pace Ride', sport: 'bike',
        zone: 'Z3-Z4 at target race power', rpe: '6-7',
        category: 'moderate', intensity: 'moderate', natural: 1.5, min: 0.5,
        purpose: 'Hold the power you plan to race at, in your race position'
    },
    BIKE_THRESHOLD: {
        type: 'TEMPO_RIDE', name: 'Threshold Intervals', sport: 'bike',
        zone: 'Z4 (95-105% FTP)', rpe: '7-8',
        category: 'hard', intensity: 'hard', natural: 1.15, min: 0.5,
        purpose: 'Lift FTP so race power costs you less'
    },

    // ---- Run --------------------------------------------------------------
    LONG_RUN: {
        type: 'LONG_RUN', name: 'Long Run', sport: 'run',
        zone: 'Easy aerobic', rpe: '4-5',
        category: 'easy', intensity: 'easy', natural: 1.5, min: 0.5,
        purpose: 'Build run durability on legs that already rode yesterday'
    },
    EASY_RUN: {
        type: 'EASY_RUN', name: 'Easy Run', sport: 'run',
        zone: 'Conversational', rpe: '3-4',
        category: 'easy', intensity: 'easy', natural: 0.75, min: 0.4,
        purpose: 'Aerobic running volume at a genuinely easy effort'
    },
    TEMPO_RUN: {
        type: 'TEMPO_RUN', name: 'Tempo Run', sport: 'run',
        zone: 'Threshold, comfortably hard', rpe: '6-7',
        category: 'moderate', intensity: 'moderate', natural: 0.9, min: 0.5,
        purpose: 'Improve lactate threshold and race-pace economy'
    },
    RUN_INTERVALS: {
        type: 'RUN_INTERVALS', name: 'Run Intervals', sport: 'run',
        zone: 'VO2 repeats with jog recovery', rpe: '8-9',
        category: 'hard', intensity: 'hard', natural: 0.8, min: 0.5,
        purpose: 'Sharpen speed and running economy'
    },

    // ---- Multisport -------------------------------------------------------
    BRICK: {
        type: 'BRICK', name: 'Brick (Bike + Run)', sport: 'multi',
        zone: 'Race-effort ride into a run off the bike', rpe: '6-7',
        category: 'moderate', intensity: 'moderate', natural: 1.5, min: 0.5,
        purpose: 'Rehearse the bike-to-run transition, the hardest part of the race'
    },

    REST: {
        type: 'REST', name: 'Rest Day', sport: 'rest',
        zone: 'Full rest', rpe: '0',
        category: 'rest', intensity: 'rest', natural: 0, min: 0,
        purpose: 'Complete rest - three sports need one genuinely empty day'
    }
};

/**
 * Triathlon Plan Generator - extends TrainingPlanGenerator
 */
class TriathlonPlanGenerator extends TrainingPlanGenerator {
    constructor(formId = 'training-plan-form', resultId = 'training-plan-result') {
        super(formId, resultId, 'triathlon');
    }

    getDistanceConfigs() {
        return TriathlonDistanceConfigs;
    }

    // -----------------------------------------------------------------------
    // Input handling
    // -----------------------------------------------------------------------

    /**
     * The triathlon form posts `experienceLevel` (not `fitnessLevel`),
     * `weeklyHours`, `trainingDays` and `swimPreference`. Normalise every alias
     * so neither the form nor an older shared link can produce an empty plan.
     */
    normalizeInputs(inputs) {
        const levels = ['beginner', 'intermediate', 'advanced'];
        let level = String(inputs.experienceLevel || inputs.fitnessLevel || 'intermediate').toLowerCase();
        if (levels.indexOf(level) === -1) level = 'intermediate';
        inputs.fitnessLevel = level;
        inputs.experienceLevel = level;

        let days = parseInt(inputs.trainingDays, 10);
        if (!isFinite(days)) days = 5;
        inputs.trainingDays = Math.min(7, Math.max(3, days));

        let hours = parseFloat(inputs.weeklyHours);
        if (!isFinite(hours) || hours <= 0) hours = parseFloat(inputs.currentVolume);
        if (!isFinite(hours) || hours <= 0) hours = 10;
        inputs.weeklyHours = Math.min(30, Math.max(3, hours));
        inputs.currentVolume = inputs.weeklyHours;

        const swim = String(inputs.swimPreference || 'pool').toLowerCase();
        inputs.swimPreference = swim === 'openwater' ? 'openwater' : 'pool';

        const day = String(inputs.longRideDay || inputs.longDay || 'saturday').toLowerCase();
        inputs.longRideDay = day;
        inputs.longDay = day;

        return inputs;
    }

    validateInputs(inputs) {
        this.normalizeInputs(inputs);

        const requested = inputs.weeksUntilRace || inputs.weeks || inputs.totalWeeks;
        if (!requested && !inputs.raceDate && !inputs.eventDate) {
            throw new Error('Please enter a race date or weeks until your race');
        }
        const configs = this.getDistanceConfigs();
        const key = inputs.goalDistance || inputs.distance;
        if (key && !configs[key]) {
            throw new Error('Invalid race distance selected');
        }
        return true;
    }

    // -----------------------------------------------------------------------
    // Periodization
    // -----------------------------------------------------------------------

    getRecoveryCadence(fitnessLevel) {
        return fitnessLevel === 'advanced' ? 4 : 3;
    }

    /** Taper length comes from the event's taperDays, rounded up to whole weeks. */
    getTaperWeeks(distanceConfig, totalWeeks) {
        const fromDays = Math.ceil((distanceConfig.taperDays || 10) / 7);
        return Math.max(1, Math.min(fromDays, 3, totalWeeks - 3));
    }

    calculatePhases(inputs, distanceConfig) {
        this.normalizeInputs(inputs);

        const requested = parseInt(inputs.weeksUntilRace || inputs.weeks || inputs.totalWeeks, 10) ||
            distanceConfig.optimalWeeks;
        const totalWeeks = Math.min(distanceConfig.maxWeeks, Math.max(distanceConfig.minWeeks, requested));

        inputs.requestedWeeks = requested;
        inputs.totalWeeks = totalWeeks;
        inputs.weeksAdjusted = totalWeeks !== requested;
        inputs.supportedMinWeeks = distanceConfig.minWeeks;
        inputs.supportedMaxWeeks = distanceConfig.maxWeeks;

        const taperWeeks = this.getTaperWeeks(distanceConfig, totalWeeks);
        const remaining = totalWeeks - taperWeeks;

        // Triathlon carries the longest base: three disciplines all need
        // aerobic development, and the swim needs technique frequency early.
        let baseWeeks = Math.max(1, Math.round(remaining * 0.45));
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

        const phases = [
            {
                name: 'Base',
                label: 'Base Building',
                duration: baseWeeks,
                volumeRange: { start: 0.70, end: 0.88 },
                qualityShare: 0.14,
                description: 'Aerobic volume in all three sports, swim technique frequency, ' +
                    'and short transition runs off the bike.'
            },
            {
                name: 'Build',
                label: 'Build Phase',
                duration: buildWeeks,
                volumeRange: { start: 0.88, end: 1.0 },
                qualityShare: 0.26,
                description: 'Sweet spot on the bike, tempo running, and a weekly brick ' +
                    'with a longer run off a moderate ride.'
            },
            {
                name: 'Peak',
                label: 'Peak Phase',
                duration: peakWeeks,
                volumeRange: { start: 1.0, end: 1.0 },
                qualityShare: 0.30,
                description: 'Race-specific work: longest ride and run, open-water swimming, ' +
                    'and bricks at target race pace.'
            },
            {
                name: 'Taper',
                label: 'Race Taper',
                duration: taperWeeks,
                volumeRange: { start: 0.58, end: 0.40 },
                qualityShare: 0.18,
                description: 'Volume drops 40-60% while session frequency holds in all three ' +
                    'sports, with short race-pace touches to stay sharp.'
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
                const isRecovery = !isTaper && currentWeek % cadence === 0;

                let multiplier = phase.volumeRange.start +
                    (phase.volumeRange.end - phase.volumeRange.start) * weekProgress;
                let weekVolume = budget * multiplier;

                if (isRecovery) {
                    weekVolume *= 0.62;
                } else if (!isTaper && lastLoadVolume > 0) {
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
            if (!day.workout) day.workout = this.buildWorkout(TriathlonWorkoutTypes.REST, 0, '', inputs);
        });

        const totalMinutes = days.reduce((sum, d) => sum + (d.workout.minutes || 0), 0);
        const totalHours = Math.round(totalMinutes / 60 * 10) / 10;

        return {
            days,
            totalHours,
            totalMinutes,
            sessionCount: allocated.length,
            trainingDays: inputs.trainingDays,
            sportBreakdown: this.calculateSportBreakdown(days),
            longestRide: this.longestBySport(days, 'bike'),
            longestRun: this.longestBySport(days, 'run'),
            brickCount: days.filter(d => d.workout.type === 'BRICK').length,
            intensityDistribution: this.summariseIntensity(days, totalMinutes),
            focus: this.weekFocus(phase, isRecovery)
        };
    }

    /**
     * Compose exactly `trainingDays` sessions across the three disciplines.
     *
     * Frequency logic, in priority order:
     *   1. Long ride  - the single biggest aerobic stimulus
     *   2. Long run   - scheduled the day after the ride, on pre-fatigued legs
     *   3. Swim       - beginners get an extra swim; technique frequency first
     *   4. Brick      - one per week from the build phase onward
     *   5. Quality bike / run, then easy fill
     * With only three days available the ride becomes a brick in build and peak,
     * so the run-off-the-bike skill is never skipped.
     */
    planWeekSessions(phase, isRecovery, inputs, distanceConfig, weekVolume, weekProgress) {
        const W = TriathlonWorkoutTypes;
        const N = inputs.trainingDays;
        const level = inputs.fitnessLevel;
        const dist = distanceConfig.sportDistribution;
        const sessions = [];

        const wantsBrick = !isRecovery && (phase.name === 'Build' || phase.name === 'Peak');
        const swimCount = this.swimSessionCount(N, level, isRecovery);

        // Hour pools per discipline. Brick hours are folded into bike+run.
        const swimPool = weekVolume * dist.swim;
        const bikePool = weekVolume * (dist.bike + dist.brick * 0.6);
        const runPool = weekVolume * (dist.run + dist.brick * 0.4);

        // --- Long ride ------------------------------------------------------
        const longRideHours = this.longSessionHours(
            distanceConfig.longRidePeakHours, phase, isRecovery, level, weekProgress,
            weekVolume * (N <= 3 ? 0.45 : 0.40)
        );
        const rideIsBrick = wantsBrick && N <= 3;
        sessions.push({
            def: rideIsBrick ? W.BRICK : W.LONG_RIDE,
            desired: longRideHours,
            min: (rideIsBrick ? W.BRICK : W.LONG_RIDE).min,
            slot: 'long',
            note: rideIsBrick
                ? 'Ride long, then run 15-20 min straight off the bike'
                : (phase.name === 'Base'
                    ? 'Steady Z2. Finish with a 10 min transition run off the bike'
                    : 'Steady Z2 with race-pace blocks; practise race-day fuelling')
        });
        let remaining = N - 1;

        // --- Long run, the day after the ride --------------------------------
        if (remaining > 0) {
            const longRunHours = this.longSessionHours(
                distanceConfig.longRunPeakHours, phase, isRecovery, level, weekProgress,
                weekVolume * 0.22
            );
            sessions.push({
                def: W.LONG_RUN,
                desired: longRunHours,
                min: W.LONG_RUN.min,
                slot: 'afterLong',
                note: 'Run this on yesterday\'s legs - that is the point of the placement'
            });
            remaining--;
        }

        // --- Swims -----------------------------------------------------------
        // Never schedule more swims than the swim pool can actually fund at a
        // sensible minimum session length. On a small weekly budget three
        // 30-minute swim floors would outweigh the bike, which is backwards;
        // the freed slot goes to the bike or run instead.
        const swimBudgetCap = Math.max(1, Math.floor(swimPool / W.SWIM_TECHNIQUE.min));
        const swims = Math.min(
            swimCount,
            swimBudgetCap,
            Math.max(0, remaining - (wantsBrick && !rideIsBrick ? 1 : 0))
        );
        const swimKeys = this.selectSwims(phase, level, inputs.swimPreference, isRecovery, swims);
        const swimNatural = swimKeys.reduce((s, k) => s + W[k].natural, 0) || 1;
        swimKeys.forEach((key, idx) => {
            const def = W[key];
            sessions.push({
                def,
                desired: swimPool * (def.natural / swimNatural),
                min: def.min,
                slot: 'swim' + (idx + 1),
                note: this.sessionNote(key)
            });
            remaining--;
        });

        // --- Brick ------------------------------------------------------------
        if (wantsBrick && !rideIsBrick && remaining > 0) {
            sessions.push({
                def: W.BRICK,
                desired: (bikePool * 0.28) + (runPool * 0.25),
                min: W.BRICK.min,
                slot: 'brick',
                note: phase.name === 'Build'
                    ? 'Moderate ride into a tempo run off the bike'
                    : 'Ride at target race power, then run the first miles at race pace'
            });
            remaining--;
        }

        // --- Quality bike and run, then easy fill ------------------------------
        const fillers = this.selectFillers(phase, level, isRecovery, remaining);
        const qualityBudget = weekVolume * (isRecovery ? 0 : phase.qualityShare);
        const qualityKeys = fillers.filter(k => W[k].intensity !== 'easy');
        const qualityNatural = qualityKeys.reduce((s, k) => s + W[k].natural, 0) || 1;

        fillers.forEach((key, idx) => {
            const def = W[key];
            const isQuality = def.intensity !== 'easy';
            sessions.push({
                def,
                desired: isQuality
                    ? qualityBudget * (def.natural / qualityNatural)
                    : def.natural,
                min: def.min,
                slot: 'fill' + idx,
                note: this.sessionNote(key)
            });
        });

        // The swim and run pools are shares of the week and must hold their
        // size, so the long ride is the session that absorbs whatever weekly
        // hours are left over. Without this the allocator scales every session
        // up uniformly and the swim - a third of the sessions in a 3-day week -
        // ends up outweighing the bike, which is backwards for triathlon.
        const longSession = sessions.find(s => s.slot === 'long');
        if (longSession) {
            const othersSum = sessions.reduce(
                (sum, s) => (s === longSession ? sum : sum + (s.desired || s.min || 0)), 0);
            const surplus = weekVolume - othersSum;
            longSession.desired = Math.max(
                longSession.desired,
                Math.min(surplus, weekVolume * 0.55)
            );
        }

        return sessions;
    }

    /**
     * Swim frequency. Beginners swim more often because the stroke is still
     * being built and frequency matters more than distance at that stage.
     */
    swimSessionCount(N, level, isRecovery) {
        if (N <= 3) return 1;
        if (N === 4) return level === 'beginner' ? 2 : 1;
        if (N === 5) return 2;
        if (N === 6) return level === 'beginner' ? 3 : 2;
        return 3;
    }

    selectSwims(phase, level, swimPreference, isRecovery, count) {
        if (count <= 0) return [];
        const keys = [];
        const openWaterReady = swimPreference === 'openwater' &&
            (phase.name === 'Peak' || phase.name === 'Build');

        switch (phase.name) {
            case 'Base':
                keys.push('SWIM_TECHNIQUE', 'SWIM_ENDURANCE', 'SWIM_TECHNIQUE');
                break;
            case 'Build':
                keys.push('SWIM_ENDURANCE', level === 'beginner' ? 'SWIM_TECHNIQUE' : 'SWIM_INTERVALS', 'SWIM_TECHNIQUE');
                break;
            case 'Peak':
                keys.push(openWaterReady ? 'OPEN_WATER' : 'SWIM_ENDURANCE',
                    level === 'beginner' ? 'SWIM_TECHNIQUE' : 'SWIM_INTERVALS',
                    'SWIM_TECHNIQUE');
                break;
            case 'Taper':
            default:
                keys.push('SWIM_TECHNIQUE', 'SWIM_ENDURANCE', 'SWIM_TECHNIQUE');
                break;
        }

        if (isRecovery) {
            return new Array(count).fill('SWIM_TECHNIQUE');
        }
        return keys.slice(0, count);
    }

    /** Remaining slots: one quality bike, one quality run, then easy volume. */
    selectFillers(phase, level, isRecovery, count) {
        if (count <= 0) return [];

        if (isRecovery) {
            const easy = ['EASY_RUN', 'RECOVERY_RIDE', 'ENDURANCE_RIDE', 'EASY_RUN'];
            return easy.slice(0, count);
        }

        let ordered;
        switch (phase.name) {
            case 'Base':
                ordered = ['ENDURANCE_RIDE', 'EASY_RUN', 'SWEET_SPOT', 'EASY_RUN'];
                break;
            case 'Build':
                ordered = ['SWEET_SPOT', 'TEMPO_RUN', 'ENDURANCE_RIDE', 'EASY_RUN'];
                break;
            case 'Peak':
                ordered = [
                    level === 'beginner' ? 'SWEET_SPOT' : 'BIKE_THRESHOLD',
                    level === 'advanced' ? 'RUN_INTERVALS' : 'TEMPO_RUN',
                    'TEMPO_RIDE', 'EASY_RUN'
                ];
                break;
            case 'Taper':
            default:
                ordered = ['TEMPO_RIDE', 'EASY_RUN', 'RECOVERY_RIDE', 'EASY_RUN'];
                break;
        }

        const out = [];
        for (let i = 0; i < count; i++) out.push(ordered[i % ordered.length]);
        return out;
    }

    sessionNote(key) {
        const notes = {
            SWIM_TECHNIQUE: 'Drill sets with fins and paddles, short repeats, long rest',
            SWIM_ENDURANCE: 'Continuous swimming at or just under race effort',
            SWIM_INTERVALS: 'Threshold repeats on a tight send-off',
            OPEN_WATER: 'Sight every 6-8 strokes and swim a straight line',
            SWEET_SPOT: '3-4 x 12-20 min at 88-94% FTP',
            BIKE_THRESHOLD: '2-3 x 12 min at 95-105% FTP',
            TEMPO_RIDE: 'Hold target race power in your race position',
            ENDURANCE_RIDE: 'Conversational Z2 riding',
            RECOVERY_RIDE: 'Easy spin, high cadence, low power',
            TEMPO_RUN: '20-30 min at threshold inside an easy run',
            RUN_INTERVALS: '6-8 x 3 min hard with equal jog recovery',
            EASY_RUN: 'Genuinely easy - this is recovery that happens to be running',
            LONG_RUN: 'Steady aerobic effort, practise race-day nutrition'
        };
        return notes[key] || 'Hold the prescribed effort and finish feeling repeatable';
    }

    /** Long ride / long run progression toward the event's peak duration. */
    longSessionHours(peakHours, phase, isRecovery, level, weekProgress, cap) {
        let fraction;
        switch (phase.name) {
            case 'Base':
                fraction = 0.58 + 0.20 * weekProgress;
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

        let hours = (peakHours || 2) * fraction;
        if (level === 'beginner') hours *= 0.85;
        else if (level === 'advanced') hours *= 1.08;
        if (isRecovery) hours *= 0.65;

        hours = Math.min(hours, cap);
        return Math.max(0.5, Math.round(hours * 20) / 20);
    }

    weekFocus(phase, isRecovery) {
        if (isRecovery) return 'Recovery week - volume cut across all three sports, intensity removed';
        switch (phase.name) {
            case 'Base':
                return 'Aerobic base in all three sports plus swim technique frequency';
            case 'Build':
                return 'Sustainable power on the bike, tempo running, and a weekly brick';
            case 'Peak':
                return 'Race-specific: longest ride and run, and bricks at race pace';
            case 'Taper':
            default:
                return 'Cut volume, keep all three sports in the week, arrive fresh';
        }
    }

    // -----------------------------------------------------------------------
    // Hour allocation
    // -----------------------------------------------------------------------

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

        let total = items.reduce((a, b) => a + b.hours, 0);
        if (total > weekVolume + 0.01 && total > 0) {
            const k = weekVolume / total;
            items.forEach(i => { i.hours *= k; });
        }

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
     * Long ride on the chosen day, long run the day after (run off tired legs),
     * swims spread midweek, brick placed away from both long sessions.
     */
    assignSessionsToDays(days, sessions, longDayIndex, inputs) {
        const used = new Set();
        const longIdx = longDayIndex >= 0 ? longDayIndex : 5;
        const pending = sessions.slice();

        const place = (session, index) => {
            days[index].workout = this.buildWorkout(session.def, session.hours, session.note);
            used.add(index);
        };
        const takeSlot = slot => {
            const i = pending.findIndex(s => s.slot === slot);
            return i === -1 ? null : pending.splice(i, 1)[0];
        };

        const longRide = takeSlot('long');
        if (longRide) place(longRide, longIdx);

        const longRun = takeSlot('afterLong');
        if (longRun) {
            let idx = (longIdx + 1) % 7;
            if (used.has(idx)) idx = this.firstFree(used, idx);
            if (idx >= 0) place(longRun, idx);
        }

        // Swims and the brick get the well-spaced midweek days first.
        const order = [];
        for (let offset = 3; offset < 10; offset++) {
            const idx = (longIdx + offset) % 7;
            if (order.indexOf(idx) === -1) order.push(idx);
        }

        const rest = pending.slice();
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
        if (String(slot).indexOf('swim') === 0) return 0;
        if (slot === 'brick') return 1;
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

        const workout = {
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

        // Swim sessions also carry a distance, which is how swimmers think.
        if (def.sport === 'swim' && minutes > 0) {
            const metres = Math.round(minutes / 60 * 2400 / 50) * 50;
            workout.distanceMeters = metres;
            workout.distance = metres.toLocaleString('en-US') + ' m';
        }

        return workout;
    }

    calculateSportBreakdown(days) {
        const breakdown = { swim: 0, bike: 0, run: 0, multi: 0 };
        days.forEach(day => {
            const w = day.workout;
            if (!w || !w.minutes) return;
            if (breakdown.hasOwnProperty(w.sport)) breakdown[w.sport] += w.minutes;
        });
        return {
            swim: Math.round(breakdown.swim / 60 * 10) / 10,
            bike: Math.round(breakdown.bike / 60 * 10) / 10,
            run: Math.round(breakdown.run / 60 * 10) / 10,
            multi: Math.round(breakdown.multi / 60 * 10) / 10
        };
    }

    longestBySport(days, sport) {
        let longest = 0;
        days.forEach(d => {
            const w = d.workout;
            if (!w) return;
            if (w.sport === sport || (sport === 'bike' && w.type === 'BRICK')) {
                longest = Math.max(longest, w.hours || 0);
            }
        });
        return Math.round(longest * 10) / 10;
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
        const recoveryWeeks = weeks.filter(w => w.isRecovery).length;
        const cadence = this.getRecoveryCadence(inputs.fitnessLevel);
        const taper = phases[phases.length - 1];

        const totals = weeks.reduce((acc, w) => {
            const b = w.sportBreakdown || { swim: 0, bike: 0, run: 0, multi: 0 };
            acc.swim += b.swim; acc.bike += b.bike; acc.run += b.run; acc.multi += b.multi;
            return acc;
        }, { swim: 0, bike: 0, run: 0, multi: 0 });
        const grand = totals.swim + totals.bike + totals.run + totals.multi || 1;

        const weeksNote = inputs.weeksAdjusted
            ? 'You asked for ' + inputs.requestedWeeks + ' weeks. This distance is planned over ' +
              inputs.supportedMinWeeks + '-' + inputs.supportedMaxWeeks +
              ' weeks, so your plan was adjusted to ' + inputs.totalWeeks + ' weeks.'
            : 'Plan matches your requested ' + inputs.totalWeeks + ' weeks.';

        return {
            sport: 'triathlon',
            units: 'hours',
            totalWeeks: weeks.length,
            totalVolume: Math.round(totalHours),
            peakVolume: Math.round(peakVolume * 10) / 10,
            recoveryWeeks,
            recoveryCadence: cadence,
            weeklyHoursBudget: inputs.weeklyHours,
            trainingDays: inputs.trainingDays,
            taperWeeks: taper.duration,
            brickSessions: weeks.reduce((s, w) => s + (w.brickCount || 0), 0),
            longestRideHours: Math.max.apply(null, weeks.map(w => w.longestRide || 0)),
            longestRunHours: Math.max.apply(null, weeks.map(w => w.longestRun || 0)),
            sportSplit: {
                swim: Math.round(totals.swim / grand * 100),
                bike: Math.round(totals.bike / grand * 100),
                run: Math.round(totals.run / grand * 100),
                brick: Math.round(totals.multi / grand * 100)
            },
            requestedWeeks: inputs.requestedWeeks || weeks.length,
            weeksAdjusted: !!inputs.weeksAdjusted,
            weeksNote,
            intensityModel: 'Aerobic-dominant across three sports with a weekly brick ' +
                'from the build phase, bike carrying the largest share of hours',
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

    getSportIcon(sport) {
        const icons = { swim: '🏊', bike: '🚴', run: '🏃', multi: '🔄', rest: '😴' };
        return icons[sport] || '🏋️';
    }

    /** Overview card. Volume is reported in HOURS, never mileage. */
    createOverviewSection(plan) {
        const section = document.createElement('div');
        section.className = 'text-center mb-8';

        const title = document.createElement('h2');
        title.className = 'text-3xl font-bold text-blue-600 mb-6';
        title.textContent = 'Your Personalized Triathlon Plan';
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

        const distInfo = document.createElement('div');
        distInfo.className = 'mt-6 p-4 bg-gray-50 rounded-lg';

        const distTitle = document.createElement('h4');
        distTitle.className = 'font-semibold text-gray-700 mb-2';
        distTitle.textContent = 'Weekly Sport Distribution';
        distInfo.appendChild(distTitle);

        const split = plan.summary.sportSplit || { swim: 0, bike: 0, run: 0, brick: 0 };
        const distText = document.createElement('p');
        distText.className = 'text-gray-600 text-sm';
        distText.textContent = 'Swim: ' + split.swim + '% | Bike: ' + split.bike +
            '% | Run: ' + split.run + '% | Brick: ' + split.brick + '%';
        distInfo.appendChild(distText);

        section.appendChild(distInfo);
        return section;
    }
}

/* Legacy option aliases: old form values and shared plan links must keep working. */
TriathlonDistanceConfigs['half'] = TriathlonDistanceConfigs['70.3'];
TriathlonDistanceConfigs['halfironman'] = TriathlonDistanceConfigs['70.3'];
TriathlonDistanceConfigs['full'] = TriathlonDistanceConfigs['ironman'];

window.TriathlonPlanGenerator = TriathlonPlanGenerator;
window.TriathlonDistanceConfigs = TriathlonDistanceConfigs;
window.TriathlonWorkoutTypes = TriathlonWorkoutTypes;
