/**
 * Email Gate Handler for Premium Exports
 * Collects email before allowing PDF/Excel downloads
 */

class EmailGateHandler {
    constructor() {
        this.storageKey = 'runbikecalc_premium_email';
        this.modal = null;
    }

    /**
     * Check if premium exports are unlocked
     * @returns {boolean}
     */
    isUnlocked() {
        return !!localStorage.getItem(this.storageKey);
    }

    /**
     * Get stored email address
     * @returns {string|null}
     */
    getStoredEmail() {
        return localStorage.getItem(this.storageKey);
    }

    /**
     * Show email collection modal
     * @param {Function} callback - Called after successful email submission
     */
    showModal(callback) {
        // Create modal backdrop
        this.modal = document.createElement('div');
        this.modal.id = 'email-gate-modal';
        this.modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';

        // Create modal content container
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 p-8';

        // Create icon container
        const iconContainer = document.createElement('div');
        iconContainer.className = 'text-center mb-6';

        const iconWrapper = document.createElement('div');
        iconWrapper.className = 'w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4';

        // Create lock icon SVG
        const lockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        lockSvg.setAttribute('class', 'w-8 h-8 text-blue-600');
        lockSvg.setAttribute('fill', 'none');
        lockSvg.setAttribute('stroke', 'currentColor');
        lockSvg.setAttribute('viewBox', '0 0 24 24');

        const lockPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        lockPath.setAttribute('stroke-linecap', 'round');
        lockPath.setAttribute('stroke-linejoin', 'round');
        lockPath.setAttribute('stroke-width', '2');
        lockPath.setAttribute('d', 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z');
        lockSvg.appendChild(lockPath);
        iconWrapper.appendChild(lockSvg);
        iconContainer.appendChild(iconWrapper);

        // Create title
        const title = document.createElement('h3');
        title.className = 'text-2xl font-bold text-gray-900 mb-2';
        title.textContent = 'Unlock Premium Exports';
        iconContainer.appendChild(title);

        // Create description
        const description = document.createElement('p');
        description.className = 'text-gray-600';
        description.textContent = 'Enter your email to unlock PDF and Excel exports. No spam, ever.';
        iconContainer.appendChild(description);

        // Create form
        const form = document.createElement('form');
        form.id = 'email-gate-form';
        form.className = 'space-y-4';

        // Create email input container
        const inputContainer = document.createElement('div');

        const emailInput = document.createElement('input');
        emailInput.type = 'email';
        emailInput.id = 'gate-email';
        emailInput.required = true;
        emailInput.className = 'w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-lg focus:border-blue-500 focus:outline-none';
        emailInput.placeholder = 'your@email.com';
        inputContainer.appendChild(emailInput);

        // Create submit button
        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.className = 'w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors';
        submitBtn.textContent = 'Unlock Premium Exports';

        form.appendChild(inputContainer);
        form.appendChild(submitBtn);

        // Create cancel button
        const cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.id = 'close-modal';
        cancelBtn.className = 'mt-4 text-gray-500 hover:text-gray-700 text-sm w-full text-center';
        cancelBtn.textContent = 'Cancel';

        // Assemble modal content
        modalContent.appendChild(iconContainer);
        modalContent.appendChild(form);
        modalContent.appendChild(cancelBtn);
        this.modal.appendChild(modalContent);

        // Add to DOM
        document.body.appendChild(this.modal);

        // Focus email input
        emailInput.focus();

        // Handle form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = emailInput.value.trim();
            if (email && this.isValidEmail(email)) {
                this.unlock(email);
                if (callback) callback();
            }
        });

        // Handle cancel
        cancelBtn.addEventListener('click', () => {
            this.closeModal();
        });

        // Handle backdrop click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Handle escape key
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.closeModal();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    /**
     * Validate email format
     * @param {string} email
     * @returns {boolean}
     */
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Unlock premium exports
     * @param {string} email
     */
    unlock(email) {
        localStorage.setItem(this.storageKey, email);
        this.closeModal();
        this.updateButtonStates();
        this.showSuccessToast();
    }

    /**
     * Close the modal
     */
    closeModal() {
        if (this.modal) {
            this.modal.remove();
            this.modal = null;
        }
    }

    /**
     * Update export button states based on unlock status
     */
    updateButtonStates() {
        const isUnlocked = this.isUnlocked();
        const gatedButtons = document.querySelectorAll('.email-gated-btn');

        gatedButtons.forEach(btn => {
            const lockIcon = btn.querySelector('.lock-icon');
            if (lockIcon) {
                // Clear existing content
                while (lockIcon.firstChild) {
                    lockIcon.removeChild(lockIcon.firstChild);
                }

                if (isUnlocked) {
                    // Show checkmark
                    const checkSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    checkSvg.setAttribute('class', 'w-5 h-5 text-green-500');
                    checkSvg.setAttribute('fill', 'none');
                    checkSvg.setAttribute('stroke', 'currentColor');
                    checkSvg.setAttribute('viewBox', '0 0 24 24');

                    const checkPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    checkPath.setAttribute('stroke-linecap', 'round');
                    checkPath.setAttribute('stroke-linejoin', 'round');
                    checkPath.setAttribute('stroke-width', '2');
                    checkPath.setAttribute('d', 'M5 13l4 4L19 7');
                    checkSvg.appendChild(checkPath);
                    lockIcon.appendChild(checkSvg);
                } else {
                    // Show lock
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
                }
            }
        });
    }

    /**
     * Show success toast after unlock
     */
    showSuccessToast() {
        const existingToast = document.getElementById('email-toast');
        if (existingToast) existingToast.remove();

        const toast = document.createElement('div');
        toast.id = 'email-toast';
        toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center gap-2';

        // Create checkmark icon
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('class', 'w-5 h-5');
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
        span.textContent = 'Premium exports unlocked!';

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

    /**
     * Gate a function behind email collection
     * @param {Function} fn - Function to execute after unlock
     */
    gateFunction(fn) {
        if (this.isUnlocked()) {
            fn();
        } else {
            this.showModal(fn);
        }
    }
}

// Export for use in other files
window.EmailGateHandler = EmailGateHandler;
