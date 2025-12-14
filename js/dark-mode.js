/**
 * Dark Mode Toggle Script
 * Handles dark mode toggle functionality with localStorage persistence
 * and system preference detection
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'theme-preference';
    const DARK_CLASS = 'dark';

    /**
     * Get the initial theme preference
     * Priority: localStorage > system preference > light (default)
     */
    function getInitialTheme() {
        // Check localStorage first
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            return stored;
        }

        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }

        return 'light';
    }

    /**
     * Apply theme to the document
     */
    function applyTheme(theme) {
        const html = document.documentElement;

        if (theme === 'dark') {
            html.classList.add(DARK_CLASS);
        } else {
            html.classList.remove(DARK_CLASS);
        }

        // Update toggle button icons
        updateToggleButton(theme);
    }

    /**
     * Update the toggle button appearance
     */
    function updateToggleButton(theme) {
        const sunIcon = document.getElementById('sun-icon');
        const moonIcon = document.getElementById('moon-icon');

        if (!sunIcon || !moonIcon) return;

        if (theme === 'dark') {
            sunIcon.classList.remove('hidden');
            moonIcon.classList.add('hidden');
        } else {
            sunIcon.classList.add('hidden');
            moonIcon.classList.remove('hidden');
        }
    }

    /**
     * Toggle between light and dark mode
     */
    function toggleTheme() {
        const html = document.documentElement;
        const currentTheme = html.classList.contains(DARK_CLASS) ? 'dark' : 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        applyTheme(newTheme);
        localStorage.setItem(STORAGE_KEY, newTheme);
    }

    /**
     * Initialize dark mode on page load
     */
    function init() {
        // Apply theme immediately to avoid flash
        const initialTheme = getInitialTheme();
        applyTheme(initialTheme);

        // Set up toggle button listener when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupToggleButton);
        } else {
            setupToggleButton();
        }

        // Listen for system theme changes
        if (window.matchMedia) {
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                // Only auto-update if user hasn't set a preference
                if (!localStorage.getItem(STORAGE_KEY)) {
                    applyTheme(e.matches ? 'dark' : 'light');
                }
            });
        }
    }

    /**
     * Set up the toggle button click handler
     */
    function setupToggleButton() {
        const toggleButton = document.getElementById('dark-mode-toggle');
        if (toggleButton) {
            toggleButton.addEventListener('click', toggleTheme);
        }
    }

    // Initialize immediately
    init();

    // Expose toggle function globally for potential external use
    window.toggleDarkMode = toggleTheme;
})();
