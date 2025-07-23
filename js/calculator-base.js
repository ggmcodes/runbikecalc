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
    }
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

// Export for use in other files
window.Calculator = Calculator;
window.CalcUtils = CalcUtils;