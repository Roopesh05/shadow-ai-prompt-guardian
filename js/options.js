/**
 * SENTINEL v5.0 — Guardian Center Options
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
  const STORAGE_KEYS = {
    enabled:         'sapg_protectionEnabled',
    sensitivity:     'sapg_sensitivityThreshold',
    entropy:         'sapg_enableEntropy',
    terms:           'sapg_confidentialTerms',
    blockedAttempts: 'sapg_blockedAttempts',
    // Sentinel v5 Extended Keys
    context:         'sapg_enableContextWindow',
    bulk:            'sapg_enableBulkDetection',
    obfuscation:     'sapg_enableObfuscationDetection',
    base64:          'sapg_enableBase64Scan',
    compliance:      'sapg_compliancePresets',
    customTerms:     'sapg_confidentialTerms',
    customRegex:     'sapr_customRegex',
    log:             'sapg_audit_log',
    chain:           'sapg_audit_chain',
    apiKeys:         'sapg_enableApiKeyDetection',
    pii:             'sapg_enablePiiDetection',
    passwords:       'sapg_enablePasswordDetection',
    confidential:    'sapg_enableConfidentialDetection',
  };

  // ─── Nav ─────────────────────────────────────────────────────────────────────

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      const sec = item.dataset.section;
      document.querySelectorAll('.page-section').forEach(s => s.classList.remove('active'));
      const target = document.getElementById('section-' + sec);
      if (target) target.classList.add('active');
      if (sec === 'audit') loadAuditLog();
    });
  });

  // ─── Toast ───────────────────────────────────────────────────────────────────

  function showToast(msg, type) {
    const t = document.getElementById('options-toast');
    t.textContent = (type === 'error' ? '❌ ' : '✅ ') + (msg || 'Settings saved');
    t.style.color = type === 'error' ? '#f43f5e' : '#34d399';
    t.style.background = type === 'error' ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)';
    t.classList.add('show');
    setTimeout(() => t.classList.remove('show'), 2500);
  }

  // ─── Load Settings ────────────────────────────────────────────────────────────

  async function loadSettings() {
    try {
      safeGet(Object.values(STORAGE_KEYS), (r) => {
        const get = (key, def) => r[key] !== undefined ? r[key] : def;

        document.getElementById('opt-enabled').checked = get(STORAGE_KEYS.enabled, true);
        document.getElementById('opt-api-keys').checked = get(STORAGE_KEYS.apiKeys, true);
        document.getElementById('opt-pii').checked = get(STORAGE_KEYS.pii, true);
        document.getElementById('opt-passwords').checked = get(STORAGE_KEYS.passwords, true);
        document.getElementById('opt-confidential').checked = get(STORAGE_KEYS.confidential, true);
        document.getElementById('opt-entropy').checked = get(STORAGE_KEYS.entropy, true);
        document.getElementById('opt-base64').checked = get(STORAGE_KEYS.base64, true);
        document.getElementById('opt-obfuscation').checked = get(STORAGE_KEYS.obfuscation, true);
        document.getElementById('opt-bulk').checked = get(STORAGE_KEYS.bulk, true);
        document.getElementById('opt-context').checked = get(STORAGE_KEYS.context, true);

        const sens = get(STORAGE_KEYS.sensitivity, 50);
        document.getElementById('opt-sensitivity').value = sens;
        document.getElementById('sensitivity-value').textContent = sens;

        // Compliance presets
        const presets = get(STORAGE_KEYS.compliance, []);
        presets.forEach(p => {
          const el = document.getElementById('preset-' + p);
          if (el) el.classList.add('active');
        });

        document.getElementById('custom-terms').value = (get(STORAGE_KEYS.customTerms, []) || []).join('\n');
        document.getElementById('custom-regex').value = (get(STORAGE_KEYS.customRegex, []) || []).join('\n');

        // Log count badge
        const log = get(STORAGE_KEYS.log, []);
        document.getElementById('nav-log-count').textContent = log.length;
      });
    } catch (_) {}
  }

  // ─── Sensitivity slider ───────────────────────────────────────────────────────

  document.getElementById('opt-sensitivity').addEventListener('input', function () {
    document.getElementById('sensitivity-value').textContent = this.value;
  });

  // ─── Save Detection ───────────────────────────────────────────────────────────

  document.getElementById('btn-save-detection').addEventListener('click', () => {
    safeSet({
      [STORAGE_KEYS.enabled]:      document.getElementById('opt-enabled').checked,
      [STORAGE_KEYS.apiKeys]:      document.getElementById('opt-api-keys').checked,
      [STORAGE_KEYS.pii]:          document.getElementById('opt-pii').checked,
      [STORAGE_KEYS.passwords]:    document.getElementById('opt-passwords').checked,
      [STORAGE_KEYS.confidential]: document.getElementById('opt-confidential').checked,
      [STORAGE_KEYS.entropy]:      document.getElementById('opt-entropy').checked,
      [STORAGE_KEYS.base64]:       document.getElementById('opt-base64').checked,
      [STORAGE_KEYS.obfuscation]:  document.getElementById('opt-obfuscation').checked,
      [STORAGE_KEYS.bulk]:         document.getElementById('opt-bulk').checked,
      [STORAGE_KEYS.context]:      document.getElementById('opt-context').checked,
      [STORAGE_KEYS.sensitivity]:  Number(document.getElementById('opt-sensitivity').value),
    }, () => showToast('Detection settings saved'));
  });

  document.getElementById('btn-reset-detection').addEventListener('click', () => {
    safeSet({
      [STORAGE_KEYS.enabled]: true, [STORAGE_KEYS.apiKeys]: true, [STORAGE_KEYS.pii]: true,
      [STORAGE_KEYS.passwords]: true, [STORAGE_KEYS.confidential]: true, [STORAGE_KEYS.entropy]: true,
      [STORAGE_KEYS.base64]: true, [STORAGE_KEYS.obfuscation]: true, [STORAGE_KEYS.bulk]: true,
      [STORAGE_KEYS.context]: true, [STORAGE_KEYS.sensitivity]: 50,
    }, () => { loadSettings().catch(() => {}); showToast('Defaults restored'); });
  });

  // ─── Compliance presets ───────────────────────────────────────────────────────

  document.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('active'));
  });

  document.getElementById('btn-save-compliance').addEventListener('click', () => {
    const active = Array.from(document.querySelectorAll('.preset-card.active'))
      .map(c => c.dataset.preset);
    safeSet({ [STORAGE_KEYS.compliance]: active }, () => showToast('Compliance presets saved'));
  });

  // ─── Custom rules ─────────────────────────────────────────────────────────────

  document.getElementById('btn-save-custom').addEventListener('click', () => {
    const terms = document.getElementById('custom-terms').value
      .split('\n').map(t => t.trim()).filter(Boolean);
    const regexLines = document.getElementById('custom-regex').value
      .split('\n').map(t => t.trim()).filter(Boolean);
    safeSet({
      [STORAGE_KEYS.customTerms]: terms,
      [STORAGE_KEYS.terms]: terms,
      [STORAGE_KEYS.customRegex]: regexLines,
    }, () => showToast('Custom rules saved'));
  });

  // ─── Audit log ────────────────────────────────────────────────────────────────

  function formatTime(iso) {
    try { return new Date(iso).toLocaleString(); } catch (_) { return iso; }
  }

  function loadAuditLog() {
    safeGet([STORAGE_KEYS.log, STORAGE_KEYS.chain], (r) => {
      const log = r[STORAGE_KEYS.log] || [];
      const chain = r[STORAGE_KEYS.chain] || '';
      const el = document.getElementById('audit-log-list');
      const chainEl = document.getElementById('chain-head');
      if (chainEl) chainEl.textContent = chain ? 'Chain: ' + chain.slice(0, 16) + '…' : '';
      document.getElementById('nav-log-count').textContent = log.length;

      if (log.length === 0) {
        el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-3);">No audit entries yet.</div>';
        return;
      }
      el.innerHTML = log.slice(0, 50).map(e => {
        const sev = e.severity || 'info';
        const icon = sev === 'critical' ? '🚨' : sev === 'warning' ? '⚠️' : 'ℹ️';
        const cats = (e.categories || []).join(', ') || 'unknown';
        return `<div class="log-entry">
          <div class="log-sev">${icon}</div>
          <div class="log-detail">
            <div class="log-cats">${cats}</div>
            <div class="log-meta">${formatTime(e.timestamp)} · ${e.platform || ''} · ${e.findingCount || 0} findings</div>
            <div class="log-hash">sha256: ${e.hash || '—'}</div>
          </div>
          <div class="log-score ${sev}">${e.riskScore || 0}</div>
        </div>`;
      }).join('');
    });
  }

  // ─── Export ───────────────────────────────────────────────────────────────────

  function doExport() {
    chrome.runtime.sendMessage({ type: 'SAPG_EXPORT_AUDIT' }, (response) => {
      if (chrome.runtime.lastError || !response) {
        showToast('Export failed', 'error'); return;
      }
      const blob = new Blob([JSON.stringify(response, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'sentinel-audit-' + Date.now() + '.json';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Audit exported');
    });
  }

  document.getElementById('btn-export-audit').addEventListener('click', doExport);
  document.getElementById('btn-export-audit2').addEventListener('click', doExport);

  document.getElementById('btn-clear-audit').addEventListener('click', () => {
    if (confirm('Clear the entire tamper-proof audit log? This cannot be undone.')) {
      safeRemove([STORAGE_KEYS.log, STORAGE_KEYS.chain, STORAGE_KEYS.blockedAttempts], () => {
        loadAuditLog();
        showToast('Audit log cleared');
      });
    }
  });

  // ─── Init ─────────────────────────────────────────────────────────────────────
  loadSettings().catch(() => {});
})();
