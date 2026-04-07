(function() {
  'use strict';

  var WIDGET_ID = 'rbc-zone-widget-' + Math.random().toString(36).substr(2, 9);

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
    '.rbc-wrap { max-width: 420px; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; background: #fff; box-sizing: border-box; color: #1a202c; }',
    '.rbc-title { font-size: 16px; font-weight: 700; margin: 0 0 14px; color: #1a202c; }',
    '.rbc-row { display: flex; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }',
    '.rbc-field { flex: 1; min-width: 0; }',
    '.rbc-label { display: block; font-size: 12px; font-weight: 600; color: #4a5568; margin-bottom: 4px; }',
    '.rbc-hint { font-size: 11px; color: #718096; margin-top: 2px; }',
    '.rbc-input { width: 100%; padding: 8px 10px; border: 1px solid #cbd5e0; border-radius: 6px; font-size: 14px; box-sizing: border-box; outline: none; transition: border-color 0.15s; }',
    '.rbc-input:focus { border-color: #38a169; box-shadow: 0 0 0 2px rgba(56,161,105,0.15); }',
    '.rbc-btn { width: 100%; padding: 10px; background: #38a169; color: #fff; border: none; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.15s; margin-top: 4px; }',
    '.rbc-btn:hover { background: #2f855a; }',
    '.rbc-zones { margin-top: 14px; display: none; }',
    '.rbc-zones.show { display: block; }',
    '.rbc-zone { display: flex; align-items: center; border-radius: 6px; margin-bottom: 6px; overflow: hidden; font-size: 13px; }',
    '.rbc-zone-color { width: 6px; min-height: 38px; flex-shrink: 0; }',
    '.rbc-zone-info { flex: 1; padding: 8px 10px; background: #f7fafc; display: flex; justify-content: space-between; align-items: center; }',
    '.rbc-zone-name { font-weight: 600; color: #2d3748; }',
    '.rbc-zone-range { font-weight: 700; color: #1a202c; }',
    '.rbc-zone-desc { font-size: 11px; color: #718096; }',
    '.rbc-powered { text-align: center; margin-top: 12px; font-size: 11px; }',
    '.rbc-powered a { color: #38a169; text-decoration: none; font-weight: 500; }',
    '.rbc-powered a:hover { text-decoration: underline; }',
    '.rbc-error { color: #e53e3e; font-size: 12px; margin-top: 6px; display: none; }',
    '.rbc-error.show { display: block; }',
    '.rbc-mhr-note { font-size: 12px; color: #718096; margin-top: 8px; padding: 8px; background: #f7fafc; border-radius: 6px; display: none; }',
    '.rbc-mhr-note.show { display: block; }'
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

  var zoneColors = ['#4299e1', '#48bb78', '#ecc94b', '#ed8936', '#f56565'];
  var zoneNames = ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4', 'Zone 5'];
  var zoneDescs = ['Recovery', 'Aerobic / Fat Burn', 'Tempo', 'Threshold', 'VO2 Max'];

  var optionalSpan = el('span', { style: 'font-weight:400;color:#718096' }, ['(optional)']);
  var rhrLabel = el('label', { className: 'rbc-label' }, ['Resting HR ']);
  rhrLabel.appendChild(optionalSpan);

  var wrap = el('div', { className: 'rbc-wrap' }, [
    el('div', { className: 'rbc-title', textContent: 'Heart Rate Zone Calculator' }),
    el('div', { className: 'rbc-row' }, [
      el('div', { className: 'rbc-field' }, [
        el('label', { className: 'rbc-label', textContent: 'Age' }),
        el('input', { type: 'number', className: 'rbc-input', id: 'rbc-age', placeholder: 'e.g. 35', min: '10', max: '100' })
      ]),
      el('div', { className: 'rbc-field' }, [
        rhrLabel,
        el('input', { type: 'number', className: 'rbc-input', id: 'rbc-rhr', placeholder: 'e.g. 60', min: '30', max: '120' }),
        el('div', { className: 'rbc-hint', textContent: 'Uses Karvonen method if provided' })
      ])
    ]),
    el('button', { className: 'rbc-btn', id: 'rbc-calc', textContent: 'Calculate Zones' }),
    el('div', { className: 'rbc-error', id: 'rbc-err', textContent: 'Please enter a valid age (10-100).' }),
    el('div', { className: 'rbc-mhr-note', id: 'rbc-mhr-note' })
  ]);

  var zonesDiv = el('div', { className: 'rbc-zones', id: 'rbc-zones' });
  for (var i = 0; i < 5; i++) {
    zonesDiv.appendChild(
      el('div', { className: 'rbc-zone', id: 'rbc-z' + (i + 1) }, [
        el('div', { className: 'rbc-zone-color', style: 'background:' + zoneColors[i] }),
        el('div', { className: 'rbc-zone-info' }, [
          el('div', {}, [
            el('div', { className: 'rbc-zone-name', textContent: zoneNames[i] }),
            el('div', { className: 'rbc-zone-desc', textContent: zoneDescs[i] })
          ]),
          el('div', { className: 'rbc-zone-range', id: 'rbc-z' + (i + 1) + '-range', textContent: '--' })
        ])
      ])
    );
  }
  wrap.appendChild(zonesDiv);

  var poweredLink = el('a', { href: 'https://runbikecalc.com/heart-rate-zone-calculator', target: '_blank', rel: 'noopener', textContent: 'RunBikeCalc' });
  var poweredDiv = el('div', { className: 'rbc-powered' }, ['Powered by ', poweredLink]);
  wrap.appendChild(poweredDiv);

  shadow.appendChild(wrap);

  function $(id) { return shadow.getElementById(id); }

  // Zone definitions: [lowPct, highPct]
  var ZONES_PCT = [
    [0.50, 0.60],
    [0.60, 0.70],
    [0.70, 0.80],
    [0.80, 0.90],
    [0.90, 1.00]
  ];

  $('rbc-calc').addEventListener('click', function() {
    var age = parseInt($('rbc-age').value, 10);
    var rhr = parseInt($('rbc-rhr').value, 10);
    var useKarvonen = !isNaN(rhr) && rhr > 0;

    if (isNaN(age) || age < 10 || age > 100) {
      $('rbc-err').classList.add('show');
      $('rbc-zones').classList.remove('show');
      $('rbc-mhr-note').classList.remove('show');
      return;
    }
    $('rbc-err').classList.remove('show');

    var mhr = 220 - age;

    var noteEl = $('rbc-mhr-note');
    if (useKarvonen) {
      noteEl.textContent = 'Max HR: ' + mhr + ' bpm | Resting HR: ' + rhr + ' bpm | Using Karvonen (HRR) method';
    } else {
      noteEl.textContent = 'Estimated Max HR: ' + mhr + ' bpm (220 - age) | Using % of Max HR method';
    }
    noteEl.classList.add('show');

    for (var j = 0; j < 5; j++) {
      var low, high;
      if (useKarvonen) {
        var hrr = mhr - rhr;
        low = Math.round(hrr * ZONES_PCT[j][0] + rhr);
        high = Math.round(hrr * ZONES_PCT[j][1] + rhr);
      } else {
        low = Math.round(mhr * ZONES_PCT[j][0]);
        high = Math.round(mhr * ZONES_PCT[j][1]);
      }
      $('rbc-z' + (j + 1) + '-range').textContent = low + ' - ' + high + ' bpm';
    }

    $('rbc-zones').classList.add('show');
  });
})();
