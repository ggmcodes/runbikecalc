(function() {
  'use strict';

  var WIDGET_ID = 'rbc-pace-widget-' + Math.random().toString(36).substr(2, 9);

  var container = document.createElement('div');
  container.id = WIDGET_ID;

  var currentScript = document.currentScript;
  if (currentScript && currentScript.parentNode) {
    currentScript.parentNode.insertBefore(container, currentScript.nextSibling);
  } else {
    document.body.appendChild(container);
  }

  var shadow = container.attachShadow({ mode: 'open' });

  var style = document.createElement('style');
  style.textContent = [
    ':host { display: block; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }',
    '.rbc-wrap { max-width: 400px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; background: #fff; box-sizing: border-box; color: #1a202c; }',
    '.rbc-title { font-size: 16px; font-weight: 700; margin: 0 0 14px; color: #1a202c; }',
    '.rbc-row { display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }',
    '.rbc-field { flex: 1; min-width: 0; }',
    '.rbc-label { display: block; font-size: 12px; font-weight: 600; color: #4a5568; margin-bottom: 4px; }',
    '.rbc-input { width: 100%; padding: 8px 10px; border: 1px solid #cbd5e0; border-radius: 6px; font-size: 14px; box-sizing: border-box; outline: none; transition: border-color 0.15s; }',
    '.rbc-input:focus { border-color: #3182ce; box-shadow: 0 0 0 2px rgba(49,130,206,0.15); }',
    '.rbc-select { width: 100%; padding: 8px 10px; border: 1px solid #cbd5e0; border-radius: 6px; font-size: 14px; box-sizing: border-box; background: #fff; outline: none; }',
    '.rbc-btn { width: 100%; padding: 10px; background: #3182ce; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.15s; margin-top: 4px; }',
    '.rbc-btn:hover { background: #2b6cb0; }',
    '.rbc-results { margin-top: 14px; padding: 12px; background: #f7fafc; border-radius: 8px; display: none; }',
    '.rbc-results.show { display: block; }',
    '.rbc-result-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 14px; }',
    '.rbc-result-label { color: #4a5568; }',
    '.rbc-result-value { font-weight: 700; color: #1a202c; }',
    '.rbc-powered { text-align: center; margin-top: 12px; font-size: 11px; }',
    '.rbc-powered a { color: #3182ce; text-decoration: none; font-weight: 500; }',
    '.rbc-powered a:hover { text-decoration: underline; }',
    '.rbc-error { color: #e53e3e; font-size: 12px; margin-top: 6px; display: none; }',
    '.rbc-error.show { display: block; }'
  ].join('\n');

  shadow.appendChild(style);

  // Build DOM using safe methods (no innerHTML)
  function el(tag, attrs, children) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function(k) {
        if (k === 'textContent') { e.textContent = attrs[k]; }
        else if (k === 'className') { e.className = attrs[k]; }
        else { e.setAttribute(k, attrs[k]); }
      });
    }
    if (children) {
      children.forEach(function(c) {
        if (typeof c === 'string') { e.appendChild(document.createTextNode(c)); }
        else if (c) { e.appendChild(c); }
      });
    }
    return e;
  }

  function resultRow(label, valueId) {
    return el('div', { className: 'rbc-result-row' }, [
      el('span', { className: 'rbc-result-label', textContent: label }),
      el('span', { className: 'rbc-result-value', id: valueId, textContent: '--' })
    ]);
  }

  var milesOpt = el('option', { value: 'mi', textContent: 'miles' });
  var kmOpt = el('option', { value: 'km', textContent: 'km' });
  var unitSelect = el('select', { className: 'rbc-select', id: 'rbc-unit' });
  unitSelect.appendChild(milesOpt);
  unitSelect.appendChild(kmOpt);

  var poweredLink = el('a', { href: 'https://runbikecalc.com/running-pace-calculator', target: '_blank', rel: 'noopener', textContent: 'RunBikeCalc' });

  var wrap = el('div', { className: 'rbc-wrap' }, [
    el('div', { className: 'rbc-title', textContent: 'Pace Calculator' }),
    el('div', { className: 'rbc-row' }, [
      el('div', { className: 'rbc-field', style: 'flex:2' }, [
        el('label', { className: 'rbc-label', textContent: 'Distance' }),
        el('input', { type: 'number', className: 'rbc-input', id: 'rbc-dist', placeholder: 'e.g. 5', min: '0', step: 'any' })
      ]),
      el('div', { className: 'rbc-field', style: 'flex:1' }, [
        el('label', { className: 'rbc-label', textContent: 'Unit' }),
        unitSelect
      ])
    ]),
    el('div', { className: 'rbc-row' }, [
      el('div', { className: 'rbc-field' }, [
        el('label', { className: 'rbc-label', textContent: 'Hours' }),
        el('input', { type: 'number', className: 'rbc-input', id: 'rbc-hr', placeholder: '0', min: '0', step: '1' })
      ]),
      el('div', { className: 'rbc-field' }, [
        el('label', { className: 'rbc-label', textContent: 'Minutes' }),
        el('input', { type: 'number', className: 'rbc-input', id: 'rbc-min', placeholder: '30', min: '0', step: '1' })
      ]),
      el('div', { className: 'rbc-field' }, [
        el('label', { className: 'rbc-label', textContent: 'Seconds' }),
        el('input', { type: 'number', className: 'rbc-input', id: 'rbc-sec', placeholder: '0', min: '0', step: '1' })
      ])
    ]),
    el('button', { className: 'rbc-btn', id: 'rbc-calc', textContent: 'Calculate Pace' }),
    el('div', { className: 'rbc-error', id: 'rbc-err', textContent: 'Please enter a valid distance and time.' }),
    el('div', { className: 'rbc-results', id: 'rbc-results' }, [
      resultRow('Pace (min/mile)', 'rbc-pace-mi'),
      resultRow('Pace (min/km)', 'rbc-pace-km'),
      resultRow('Speed (mph)', 'rbc-speed-mph'),
      resultRow('Speed (km/h)', 'rbc-speed-kmh')
    ]),
    el('div', { className: 'rbc-powered' }, ['Powered by ', poweredLink])
  ]);

  shadow.appendChild(wrap);

  function $(id) { return shadow.getElementById(id); }

  function formatPace(totalMinutes) {
    var mins = Math.floor(totalMinutes);
    var secs = Math.round((totalMinutes - mins) * 60);
    if (secs === 60) { mins++; secs = 0; }
    return mins + ':' + (secs < 10 ? '0' : '') + secs;
  }

  $('rbc-calc').addEventListener('click', function() {
    var dist = parseFloat($('rbc-dist').value);
    var unit = $('rbc-unit').value;
    var hr = parseFloat($('rbc-hr').value) || 0;
    var min = parseFloat($('rbc-min').value) || 0;
    var sec = parseFloat($('rbc-sec').value) || 0;
    var totalSeconds = hr * 3600 + min * 60 + sec;

    if (!dist || dist <= 0 || totalSeconds <= 0) {
      $('rbc-err').classList.add('show');
      $('rbc-results').classList.remove('show');
      return;
    }
    $('rbc-err').classList.remove('show');

    var distMiles = unit === 'km' ? dist / 1.60934 : dist;
    var distKm = unit === 'mi' ? dist * 1.60934 : dist;

    var paceMinPerMile = (totalSeconds / 60) / distMiles;
    var paceMinPerKm = (totalSeconds / 60) / distKm;
    var speedMph = distMiles / (totalSeconds / 3600);
    var speedKmh = distKm / (totalSeconds / 3600);

    $('rbc-pace-mi').textContent = formatPace(paceMinPerMile) + ' /mi';
    $('rbc-pace-km').textContent = formatPace(paceMinPerKm) + ' /km';
    $('rbc-speed-mph').textContent = speedMph.toFixed(2) + ' mph';
    $('rbc-speed-kmh').textContent = speedKmh.toFixed(2) + ' km/h';
    $('rbc-results').classList.add('show');
  });
})();
