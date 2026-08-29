/**
 * SENTINEL v5.0 — Guardian Center Options
 */
(function () {
  'use strict';

  const KEYS = {
    enabled:      'sapg_protectionEnabled',
    sensitivity:  'sapg_sensitivityThreshold',
    entropy:      'sapg_enableEntropyDetection',
    context:      'sapg_enableContextWindow',
    bulk:         'sapg_enableBulkDetection',
    obfuscation:  'sapg_enableObfuscationDetection',
    base64:       'sapg_enableBase64Scan',
    compliance:   'sapg_compliancePresets',
    customTerms:  'sapr_customTerms',
    customRegex:  'sapr_customRegex',
    log:          'sapg_audit_log',
    chain:        'sapg_audit_chain',
    apiKeys:      'sapg_enableApiKeyDetection',
    pii:          'sapg_enablePiiDetection',
    passwords:    'sapg_enablePasswordDetection',
    confidential: 'sapg_enableConfidentialDetection',
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

  function loadSettings() {
    chrome.storage.local.get(Object.values(KEYS), (r) => {
      const get = (key, def) => r[key] !== undefined ? r[key] : def;

      document.getElementById('opt-enabled').checked = get(KEYS.enabled, true);
      document.getElementById('opt-api-keys').checked = get(KEYS.apiKeys, true);
      document.getElementById('opt-pii').checked = get(KEYS.pii, true);
      document.getElementById('opt-passwords').checked = get(KEYS.passwords, true);
      document.getElementById('opt-confidential').checked = get(KEYS.confidential, true);
      document.getElementById('opt-entropy').checked = get(KEYS.entropy, true);
      document.getElementById('opt-base64').checked = get(KEYS.base64, true);
      document.getElementById('opt-obfuscation').checked = get(KEYS.obfuscation, true);
      document.getElementById('opt-bulk').checked = get(KEYS.bulk, true);
      document.getElementById('opt-context').checked = get(KEYS.context, true);

      const sens = get(KEYS.sensitivity, 50);
      document.getElementById('opt-sensitivity').value = sens;
      document.getElementById('sensitivity-value').textContent = sens;

      // Compliance presets
      const presets = get(KEYS.compliance, []);
      presets.forEach(p => {
        const el = document.getElementById('preset-' + p);
        if (el) el.classList.add('active');
      });

      document.getElementById('custom-terms').value = (get(KEYS.customTerms, []) || []).join('\n');
      document.getElementById('custom-regex').value = (get(KEYS.customRegex, []) || []).join('\n');

      // Log count badge
      const log = get(KEYS.log, []);
      document.getElementById('nav-log-count').textContent = log.length;
    });
  }

  // ─── Sensitivity slider ───────────────────────────────────────────────────────

  document.getElementById('opt-sensitivity').addEventListener('input', function () {
    document.getElementById('sensitivity-value').textContent = this.value;
  });

  // ─── Save Detection ───────────────────────────────────────────────────────────

  document.getElementById('btn-save-detection').addEventListener('click', () => {
    chrome.storage.local.set({
      [KEYS.enabled]:      document.getElementById('opt-enabled').checked,
      [KEYS.apiKeys]:      document.getElementById('opt-api-keys').checked,
      [KEYS.pii]:          document.getElementById('opt-pii').checked,
      [KEYS.passwords]:    document.getElementById('opt-passwords').checked,
      [KEYS.confidential]: document.getElementById('opt-confidential').checked,
      [KEYS.entropy]:      document.getElementById('opt-entropy').checked,
      [KEYS.base64]:       document.getElementById('opt-base64').checked,
      [KEYS.obfuscation]:  document.getElementById('opt-obfuscation').checked,
      [KEYS.bulk]:         document.getElementById('opt-bulk').checked,
      [KEYS.context]:      document.getElementById('opt-context').checked,
      [KEYS.sensitivity]:  Number(document.getElementById('opt-sensitivity').value),
    }, () => showToast('Detection settings saved'));
  });

  document.getElementById('btn-reset-detection').addEventListener('click', () => {
    chrome.storage.local.set({
      [KEYS.enabled]: true, [KEYS.apiKeys]: true, [KEYS.pii]: true,
      [KEYS.passwords]: true, [KEYS.confidential]: true, [KEYS.entropy]: true,
      [KEYS.base64]: true, [KEYS.obfuscation]: true, [KEYS.bulk]: true,
      [KEYS.context]: true, [KEYS.sensitivity]: 50,
    }, () => { loadSettings(); showToast('Defaults restored'); });
  });

  // ─── Compliance presets ───────────────────────────────────────────────────────

  document.querySelectorAll('.preset-card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('active'));
  });

  document.getElementById('btn-save-compliance').addEventListener('click', () => {
    const active = Array.from(document.querySelectorAll('.preset-card.active'))
      .map(c => c.dataset.preset);
    chrome.storage.local.set({ [KEYS.compliance]: active }, () => showToast('Compliance presets saved'));
  });

  // ─── Custom rules ─────────────────────────────────────────────────────────────

  document.getElementById('btn-save-custom').addEventListener('click', () => {
    const terms = document.getElementById('custom-terms').value
      .split('\n').map(t => t.trim()).filter(Boolean);
    const regexLines = document.getElementById('custom-regex').value
      .split('\n').map(t => t.trim()).filter(Boolean);
    chrome.storage.local.set({
      [KEYS.customTerms]: terms,
      [KEYS.customRegex]: regexLines,
    }, () => showToast('Custom rules saved'));
  });

  // ─── Audit log ────────────────────────────────────────────────────────────────

  function formatTime(iso) {
    try { return new Date(iso).toLocaleString(); } catch (_) { return iso; }
  }

  function loadAuditLog() {
    chrome.storage.local.get([KEYS.log, KEYS.chain], (r) => {
      const log = r[KEYS.log] || [];
      const chain = r[KEYS.chain] || '';
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
      chrome.storage.local.remove([KEYS.log, KEYS.chain], () => {
        loadAuditLog();
        showToast('Audit log cleared');
      });
    }
  });

  // ─── Init ─────────────────────────────────────────────────────────────────────
  loadSettings();
})();
