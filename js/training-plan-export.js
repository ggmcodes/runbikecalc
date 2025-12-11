/**
 * Training Plan Export Functionality
 * Handles ICS (calendar), PDF, and CSV exports
 */

const TrainingPlanExporter = {
    /**
     * Export plan to ICS (iCalendar) format
     * @param {Object} plan - The generated training plan
     * @param {string} preferredTime - Preferred workout time (HH:MM)
     */
    exportICS: function(plan, preferredTime = '06:00') {
        if (!plan || !plan.weeks) {
            console.error('No plan data available for export');
            return;
        }

        const events = this.generateICSEvents(plan, preferredTime);
        const icsContent = this.buildICSContent(events, plan);

        // Download the file
        this.downloadFile(icsContent, this.getFilename(plan, 'ics'), 'text/calendar;charset=utf-8');

        this.showToast('Calendar file downloaded! Import to your calendar app.');
    },

    /**
     * Generate ICS events from plan
     */
    generateICSEvents: function(plan, preferredTime) {
        const events = [];
        const startDate = this.calculateStartDate(plan);
        const [hours, minutes] = preferredTime.split(':').map(Number);

        plan.weeks.forEach((week, weekIndex) => {
            if (week.days) {
                week.days.forEach((day, dayIndex) => {
                    // Skip rest days
                    if (day.workout && day.workout.type !== 'REST' && day.workout.name !== 'Rest Day') {
                        const eventDate = this.addDays(startDate, (weekIndex * 7) + dayIndex);

                        // Calculate duration for end time
                        const durationHours = this.parseDuration(day.workout.duration);
                        const endHours = hours + Math.floor(durationHours);
                        const endMinutes = minutes + Math.round((durationHours % 1) * 60);

                        events.push({
                            uid: this.generateUID(weekIndex, dayIndex),
                            dtstart: this.formatICSDate(eventDate, hours, minutes),
                            dtend: this.formatICSDate(eventDate, endHours, endMinutes),
                            summary: this.escapeICS(day.workout.name),
                            description: this.buildEventDescription(day.workout, week),
                            categories: plan.inputs.sport || 'TRAINING'
                        });
                    }
                });
            }
        });

        return events;
    },

    /**
     * Build ICS file content
     */
    buildICSContent: function(events, plan) {
        const lines = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//RunBikeCalc//Training Plan Generator//EN',
            'CALSCALE:GREGORIAN',
            'METHOD:PUBLISH',
            'X-WR-CALNAME:' + this.escapeICS(this.getPlanName(plan))
        ];

        events.forEach(event => {
            lines.push('BEGIN:VEVENT');
            lines.push('UID:' + event.uid);
            lines.push('DTSTAMP:' + this.formatICSTimestamp(new Date()));
            lines.push('DTSTART:' + event.dtstart);
            lines.push('DTEND:' + event.dtend);
            lines.push('SUMMARY:' + event.summary);
            lines.push('DESCRIPTION:' + event.description);
            lines.push('CATEGORIES:' + event.categories);
            lines.push('END:VEVENT');
        });

        lines.push('END:VCALENDAR');

        return lines.join('\r\n');
    },

    /**
     * Build event description
     */
    buildEventDescription: function(workout, week) {
        const lines = [];

        // Workout details
        if (workout.duration) {
            lines.push('Duration: ' + workout.duration);
        }
        if (workout.miles) {
            lines.push('Distance: ' + workout.miles + ' miles');
        }

        // Intensity with user-friendly label
        if (workout.rpe) {
            const rpeLabels = {
                '2-3': 'Very Easy',
                '3': 'Very Easy',
                '3-4': 'Easy (conversation pace)',
                '4': 'Easy',
                '4-5': 'Easy to Moderate',
                '5': 'Moderate',
                '5-6': 'Moderate',
                '6': 'Moderate-Hard',
                '6-7': 'Tempo (comfortably hard)',
                '7': 'Hard',
                '7-8': 'Hard',
                '8': 'Very Hard',
                '8-9': 'Very Hard (race effort)',
                '9': 'Near Max',
                '9-10': 'All Out'
            };
            const label = rpeLabels[workout.rpe] || '';
            lines.push('Effort: ' + workout.rpe + '/10' + (label ? ' - ' + label : ''));
        }

        // Purpose/focus
        if (workout.purpose) {
            lines.push('');
            lines.push('Focus: ' + workout.purpose);
        }

        // Notes
        if (workout.note) {
            lines.push('');
            lines.push('Notes: ' + workout.note);
        }

        // Phase info
        lines.push('');
        lines.push('Phase: ' + (week.phaseLabel || week.phase));
        if (week.isRecovery) {
            lines.push('(Recovery Week - reduced volume)');
        }

        // Footer
        lines.push('');
        lines.push('---');
        lines.push('RunBikeCalc.com');

        return this.escapeICS(lines.join('\n'));
    },

    /**
     * Export plan to PDF
     * @param {Object} plan - The generated training plan
     */
    exportPDF: async function(plan) {
        if (!plan || !plan.weeks) {
            console.error('No plan data available for export');
            return;
        }

        // Check if jsPDF is loaded
        if (typeof window.jspdf === 'undefined') {
            this.showToast('PDF library loading... please try again.');
            return;
        }

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Title page
            this.addPDFTitlePage(doc, plan);

            // Phase overview
            doc.addPage();
            this.addPDFPhaseOverview(doc, plan);

            // Week-by-week details
            plan.weeks.forEach((week, index) => {
                doc.addPage();
                this.addPDFWeekPage(doc, week, plan, index);
            });

            // Add footer to all pages
            this.addPDFFooters(doc);

            // Download
            doc.save(this.getFilename(plan, 'pdf'));

            this.showToast('PDF downloaded successfully!');
        } catch (error) {
            console.error('PDF export error:', error);
            this.showToast('Error generating PDF. Please try again.');
        }
    },

    /**
     * Add title page to PDF
     */
    addPDFTitlePage: function(doc, plan) {
        const distanceName = plan.distanceConfig?.name || plan.inputs.goalDistance;

        // Title
        doc.setFontSize(28);
        doc.setTextColor(37, 99, 235);
        doc.text('Training Plan', 105, 50, { align: 'center' });

        // Distance
        doc.setFontSize(22);
        doc.setTextColor(0, 0, 0);
        doc.text(distanceName, 105, 70, { align: 'center' });

        // Fitness level
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        const level = plan.inputs.fitnessLevel ?
            plan.inputs.fitnessLevel.charAt(0).toUpperCase() + plan.inputs.fitnessLevel.slice(1) :
            '';
        doc.text(level + ' Level', 105, 85, { align: 'center' });

        // Summary box
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(30, 110, 150, 80, 5, 5, 'F');

        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Plan Summary', 105, 125, { align: 'center' });

        doc.setFontSize(11);
        const summaryLines = [
            'Total Weeks: ' + plan.summary.totalWeeks,
            'Peak Weekly Volume: ' + plan.summary.peakVolume + ' mi',
            'Recovery Weeks: ' + plan.summary.recoveryWeeks,
            'Training Days/Week: ' + (plan.inputs.trainingDays || 5)
        ];

        let y = 140;
        summaryLines.forEach(line => {
            doc.text(line, 105, y, { align: 'center' });
            y += 12;
        });

        // Generated date
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text('Generated: ' + new Date().toLocaleDateString(), 105, 220, { align: 'center' });
    },

    /**
     * Add phase overview page to PDF
     */
    addPDFPhaseOverview: function(doc, plan) {
        doc.setFontSize(18);
        doc.setTextColor(0, 0, 0);
        doc.text('Training Phases', 20, 25);

        const phaseData = plan.phases.map(phase => [
            phase.label || phase.name,
            phase.duration + ' weeks',
            phase.description || ''
        ]);

        doc.autoTable({
            head: [['Phase', 'Duration', 'Focus']],
            body: phaseData,
            startY: 35,
            styles: { fontSize: 10 },
            headStyles: { fillColor: [37, 99, 235] },
            columnStyles: {
                0: { cellWidth: 40 },
                1: { cellWidth: 30 },
                2: { cellWidth: 100 }
            }
        });

        // Intensity guide
        const guideY = doc.lastAutoTable.finalY + 20;
        doc.setFontSize(14);
        doc.text('Intensity Guide (RPE Scale)', 20, guideY);

        const rpeData = [
            ['RPE 3-4', 'Easy', 'Conversational pace'],
            ['RPE 5', 'Moderate', 'Slightly harder, sustainable'],
            ['RPE 6-7', 'Tempo', 'Comfortably hard'],
            ['RPE 8-9', 'Hard', 'Limited conversation']
        ];

        doc.autoTable({
            head: [['RPE', 'Effort', 'Description']],
            body: rpeData,
            startY: guideY + 8,
            styles: { fontSize: 9 },
            headStyles: { fillColor: [16, 185, 129] }
        });
    },

    /**
     * Add week page to PDF
     */
    addPDFWeekPage: function(doc, week, plan, index) {
        // Header
        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);

        let title = 'Week ' + week.weekNumber + ': ' + (week.phaseLabel || week.phase);
        if (week.isRecovery) {
            title += ' (Recovery)';
        }
        doc.text(title, 20, 25);

        // Volume
        doc.setFontSize(11);
        doc.setTextColor(100, 100, 100);
        doc.text('Target Volume: ' + week.targetVolume + ' mi', 20, 35);

        // Days table
        if (week.days) {
            const tableData = week.days.map(day => [
                day.dayName || day.dayShort,
                day.workout?.name || 'Rest',
                day.workout?.duration || '-',
                day.workout?.rpe ? 'RPE ' + day.workout.rpe : '-',
                day.workout?.purpose || '-'
            ]);

            doc.autoTable({
                head: [['Day', 'Workout', 'Duration', 'Intensity', 'Purpose']],
                body: tableData,
                startY: 45,
                styles: { fontSize: 9 },
                headStyles: { fillColor: [37, 99, 235] },
                columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 35 },
                    2: { cellWidth: 25 },
                    3: { cellWidth: 25 },
                    4: { cellWidth: 65 }
                }
            });
        }
    },

    /**
     * Add footers to all PDF pages
     */
    addPDFFooters: function(doc) {
        const pageCount = doc.internal.getNumberOfPages();

        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text('Generated by RunBikeCalc.com', 105, 290, { align: 'center' });
            doc.text('Page ' + i + ' of ' + pageCount, 190, 290, { align: 'right' });
        }
    },

    /**
     * Export plan to CSV
     * @param {Object} plan - The generated training plan
     */
    exportCSV: function(plan) {
        if (!plan || !plan.weeks) {
            console.error('No plan data available for export');
            return;
        }

        const rows = [];

        // Header row
        rows.push(['Date', 'Day', 'Week', 'Phase', 'Workout', 'Duration', 'Distance (mi)', 'RPE', 'Purpose', 'Notes']);

        const startDate = this.calculateStartDate(plan);

        plan.weeks.forEach((week, weekIndex) => {
            if (week.days) {
                week.days.forEach((day, dayIndex) => {
                    const eventDate = this.addDays(startDate, (weekIndex * 7) + dayIndex);

                    rows.push([
                        this.formatDateForCSV(eventDate),
                        day.dayName || day.dayShort || '',
                        week.weekNumber,
                        week.phaseLabel || week.phase,
                        day.workout?.name || 'Rest',
                        day.workout?.duration || '',
                        day.workout?.miles || '',
                        day.workout?.rpe || '',
                        day.workout?.purpose || '',
                        day.workout?.note || ''
                    ]);
                });
            }
        });

        // Convert to CSV string
        const csvContent = rows.map(row =>
            row.map(cell => {
                // Escape cells containing commas or quotes
                const str = String(cell);
                if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                    return '"' + str.replace(/"/g, '""') + '"';
                }
                return str;
            }).join(',')
        ).join('\n');

        // Add BOM for Excel compatibility
        const bom = '\uFEFF';
        this.downloadFile(bom + csvContent, this.getFilename(plan, 'csv'), 'text/csv;charset=utf-8');

        this.showToast('CSV file downloaded! Open in Excel or Google Sheets.');
    },

    // ==================== Helper Functions ====================

    /**
     * Calculate plan start date (today if no race date)
     */
    calculateStartDate: function(plan) {
        if (plan.inputs.raceDate) {
            const raceDate = new Date(plan.inputs.raceDate);
            const weeksBack = plan.weeks.length * 7;
            return this.addDays(raceDate, -weeksBack);
        }
        return new Date();
    },

    /**
     * Add days to a date
     */
    addDays: function(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    /**
     * Parse duration string to hours (e.g., "1h 12m" -> 1.2, "45 min" -> 0.75)
     */
    parseDuration: function(duration) {
        if (!duration) return 1; // Default 1 hour

        let hours = 0;
        let minutes = 0;

        // Match hours (e.g., "1h", "2 hours", "1.5h")
        const hourMatch = duration.match(/(\d+(?:\.\d+)?)\s*h/i);
        if (hourMatch) {
            hours = parseFloat(hourMatch[1]);
        }

        // Match minutes (e.g., "30m", "45 min", "30 minutes")
        const minMatch = duration.match(/(\d+)\s*m/i);
        if (minMatch) {
            minutes = parseInt(minMatch[1]);
        }

        // If just a number, assume minutes if < 10, hours otherwise
        if (!hourMatch && !minMatch) {
            const numMatch = duration.match(/(\d+(?:\.\d+)?)/);
            if (numMatch) {
                const num = parseFloat(numMatch[1]);
                if (num < 10) {
                    hours = num;
                } else {
                    minutes = num;
                }
            }
        }

        return hours + (minutes / 60) || 1;
    },

    /**
     * Generate unique ID for ICS event
     */
    generateUID: function(weekIndex, dayIndex) {
        const timestamp = Date.now();
        return timestamp + '-w' + weekIndex + '-d' + dayIndex + '@runbikecalc.com';
    },

    /**
     * Format date for ICS (YYYYMMDDTHHMMSS)
     */
    formatICSDate: function(date, hours = 6, minutes = 0) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const h = String(hours).padStart(2, '0');
        const m = String(minutes).padStart(2, '0');

        return year + month + day + 'T' + h + m + '00';
    },

    /**
     * Format timestamp for ICS
     */
    formatICSTimestamp: function(date) {
        return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    },

    /**
     * Format date for CSV
     */
    formatDateForCSV: function(date) {
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    },

    /**
     * Escape special characters for ICS
     */
    escapeICS: function(text) {
        if (!text) return '';
        return text
            .replace(/\\/g, '\\\\')
            .replace(/;/g, '\\;')
            .replace(/,/g, '\\,')
            .replace(/\n/g, '\\n');
    },

    /**
     * Get plan name for display
     */
    getPlanName: function(plan) {
        const distance = plan.distanceConfig?.name || plan.inputs.goalDistance || 'Training';
        return distance + ' Training Plan';
    },

    /**
     * Get filename for export
     */
    getFilename: function(plan, extension) {
        const distance = (plan.inputs.goalDistance || 'training').toLowerCase().replace(/\s+/g, '-');
        const date = new Date().toISOString().split('T')[0];
        return 'runbikecalc-' + distance + '-plan-' + date + '.' + extension;
    },

    /**
     * Download file
     */
    downloadFile: function(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        document.body.appendChild(link);
        link.click();

        // Cleanup
        setTimeout(() => {
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }, 100);
    },

    /**
     * Show toast notification
     */
    showToast: function(message) {
        const existingToast = document.getElementById('export-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.id = 'export-toast';
        toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'w-5 h-5 text-green-400');
        svg.setAttribute('fill', 'none');
        svg.setAttribute('stroke', 'currentColor');
        svg.setAttribute('viewBox', '0 0 24 24');

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.setAttribute('stroke-width', '2');
        path.setAttribute('d', 'M5 13l4 4L19 7');
        svg.appendChild(path);

        const span = document.createElement('span');
        span.textContent = message;

        toast.appendChild(svg);
        toast.appendChild(span);
        document.body.appendChild(toast);

        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.2s ease-in-out';
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 200);
        }, 4000);
    }
};

// Export for use
window.TrainingPlanExporter = TrainingPlanExporter;
