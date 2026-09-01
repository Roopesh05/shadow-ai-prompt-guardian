/**
 * SENTINEL v5.0 — Popup "Mission Control"
 *
 * Features:
 *  - Live SVG gauge (AI Exposure Score)
 *  - Risk sparkline (last 20 prompts)
 *  - Real-time session metrics from background service worker
 *  - Color-coded recent blocks with category badges
 *  - Protection toggle
 */

(function () {
  'use strict';

  // ─── Global Error Suppression (Layer 1) ──────────────────────────────────────
  if (typeof window !== 'undefined') {
    window.addEventListener('unhandledrejection', (e) => {
      if (e.reason && e.reason.message && e.reason.message.includes('Extension context invalidated')) {
        e.preventDefault();
      }
    });
    window.addEventListener('error', (e) => {
      if (e.message && e.message.includes('Extension context invalidated')) {
        e.preventDefault();
      }
    });
  }

  // ─── Safe Storage Wrappers (Layer 3) ─────────────────────────────────────────
  function safeGet(keys, cb) {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
    try {
      chrome.storage.local.get(keys, function (result) {
        try { if (cb) cb(result || {}); } catch (_) {}
      });
    } catch (_) {}
  }

  function safeSet(obj, cb) {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      if (cb) { try { cb(); } catch (_) {} }
      return;
    }
    try {
      chrome.storage.local.set(obj, function () {
        try { if (cb) cb(); } catch (_) {}
      });
    } catch (_) {}
  }

  function safeRemove(keys, cb) {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      if (cb) { try { cb(); } catch (_) {} }
      return;
    }
    try {
      chrome.storage.local.remove(keys, function () {
        try { if (cb) cb(); } catch (_) {}
      });
    } catch (_) {}
  }

  // ─── Storage Keys (Unified Across content, popup, options) ───────────────────
  const STORAGE = {
    enabled:   'sapg_protectionEnabled',
    threshold: 'sapg_sensitivityThreshold',
    entropy:   'sapg_enableEntropy',
    terms:     'sapg_confidentialTerms',
    log:       'sapg_blockedAttempts',
  };

  // ─── Elements ─────────────────────────────────────────────────────────────────
  const logoEl        = document.getElementById('sentinel-logo');
  const statusDot     = document.getElementById('status-dot');
  const statusText    = document.getElementById('status-text');
  const toggleEl      = document.getElementById('toggle-protection');
  const gaugeValue    = document.getElementById('gauge-value');
  const gaugeFill     = document.getElementById('gauge-fill');
  const exposureDesc  = document.getElementById('exposure-desc');
  const statChecked   = document.getElementById('stat-checked');
  const statBlocked   = document.getElementById('stat-blocked');
  const logList       = document.getElementById('log-list');
  const sparkSvg      = document.getElementById('sparkline-svg');
  const sparkLine     = document.getElementById('spark-line');
  const sparkArea     = document.getElementById('spark-area');
  const sparkMax      = document.getElementById('sparkline-max');
  const btnClearLog   = document.getElementById('btn-clear-log');

  // ─── Gauge Helpers ────────────────────────────────────────────────────────────

  // Gauge arc: 240deg sweep, radius 28, circumference ~176
  const CIRC  = 2 * Math.PI * 28;       // 175.93
  const SWEEP = CIRC * (240 / 360);     // 117.28 (visible arc)

  function setGauge(score) {
    const clamped = Math.min(Math.max(score, 0), 100);
    const fill = (clamped / 100) * SWEEP;
    gaugeFill.setAttribute('stroke-dasharray', `${fill.toFixed(1)} ${CIRC.toFixed(1)}`);
    // Color: green → amber → red
    const color = clamped < 30 ? '#10b981' : clamped < 60 ? '#f59e0b' : '#f43f5e';
    gaugeFill.setAttribute('stroke', color);
    gaugeValue.textContent = clamped;
    gaugeValue.style.color = color;
    // Logo danger animation
    if (clamped >= 70) {
      logoEl.classList.add('danger');
      logoEl.textContent = '⚠️';
    } else {
      logoEl.classList.remove('danger');
      logoEl.textContent = '🛡️';
    }
  }

  // ─── Sparkline ────────────────────────────────────────────────────────────────

  function drawSparkline(history) {
    if (!history || history.length === 0) {
      sparkLine.setAttribute('d', '');
      sparkArea.setAttribute('d', '');
      sparkMax.textContent = '';
      return;
    }
    const W = 348, H = 32, pad = 2;
    const max = Math.max(...history, 1);
    sparkMax.textContent = `Peak: ${max}`;
    const step = (W - pad * 2) / Math.max(history.length - 1, 1);
    const pts = history.map((v, i) => {
      const x = pad + i * step;
      const y = pad + (1 - v / max) * (H - pad * 2);
      return [x, y];
    });
    const line = pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`).join(' ');
    const area = line + ` L${pts[pts.length-1][0].toFixed(1)},${H} L${pts[0][0].toFixed(1)},${H} Z`;
    sparkLine.setAttribute('d', line);
    sparkArea.setAttribute('d', area);

    // Color the line by last risk value
    const lastVal = history[history.length - 1];
    const lineColor = lastVal < 30 ? '#10b981' : lastVal < 60 ? '#f59e0b' : '#f43f5e';
    sparkLine.setAttribute('stroke', lineColor);
    const areaGrad = document.getElementById('spark-grad');
    if (areaGrad) {
      areaGrad.children[0].setAttribute('stop-color', lineColor);
    }
  }

  // ─── Category Badges ──────────────────────────────────────────────────────────

  const CAT_LABELS = {
    api_key:     '🔑 API Key',
    password:    '🔒 Cred',
    pii:         '👤 PII',
    confidential:'📋 Conf.',
    company:     '🏢 Corp',
  };

  function renderCatBadges(cats) {
    return (cats || []).map(c =>
      `<span class="cat-badge ${c}">${CAT_LABELS[c] || c}</span>`
    ).join('');
  }

  function timeAgo(isoStr) {
    try {
      const diff = Date.now() - new Date(isoStr).getTime();
      if (diff < 60000) return `${Math.round(diff / 1000)}s ago`;
      if (diff < 3600000) return `${Math.round(diff / 60000)}m ago`;
      return `${Math.round(diff / 3600000)}h ago`;
    } catch (_) { return '—'; }
  }

  // ─── Render Log ───────────────────────────────────────────────────────────────

  function renderLog(entries) {
    if (!entries || entries.length === 0) {
      logList.innerHTML = `
        <div class="no-blocks">
          <div class="no-blocks-icon">✅</div>
          <div>No blocked attempts yet</div>
        </div>`;
      return;
    }
    logList.innerHTML = entries.slice(0, 5).map(e => {
      const sev = e.severity || 'info';
      const score = e.riskScore || 0;
      return `
        <div class="block-entry">
          <span class="block-sev-dot ${sev}"></span>
          <div class="block-cats">${renderCatBadges(e.categories)}</div>
          <div class="block-meta">
            <div class="block-score ${sev}">${score}</div>
            <div class="block-time">${timeAgo(e.timestamp)}</div>
          </div>
        </div>`;
    }).join('');
  }

  // ─── Exposure Score Description ───────────────────────────────────────────────

  function exposureDescription(score, blocked) {
    if (blocked === 0) return 'No sensitive data detected this session.';
    if (score < 20)  return `${blocked} threat${blocked > 1 ? 's' : ''} blocked. Low risk profile.`;
    if (score < 50)  return `${blocked} threat${blocked > 1 ? 's' : ''} blocked. Moderate exposure risk.`;
    if (score < 80)  return `⚠️ ${blocked} threats blocked. High exposure risk this session.`;
    return `🚨 ${blocked} threats blocked. Critical exposure — review your workflow.`;
  }

  // ─── Load & Render ────────────────────────────────────────────────────────────

  async function loadSettings() {
    try {
      safeGet([STORAGE.enabled, STORAGE.log, STORAGE.threshold, STORAGE.entropy, STORAGE.terms], (result) => {
        const enabled = result[STORAGE.enabled] !== false;
        toggleEl.checked = enabled;
        statusDot.className = `status-dot ${enabled ? 'active' : 'paused'}`;
        statusText.textContent = enabled ? 'Protection Active' : 'Protection Paused';

        const log = result[STORAGE.log] || [];
        renderLog(log);
      });
    } catch (_) {}

    // Load session metrics from background service worker
    try {
      chrome.runtime.sendMessage({ type: 'SAPG_GET_METRICS' }, (response) => {
        if (chrome.runtime.lastError || !response) return;
        const m = response.metrics || {};
        const score = m.exposureScore || 0;
        const blocked = m.promptsBlocked || 0;
        const checked = m.promptsChecked || 0;

        setGauge(score);
        statChecked.textContent = checked;
        statBlocked.textContent = blocked;
        exposureDesc.textContent = exposureDescription(score, blocked);
        drawSparkline(m.riskHistory || []);
      });
    } catch (_) {
      setGauge(0);
    }
  }

  // ─── Toggle ───────────────────────────────────────────────────────────────────

  toggleEl.addEventListener('change', () => {
    const enabled = toggleEl.checked;
    safeSet({ [STORAGE.enabled]: enabled }, () => {
      statusDot.className = `status-dot ${enabled ? 'active' : 'paused'}`;
      statusText.textContent = enabled ? 'Protection Active' : 'Protection Paused';
      if (!enabled) { logoEl.classList.remove('danger'); logoEl.textContent = '🛡️'; }
    });
  });

  // ─── Clear Log ────────────────────────────────────────────────────────────────

  btnClearLog.addEventListener('click', () => {
    safeRemove([STORAGE.log, 'sapg_audit_log'], () => {
      renderLog([]);
      setGauge(0);
      drawSparkline([]);
      exposureDesc.textContent = 'Log cleared.';
      statBlocked.textContent = '0';
      statChecked.textContent = '0';
      // Reset background exposure score
      try { chrome.runtime.sendMessage({ type: 'SAPG_RESET_EXPOSURE' }); } catch (_) {}
    });
  });

  // ─── Init ─────────────────────────────────────────────────────────────────────

  loadSettings().catch(() => {});
})();

