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

        const sens = get(STORAGE_KEYS.sensitivity, 30);
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
      [STORAGE_KEYS.context]: true, [STORAGE_KEYS.sensitivity]: 30,
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
    safeGet([STORAGE_KEYS.log, STORAGE_KEYS.chain, STORAGE_KEYS.blockedAttempts], (r) => {
      const log = (r[STORAGE_KEYS.log] && r[STORAGE_KEYS.log].length)
        ? r[STORAGE_KEYS.log]
        : (r[STORAGE_KEYS.blockedAttempts] || []);
      const chain = r[STORAGE_KEYS.chain] || '';
      const el = document.getElementById('audit-log-list');
      const chainEl = document.getElementById('chain-head');
      const badgeEl = document.getElementById('nav-log-count');
      if (chainEl) chainEl.textContent = chain ? 'Chain: ' + chain.slice(0, 16) + '…' : '';
      if (badgeEl) badgeEl.textContent = log.length;

      // Render main audit log list
      if (el) {
        if (log.length === 0) {
          el.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-3);">No audit entries yet.</div>';
        } else {
          el.innerHTML = log.slice(0, 50).map(e => {
            const sev = e.severity || (e.riskScore >= 70 ? 'critical' : e.riskScore >= 30 ? 'warning' : 'info');
            const icon = sev === 'critical' ? '🚨' : sev === 'warning' ? '⚠️' : 'ℹ️';
            const rawCats = e.categories || (e.reason ? [e.reason] : ['unknown']);
            const cats = Array.isArray(rawCats) ? rawCats.join(', ') : String(rawCats);
            const findingCount = e.findingCount || (e.maskedPreviews ? e.maskedPreviews.length : (e.snippet ? 1 : 0));
            const platform = e.platform || 'ChatGPT';
            return `<div class="log-entry">
              <div class="log-sev">${icon}</div>
              <div class="log-detail">
                <div class="log-cats">${cats}</div>
                <div class="log-meta">${formatTime(e.timestamp)} · ${platform} · ${findingCount} findings</div>
                <div class="log-hash">sha256: ${e.hash || '—'}</div>
              </div>
              <div class="log-score ${sev}">${e.riskScore || 0}</div>
            </div>`;
          }).join('');
        }
      }

      // Render into simulator recent log feed
      const simLogEl = document.getElementById('sim-recent-logs');
      if (simLogEl) {
        if (log.length === 0) {
          simLogEl.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-3);font-size:12px;">No recent blocks recorded yet.</div>';
        } else {
          simLogEl.innerHTML = log.slice(0, 3).map(e => {
            const sev = e.severity || (e.riskScore >= 70 ? 'critical' : e.riskScore >= 30 ? 'warning' : 'info');
            const icon = sev === 'critical' ? '🚨' : sev === 'warning' ? '⚠️' : 'ℹ️';
            const rawCats = e.categories || (e.reason ? [e.reason] : ['unknown']);
            const cats = Array.isArray(rawCats) ? rawCats.join(', ') : String(rawCats);
            return `<div class="log-entry" style="margin-bottom:6px;padding:8px 12px;">
              <div class="log-sev" style="font-size:12px;">${icon}</div>
              <div class="log-detail">
                <div class="log-cats" style="font-size:11px;">${cats}</div>
                <div class="log-meta" style="font-size:10px;">${formatTime(e.timestamp)} · ${e.platform || 'Guardian'}</div>
              </div>
              <div class="log-score ${sev}" style="font-size:14px;">${e.riskScore || 0}</div>
            </div>`;
          }).join('');
        }
      }
    });
  }

  // ─── Real-time Storage Sync (Live Audit Log & Multi-Tab Synchronization) ──────
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local') {
        if (changes[STORAGE_KEYS.log] || changes[STORAGE_KEYS.blockedAttempts] || changes[STORAGE_KEYS.chain]) {
          loadAuditLog();
        }
        if (changes[STORAGE_KEYS.enabled] || changes[STORAGE_KEYS.sensitivity]) {
          loadSettings().catch(() => {});
        }
      }
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

  // ─── Guardian Test Simulator ──────────────────────────────────────────────────
  const SIM_PRESETS = {
    aws: 'Please configure my AWS access key: AKIAIOSFODNN7EXAMPLE for the production S3 bucket.',
    card: 'Kindly charge the subscription fee to my Visa card 4532015112830366 exp 09/28 cvc 456.',
    email: 'Patient records for Jane Doe, contact: jane.doe@healthcorp.org, SSN: 000-12-3456.',
    db: 'Database connection string: postgresql://admin:SuperSecurePass123!@db.internal:5432/main_db',
    clean: 'Could you explain the core differences between asynchronous concurrency and parallelism in systems programming?'
  };

  document.querySelectorAll('.sim-sample-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const presetKey = btn.dataset.preset;
      const promptInput = document.getElementById('sim-prompt-input');
      if (promptInput && SIM_PRESETS[presetKey]) {
        promptInput.value = SIM_PRESETS[presetKey];
        runSimulatorScan(promptInput.value);
      }
    });
  });

  const simScanBtn = document.getElementById('sim-scan-btn');
  if (simScanBtn) {
    simScanBtn.addEventListener('click', () => {
      const promptInput = document.getElementById('sim-prompt-input');
      const text = promptInput ? promptInput.value : '';
      runSimulatorScan(text);
    });
  }

  const simClearBtn = document.getElementById('sim-clear-btn');
  if (simClearBtn) {
    simClearBtn.addEventListener('click', () => {
      const promptInput = document.getElementById('sim-prompt-input');
      if (promptInput) promptInput.value = '';
      const resBox = document.getElementById('sim-results');
      if (resBox) resBox.style.display = 'none';
    });
  }

  const simRefreshLogBtn = document.getElementById('sim-refresh-log-btn');
  if (simRefreshLogBtn) {
    simRefreshLogBtn.addEventListener('click', () => {
      loadAuditLog();
      showToast('Audit feed refreshed');
    });
  }

  function runSimulatorScan(text) {
    const resBox = document.getElementById('sim-results');
    if (!resBox) return null;
    if (!text || !text.trim()) {
      resBox.style.display = 'none';
      return null;
    }

    const scanner = (typeof analyzePrompt === 'function')
      ? analyzePrompt
      : (typeof window !== 'undefined' && typeof window.analyzePrompt === 'function' ? window.analyzePrompt : null);

    if (!scanner) {
      showToast('Detection engine not loaded', 'error');
      return null;
    }

    const result = scanner(text);
    resBox.style.display = 'block';

    const scoreNum = document.getElementById('sim-score-num');
    const scoreFill = document.getElementById('sim-score-fill');
    const verdictBadge = document.getElementById('sim-verdict-badge');
    const categoriesBadge = document.getElementById('sim-categories-badge');
    const findingsContainer = document.getElementById('sim-findings-container');
    const redactedBox = document.getElementById('sim-redacted-box');
    const redactedText = document.getElementById('sim-redacted-text');

    const score = result.riskScore || 0;
    if (scoreNum) scoreNum.textContent = 'Risk: ' + score;

    let color = 'var(--safe)';
    let verdictText = 'SAFE';
    let verdictBg = 'rgba(16,185,129,0.15)';
    let verdictColor = '#34d399';

    if (result.shouldBlock) {
      if (result.severity === 'critical' || score >= 70) {
        color = 'var(--critical)';
        verdictText = 'CRITICAL BLOCKED';
        verdictBg = 'rgba(244,63,94,0.15)';
        verdictColor = '#f43f5e';
      } else {
        color = 'var(--warning)';
        verdictText = 'WARNING BLOCKED';
        verdictBg = 'rgba(245,158,11,0.15)';
        verdictColor = '#f59e0b';
      }
    }

    if (scoreFill) {
      scoreFill.style.width = Math.min(100, Math.max(0, score)) + '%';
      scoreFill.style.background = color;
    }

    if (verdictBadge) {
      verdictBadge.textContent = verdictText;
      verdictBadge.style.background = verdictBg;
      verdictBadge.style.color = verdictColor;
    }

    if (categoriesBadge) {
      categoriesBadge.textContent = (result.categories && result.categories.length)
        ? 'Categories: ' + result.categories.join(', ')
        : 'No sensitive categories detected';
    }

    if (findingsContainer) {
      if (!result.findings || result.findings.length === 0) {
        findingsContainer.innerHTML = '<div style="color:var(--text-2);font-size:11px;margin-top:6px;">No secrets or sensitive tokens detected. Clean prompt.</div>';
      } else {
        findingsContainer.innerHTML = result.findings.slice(0, 5).map(f => {
          return `<div class="sim-finding-item">
            <div>
              <strong style="color:var(--text-1);">${f.name || f.category}</strong>
              <span style="color:var(--text-3);margin-left:6px;">[${f.category}]</span>
            </div>
            <div style="font-family:var(--font-mono);color:#f43f5e;">${f.matchMasked || '***'}</div>
          </div>`;
        }).join('');
      }
    }

    // Auto-redaction preview
    if (redactedBox && redactedText) {
      const redactor = (typeof autoRedact === 'function')
        ? autoRedact
        : (typeof window !== 'undefined' && typeof window.autoRedact === 'function' ? window.autoRedact : null);

      if (redactor && result.findings && result.findings.length > 0) {
        const redRes = redactor(text, result.findings);
        redactedText.textContent = redRes.redacted;
        redactedBox.style.display = 'block';
      } else {
        redactedBox.style.display = 'none';
      }
    }

    return result;
  }

  // Simulate & Log Block button
  const simBlockBtn = document.getElementById('sim-block-btn');
  if (simBlockBtn) {
    simBlockBtn.addEventListener('click', () => {
      const promptInput = document.getElementById('sim-prompt-input');
      const text = promptInput ? promptInput.value : '';
      if (!text || !text.trim()) {
        showToast('Please enter or select a prompt first', 'error');
        return;
      }

      const scanResult = runSimulatorScan(text) || {
        riskScore: 85,
        severity: 'critical',
        shouldBlock: true,
        categories: ['api_key'],
        findings: [{ name: 'Simulated Secret', category: 'api_key', matchMasked: 'SIM***SECRET' }]
      };

      // Dispatch SAPG_BLOCK_OCCURRED to background
      const blockPayload = {
        type: 'SAPG_BLOCK_OCCURRED',
        platform: 'Guardian Simulator',
        result: scanResult
      };

      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        chrome.runtime.sendMessage(blockPayload, (resp) => {
          if (chrome.runtime.lastError || !resp || !resp.ok) {
            fallbackAppendAudit(scanResult);
          } else {
            showToast('Simulated block logged to audit chain');
            loadAuditLog();
          }
        });
      } else {
        fallbackAppendAudit(scanResult);
      }
    });
  }

  function fallbackAppendAudit(result) {
    try {
      const entry = {
        timestamp: new Date().toISOString(),
        categories: result.categories || ['simulated_test'],
        riskScore: result.riskScore || 75,
        severity: result.severity || 'critical',
        hasCritical: result.hasCritical !== undefined ? result.hasCritical : (result.severity === 'critical'),
        findingCount: (result.findings || []).length || 1,
        maskedPreviews: (result.findings || []).slice(0, 3).map(f => f.matchMasked || ''),
        platform: 'Guardian Simulator',
        hash: 'sim_' + Math.random().toString(36).slice(2, 10),
      };

      safeGet([STORAGE_KEYS.log, STORAGE_KEYS.blockedAttempts], (res) => {
        const log = res[STORAGE_KEYS.log] || [];
        const attempts = res[STORAGE_KEYS.blockedAttempts] || [];
        log.unshift(entry);
        attempts.unshift(entry);
        if (log.length > 50) log.length = 50;
        if (attempts.length > 50) attempts.length = 50;
        safeSet({
          [STORAGE_KEYS.log]: log,
          [STORAGE_KEYS.blockedAttempts]: attempts,
        }, () => {
          loadAuditLog();
          showToast('Block recorded to local audit log');
        });
      });
    } catch (_) {}
  }

  // ─── Init ─────────────────────────────────────────────────────────────────────
  loadSettings().catch(() => {});
  loadAuditLog();
})();
