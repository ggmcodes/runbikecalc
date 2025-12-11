/**
 * Triathlon Training Plan Generator
 * Generates periodized training plans for Sprint, Olympic, 70.3, and Ironman triathlons
 */

// Triathlon event configurations
const TriathlonDistanceConfigs = {
    'sprint': {
        name: 'Sprint Triathlon',
        swim: 750, // meters
        bike: 20, // km
        run: 5, // km
        minWeeks: 8,
        optimalWeeks: 12,
        maxWeeks: 16,
        taperDays: 7,
        keyWorkouts: ['SWIM_TECHNIQUE', 'TEMPO_RIDE', 'TEMPO_RUN', 'BRICK'],
        weeklyVolumeTargets: { beginner: 6, intermediate: 8, advanced: 10 }, // hours
        sportDistribution: { swim: 0.20, bike: 0.40, run: 0.30, brick: 0.10 },
        description: 'Build speed and efficiency for sprint-distance racing'
    },
    'olympic': {
        name: 'Olympic Triathlon',
        swim: 1500, // meters
        bike: 40, // km
        run: 10, // km
        minWeeks: 10,
        optimalWeeks: 14,
        maxWeeks: 20,
        taperDays: 10,
        keyWorkouts: ['SWIM_ENDURANCE', 'SWEET_SPOT', 'TEMPO_RUN', 'BRICK'],
        weeklyVolumeTargets: { beginner: 8, intermediate: 10, advanced: 14 },
        sportDistribution: { swim: 0.20, bike: 0.40, run: 0.30, brick: 0.10 },
        description: 'Develop endurance and race-day efficiency for Olympic distance'
    },
    '70.3': {
        name: 'Half Ironman (70.3)',
        swim: 1900, // meters
        bike: 90, // km
        run: 21.1, // km
        minWeeks: 14,
        optimalWeeks: 20,
        maxWeeks: 28,
        taperDays: 14,
        keyWorkouts: ['SWIM_ENDURANCE', 'ENDURANCE_RIDE', 'LONG_RUN', 'BRICK'],
        weeklyVolumeTargets: { beginner: 10, intermediate: 14, advanced: 18 },
        sportDistribution: { swim: 0.15, bike: 0.45, run: 0.30, brick: 0.10 },
        description: 'Build aerobic base and race-specific endurance for 70.3'
    },
    'ironman': {
        name: 'Ironman (140.6)',
        swim: 3800, // meters
        bike: 180, // km
        run: 42.2, // km
        minWeeks: 20,
        optimalWeeks: 28,
        maxWeeks: 36,
        taperDays: 21,
        keyWorkouts: ['OPEN_WATER', 'ENDURANCE_RIDE', 'LONG_RUN', 'BRICK'],
        weeklyVolumeTargets: { beginner: 12, intermediate: 16, advanced: 22 },
        sportDistribution: { swim: 0.12, bike: 0.50, run: 0.28, brick: 0.10 },
        description: 'Comprehensive preparation for full Ironman distance'
    }
};

// Triathlon-specific workout types
const TriathlonWorkoutTypes = {
    // Swim workouts
    SWIM_TECHNIQUE: {
        name: 'Swim Technique',
        rpe: '4-5',
        purpose: 'Focus on form, drills, and efficiency',
        category: 'swim',
        sport: 'swim'
    },
    SWIM_ENDURANCE: {
        name: 'Swim Endurance',
        rpe: '5-6',
        purpose: 'Build aerobic capacity in the water',
        category: 'endurance',
        sport: 'swim'
    },
    OPEN_WATER: {
        name: 'Open Water Swim',
        rpe: '5-6',
        purpose: 'Practice sighting, navigation, and race simulation',
        category: 'endurance',
        sport: 'swim'
    },
    SWIM_INTERVALS: {
        name: 'Swim Intervals',
        rpe: '7-8',
        purpose: 'Build speed and lactate tolerance',
        category: 'intensity',
        sport: 'swim'
    },

    // Bike workouts
    ENDURANCE_RIDE: {
        name: 'Endurance Ride',
        rpe: '3-4',
        purpose: 'Build aerobic base and fat adaptation',
        category: 'endurance',
        sport: 'bike'
    },
    SWEET_SPOT: {
        name: 'Sweet Spot',
        rpe: '5-6',
        purpose: 'Efficient training at 88-93% FTP',
        category: 'threshold',
        sport: 'bike'
    },
    TEMPO_RIDE: {
        name: 'Tempo Ride',
        rpe: '6-7',
        purpose: 'Sustained power for race simulation',
        category: 'threshold',
        sport: 'bike'
    },
    RECOVERY_RIDE: {
        name: 'Recovery Ride',
        rpe: '2-3',
        purpose: 'Active recovery and blood flow',
        category: 'recovery',
        sport: 'bike'
    },

    // Run workouts
    EASY_RUN: {
        name: 'Easy Run',
        rpe: '3-4',
        purpose: 'Aerobic development and recovery',
        category: 'endurance',
        sport: 'run'
    },
    LONG_RUN: {
        name: 'Long Run',
        rpe: '4-5',
        purpose: 'Build endurance and mental toughness',
        category: 'endurance',
        sport: 'run'
    },
    TEMPO_RUN: {
        name: 'Tempo Run',
        rpe: '6-7',
        purpose: 'Improve lactate threshold',
        category: 'threshold',
        sport: 'run'
    },
    RUN_INTERVALS: {
        name: 'Run Intervals',
        rpe: '8-9',
        purpose: 'Build speed and VO2max',
        category: 'intensity',
        sport: 'run'
    },

    // Multi-sport workouts
    BRICK: {
        name: 'Brick (Bike + Run)',
        rpe: '5-7',
        purpose: 'Practice bike-to-run transition and running on tired legs',
        category: 'race-specific',
        sport: 'multi'
    },

    // Rest
    REST: {
        name: 'Rest Day',
        rpe: '-',
        purpose: 'Recovery and adaptation',
        category: 'recovery',
        sport: 'rest'
    }
};

/**
 * Triathlon Plan Generator - extends TrainingPlanGenerator
 */
class TriathlonPlanGenerator extends TrainingPlanGenerator {
    constructor(formId = 'training-plan-form', resultId = 'training-plan-result') {
        super(formId, resultId, 'triathlon');
    }

    /**
     * Get triathlon event configurations
     */
    getDistanceConfigs() {
        return TriathlonDistanceConfigs;
    }

    /**
     * Generate weekly plan for triathlon
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

        // Calculate workouts for the week
        const workouts = this.planWeekWorkouts(phase, isRecovery, inputs, distanceConfig, weekVolume);

        // Assign workouts to days
        this.assignWorkoutsToDays(days, workouts, longDayIndex, trainingDays, distanceConfig);

        // Calculate actual week totals
        const totalHours = days.reduce((sum, d) => sum + (d.workout?.hours || 0), 0);
        const totalMinutes = Math.round(totalHours * 60);

        // Calculate sport breakdown
        const sportBreakdown = this.calculateSportBreakdown(days);

        return {
            days,
            totalHours: Math.round(totalHours * 10) / 10,
            totalMinutes,
            targetVolume: weekVolume,
            sportBreakdown
        };
    }

    /**
     * Plan workouts for a week based on phase and recovery status
     */
    planWeekWorkouts(phase, isRecovery, inputs, distanceConfig, weekVolume) {
        const workouts = [];
        const fitnessLevel = inputs.fitnessLevel;
        const distribution = distanceConfig.sportDistribution;
        const swimPreference = inputs.swimPreference || 'pool';

        // Calculate hours per sport
        const swimHours = weekVolume * distribution.swim;
        const bikeHours = weekVolume * distribution.bike;
        const runHours = weekVolume * distribution.run;
        const brickHours = weekVolume * distribution.brick;

        // Recovery week adjustments
        const recoveryMultiplier = isRecovery ? 0.65 : 1.0;

        // === SWIM WORKOUTS ===
        const swimSessions = this.planSwimSessions(phase, swimHours * recoveryMultiplier, swimPreference, isRecovery, distanceConfig);
        workouts.push(...swimSessions);

        // === BIKE WORKOUTS ===
        const bikeSessions = this.planBikeSessions(phase, bikeHours * recoveryMultiplier, isRecovery, fitnessLevel);
        workouts.push(...bikeSessions);

        // === RUN WORKOUTS ===
        const runSessions = this.planRunSessions(phase, runHours * recoveryMultiplier, isRecovery, fitnessLevel);
        workouts.push(...runSessions);

        // === BRICK WORKOUT ===
        if (!isRecovery && phase.name !== 'Taper') {
            workouts.push({
                type: 'BRICK',
                hours: Math.round(brickHours * recoveryMultiplier * 10) / 10,
                priority: 2,
                dayPreference: 'weekend',
                note: 'Bike followed by run transition'
            });
        }

        return workouts;
    }

    /**
     * Plan swim sessions for the week
     */
    planSwimSessions(phase, totalSwimHours, swimPreference, isRecovery, distanceConfig) {
        const sessions = [];

        if (totalSwimHours < 0.5) {
            // Single short swim
            sessions.push({
                type: 'SWIM_TECHNIQUE',
                hours: Math.max(0.5, totalSwimHours),
                priority: 4,
                dayPreference: 'midweek',
                note: 'Focus on form and drills'
            });
            return sessions;
        }

        // Primary swim session
        let primaryType = 'SWIM_TECHNIQUE';
        let primaryHours = totalSwimHours * 0.6;

        switch (phase.name) {
            case 'Base':
                primaryType = 'SWIM_TECHNIQUE';
                break;
            case 'Build':
                primaryType = 'SWIM_ENDURANCE';
                break;
            case 'Peak':
                primaryType = swimPreference === 'openwater' ? 'OPEN_WATER' : 'SWIM_ENDURANCE';
                break;
            case 'Taper':
                primaryType = 'SWIM_TECHNIQUE';
                primaryHours *= 0.8;
                break;
        }

        sessions.push({
            type: primaryType,
            hours: Math.round(primaryHours * 10) / 10,
            priority: 3,
            dayPreference: 'swim1',
            note: TriathlonWorkoutTypes[primaryType].purpose
        });

        // Secondary swim if enough hours
        if (totalSwimHours >= 2) {
            const secondaryHours = totalSwimHours - primaryHours;
            const secondaryType = phase.name === 'Peak' ? 'SWIM_INTERVALS' : 'SWIM_TECHNIQUE';

            sessions.push({
                type: secondaryType,
                hours: Math.round(secondaryHours * 10) / 10,
                priority: 5,
                dayPreference: 'swim2',
                note: TriathlonWorkoutTypes[secondaryType].purpose
            });
        }

        return sessions;
    }

    /**
     * Plan bike sessions for the week
     */
    planBikeSessions(phase, totalBikeHours, isRecovery, fitnessLevel) {
        const sessions = [];

        if (totalBikeHours < 1) {
            sessions.push({
                type: 'ENDURANCE_RIDE',
                hours: Math.max(1, totalBikeHours),
                priority: 3,
                dayPreference: 'weekend',
                note: 'Build aerobic base'
            });
            return sessions;
        }

        // Long ride (primary bike session)
        let longRideHours = totalBikeHours * 0.5;
        sessions.push({
            type: 'ENDURANCE_RIDE',
            hours: Math.round(longRideHours * 10) / 10,
            priority: 1,
            dayPreference: 'long',
            note: 'Long ride - steady effort'
        });

        // Quality bike session based on phase
        const remainingHours = totalBikeHours - longRideHours;

        if (remainingHours >= 1 && !isRecovery) {
            let qualityType = 'ENDURANCE_RIDE';
            let qualityHours = remainingHours * 0.6;

            switch (phase.name) {
                case 'Base':
                    qualityType = 'ENDURANCE_RIDE';
                    break;
                case 'Build':
                    qualityType = 'SWEET_SPOT';
                    break;
                case 'Peak':
                    qualityType = 'TEMPO_RIDE';
                    break;
                case 'Taper':
                    qualityType = 'RECOVERY_RIDE';
                    qualityHours *= 0.7;
                    break;
            }

            sessions.push({
                type: qualityType,
                hours: Math.round(qualityHours * 10) / 10,
                priority: 4,
                dayPreference: 'midweek',
                note: TriathlonWorkoutTypes[qualityType].purpose
            });

            // Fill remaining with easy ride
            const easyHours = remainingHours - qualityHours;
            if (easyHours >= 0.75) {
                sessions.push({
                    type: isRecovery ? 'RECOVERY_RIDE' : 'ENDURANCE_RIDE',
                    hours: Math.round(easyHours * 10) / 10,
                    priority: 6,
                    dayPreference: 'any',
                    note: 'Easy spin'
                });
            }
        }

        return sessions;
    }

    /**
     * Plan run sessions for the week
     */
    planRunSessions(phase, totalRunHours, isRecovery, fitnessLevel) {
        const sessions = [];

        if (totalRunHours < 1) {
            sessions.push({
                type: 'EASY_RUN',
                hours: Math.max(0.5, totalRunHours),
                priority: 4,
                dayPreference: 'midweek',
                note: 'Easy aerobic run'
            });
            return sessions;
        }

        // Long run
        let longRunHours = totalRunHours * 0.45;
        sessions.push({
            type: 'LONG_RUN',
            hours: Math.round(longRunHours * 10) / 10,
            priority: 2,
            dayPreference: 'afterLong', // Day after long bike
            note: 'Build run endurance'
        });

        // Quality run session based on phase
        const remainingHours = totalRunHours - longRunHours;

        if (remainingHours >= 0.75 && !isRecovery) {
            let qualityType = 'EASY_RUN';
            let qualityHours = remainingHours * 0.5;

            switch (phase.name) {
                case 'Base':
                    qualityType = 'EASY_RUN';
                    break;
                case 'Build':
                    qualityType = 'TEMPO_RUN';
                    break;
                case 'Peak':
                    qualityType = fitnessLevel === 'advanced' ? 'RUN_INTERVALS' : 'TEMPO_RUN';
                    break;
                case 'Taper':
                    qualityType = 'EASY_RUN';
                    qualityHours *= 0.8;
                    break;
            }

            sessions.push({
                type: qualityType,
                hours: Math.round(qualityHours * 10) / 10,
                priority: 5,
                dayPreference: 'midweek2',
                note: TriathlonWorkoutTypes[qualityType].purpose
            });

            // Fill remaining with easy run
            const easyHours = remainingHours - qualityHours;
            if (easyHours >= 0.5) {
                sessions.push({
                    type: 'EASY_RUN',
                    hours: Math.round(easyHours * 10) / 10,
                    priority: 7,
                    dayPreference: 'any',
                    note: 'Easy recovery run'
                });
            }
        }

        return sessions;
    }

    /**
     * Assign workouts to specific days
     */
    assignWorkoutsToDays(days, workouts, longDayIndex, trainingDays, distanceConfig) {
        // Sort workouts by priority
        workouts.sort((a, b) => a.priority - b.priority);

        const usedDays = new Set();
        const dayPreferenceMap = {
            'long': longDayIndex,
            'afterLong': (longDayIndex + 1) % 7,
            'weekend': longDayIndex === 5 ? 6 : longDayIndex, // Sunday if long ride is Saturday
            'swim1': 1, // Tuesday
            'swim2': 4, // Friday
            'midweek': 2, // Wednesday
            'midweek2': 3 // Thursday
        };

        for (const workout of workouts) {
            let targetIndex = -1;

            if (workout.dayPreference === 'any') {
                // Find first available day
                for (let i = 0; i < 7; i++) {
                    if (!usedDays.has(i)) {
                        targetIndex = i;
                        break;
                    }
                }
            } else {
                targetIndex = dayPreferenceMap[workout.dayPreference] ?? -1;
            }

            // If target is taken, find next available
            if (targetIndex >= 0 && usedDays.has(targetIndex)) {
                for (let i = 1; i <= 7; i++) {
                    const checkIndex = (targetIndex + i) % 7;
                    if (!usedDays.has(checkIndex)) {
                        targetIndex = checkIndex;
                        break;
                    }
                }
            }

            if (targetIndex >= 0 && !usedDays.has(targetIndex) && usedDays.size < trainingDays) {
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
        const workoutDef = TriathlonWorkoutTypes[type] || TriathlonWorkoutTypes.REST;
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
            sport: workoutDef.sport,
            note: note
        };
    }

    /**
     * Calculate sport breakdown for the week
     */
    calculateSportBreakdown(days) {
        const breakdown = { swim: 0, bike: 0, run: 0, multi: 0 };

        days.forEach(day => {
            if (day.workout && day.workout.sport) {
                const sport = day.workout.sport;
                if (breakdown.hasOwnProperty(sport)) {
                    breakdown[sport] += day.workout.hours || 0;
                }
            }
        });

        return {
            swim: Math.round(breakdown.swim * 10) / 10,
            bike: Math.round(breakdown.bike * 10) / 10,
            run: Math.round(breakdown.run * 10) / 10,
            multi: Math.round(breakdown.multi * 10) / 10
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
     * Override to show sport breakdown
     */
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

        // Add sport distribution info
        const distInfo = document.createElement('div');
        distInfo.className = 'mt-6 p-4 bg-gray-50 rounded-lg';

        const distTitle = document.createElement('h4');
        distTitle.className = 'font-semibold text-gray-700 mb-2';
        distTitle.textContent = 'Weekly Sport Distribution';
        distInfo.appendChild(distTitle);

        const distConfig = plan.distanceConfig.sportDistribution;
        const distText = document.createElement('p');
        distText.className = 'text-gray-600 text-sm';
        distText.textContent = `Swim: ${Math.round(distConfig.swim * 100)}% | Bike: ${Math.round(distConfig.bike * 100)}% | Run: ${Math.round(distConfig.run * 100)}% | Brick: ${Math.round(distConfig.brick * 100)}%`;
        distInfo.appendChild(distText);

        section.appendChild(distInfo);

        return section;
    }

    /**
     * Get sport icon for workout display
     */
    getSportIcon(sport) {
        const icons = {
            'swim': '🏊',
            'bike': '🚴',
            'run': '🏃',
            'multi': '🔄',
            'rest': '😴'
        };
        return icons[sport] || '🏋️';
    }
}

// Export for use
window.TriathlonPlanGenerator = TriathlonPlanGenerator;
window.TriathlonDistanceConfigs = TriathlonDistanceConfigs;
window.TriathlonWorkoutTypes = TriathlonWorkoutTypes;
