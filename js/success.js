/**
 * Premium Success Page Handler
 * Unlocks premium features and redirects to premium training plans page
 */

(function() {
    'use strict';

    const STORAGE_KEY = 'runbikecalc_premium_unlocked';
    const REDIRECT_URL = '/premium-training-plans';
    const COUNTDOWN_SECONDS = 3;

    // Unlock premium access immediately
    function unlockPremium() {
        try {
            localStorage.setItem(STORAGE_KEY, 'true');
            localStorage.setItem('runbikecalc_premium_date', new Date().toISOString());
            console.log('Premium access unlocked successfully');
            return true;
        } catch (e) {
            console.error('Failed to save premium status:', e);
            return false;
        }
    }

    // Start countdown and redirect
    function startCountdown() {
        const countdownEl = document.getElementById('countdown');
        let seconds = COUNTDOWN_SECONDS;

        const interval = setInterval(() => {
            seconds--;
            if (countdownEl) {
                countdownEl.textContent = seconds;
            }

            if (seconds <= 0) {
                clearInterval(interval);
                window.location.href = REDIRECT_URL;
            }
        }, 1000);
    }

    // Track conversion for analytics
    function trackConversion() {
        // Google Analytics event
        if (typeof gtag === 'function') {
            gtag('event', 'purchase', {
                'event_category': 'Premium',
                'event_label': 'Training Plans Premium',
                'value': 5
            });
        }
    }

    // Show fallback message if localStorage fails
    function showFallbackMessage() {
        const countdownEl = document.getElementById('countdown');
        if (countdownEl && countdownEl.parentElement) {
            // Clear existing content safely
            while (countdownEl.parentElement.firstChild) {
                countdownEl.parentElement.removeChild(countdownEl.parentElement.firstChild);
            }
            // Add new text content
            const message = document.createElement('span');
            message.className = 'text-amber-400';
            message.textContent = 'Click the button below to continue';
            countdownEl.parentElement.appendChild(message);
        }
    }

    // Initialize on page load
    document.addEventListener('DOMContentLoaded', function() {
        // Unlock premium
        const unlocked = unlockPremium();

        if (unlocked) {
            // Track the conversion
            trackConversion();

            // Start redirect countdown
            startCountdown();
        } else {
            // If localStorage failed, show fallback message
            showFallbackMessage();
        }
    });
})();
