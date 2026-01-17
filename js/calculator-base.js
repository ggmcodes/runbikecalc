// Base calculator functionality for all calculators
class Calculator {
  constructor(formId, resultId) {
    this.form = document.getElementById(formId);
    this.resultContainer = document.getElementById(resultId);
    this.inputs = {};
    this.init();
  }

  init() {
    if (this.form) {
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.calculate();
      });

      // Add input event listeners for real-time calculation
      const inputs = this.form.querySelectorAll('input[type="number"], input[type="text"], select');
      inputs.forEach(input => {
        input.addEventListener('input', () => {
          if (this.form.checkValidity()) {
            this.calculate();
          }
        });
      });

      // Load saved values from localStorage
      this.loadSavedValues();

      // Add keyboard hint for desktop users
      this.addKeyboardHint();
    }
  }

  addKeyboardHint() {
    // Only show on desktop (screens >= 768px)
    if (window.innerWidth < 768) return;

    const submitBtn = this.form.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    // Check if hint already exists
    if (submitBtn.parentElement.querySelector('.keyboard-hint')) return;

    // Create hint using safe DOM methods
    const hint = document.createElement('p');
    hint.className = 'keyboard-hint text-sm text-gray-500 mt-2 hidden md:block';

    const kbd = document.createElement('kbd');
    kbd.className = 'px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono';
    kbd.textContent = 'Enter';

    hint.appendChild(kbd);
    hint.appendChild(document.createTextNode(' to calculate'));

    submitBtn.insertAdjacentElement('afterend', hint);
  }

  getInputValue(name, defaultValue = 0) {
    const input = this.form.querySelector(`[name="${name}"]`);
    if (!input) return defaultValue;
    
    const value = parseFloat(input.value);
    return isNaN(value) ? defaultValue : value;
  }

  displayResult(result) {
    if (this.resultContainer) {
      this.resultContainer.innerHTML = result;
      this.resultContainer.classList.remove('hidden');
      
      // Smooth scroll to result on mobile
      if (window.innerWidth < 768) {
        this.resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      
      // Save calculation to history
      this.saveToHistory();
    }
  }
  
  saveToHistory() {
    // Get calculator name from page title or form ID
    const calculatorName = document.title.split(' - ')[0] || this.form.id.replace('-form', '');
    
    // Get form data
    const formData = new FormData(this.form);
    const data = {};
    for (let [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    // Save using PWAManager
    if (window.PWAManager) {
      window.PWAManager.saveCalculation(calculatorName, data);
    }
  }

  displayError(message) {
    this.displayResult(`
      <div class="bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg">
        <strong>Error:</strong> ${message}
      </div>
    `);
  }

  formatNumber(num, decimals = 2) {
    return num.toFixed(decimals);
  }

  saveValues() {
    const formData = new FormData(this.form);
    const values = {};
    for (let [key, value] of formData.entries()) {
      values[key] = value;
    }
    localStorage.setItem(`calc_${this.form.id}`, JSON.stringify(values));
  }

  loadSavedValues() {
    const saved = localStorage.getItem(`calc_${this.form.id}`);
    if (saved) {
      try {
        const values = JSON.parse(saved);
        Object.entries(values).forEach(([key, value]) => {
          const input = this.form.querySelector(`[name="${key}"]`);
          if (input) {
            input.value = value;
          }
        });
      } catch (e) {
        console.error('Error loading saved values:', e);
      }
    }
  }

  calculate() {
    // Override this method in child classes
    throw new Error('Calculate method must be implemented in child class');
  }

  // Utility method for sharing results
  shareResult(text) {
    if (navigator.share) {
      navigator.share({
        title: 'Calculator Result - RunBikeCalc',
        text: text,
        url: window.location.href
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(text).then(() => {
        this.showToast('Result copied to clipboard!');
      });
    }
  }

  showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-6 py-3 rounded-lg shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Print-friendly result
  printResult() {
    window.print();
  }
}

// Utility functions
const CalcUtils = {
  // Convert pace (min/mi or min/km) to speed
  paceToSpeed: function(paceMinutes, paceSeconds, unit = 'mile') {
    const totalMinutes = paceMinutes + (paceSeconds / 60);
    const hoursPerUnit = totalMinutes / 60;
    return 1 / hoursPerUnit;
  },

  // Convert speed to pace
  speedToPace: function(speed, unit = 'mile') {
    const hoursPerUnit = 1 / speed;
    const totalMinutes = hoursPerUnit * 60;
    const minutes = Math.floor(totalMinutes);
    const seconds = Math.round((totalMinutes - minutes) * 60);
    return { minutes, seconds };
  },

  // Format time as MM:SS
  formatTime: function(minutes, seconds) {
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  },

  // Convert between metric and imperial
  milesToKm: function(miles) {
    return miles * 1.60934;
  },

  kmToMiles: function(km) {
    return km / 1.60934;
  },

  lbsToKg: function(lbs) {
    return lbs * 0.453592;
  },

  kgToLbs: function(kg) {
    return kg / 0.453592;
  },

  // Calculate age from birth date
  calculateAge: function(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  }
};

// PWA Support
const PWAManager = {
  init: function() {
    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
          .then(registration => {
            console.log('ServiceWorker registered:', registration.scope);
            
            // Check for updates periodically
            setInterval(() => {
              registration.update();
            }, 60000); // Check every minute
          })
          .catch(err => {
            console.log('ServiceWorker registration failed:', err);
          });
      });
    }
    
    // Add install prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;
      this.showInstallButton(deferredPrompt);
    });
    
    // Handle app installed
    window.addEventListener('appinstalled', () => {
      console.log('PWA was installed');
      this.hideInstallButton();
    });
    
    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('App is running in standalone mode');
    }
  },
  
  showInstallButton: function(deferredPrompt) {
    const installBanner = document.createElement('div');
    installBanner.id = 'install-banner';
    installBanner.className = 'fixed bottom-0 left-0 right-0 bg-primary text-white p-4 shadow-lg z-50 transform transition-transform duration-300';
    installBanner.innerHTML = `
      <div class="container mx-auto flex items-center justify-between">
        <div>
          <p class="font-semibold">Install RunBikeCalc App</p>
          <p class="text-sm opacity-90">Access calculators offline, faster loading</p>
        </div>
        <div class="flex gap-2">
          <button id="install-btn" class="bg-white text-primary px-4 py-2 rounded font-semibold hover:bg-gray-100">
            Install
          </button>
          <button id="dismiss-btn" class="text-white opacity-75 hover:opacity-100">
            Not now
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(installBanner);
    
    // Slide up animation
    setTimeout(() => {
      installBanner.style.transform = 'translateY(0)';
    }, 100);
    
    // Handle install click
    document.getElementById('install-btn').addEventListener('click', async () => {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response: ${outcome}`);
      this.hideInstallButton();
    });
    
    // Handle dismiss
    document.getElementById('dismiss-btn').addEventListener('click', () => {
      this.hideInstallButton();
      localStorage.setItem('pwa-install-dismissed', Date.now());
    });
  },
  
  hideInstallButton: function() {
    const banner = document.getElementById('install-banner');
    if (banner) {
      banner.style.transform = 'translateY(100%)';
      setTimeout(() => banner.remove(), 300);
    }
  },
  
  // Save calculator results for offline access
  saveCalculation: function(calculatorName, data) {
    const calculations = JSON.parse(localStorage.getItem('saved-calculations') || '[]');
    calculations.unshift({
      calculator: calculatorName,
      data: data,
      timestamp: Date.now()
    });
    
    // Keep only last 50 calculations
    if (calculations.length > 50) {
      calculations.length = 50;
    }
    
    localStorage.setItem('saved-calculations', JSON.stringify(calculations));
    
    // Trigger background sync if available (only works in Service Worker context)
    if (typeof self !== 'undefined' && self.registration && 'sync' in self.registration) {
      self.registration.sync.register('sync-calculator-results');
    }
  },
  
  getSavedCalculations: function() {
    return JSON.parse(localStorage.getItem('saved-calculations') || '[]');
  }
};

// Initialize PWA features
PWAManager.init();

// Export for use in other files
window.Calculator = Calculator;
window.CalcUtils = CalcUtils;
window.PWAManager = PWAManager;