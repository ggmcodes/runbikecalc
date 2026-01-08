class TrainingLoadCalculator extends Calculator {
    constructor() {
        super('trainingLoadForm', 'currentMetrics');
        this.sessions = [];
        this.chart = null;
        this.initChart();
        this.setDefaultDate();
        this.updateDisplay();
    }

    setDefaultDate() {
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('sessionDate').value = today;
    }

    initChart() {
        const ctx = document.getElementById('trainingLoadChart').getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: 'CTL (Fitness)',
                        data: [],
                        borderColor: 'rgb(34, 197, 94)',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        tension: 0.3
                    },
                    {
                        label: 'ATL (Fatigue)',
                        data: [],
                        borderColor: 'rgb(234, 179, 8)',
                        backgroundColor: 'rgba(234, 179, 8, 0.1)',
                        tension: 0.3
                    },
                    {
                        label: 'TSB (Form)',
                        data: [],
                        borderColor: 'rgb(168, 85, 247)',
                        backgroundColor: 'rgba(168, 85, 247, 0.1)',
                        tension: 0.3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Training Load Metrics (Last 60 Days)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Training Load'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    }
                }
            }
        });
    }

    addSession() {
        try {
            const sessionData = this.collectSessionData();
            this.validateSessionData(sessionData);
            
            // Calculate TSS for the session
            const tss = this.calculateTSS(sessionData.duration, sessionData.intensity);
            sessionData.tss = tss;
            
            // Add to sessions array
            this.sessions.push(sessionData);
            
            // Sort sessions by date
            this.sessions.sort((a, b) => new Date(a.date) - new Date(b.date));
            
            // Update displays
            this.updateDisplay();
            this.updateChart();
            this.updateSessionsList();
            this.updateRecommendations();
            
            // Clear form
            this.clearSessionForm();
            
            // Save to localStorage
            this.saveData();
            
        } catch (error) {
            alert(error.message);
        }
    }

    collectSessionData() {
        return {
            date: document.getElementById('sessionDate').value,
            type: document.getElementById('sessionType').value,
            duration: parseInt(document.getElementById('duration').value),
            intensity: parseFloat(document.getElementById('intensity').value),
            rpe: parseInt(document.getElementById('rpe').value),
            sport: document.getElementById('sport').value
        };
    }

    validateSessionData(data) {
        if (!data.date) throw new Error('Please select a session date');
        if (!data.duration || data.duration < 15) throw new Error('Duration must be at least 15 minutes');
        if (!data.intensity || data.intensity < 0.5 || data.intensity > 1.5) {
            throw new Error('Intensity Factor must be between 0.5 and 1.5');
        }
    }

    calculateTSS(duration, intensity) {
        // TSS = (duration_in_seconds × NP × IF) / (FTP × 3600) × 100
        // Simplified: TSS = (duration_in_hours × IF²) × 100
        const durationHours = duration / 60;
        return Math.round(durationHours * Math.pow(intensity, 2) * 100);
    }

    calculate() {
        // This method is called by the form submission
        if (this.sessions.length === 0) {
            alert('Please add at least one training session');
            return;
        }
        
        this.updateDisplay();
        this.updateChart();
        this.updateRecommendations();
    }

    updateDisplay() {
        const metrics = this.calculateCurrentMetrics();
        const metricsContainer = document.getElementById('currentMetrics');
        
        metricsContainer.innerHTML = `
            <div class="text-center">
                <div class="text-2xl font-bold text-blue-600">${metrics.weeklyTSS}</div>
                <div class="text-sm text-gray-600">Weekly TSS</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-green-600">${metrics.ctl.toFixed(1)}</div>
                <div class="text-sm text-gray-600">CTL (Fitness)</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-yellow-600">${metrics.atl.toFixed(1)}</div>
                <div class="text-sm text-gray-600">ATL (Fatigue)</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold ${this.getTSBColor(metrics.tsb)}">${metrics.tsb >= 0 ? '+' : ''}${metrics.tsb.toFixed(1)}</div>
                <div class="text-sm text-gray-600">TSB (Form)</div>
            </div>
        `;
    }

    calculateCurrentMetrics() {
        const today = new Date();
        const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        const fortyTwoDaysAgo = new Date(today.getTime() - 42 * 24 * 60 * 60 * 1000);
        
        // Calculate weekly TSS (last 7 days)
        const weeklyTSS = this.sessions
            .filter(session => new Date(session.date) >= sevenDaysAgo)
            .reduce((sum, session) => sum + session.tss, 0);
        
        // Calculate ATL (7-day exponentially weighted average)
        const atl = this.calculateExponentialAverage(7);
        
        // Calculate CTL (42-day exponentially weighted average)
        const ctl = this.calculateExponentialAverage(42);
        
        // Calculate TSB (Training Stress Balance)
        const tsb = ctl - atl;
        
        return { weeklyTSS, ctl, atl, tsb };
    }

    calculateExponentialAverage(days) {
        if (this.sessions.length === 0) return 0;
        
        const today = new Date();
        const startDate = new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
        
        let average = 0;
        const alpha = 2 / (days + 1); // Exponential smoothing factor
        
        // Get sessions from the last 'days' period
        const relevantSessions = this.sessions.filter(session => 
            new Date(session.date) >= startDate
        );
        
        if (relevantSessions.length === 0) return 0;
        
        // Calculate exponentially weighted average
        for (let i = 0; i < relevantSessions.length; i++) {
            const session = relevantSessions[i];
            if (i === 0) {
                average = session.tss;
            } else {
                average = (alpha * session.tss) + ((1 - alpha) * average);
            }
        }
        
        return average;
    }

    getTSBColor(tsb) {
        if (tsb >= 10) return 'text-green-600';
        if (tsb >= -10) return 'text-yellow-600';
        if (tsb >= -30) return 'text-orange-600';
        return 'text-red-600';
    }

    updateChart() {
        const chartData = this.generateChartData();
        
        this.chart.data.labels = chartData.labels;
        this.chart.data.datasets[0].data = chartData.ctl;
        this.chart.data.datasets[1].data = chartData.atl;
        this.chart.data.datasets[2].data = chartData.tsb;
        
        this.chart.update();
    }

    generateChartData() {
        const today = new Date();
        const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);
        
        const labels = [];
        const ctlData = [];
        const atlData = [];
        const tsbData = [];
        
        // Generate data for last 60 days
        for (let i = 60; i >= 0; i--) {
            const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
            const dateStr = date.toISOString().split('T')[0];
            
            // Calculate metrics for this specific date
            const sessionsUpToDate = this.sessions.filter(session => 
                new Date(session.date) <= date
            );
            
            if (sessionsUpToDate.length > 0) {
                const ctl = this.calculateCTLForDate(date);
                const atl = this.calculateATLForDate(date);
                const tsb = ctl - atl;
                
                labels.push(dateStr);
                ctlData.push(ctl);
                atlData.push(atl);
                tsbData.push(tsb);
            }
        }
        
        return { labels, ctl: ctlData, atl: atlData, tsb: tsbData };
    }

    calculateCTLForDate(targetDate) {
        const fortyTwoDaysAgo = new Date(targetDate.getTime() - 42 * 24 * 60 * 60 * 1000);
        const relevantSessions = this.sessions.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= fortyTwoDaysAgo && sessionDate <= targetDate;
        });
        
        if (relevantSessions.length === 0) return 0;
        
        let ctl = 0;
        const alpha = 2 / 43; // 42 day period + 1
        
        relevantSessions.forEach((session, index) => {
            if (index === 0) {
                ctl = session.tss;
            } else {
                ctl = (alpha * session.tss) + ((1 - alpha) * ctl);
            }
        });
        
        return ctl;
    }

    calculateATLForDate(targetDate) {
        const sevenDaysAgo = new Date(targetDate.getTime() - 7 * 24 * 60 * 60 * 1000);
        const relevantSessions = this.sessions.filter(session => {
            const sessionDate = new Date(session.date);
            return sessionDate >= sevenDaysAgo && sessionDate <= targetDate;
        });
        
        if (relevantSessions.length === 0) return 0;
        
        let atl = 0;
        const alpha = 2 / 8; // 7 day period + 1
        
        relevantSessions.forEach((session, index) => {
            if (index === 0) {
                atl = session.tss;
            } else {
                atl = (alpha * session.tss) + ((1 - alpha) * atl);
            }
        });
        
        return atl;
    }

    updateSessionsList() {
        const sessionsList = document.getElementById('sessionsList');
        
        if (this.sessions.length === 0) {
            sessionsList.innerHTML = '<p class="text-gray-500 text-center py-4">Add training sessions to see your training log</p>';
            return;
        }
        
        // Show last 10 sessions
        const recentSessions = this.sessions.slice(-10).reverse();
        
        sessionsList.innerHTML = recentSessions.map(session => `
            <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex-1">
                    <div class="flex items-center space-x-4">
                        <div class="w-3 h-3 rounded-full ${this.getSessionTypeColor(session.type)}"></div>
                        <div>
                            <p class="font-medium text-gray-900">${this.formatSessionType(session.type)}</p>
                            <p class="text-sm text-gray-600">${session.date} • ${session.duration} min • IF ${session.intensity}</p>
                        </div>
                    </div>
                </div>
                <div class="text-right">
                    <p class="font-semibold text-gray-900">${session.tss} TSS</p>
                    <p class="text-sm text-gray-600">RPE ${session.rpe}/10</p>
                </div>
                <button onclick="trainingLoadCalc.removeSession('${session.date}')" class="ml-4 text-red-500 hover:text-red-700">
                    <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
                    </svg>
                </button>
            </div>
        `).join('');
    }

    getSessionTypeColor(type) {
        const colors = {
            recovery: 'bg-green-500',
            endurance: 'bg-blue-500',
            tempo: 'bg-yellow-500',
            vo2max: 'bg-orange-500',
            anaerobic: 'bg-red-500',
            race: 'bg-purple-500'
        };
        return colors[type] || 'bg-gray-500';
    }

    formatSessionType(type) {
        const formats = {
            recovery: 'Recovery/Easy',
            endurance: 'Endurance/Base',
            tempo: 'Tempo/Threshold',
            vo2max: 'VO2 Max/Intervals',
            anaerobic: 'Anaerobic/Neuromuscular',
            race: 'Race/Time Trial'
        };
        return formats[type] || type;
    }

    updateRecommendations() {
        const metrics = this.calculateCurrentMetrics();
        const recommendations = this.generateRecommendations(metrics);
        
        const recommendationsContainer = document.getElementById('recommendations');
        recommendationsContainer.innerHTML = recommendations.map(rec => `
            <div class="border-l-4 ${rec.colorClass} pl-4 py-2">
                <h4 class="font-semibold ${rec.textColorClass}">${rec.title}</h4>
                <p class="text-gray-600 text-sm">${rec.description}</p>
            </div>
        `).join('');

        // Show product recommendations
        if (typeof renderProductRecommendations === 'function') {
            document.getElementById('product-recommendations').classList.remove('hidden');
            renderProductRecommendations('product-recommendations', 'training-load');
        }
    }

    generateRecommendations(metrics) {
        const recommendations = [];
        
        // TSB-based recommendations
        if (metrics.tsb >= 10) {
            recommendations.push({
                title: 'Peak Form - Ready to Race!',
                description: 'You\'re in excellent form for racing or key workouts. This is an ideal time for competitions or breakthrough sessions.',
                colorClass: 'border-green-500',
                textColorClass: 'text-green-900'
            });
        } else if (metrics.tsb >= -10) {
            recommendations.push({
                title: 'Training Ready',
                description: 'Good balance of fitness and freshness. Continue with planned training sessions and monitor fatigue levels.',
                colorClass: 'border-blue-500',
                textColorClass: 'text-blue-900'
            });
        } else if (metrics.tsb >= -30) {
            recommendations.push({
                title: 'Building Fitness',
                description: 'You\'re in a productive overreaching phase. Monitor recovery closely and ensure adequate sleep and nutrition.',
                colorClass: 'border-yellow-500',
                textColorClass: 'text-yellow-900'
            });
        } else {
            recommendations.push({
                title: 'High Fatigue Risk',
                description: 'Consider reducing training load or adding extra recovery days. Risk of overtraining if this continues.',
                colorClass: 'border-red-500',
                textColorClass: 'text-red-900'
            });
        }
        
        // Weekly TSS recommendations
        const experience = document.getElementById('experienceLevel').value;
        const optimalTSS = this.getOptimalWeeklyTSS(experience);
        
        if (metrics.weeklyTSS < optimalTSS * 0.7) {
            recommendations.push({
                title: 'Increase Training Volume',
                description: `Your weekly TSS (${metrics.weeklyTSS}) is below optimal range. Consider adding more training volume gradually.`,
                colorClass: 'border-blue-500',
                textColorClass: 'text-blue-900'
            });
        } else if (metrics.weeklyTSS > optimalTSS * 1.3) {
            recommendations.push({
                title: 'High Training Volume',
                description: `Your weekly TSS (${metrics.weeklyTSS}) is quite high. Ensure you have adequate recovery planned.`,
                colorClass: 'border-orange-500',
                textColorClass: 'text-orange-900'
            });
        }
        
        // CTL progression recommendations
        if (this.sessions.length >= 14) {
            const ctlTrend = this.calculateCTLTrend();
            if (ctlTrend > 8) {
                recommendations.push({
                    title: 'Rapid Fitness Gains',
                    description: 'Your fitness is improving quickly. Consider a recovery week soon to consolidate adaptations.',
                    colorClass: 'border-purple-500',
                    textColorClass: 'text-purple-900'
                });
            }
        }
        
        return recommendations;
    }

    getOptimalWeeklyTSS(experience) {
        const ranges = {
            beginner: 300,
            intermediate: 500,
            advanced: 700,
            elite: 1000
        };
        return ranges[experience] || 500;
    }

    calculateCTLTrend() {
        if (this.sessions.length < 14) return 0;
        
        const today = new Date();
        const twoWeeksAgo = new Date(today.getTime() - 14 * 24 * 60 * 60 * 1000);
        
        const currentCTL = this.calculateCurrentMetrics().ctl;
        const pastCTL = this.calculateCTLForDate(twoWeeksAgo);
        
        return currentCTL - pastCTL;
    }

    removeSession(dateToRemove) {
        this.sessions = this.sessions.filter(session => session.date !== dateToRemove);
        this.updateDisplay();
        this.updateChart();
        this.updateSessionsList();
        this.updateRecommendations();
        this.saveData();
    }

    clearSessionForm() {
        document.getElementById('duration').value = '';
        document.getElementById('intensity').value = '';
        document.getElementById('sessionType').selectedIndex = 0;
        document.getElementById('rpe').selectedIndex = 0;
        this.setDefaultDate();
    }

    saveData() {
        localStorage.setItem('trainingLoadSessions', JSON.stringify(this.sessions));
    }

    loadData() {
        const saved = localStorage.getItem('trainingLoadSessions');
        if (saved) {
            this.sessions = JSON.parse(saved);
            this.updateDisplay();
            this.updateChart();
            this.updateSessionsList();
            this.updateRecommendations();
        }
    }
}

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', function() {
    window.trainingLoadCalc = new TrainingLoadCalculator();
    window.trainingLoadCalc.loadData();
});