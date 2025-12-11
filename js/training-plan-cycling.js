/**
 * Cycling Training Plan Generator
 * Generates periodized training plans for century rides, gran fondos, and multi-day events
 */

// Cycling event configurations
const CyclingDistanceConfigs = {
    'century': {
        name: 'Century (100 miles)',
        distance: 100,
        minWeeks: 10,
        optimalWeeks: 14,
        maxWeeks: 20,
        taperWeeks: 1,
        longRidePeakHours: 5,
        keyWorkouts: ['ENDURANCE_RIDE', 'SWEET_SPOT', 'TEMPO_RIDE'],
        weeklyVolumeTargets: { beginner: 8, intermediate: 12, advanced: 16 }, // hours
        description: 'Build endurance for a 100-mile ride'
    },
    'granfondo': {
        name: 'Gran Fondo',
        distance: 100,
        minWeeks: 12,
        optimalWeeks: 16,
        maxWeeks: 24,
        taperWeeks: 2,
        longRidePeakHours: 6,
        keyWorkouts: ['ENDURANCE_RIDE', 'CLIMBING', 'SWEET_SPOT', 'TEMPO_RIDE'],
        weeklyVolumeTargets: { beginner: 10, intermediate: 14, advanced: 18 },
        climbingFocus: true,
        description: 'Prepare for hilly gran fondo events with climbing emphasis'
    },
    'multiday': {
        name: 'Multi-Day Event',
        distance: 200,
        minWeeks: 14,
        optimalWeeks: 20,
        maxWeeks: 28,
        taperWeeks: 2,
        longRidePeakHours: 5,
        keyWorkouts: ['ENDURANCE_RIDE', 'SWEET_SPOT', 'RECOVERY_RIDE'],
        weeklyVolumeTargets: { beginner: 10, intermediate: 14, advanced: 20 },
        backToBack: true,
        description: 'Build capacity for consecutive days of riding'
    }
};

/**
 * Cycling Plan Generator - extends TrainingPlanGenerator
 */
class CyclingPlanGenerator extends TrainingPlanGenerator {
    constructor(formId = 'training-plan-form', resultId = 'training-plan-result') {
        super(formId, resultId, 'cycling');
    }

    /**
     * Get cycling event configurations
     */
    getDistanceConfigs() {
        return CyclingDistanceConfigs;
    }

    /**
     * Generate weekly plan for cycling
     */
    generateWeeklyPlan(weekNumber, phase, isRecovery, inputs, context) {
        const { weekVolume, distanceConfig, weekProgress } = context;
        const trainingDays = inputs.trainingDays;
        const longDay = inputs.longDay || 'saturday';

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

        // Calculate workouts for the week (in hours)
        const workouts = this.planWeekWorkouts(phase, isRecovery, inputs, distanceConfig, weekVolume);

        // Assign workouts to days
        this.assignWorkoutsToDays(days, workouts, longDayIndex, trainingDays, distanceConfig);

        // Calculate actual week totals
        const totalHours = days.reduce((sum, d) => sum + (d.workout?.hours || 0), 0);
        const totalMinutes = Math.round(totalHours * 60);

        return {
            days,
            totalHours: Math.round(totalHours * 10) / 10,
            totalMinutes,
            targetVolume: weekVolume
        };
    }

    /**
     * Plan workouts for a week based on phase and recovery status
     */
    planWeekWorkouts(phase, isRecovery, inputs, distanceConfig, weekVolume) {
        const workouts = [];
        const fitnessLevel = inputs.fitnessLevel;
        const isMultiDay = distanceConfig.backToBack;
        const hasClimbingFocus = distanceConfig.climbingFocus && inputs.climbingEmphasis;

        // Long ride (always included)
        const longRideHours = this.calculateLongRideHours(phase, isRecovery, inputs, distanceConfig, weekVolume);
        workouts.push({
            type: 'ENDURANCE_RIDE',
            hours: longRideHours,
            priority: 1,
            dayPreference: 'long',
            note: 'Long ride - maintain steady effort'
        });

        // Back-to-back for multi-day events (day after long ride)
        if (isMultiDay && !isRecovery && phase.name !== 'Taper') {
            const backToBackHours = Math.round(longRideHours * 0.6 * 10) / 10;
            workouts.push({
                type: 'ENDURANCE_RIDE',
                hours: backToBackHours,
                priority: 2,
                dayPreference: 'afterLong',
                note: 'Back-to-back: ride on tired legs'
            });
        }

        // Quality workout based on phase
        if (!isRecovery) {
            const qualityWorkout = this.selectQualityWorkout(phase, distanceConfig, fitnessLevel, hasClimbingFocus);
            if (qualityWorkout) {
                workouts.push({
                    ...qualityWorkout,
                    priority: 3,
                    dayPreference: 'midweek'
                });
            }

            // Second quality workout for advanced or peak phase
            if ((fitnessLevel === 'advanced' || phase.name === 'Peak') && !isRecovery) {
                const secondQuality = this.selectSecondaryWorkout(phase, distanceConfig, hasClimbingFocus);
                if (secondQuality) {
                    workouts.push({
                        ...secondQuality,
                        priority: 4,
                        dayPreference: 'midweek2'
                    });
                }
            }
        }

        // Easy rides to fill remaining volume
        const assignedHours = workouts.reduce((sum, w) => sum + (w.hours || 0), 0);
        const remainingHours = Math.max(0, weekVolume - assignedHours);
        const remainingDays = inputs.trainingDays - workouts.length;

        if (remainingDays > 0 && remainingHours > 0) {
            const easyHoursPerRide = remainingHours / remainingDays;
            for (let i = 0; i < remainingDays; i++) {
                workouts.push({
                    type: isRecovery ? 'RECOVERY_RIDE' : 'ENDURANCE_RIDE',
                    hours: Math.round(easyHoursPerRide * 10) / 10,
                    priority: 5,
                    dayPreference: 'any'
                });
            }
        }

        return workouts;
    }

    /**
     * Calculate long ride hours based on phase progression
     */
    calculateLongRideHours(phase, isRecovery, inputs, distanceConfig, weekVolume) {
        const peakLongRide = distanceConfig.longRidePeakHours;
        let longRideHours;

        // Phase-based long ride progression
        switch (phase.name) {
            case 'Base':
                longRideHours = peakLongRide * 0.5;
                break;
            case 'Build':
                longRideHours = peakLongRide * 0.75;
                break;
            case 'Peak':
                longRideHours = peakLongRide;
                break;
            case 'Taper':
                longRideHours = peakLongRide * 0.6;
                break;
            default:
                longRideHours = peakLongRide * 0.5;
        }

        // Fitness level adjustment
        if (inputs.fitnessLevel === 'beginner') {
            longRideHours *= 0.8;
        } else if (inputs.fitnessLevel === 'advanced') {
            longRideHours *= 1.1;
        }

        // Recovery week reduction
        if (isRecovery) {
            longRideHours *= 0.65;
        }

        // Cap at reasonable percentage of weekly volume (35-40%)
        const maxLongRide = weekVolume * 0.40;
        longRideHours = Math.min(longRideHours, maxLongRide);

        return Math.round(longRideHours * 10) / 10;
    }

    /**
     * Select quality workout based on phase and event type
     */
    selectQualityWorkout(phase, distanceConfig, fitnessLevel, hasClimbingFocus) {
        let workoutType;
        let hours;

        switch (phase.name) {
            case 'Base':
                workoutType = 'ENDURANCE_RIDE';
                hours = 1.5;
                break;

            case 'Build':
                if (hasClimbingFocus) {
                    workoutType = 'CLIMBING';
                    hours = 1.5;
                } else {
                    workoutType = 'SWEET_SPOT';
                    hours = 1.5;
                }
                break;

            case 'Peak':
                if (hasClimbingFocus) {
                    workoutType = 'CLIMBING';
                    hours = 2;
                } else {
                    workoutType = 'TEMPO_RIDE';
                    hours = 1.5;
                }
                break;

            case 'Taper':
                workoutType = 'SWEET_SPOT';
                hours = 1;
                break;

            default:
                return null;
        }

        // Adjust for fitness level
        if (fitnessLevel === 'beginner') {
            hours *= 0.8;
        } else if (fitnessLevel === 'advanced') {
            hours *= 1.15;
        }

        return {
            type: workoutType,
            hours: Math.round(hours * 10) / 10
        };
    }

    /**
     * Select secondary quality workout
     */
    selectSecondaryWorkout(phase, distanceConfig, hasClimbingFocus) {
        if (phase.name === 'Base' || phase.name === 'Taper') {
            return null;
        }

        let workoutType;
        let hours = 1;

        if (phase.name === 'Peak') {
            workoutType = 'VO2_INTERVALS';
            hours = 1;
        } else {
            workoutType = hasClimbingFocus ? 'SWEET_SPOT' : 'TEMPO_RIDE';
            hours = 1.25;
        }

        return {
            type: workoutType,
            hours
        };
    }

    /**
     * Assign workouts to specific days
     */
    assignWorkoutsToDays(days, workouts, longDayIndex, trainingDays, distanceConfig) {
        // Sort workouts by priority
        workouts.sort((a, b) => a.priority - b.priority);

        const usedDays = new Set();

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
                    const midweekOptions = [1, 2, 3];
                    for (const opt of midweekOptions) {
                        if (!usedDays.has(opt)) {
                            targetIndex = opt;
                            break;
                        }
                    }
                    break;

                case 'midweek2':
                    // Prefer Thursday
                    const midweek2Options = [3, 4, 2];
                    for (const opt of midweek2Options) {
                        if (!usedDays.has(opt)) {
                            targetIndex = opt;
                            break;
                        }
                    }
                    break;

                case 'any':
                default:
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
                days[targetIndex].workout = this.createWorkout(workout.type, workout.hours, workout.note);
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
     * Create workout object from type and hours
     */
    createWorkout(type, hours, note = '') {
        const workoutDef = WorkoutTypes[type] || WorkoutTypes.ENDURANCE_RIDE;
        const minutes = type === 'REST' ? 0 : Math.round(hours * 60);

        return {
            type,
            name: workoutDef.name,
            hours: hours,
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

    /**
     * Override to show hours instead of miles
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
        return section;
    }
}

// Export for use
window.CyclingPlanGenerator = CyclingPlanGenerator;
window.CyclingDistanceConfigs = CyclingDistanceConfigs;
