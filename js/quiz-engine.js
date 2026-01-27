/**
 * QuizEngine - Shared interactive product-finder quiz engine
 * Used by spin-bike-finder, treadmill-finder, rower-finder, home-gym-finder
 *
 * NOTE: All rendered content comes from local JSON data files we control,
 * not from user input. innerHTML usage follows the same pattern as
 * calculator-base.js and other site JS modules.
 */
class QuizEngine {
  constructor(config) {
    this.questions = config.questions;
    this.dataUrl = config.dataUrl;
    this.scoreFn = config.scoreFn;
    this.renderFn = config.renderFn;
    this.quizName = config.quizName;
    this.affiliateTag = config.affiliateTag || 'runbikecalc-20';
    this.overrideFn = config.overrideFn || null;
    this.containerId = config.containerId || 'quiz-container';
    this.resultsId = config.resultsId || 'quiz-results';

    this.currentStep = 0;
    this.answers = {};
    this.products = [];
    this.accessories = [];
    this.container = null;
    this.resultsContainer = null;
  }

  async init() {
    this.container = document.getElementById(this.containerId);
    this.resultsContainer = document.getElementById(this.resultsId);
    if (!this.container) return;

    await this.loadData();
    this.renderQuestion();
    this.trackEvent('quiz_start', { quiz_name: this.quizName });
  }

  async loadData() {
    try {
      const resp = await fetch(this.dataUrl);
      const data = await resp.json();
      this.products = data.products || [];
      this.accessories = data.accessories || [];
    } catch (e) {
      console.error('Failed to load quiz data:', e);
    }
  }

  renderQuestion() {
    const q = this.questions[this.currentStep];
    const total = this.questions.length;
    const pct = ((this.currentStep) / total) * 100;

    // Build DOM safely - all text from our controlled JSON
    const wrapper = document.createElement('div');
    wrapper.className = 'quiz-slide-in';

    // Progress bar
    const progress = document.createElement('div');
    progress.className = 'quiz-progress';
    const bar = document.createElement('div');
    bar.className = 'quiz-progress-bar';
    bar.style.width = pct + '%';
    progress.appendChild(bar);
    wrapper.appendChild(progress);

    // Step label
    const stepLabel = document.createElement('div');
    stepLabel.className = 'quiz-step-label';
    stepLabel.textContent = 'Question ' + (this.currentStep + 1) + ' of ' + total;
    wrapper.appendChild(stepLabel);

    // Question
    const heading = document.createElement('h3');
    heading.className = 'quiz-question';
    heading.textContent = q.question;
    wrapper.appendChild(heading);

    if (q.subtitle) {
      const sub = document.createElement('p');
      sub.className = 'quiz-subtitle';
      sub.textContent = q.subtitle;
      wrapper.appendChild(sub);
    }

    // Options container
    const optionsDiv = document.createElement('div');
    optionsDiv.className = 'quiz-options';

    if (q.type === 'multi') {
      q.options.forEach(opt => {
        const checked = this.answers[q.id] && this.answers[q.id].includes(opt.id);
        const label = document.createElement('label');
        label.className = 'quiz-option quiz-option-multi' + (checked ? ' selected' : '');
        label.dataset.id = opt.id;

        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.value = opt.id;
        cb.style.display = 'none';
        if (checked) cb.checked = true;
        label.appendChild(cb);

        if (opt.icon) {
          const icon = document.createElement('span');
          icon.className = 'quiz-option-icon';
          icon.textContent = opt.icon;
          label.appendChild(icon);
        }
        const lbl = document.createElement('span');
        lbl.className = 'quiz-option-label';
        lbl.textContent = opt.label;
        label.appendChild(lbl);

        if (opt.desc) {
          const desc = document.createElement('span');
          desc.className = 'quiz-option-desc';
          desc.textContent = opt.desc;
          label.appendChild(desc);
        }

        const chk = document.createElement('span');
        chk.className = 'quiz-check';
        chk.textContent = checked ? '\u2713' : '';
        label.appendChild(chk);

        optionsDiv.appendChild(label);
      });
    } else {
      q.options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option' + (this.answers[q.id] === opt.id ? ' selected' : '');
        btn.dataset.id = opt.id;

        if (opt.icon) {
          const icon = document.createElement('span');
          icon.className = 'quiz-option-icon';
          icon.textContent = opt.icon;
          btn.appendChild(icon);
        }
        const lbl = document.createElement('span');
        lbl.className = 'quiz-option-label';
        lbl.textContent = opt.label;
        btn.appendChild(lbl);

        if (opt.desc) {
          const desc = document.createElement('span');
          desc.className = 'quiz-option-desc';
          desc.textContent = opt.desc;
          btn.appendChild(desc);
        }

        optionsDiv.appendChild(btn);
      });
    }
    wrapper.appendChild(optionsDiv);

    if (q.type === 'multi') {
      const continueBtn = document.createElement('button');
      continueBtn.className = 'quiz-continue-btn';
      continueBtn.id = 'quiz-continue';
      continueBtn.textContent = 'Continue';
      wrapper.appendChild(continueBtn);
    }

    if (this.currentStep > 0) {
      const backBtn = document.createElement('button');
      backBtn.className = 'quiz-back-btn';
      backBtn.id = 'quiz-back';
      backBtn.textContent = '\u2190 Back';
      wrapper.appendChild(backBtn);
    }

    this.container.textContent = '';
    this.container.appendChild(wrapper);
    this.bindEvents(q);
  }

  bindEvents(q) {
    if (q.type === 'multi') {
      this.container.querySelectorAll('.quiz-option-multi').forEach(el => {
        el.addEventListener('click', () => {
          const id = el.dataset.id;
          if (!this.answers[q.id]) this.answers[q.id] = [];
          const idx = this.answers[q.id].indexOf(id);
          if (idx > -1) {
            this.answers[q.id].splice(idx, 1);
            el.classList.remove('selected');
            el.querySelector('.quiz-check').textContent = '';
          } else {
            this.answers[q.id].push(id);
            el.classList.add('selected');
            el.querySelector('.quiz-check').textContent = '\u2713';
          }
        });
      });

      const continueBtn = document.getElementById('quiz-continue');
      if (continueBtn) {
        continueBtn.addEventListener('click', () => {
          this.trackEvent('quiz_answer', { quiz_name: this.quizName, question: q.id, answer: (this.answers[q.id] || []).join(',') });
          this.advance();
        });
      }
    } else {
      this.container.querySelectorAll('.quiz-option:not(.quiz-option-multi)').forEach(el => {
        el.addEventListener('click', () => {
          this.answers[q.id] = el.dataset.id;
          this.trackEvent('quiz_answer', { quiz_name: this.quizName, question: q.id, answer: el.dataset.id });
          this.advance();
        });
      });
    }

    const backBtn = document.getElementById('quiz-back');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        this.currentStep--;
        this.renderQuestion();
      });
    }
  }

  advance() {
    if (this.currentStep < this.questions.length - 1) {
      this.currentStep++;
      this.renderQuestion();
    } else {
      this.showAnalyzing();
    }
  }

  showAnalyzing() {
    this.container.textContent = '';
    const wrap = document.createElement('div');
    wrap.className = 'quiz-analyzing';
    const spinner = document.createElement('div');
    spinner.className = 'quiz-spinner';
    wrap.appendChild(spinner);
    const text = document.createElement('p');
    text.className = 'quiz-analyzing-text';
    text.textContent = 'Analyzing your answers...';
    wrap.appendChild(text);
    this.container.appendChild(wrap);
    setTimeout(() => this.showResults(), 1500);
  }

  showResults() {
    this.container.style.display = 'none';

    let scored = this.products.map(p => {
      let score = this.scoreFn(p, this.answers);
      return { ...p, _score: score };
    });

    if (this.overrideFn) {
      scored = this.overrideFn(scored, this.answers);
    }

    scored = scored.filter(p => p._score > 0);
    scored.sort((a, b) => b._score - a._score);

    // Tier diversity: max 2 from same tier in top 3
    const top = [];
    const tierCount = {};
    for (const p of scored) {
      const t = p.tier || 'default';
      if (!tierCount[t]) tierCount[t] = 0;
      if (tierCount[t] < 2 || top.length < 2) {
        top.push(p);
        tierCount[t]++;
        if (top.length === 3) break;
      }
    }
    while (top.length < 3 && top.length < scored.length) {
      const next = scored.find(p => !top.includes(p));
      if (next) top.push(next);
      else break;
    }

    // renderFn returns an HTML string from our controlled data
    const resultsHtml = this.renderFn(top, this.answers, this.accessories, this.affiliateTag);
    this.resultsContainer.innerHTML = resultsHtml;
    this.resultsContainer.classList.remove('hidden');
    this.resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

    this.bindResultEvents();
    this.trackEvent('quiz_complete', { quiz_name: this.quizName, top_pick: top[0] ? top[0].id : 'none' });
  }

  bindResultEvents() {
    this.resultsContainer.querySelectorAll('a[data-affiliate]').forEach(el => {
      el.addEventListener('click', () => {
        this.trackEvent('affiliate_click', {
          quiz_name: this.quizName,
          product: el.dataset.affiliate
        });
      });
    });

    const retakeBtn = this.resultsContainer.querySelector('#quiz-retake');
    if (retakeBtn) {
      retakeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.restart();
        this.trackEvent('quiz_restart', { quiz_name: this.quizName });
      });
    }
  }

  restart() {
    this.currentStep = 0;
    this.answers = {};
    this.container.style.display = '';
    this.resultsContainer.classList.add('hidden');
    this.resultsContainer.textContent = '';
    this.renderQuestion();
  }

  trackEvent(eventName, params) {
    if (typeof gtag === 'function') {
      gtag('event', eventName, params);
    }
  }
}

// Helper: build Amazon search URL with affiliate tag
function amazonSearchUrl(query, tag) {
  return 'https://www.amazon.com/s?k=' + encodeURIComponent(query) + '&tag=' + tag;
}

// Helper: render a badge (returns safe HTML string from controlled data)
function renderBadge(text, color) {
  var colors = {
    green: 'background:#dcfce7;color:#166534;border:1px solid #bbf7d0',
    copper: 'background:#fef3e2;color:#92400e;border:1px solid #fde68a',
    red: 'background:#fef2f2;color:#991b1b;border:1px solid #fecaca',
    blue: 'background:#eff6ff;color:#1e40af;border:1px solid #bfdbfe',
    gray: 'background:#f3f4f6;color:#374151;border:1px solid #d1d5db'
  };
  var style = colors[color] || colors.gray;
  // text is from our controlled JSON data
  return '<span class="quiz-badge" style="' + style + '">' + text + '</span>';
}

// Helper: render accessories section (returns HTML from controlled JSON data)
function renderAccessories(product, accessories, tag) {
  if (!product.pairsWith || product.pairsWith.length === 0) return '';
  var matched = accessories.filter(function(a) { return product.pairsWith.indexOf(a.id) > -1; });
  if (matched.length === 0) return '';

  var html = '<div class="quiz-accessories"><p class="quiz-accessories-title">Pairs well with:</p><div class="quiz-accessories-list">';
  matched.forEach(function(a) {
    html += '<a href="' + a.amazonUrl + '" target="_blank" rel="noopener noreferrer nofollow" data-affiliate="' + a.id + '" class="quiz-accessory-link">';
    if (a.imageMedium || a.imageUrl) {
      html += '<img src="' + (a.imageMedium || a.imageUrl) + '" alt="' + a.name + '" style="width:40px;height:40px;object-fit:contain;border-radius:4px;flex-shrink:0;" loading="lazy" /> ';
    }
    html += a.name + ' <span class="quiz-accessory-price">' + a.priceDisplay + '</span></a>';
  });
  html += '</div></div>';
  return html;
}

window.QuizEngine = QuizEngine;
window.amazonSearchUrl = amazonSearchUrl;
window.renderBadge = renderBadge;
window.renderAccessories = renderAccessories;
