(function () {
  'use strict';

  if (window.__SHADOW_AI_GUARDIAN_INJECTED__) return;
  window.__SHADOW_AI_GUARDIAN_INJECTED__ = true;

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function detectPlatform() {
    try {
      const host = window.location.hostname.toLowerCase();
      if (host.includes('openai.com') || host.includes('chatgpt.com')) return 'ChatGPT';
      if (host.includes('claude.ai')) return 'Claude';
      if (host.includes('google.com') && (host.includes('gemini') || window.location.pathname.includes('gemini'))) return 'Gemini';
      if (host.includes('copilot.microsoft.com') || host.includes('bing.com')) return 'Copilot';
      if (host.includes('perplexity.ai')) return 'Perplexity';
    } catch (_) {}
    return 'AI Interface';
  }

  const PLATFORM_NAME = detectPlatform();

  let activeSettings = null;
  let currentScanResult = null;
  let activeInputElement = null;
  let debounceTimer = null;
  let isBypassingSend = false;
  let activeObserver = null;

  async function refreshSettings() {
    try {
      if (typeof GuardianStorage !== 'undefined' && GuardianStorage.getSettings) {
        activeSettings = await GuardianStorage.getSettings();
      } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['shadow_guardian_settings'], (res) => {
          if (chrome.runtime && chrome.runtime.lastError) {
            return;
          }
          activeSettings = (res && res.shadow_guardian_settings) || {
            protectionActive: true,
            whitelistedDomains: [],
            keywordWatchlist: []
          };
        });
      }
    } catch (_) {}
  }

  refreshSettings();

  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      try {
        if (area === 'local' && changes.shadow_guardian_settings) {
          activeSettings = changes.shadow_guardian_settings.newValue;
          if (activeInputElement) {
            evaluateInput(activeInputElement);
          }
        }
      } catch (_) {}
    });
  }

  function injectGuardianStyles() {
    if (document.getElementById('shadow-guardian-injected-styles')) return;

    const style = document.createElement('style');
    style.id = 'shadow-guardian-injected-styles';
    style.textContent = `
      :root {
        --bg-base: #05080F;
        --bg-card: rgba(255,255,255,0.04);
        --bg-card-hover: rgba(255,255,255,0.07);
        --border-glow: rgba(0,245,255,0.15);
        --border-glow-active: rgba(0,245,255,0.5);
        --accent-cyan: #00F5FF;
        --accent-purple: #8B5CF6;
        --accent-red: #FF3B5C;
        --accent-green: #00FF88;
        --accent-orange: #FF9500;
        --text-primary: #E8EAED;
        --text-secondary: #8B9399;
        --text-muted: #4A5568;
        --glow-cyan: 0 0 20px rgba(0,245,255,0.3);
        --glow-purple: 0 0 20px rgba(139,92,246,0.3);
        --glow-red: 0 0 20px rgba(255,59,92,0.3);
      }

      @keyframes float-card {
        0%, 100% {
          transform: translateY(0px);
          box-shadow: 0 8px 32px rgba(0,245,255,0.08), 0 0 0 1px rgba(0,245,255,0.06);
        }
        50% {
          transform: translateY(-7px);
          box-shadow: 0 20px 48px rgba(0,245,255,0.18), 0 0 0 1px rgba(0,245,255,0.15);
        }
      }

      @keyframes float-critical {
        0%, 100% {
          transform: translateY(0px);
          box-shadow: 0 8px 32px rgba(255,59,92,0.15), 0 0 0 1px rgba(255,59,92,0.2);
        }
        50% {
          transform: translateY(-7px);
          box-shadow: 0 20px 48px rgba(255,59,92,0.35), 0 0 0 1px rgba(255,59,92,0.4);
        }
      }

      @keyframes border-shimmer {
        0%   { background-position: 0% 50%; }
        50%  { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }

      .shadow-risk-pill {
        will-change: transform;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px;
        border-radius: 20px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        -webkit-backdrop-filter: blur(16px);
        backdrop-filter: blur(16px);
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease;
        z-index: 999990;
        cursor: pointer;
        user-select: none;
        margin-bottom: 8px;
        animation: float-card 4s ease-in-out infinite 0s normal;
      }

      .shadow-risk-pill:hover {
        animation-play-state: paused;
        transform: translateY(-4px) scale(1.02);
      }

      .shadow-risk-pill.clean {
        background: rgba(0, 255, 136, 0.12);
        border: 1px solid rgba(0, 255, 136, 0.4);
        color: var(--accent-green);
      }

      .shadow-risk-pill.low {
        background: rgba(0, 245, 255, 0.12);
        border: 1px solid rgba(0, 245, 255, 0.4);
        color: var(--accent-cyan);
      }

      .shadow-risk-pill.medium {
        background: rgba(255, 149, 0, 0.15);
        border: 1px solid rgba(255, 149, 0, 0.5);
        color: var(--accent-orange);
      }

      .shadow-risk-pill.high,
      .shadow-risk-pill.critical {
        background: rgba(255, 59, 92, 0.18);
        border: 1px solid rgba(255, 59, 92, 0.6);
        color: var(--accent-red);
        animation: float-critical 3s ease-in-out infinite 0s normal;
      }

      .shadow-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(5, 8, 15, 0.85);
        -webkit-backdrop-filter: blur(16px);
        backdrop-filter: blur(16px);
        z-index: 2147483640;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        opacity: 0;
        animation: shadowModalFadeIn 0.25s forwards cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes shadowModalFadeIn {
        to { opacity: 1; }
      }

      .shadow-modal-card {
        will-change: transform;
        width: 100%;
        max-width: 480px;
        background: rgba(10, 14, 26, 0.95);
        border: 1px solid var(--border-glow);
        border-radius: 20px;
        box-shadow: 0 32px 64px rgba(0,0,0,0.8), 0 0 32px rgba(0,245,255,0.15);
        color: var(--text-primary);
        font-family: system-ui, -apple-system, sans-serif;
        padding: 24px;
        position: relative;
        overflow: visible;
        animation: float-card 5s ease-in-out infinite 0s normal;
        transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s ease;
      }

      .shadow-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
      }

      .shadow-modal-title-group {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .shadow-shield-icon {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        background: linear-gradient(135deg, var(--accent-cyan) 0%, var(--accent-purple) 100%);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #05080F;
        box-shadow: var(--glow-cyan);
      }

      .shadow-modal-title {
        font-size: 17px;
        font-weight: 700;
        color: #FFFFFF;
        letter-spacing: -0.01em;
      }

      .shadow-modal-sub {
        font-size: 11px;
        color: var(--text-secondary);
        font-family: ui-monospace, SFMono-Regular, monospace;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        margin-top: 2px;
      }

      .shadow-risk-badge {
        padding: 6px 12px;
        border-radius: 12px;
        font-size: 13px;
        font-weight: 700;
        font-family: ui-monospace, SFMono-Regular, monospace;
      }

      .shadow-risk-badge.critical {
        background: rgba(255, 59, 92, 0.2);
        color: var(--accent-red);
        border: 1px solid rgba(255, 59, 92, 0.6);
      }

      .shadow-risk-badge.high {
        background: rgba(255, 59, 92, 0.15);
        color: var(--accent-red);
        border: 1px solid rgba(255, 59, 92, 0.4);
      }

      .shadow-risk-badge.medium {
        background: rgba(255, 149, 0, 0.15);
        color: var(--accent-orange);
        border: 1px solid rgba(255, 149, 0, 0.4);
      }

      .shadow-risk-badge.low {
        background: rgba(0, 245, 255, 0.12);
        color: var(--accent-cyan);
        border: 1px solid rgba(0, 245, 255, 0.3);
      }

      .shadow-alert-banner {
        background: linear-gradient(135deg, rgba(255, 59, 92, 0.2) 0%, rgba(139, 92, 246, 0.1) 100%);
        border: 1px solid rgba(255, 59, 92, 0.35);
        border-radius: 12px;
        padding: 12px 14px;
        font-size: 13px;
        line-height: 1.45;
        color: #FEE2E2;
        margin-bottom: 16px;
        display: flex;
        align-items: flex-start;
        gap: 10px;
      }

      .shadow-alert-banner svg {
        flex-shrink: 0;
        margin-top: 2px;
      }

      .shadow-findings-list {
        max-height: 180px;
        overflow-y: auto;
        border-radius: 12px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.05);
        padding: 8px;
        margin-bottom: 20px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .shadow-finding-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        border-radius: 8px;
        background: var(--bg-card);
        border-left: 3px solid var(--accent-cyan);
        transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .shadow-finding-item:hover {
        transform: translateY(-4px) scale(1.01);
        background: var(--bg-card-hover);
        box-shadow: 0 8px 16px rgba(0, 245, 255, 0.15);
      }

      .shadow-finding-name {
        font-size: 13px;
        font-weight: 700;
        color: #FFFFFF;
      }

      .shadow-finding-conf {
        font-size: 11px;
        color: var(--text-secondary);
        margin-top: 2px;
      }

      .shadow-finding-val {
        font-family: ui-monospace, SFMono-Regular, monospace;
        font-size: 11px;
        color: var(--accent-cyan);
        background: rgba(0, 245, 255, 0.1);
        border: 1px solid rgba(0, 245, 255, 0.2);
        padding: 4px 8px;
        border-radius: 6px;
        max-width: 170px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .shadow-modal-actions {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 10px;
      }

      .shadow-btn {
        padding: 12px 10px;
        border-radius: 10px;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.02em;
        cursor: pointer;
        border: none;
        outline: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 3px;
        transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      .shadow-btn-sub {
        font-size: 9px;
        font-weight: 500;
        opacity: 0.85;
      }

      .shadow-btn-block {
        background: var(--accent-red);
        color: #FFFFFF;
        box-shadow: 0 4px 14px rgba(255, 59, 92, 0.4);
      }

      .shadow-btn-block:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(255, 59, 92, 0.6);
      }

      .shadow-btn-redact {
        background: var(--accent-cyan);
        color: #05080F;
        box-shadow: 0 4px 14px rgba(0, 245, 255, 0.35);
      }

      .shadow-btn-redact:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 245, 255, 0.6);
      }

      .shadow-btn-proceed {
        background: rgba(255, 255, 255, 0.05);
        color: var(--text-secondary);
        border: 1px solid rgba(255, 255, 255, 0.15);
      }

      .shadow-btn-proceed:hover {
        background: rgba(255, 255, 255, 0.1);
        color: #FFFFFF;
        transform: translateY(-2px);
      }
    `;

    const target = document.head || document.documentElement;
    if (target) {
      target.appendChild(style);
    }
  }

  function getInputText(el) {
    if (!el) return '';
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      return typeof el.value === 'string' ? el.value : '';
    }
    return typeof el.innerText === 'string' ? el.innerText : (el.textContent || '');
  }

  function setInputText(el, newText) {
    if (!el) return;
    const sanitized = newText || '';
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      el.value = sanitized;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      el.focus();
      el.innerText = sanitized;
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: sanitized }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function evaluateInput(el) {
    if (!el) return;

    try {
      const currentHost = window.location.host;
      if (activeSettings && activeSettings.whitelistedDomains) {
        if (activeSettings.whitelistedDomains.some((d) => currentHost.includes(d.trim()))) {
          removeRiskPill(el);
          return;
        }
      }

      if (activeSettings && activeSettings.protectionActive === false) {
        removeRiskPill(el);
        return;
      }

      const text = getInputText(el);
      if (!text || text.trim().length === 0) {
        removeRiskPill(el);
        currentScanResult = null;
        notifyBackgroundEvaluation('CLEAN', 0, 0);
        return;
      }

      setTimeout(() => {
        try {
          if (typeof PromptGuardianRules !== 'undefined' && PromptGuardianRules.analyzePrompt) {
            const watchlist = (activeSettings && activeSettings.keywordWatchlist) || [];
            const categories = (activeSettings && activeSettings.categories) || {};
            currentScanResult = PromptGuardianRules.analyzePrompt(text, watchlist, categories);

            notifyBackgroundEvaluation(
              currentScanResult.riskLevel,
              currentScanResult.riskScore,
              currentScanResult.findings.length
            );

            renderRiskPill(el, currentScanResult);
          }
        } catch (_) {}
      }, 0);
    } catch (_) {}
  }

  function notifyBackgroundEvaluation(riskLevel, riskScore, findingsCount) {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        chrome.runtime.sendMessage({
          action: 'PROMPT_EVALUATED',
          payload: {
            riskLevel,
            riskScore,
            findingsCount,
            platform: PLATFORM_NAME
          }
        }, () => {
          if (chrome.runtime && chrome.runtime.lastError) {}
        });
      }
    } catch (_) {}
  }

  function renderRiskPill(inputEl, result) {
    if (!inputEl) return;
    if (!result || result.riskLevel === 'CLEAN' || !Array.isArray(result.findings) || result.findings.length === 0) {
      removeRiskPill(inputEl);
      return;
    }

    let pill = document.getElementById('shadow-active-risk-pill');
    if (!pill) {
      pill = document.createElement('div');
      pill.id = 'shadow-active-risk-pill';
      pill.className = 'shadow-risk-pill';
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showInterceptionModal(result, inputEl);
      });
      const container = inputEl.parentElement || inputEl;
      if (container && container.insertBefore) {
        container.insertBefore(pill, inputEl);
      }
    }

    const levelClass = escapeHtml((result.riskLevel || 'LOW').toLowerCase());
    pill.className = `shadow-risk-pill ${levelClass}`;
    const count = result.findings.length;
    pill.innerHTML = `
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2L3 7v5c0 5.5 4 10 9 11 5-1 9-5.5 9-11V7l-9-5z"/></svg>
      <span>${escapeHtml(result.riskLevel)} (${escapeHtml(result.riskScore)}/100): ${count} Flagged</span>
    `;
  }

  function removeRiskPill(inputEl) {
    const pill = document.getElementById('shadow-active-risk-pill');
    if (pill && pill.remove) {
      pill.remove();
    }
  }

  function showInterceptionModal(result, inputEl) {
    if (!result || !inputEl) return;
    if (document.getElementById('shadow-interception-modal-backdrop')) return;

    const backdrop = document.createElement('div');
    backdrop.id = 'shadow-interception-modal-backdrop';
    backdrop.className = 'shadow-modal-backdrop';

    const findings = Array.isArray(result.findings) ? result.findings : [];
    const findingsHtml = findings.map((f) => {
      const borderCol = result.riskLevel === 'CRITICAL' ? 'var(--accent-red)' : (result.riskLevel === 'HIGH' ? 'var(--accent-orange)' : 'var(--accent-cyan)');
      return `
        <div class="shadow-finding-item" style="border-left-color: ${borderCol};">
          <div>
            <div class="shadow-finding-name">${escapeHtml(f.name || f.type)}</div>
            <div class="shadow-finding-conf">Confidence: ${escapeHtml(f.confidence || 'HIGH')}</div>
          </div>
          <div class="shadow-finding-val">${escapeHtml(f.maskedValue || f.match || '[REDACTED]')}</div>
        </div>
      `;
    }).join('');

    const levelClass = escapeHtml((result.riskLevel || 'LOW').toLowerCase());

    backdrop.innerHTML = `
      <div class="shadow-modal-card">
        <div class="shadow-modal-header">
          <div class="shadow-modal-title-group">
            <div class="shadow-shield-icon">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L3 7v5c0 5.5 4 10 9 11 5-1 9-5.5 9-11V7l-9-5z"/></svg>
            </div>
            <div>
              <div class="shadow-modal-title">Prompt Security Interception</div>
              <div class="shadow-modal-sub">${escapeHtml(PLATFORM_NAME)} · REAL-TIME PRE-FLIGHT INSPECTION</div>
            </div>
          </div>
          <div class="shadow-risk-badge ${levelClass}">
            ${escapeHtml(result.riskLevel)} · ${escapeHtml(result.riskScore)}/100
          </div>
        </div>

        <div class="shadow-modal-body">
          <div class="shadow-alert-banner">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FF3B5C" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div>
              <strong>Potential Confidential Leak Detected</strong><br>
              Outbound prompt contains sensitive data violating security policies. Choose an action:
            </div>
          </div>

          <div style="font-size: 11px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.05em;">
            Flagged Elements (${findings.length})
          </div>

          <div class="shadow-findings-list">
            ${findingsHtml}
          </div>
        </div>

        <div class="shadow-modal-actions">
          <button class="shadow-btn shadow-btn-block" id="shadow-modal-btn-block">
            <span>BLOCK SEND</span>
            <span class="shadow-btn-sub">Cancel & Preserve</span>
          </button>
          <button class="shadow-btn shadow-btn-redact" id="shadow-modal-btn-redact">
            <span>AUTO-REDACT</span>
            <span class="shadow-btn-sub">Mask & Transmit</span>
          </button>
          <button class="shadow-btn shadow-btn-proceed" id="shadow-modal-btn-proceed">
            <span>PROCEED</span>
            <span class="shadow-btn-sub">⚠ Acknowledge Risk</span>
          </button>
        </div>
      </div>
    `;

    if (document.body) {
      document.body.appendChild(backdrop);
    }

    const rawText = getInputText(inputEl);
    const excerpt = rawText.length > 120 ? (rawText.substring(0, 120) + '...') : rawText;

    const btnBlock = document.getElementById('shadow-modal-btn-block');
    if (btnBlock) {
      btnBlock.addEventListener('click', () => {
        backdrop.remove();
        logInterceptionAction('BLOCKED', result, excerpt);
      });
    }

    const btnRedact = document.getElementById('shadow-modal-btn-redact');
    if (btnRedact) {
      btnRedact.addEventListener('click', () => {
        backdrop.remove();
        const sanitized = result.redactedText || '';
        setInputText(inputEl, sanitized);
        logInterceptionAction('REDACTED', result, sanitized.substring(0, 120));

        setTimeout(() => {
          isBypassingSend = true;
          dispatchSend(inputEl);
        }, 120);
      });
    }

    const btnProceed = document.getElementById('shadow-modal-btn-proceed');
    if (btnProceed) {
      btnProceed.addEventListener('click', () => {
        backdrop.remove();
        logInterceptionAction('ALLOWED', result, excerpt);

        setTimeout(() => {
          isBypassingSend = true;
          dispatchSend(inputEl);
        }, 120);
      });
    }
  }

  function logInterceptionAction(actionTaken, result, excerpt = '') {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        const findings = Array.isArray(result.findings) ? result.findings : [];
        chrome.runtime.sendMessage({
          action: 'LOG_INTERCEPTION',
          payload: {
            platform: PLATFORM_NAME,
            riskLevel: result.riskLevel,
            riskScore: result.riskScore,
            actionTaken,
            dataType: findings.map((f) => f.name || f.type).join(', '),
            categories: Object.keys(result.categoryBreakdown || {}).filter((k) => result.categoryBreakdown[k] > 0),
            categoryBreakdown: result.categoryBreakdown || {},
            findingCount: findings.length,
            promptExcerpt: excerpt || '[REDACTED for privacy]',
            summary: `${actionTaken} prompt on ${PLATFORM_NAME} containing ${findings.length} sensitive items.`
          }
        }, () => {
          if (chrome.runtime && chrome.runtime.lastError) {}
        });
      }
    } catch (_) {}
  }

  function dispatchSend(inputEl) {
    try {
      const sendBtn = findSendButton(inputEl);
      if (sendBtn) {
        sendBtn.click();
      } else if (inputEl) {
        inputEl.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true
        }));
      }
    } catch (_) {
    } finally {
      setTimeout(() => {
        isBypassingSend = false;
      }, 500);
    }
  }

  function findSendButton(inputEl) {
    const selectors = [
      'button[data-testid="send-button"]',
      'button[aria-label="Send prompt"]',
      'button[aria-label="Send message"]',
      'button[aria-label="Send Message"]',
      'fieldset button:last-child',
      'button[aria-label*="Send"]',
      'button.send-button',
      '.send-button-container button',
      'button[aria-label="Submit"]',
      'button[title="Submit"]',
      'button[type="submit"]',
      'form button[type="submit"]'
    ];

    for (const sel of selectors) {
      try {
        const btn = document.querySelector(sel);
        if (btn && btn.offsetParent !== null) return btn;
      } catch (_) {}
    }
    return null;
  }

  function handleSubmissionAttempt(e, inputEl) {
    if (isBypassingSend || !inputEl) return;

    try {
      const currentHost = window.location.host;
      if (activeSettings && activeSettings.whitelistedDomains) {
        if (activeSettings.whitelistedDomains.some((d) => currentHost.includes(d.trim()))) {
          return;
        }
      }
      if (activeSettings && activeSettings.protectionActive === false) {
        return;
      }

      const text = getInputText(inputEl);
      if (!text || text.trim().length === 0) return;

      if (typeof PromptGuardianRules !== 'undefined' && PromptGuardianRules.analyzePrompt) {
        const watchlist = (activeSettings && activeSettings.keywordWatchlist) || [];
        const categories = (activeSettings && activeSettings.categories) || {};
        const result = PromptGuardianRules.analyzePrompt(text, watchlist, categories);

        if (result.riskLevel === 'MEDIUM' || result.riskLevel === 'HIGH' || result.riskLevel === 'CRITICAL') {
          if (e) {
            e.preventDefault();
            e.stopPropagation();
            if (e.stopImmediatePropagation) e.stopImmediatePropagation();
          }
          showInterceptionModal(result, inputEl);
          return false;
        }
      }
    } catch (_) {}
  }

  function hookInputElement(el) {
    if (!el || el.__SHADOW_GUARDIAN_HOOKED__) return;
    el.__SHADOW_GUARDIAN_HOOKED__ = true;
    activeInputElement = el;

    const onInputDebounced = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        evaluateInput(el);
      }, 300);
    };

    el.addEventListener('input', onInputDebounced, { passive: true });
    el.addEventListener('keyup', onInputDebounced, { passive: true });
    el.addEventListener('paste', () => {
      setTimeout(() => evaluateInput(el), 50);
    }, { passive: true });
    el.addEventListener('focus', () => {
      activeInputElement = el;
      evaluateInput(el);
    }, { passive: true });

    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        handleSubmissionAttempt(e, el);
      }
    }, true);
  }

  function scanAndHookInputs() {
    try {
      const textareas = document.querySelectorAll('textarea');
      textareas.forEach(hookInputElement);

      const editables = document.querySelectorAll('[contenteditable="true"], [contenteditable=""], [role="textbox"]');
      editables.forEach(hookInputElement);

      const forms = document.querySelectorAll('form');
      forms.forEach((form) => {
        if (!form.__SHADOW_GUARDIAN_SUBMIT_HOOKED__) {
          form.__SHADOW_GUARDIAN_SUBMIT_HOOKED__ = true;
          form.addEventListener('submit', (e) => {
            if (activeInputElement) {
              handleSubmissionAttempt(e, activeInputElement);
            }
          }, true);
        }
      });

      const buttons = document.querySelectorAll('button');
      buttons.forEach((btn) => {
        if (!btn.__SHADOW_GUARDIAN_CLICK_HOOKED__) {
          btn.__SHADOW_GUARDIAN_CLICK_HOOKED__ = true;
          btn.addEventListener('click', (e) => {
            if (activeInputElement) {
              const sendBtn = findSendButton(activeInputElement);
              if (sendBtn && (sendBtn === btn || sendBtn.contains(btn))) {
                handleSubmissionAttempt(e, activeInputElement);
              }
            }
          }, true);
        }
      });
    } catch (_) {}
  }

  function initObserver() {
    injectGuardianStyles();
    scanAndHookInputs();

    try {
      activeObserver = new MutationObserver((mutations) => {
        let shouldScan = false;
        for (const m of mutations) {
          if (m.addedNodes && m.addedNodes.length > 0) {
            shouldScan = true;
            break;
          }
        }
        if (shouldScan) {
          scanAndHookInputs();
        }
      });

      if (document.body) {
        activeObserver.observe(document.body, {
          childList: true,
          subtree: true
        });
      }
    } catch (_) {}
  }

  window.addEventListener('popstate', () => {
    scanAndHookInputs();
  });

  window.addEventListener('hashchange', () => {
    scanAndHookInputs();
  });

  window.addEventListener('beforeunload', () => {
    try {
      if (activeObserver) {
        activeObserver.disconnect();
        activeObserver = null;
      }
    } catch (_) {}
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }
})();
