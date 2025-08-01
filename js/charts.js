// Chart.js configuration for calculator results
// Lightweight, responsive charts that enhance user experience

class CalculatorCharts {
    constructor() {
        this.chartColors = {
            primary: '#2563eb',
            secondary: '#10b981',
            accent: '#f59e0b',
            danger: '#ef4444',
            gray: '#6b7280'
        };
    }

    // Create a pace distribution chart for running calculators
    createPaceChart(canvasId, paceData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: paceData.labels,
                datasets: [{
                    label: 'Pace Over Distance',
                    data: paceData.values,
                    backgroundColor: this.chartColors.primary + '20',
                    borderColor: this.chartColors.primary,
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Pace: ' + context.parsed.y + ' min/mile';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Pace (min/mile)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Distance'
                        }
                    }
                }
            }
        });
    }

    // Create heart rate zones chart
    createZonesChart(canvasId, zonesData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'],
                datasets: [{
                    label: 'Heart Rate Range',
                    data: zonesData,
                    backgroundColor: [
                        this.chartColors.gray,
                        this.chartColors.primary,
                        this.chartColors.secondary,
                        this.chartColors.accent,
                        this.chartColors.danger
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + ' bpm';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Heart Rate (bpm)'
                        }
                    }
                }
            }
        });
    }

    // Create training load chart (TSS/CTL/ATL)
    createTrainingLoadChart(canvasId, loadData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: loadData.dates,
                datasets: [
                    {
                        label: 'Fitness (CTL)',
                        data: loadData.ctl,
                        borderColor: this.chartColors.primary,
                        backgroundColor: this.chartColors.primary + '10',
                        borderWidth: 2,
                        fill: false
                    },
                    {
                        label: 'Fatigue (ATL)',
                        data: loadData.atl,
                        borderColor: this.chartColors.danger,
                        backgroundColor: this.chartColors.danger + '10',
                        borderWidth: 2,
                        fill: false
                    },
                    {
                        label: 'Form (TSB)',
                        data: loadData.tsb,
                        borderColor: this.chartColors.secondary,
                        backgroundColor: this.chartColors.secondary + '10',
                        borderWidth: 2,
                        fill: false
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
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

    // Create power zones chart for cycling
    createPowerZonesChart(canvasId, powerData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Recovery', 'Endurance', 'Tempo', 'Threshold', 'VO2 Max', 'Anaerobic'],
                datasets: [{
                    data: powerData,
                    backgroundColor: [
                        '#e5e7eb',
                        '#93c5fd',
                        '#60a5fa',
                        '#3b82f6',
                        '#2563eb',
                        '#1e40af'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + ' watts';
                            }
                        }
                    }
                }
            }
        });
    }

    // Create progress chart for goal tracking
    createProgressChart(canvasId, progressData) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return;

        return new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Speed', 'Endurance', 'Strength', 'Recovery', 'Consistency'],
                datasets: [{
                    label: 'Current',
                    data: progressData.current,
                    backgroundColor: this.chartColors.primary + '30',
                    borderColor: this.chartColors.primary,
                    borderWidth: 2
                }, {
                    label: 'Goal',
                    data: progressData.goal,
                    backgroundColor: this.chartColors.secondary + '20',
                    borderColor: this.chartColors.secondary,
                    borderWidth: 2,
                    borderDash: [5, 5]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }
}

// Export for use in calculators
window.CalculatorCharts = CalculatorCharts;