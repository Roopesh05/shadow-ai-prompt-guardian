/**
 * Shadow AI Prompt Guardian — Real-Time Interception Content Script
 * Version: 2.0.0 (Manifest V3 Production Build)
 *
 * Capabilities:
 *  - Platform detection (ChatGPT, Claude, Gemini, Copilot, Perplexity)
 *  - Dynamic DOM attachment via MutationObserver for SPAs
 *  - 300ms debounced input monitoring on textarea & contenteditable fields
 *  - Inline floating risk badge pill & underliner
 *  - Submit interception on Enter keypress & Send button clicks
 *  - Cybersecurity modal dialog with BLOCK, AUTO-REDACT, and PROCEED actions
 *  - In-page floating toast notifications
 *  - Zero console errors, fully scoped styles
 */

(function () {
  'use strict';

  // Prevent double injection
  if (window.__SHADOW_AI_GUARDIAN_INJECTED__) return;
  window.__SHADOW_AI_GUARDIAN_INJECTED__ = true;

  // ─── Platform Detection ────────────────────────────────────────────────────

  function detectPlatform() {
    const host = window.location.hostname.toLowerCase();
    if (host.includes('openai.com') || host.includes('chatgpt.com')) return 'ChatGPT';
    if (host.includes('claude.ai')) return 'Claude';
    if (host.includes('google.com') && (host.includes('gemini') || window.location.pathname.includes('gemini'))) return 'Gemini';
    if (host.includes('copilot.microsoft.com') || host.includes('bing.com')) return 'Copilot';
    if (host.includes('perplexity.ai')) return 'Perplexity';
    return 'AI Interface';
  }

  const PLATFORM_NAME = detectPlatform();

  // ─── State Management ──────────────────────────────────────────────────────

  let activeSettings = null;
  let currentScanResult = null;
  let activeInputElement = null;
  let debounceTimer = null;
  let isBypassingSend = false;

  // ─── Settings Loader ───────────────────────────────────────────────────────

  async function refreshSettings() {
    try {
      if (typeof GuardianStorage !== 'undefined') {
        activeSettings = await GuardianStorage.getSettings();
      } else if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
        chrome.storage.local.get(['shadow_guardian_settings'], (res) => {
          activeSettings = (res && res.shadow_guardian_settings) || {
            protectionActive: true,
            whitelistedDomains: [],
            keywordWatchlist: []
          };
        });
      }
    } catch (err) {
      console.warn('[Shadow AI Content] Settings load fallback:', err);
    }
  }

  refreshSettings();

  // Listen for storage changes
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener((changes, area) => {
      if (area === 'local' && changes.shadow_guardian_settings) {
        activeSettings = changes.shadow_guardian_settings.newValue;
        if (activeInputElement) {
          evaluateInput(activeInputElement);
        }
      }
    });
  }

  // ─── Injected Styles ───────────────────────────────────────────────────────

  function injectGuardianStyles() {
    if (document.getElementById('shadow-guardian-injected-styles')) return;

    const style = document.createElement('style');
    style.id = 'shadow-guardian-injected-styles';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Space+Grotesk:wght@500;700&display=swap');

      /* Anti-Gravity Floating Animations */
      @keyframes shadowLevitate {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
      }

      @keyframes shadowPulseGlow {
        0%, 100% { box-shadow: 0 0 15px rgba(0, 245, 255, 0.3), inset 0 0 15px rgba(0, 245, 255, 0.1); }
        50% { box-shadow: 0 0 30px rgba(0, 245, 255, 0.6), inset 0 0 20px rgba(0, 245, 255, 0.25); }
      }

      @keyframes shadowCriticalPulse {
        0%, 100% { box-shadow: 0 0 15px rgba(239, 68, 68, 0.4), inset 0 0 10px rgba(239, 68, 68, 0.2); }
        50% { box-shadow: 0 0 35px rgba(239, 68, 68, 0.8), inset 0 0 20px rgba(239, 68, 68, 0.4); }
      }

      /* Floating Risk Pill above prompt */
      .shadow-risk-pill {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 6px 14px;
        border-radius: 20px;
        font-family: 'Space Grotesk', system-ui, sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.03em;
        text-transform: uppercase;
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 999990;
        cursor: pointer;
        user-select: none;
        margin-bottom: 8px;
        animation: shadowLevitate 3s ease-in-out infinite;
      }

      .shadow-risk-pill.clean {
        background: rgba(16, 185, 129, 0.15);
        border: 1px solid rgba(16, 185, 129, 0.4);
        color: #10B981;
      }

      .shadow-risk-pill.medium {
        background: rgba(245, 158, 11, 0.15);
        border: 1px solid rgba(245, 158, 11, 0.5);
        color: #F59E0B;
        animation: shadowLevitate 3s ease-in-out infinite, shadowPulseGlow 2s infinite;
      }

      .shadow-risk-pill.high,
      .shadow-risk-pill.critical {
        background: rgba(239, 68, 68, 0.18);
        border: 1px solid rgba(239, 68, 68, 0.6);
        color: #FF4D6D;
        animation: shadowLevitate 3s ease-in-out infinite, shadowCriticalPulse 1.5s infinite;
      }

      /* Modal Backdrop */
      .shadow-modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(6, 10, 20, 0.82);
        backdrop-filter: blur(12px);
        -webkit-backdrop-filter: blur(12px);
        z-index: 2147483640;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        opacity: 0;
        animation: shadowFadeIn 0.25s forwards cubic-bezier(0.4, 0, 0.2, 1);
      }

      @keyframes shadowFadeIn {
        to { opacity: 1; }
      }

      /* Cyber Modal Card */
      .shadow-modal-card {
        width: 100%;
        max-width: 540px;
        background: #0A0E1A;
        background: linear-gradient(135deg, rgba(14, 22, 40, 0.95) 0%, rgba(10, 14, 26, 0.98) 100%);
        border: 1px solid rgba(0, 245, 255, 0.3);
        border-radius: 18px;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 245, 255, 0.2);
        color: #F1F5F9;
        font-family: 'Space Grotesk', system-ui, sans-serif;
        padding: 26px;
        transform: translateY(20px) scale(0.97);
        animation: shadowCardEnter 0.3s forwards cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
        overflow: hidden;
      }

      @keyframes shadowCardEnter {
        to { transform: translateY(0px) scale(1); }
      }

      .shadow-modal-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 3px;
        background: linear-gradient(90deg, #00F5FF, #8B5CF6, #EF4444);
      }

      .shadow-modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 18px;
      }

      .shadow-modal-title-group {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .shadow-shield-icon {
        width: 38px;
        height: 38px;
        background: linear-gradient(135deg, #00F5FF 0%, #8B5CF6 100%);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        box-shadow: 0 0 20px rgba(0, 245, 255, 0.4);
      }

      .shadow-modal-title {
        font-size: 18px;
        font-weight: 700;
        color: #FFFFFF;
        letter-spacing: -0.01em;
      }

      .shadow-modal-sub {
        font-size: 11px;
        color: #94A3B8;
        font-family: 'JetBrains Mono', monospace;
        letter-spacing: 0.05em;
        text-transform: uppercase;
      }

      .shadow-risk-badge {
        padding: 5px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 700;
        font-family: 'JetBrains Mono', monospace;
      }

      .shadow-risk-badge.critical {
        background: rgba(239, 68, 68, 0.2);
        color: #FF4D6D;
        border: 1px solid rgba(239, 68, 68, 0.6);
      }

      .shadow-risk-badge.high {
        background: rgba(249, 115, 22, 0.2);
        color: #FB923C;
        border: 1px solid rgba(249, 115, 22, 0.6);
      }

      .shadow-risk-badge.medium {
        background: rgba(245, 158, 11, 0.2);
        color: #FBBF24;
        border: 1px solid rgba(245, 158, 11, 0.6);
      }

      .shadow-modal-body {
        margin-bottom: 22px;
      }

      .shadow-alert-banner {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.25);
        border-radius: 10px;
        padding: 12px 14px;
        font-size: 13px;
        line-height: 1.5;
        color: #FECDD3;
        margin-bottom: 16px;
      }

      .shadow-findings-list {
        max-height: 180px;
        overflow-y: auto;
        border-radius: 10px;
        background: rgba(10, 14, 26, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.07);
        padding: 8px;
        margin-bottom: 16px;
      }

      .shadow-finding-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        border-radius: 8px;
        background: rgba(255, 255, 255, 0.03);
        margin-bottom: 6px;
        border-left: 3px solid #00F5FF;
      }

      .shadow-finding-item:last-child {
        margin-bottom: 0;
      }

      .shadow-finding-name {
        font-size: 13px;
        font-weight: 600;
        color: #FFFFFF;
      }

      .shadow-finding-val {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        color: #00F5FF;
        background: rgba(0, 245, 255, 0.1);
        padding: 3px 8px;
        border-radius: 4px;
      }

      .shadow-modal-actions {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 10px;
      }

      .shadow-btn {
        padding: 12px 14px;
        border-radius: 10px;
        font-family: 'Space Grotesk', sans-serif;
        font-size: 12px;
        font-weight: 700;
        letter-spacing: 0.02em;
        cursor: pointer;
        border: none;
        outline: none;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
      }

      .shadow-btn-sub {
        font-size: 9px;
        font-weight: 500;
        opacity: 0.8;
      }

      .shadow-btn-block {
        background: linear-gradient(135deg, #EF4444 0%, #B91C1C 100%);
        color: #FFFFFF;
        box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
      }

      .shadow-btn-block:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(239, 68, 68, 0.5);
      }

      .shadow-btn-redact {
        background: linear-gradient(135deg, #00F5FF 0%, #0284C7 100%);
        color: #0A0E1A;
        box-shadow: 0 4px 15px rgba(0, 245, 255, 0.3);
      }

      .shadow-btn-redact:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(0, 245, 255, 0.5);
      }

      .shadow-btn-proceed {
        background: rgba(255, 255, 255, 0.06);
        color: #94A3B8;
        border: 1px solid rgba(255, 255, 255, 0.15);
      }

      .shadow-btn-proceed:hover {
        background: rgba(255, 255, 255, 0.12);
        color: #FFFFFF;
        transform: translateY(-2px);
      }

      /* Floating Toast Notification */
      .shadow-guardian-toast {
        position: fixed;
        bottom: 24px;
        right: 24px;
        background: rgba(10, 14, 26, 0.92);
        border: 1px solid rgba(0, 245, 255, 0.35);
        border-radius: 14px;
        padding: 14px 18px;
        color: #FFFFFF;
        font-family: 'Space Grotesk', system-ui, sans-serif;
        box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6), 0 0 25px rgba(0, 245, 255, 0.25);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        z-index: 2147483645;
        display: flex;
        align-items: center;
        gap: 14px;
        transform: translateY(20px);
        opacity: 0;
        animation: shadowToastIn 0.3s forwards cubic-bezier(0.34, 1.56, 0.64, 1);
      }

      @keyframes shadowToastIn {
        to { transform: translateY(0); opacity: 1; }
      }

      .shadow-toast-icon {
        font-size: 22px;
      }

      .shadow-toast-content {
        flex: 1;
      }

      .shadow-toast-title {
        font-size: 13px;
        font-weight: 700;
        color: #00F5FF;
      }

      .shadow-toast-msg {
        font-size: 11px;
        color: #94A3B8;
        margin-top: 2px;
      }

      .shadow-toast-close {
        background: transparent;
        border: none;
        color: #64748B;
        font-size: 18px;
        cursor: pointer;
        padding: 4px;
        border-radius: 6px;
      }

      .shadow-toast-close:hover {
        color: #FFFFFF;
      }
    `;

    document.head.appendChild(style);
  }

  // ─── Input Value Extraction & Mutation ─────────────────────────────────────

  /**
   * Retrieves prompt text from textarea or contenteditable element
   */
  function getInputText(el) {
    if (!el) return '';
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      return el.value || '';
    }
    // ContentEditable handling (ProseMirror, Quill, Slate, RichText)
    return el.innerText || el.textContent || '';
  }

  /**
   * Updates prompt text inside textarea or contenteditable element
   */
  function setInputText(el, newText) {
    if (!el) return;
    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      el.value = newText;
      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // ContentEditable
      el.focus();
      el.innerText = newText;
      el.dispatchEvent(new InputEvent('input', { bubbles: true, inputType: 'insertText', data: newText }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  // ─── Real-Time Input Evaluation ────────────────────────────────────────────

  function evaluateInput(el) {
    if (!el) return;

    // Check if domain is whitelisted
    const currentHost = window.location.host;
    if (activeSettings && activeSettings.whitelistedDomains) {
      if (activeSettings.whitelistedDomains.some((d) => currentHost.includes(d.trim()))) {
        removeRiskPill(el);
        return;
      }
    }

    // Check if protection is enabled
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

    // Run rules engine
    if (typeof PromptGuardianRules !== 'undefined') {
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
  }

  /**
   * Sends background service worker the evaluated risk metrics for badge update
   */
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
          if (chrome.runtime.lastError) {
            // Ignore background disconnection gracefully
          }
        });
      }
    } catch (_) {}
  }

  // ─── Inline Floating Risk Pill ─────────────────────────────────────────────

  function renderRiskPill(inputEl, result) {
    if (!result || result.riskLevel === 'CLEAN' || result.findings.length === 0) {
      removeRiskPill(inputEl);
      return;
    }

    let pill = document.getElementById('shadow-active-risk-pill');
    if (!pill) {
      pill = document.createElement('div');
      pill.id = 'shadow-active-risk-pill';
      pill.className = 'shadow-risk-pill';
      // Click on pill displays the full security alert modal
      pill.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        showInterceptionModal(result, inputEl);
      });
      // Attach above the input container
      const container = inputEl.parentElement || inputEl;
      container.insertBefore(pill, inputEl);
    }

    const levelClass = result.riskLevel.toLowerCase();
    pill.className = `shadow-risk-pill ${levelClass}`;

    const icon = result.riskLevel === 'CRITICAL' ? '⛔' : (result.riskLevel === 'HIGH' ? '🚨' : '⚠️');
    pill.innerHTML = `
      <span>${icon}</span>
      <span>${result.riskLevel} (${result.riskScore}/100): ${result.findings.length} Sensitive Item${result.findings.length > 1 ? 's' : ''} Detected</span>
    `;
  }

  function removeRiskPill(inputEl) {
    const pill = document.getElementById('shadow-active-risk-pill');
    if (pill) pill.remove();
  }

  // ─── Floating Toast Alerts ─────────────────────────────────────────────────

  function showToast(title, message, icon = '🛡️') {
    const existing = document.getElementById('shadow-toast-alert');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'shadow-toast-alert';
    toast.className = 'shadow-guardian-toast';
    toast.innerHTML = `
      <div class="shadow-toast-icon">${icon}</div>
      <div class="shadow-toast-content">
        <div class="shadow-toast-title">${title}</div>
        <div class="shadow-toast-msg">${message}</div>
      </div>
      <button class="shadow-toast-close" title="Dismiss">&times;</button>
    `;

    toast.querySelector('.shadow-toast-close').addEventListener('click', () => {
      toast.remove();
    });

    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast && toast.parentElement) {
        toast.remove();
      }
    }, 4500);
  }

  // ─── Interception Modal Dialog ─────────────────────────────────────────────

  function showInterceptionModal(result, inputEl) {
    // Remove any existing modal
    const existingBackdrop = document.getElementById('shadow-interception-modal-backdrop');
    if (existingBackdrop) existingBackdrop.remove();

    const backdrop = document.createElement('div');
    backdrop.id = 'shadow-interception-modal-backdrop';
    backdrop.className = 'shadow-modal-backdrop';

    const findingsHtml = result.findings.map((f) => `
      <div class="shadow-finding-item">
        <div>
          <div class="shadow-finding-name">${f.name}</div>
          <div style="font-size: 10px; color: #94A3B8;">Confidence: ${f.confidence}</div>
        </div>
        <div class="shadow-finding-val">${f.maskedValue}</div>
      </div>
    `).join('');

    const levelClass = result.riskLevel.toLowerCase();

    backdrop.innerHTML = `
      <div class="shadow-modal-card">
        <div class="shadow-modal-header">
          <div class="shadow-modal-title-group">
            <div class="shadow-shield-icon">🛡️</div>
            <div>
              <div class="shadow-modal-title">Prompt Security Interception</div>
              <div class="shadow-modal-sub">${PLATFORM_NAME} · Real-time Pre-Flight Inspection</div>
            </div>
          </div>
          <div class="shadow-risk-badge ${levelClass}">
            ${result.riskLevel} · ${result.riskScore}/100
          </div>
        </div>

        <div class="shadow-modal-body">
          <div class="shadow-alert-banner">
            <strong>⚠️ Potential Confidential Data Leak Prevented</strong><br>
            Shadow AI detected sensitive credentials, financial records, or PII in your prompt. 
            Choose an action before transmission to the AI server.
          </div>

          <div style="font-size: 11px; font-weight: 700; color: #94A3B8; text-transform: uppercase; margin-bottom: 6px; letter-spacing: 0.05em;">
            Flagged Elements (${result.findings.length})
          </div>

          <div class="shadow-findings-list">
            ${findingsHtml}
          </div>
        </div>

        <div class="shadow-modal-actions">
          <button class="shadow-btn shadow-btn-block" id="shadow-modal-btn-block">
            <span>⛔ Block Send</span>
            <span class="shadow-btn-sub">Cancel & Preserve</span>
          </button>
          <button class="shadow-btn shadow-btn-redact" id="shadow-modal-btn-redact">
            <span>⚡ Auto-Redact</span>
            <span class="shadow-btn-sub">Sanitize & Transmit</span>
          </button>
          <button class="shadow-btn shadow-btn-proceed" id="shadow-modal-btn-proceed">
            <span>⚠️ Proceed</span>
            <span class="shadow-btn-sub">Acknowledge Risk</span>
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    // 1. Action: BLOCK SEND
    document.getElementById('shadow-modal-btn-block').addEventListener('click', () => {
      backdrop.remove();
      logInterceptionAction('BLOCKED', result);
      showToast('Prompt Held Safely', 'Transmission was blocked. Your prompt was not sent to the AI server.', '⛔');
    });

    // 2. Action: AUTO-REDACT & SEND
    document.getElementById('shadow-modal-btn-redact').addEventListener('click', () => {
      backdrop.remove();
      const sanitized = result.redactedText;
      setInputText(inputEl, sanitized);
      logInterceptionAction('REDACTED', result);
      showToast('Auto-Redaction Applied', 'Sensitive tokens were masked. Transmitting sanitized prompt.', '⚡');

      // Trigger safe send
      setTimeout(() => {
        isBypassingSend = true;
        dispatchSend(inputEl);
      }, 100);
    });

    // 3. Action: PROCEED ANYWAY
    document.getElementById('shadow-modal-btn-proceed').addEventListener('click', () => {
      backdrop.remove();
      logInterceptionAction('BYPASSED', result);
      showToast('Risk Acknowledged', 'Audit log recorded bypass event. Prompt transmitted.', '⚠️');

      // Allow original send
      setTimeout(() => {
        isBypassingSend = true;
        dispatchSend(inputEl);
      }, 100);
    });
  }

  /**
   * Logs interception event through background service worker
   */
  function logInterceptionAction(actionTaken, result) {
    try {
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.id) {
        chrome.runtime.sendMessage({
          action: 'LOG_INTERCEPTION',
          payload: {
            platform: PLATFORM_NAME,
            riskLevel: result.riskLevel,
            riskScore: result.riskScore,
            actionTaken,
            dataType: result.findings.map((f) => f.name).join(', '),
            categories: Object.keys(result.categoryBreakdown).filter((k) => result.categoryBreakdown[k] > 0),
            categoryBreakdown: result.categoryBreakdown,
            findingCount: result.findings.length,
            summary: `${actionTaken} prompt on ${PLATFORM_NAME} containing ${result.findings.length} sensitive items.`
          }
        }, () => {
          if (chrome.runtime.lastError) {}
        });
      }
    } catch (_) {}
  }

  /**
   * Programmatically clicks the send button or submits the active form
   */
  function dispatchSend(inputEl) {
    try {
      // Find send button on page
      const sendBtn = findSendButton(inputEl);
      if (sendBtn) {
        sendBtn.click();
      } else {
        // Fallback: dispatch Enter keydown
        inputEl.dispatchEvent(new KeyboardEvent('keydown', {
          key: 'Enter',
          code: 'Enter',
          keyCode: 13,
          which: 13,
          bubbles: true,
          cancelable: true
        }));
      }
    } finally {
      setTimeout(() => {
        isBypassingSend = false;
      }, 500);
    }
  }

  // ─── Submit Interception Logic ─────────────────────────────────────────────

  /**
   * Identifies platform send buttons using targeted selectors
   */
  function findSendButton(inputEl) {
    const selectors = [
      // ChatGPT
      'button[data-testid="send-button"]',
      'button[aria-label="Send prompt"]',
      'button[aria-label="Send message"]',
      // Claude
      'button[aria-label="Send Message"]',
      'fieldset button:last-child',
      // Gemini
      'button[aria-label*="Send"]',
      'button.send-button',
      '.send-button-container button',
      // Copilot
      'button[aria-label="Submit"]',
      'button[title="Submit"]',
      // Perplexity
      'button[aria-label="Submit"]',
      'button[type="submit"]',
      // Generic
      'form button[type="submit"]'
    ];

    for (const sel of selectors) {
      const btn = document.querySelector(sel);
      if (btn && btn.offsetParent !== null) return btn;
    }
    return null;
  }

  /**
   * Intercepts Enter keydown and Submit button clicks
   */
  function handleSubmissionAttempt(e, inputEl) {
    if (isBypassingSend) return; // Legitimate bypass from modal

    // Check if domain is whitelisted or protection is turned off
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

    if (typeof PromptGuardianRules !== 'undefined') {
      const watchlist = (activeSettings && activeSettings.keywordWatchlist) || [];
      const categories = (activeSettings && activeSettings.categories) || {};
      const result = PromptGuardianRules.analyzePrompt(text, watchlist, categories);

      // Block if risk level is MEDIUM, HIGH, or CRITICAL
      if (result.riskLevel === 'MEDIUM' || result.riskLevel === 'HIGH' || result.riskLevel === 'CRITICAL') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        showInterceptionModal(result, inputEl);
        return false;
      }
    }
  }

  // ─── Input Hooking & Event Delegation ──────────────────────────────────────

  function hookInputElement(el) {
    if (!el || el.__SHADOW_GUARDIAN_HOOKED__) return;
    el.__SHADOW_GUARDIAN_HOOKED__ = true;
    activeInputElement = el;

    // Debounced input scanning (300ms)
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

    // Intercept Enter keydown
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        handleSubmissionAttempt(e, el);
      }
    }, true);
  }

  /**
   * Scans document for AI prompt input fields
   */
  function scanAndHookInputs() {
    const textareas = document.querySelectorAll('textarea');
    textareas.forEach(hookInputElement);

    const editables = document.querySelectorAll('[contenteditable="true"], [role="textbox"]');
    editables.forEach(hookInputElement);

    // Global click interceptor for Send buttons
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
  }

  // ─── MutationObserver for SPA Dynamic Rendering ───────────────────────────

  function initObserver() {
    injectGuardianStyles();
    scanAndHookInputs();

    const observer = new MutationObserver((mutations) => {
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

    observer.observe(document.body || document.documentElement, {
      childList: true,
      subtree: true
    });
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initObserver);
  } else {
    initObserver();
  }
})();
