/**
 * Hyrox Training Plan Generator
 * Generates periodized training plans for Hyrox fitness racing
 *
 * Hyrox format: 8 x 1km runs + 8 functional workout stations
 * Stations: SkiErg, Sled Push, Sled Pull, Burpee Broad Jumps, Rowing,
 *           Farmers Carry, Sandbag Lunges, Wall Balls
 */

// Hyrox event configurations
const HyroxDistanceConfigs = {
    'first-timer': {
        name: 'First Hyrox (Beginner)',
        category: 'open',
        minWeeks: 8,
        optimalWeeks: 12,
        maxWeeks: 16,
        taperDays: 7,
        keyWorkouts: ['EASY_RUN', 'STATION_TECHNIQUE', 'MIXED_CONDITIONING', 'HALF_SIMULATION'],
        weeklyVolumeTargets: { beginner: 5, intermediate: 7, advanced: 9 },
        focusAreas: ['running_base', 'station_technique', 'aerobic_capacity'],
        description: 'Build fitness foundation and learn all 8 stations for your first Hyrox'
    },
    'open': {
        name: 'Hyrox Open',
        category: 'open',
        minWeeks: 10,
        optimalWeeks: 14,
        maxWeeks: 20,
        taperDays: 10,
        keyWorkouts: ['TEMPO_RUN', 'STATION_DRILLS', 'GRIP_STRENGTH', 'FULL_SIMULATION'],
        weeklyVolumeTargets: { beginner: 6, intermediate: 9, advanced: 12 },
        focusAreas: ['running_capacity', 'station_endurance', 'lactate_threshold'],
        description: 'Compete in Hyrox Open division with lighter station weights'
    },
    'pro': {
        name: 'Hyrox Pro',
        category: 'pro',
        minWeeks: 12,
        optimalWeeks: 16,
        maxWeeks: 24,
        taperDays: 12,
        keyWorkouts: ['INTERVAL_RUN', 'HEAVY_STATION_WORK', 'STRENGTH_ENDURANCE', 'FULL_SIMULATION'],
        weeklyVolumeTargets: { beginner: 8, intermediate: 11, advanced: 15 },
        focusAreas: ['running_speed', 'strength_endurance', 'mental_toughness'],
        description: 'Train for Hyrox Pro division with competition-weight stations'
    },
    'doubles': {
        name: 'Hyrox Doubles',
        category: 'doubles',
        minWeeks: 8,
        optimalWeeks: 12,
        maxWeeks: 16,
        taperDays: 7,
        keyWorkouts: ['TEMPO_RUN', 'STATION_DRILLS', 'PARTNER_WORKOUT', 'HALF_SIMULATION'],
        weeklyVolumeTargets: { beginner: 5, intermediate: 7, advanced: 10 },
        focusAreas: ['running_capacity', 'station_proficiency', 'partner_strategy'],
        description: 'Train with your partner for Hyrox Doubles competition'
    }
};

// Hyrox station specifications
const HyroxStations = {
    SKIERG: {
        name: 'SkiErg',
        distance: '1000m',
        muscles: ['lats', 'triceps', 'core'],
        tips: 'Maintain rhythm, dont go out too fast. Use legs to drive power.',
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
        tips: 'Stay low, drive through legs. Short choppy steps work best.',
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
        tips: 'Hand-over-hand technique. Sit back and use bodyweight.',
        order: 3
    },
    BURPEE_BROAD_JUMPS: {
        name: 'Burpee Broad Jumps',
        distance: '80m',
        muscles: ['full_body', 'legs', 'shoulders'],
        tips: 'Find sustainable pace. Jump forward not up. Minimize ground time.',
        order: 4
    },
    ROWING: {
        name: 'Rowing',
        distance: '1000m',
        muscles: ['legs', 'back', 'arms', 'core'],
        tips: 'Legs drive 60% of power. Maintain consistent split time.',
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
        tips: 'Grip is key. Walk fast with short strides. Breathe steadily.',
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
        tips: 'Alternate legs. Keep torso upright. Find your rhythm.',
        order: 7
    },
    WALL_BALLS: {
        name: 'Wall Balls',
        reps: { women: 75, men: 100 },
        weights: { women: '4kg', men: '6kg' },
        target: '9ft / 2.74m',
        muscles: ['quads', 'shoulders', 'core'],
        tips: 'Break into sets early. Catch and throw in one motion.',
        order: 8
    }
};

// Hyrox-specific workout types
const HyroxWorkoutTypes = {
    // Running workouts
    EASY_RUN: {
        name: 'Easy Run',
        rpe: '3-4',
        purpose: 'Build aerobic base and recovery between hard sessions',
        category: 'running',
        sport: 'run'
    },
    TEMPO_RUN: {
        name: 'Tempo Run',
        rpe: '6-7',
        purpose: 'Build lactate threshold - crucial for Hyrox pacing',
        category: 'running',
        sport: 'run'
    },
    INTERVAL_RUN: {
        name: '1km Repeats',
        rpe: '7-8',
        purpose: 'Race-specific intervals mimicking Hyrox run segments',
        category: 'running',
        sport: 'run'
    },
    HYROX_PACE_RUN: {
        name: 'Hyrox Pace Run',
        rpe: '5-6',
        purpose: 'Practice target race pace for the 1km segments',
        category: 'running',
        sport: 'run'
    },

    // Station-specific workouts
    STATION_TECHNIQUE: {
        name: 'Station Technique',
        rpe: '4-5',
        purpose: 'Learn proper form on all 8 stations at light weights',
        category: 'stations',
        sport: 'functional'
    },
    STATION_DRILLS: {
        name: 'Station Drills',
        rpe: '6-7',
        purpose: 'Build station proficiency with race-weight practice',
        category: 'stations',
        sport: 'functional'
    },
    HEAVY_STATION_WORK: {
        name: 'Heavy Station Work',
        rpe: '7-8',
        purpose: 'Build strength endurance at or above race weights',
        category: 'stations',
        sport: 'functional'
    },

    // Strength workouts
    GRIP_STRENGTH: {
        name: 'Grip Strength',
        rpe: '6-7',
        purpose: 'Develop grip endurance for sled pull, farmers carry, wall balls',
        category: 'strength',
        sport: 'strength'
    },
    STRENGTH_ENDURANCE: {
        name: 'Strength Endurance',
        rpe: '6-7',
        purpose: 'Build muscular endurance for sustained station work',
        category: 'strength',
        sport: 'strength'
    },
    LEG_STRENGTH: {
        name: 'Leg Strength',
        rpe: '6-7',
        purpose: 'Build leg power for sled work, lunges, and running',
        category: 'strength',
        sport: 'strength'
    },

    // Mixed conditioning
    MIXED_CONDITIONING: {
        name: 'Mixed Conditioning',
        rpe: '6-7',
        purpose: 'Combine running with functional movements',
        category: 'conditioning',
        sport: 'mixed'
    },
    ROXZONE_PRACTICE: {
        name: 'Roxzone Transitions',
        rpe: '5-6',
        purpose: 'Practice moving efficiently between stations and runs',
        category: 'conditioning',
        sport: 'mixed'
    },

    // Simulations
    HALF_SIMULATION: {
        name: 'Half Hyrox Simulation',
        rpe: '7-8',
        purpose: '4 runs + 4 stations at race effort to build specificity',
        category: 'simulation',
        sport: 'hyrox'
    },
    FULL_SIMULATION: {
        name: 'Full Hyrox Simulation',
        rpe: '8-9',
        purpose: 'Complete race simulation - all 8 runs and 8 stations',
        category: 'simulation',
        sport: 'hyrox'
    },

    // Partner workouts (for doubles)
    PARTNER_WORKOUT: {
        name: 'Partner Workout',
        rpe: '6-7',
        purpose: 'Practice alternating work with your doubles partner',
        category: 'partner',
        sport: 'mixed'
    },

    // Recovery
    ACTIVE_RECOVERY: {
        name: 'Active Recovery',
        rpe: '2-3',
        purpose: 'Light movement to promote recovery - walk, easy bike, mobility',
        category: 'recovery',
        sport: 'recovery'
    },
    REST: {
        name: 'Rest Day',
        rpe: '-',
        purpose: 'Complete rest for adaptation and recovery',
        category: 'recovery',
        sport: 'rest'
    }
};

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

    /**
     * Generate weekly plan for Hyrox
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
        const workouts = this.planWeekWorkouts(phase, isRecovery, inputs, distanceConfig, weekVolume, weekProgress);

        // Assign workouts to days
        this.assignWorkoutsToDays(days, workouts, longDayIndex, trainingDays, distanceConfig);

        // Calculate actual week totals
        const totalHours = days.reduce((sum, d) => sum + (d.workout?.hours || 0), 0);
        const totalMinutes = Math.round(totalHours * 60);

        // Calculate training distribution
        const distribution = this.calculateTrainingDistribution(days);

        return {
            days,
            totalHours: Math.round(totalHours * 10) / 10,
            totalMinutes,
            targetVolume: weekVolume,
            distribution
        };
    }

    /**
     * Plan workouts for a week based on phase and recovery status
     */
    planWeekWorkouts(phase, isRecovery, inputs, distanceConfig, weekVolume, weekProgress) {
        const workouts = [];
        const fitnessLevel = inputs.fitnessLevel;
        const isDoubles = distanceConfig.category === 'doubles';
        const isPro = distanceConfig.category === 'pro';
        const isFirstTimer = distanceConfig.name.includes('First');

        // Recovery week adjustments
        const recoveryMultiplier = isRecovery ? 0.6 : 1.0;

        // Calculate hours allocation
        const runningPct = this.getRunningPercentage(phase);
        const stationPct = this.getStationPercentage(phase);
        const strengthPct = this.getStrengthPercentage(phase);

        const runningHours = weekVolume * runningPct * recoveryMultiplier;
        const stationHours = weekVolume * stationPct * recoveryMultiplier;
        const strengthHours = weekVolume * strengthPct * recoveryMultiplier;

        // === RUNNING WORKOUTS ===
        workouts.push(...this.planRunningWorkouts(phase, runningHours, isRecovery, fitnessLevel));

        // === STATION/FUNCTIONAL WORKOUTS ===
        workouts.push(...this.planStationWorkouts(phase, stationHours, isRecovery, isPro, isFirstTimer));

        // === STRENGTH WORKOUTS ===
        if (strengthHours >= 0.5) {
            workouts.push(...this.planStrengthWorkouts(phase, strengthHours, isRecovery, isPro));
        }

        // === SIMULATION WORKOUTS (Peak phase or late Build) ===
        if (!isRecovery && (phase.name === 'Peak' || (phase.name === 'Build' && weekProgress > 0.5))) {
            const simType = phase.name === 'Peak' ? 'FULL_SIMULATION' : 'HALF_SIMULATION';
            workouts.push({
                type: simType,
                hours: simType === 'FULL_SIMULATION' ? 2 : 1.25,
                priority: 1,
                dayPreference: 'long',
                note: HyroxWorkoutTypes[simType].purpose
            });
        }

        // === PARTNER WORKOUT (for doubles) ===
        if (isDoubles && !isRecovery) {
            workouts.push({
                type: 'PARTNER_WORKOUT',
                hours: 1,
                priority: 3,
                dayPreference: 'midweek',
                note: 'Practice with your doubles partner'
            });
        }

        return workouts;
    }

    /**
     * Get running percentage based on phase
     */
    getRunningPercentage(phase) {
        switch (phase.name) {
            case 'Base': return 0.45;
            case 'Build': return 0.35;
            case 'Peak': return 0.30;
            case 'Taper': return 0.40;
            default: return 0.35;
        }
    }

    /**
     * Get station work percentage based on phase
     */
    getStationPercentage(phase) {
        switch (phase.name) {
            case 'Base': return 0.25;
            case 'Build': return 0.40;
            case 'Peak': return 0.45;
            case 'Taper': return 0.35;
            default: return 0.35;
        }
    }

    /**
     * Get strength percentage based on phase
     */
    getStrengthPercentage(phase) {
        switch (phase.name) {
            case 'Base': return 0.30;
            case 'Build': return 0.25;
            case 'Peak': return 0.15;
            case 'Taper': return 0.15;
            default: return 0.25;
        }
    }

    /**
     * Plan running workouts
     */
    planRunningWorkouts(phase, totalHours, isRecovery, fitnessLevel) {
        const workouts = [];

        if (totalHours < 1) {
            workouts.push({
                type: 'EASY_RUN',
                hours: Math.max(0.5, totalHours),
                priority: 4,
                dayPreference: 'any',
                note: 'Maintain running base'
            });
            return workouts;
        }

        // Primary run based on phase
        let primaryType = 'EASY_RUN';
        let primaryHours = totalHours * 0.4;

        switch (phase.name) {
            case 'Base':
                primaryType = 'EASY_RUN';
                primaryHours = totalHours * 0.5;
                break;
            case 'Build':
                primaryType = 'TEMPO_RUN';
                break;
            case 'Peak':
                primaryType = 'INTERVAL_RUN';
                break;
            case 'Taper':
                primaryType = 'HYROX_PACE_RUN';
                primaryHours = totalHours * 0.5;
                break;
        }

        workouts.push({
            type: primaryType,
            hours: Math.round(primaryHours * 10) / 10,
            priority: 2,
            dayPreference: 'run1',
            note: HyroxWorkoutTypes[primaryType].purpose
        });

        // Secondary run
        const remainingHours = totalHours - primaryHours;
        if (remainingHours >= 0.5) {
            const secondaryType = phase.name === 'Peak' ? 'HYROX_PACE_RUN' : 'EASY_RUN';
            workouts.push({
                type: secondaryType,
                hours: Math.round(remainingHours * 10) / 10,
                priority: 5,
                dayPreference: 'run2',
                note: HyroxWorkoutTypes[secondaryType].purpose
            });
        }

        return workouts;
    }

    /**
     * Plan station/functional workouts
     */
    planStationWorkouts(phase, totalHours, isRecovery, isPro, isFirstTimer) {
        const workouts = [];

        if (totalHours < 0.5) {
            return workouts;
        }

        // Primary station workout
        let primaryType = 'STATION_TECHNIQUE';
        let primaryHours = totalHours * 0.6;

        if (isFirstTimer) {
            primaryType = 'STATION_TECHNIQUE';
        } else {
            switch (phase.name) {
                case 'Base':
                    primaryType = 'STATION_TECHNIQUE';
                    break;
                case 'Build':
                    primaryType = 'STATION_DRILLS';
                    break;
                case 'Peak':
                    primaryType = isPro ? 'HEAVY_STATION_WORK' : 'STATION_DRILLS';
                    break;
                case 'Taper':
                    primaryType = 'STATION_TECHNIQUE';
                    primaryHours *= 0.7;
                    break;
            }
        }

        workouts.push({
            type: primaryType,
            hours: Math.round(primaryHours * 10) / 10,
            priority: 3,
            dayPreference: 'station1',
            note: HyroxWorkoutTypes[primaryType].purpose
        });

        // Mixed conditioning
        const remainingHours = totalHours - primaryHours;
        if (remainingHours >= 0.5 && !isRecovery) {
            workouts.push({
                type: 'MIXED_CONDITIONING',
                hours: Math.round(remainingHours * 10) / 10,
                priority: 4,
                dayPreference: 'station2',
                note: 'Combine running with station movements'
            });
        }

        return workouts;
    }

    /**
     * Plan strength workouts
     */
    planStrengthWorkouts(phase, totalHours, isRecovery, isPro) {
        const workouts = [];

        if (isRecovery || totalHours < 0.5) {
            return workouts;
        }

        // Primary strength focus
        let strengthType = 'STRENGTH_ENDURANCE';

        switch (phase.name) {
            case 'Base':
                strengthType = 'LEG_STRENGTH';
                break;
            case 'Build':
                strengthType = 'GRIP_STRENGTH';
                break;
            case 'Peak':
                strengthType = 'STRENGTH_ENDURANCE';
                break;
            case 'Taper':
                return workouts; // Minimal strength in taper
        }

        workouts.push({
            type: strengthType,
            hours: Math.round(totalHours * 10) / 10,
            priority: 6,
            dayPreference: 'strength',
            note: HyroxWorkoutTypes[strengthType].purpose
        });

        return workouts;
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
            'run1': 1, // Tuesday
            'run2': 4, // Friday
            'station1': 2, // Wednesday
            'station2': 3, // Thursday
            'strength': 0, // Monday
            'midweek': 2,
            'any': -1
        };

        for (const workout of workouts) {
            let targetIndex = dayPreferenceMap[workout.dayPreference] ?? -1;

            if (targetIndex === -1 || usedDays.has(targetIndex)) {
                // Find first available day
                for (let i = 0; i < 7; i++) {
                    if (!usedDays.has(i)) {
                        targetIndex = i;
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
     * Create workout object
     */
    createWorkout(type, hours, note = '') {
        const workoutDef = HyroxWorkoutTypes[type] || HyroxWorkoutTypes.REST;
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
     * Calculate training distribution
     */
    calculateTrainingDistribution(days) {
        const distribution = { running: 0, stations: 0, strength: 0, mixed: 0 };

        days.forEach(day => {
            if (day.workout && day.workout.category) {
                const cat = day.workout.category;
                const hours = day.workout.hours || 0;

                if (cat === 'running') distribution.running += hours;
                else if (cat === 'stations' || cat === 'simulation') distribution.stations += hours;
                else if (cat === 'strength') distribution.strength += hours;
                else if (cat === 'conditioning' || cat === 'partner') distribution.mixed += hours;
            }
        });

        return {
            running: Math.round(distribution.running * 10) / 10,
            stations: Math.round(distribution.stations * 10) / 10,
            strength: Math.round(distribution.strength * 10) / 10,
            mixed: Math.round(distribution.mixed * 10) / 10
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
     * Format duration
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

        // Training focus info
        const focusInfo = document.createElement('div');
        focusInfo.className = 'mt-6 p-4 bg-orange-50 rounded-lg';

        const focusTitle = document.createElement('h4');
        focusTitle.className = 'font-semibold text-orange-700 mb-2';
        focusTitle.textContent = 'Hyrox Training Focus';
        focusInfo.appendChild(focusTitle);

        const focusText = document.createElement('p');
        focusText.className = 'text-orange-600 text-sm';
        focusText.textContent = '8 x 1km runs + 8 functional stations. Plan balances running capacity, station proficiency, and strength endurance.';
        focusInfo.appendChild(focusText);

        section.appendChild(focusInfo);

        return section;
    }
}

// Export for use
window.HyroxPlanGenerator = HyroxPlanGenerator;
window.HyroxDistanceConfigs = HyroxDistanceConfigs;
window.HyroxWorkoutTypes = HyroxWorkoutTypes;
window.HyroxStations = HyroxStations;
