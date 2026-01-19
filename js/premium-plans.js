/**
 * Premium Training Plans Handler
 * Manages premium status, sport tabs, plan generation, exports, and saved plans
 */

(function() {
    'use strict';

    // ==================== Configuration ====================

    const CONFIG = {
        STORAGE_KEYS: {
            premium: 'runbikecalc_premium_unlocked',
            premiumDate: 'runbikecalc_premium_date',
            savedPlans: 'runbikecalc_saved_plans',
            currentPlan: 'runbikecalc_current_plan'
        },
        MAX_SAVED_PLANS: 5,
        STRIPE_LINK: 'https://buy.stripe.com/3cI28s7Zsfab0np3a82cg06'
    };

    // ==================== State ====================

    const state = {
        isPremium: false,
        currentSport: 'running',
        currentPlan: null,
        savedPlans: [],
        generators: {}
    };

    // ==================== Premium Status ====================

    function checkPremiumStatus() {
        state.isPremium = localStorage.getItem(CONFIG.STORAGE_KEYS.premium) === 'true';
        updatePremiumUI();
        return state.isPremium;
    }

    function unlockPremium() {
        localStorage.setItem(CONFIG.STORAGE_KEYS.premium, 'true');
        localStorage.setItem(CONFIG.STORAGE_KEYS.premiumDate, new Date().toISOString());
        state.isPremium = true;
        updatePremiumUI();
        showToast('Premium unlocked! All features are now available.');
    }

    function updatePremiumUI() {
        const body = document.body;

        if (state.isPremium) {
            body.classList.remove('premium-locked');
            body.classList.add('premium-unlocked');

            // Hide unlock CTAs
            document.querySelectorAll('.unlock-cta').forEach(el => {
                el.style.display = 'none';
            });

            // Track premium status
            if (typeof gtag === 'function') {
                gtag('event', 'premium_active', {
                    'event_category': 'Premium',
                    'event_label': 'Premium User Session'
                });
            }
        } else {
            body.classList.add('premium-locked');
            body.classList.remove('premium-unlocked');
        }
    }

    // ==================== Sport Tab Switching ====================

    function initTabs() {
        const tabs = document.querySelectorAll('.sport-tab');
        const panels = document.querySelectorAll('.sport-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const sport = tab.dataset.sport;
                switchSport(sport);
            });
        });

        // Set initial state
        switchSport('running');
    }

    function switchSport(sport) {
        state.currentSport = sport;

        // Update tab states
        document.querySelectorAll('.sport-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.sport === sport);
        });

        // Update panel visibility
        document.querySelectorAll('.sport-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `${sport}-panel`);
        });

        // Clear previous results
        clearResults();
    }

    // ==================== Form Handling ====================

    function initForms() {
        const forms = {
            'running-form': 'running',
            'cycling-form': 'cycling',
            'triathlon-form': 'triathlon',
            'hyrox-form': 'hyrox'
        };

        Object.entries(forms).forEach(([formId, sport]) => {
            const form = document.getElementById(formId);
            if (form) {
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    generatePlan(sport, form);
                });
            }
        });
    }

    function generatePlan(sport, form) {
        try {
            const formData = new FormData(form);
            const inputs = extractInputs(formData, sport);

            // Get the appropriate generator
            const GeneratorClass = getGeneratorClass(sport);
            if (!GeneratorClass) {
                throw new Error('Generator not found for ' + sport);
            }

            // Create a temporary generator instance
            const tempGenerator = createTempGenerator(GeneratorClass, sport);

            // Generate the plan
            const plan = tempGenerator.generatePlanFromInputs(inputs);

            if (!plan) {
                throw new Error('Failed to generate plan');
            }

            // Store current plan
            state.currentPlan = plan;
            localStorage.setItem(CONFIG.STORAGE_KEYS.currentPlan, JSON.stringify({
                sport: sport,
                plan: plan,
                inputs: inputs,
                timestamp: Date.now()
            }));

            // Display results
            displayPlanResults(plan);

            // Track event
            if (typeof gtag === 'function') {
                gtag('event', 'generate_plan', {
                    'event_category': 'Training Plans',
                    'event_label': sport + ' - ' + (inputs.distance || inputs.division || 'default')
                });
            }

            showToast('Training plan generated!');

        } catch (error) {
            console.error('Plan generation error:', error);
            showToast('Error generating plan. Please try again.');
        }
    }

    function extractInputs(formData, sport) {
        const inputs = {
            sport: sport
        };

        for (let [key, value] of formData.entries()) {
            // Handle checkbox arrays (like equipment)
            if (key === 'equipment') {
                if (!inputs.equipment) inputs.equipment = [];
                inputs.equipment.push(value);
            } else {
                inputs[key] = value;
            }
        }

        // Parse numeric values
        ['weeks', 'weeklyMileage', 'weeklyHours', 'trainingDays'].forEach(key => {
            if (inputs[key]) {
                inputs[key] = parseInt(inputs[key], 10);
            }
        });

        // Map form fields to generator expected fields
        inputs.goalDistance = inputs.distance;
        inputs.weeksUntilRace = inputs.weeks;
        inputs.currentVolume = inputs.weeklyMileage || inputs.weeklyHours || 20;

        return inputs;
    }

    function getGeneratorClass(sport) {
        const generators = {
            'running': window.RunningPlanGenerator,
            'cycling': window.CyclingPlanGenerator,
            'triathlon': window.TriathlonPlanGenerator,
            'hyrox': window.HyroxPlanGenerator
        };
        return generators[sport];
    }

    function createTempGenerator(GeneratorClass, sport) {
        // Create a minimal generator that can produce plans without DOM dependencies
        const generator = Object.create(GeneratorClass.prototype);

        // Initialize required properties
        generator.sport = sport;
        generator.plan = null;

        // Add method to generate plan from inputs directly
        generator.generatePlanFromInputs = function(inputs) {
            try {
                // Validate inputs
                this.validateInputs(inputs);

                // Calculate total weeks
                inputs.totalWeeks = inputs.weeksUntilRace || inputs.weeks || 12;

                // Get distance config
                const distanceConfigs = this.getDistanceConfigs();
                const distanceKey = inputs.goalDistance || inputs.distance || Object.keys(distanceConfigs)[0];
                const distanceConfig = distanceConfigs[distanceKey];

                if (!distanceConfig) {
                    throw new Error('Invalid distance selected');
                }

                // Calculate phases
                const phases = this.calculatePhases(inputs, distanceConfig);

                // Generate all weeks
                const weeks = this.generateAllWeeks(inputs, phases, distanceConfig);

                // Build plan object
                return {
                    inputs: inputs,
                    phases: phases,
                    weeks: weeks,
                    distanceConfig: distanceConfig,
                    summary: this.generateSummary(inputs, phases, weeks)
                };
            } catch (error) {
                console.error('Generation error:', error);
                return null;
            }
        };

        // Provide default validateInputs if not present
        if (!generator.validateInputs) {
            generator.validateInputs = function(inputs) {
                if (!inputs.weeks && !inputs.weeksUntilRace) {
                    throw new Error('Please specify training weeks');
                }
            };
        }

        return generator;
    }

    // ==================== Display Results ====================

    function displayPlanResults(plan) {
        const container = document.getElementById('plan-results');
        if (!container) return;

        // Clear previous results
        container.textContent = '';

        // Create plan summary header
        const header = document.createElement('div');
        header.className = 'mb-6 p-5 bg-white rounded-sm border-l-4 border-copper shadow-sm';

        const title = document.createElement('h3');
        title.className = 'font-display text-xl font-semibold text-charcoal mb-3';
        title.textContent = (plan.distanceConfig?.name || plan.inputs.goalDistance || 'Training') + ' Plan';
        header.appendChild(title);

        const summaryGrid = document.createElement('div');
        summaryGrid.className = 'grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm';

        const summaryItems = [
            { label: 'Weeks', value: plan.summary?.totalWeeks || plan.weeks?.length || '-' },
            { label: 'Peak Volume', value: (plan.summary?.peakVolume || '-') + ' mi' },
            { label: 'Recovery Weeks', value: plan.summary?.recoveryWeeks || '-' },
            { label: 'Level', value: capitalizeFirst(plan.inputs?.fitnessLevel || plan.inputs?.experienceLevel || '-') }
        ];

        summaryItems.forEach(item => {
            const div = document.createElement('div');
            const labelSpan = document.createElement('span');
            labelSpan.className = 'text-warm-gray block text-xs uppercase tracking-wide';
            labelSpan.textContent = item.label;
            const valueSpan = document.createElement('span');
            valueSpan.className = 'text-charcoal font-semibold';
            valueSpan.textContent = item.value;
            div.appendChild(labelSpan);
            div.appendChild(valueSpan);
            summaryGrid.appendChild(div);
        });

        header.appendChild(summaryGrid);
        container.appendChild(header);

        // Create phase overview
        if (plan.phases && plan.phases.length > 0) {
            const phasesSection = document.createElement('div');
            phasesSection.className = 'mb-6';

            const phasesTitle = document.createElement('h4');
            phasesTitle.className = 'font-display text-lg font-medium text-charcoal mb-3';
            phasesTitle.textContent = 'Training Phases';
            phasesSection.appendChild(phasesTitle);

            const phasesGrid = document.createElement('div');
            phasesGrid.className = 'flex flex-wrap gap-2';

            plan.phases.forEach(phase => {
                const badge = document.createElement('span');
                badge.className = 'px-4 py-2 rounded-sm text-sm font-medium border';

                // Phase colors - distinct from workout intensity colors
                // Using border style to differentiate from workout day colors
                const phaseColors = {
                    'base': 'bg-white border-charcoal/30 text-charcoal',
                    'build': 'bg-copper/10 border-copper text-copper-dark',
                    'peak': 'bg-charcoal text-white border-charcoal',
                    'taper': 'bg-sage/10 border-sage text-sage'
                };
                badge.className += ' ' + (phaseColors[phase.name?.toLowerCase()] || 'bg-gray-100 border-gray-300 text-gray-600');
                badge.textContent = (phase.label || phase.name) + ' (' + phase.duration + 'w)';
                phasesGrid.appendChild(badge);
            });

            phasesSection.appendChild(phasesGrid);
            container.appendChild(phasesSection);
        }

        // Create week-by-week breakdown
        if (plan.weeks && plan.weeks.length > 0) {
            const weeksSection = document.createElement('div');

            const weeksTitle = document.createElement('h4');
            weeksTitle.className = 'font-display text-lg font-medium text-charcoal mb-3';
            weeksTitle.textContent = 'Week-by-Week Plan';
            weeksSection.appendChild(weeksTitle);

            const weeksContainer = document.createElement('div');
            weeksContainer.className = 'space-y-3 max-h-96 overflow-y-auto pr-2';

            plan.weeks.forEach((week, index) => {
                const weekCard = document.createElement('div');
                weekCard.className = 'bg-white rounded-sm p-4 border border-charcoal/10 shadow-sm';

                if (week.isRecovery) {
                    weekCard.classList.add('border-l-4', 'border-l-sage');
                }

                const weekHeader = document.createElement('div');
                weekHeader.className = 'flex items-center justify-between mb-3';

                const weekTitleEl = document.createElement('span');
                weekTitleEl.className = 'font-semibold text-charcoal';
                weekTitleEl.textContent = 'Week ' + week.weekNumber;

                const weekBadge = document.createElement('span');
                weekBadge.className = 'text-xs px-2 py-1 rounded-sm';
                if (week.isRecovery) {
                    weekBadge.className += ' bg-sage/20 text-sage';
                    weekBadge.textContent = 'Recovery';
                } else {
                    weekBadge.className += ' bg-charcoal/10 text-charcoal/70';
                    weekBadge.textContent = week.phaseLabel || week.phase || '';
                }

                weekHeader.appendChild(weekTitleEl);
                weekHeader.appendChild(weekBadge);
                weekCard.appendChild(weekHeader);

                // Show days
                if (week.days) {
                    const daysGrid = document.createElement('div');
                    daysGrid.className = 'grid grid-cols-7 gap-1';

                    week.days.forEach(day => {
                        const dayEl = document.createElement('div');
                        dayEl.className = 'text-center p-2 rounded-sm text-xs';

                        const isRest = !day.workout || day.workout.name === 'Rest Day' || day.workout.type === 'REST';

                        if (isRest) {
                            dayEl.className += ' bg-charcoal/5 text-charcoal/40';
                        } else {
                            const categoryColors = {
                                'easy': 'bg-blue-100 text-blue-700',
                                'moderate': 'bg-amber-100 text-amber-700',
                                'hard': 'bg-red-100 text-red-700'
                            };
                            dayEl.className += ' ' + (categoryColors[day.workout?.category] || 'bg-copper/10 text-copper');
                        }

                        const dayName = document.createElement('div');
                        dayName.className = 'font-medium mb-1';
                        dayName.textContent = (day.dayShort || day.dayName || '').substring(0, 3);

                        const workoutName = document.createElement('div');
                        workoutName.className = 'truncate';
                        workoutName.title = day.workout?.name || 'Rest';
                        workoutName.textContent = isRest ? 'Rest' : (day.workout?.name || '').substring(0, 8);

                        dayEl.appendChild(dayName);
                        dayEl.appendChild(workoutName);
                        daysGrid.appendChild(dayEl);
                    });

                    weekCard.appendChild(daysGrid);
                }

                // Volume info
                const volumeEl = document.createElement('div');
                volumeEl.className = 'mt-2 text-xs text-warm-gray';
                volumeEl.textContent = 'Volume: ' + (week.targetVolume || week.totalMiles || '-') + ' mi';
                weekCard.appendChild(volumeEl);

                weeksContainer.appendChild(weekCard);
            });

            weeksSection.appendChild(weeksContainer);
            container.appendChild(weeksSection);
        }

        // Scroll to results
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    function clearResults() {
        const container = document.getElementById('plan-results');
        if (container) {
            container.textContent = '';
        }
        state.currentPlan = null;
    }

    // ==================== Export Functions ====================

    function initExportButtons() {
        // Calendar export
        document.getElementById('export-calendar')?.addEventListener('click', () => {
            if (!state.isPremium) {
                redirectToStripe();
                return;
            }
            if (!state.currentPlan) {
                showToast('Please generate a plan first');
                return;
            }
            TrainingPlanExporter.exportICS(state.currentPlan, '06:00');
        });

        // PDF export
        document.getElementById('export-pdf')?.addEventListener('click', () => {
            if (!state.isPremium) {
                redirectToStripe();
                return;
            }
            if (!state.currentPlan) {
                showToast('Please generate a plan first');
                return;
            }
            TrainingPlanExporter.exportPDF(state.currentPlan);
        });

        // Excel/CSV export
        document.getElementById('export-excel')?.addEventListener('click', () => {
            if (!state.isPremium) {
                redirectToStripe();
                return;
            }
            if (!state.currentPlan) {
                showToast('Please generate a plan first');
                return;
            }
            TrainingPlanExporter.exportCSV(state.currentPlan);
        });
    }

    function redirectToStripe() {
        // Track conversion attempt
        if (typeof gtag === 'function') {
            gtag('event', 'begin_checkout', {
                'event_category': 'Premium',
                'event_label': 'Premium Training Plans'
            });
        }
        window.location.href = CONFIG.STRIPE_LINK;
    }

    // ==================== Save & Share ====================

    function initSaveShare() {
        // Save plan button
        document.getElementById('save-plan')?.addEventListener('click', () => {
            if (!state.isPremium) {
                redirectToStripe();
                return;
            }
            if (!state.currentPlan) {
                showToast('Please generate a plan first');
                return;
            }
            savePlan();
        });

        // Share plan button
        document.getElementById('share-plan')?.addEventListener('click', () => {
            if (!state.isPremium) {
                redirectToStripe();
                return;
            }
            if (!state.currentPlan) {
                showToast('Please generate a plan first');
                return;
            }
            sharePlan();
        });

        // Load saved plans
        loadSavedPlans();
    }

    function savePlan() {
        if (!state.currentPlan) return;

        // Load existing saved plans
        const savedPlans = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.savedPlans) || '[]');

        // Check limit
        if (savedPlans.length >= CONFIG.MAX_SAVED_PLANS) {
            showToast('Maximum ' + CONFIG.MAX_SAVED_PLANS + ' plans reached. Delete one to save new.');
            return;
        }

        // Create saved plan object
        const savedPlan = {
            id: Date.now().toString(),
            sport: state.currentSport,
            name: (state.currentPlan.distanceConfig?.name || state.currentSport) + ' Plan',
            inputs: state.currentPlan.inputs,
            summary: state.currentPlan.summary,
            savedAt: new Date().toISOString()
        };

        savedPlans.push(savedPlan);
        localStorage.setItem(CONFIG.STORAGE_KEYS.savedPlans, JSON.stringify(savedPlans));

        state.savedPlans = savedPlans;
        renderSavedPlans();
        showToast('Plan saved!');
    }

    function loadSavedPlans() {
        state.savedPlans = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEYS.savedPlans) || '[]');
        renderSavedPlans();
    }

    function renderSavedPlans() {
        const container = document.getElementById('saved-plans-list');
        const countEl = document.getElementById('saved-count');

        if (!container) return;

        // Update count
        if (countEl) {
            countEl.textContent = state.savedPlans.length + '/' + CONFIG.MAX_SAVED_PLANS;
        }

        // Clear container
        container.textContent = '';

        if (state.savedPlans.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.className = 'text-slate-500 text-sm text-center py-8';
            emptyMsg.textContent = 'No saved plans yet';
            container.appendChild(emptyMsg);
            return;
        }

        state.savedPlans.forEach(plan => {
            const item = document.createElement('div');
            item.className = 'saved-plan-item flex items-center justify-between p-3 rounded-lg bg-slate-800/30 cursor-pointer';

            const sportIcons = {
                'running': '🏃',
                'cycling': '🚴',
                'triathlon': '🏊',
                'hyrox': '💪'
            };

            const info = document.createElement('div');
            info.className = 'flex items-center gap-3';

            const icon = document.createElement('span');
            icon.className = 'text-lg';
            icon.textContent = sportIcons[plan.sport] || '📋';

            const text = document.createElement('div');

            const name = document.createElement('div');
            name.className = 'font-medium text-white text-sm';
            name.textContent = plan.name;

            const date = document.createElement('div');
            date.className = 'text-xs text-slate-400';
            date.textContent = new Date(plan.savedAt).toLocaleDateString();

            text.appendChild(name);
            text.appendChild(date);
            info.appendChild(icon);
            info.appendChild(text);

            const actions = document.createElement('div');
            actions.className = 'flex gap-2';

            const loadBtn = document.createElement('button');
            loadBtn.className = 'text-primary hover:text-blue-400 text-sm';
            loadBtn.textContent = 'Load';
            loadBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                loadPlan(plan);
            });

            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'text-red-400 hover:text-red-300 text-sm';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                deletePlan(plan.id);
            });

            actions.appendChild(loadBtn);
            actions.appendChild(deleteBtn);

            item.appendChild(info);
            item.appendChild(actions);
            container.appendChild(item);
        });
    }

    function loadPlan(savedPlan) {
        // Switch to the correct sport
        switchSport(savedPlan.sport);

        // Fill in the form with saved inputs
        const form = document.getElementById(savedPlan.sport + '-form');
        if (form && savedPlan.inputs) {
            Object.entries(savedPlan.inputs).forEach(([key, value]) => {
                const input = form.querySelector('[name="' + key + '"]');
                if (input) {
                    if (input.type === 'checkbox') {
                        input.checked = Array.isArray(value) ? value.includes(input.value) : value;
                    } else {
                        input.value = value;
                    }
                }
            });

            // Generate the plan
            generatePlan(savedPlan.sport, form);
        }

        showToast('Plan loaded!');
    }

    function deletePlan(planId) {
        state.savedPlans = state.savedPlans.filter(p => p.id !== planId);
        localStorage.setItem(CONFIG.STORAGE_KEYS.savedPlans, JSON.stringify(state.savedPlans));
        renderSavedPlans();
        showToast('Plan deleted');
    }

    function sharePlan() {
        if (!state.currentPlan?.inputs) return;

        // Build URL with plan parameters
        const params = new URLSearchParams();
        params.set('sport', state.currentSport);

        Object.entries(state.currentPlan.inputs).forEach(([key, value]) => {
            if (value && key !== 'sport') {
                if (Array.isArray(value)) {
                    params.set(key, value.join(','));
                } else {
                    params.set(key, value);
                }
            }
        });

        const shareUrl = window.location.origin + '/premium-training-plans?' + params.toString();

        // Copy to clipboard
        navigator.clipboard.writeText(shareUrl).then(() => {
            showToast('Link copied to clipboard!');
        }).catch(() => {
            // Fallback for older browsers
            const input = document.createElement('input');
            input.value = shareUrl;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            showToast('Link copied to clipboard!');
        });
    }

    function loadFromURLParams() {
        const params = new URLSearchParams(window.location.search);
        const sport = params.get('sport');

        if (sport && ['running', 'cycling', 'triathlon', 'hyrox'].includes(sport)) {
            switchSport(sport);

            // Fill form from URL params
            const form = document.getElementById(sport + '-form');
            if (form) {
                params.forEach((value, key) => {
                    if (key === 'sport') return;

                    const input = form.querySelector('[name="' + key + '"]');
                    if (input) {
                        if (input.type === 'checkbox') {
                            const values = value.split(',');
                            input.checked = values.includes(input.value);
                        } else {
                            input.value = value;
                        }
                    }
                });

                // Auto-generate if params present
                if (params.has('distance') || params.has('division')) {
                    setTimeout(() => generatePlan(sport, form), 500);
                }
            }
        }
    }

    // ==================== Utility Functions ====================

    function showToast(message, type = 'success') {
        // Remove existing toast
        const existingToast = document.getElementById('premium-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.id = 'premium-toast';
        toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-xl shadow-2xl z-50 flex items-center gap-2 transition-all duration-300';

        if (type === 'error') {
            toast.classList.add('bg-red-600', 'text-white');
        } else {
            toast.classList.add('bg-slate-800', 'text-white', 'border', 'border-slate-700');
        }

        const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        icon.setAttribute('class', 'w-5 h-5 ' + (type === 'error' ? 'text-red-200' : 'text-green-400'));
        icon.setAttribute('fill', 'none');
        icon.setAttribute('stroke', 'currentColor');
        icon.setAttribute('viewBox', '0 0 24 24');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('d', type === 'error' ? 'M6 18L18 6M6 6l12 12' : 'M5 13l4 4L19 7');
        icon.appendChild(path);

        const text = document.createElement('span');
        text.textContent = message;

        toast.appendChild(icon);
        toast.appendChild(text);
        document.body.appendChild(toast);

        // Animate in
        toast.style.opacity = '0';
        toast.style.transform = 'translate(-50%, 20px)';
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translate(-50%, 0)';
        });

        // Remove after delay
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translate(-50%, 20px)';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    function capitalizeFirst(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    // ==================== Initialization ====================

    function init() {
        // Check premium status
        checkPremiumStatus();

        // Initialize components
        initTabs();
        initForms();
        initExportButtons();
        initSaveShare();

        // Load from URL params if present
        loadFromURLParams();

        // Listen for storage changes (e.g., if premium unlocked in another tab)
        window.addEventListener('storage', (e) => {
            if (e.key === CONFIG.STORAGE_KEYS.premium) {
                checkPremiumStatus();
            }
        });

        console.log('Premium Plans initialized', { isPremium: state.isPremium });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for debugging
    window.PremiumPlans = {
        state: state,
        unlockPremium: unlockPremium,
        checkPremiumStatus: checkPremiumStatus
    };

})();
