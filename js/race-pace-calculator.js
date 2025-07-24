class RacePaceCalculator extends Calculator {
    constructor() {
        super('racePaceForm', 'results');
        this.initEventListeners();
    }

    initEventListeners() {
        // Input method radio buttons
        const inputMethods = document.querySelectorAll('input[name="inputMethod"]');
        inputMethods.forEach(method => {
            method.addEventListener('change', () => this.toggleInputSections());
        });

        // Custom distance toggle
        document.getElementById('recentDistance').addEventListener('change', (e) => {
            const customInput = document.getElementById('customDistanceInput');
            if (e.target.value === 'custom') {
                customInput.classList.remove('hidden');
            } else {
                customInput.classList.add('hidden');
            }
        });
    }

    toggleInputSections() {
        const selectedMethod = document.querySelector('input[name="inputMethod"]:checked').value;
        const sections = document.querySelectorAll('.input-section');
        
        sections.forEach(section => section.classList.add('hidden'));
        document.getElementById(`${selectedMethod}Input`).classList.remove('hidden');
    }

    calculate() {
        const inputMethod = document.querySelector('input[name="inputMethod"]:checked').value;
        let baseTimeSeconds, targetDistance;

        try {
            switch (inputMethod) {
                case 'recentRace':
                    baseTimeSeconds = this.calculateFromRecentRace();
                    targetDistance = this.getTargetDistance();
                    break;
                case 'targetTime':
                    baseTimeSeconds = this.calculateFromTargetTime();
                    targetDistance = this.getTargetDistanceFromTarget();
                    break;
                case 'vo2max':
                    baseTimeSeconds = this.calculateFromVO2Max();
                    targetDistance = this.getTargetDistanceFromVO2();
                    break;
                default:
                    throw new Error('Invalid input method');
            }

            if (!baseTimeSeconds || !targetDistance) {
                throw new Error('Please fill in all required fields');
            }

            const results = this.generateRaceStrategy(baseTimeSeconds, targetDistance);
            this.displayResults(results);

        } catch (error) {
            this.displayError(error.message);
        }
    }

    calculateFromRecentRace() {
        const hours = parseInt(document.getElementById('recentHours').value) || 0;
        const minutes = parseInt(document.getElementById('recentMinutes').value) || 0;
        const seconds = parseInt(document.getElementById('recentSeconds').value) || 0;
        
        if (hours === 0 && minutes === 0 && seconds === 0) {
            throw new Error('Please enter your recent race time');
        }

        const recentDistance = document.getElementById('recentDistance').value;
        const recentTimeSeconds = hours * 3600 + minutes * 60 + seconds;
        
        let recentDistanceKm;
        if (recentDistance === 'custom') {
            recentDistanceKm = parseFloat(document.getElementById('customDistance').value);
            if (!recentDistanceKm) {
                throw new Error('Please enter custom distance');
            }
        } else {
            recentDistanceKm = this.getDistanceInKm(recentDistance);
        }

        // Use Riegel's formula to predict times for other distances
        const targetDistanceKm = this.getTargetDistanceInKm();
        const fatigueFactor = this.getFatigueFactor();
        
        return recentTimeSeconds * Math.pow(targetDistanceKm / recentDistanceKm, fatigueFactor);
    }

    calculateFromTargetTime() {
        const hours = parseInt(document.getElementById('targetHours').value) || 0;
        const minutes = parseInt(document.getElementById('targetMinutes').value) || 0;
        const seconds = parseInt(document.getElementById('targetSeconds').value) || 0;
        
        if (hours === 0 && minutes === 0 && seconds === 0) {
            throw new Error('Please enter your target race time');
        }

        return hours * 3600 + minutes * 60 + seconds;
    }

    calculateFromVO2Max() {
        const vo2max = parseFloat(document.getElementById('vo2max').value);
        if (!vo2max) {
            throw new Error('Please enter your VO2 Max');
        }

        const distance = document.getElementById('vo2Distance').value;
        const distanceKm = this.getDistanceInKm(distance);
        
        // Use Jack Daniels' VDOT formula to predict race times
        const vdot = vo2max;
        const raceTime = this.predictTimeFromVDOT(vdot, distanceKm);
        
        return raceTime;
    }

    predictTimeFromVDOT(vdot, distanceKm) {
        // Simplified VDOT prediction formulas
        const raceTimesMinutes = {
            5: -4.6 + 0.182239 * (5000 / vdot) + 0.000104 * Math.pow(5000 / vdot, 2),
            10: -4.6 + 0.182239 * (10000 / vdot) + 0.000104 * Math.pow(10000 / vdot, 2),
            15: -4.6 + 0.182239 * (15000 / vdot) + 0.000104 * Math.pow(15000 / vdot, 2),
            21.0975: -4.6 + 0.182239 * (21097.5 / vdot) + 0.000104 * Math.pow(21097.5 / vdot, 2),
            42.195: -4.6 + 0.182239 * (42195 / vdot) + 0.000104 * Math.pow(42195 / vdot, 2)
        };

        return (raceTimesMinutes[distanceKm] || raceTimesMinutes[5]) * 60;
    }

    getDistanceInKm(distance) {
        const distances = {
            '5k': 5,
            '10k': 10,
            '15k': 15,
            'half': 21.0975,
            'marathon': 42.195
        };
        return distances[distance];
    }

    getTargetDistance() {
        // For recent race method, user might want different target
        return document.getElementById('recentDistance').value;
    }

    getTargetDistanceFromTarget() {
        return document.getElementById('targetDistance').value;
    }

    getTargetDistanceFromVO2() {
        return document.getElementById('vo2Distance').value;
    }

    getTargetDistanceInKm() {
        const targetDistance = this.getTargetDistance();
        return this.getDistanceInKm(targetDistance);
    }

    getFatigueFactor() {
        // Riegel's fatigue factor - adjusts for experience and conditions
        const experience = document.getElementById('experienceLevel').value;
        const conditions = document.getElementById('raceConditions').value;
        
        let baseFactor = 1.06; // Standard Riegel factor
        
        // Adjust for experience
        switch (experience) {
            case 'beginner': baseFactor += 0.02; break;
            case 'intermediate': baseFactor += 0.01; break;
            case 'advanced': baseFactor -= 0.01; break;
            case 'elite': baseFactor -= 0.02; break;
        }
        
        // Adjust for conditions
        switch (conditions) {
            case 'hot': baseFactor += 0.015; break;
            case 'hilly': baseFactor += 0.01; break;
            case 'windy': baseFactor += 0.005; break;
            case 'challenging': baseFactor += 0.025; break;
        }
        
        return baseFactor;
    }

    generateRaceStrategy(targetTimeSeconds, distance) {
        const distanceKm = this.getDistanceInKm(distance);
        const targetPacePerKm = targetTimeSeconds / distanceKm;
        const targetPacePerMile = targetPacePerKm * 1.609344;
        
        // Generate different pace zones
        const paces = {
            easy: targetPacePerKm * 1.2,
            marathon: targetPacePerKm * 1.05,
            threshold: targetPacePerKm * 0.95,
            interval: targetPacePerKm * 0.85,
            repetition: targetPacePerKm * 0.75
        };

        // Generate split times
        const splits = this.generateSplits(targetTimeSeconds, distanceKm);
        
        // Generate negative split strategy
        const negativeSplits = this.generateNegativeSplits(targetTimeSeconds, distanceKm);

        return {
            targetTime: targetTimeSeconds,
            targetPacePerKm,
            targetPacePerMile,
            distance: distanceKm,
            distanceName: this.getDistanceName(distance),
            paces,
            splits,
            negativeSplits,
            recommendations: this.getTrainingRecommendations(distance, targetPacePerKm)
        };
    }

    generateSplits(totalTimeSeconds, distanceKm) {
        const splits = [];
        const pacePerKm = totalTimeSeconds / distanceKm;
        
        // Generate 5K splits for longer races, 1K for shorter
        const splitDistance = distanceKm >= 10 ? 5 : 1;
        const numSplits = Math.floor(distanceKm / splitDistance);
        
        for (let i = 1; i <= numSplits; i++) {
            const splitTime = pacePerKm * splitDistance * i;
            splits.push({
                distance: splitDistance * i,
                time: splitTime,
                formattedTime: this.formatTime(splitTime)
            });
        }
        
        // Add final split if needed
        const remainingDistance = distanceKm % splitDistance;
        if (remainingDistance > 0) {
            const finalTime = totalTimeSeconds;
            splits.push({
                distance: distanceKm,
                time: finalTime,
                formattedTime: this.formatTime(finalTime)
            });
        }
        
        return splits;
    }

    generateNegativeSplits(totalTimeSeconds, distanceKm) {
        const halfDistance = distanceKm / 2;
        const firstHalfTime = totalTimeSeconds * 0.505; // 1% slower first half
        const secondHalfTime = totalTimeSeconds * 0.495; // 1% faster second half
        
        return {
            firstHalf: {
                distance: halfDistance,
                time: firstHalfTime,
                pace: firstHalfTime / halfDistance,
                formattedTime: this.formatTime(firstHalfTime),
                formattedPace: this.formatTime(firstHalfTime / halfDistance)
            },
            secondHalf: {
                distance: halfDistance,
                time: secondHalfTime,
                pace: secondHalfTime / halfDistance,
                formattedTime: this.formatTime(secondHalfTime),
                formattedPace: this.formatTime(secondHalfTime / halfDistance)
            }
        };
    }

    getDistanceName(distance) {
        const names = {
            '5k': '5K',
            '10k': '10K',
            '15k': '15K',
            'half': 'Half Marathon',
            'marathon': 'Marathon'
        };
        return names[distance] || distance;
    }

    getTrainingRecommendations(distance, targetPacePerKm) {
        const recommendations = [];
        
        switch (distance) {
            case '5k':
                recommendations.push({
                    type: 'VO2 Max Intervals',
                    description: '5 x 1000m at interval pace with 400m recovery',
                    pace: targetPacePerKm * 0.85
                });
                recommendations.push({
                    type: 'Threshold Runs',
                    description: '20-30 minutes at threshold pace',
                    pace: targetPacePerKm * 0.95
                });
                break;
                
            case '10k':
                recommendations.push({
                    type: 'Tempo Runs',
                    description: '3-4 miles at threshold pace',
                    pace: targetPacePerKm * 0.95
                });
                recommendations.push({
                    type: 'Race Pace Intervals',
                    description: '4 x 1.5K at race pace with 90s recovery',
                    pace: targetPacePerKm
                });
                break;
                
            case 'half':
                recommendations.push({
                    type: 'Long Runs',
                    description: '16-20 miles with 6-8 miles at race pace',
                    pace: targetPacePerKm
                });
                recommendations.push({
                    type: 'Tempo Runs',
                    description: '5-8 miles at threshold pace',
                    pace: targetPacePerKm * 0.95
                });
                break;
                
            case 'marathon':
                recommendations.push({
                    type: 'Long Runs',
                    description: '20-22 miles with final 8-10 at race pace',
                    pace: targetPacePerKm
                });
                recommendations.push({
                    type: 'Marathon Pace Runs',
                    description: '10-16 miles at marathon pace',
                    pace: targetPacePerKm
                });
                break;
        }
        
        return recommendations;
    }

    displayResults(results) {
        const resultsContainer = document.getElementById('results');
        const defaultMessage = document.getElementById('defaultMessage');
        
        resultsContainer.innerHTML = `
            <div class="space-y-6">
                <!-- Main Goal -->
                <div class="bg-green-50 border border-green-200 rounded-lg p-6">
                    <h3 class="text-xl font-semibold text-green-900 mb-4">${results.distanceName} Goal</h3>
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <p class="text-sm text-green-700">Target Time</p>
                            <p class="text-2xl font-bold text-green-900">${this.formatTime(results.targetTime)}</p>
                        </div>
                        <div>
                            <p class="text-sm text-green-700">Target Pace</p>
                            <p class="text-xl font-semibold text-green-900">${this.formatTime(results.targetPacePerKm)}/km</p>
                            <p class="text-sm text-green-700">${this.formatTime(results.targetPacePerMile)}/mile</p>
                        </div>
                    </div>
                </div>

                <!-- Training Paces -->
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-blue-900 mb-4">Training Pace Zones</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div class="flex justify-between">
                            <span class="text-blue-700">Easy Pace:</span>
                            <span class="font-medium text-blue-900">${this.formatTime(results.paces.easy)}/km</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-blue-700">Marathon Pace:</span>
                            <span class="font-medium text-blue-900">${this.formatTime(results.paces.marathon)}/km</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-blue-700">Threshold Pace:</span>
                            <span class="font-medium text-blue-900">${this.formatTime(results.paces.threshold)}/km</span>
                        </div>
                        <div class="flex justify-between">
                            <span class="text-blue-700">Interval Pace:</span>
                            <span class="font-medium text-blue-900">${this.formatTime(results.paces.interval)}/km</span>
                        </div>
                    </div>
                </div>

                <!-- Split Times -->
                <div class="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-yellow-900 mb-4">Split Times</h3>
                    <div class="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        ${results.splits.map(split => `
                            <div class="flex justify-between">
                                <span class="text-yellow-700">${split.distance}K:</span>
                                <span class="font-medium text-yellow-900">${split.formattedTime}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Negative Split Strategy -->
                <div class="bg-purple-50 border border-purple-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-purple-900 mb-4">Negative Split Strategy</h3>
                    <div class="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p class="text-purple-700 mb-2">First Half (${results.negativeSplits.firstHalf.distance}K)</p>
                            <p class="font-medium text-purple-900">${results.negativeSplits.firstHalf.formattedTime}</p>
                            <p class="text-xs text-purple-600">${results.negativeSplits.firstHalf.formattedPace}/km pace</p>
                        </div>
                        <div>
                            <p class="text-purple-700 mb-2">Second Half (${results.negativeSplits.secondHalf.distance}K)</p>
                            <p class="font-medium text-purple-900">${results.negativeSplits.secondHalf.formattedTime}</p>
                            <p class="text-xs text-purple-600">${results.negativeSplits.secondHalf.formattedPace}/km pace</p>
                        </div>
                    </div>
                </div>

                <!-- Training Recommendations -->
                <div class="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h3 class="text-lg font-semibold text-gray-900 mb-4">Key Training Workouts</h3>
                    <div class="space-y-3">
                        ${results.recommendations.map(rec => `
                            <div class="border-l-4 border-blue-500 pl-4">
                                <h4 class="font-medium text-gray-900">${rec.type}</h4>
                                <p class="text-sm text-gray-600">${rec.description}</p>
                                <p class="text-xs text-blue-600">Target pace: ${this.formatTime(rec.pace)}/km</p>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex flex-col sm:flex-row gap-3">
                    <button onclick="racePaceCalc.saveResults()" class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-200">
                        Save Results
                    </button>
                    <button onclick="racePaceCalc.shareResults()" class="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition duration-200">
                        Share Strategy
                    </button>
                    <button onclick="window.print()" class="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition duration-200">
                        Print Results
                    </button>
                </div>
            </div>
        `;
        
        resultsContainer.classList.remove('hidden');
        defaultMessage.classList.add('hidden');
        
        // Save to localStorage
        this.saveValues();
    }

    displayError(message) {
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = `
            <div class="bg-red-50 border border-red-200 rounded-lg p-6">
                <div class="flex items-center">
                    <svg class="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd"></path>
                    </svg>
                    <p class="text-red-800">${message}</p>
                </div>
            </div>
        `;
        resultsContainer.classList.remove('hidden');
        document.getElementById('defaultMessage').classList.add('hidden');
    }

    formatTime(seconds) {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${secs.toString().padStart(2, '0')}`;
        }
    }

    saveResults() {
        const results = this.resultContainer.innerHTML;
        localStorage.setItem('racePaceResults', results);
        alert('Results saved successfully!');
    }

    shareResults() {
        const resultsText = this.generateShareText();
        if (navigator.share) {
            navigator.share({
                title: 'My Race Pace Strategy',
                text: resultsText,
                url: window.location.href
            });
        } else {
            navigator.clipboard.writeText(resultsText).then(() => {
                alert('Race strategy copied to clipboard!');
            });
        }
    }

    generateShareText() {
        // Generate a text summary of the results for sharing
        return `Check out my race pace strategy calculated with RunBikeCalc! ${window.location.href}`;
    }
}

// Initialize the calculator when the page loads
document.addEventListener('DOMContentLoaded', function() {
    window.racePaceCalc = new RacePaceCalculator();
});