/**
 * URL Parameter Handler for Training Plan Generator
 * Enables bookmarkable and shareable training plans via URL parameters
 */

class URLParamsHandler {
    constructor() {
        // Short parameter keys for compact URLs
        this.paramMap = {
            'd': 'goalDistance',
            'r': 'raceDate',
            'w': 'weeksUntilRace',
            'f': 'fitnessLevel',
            'v': 'currentVolume',
            't': 'trainingDays',
            'l': 'longDay',
            'x': 'crossTrainDays',
            'z': 'restDays',
            's': 'sport',
            'sv': 'swimVolume',
            'bv': 'bikeVolume',
            'rv': 'runVolume',
            'p': 'poolPreference'
        };

        // Reverse map for decoding
        this.reverseMap = {};
        for (const [short, full] of Object.entries(this.paramMap)) {
            this.reverseMap[full] = short;
        }
    }

    /**
     * Encode inputs object to URL parameter string
     * @param {Object} inputs - Form inputs object
     * @returns {string} URL parameter string
     */
    encode(inputs) {
        const params = new URLSearchParams();

        for (const [full, value] of Object.entries(inputs)) {
            if (value !== undefined && value !== null && value !== '') {
                const short = this.reverseMap[full] || full;
                // Handle arrays (like rest days)
                if (Array.isArray(value)) {
                    params.set(short, value.join(','));
                } else {
                    params.set(short, value);
                }
            }
        }

        return params.toString();
    }

    /**
     * Decode URL parameters to inputs object
     * @param {URLSearchParams} urlParams - URL search params
     * @returns {Object} Decoded inputs object
     */
    decode(urlParams) {
        const inputs = {};

        for (const [short, full] of Object.entries(this.paramMap)) {
            if (urlParams.has(short)) {
                const value = urlParams.get(short);
                // Handle comma-separated values (arrays)
                if (value.includes(',')) {
                    inputs[full] = value.split(',');
                } else {
                    inputs[full] = value;
                }
            }
        }

        return inputs;
    }

    /**
     * Update browser URL without page reload
     * @param {Object} inputs - Form inputs to encode
     */
    updateURL(inputs) {
        const params = this.encode(inputs);
        const newURL = params ? `${window.location.pathname}?${params}` : window.location.pathname;
        history.pushState({ inputs }, '', newURL);
    }

    /**
     * Check if URL has parameters
     * @returns {boolean}
     */
    hasParams() {
        return window.location.search.length > 1;
    }

    /**
     * Get decoded inputs from current URL
     * @returns {Object|null} Decoded inputs or null if no params
     */
    getFromURL() {
        if (!this.hasParams()) return null;
        const params = new URLSearchParams(window.location.search);
        return this.decode(params);
    }

    /**
     * Copy current URL to clipboard with toast notification
     */
    copyLink() {
        const url = window.location.href;

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(() => {
                this.showToast('Link copied! Bookmark or share your plan.');
            }).catch(() => {
                this.fallbackCopy(url);
            });
        } else {
            this.fallbackCopy(url);
        }
    }

    /**
     * Fallback copy method for older browsers
     * @param {string} text - Text to copy
     */
    fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            this.showToast('Link copied! Bookmark or share your plan.');
        } catch (err) {
            this.showToast('Could not copy link. Please copy the URL manually.');
        }

        document.body.removeChild(textarea);
    }

    /**
     * Show toast notification using safe DOM methods
     * @param {string} message - Message to display
     */
    showToast(message) {
        // Remove existing toast if present
        const existingToast = document.getElementById('url-toast');
        if (existingToast) existingToast.remove();

        // Create toast container
        const toast = document.createElement('div');
        toast.id = 'url-toast';
        toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';

        // Create checkmark icon using SVG namespace
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

        // Create message span
        const span = document.createElement('span');
        span.textContent = message;

        // Assemble toast
        toast.appendChild(svg);
        toast.appendChild(span);
        document.body.appendChild(toast);

        // Fade in
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.2s ease-in-out';
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
        });

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 200);
        }, 3000);
    }
}

// Export for use in other files
window.URLParamsHandler = URLParamsHandler;
