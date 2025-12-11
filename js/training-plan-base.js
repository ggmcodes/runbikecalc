/**
 * Training Plan Generator Base Class
 * Extends Calculator to provide periodized training plan generation
 */

// Workout type definitions with RPE-based intensity
const WorkoutTypes = {
    // Running workouts
    EASY_RUN: { name: 'Easy Run', rpe: '3-4', purpose: 'Recovery and aerobic base maintenance', category: 'easy' },
    LONG_RUN: { name: 'Long Run', rpe: '3-4', purpose: 'Build endurance and mental toughness', category: 'easy' },
    RECOVERY_RUN: { name: 'Recovery Run', rpe: '2-3', purpose: 'Active recovery between hard efforts', category: 'easy' },
    MODERATE_RUN: { name: 'Moderate Run', rpe: '5', purpose: 'Aerobic development at comfortable effort', category: 'moderate' },
    TEMPO: { name: 'Tempo Run', rpe: '6-7', purpose: 'Comfortably hard pace you could hold for ~1 hour - builds endurance', category: 'hard' },
    INTERVALS: { name: 'Intervals', rpe: '8-9', purpose: 'Short hard efforts (e.g. 400m-1mile) with recovery jogs between', category: 'hard' },
    RACE_PACE: { name: 'Race Pace Run', rpe: '5-6', purpose: 'Practice goal pace and pacing strategy', category: 'moderate' },
    HILLS: { name: 'Hill Repeats', rpe: '7-8', purpose: 'Build power and running economy', category: 'hard' },
    FARTLEK: { name: 'Speed Play', rpe: '5-7', purpose: 'Alternate fast/slow segments by feel - a fun, unstructured speed workout', category: 'moderate' },
    PROGRESSION: { name: 'Progression Run', rpe: '4-7', purpose: 'Build negative split ability', category: 'moderate' },

    // Ultra-specific
    BACK_TO_BACK_LONG: { name: 'Back-to-Back Long', rpe: '3-4', purpose: 'Train on tired legs for ultra prep', category: 'easy' },
    ULTRA_LONG: { name: 'Ultra Long Run', rpe: '3-4', purpose: 'Extended time on feet adaptation', category: 'easy' },

    // Cycling workouts
    ENDURANCE_RIDE: { name: 'Endurance Ride', rpe: '3-4', purpose: 'Aerobic base building', category: 'easy' },
    RECOVERY_RIDE: { name: 'Recovery Ride', rpe: '2-3', purpose: 'Active recovery spin', category: 'easy' },
    SWEET_SPOT: { name: 'Sweet Spot', rpe: '5-6', purpose: 'Maximize training efficiency', category: 'moderate' },
    TEMPO_RIDE: { name: 'Tempo Ride', rpe: '6-7', purpose: 'Improve sustainable power', category: 'hard' },
    VO2_INTERVALS: { name: 'VO2 Intervals', rpe: '8-9', purpose: 'Increase aerobic ceiling', category: 'hard' },
    CLIMBING: { name: 'Climbing Repeats', rpe: '7-8', purpose: 'Build climbing strength', category: 'hard' },

    // Triathlon-specific
    BRICK: { name: 'Brick Workout', rpe: '5-7', purpose: 'Practice bike-to-run transition', category: 'moderate' },
    SWIM_ENDURANCE: { name: 'Swim Endurance', rpe: '4-5', purpose: 'Build swim aerobic base', category: 'easy' },
    SWIM_TECHNIQUE: { name: 'Swim Technique', rpe: '3-4', purpose: 'Improve efficiency and form', category: 'easy' },
    SWIM_INTERVALS: { name: 'Swim Intervals', rpe: '7-8', purpose: 'Build swim speed', category: 'hard' },
    OPEN_WATER: { name: 'Open Water Swim', rpe: '5-6', purpose: 'Race simulation and sighting practice', category: 'moderate' },

    // Common
    REST: { name: 'Rest Day', rpe: '0', purpose: 'Complete recovery - no exercise', category: 'rest' },
    CROSS_TRAIN: { name: 'Cross Training', rpe: '3-4', purpose: 'Active recovery with variety', category: 'easy' },
    STRENGTH: { name: 'Strength Training', rpe: '5-6', purpose: 'Build muscular endurance and injury prevention', category: 'moderate' }
};

// Day names
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAYS_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

/**
 * Base class for training plan generators
 * Extend this class for sport-specific implementations
 */
class TrainingPlanGenerator extends Calculator {
    constructor(formId, resultId, sport) {
        super(formId, resultId);
        this.sport = sport;
        this.plan = null;
        this.urlParams = new URLParamsHandler();
        this.emailGate = new EmailGateHandler();

        // Initialize button states on load
        this.emailGate.updateButtonStates();

        // Load from URL if parameters present
        this.loadFromURL();
    }

    /**
     * Get distance configurations - override in child classes
     */
    getDistanceConfigs() {
        throw new Error('getDistanceConfigs must be implemented in child class');
    }

    /**
     * Generate weekly plan - override in child classes
     */
    generateWeeklyPlan(weekNumber, phase, isRecovery, inputs) {
        throw new Error('generateWeeklyPlan must be implemented in child class');
    }

    /**
     * Main calculation method
     */
    calculate() {
        try {
            const formData = new FormData(this.form);
            const inputs = this.extractInputs(formData);

            // Validate inputs
            this.validateInputs(inputs);

            // Calculate training weeks
            inputs.totalWeeks = this.calculateTotalWeeks(inputs);

            // Get distance config
            const distanceConfig = this.getDistanceConfigs()[inputs.goalDistance];
            if (!distanceConfig) {
                throw new Error('Invalid distance selected');
            }

            // Calculate phases
            const phases = this.calculatePhases(inputs, distanceConfig);

            // Generate all weeks
            const weeks = this.generateAllWeeks(inputs, phases, distanceConfig);

            // Build plan object
            this.plan = {
                inputs,
                phases,
                weeks,
                distanceConfig,
                summary: this.generateSummary(inputs, phases, weeks)
            };

            // Update URL for sharing
            this.urlParams.updateURL(inputs);

            // Save form values
            this.saveValues();

            // Display results
            this.displayResult(this.plan);

        } catch (error) {
            this.displayError(error.message);
        }
    }

    /**
     * Extract and normalize form inputs
     */
    extractInputs(formData) {
        const inputs = {};

        // Get all form values
        for (let [key, value] of formData.entries()) {
            // Convert to camelCase
            const camelKey = key.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
            inputs[camelKey] = value;
        }

        // Parse numeric values
        if (inputs.weeksUntilRace) {
            inputs.weeksUntilRace = parseInt(inputs.weeksUntilRace);
        }
        if (inputs.currentVolume) {
            inputs.currentVolume = parseFloat(inputs.currentVolume);
        }
        if (inputs.trainingDays) {
            inputs.trainingDays = parseInt(inputs.trainingDays);
        }
        if (inputs.crossTrainDays) {
            inputs.crossTrainDays = parseInt(inputs.crossTrainDays) || 0;
        }

        // Handle rest days checkboxes
        const restDays = formData.getAll('rest-days');
        inputs.restDays = restDays.length > 0 ? restDays : [];

        return inputs;
    }

    /**
     * Validate inputs
     */
    validateInputs(inputs) {
        if (!inputs.goalDistance) {
            throw new Error('Please select a goal distance');
        }

        if (!inputs.raceDate && !inputs.weeksUntilRace) {
            throw new Error('Please enter a race date or weeks until race');
        }

        if (!inputs.fitnessLevel) {
            throw new Error('Please select your fitness level');
        }

        if (!inputs.currentVolume || inputs.currentVolume < 0) {
            throw new Error('Please enter your current weekly volume');
        }

        if (!inputs.trainingDays || inputs.trainingDays < 3 || inputs.trainingDays > 7) {
            throw new Error('Training days must be between 3 and 7');
        }
    }

    /**
     * Calculate total training weeks from race date or direct input
     */
    calculateTotalWeeks(inputs) {
        if (inputs.weeksUntilRace) {
            return inputs.weeksUntilRace;
        }

        if (inputs.raceDate) {
            const raceDate = new Date(inputs.raceDate);
            const today = new Date();
            const diffTime = raceDate - today;
            const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
            return Math.max(1, diffWeeks);
        }

        return 12; // Default
    }

    /**
     * Calculate training phases based on total weeks and distance
     */
    calculatePhases(inputs, distanceConfig) {
        const totalWeeks = inputs.totalWeeks;
        const fitnessLevel = inputs.fitnessLevel;

        // Get taper duration based on distance
        const taperWeeks = this.getTaperWeeks(distanceConfig, fitnessLevel);

        // Calculate phase durations (remaining weeks after taper)
        const trainingWeeks = totalWeeks - taperWeeks;

        // Minimum weeks for each phase
        const minBase = 2;
        const minBuild = 2;
        const minPeak = 1;

        let baseWeeks, buildWeeks, peakWeeks;

        if (trainingWeeks < 6) {
            // Very short plan - minimal phases
            baseWeeks = Math.max(1, Math.floor(trainingWeeks * 0.4));
            buildWeeks = Math.max(1, Math.floor(trainingWeeks * 0.4));
            peakWeeks = Math.max(1, trainingWeeks - baseWeeks - buildWeeks);
        } else {
            // Standard phase distribution
            baseWeeks = Math.max(minBase, Math.floor(trainingWeeks * 0.35));
            buildWeeks = Math.max(minBuild, Math.floor(trainingWeeks * 0.40));
            peakWeeks = Math.max(minPeak, trainingWeeks - baseWeeks - buildWeeks);
        }

        return [
            {
                name: 'Base',
                label: 'Base Building',
                startWeek: 1,
                duration: baseWeeks,
                volumeMultiplier: { start: 0.70, end: 0.85 },
                intensityDistribution: { easy: 85, moderate: 10, hard: 5 },
                description: 'Build aerobic foundation with easy volume'
            },
            {
                name: 'Build',
                label: 'Build Phase',
                startWeek: baseWeeks + 1,
                duration: buildWeeks,
                volumeMultiplier: { start: 0.85, end: 1.0 },
                intensityDistribution: { easy: 80, moderate: 12, hard: 8 },
                description: 'Increase intensity while maintaining volume'
            },
            {
                name: 'Peak',
                label: 'Peak Phase',
                startWeek: baseWeeks + buildWeeks + 1,
                duration: peakWeeks,
                volumeMultiplier: { start: 1.0, end: 1.05 },
                intensityDistribution: { easy: 75, moderate: 15, hard: 10 },
                description: 'Highest volume and race-specific work'
            },
            {
                name: 'Taper',
                label: 'Race Taper',
                startWeek: totalWeeks - taperWeeks + 1,
                duration: taperWeeks,
                volumeMultiplier: { start: 0.75, end: 0.40 },
                intensityDistribution: { easy: 80, moderate: 15, hard: 5 },
                description: 'Reduce volume while maintaining intensity'
            }
        ];
    }

    /**
     * Get taper duration based on distance and fitness
     */
    getTaperWeeks(distanceConfig, fitnessLevel) {
        const baseTaper = distanceConfig.taperWeeks || 2;

        // Beginners may need slightly longer taper
        if (fitnessLevel === 'beginner') {
            return Math.min(baseTaper + 1, 4);
        }

        return baseTaper;
    }

    /**
     * Generate all training weeks
     */
    generateAllWeeks(inputs, phases, distanceConfig) {
        const weeks = [];
        let currentWeek = 1;

        for (const phase of phases) {
            for (let i = 0; i < phase.duration; i++) {
                const isRecovery = this.isRecoveryWeek(currentWeek, inputs);
                const weekProgress = i / phase.duration;

                // Calculate volume for this week
                const volumeMultiplier = phase.volumeMultiplier.start +
                    (phase.volumeMultiplier.end - phase.volumeMultiplier.start) * weekProgress;

                let weekVolume = inputs.currentVolume * volumeMultiplier;

                // Recovery week reduction
                if (isRecovery) {
                    weekVolume *= 0.65;
                }

                const week = this.generateWeeklyPlan(currentWeek, phase, isRecovery, inputs, {
                    weekVolume: Math.round(weekVolume * 10) / 10,
                    distanceConfig,
                    weekProgress
                });

                weeks.push({
                    weekNumber: currentWeek,
                    phase: phase.name,
                    phaseLabel: phase.label,
                    isRecovery,
                    targetVolume: Math.round(weekVolume * 10) / 10,
                    ...week
                });

                currentWeek++;
            }
        }

        return weeks;
    }

    /**
     * Determine if a week should be a recovery week
     */
    isRecoveryWeek(weekNumber, inputs) {
        // Recovery every 3 weeks for beginners, every 4 for others
        const frequency = inputs.fitnessLevel === 'beginner' ? 3 : 4;
        return weekNumber % frequency === 0;
    }

    /**
     * Generate plan summary
     */
    generateSummary(inputs, phases, weeks) {
        const totalVolume = weeks.reduce((sum, w) => sum + w.targetVolume, 0);
        const peakVolume = Math.max(...weeks.map(w => w.targetVolume));
        const recoveryWeeks = weeks.filter(w => w.isRecovery).length;

        return {
            totalWeeks: weeks.length,
            totalVolume: Math.round(totalVolume),
            peakVolume: Math.round(peakVolume * 10) / 10,
            recoveryWeeks,
            phases: phases.map(p => ({ name: p.name, weeks: p.duration }))
        };
    }

    /**
     * Get phase for a given week number
     */
    getPhaseForWeek(weekNumber, phases) {
        for (const phase of phases) {
            if (weekNumber >= phase.startWeek && weekNumber < phase.startWeek + phase.duration) {
                return phase;
            }
        }
        return phases[phases.length - 1]; // Default to last phase
    }

    /**
     * Load plan from URL parameters
     */
    loadFromURL() {
        const inputs = this.urlParams.getFromURL();
        if (inputs) {
            this.populateForm(inputs);
            // Auto-calculate after a short delay to let form populate
            setTimeout(() => {
                if (this.form.checkValidity()) {
                    this.calculate();
                }
            }, 100);
        }
    }

    /**
     * Populate form with input values
     */
    populateForm(inputs) {
        for (const [key, value] of Object.entries(inputs)) {
            // Convert camelCase to kebab-case for form field names
            const kebabKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();

            // Try both naming conventions
            let input = this.form.querySelector(`[name="${kebabKey}"]`) ||
                        this.form.querySelector(`[name="${key}"]`) ||
                        this.form.querySelector(`#${kebabKey}`) ||
                        this.form.querySelector(`#${key}`);

            if (input) {
                if (input.type === 'checkbox') {
                    input.checked = value === 'true' || value === true;
                } else {
                    input.value = value;
                }
            }
        }
    }

    /**
     * Format duration for display
     */
    formatDuration(minutes) {
        if (minutes < 60) {
            return `${minutes} min`;
        }
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (mins === 0) {
            return `${hours}h`;
        }
        return `${hours}h ${mins}m`;
    }

    /**
     * Format distance for display
     */
    formatDistance(miles, unit = 'mi') {
        if (unit === 'km') {
            return `${(miles * 1.60934).toFixed(1)} km`;
        }
        return `${miles.toFixed(1)} mi`;
    }

    /**
     * Get workout description with all details
     */
    getWorkoutDescription(workout) {
        const type = WorkoutTypes[workout.type] || workout;
        return {
            name: type.name,
            duration: workout.duration ? this.formatDuration(workout.duration) : '',
            distance: workout.distance ? this.formatDistance(workout.distance) : '',
            rpe: type.rpe,
            purpose: type.purpose,
            details: workout.details || ''
        };
    }

    /**
     * Override displayError to handle errors properly
     * (Base class displayError calls displayResult which expects a plan object)
     */
    displayError(message) {
        if (!this.resultContainer) return;

        // Clear previous results
        while (this.resultContainer.firstChild) {
            this.resultContainer.removeChild(this.resultContainer.firstChild);
        }

        const errorDiv = document.createElement('div');
        errorDiv.className = 'bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg';

        const strong = document.createElement('strong');
        strong.textContent = 'Error: ';
        errorDiv.appendChild(strong);

        const messageText = document.createTextNode(message);
        errorDiv.appendChild(messageText);

        this.resultContainer.appendChild(errorDiv);
        this.resultContainer.classList.remove('hidden');
    }

    /**
     * Display results - creates the plan output UI
     */
    displayResult(plan) {
        if (!this.resultContainer) return;

        // Validate plan structure
        if (!plan || !plan.summary || !plan.phases || !plan.weeks) {
            this.displayError('Failed to generate training plan. Please check your inputs and try again.');
            return;
        }

        // Clear previous results
        while (this.resultContainer.firstChild) {
            this.resultContainer.removeChild(this.resultContainer.firstChild);
        }

        // Build result UI using safe DOM methods
        const resultWrapper = document.createElement('div');
        resultWrapper.className = 'space-y-8';

        // Add overview section
        resultWrapper.appendChild(this.createOverviewSection(plan));

        // Add "Find Your Paces" callout
        resultWrapper.appendChild(this.createPacesCallout());

        // Add phase timeline
        resultWrapper.appendChild(this.createPhaseTimeline(plan));

        // Add weekly schedule
        resultWrapper.appendChild(this.createWeeklySchedule(plan));

        // Add export section
        resultWrapper.appendChild(this.createExportSection());

        this.resultContainer.appendChild(resultWrapper);
        this.resultContainer.classList.remove('hidden');

        // Initialize export button handlers
        this.initExportHandlers();

        // Scroll to results on mobile
        if (window.innerWidth < 768) {
            this.resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Save to history
        this.saveToHistory();
    }

    /**
     * Create overview section with stats
     */
    createOverviewSection(plan) {
        const section = document.createElement('div');
        section.className = 'text-center mb-8';

        const title = document.createElement('h2');
        title.className = 'text-3xl font-bold text-blue-600 mb-6';
        title.textContent = 'Your Personalized Training Plan';
        section.appendChild(title);

        const statsGrid = document.createElement('div');
        statsGrid.className = 'grid grid-cols-2 md:grid-cols-4 gap-4';

        const stats = [
            { value: plan.summary.totalWeeks, label: 'Total Weeks', color: 'blue' },
            { value: plan.summary.peakVolume, label: 'Peak Volume', color: 'green' },
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

    /**
     * Create "Find Your Paces" callout
     */
    createPacesCallout() {
        const callout = document.createElement('div');
        callout.className = 'bg-yellow-50 border border-yellow-200 rounded-lg p-6';

        const title = document.createElement('h3');
        title.className = 'text-lg font-semibold text-yellow-900 mb-2';
        title.textContent = 'Find Your Training Paces';
        callout.appendChild(title);

        const desc = document.createElement('p');
        desc.className = 'text-yellow-800 mb-4';
        desc.textContent = 'This plan uses RPE (Rate of Perceived Exertion) for intensity. For specific pace targets, use our calculators:';
        callout.appendChild(desc);

        const linksContainer = document.createElement('div');
        linksContainer.className = 'flex flex-wrap gap-4';

        const links = [
            { href: '/running-pace-calculator', text: 'Running Pace Calculator' },
            { href: '/race-time-predictor', text: 'Race Time Predictor' },
            { href: '/heart-rate-zone-calculator', text: 'HR Zone Calculator' }
        ];

        links.forEach(linkData => {
            const link = document.createElement('a');
            link.href = linkData.href;
            link.className = 'text-yellow-700 hover:text-yellow-900 underline';
            link.textContent = linkData.text;
            linksContainer.appendChild(link);
        });

        callout.appendChild(linksContainer);
        return callout;
    }

    /**
     * Create phase timeline visualization
     */
    createPhaseTimeline(plan) {
        const section = document.createElement('div');
        section.className = 'mb-8';

        const title = document.createElement('h3');
        title.className = 'text-xl font-semibold mb-4';
        title.textContent = 'Training Phases';
        section.appendChild(title);

        const timeline = document.createElement('div');
        timeline.className = 'flex flex-wrap gap-4';

        const phaseColors = {
            'Base': 'blue',
            'Build': 'green',
            'Peak': 'purple',
            'Taper': 'orange'
        };

        plan.phases.forEach(phase => {
            const color = phaseColors[phase.name] || 'gray';
            const card = document.createElement('div');
            card.className = `flex-1 min-w-32 bg-${color}-50 border-2 border-${color}-200 rounded-lg p-4 text-center`;

            const name = document.createElement('div');
            name.className = `font-semibold text-${color}-800`;
            name.textContent = phase.label;

            const weeks = document.createElement('div');
            weeks.className = `text-sm text-${color}-600`;
            weeks.textContent = `${phase.duration} week${phase.duration !== 1 ? 's' : ''}`;

            const desc = document.createElement('div');
            desc.className = 'text-xs text-gray-500 mt-2';
            desc.textContent = phase.description;

            card.appendChild(name);
            card.appendChild(weeks);
            card.appendChild(desc);
            timeline.appendChild(card);
        });

        section.appendChild(timeline);
        return section;
    }

    /**
     * Create weekly schedule section
     */
    createWeeklySchedule(plan) {
        const section = document.createElement('div');
        section.className = 'mb-8';

        const title = document.createElement('h3');
        title.className = 'text-xl font-semibold mb-4';
        title.textContent = 'Week-by-Week Schedule';
        section.appendChild(title);

        const scheduleContainer = document.createElement('div');
        scheduleContainer.className = 'space-y-4';
        scheduleContainer.id = 'weekly-schedule';

        plan.weeks.forEach(week => {
            scheduleContainer.appendChild(this.createWeekAccordion(week));
        });

        section.appendChild(scheduleContainer);
        return section;
    }

    /**
     * Create accordion for a single week
     */
    createWeekAccordion(week) {
        const accordion = document.createElement('div');
        accordion.className = 'border border-gray-200 rounded-lg overflow-hidden';

        // Header (clickable)
        const header = document.createElement('button');
        header.type = 'button';
        header.className = 'w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors';

        const headerLeft = document.createElement('div');
        headerLeft.className = 'flex items-center gap-4';

        const weekLabel = document.createElement('span');
        weekLabel.className = 'font-semibold';
        weekLabel.textContent = `Week ${week.weekNumber}`;

        const phaseTag = document.createElement('span');
        const phaseColors = { 'Base': 'blue', 'Build': 'green', 'Peak': 'purple', 'Taper': 'orange' };
        const color = phaseColors[week.phase] || 'gray';
        phaseTag.className = `px-2 py-1 text-xs font-medium rounded bg-${color}-100 text-${color}-800`;
        phaseTag.textContent = week.phase;

        if (week.isRecovery) {
            const recoveryTag = document.createElement('span');
            recoveryTag.className = 'px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600';
            recoveryTag.textContent = 'Recovery';
            headerLeft.appendChild(recoveryTag);
        }

        headerLeft.appendChild(weekLabel);
        headerLeft.appendChild(phaseTag);

        const headerRight = document.createElement('div');
        headerRight.className = 'flex items-center gap-4';

        const volumeLabel = document.createElement('span');
        volumeLabel.className = 'text-sm text-gray-600';
        volumeLabel.textContent = `${week.targetVolume} mi`;

        // Chevron icon
        const chevron = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        chevron.setAttribute('class', 'w-5 h-5 text-gray-400 transform transition-transform accordion-chevron');
        chevron.setAttribute('fill', 'none');
        chevron.setAttribute('stroke', 'currentColor');
        chevron.setAttribute('viewBox', '0 0 24 24');
        const chevronPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        chevronPath.setAttribute('stroke-linecap', 'round');
        chevronPath.setAttribute('stroke-linejoin', 'round');
        chevronPath.setAttribute('stroke-width', '2');
        chevronPath.setAttribute('d', 'M19 9l-7 7-7-7');
        chevron.appendChild(chevronPath);

        headerRight.appendChild(volumeLabel);
        headerRight.appendChild(chevron);

        header.appendChild(headerLeft);
        header.appendChild(headerRight);

        // Content (collapsible)
        const content = document.createElement('div');
        content.className = 'hidden p-4 border-t border-gray-200';

        // Effort legend
        const legend = document.createElement('div');
        legend.className = 'text-xs text-gray-500 mb-3';
        legend.textContent = 'Effort Scale: 3-4 = Easy (can chat), 5-6 = Moderate, 7-8 = Hard (few words), 9-10 = All out';
        content.appendChild(legend);

        // Days table
        const table = document.createElement('table');
        table.className = 'w-full text-sm';

        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.className = 'text-left text-gray-500';

        ['Day', 'Workout', 'Duration', 'Effort', 'Notes'].forEach(text => {
            const th = document.createElement('th');
            th.className = 'pb-2 pr-4';
            if (text === 'Effort') {
                th.textContent = text;
                th.title = 'Effort level on a 1-10 scale: 3-4 = Easy conversation pace, 5-6 = Moderate, 7-8 = Hard, 9-10 = All out';
            } else {
                th.textContent = text;
            }
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        if (week.days) {
            week.days.forEach(day => {
                const row = document.createElement('tr');
                row.className = 'border-t border-gray-100';

                const dayCell = document.createElement('td');
                dayCell.className = 'py-2 pr-4 font-medium';
                dayCell.textContent = day.dayName || DAYS_SHORT[day.dayIndex];

                const workoutCell = document.createElement('td');
                workoutCell.className = 'py-2 pr-4';
                workoutCell.textContent = day.workout?.name || '-';

                const durationCell = document.createElement('td');
                durationCell.className = 'py-2 pr-4';
                durationCell.textContent = day.workout?.duration || '-';

                const rpeCell = document.createElement('td');
                rpeCell.className = 'py-2 pr-4';
                rpeCell.textContent = day.workout?.rpe || '-';

                const purposeCell = document.createElement('td');
                purposeCell.className = 'py-2 text-gray-600';
                purposeCell.textContent = day.workout?.purpose || '-';

                row.appendChild(dayCell);
                row.appendChild(workoutCell);
                row.appendChild(durationCell);
                row.appendChild(rpeCell);
                row.appendChild(purposeCell);
                tbody.appendChild(row);
            });
        }
        table.appendChild(tbody);
        content.appendChild(table);

        accordion.appendChild(header);
        accordion.appendChild(content);

        // Toggle functionality
        header.addEventListener('click', () => {
            content.classList.toggle('hidden');
            chevron.classList.toggle('rotate-180');
        });

        return accordion;
    }

    /**
     * Create export section
     */
    createExportSection() {
        const section = document.createElement('div');
        section.className = 'bg-gray-50 rounded-lg p-6';

        const title = document.createElement('h3');
        title.className = 'text-xl font-semibold mb-4';
        title.textContent = 'Export Your Plan';
        section.appendChild(title);

        // Time selector
        const timeContainer = document.createElement('div');
        timeContainer.className = 'mb-4';

        const timeLabel = document.createElement('label');
        timeLabel.className = 'block text-sm font-medium text-gray-700 mb-2';
        timeLabel.textContent = 'Preferred Workout Time (for calendar)';
        timeLabel.setAttribute('for', 'workout-time');

        const timeInput = document.createElement('input');
        timeInput.type = 'time';
        timeInput.id = 'workout-time';
        timeInput.value = '06:00';
        timeInput.className = 'border-2 border-gray-200 rounded-lg px-3 py-2 w-32';

        timeContainer.appendChild(timeLabel);
        timeContainer.appendChild(timeInput);
        section.appendChild(timeContainer);

        // Export buttons grid
        const buttonsGrid = document.createElement('div');
        buttonsGrid.className = 'grid md:grid-cols-3 gap-4';

        // ICS button (free)
        const icsBtn = this.createExportButton('export-ics', 'Calendar (.ics)', true);
        buttonsGrid.appendChild(icsBtn);

        // PDF button (gated)
        const pdfBtn = this.createExportButton('export-pdf', 'PDF Export', false);
        buttonsGrid.appendChild(pdfBtn);

        // CSV button (gated)
        const csvBtn = this.createExportButton('export-csv', 'Excel/CSV Export', false);
        buttonsGrid.appendChild(csvBtn);

        section.appendChild(buttonsGrid);

        // Share button
        const shareContainer = document.createElement('div');
        shareContainer.className = 'mt-4 pt-4 border-t border-gray-200';

        const shareBtn = document.createElement('button');
        shareBtn.type = 'button';
        shareBtn.id = 'share-plan-btn';
        shareBtn.className = 'flex items-center gap-2 text-blue-600 hover:text-blue-800';

        const shareSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        shareSvg.setAttribute('class', 'w-5 h-5');
        shareSvg.setAttribute('fill', 'none');
        shareSvg.setAttribute('stroke', 'currentColor');
        shareSvg.setAttribute('viewBox', '0 0 24 24');
        const sharePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        sharePath.setAttribute('stroke-linecap', 'round');
        sharePath.setAttribute('stroke-linejoin', 'round');
        sharePath.setAttribute('stroke-width', '2');
        sharePath.setAttribute('d', 'M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z');
        shareSvg.appendChild(sharePath);

        const shareText = document.createElement('span');
        shareText.textContent = 'Copy Link to Share Plan';

        shareBtn.appendChild(shareSvg);
        shareBtn.appendChild(shareText);
        shareContainer.appendChild(shareBtn);
        section.appendChild(shareContainer);

        return section;
    }

    /**
     * Create export button
     */
    createExportButton(id, text, isFree) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = id;
        btn.className = 'flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition-colors';

        if (!isFree) {
            btn.classList.add('email-gated-btn');

            const lockIcon = document.createElement('span');
            lockIcon.className = 'lock-icon';

            // Create lock SVG
            const lockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            lockSvg.setAttribute('class', 'w-5 h-5 text-gray-400');
            lockSvg.setAttribute('fill', 'none');
            lockSvg.setAttribute('stroke', 'currentColor');
            lockSvg.setAttribute('viewBox', '0 0 24 24');
            const lockPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            lockPath.setAttribute('stroke-linecap', 'round');
            lockPath.setAttribute('stroke-linejoin', 'round');
            lockPath.setAttribute('stroke-width', '2');
            lockPath.setAttribute('d', 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z');
            lockSvg.appendChild(lockPath);
            lockIcon.appendChild(lockSvg);
            btn.appendChild(lockIcon);
        }

        const btnText = document.createElement('span');
        btnText.textContent = text;
        btn.appendChild(btnText);

        if (isFree) {
            const freeTag = document.createElement('span');
            freeTag.className = 'text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded';
            freeTag.textContent = 'FREE';
            btn.appendChild(freeTag);
        }

        return btn;
    }

    /**
     * Initialize export button handlers
     */
    initExportHandlers() {
        // Update gated button states
        this.emailGate.updateButtonStates();

        // ICS export (free)
        const icsBtn = document.getElementById('export-ics');
        if (icsBtn) {
            icsBtn.addEventListener('click', () => this.exportICS());
        }

        // PDF export (gated)
        const pdfBtn = document.getElementById('export-pdf');
        if (pdfBtn) {
            pdfBtn.addEventListener('click', () => {
                this.emailGate.gateFunction(() => this.exportPDF());
            });
        }

        // CSV export (gated)
        const csvBtn = document.getElementById('export-csv');
        if (csvBtn) {
            csvBtn.addEventListener('click', () => {
                this.emailGate.gateFunction(() => this.exportCSV());
            });
        }

        // Share button
        const shareBtn = document.getElementById('share-plan-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', () => this.urlParams.copyLink());
        }
    }

    /**
     * Export to ICS - implemented in training-plan-export.js
     */
    exportICS() {
        if (window.TrainingPlanExporter) {
            const time = document.getElementById('workout-time')?.value || '06:00';
            window.TrainingPlanExporter.exportICS(this.plan, time);
        } else {
            console.error('TrainingPlanExporter not loaded');
        }
    }

    /**
     * Export to PDF - implemented in training-plan-export.js
     */
    exportPDF() {
        if (window.TrainingPlanExporter) {
            window.TrainingPlanExporter.exportPDF(this.plan);
        } else {
            console.error('TrainingPlanExporter not loaded');
        }
    }

    /**
     * Export to CSV - implemented in training-plan-export.js
     */
    exportCSV() {
        if (window.TrainingPlanExporter) {
            window.TrainingPlanExporter.exportCSV(this.plan);
        } else {
            console.error('TrainingPlanExporter not loaded');
        }
    }
}

// Export for use in other files
window.TrainingPlanGenerator = TrainingPlanGenerator;
window.WorkoutTypes = WorkoutTypes;
window.DAYS = DAYS;
window.DAYS_SHORT = DAYS_SHORT;
