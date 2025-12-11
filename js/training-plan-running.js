/**
 * Running Training Plan Generator
 * Generates periodized training plans for 5K to 100-mile ultramarathons
 */

// Running distance configurations
const RunningDistanceConfigs = {
    '5k': {
        name: '5K',
        distance: 3.1,
        minWeeks: 6,
        optimalWeeks: 10,
        maxWeeks: 16,
        taperWeeks: 1,
        longRunPeakMiles: 8,
        keyWorkouts: ['INTERVALS', 'TEMPO', 'LONG_RUN'],
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
        keyWorkouts: ['TEMPO', 'INTERVALS', 'LONG_RUN', 'RACE_PACE'],
        weeklyVolumeTargets: { beginner: 25, intermediate: 35, advanced: 50 },
        description: 'Develop speed endurance for 10K racing'
    },
    'half': {
        name: 'Half Marathon',
        distance: 13.1,
        minWeeks: 10,
        optimalWeeks: 14,
        maxWeeks: 20,
        taperWeeks: 2,
        longRunPeakMiles: 14,
        keyWorkouts: ['LONG_RUN', 'TEMPO', 'RACE_PACE', 'MODERATE_RUN'],
        weeklyVolumeTargets: { beginner: 30, intermediate: 40, advanced: 55 },
        description: 'Build endurance for the half marathon distance'
    },
    'marathon': {
        name: 'Marathon',
        distance: 26.2,
        minWeeks: 14,
        optimalWeeks: 18,
        maxWeeks: 24,
        taperWeeks: 3,
        longRunPeakMiles: 22,
        keyWorkouts: ['LONG_RUN', 'RACE_PACE', 'TEMPO', 'MODERATE_RUN'],
        weeklyVolumeTargets: { beginner: 35, intermediate: 50, advanced: 70 },
        description: 'Comprehensive marathon preparation with peak long runs of 20+ miles'
    },
    '50k': {
        name: '50K Ultra',
        distance: 31.1,
        minWeeks: 16,
        optimalWeeks: 20,
        maxWeeks: 28,
        taperWeeks: 2,
        longRunPeakMiles: 26,
        keyWorkouts: ['LONG_RUN', 'BACK_TO_BACK_LONG', 'EASY_RUN', 'HILLS'],
        weeklyVolumeTargets: { beginner: 40, intermediate: 55, advanced: 75 },
        backToBack: true,
        description: 'Ultra training with back-to-back long runs'
    },
    '50mi': {
        name: '50 Mile Ultra',
        distance: 50,
        minWeeks: 18,
        optimalWeeks: 24,
        maxWeeks: 32,
        taperWeeks: 3,
        longRunPeakMiles: 32,
        keyWorkouts: ['ULTRA_LONG', 'BACK_TO_BACK_LONG', 'EASY_RUN', 'HILLS'],
        weeklyVolumeTargets: { beginner: 45, intermediate: 60, advanced: 85 },
        backToBack: true,
        description: 'Extended time-on-feet training for 50 miles'
    },
    '100k': {
        name: '100K Ultra',
        distance: 62.1,
        minWeeks: 20,
        optimalWeeks: 28,
        maxWeeks: 36,
        taperWeeks: 3,
        longRunPeakMiles: 35,
        keyWorkouts: ['ULTRA_LONG', 'BACK_TO_BACK_LONG', 'EASY_RUN', 'MODERATE_RUN'],
        weeklyVolumeTargets: { beginner: 50, intermediate: 70, advanced: 95 },
        backToBack: true,
        description: 'High-volume ultra preparation for 100K'
    },
    '100mi': {
        name: '100 Mile Ultra',
        distance: 100,
        minWeeks: 24,
        optimalWeeks: 32,
        maxWeeks: 52,
        taperWeeks: 4,
        longRunPeakMiles: 40,
        keyWorkouts: ['ULTRA_LONG', 'BACK_TO_BACK_LONG', 'EASY_RUN', 'MODERATE_RUN'],
        weeklyVolumeTargets: { beginner: 55, intermediate: 75, advanced: 100 },
        backToBack: true,
        multiDayBackToBack: true,
        description: 'Comprehensive 100-mile preparation with extended back-to-back runs'
    }
};

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

    /**
     * Generate weekly plan for running
     */
    generateWeeklyPlan(weekNumber, phase, isRecovery, inputs, context) {
        const { weekVolume, distanceConfig, weekProgress } = context;
        const trainingDays = inputs.trainingDays;
        const longDay = inputs.longDay || 'saturday';
        const restDays = inputs.restDays || [];

        // Map long day to index (0 = Monday)
        const longDayIndex = this.getDayIndex(longDay);

        // Initialize days array
        const days = [];
        for (let i = 0; i < 7; i++) {
            days.push({
                dayIndex: i,
                dayName: DAYS[i],
                dayShort: DAYS_SHORT[i],
                workout: null
            });
        }

        // Mark rest days
        restDays.forEach(day => {
            const idx = this.getDayIndex(day);
            if (idx >= 0) {
                days[idx].workout = this.createWorkout('REST', 0);
                days[idx].isRest = true;
            }
        });

        // Calculate workouts for the week
        const workouts = this.planWeekWorkouts(phase, isRecovery, inputs, distanceConfig, weekVolume);

        // Assign workouts to days
        this.assignWorkoutsToDays(days, workouts, longDayIndex, trainingDays);

        // Calculate actual week totals
        const totalMiles = days.reduce((sum, d) => sum + (d.workout?.miles || 0), 0);
        const totalMinutes = days.reduce((sum, d) => sum + (d.workout?.minutes || 0), 0);

        return {
            days,
            totalMiles: Math.round(totalMiles * 10) / 10,
            totalMinutes
        };
    }

    /**
     * Plan workouts for a week based on phase and recovery status
     */
    planWeekWorkouts(phase, isRecovery, inputs, distanceConfig, weekVolume) {
        const workouts = [];
        const fitnessLevel = inputs.fitnessLevel;
        const isUltra = distanceConfig.backToBack;

        // Long run (always included)
        const longRunMiles = this.calculateLongRunMiles(phase, isRecovery, inputs, distanceConfig, weekVolume);
        workouts.push({
            type: isUltra ? 'ULTRA_LONG' : 'LONG_RUN',
            miles: longRunMiles,
            priority: 1,
            dayPreference: 'long'
        });

        // Back-to-back for ultras (day after long run)
        if (isUltra && !isRecovery && phase.name !== 'Taper') {
            const backToBackMiles = Math.round(longRunMiles * 0.5 * 10) / 10;
            workouts.push({
                type: 'MODERATE_RUN',
                miles: backToBackMiles,
                priority: 2,
                dayPreference: 'afterLong',
                note: 'Back-to-back: run on tired legs'
            });
        }

        // Quality workout based on phase
        // Skip quality workouts in early Base phase (first 2 weeks) to build aerobic foundation
        const isEarlyBase = phase.name === 'Base' && context.weekProgress < 0.4;
        const skipQuality = isRecovery || (isEarlyBase && fitnessLevel === 'beginner');

        if (!skipQuality) {
            const qualityWorkout = this.selectQualityWorkout(phase, distanceConfig, fitnessLevel);
            if (qualityWorkout) {
                workouts.push({
                    ...qualityWorkout,
                    priority: 3,
                    dayPreference: 'midweek'
                });
            }
        }

        // Easy runs to fill remaining volume
        const assignedMiles = workouts.reduce((sum, w) => sum + (w.miles || 0), 0);
        const remainingMiles = Math.max(0, weekVolume - assignedMiles);
        const remainingDays = inputs.trainingDays - workouts.length;

        if (remainingDays > 0 && remainingMiles > 0) {
            const easyMilesPerRun = remainingMiles / remainingDays;
            for (let i = 0; i < remainingDays; i++) {
                workouts.push({
                    type: i === 0 && isRecovery ? 'RECOVERY_RUN' : 'EASY_RUN',
                    miles: Math.round(easyMilesPerRun * 10) / 10,
                    priority: 5,
                    dayPreference: 'any'
                });
            }
        }

        return workouts;
    }

    /**
     * Calculate long run miles based on phase progression
     */
    calculateLongRunMiles(phase, isRecovery, inputs, distanceConfig, weekVolume) {
        const peakLongRun = distanceConfig.longRunPeakMiles;
        let longRunMiles;

        // Phase-based long run progression
        switch (phase.name) {
            case 'Base':
                longRunMiles = peakLongRun * 0.5; // Start at 50% of peak
                break;
            case 'Build':
                longRunMiles = peakLongRun * 0.75; // 75% of peak
                break;
            case 'Peak':
                longRunMiles = peakLongRun; // Full peak
                break;
            case 'Taper':
                longRunMiles = peakLongRun * 0.6; // Reduced for taper
                break;
            default:
                longRunMiles = peakLongRun * 0.5;
        }

        // Fitness level adjustment
        if (inputs.fitnessLevel === 'beginner') {
            longRunMiles *= 0.8;
        } else if (inputs.fitnessLevel === 'advanced') {
            longRunMiles *= 1.1;
        }

        // Recovery week reduction
        if (isRecovery) {
            longRunMiles *= 0.7;
        }

        // Cap at reasonable percentage of weekly volume (30-35%)
        const maxLongRun = weekVolume * 0.35;
        longRunMiles = Math.min(longRunMiles, maxLongRun);

        return Math.round(longRunMiles * 10) / 10;
    }

    /**
     * Select quality workout based on phase and distance
     */
    selectQualityWorkout(phase, distanceConfig, fitnessLevel) {
        const isShortDistance = distanceConfig.distance <= 13.1;
        const isUltra = distanceConfig.distance > 26.2;

        let workoutType;
        let miles;

        switch (phase.name) {
            case 'Base':
                // Base: mostly easy with some strides/fartlek
                workoutType = 'FARTLEK';
                miles = isShortDistance ? 5 : 6;
                break;

            case 'Build':
                // Build: tempo and threshold work
                if (isShortDistance) {
                    workoutType = fitnessLevel === 'beginner' ? 'TEMPO' : 'INTERVALS';
                    miles = 5;
                } else if (isUltra) {
                    workoutType = 'HILLS';
                    miles = 8;
                } else {
                    workoutType = 'TEMPO';
                    miles = 7;
                }
                break;

            case 'Peak':
                // Peak: race-specific work
                if (isShortDistance) {
                    workoutType = 'INTERVALS';
                    miles = 6;
                } else if (isUltra) {
                    workoutType = 'MODERATE_RUN';
                    miles = 10;
                } else {
                    workoutType = 'RACE_PACE';
                    miles = 10;
                }
                break;

            case 'Taper':
                // Taper: short quality to stay sharp
                workoutType = isShortDistance ? 'INTERVALS' : 'TEMPO';
                miles = 4;
                break;

            default:
                return null;
        }

        // Adjust for fitness level
        if (fitnessLevel === 'beginner') {
            miles *= 0.8;
        } else if (fitnessLevel === 'advanced') {
            miles *= 1.15;
        }

        return {
            type: workoutType,
            miles: Math.round(miles * 10) / 10
        };
    }

    /**
     * Assign workouts to specific days
     */
    assignWorkoutsToDays(days, workouts, longDayIndex, trainingDays) {
        // Sort workouts by priority
        workouts.sort((a, b) => a.priority - b.priority);

        const usedDays = new Set();

        // Mark already-assigned rest days
        days.forEach((day, idx) => {
            if (day.isRest) usedDays.add(idx);
        });

        for (const workout of workouts) {
            let targetIndex = -1;

            switch (workout.dayPreference) {
                case 'long':
                    targetIndex = longDayIndex;
                    break;

                case 'afterLong':
                    targetIndex = (longDayIndex + 1) % 7;
                    break;

                case 'midweek':
                    // Prefer Tuesday or Wednesday
                    const midweekOptions = [1, 2, 3]; // Tue, Wed, Thu
                    for (const opt of midweekOptions) {
                        if (!usedDays.has(opt)) {
                            targetIndex = opt;
                            break;
                        }
                    }
                    break;

                case 'any':
                default:
                    // Find first available day
                    for (let i = 0; i < 7; i++) {
                        if (!usedDays.has(i)) {
                            targetIndex = i;
                            break;
                        }
                    }
            }

            // If target is taken, find next available
            if (targetIndex >= 0 && usedDays.has(targetIndex)) {
                for (let i = 0; i < 7; i++) {
                    const checkIndex = (targetIndex + i) % 7;
                    if (!usedDays.has(checkIndex)) {
                        targetIndex = checkIndex;
                        break;
                    }
                }
            }

            if (targetIndex >= 0 && !usedDays.has(targetIndex)) {
                days[targetIndex].workout = this.createWorkout(workout.type, workout.miles, workout.note);
                usedDays.add(targetIndex);
            }
        }

        // Fill remaining days with rest
        days.forEach((day, idx) => {
            if (!day.workout) {
                day.workout = this.createWorkout('REST', 0);
            }
        });
    }

    /**
     * Create workout object from type and miles
     */
    createWorkout(type, miles, note = '') {
        const workoutDef = WorkoutTypes[type] || WorkoutTypes.EASY_RUN;

        // Estimate minutes based on workout type
        let minutesPerMile;
        switch (workoutDef.category) {
            case 'easy':
            case 'rest':
                minutesPerMile = 10;
                break;
            case 'moderate':
                minutesPerMile = 9;
                break;
            case 'hard':
                minutesPerMile = 8.5;
                break;
            default:
                minutesPerMile = 10;
        }

        const minutes = type === 'REST' ? 0 : Math.round(miles * minutesPerMile);

        return {
            type,
            name: workoutDef.name,
            miles: miles,
            minutes: minutes,
            duration: this.formatDuration(minutes),
            rpe: workoutDef.rpe,
            purpose: workoutDef.purpose,
            category: workoutDef.category,
            note: note
        };
    }

    /**
     * Get day index from name
     */
    getDayIndex(dayName) {
        const dayMap = {
            'monday': 0, 'mon': 0,
            'tuesday': 1, 'tue': 1,
            'wednesday': 2, 'wed': 2,
            'thursday': 3, 'thu': 3,
            'friday': 4, 'fri': 4,
            'saturday': 5, 'sat': 5,
            'sunday': 6, 'sun': 6
        };
        return dayMap[dayName.toLowerCase()] ?? -1;
    }

    /**
     * Format duration for display
     */
    formatDuration(minutes) {
        if (minutes === 0) return '-';
        if (minutes < 60) return `${minutes} min`;

        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;

        if (mins === 0) return `${hours}h`;
        return `${hours}h ${mins}m`;
    }
}

// Export for use
window.RunningPlanGenerator = RunningPlanGenerator;
window.RunningDistanceConfigs = RunningDistanceConfigs;
