/**
 * Shadow AI Prompt Guardian — Content Script (v4.0 "NEXUS")
 *
 * Futuristic browser extension for intercepting and inspecting AI prompt content.
 * Features:
 *   - Multi-layer interception (fetch, XHR, click, keydown, form, MutationObserver)
 *   - Auto-redact on resubmit (replaces sensitive text with safe placeholders)
 *   - Real-time live risk indicator (updates as you type)
 *   - Conversation history scanner (scans all messages in the chat)
 *   - Smart context-aware risk scoring
 *   - Color-coded text highlighting (no spell-check confusion)
 *   - Smart learning mode (learns from "This is safe" clicks)
 *   - API Key rotation links
 *
 * All detection runs client-side via detection-engine.js.
 */

(function () {
  'use strict';

  // ─── Main-world script injection ──────────────────────────────────────────
  // Content scripts run in an "isolated world" — they share the DOM but NOT
  // the JS environment. This means our fetch/XHR monkeypatches never intercept
  // the page's actual network requests. We inject a script into the page's
  // main world to handle fetch/XHR, and communicate via window.postMessage.
  function injectMainWorldScript() {
    try {
      var script = document.createElement('script');
      script.src = chrome.runtime.getURL('js/main-world-intercept.js');
      script.onload = function () { script.remove(); };
      (document.head || document.documentElement).appendChild(script);
    } catch (e) {
      console.warn('[SAPG] Could not inject main-world script:', e);
    }
  }

  // Listen for detection requests from the main-world interceptor
  function setupMainWorldBridge() {
    window.addEventListener('message', function (event) {
      if (event.source !== window) return;
      if (event.data && event.data.type === 'SAPG_CHECK_PROMPT') {
        var promptText = event.data.promptText;
        var requestId = event.data.requestId;
        var context = event.data.context || '';

        var targetOrigin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '*';
        if (!protectionEnabled || !promptText || promptText.length < 5) {
          window.postMessage({ type: 'SAPG_BLOCK_DECISION', requestId: requestId, shouldBlock: false }, targetOrigin);
          return;
        }

        var result = detect(promptText);
        if (result.shouldBlock) {
          lastBlockedPromptText = promptText;
          notifyBGBlock(result);
          try { recordBlock(result, promptText).catch(function () {}); } catch (_) {}
          showBanner(result.findings, result.riskScore, result.severity, result.explanations, result.bulkMessages || [], promptText);
          console.log('[SAPG] Blocked:', result.categories, 'riskScore:', result.riskScore, 'severity:', result.severity, context);
        } else {
          notifyBGClean(result);
        }
        window.postMessage({ type: 'SAPG_BLOCK_DECISION', requestId: requestId, shouldBlock: result.shouldBlock }, targetOrigin);
      }
    });
  }

  // ─── Global error suppression ────────────────────────────────────────────────
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

  // Override chrome.storage.local to catch ALL rejections
  if (typeof chrome !== 'undefined' && chrome && chrome.storage && chrome.storage.local) {
    try {
      const _sapr_origLocal = chrome.storage.local;
      chrome.storage.local = {
        get: function (keys, cb) {
          try {
            const result = _sapr_origLocal.get(keys, cb);
            if (result && typeof result.catch === 'function') result.catch(() => {});
            return result;
          } catch (_) {}
        },
        set: function (obj, cb) {
          try {
            const result = _sapr_origLocal.set(obj, cb);
            if (result && typeof result.catch === 'function') result.catch(() => {});
            return result;
          } catch (_) {}
        },
        remove: function (key, cb) {
          try {
            const result = _sapr_origLocal.remove(key, cb);
            if (result && typeof result.catch === 'function') result.catch(() => {});
            return result;
          } catch (_) {}
        }
      };
    } catch (_) {}
  }

  // ─── Storage keys ────────────────────────────────────────────────────────────
  var STORAGE = {
    enabled: 'sapg_protectionEnabled',
    threshold: 'sapg_sensitivityThreshold',
    entropy: 'sapg_enableEntropy',
    terms: 'sapg_confidentialTerms',
    log: 'sapg_blockedAttempts',
    whitelist: 'sapg_whitelist',
    learned: 'sapg_learnedPatterns',
    context: 'sapg_enableContextWindow',
    bulk: 'sapg_enableBulkDetection',
    obfuscation: 'sapg_enableObfuscationDetection',
    base64: 'sapg_enableBase64Scan',
    compliance: 'sapg_compliancePresets',
    customRegex: 'sapr_customRegex',
    apiKeys: 'sapg_enableApiKeyDetection',
    pii: 'sapg_enablePiiDetection',
    passwords: 'sapg_enablePasswordDetection',
    confidential: 'sapg_enableConfidentialDetection',
  };

  // ─── State ───────────────────────────────────────────────────────────────────
  var protectionEnabled = true;
  var sensitivityThreshold = 30;
  var enableEntropy = true;
  var enableContextWindow = true;
  var enableBulkDetection = true;
  var enableObfuscationDetection = true;
  var enableBase64Scan = true;
  var compliancePresets = [];
  var customRegex = [];
  var enableApiKeyDetection = true;
  var enablePiiDetection = true;
  var enablePasswordDetection = true;
  var enableConfidentialDetection = true;
  var confidentialTerms = [];
  var blockedAttempts = [];
  var whitelist = [];
  var learnedPatterns = [];
  var lastRiskScore = 0;
  var MAX_LOG_ENTRIES = 50;
  // Gate: live risk / inline highlight only run AFTER the user has typed something
  var userHasInteracted = false;
  // SENTINEL DevShield: Tab-scoped ephemeral memory vault for round-trip code restoration
  var tabDevVault = (typeof SENTINEL_SYNTHETIC !== 'undefined' && SENTINEL_SYNTHETIC.createDevVault)
    ? SENTINEL_SYNTHETIC.createDevVault()
    : null;

  // ─── Safe storage helpers ────────────────────────────────────────────────────
  function safeGet(keys, cb) {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
    try {
      chrome.storage.local.get(keys, function (result) {
        try { cb(result); } catch (_) {}
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

  // ─── Load persisted settings ─────────────────────────────────────────────────
  function loadSettings() {
    return new Promise(function (resolve) {
      try {
        if (typeof chrome === 'undefined' || !chrome.storage) {
          protectionEnabled = localStorage.getItem(STORAGE.enabled) !== 'false';
          sensitivityThreshold = parseInt(localStorage.getItem(STORAGE.threshold) || '30', 10);
          enableEntropy = localStorage.getItem(STORAGE.entropy) !== 'false';
          enableContextWindow = localStorage.getItem(STORAGE.context) !== 'false';
          enableBulkDetection = localStorage.getItem(STORAGE.bulk) !== 'false';
          enableObfuscationDetection = localStorage.getItem(STORAGE.obfuscation) !== 'false';
          enableBase64Scan = localStorage.getItem(STORAGE.base64) !== 'false';
          enableApiKeyDetection = localStorage.getItem(STORAGE.apiKeys) !== 'false';
          enablePiiDetection = localStorage.getItem(STORAGE.pii) !== 'false';
          enablePasswordDetection = localStorage.getItem(STORAGE.passwords) !== 'false';
          enableConfidentialDetection = localStorage.getItem(STORAGE.confidential) !== 'false';
          try { compliancePresets = JSON.parse(localStorage.getItem(STORAGE.compliance)) || []; } catch (_) { compliancePresets = []; }
          try { customRegex = JSON.parse(localStorage.getItem(STORAGE.customRegex)) || []; } catch (_) { customRegex = []; }
          try { confidentialTerms = JSON.parse(localStorage.getItem(STORAGE.terms)) || []; } catch (_) { confidentialTerms = []; }
          try { blockedAttempts = JSON.parse(localStorage.getItem(STORAGE.log)) || []; } catch (_) { blockedAttempts = []; }
          try { whitelist = JSON.parse(localStorage.getItem(STORAGE.whitelist)) || []; } catch (_) { whitelist = []; }
          try { learnedPatterns = JSON.parse(localStorage.getItem(STORAGE.learned)) || []; } catch (_) { learnedPatterns = []; }
          resolve();
          return;
        }
        safeGet(Object.values(STORAGE).concat(['sapg_audit_log']), function (result) {
          try {
            protectionEnabled = result[STORAGE.enabled] !== false;
            sensitivityThreshold = result[STORAGE.threshold] != null ? result[STORAGE.threshold] : 30;
            enableEntropy = result[STORAGE.entropy] !== false;
            enableContextWindow = result[STORAGE.context] !== false;
            enableBulkDetection = result[STORAGE.bulk] !== false;
            enableObfuscationDetection = result[STORAGE.obfuscation] !== false;
            enableBase64Scan = result[STORAGE.base64] !== false;
            enableApiKeyDetection = result[STORAGE.apiKeys] !== false;
            enablePiiDetection = result[STORAGE.pii] !== false;
            enablePasswordDetection = result[STORAGE.passwords] !== false;
            enableConfidentialDetection = result[STORAGE.confidential] !== false;
            compliancePresets = result[STORAGE.compliance] || [];
            customRegex = result[STORAGE.customRegex] || [];
            confidentialTerms = result[STORAGE.terms] || [];
            blockedAttempts = (result[STORAGE.log] && result[STORAGE.log].length)
              ? result[STORAGE.log]
              : (result.sapg_audit_log || []);
            whitelist = result[STORAGE.whitelist] || [];
            learnedPatterns = result[STORAGE.learned] || [];
          } catch (_) {}
          resolve();
        });
      } catch (_) {
        resolve();
      }
    });
  }

  // Real-time synchronization with options & popup changes across all open tabs
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    chrome.storage.onChanged.addListener(function (changes, area) {
      if (area !== 'local') return;
      if (changes[STORAGE.enabled]) {
        protectionEnabled = changes[STORAGE.enabled].newValue !== false;
        var origin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '*';
        window.postMessage({ type: 'SAPG_SET_PROTECTION', enabled: protectionEnabled }, origin);
      }
      if (changes[STORAGE.threshold]) {
        sensitivityThreshold = changes[STORAGE.threshold].newValue != null ? changes[STORAGE.threshold].newValue : 30;
      }
      if (changes[STORAGE.entropy]) {
        enableEntropy = changes[STORAGE.entropy].newValue !== false;
      }
      if (changes[STORAGE.context]) {
        enableContextWindow = changes[STORAGE.context].newValue !== false;
      }
      if (changes[STORAGE.bulk]) {
        enableBulkDetection = changes[STORAGE.bulk].newValue !== false;
      }
      if (changes[STORAGE.obfuscation]) {
        enableObfuscationDetection = changes[STORAGE.obfuscation].newValue !== false;
      }
      if (changes[STORAGE.base64]) {
        enableBase64Scan = changes[STORAGE.base64].newValue !== false;
      }
      if (changes[STORAGE.compliance]) {
        compliancePresets = changes[STORAGE.compliance].newValue || [];
      }
      if (changes[STORAGE.customRegex]) {
        customRegex = changes[STORAGE.customRegex].newValue || [];
      }
      if (changes[STORAGE.apiKeys]) {
        enableApiKeyDetection = changes[STORAGE.apiKeys].newValue !== false;
      }
      if (changes[STORAGE.pii]) {
        enablePiiDetection = changes[STORAGE.pii].newValue !== false;
      }
      if (changes[STORAGE.passwords]) {
        enablePasswordDetection = changes[STORAGE.passwords].newValue !== false;
      }
      if (changes[STORAGE.confidential]) {
        enableConfidentialDetection = changes[STORAGE.confidential].newValue !== false;
      }
      if (changes[STORAGE.terms]) {
        confidentialTerms = changes[STORAGE.terms].newValue || [];
      }
      if (changes[STORAGE.whitelist]) {
        whitelist = changes[STORAGE.whitelist].newValue || [];
      }
      if (changes[STORAGE.learned]) {
        learnedPatterns = changes[STORAGE.learned].newValue || [];
      }
      if (changes[STORAGE.log]) {
        blockedAttempts = changes[STORAGE.log].newValue || [];
        updateInPagePopup();
      }
      if (changes.sapg_audit_log && !changes[STORAGE.log]) {
        blockedAttempts = changes.sapg_audit_log.newValue || [];
        updateInPagePopup();
      }
    });
  }

  function safeRemove(key, cb) {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      if (cb) { try { cb(); } catch (_) {} }
      return;
    }
    try {
      chrome.storage.local.remove(key, function () {
        try { if (cb) cb(); } catch (_) {}
      });
    } catch (_) {}
  }

  function saveSettings() {
    safeSet({
      [STORAGE.enabled]: protectionEnabled,
      [STORAGE.threshold]: sensitivityThreshold,
      [STORAGE.entropy]: enableEntropy,
      [STORAGE.terms]: confidentialTerms,
      [STORAGE.whitelist]: whitelist,
      [STORAGE.learned]: learnedPatterns,
    });
  }

  // ─── URL Guard (same as main-world) ───────────────────────────────────────────────────
  var AI_CHAT_URL_PATTERNS = [
    /\/backend-api\/conversation/, /\/api\/chat\/completions/, /\/v1\/chat\/completions/,
    /\/v1\/messages/, /\/chat\/completions/, /\/completions/,
    /api\.anthropic\.com/, /generativelanguage\.googleapis\.com/,
    /\/api\/generate/, /\/ask/, /\/chat\/send/, /\/coral\/create/, /\/chat\/new/,
  ];
  function isAiChatUrl(url) {
    if (!url) return false;
    for (var i = 0; i < AI_CHAT_URL_PATTERNS.length; i++) {
      if (AI_CHAT_URL_PATTERNS[i].test(url)) return true;
    }
    return false;
  }

  // ─── Prompt text extraction ────────────────────────────────────────────────────
  function extractPromptFromBody(body) {
    if (!body || typeof body !== 'string' || body.length === 0) return null;
    body = body.trim();
    if (body.length === 0) return null;

    // If it's not JSON:
    if (!body.startsWith('{') && !body.startsWith('[')) {
      if (body.length >= 20 && isHumanText(body)) return body;
      return null;
    }

    try {
      var data = JSON.parse(body);
      // OpenAI / Anthropic messages array format
      if (data.messages && Array.isArray(data.messages) && data.messages.length > 0) {
        var lastMsg = data.messages[data.messages.length - 1];
        if (lastMsg && lastMsg.role && lastMsg.role !== 'user') return null;
        if (lastMsg && typeof lastMsg.content === 'string' && lastMsg.content.length > 0) return lastMsg.content.trim();
        if (lastMsg && typeof lastMsg.text === 'string' && lastMsg.text.length > 0) return lastMsg.text.trim();
        if (lastMsg && Array.isArray(lastMsg.content)) {
          var extractedText = lastMsg.content.map(function (c) {
            if (typeof c === 'string') return c;
            if (c && typeof c.text === 'string') return c.text;
            return '';
          }).filter(Boolean).join('\n').trim();
          if (extractedText.length > 0) return extractedText;
        }
        if (lastMsg && lastMsg.content && Array.isArray(lastMsg.content.parts)) {
          var extractedParts = lastMsg.content.parts.map(function (p) {
            return typeof p === 'string' ? p : (p && p.text ? p.text : '');
          }).filter(Boolean).join('\n').trim();
          if (extractedParts.length > 0) return extractedParts;
        }
      }
      // Gemini format
      if (data.contents && Array.isArray(data.contents) && data.contents.length > 0) {
        var lastContent = data.contents[data.contents.length - 1];
        if (lastContent && lastContent.role && lastContent.role !== 'user') return null;
        var parts = lastContent && lastContent.parts;
        if (Array.isArray(parts)) {
          var geminiText = parts.map(function (p) {
            return typeof p === 'string' ? p : (p && p.text ? p.text : '');
          }).filter(Boolean).join('\n').trim();
          if (geminiText.length > 0) return geminiText;
        }
      }
      // Anthropic / System + Prompt
      if (data.system && typeof data.system === 'string') {
        var p = (data.prompt && typeof data.prompt === 'string') ? data.prompt : '';
        return (data.system + ' ' + p).trim();
      }
      // Generic formats
      if (data.query && typeof data.query === 'string' && data.query.length > 0) return data.query.trim();
      if (data.message && typeof data.message === 'string' && data.message.length > 0) return data.message.trim();
      if (data.prompt && typeof data.prompt === 'string' && data.prompt.length > 0) return data.prompt.trim();
      return null;
    } catch (_) {
      if (body.length >= 20 && isHumanText(body)) return body;
      return null;
    }
  }

  function isHumanText(text) {
    if (!text || text.length < 10) return false;
    if (/^[A-Za-z0-9+/=]{30,}$/.test(text)) return false;  // pure base64/token blob
    if (/^eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(text)) return false;  // JWT
    return /[\s.,!?;:']/.test(text);  // human text has spaces / punctuation
  }

  function extractPromptFromActiveElement() {
    var el = getActivePromptElement();
    if (!el && typeof document !== 'undefined') {
      el = document.activeElement;
    }
    if (!el) return null;

    if (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') {
      var val = el.value ? el.value.trim() : '';
      if (val) return val;
    }

    if (el.isContentEditable || el.getAttribute('contenteditable') === 'true' || el.classList.contains('ProseMirror')) {
      var txt = el.innerText ? el.innerText.trim() : (el.textContent ? el.textContent.trim() : '');
      if (txt) return txt;
    }

    // Fallback: check standard editor elements on page if focused element is a container/button
    if (typeof document !== 'undefined') {
      var fallback = document.querySelector('#prompt-textarea, textarea, .ProseMirror, [contenteditable="true"]');
      if (fallback) {
        if (fallback.tagName === 'TEXTAREA' || fallback.tagName === 'INPUT') {
          var v = fallback.value ? fallback.value.trim() : '';
          if (v) return v;
        }
        var t = fallback.innerText ? fallback.innerText.trim() : (fallback.textContent ? fallback.textContent.trim() : '');
        if (t) return t;
      }
    }

    return null;
  }

  // ─── Detection ───────────────────────────────────────────────────────────────
  function detect(text) {
    if (typeof analyzePrompt !== 'undefined') {
      return analyzePrompt(text, {
        sensitivityThreshold: sensitivityThreshold,
        confidentialTerms: confidentialTerms.length > 0 ? confidentialTerms : undefined,
        enableEntropyDetection: enableEntropy,
        enableContextWindow: enableContextWindow,
        enableBulkDetection: enableBulkDetection,
        enableObfuscationDetection: enableObfuscationDetection,
        enableBase64Scan: enableBase64Scan,
        compliancePresets: compliancePresets,
        customRegex: customRegex,
        enableApiKeyDetection: enableApiKeyDetection,
        enablePiiDetection: enablePiiDetection,
        enablePasswordDetection: enablePasswordDetection,
        enableConfidentialDetection: enableConfidentialDetection,
      });
    }
    return { findings: [], riskScore: 0, shouldBlock: false, categories: [], context: 'clean', severity: 'info', explanations: [] };
  }

  // ─── Background SW bridge & Persistent Storage ───────────────────────────
  function recordBlock(result, promptText) {
    return new Promise(function (resolve) {
      try {
        var host = 'ChatGPT';
        try {
          if (typeof window !== 'undefined' && window.location && window.location.hostname) {
            host = window.location.hostname.replace(/^www\./, '');
          }
        } catch (_) {}

        var entry = {
          timestamp: new Date().toISOString(),
          categories: result.categories || [],
          riskScore: result.riskScore || 0,
          severity: result.severity || 'info',
          hasCritical: result.hasCritical || false,
          findingCount: (result.findings || []).length,
          maskedPreviews: (result.findings || []).slice(0, 3).map(function (f) { return f.matchMasked || ''; }),
          bulkMessages: result.bulkMessages || [],
          platform: host,
        };

        // Update in-memory blocked attempts array for tab UI
        blockedAttempts.unshift(entry);
        if (blockedAttempts.length > MAX_LOG_ENTRIES) blockedAttempts.splice(MAX_LOG_ENTRIES);
        resolve();
      } catch (_) {
        resolve();
      }
    });
  }

  function notifyBGBlock(result) {
    try {
      var host = 'ChatGPT';
      try {
        if (typeof window !== 'undefined' && window.location && window.location.hostname) {
          host = window.location.hostname.replace(/^www\./, '');
        }
      } catch (_) {}

      chrome.runtime.sendMessage({
        type: 'SAPG_BLOCK_OCCURRED',
        result: {
          categories: result.categories || [],
          riskScore: result.riskScore || 0,
          severity: result.severity || 'info',
          hasCritical: result.hasCritical || false,
          findings: result.findings || [],
          bulkMessages: result.bulkMessages || [],
        },
        platform: host,
      }, function () {
        if (chrome.runtime && chrome.runtime.lastError) {} // clean error suppression
      });
    } catch (_) {}
  }

  function notifyBGClean(result) {
    try {
      safeGet(['sapg_session_metrics'], function (r) {
        var metrics = (r && r.sapg_session_metrics) ? r.sapg_session_metrics : {
          promptsChecked: 0,
          promptsBlocked: 0,
          riskHistory: [],
          exposureScore: 0,
          startTime: Date.now(),
        };
        metrics.promptsChecked = (metrics.promptsChecked || 0) + 1;
        safeSet({ sapg_session_metrics: metrics });
      });
      chrome.runtime.sendMessage({ type: 'SAPG_CLEAN_PROMPT', result: { riskScore: result.riskScore || 0 } }, function () {
        if (chrome.runtime && chrome.runtime.lastError) {}
      });
    } catch (_) {}
  }

  // ─── Blocking decision (Synchronous & Async) ───────────────────────────
  var lastBlockedPromptText = '';

  function checkAndBlockSync(text, context) {
    if (!protectionEnabled || !text || text.length < 5) return false;
    var result = detect(text);
    if (!result.shouldBlock) {
      notifyBGClean(result);
      return false;
    }
    lastBlockedPromptText = text;
    notifyBGBlock(result);
    try { recordBlock(result, text).catch(function () {}); } catch (_) {}
    showBanner(result.findings, result.riskScore, result.severity, result.explanations, result.bulkMessages || [], text);
    console.log('[SENTINEL] Blocked (sync):', result.categories, 'risk:', result.riskScore, 'severity:', result.severity, context || '');
    return true;
  }

  async function checkAndBlock(text, context) {
    return checkAndBlockSync(text, context);
  }

  // ─── SENTINEL Enterprise Modal Card (Professional Security Dialog) ──────────
  var bannerEl = null;
  let lastPromptElement = null;

  function buildBannerUI() {
    if (bannerEl) return bannerEl;

    // Create backdrop if not already created
    var backdropEl = document.getElementById('sapg-modal-backdrop');
    if (!backdropEl && typeof document !== 'undefined' && document.body) {
      backdropEl = document.createElement('div');
      backdropEl.id = 'sapg-modal-backdrop';
      backdropEl.className = 'sapg-backdrop';
      backdropEl.setAttribute('aria-hidden', 'true');
      document.body.appendChild(backdropEl);
      backdropEl.onclick = function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        dismissBanner();
        return false;
      };
    }

    bannerEl = document.createElement('div');
    bannerEl.id = 'sapg-warning-banner';
    bannerEl.setAttribute('role', 'dialog');
    bannerEl.setAttribute('aria-modal', 'true');
    bannerEl.innerHTML = [
      '<div id="sapg-banner-header">',
      '  <div class="sapg-banner-left">',
      '    <div class="sapg-shield-icon" id="sapg-shield-icon">',
      '      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><rect x="9" y="11" width="6" height="5" rx="1"/><path d="M10 11V9a2 2 0 0 1 4 0v2"/></svg>',
      '    </div>',
      '    <div class="sapg-title-group">',
      '      <div class="sapg-title-main">SENTINEL Security Guard</div>',
      '      <div class="sapg-title-sub" id="sapg-title-sub">Sensitive content blocked on-device before transmission</div>',
      '    </div>',
      '  </div>',
      '  <div class="sapg-banner-right">',
      '    <span class="sapg-severity-badge" id="sapr-severity-badge"><span class="sapg-badge-dot"></span>CRITICAL RISK</span>',
      '    <button class="sapg-close-btn" id="sapr-banner-close" title="Dismiss" aria-label="Close">✕</button>',
      '  </div>',
      '</div>',
      '<div id="sapr-banner-body">',
      '  <div class="sapg-alert-summary">',
      '    <div id="sapr-banner-message"></div>',
      '    <div id="sapr-banner-chips"></div>',
      '  </div>',
      '  <div class="sapg-findings-inspector-card" id="sapr-findings-card">',
      '    <div class="sapg-inspector-header">',
      '      <div class="sapg-inspector-title">',
      '        <span>🛡️ Security Violations Breakdown</span>',
      '      </div>',
      '      <span class="sapg-inspector-count-badge" id="sapr-findings-count-badge">0 issues</span>',
      '    </div>',
      '    <div class="sapg-findings-list" id="sapr-findings-list"></div>',
      '  </div>',
      '  <div class="sapg-raw-drawer-container" id="sapr-raw-drawer-container">',
      '    <button class="sapg-raw-toggle-btn" id="sapr-raw-toggle-btn" type="button">',
      '      <span class="sapg-drawer-arrow" id="sapr-drawer-arrow">▶</span>',
      '      <span id="sapr-drawer-toggle-text">Show Full Intercepted Context</span>',
      '    </button>',
      '    <div id="sapr-payload-preview-box" class="sapg-payload-preview-card" style="display:none;">',
      '      <div class="payload-preview-header">',
      '        <span class="payload-preview-title">Raw Text Context (Masked)</span>',
      '        <span class="payload-preview-badge">Client-Side Intercept</span>',
      '      </div>',
      '      <pre id="sapr-payload-snippet" class="payload-code-block"></pre>',
      '    </div>',
      '  </div>',
      '</div>',
      '<div id="sapr-risk-meter" style="display:none;">',
      '  <div class="meter-label-group">',
      '    <span class="meter-title">Threat Exposure</span>',
      '    <span class="meter-status" id="sapr-meter-status">High Risk</span>',
      '  </div>',
      '  <div class="meter-bar-track"><div class="meter-bar-fill" id="sapr-risk-bar"></div></div>',
      '  <span class="meter-score-badge" id="sapr-risk-value">0</span>',
      '</div>',
      '<div id="sapr-banner-actions">',
      '  <div class="sapg-actions-primary-row">',
      '    <button id="sapr-btn-redact" class="sapg-btn-primary" title="Replace sensitive data with safe placeholders and send">🛡️ Auto-Redact &amp; Proceed</button>',
      '    <button id="sapr-btn-mock" class="sapg-btn-secondary" title="Replace with syntactically valid mock tokens for code debugging">🎭 DevShield Mock</button>',
      '    <button id="sapr-btn-resubmit" class="sapg-btn-tertiary" title="Fix manually in prompt">✏️ Edit Prompt</button>',
      '    <button id="sapr-btn-cancel" class="sapr-btn-cancel btn-cancel sapg-btn-ghost" title="Cancel prompt submission">✕ Cancel</button>',
      '  </div>',
      '</div>',
      '<div id="sapr-rotation-links"></div>',
    ].join('');

    lastPromptElement = getActivePromptElement();
    if (typeof document !== 'undefined' && document.body) {
      document.body.appendChild(bannerEl);
    }

    // Event delegation on banner for robust interception and QA compliance
    bannerEl.addEventListener('click', function (e) {
      var target = e.target;
      if (!target) return;
      if (target.id === 'sapr-btn-cancel' || target.closest('#sapr-btn-cancel') || target.classList.contains('sapr-btn-cancel') || target.classList.contains('btn-cancel')) {
        if (e.preventDefault) e.preventDefault();
        if (e.stopPropagation) e.stopPropagation();
        dismissBanner();
      }
    });

    // Secure direct event listeners for guaranteed execution
    var closeBtn = bannerEl.querySelector('#sapr-banner-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        dismissBanner();
      });
    }

    var cancelBtn = bannerEl.querySelector('#sapr-btn-cancel');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        dismissBanner();
      });
    }

    var redactBtn = bannerEl.querySelector('#sapr-btn-redact');
    if (redactBtn) {
      redactBtn.addEventListener('click', function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        autoRedactAndResubmit();
      });
    }

    var mockBtn = bannerEl.querySelector('#sapr-btn-mock');
    if (mockBtn) {
      mockBtn.addEventListener('click', function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        autoMockAndResubmit();
      });
    }

    var resubmitBtn = bannerEl.querySelector('#sapr-btn-resubmit');
    if (resubmitBtn) {
      resubmitBtn.addEventListener('click', function (e) {
        if (e) { e.preventDefault(); e.stopPropagation(); }
        dismissBanner();
      });
    }

    // Escape key dismissal
    if (typeof window !== 'undefined' && !window._sapg_escape_attached && typeof document !== 'undefined') {
      window._sapg_escape_attached = true;
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && bannerEl && bannerEl.classList.contains('visible')) {
          dismissBanner();
        }
      });
    }

    return bannerEl;
  }

  function showBanner(findings, riskScore, severity, explanations, bulkMessages, rawPromptText) {
    lastPromptElement = getActivePromptElement();
    buildBannerUI();
    var chipsEl = document.getElementById('sapr-banner-chips');
    var msgEl = document.getElementById('sapr-banner-message');
    var meterEl = document.getElementById('sapr-risk-meter');
    var barEl = document.getElementById('sapr-risk-bar');
    var valEl = document.getElementById('sapr-risk-value');
    var rotationEl = document.getElementById('sapr-rotation-links');
    var shieldEl = document.getElementById('sapg-shield-icon');
    var titleSubEl = document.getElementById('sapg-title-sub');
    var badgeEl = document.getElementById('sapr-severity-badge');
    var payloadBox = document.getElementById('sapr-payload-preview-box');
    var payloadSnippet = document.getElementById('sapr-payload-snippet');
    var findingsListEl = document.getElementById('sapr-findings-list');
    var countBadgeEl = document.getElementById('sapr-findings-count-badge');
    var rawToggleBtn = document.getElementById('sapr-raw-toggle-btn');
    var drawerArrow = document.getElementById('sapr-drawer-arrow');
    var drawerText = document.getElementById('sapr-drawer-toggle-text');
    var meterStatusEl = document.getElementById('sapr-meter-status');

    // ── Apply severity class to banner ─────────────────────────────────────
    bannerEl.className = 'severity-' + severity;
    if (shieldEl) {
      shieldEl.className = 'sapg-shield-icon ' + severity;
    }
    if (titleSubEl) {
      var threatWord = findings.length === 1 ? 'threat' : 'threats';
      titleSubEl.textContent = findings.length + ' critical ' + threatWord + ' intercepted locally before dispatch';
    }
    if (badgeEl) {
      var badgeText = severity === 'critical' ? 'CRITICAL RISK' : severity === 'warning' ? 'POTENTIAL RISK' : 'ADVISORY';
      badgeEl.innerHTML = '<span class="sapg-badge-dot"></span>' + badgeText;
      badgeEl.className = 'sapg-severity-badge ' + severity;
    }

    // ── Category chips ─────────────────────────────────────────────────────
    var categories = [];
    findings.forEach(function (f) {
      if (categories.indexOf(f.category) === -1) categories.push(f.category);
    });
    var categoryLabels = {
      api_key:      '🔑 API Key / Secret',
      password:     '🔒 Credential',
      pii:          '👤 PII / Personal Data',
      confidential: '📋 Confidential',
      company:      '🏢 Company Data',
    };
    var categoryColors = {
      api_key: '#f43f5e', password: '#f59e0b', pii: '#818cf8',
      confidential: '#34d399', company: '#a78bfa',
    };
    if (chipsEl) {
      chipsEl.innerHTML = categories.map(function (cat) {
        var color = categoryColors[cat] || '#94a3b8';
        var label = categoryLabels[cat] || cat;
        return '<span class="sapk-category-chip" data-cat="' + cat + '"' +
          ' style="color:' + color + ';border-color:' + color + '60;">' + label + '</span>';
      }).join('');
      chipsEl.querySelectorAll('.sapk-category-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
          showExplanationPanel(chip.dataset.cat, findings, explanations);
        });
      });
    }

    // ── Banner message (bulk-aware) ────────────────────────────────────────────
    var sensitive = categories.indexOf('api_key') !== -1 || categories.indexOf('password') !== -1;
    var issueCount = findings.filter(function(f) { return !f.isBulk; }).length;
    var baseMsg = issueCount + ' detected issue' + (issueCount !== 1 ? 's' : '') + '. ' +
      (sensitive
        ? 'Sending secrets is dangerous — use “Auto-Redact” to replace them safely.'
        : 'Review and remove highlighted content before resubmitting.');

    if (msgEl) {
      if (bulkMessages && bulkMessages.length > 0) {
        msgEl.innerHTML = bulkMessages.map(function(m) {
          return '<div style="font-weight:700;margin-bottom:4px;">📊 ' + escapeHtml(m) + '</div>';
        }).join('') + '<div style="opacity:0.9;font-size:12px;">' + baseMsg + '</div>';
      } else {
        msgEl.textContent = baseMsg;
      }
    }

    // ── Helper for clean masked pills ──────────────────────────────────────────
    var formatMaskPill = function(match) {
      if (!match) return '[REDACTED]';
      var str = String(match).trim();
      if (str.length <= 8) return '••••••••';
      if (str.includes('@')) {
        var parts = str.split('@');
        var u = parts[0];
        var d = parts[1] || '';
        return (u.length > 3 ? u.slice(0, 3) + '•••' : '•••') + '@' + d;
      }
      if (str.startsWith('http://') || str.startsWith('https://')) {
        try {
          var urlObj = new URL(str);
          return urlObj.protocol + '//' + urlObj.hostname;
        } catch (_) {}
      }
      var pfx = str.slice(0, 4);
      var sfx = str.length >= 10 ? str.slice(-3) : '';
      return pfx + '••••' + sfx;
    };

    // ── Structured Security Violations Inspector ───────────────────────────────
    if (countBadgeEl) {
      countBadgeEl.textContent = findings.length + ' issue' + (findings.length !== 1 ? 's' : '');
    }

    if (findingsListEl) {
      var catMeta = {
        api_key:      { icon: '🔑', label: 'API Key', badgeCls: 'badge-critical', fallbackDesc: 'Cryptographic API credential detected.' },
        password:     { icon: '🔒', label: 'Credential', badgeCls: 'badge-critical', fallbackDesc: 'Plaintext authentication secret detected.' },
        pii:          { icon: '👤', label: 'PII / Identity', badgeCls: 'badge-warning', fallbackDesc: 'Personal data subject to privacy regulations.' },
        confidential: { icon: '📋', label: 'Confidential', badgeCls: 'badge-warning', fallbackDesc: 'Internal corporate codename or restricted term.' },
        company:      { icon: '🏢', label: 'Internal Domain', badgeCls: 'badge-info', fallbackDesc: 'Internal network or proprietary host address.' },
      };

      findingsListEl.innerHTML = findings.map(function(f) {
        if (f.isBulk) {
          return [
            '<div class="sapg-threat-item">',
            '  <div class="sapg-threat-icon-cell">📊</div>',
            '  <div class="sapg-threat-info">',
            '    <div class="sapg-threat-top-row">',
            '      <span class="sapg-threat-name">Bulk Data Exposure</span>',
            '      <span class="sapg-threat-cat badge-critical">HIGH VOLUME</span>',
            '    </div>',
            '    <div class="sapg-threat-desc">' + escapeHtml(f.bulkMessage || 'Mass data dump detected exceeding safety thresholds.') + '</div>',
            '  </div>',
            '</div>'
          ].join('');
        }

        var meta = catMeta[f.category] || { icon: '⚠️', label: f.category || 'Security Alert', badgeCls: 'badge-warning', fallbackDesc: 'Sensitive data pattern detected.' };
        var name = f.name || meta.label;
        var desc = f.explanation || meta.fallbackDesc;
        var preview = formatMaskPill(f.match);

        return [
          '<div class="sapg-threat-item">',
          '  <div class="sapg-threat-icon-cell">' + meta.icon + '</div>',
          '  <div class="sapg-threat-info">',
          '    <div class="sapg-threat-top-row">',
          '      <span class="sapg-threat-name">' + escapeHtml(name) + '</span>',
          '      <span class="sapg-threat-cat ' + meta.badgeCls + '">' + meta.label + '</span>',
          '    </div>',
          '    <div class="sapg-threat-desc">' + escapeHtml(desc) + '</div>',
          '  </div>',
          '  <div class="sapg-threat-preview-cell">',
          '    <span class="sapg-threat-pill" title="Protected Token Preview">' + escapeHtml(preview) + '</span>',
          '  </div>',
          '</div>'
        ].join('');
      }).join('');
    }

    // ── Collapsible Raw Context Drawer ─────────────────────────────────────────
    var previewText = rawPromptText || lastBlockedPromptText;
    if (!previewText) {
      var activeEl = lastPromptElement || getActivePromptElement();
      if (activeEl) previewText = activeEl.value || activeEl.innerText || '';
    }

    if (rawToggleBtn && payloadBox) {
      payloadBox.style.display = 'none';
      if (drawerArrow) drawerArrow.classList.remove('open');
      if (drawerText) drawerText.textContent = 'Show Full Intercepted Context';

      if (!rawToggleBtn._sapg_attached) {
        rawToggleBtn._sapg_attached = true;
        rawToggleBtn.onclick = function(e) {
          if (e) { e.preventDefault(); e.stopPropagation(); }
          var isOpen = payloadBox.style.display === 'block';
          if (isOpen) {
            payloadBox.style.display = 'none';
            if (drawerArrow) drawerArrow.classList.remove('open');
            if (drawerText) drawerText.textContent = 'Show Full Intercepted Context';
          } else {
            payloadBox.style.display = 'block';
            if (drawerArrow) drawerArrow.classList.add('open');
            if (drawerText) drawerText.textContent = 'Hide Intercepted Context';
          }
          return false;
        };
      }
    }

    if (previewText && previewText.length > 5 && payloadSnippet) {
      var maskedSnippet = previewText;
      if (findings && findings.length > 0) {
        findings.forEach(function (f) {
          if (f.match && maskedSnippet.includes(f.match)) {
            var sleekMask = formatMaskPill(f.match);
            maskedSnippet = maskedSnippet.split(f.match).join(sleekMask);
          }
        });
      }
      if (maskedSnippet.length > 600) {
        maskedSnippet = maskedSnippet.slice(0, 600) + '\n\n… [TRUNCATED FOR DISPLAY]';
      }
      payloadSnippet.textContent = maskedSnippet;
    }

    // ── Executive Risk Meter ───────────────────────────────────────────────────
    if (riskScore > 0 && meterEl) {
      meterEl.style.display = 'flex';
      var clampedScore = Math.min(riskScore, 100);
      if (barEl) barEl.style.width = clampedScore + '%';
      if (clampedScore < 35) {
        if (barEl) {
          barEl.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
          barEl.style.boxShadow = '0 0 10px rgba(16, 185, 129, 0.4)';
        }
        if (meterStatusEl) { meterStatusEl.textContent = 'Low Exposure Risk'; meterStatusEl.style.color = '#34d399'; }
      } else if (clampedScore < 70) {
        if (barEl) {
          barEl.style.background = 'linear-gradient(90deg, #f59e0b, #fbbf24)';
          barEl.style.boxShadow = '0 0 10px rgba(245, 158, 11, 0.4)';
        }
        if (meterStatusEl) { meterStatusEl.textContent = 'Elevated Risk Level'; meterStatusEl.style.color = '#fbbf24'; }
      } else {
        if (barEl) {
          barEl.style.background = 'linear-gradient(90deg, #f43f5e, #fb7185)';
          barEl.style.boxShadow = '0 0 10px rgba(244, 63, 94, 0.4)';
        }
        if (meterStatusEl) { meterStatusEl.textContent = 'Critical Threat Level'; meterStatusEl.style.color = '#fb7185'; }
      }
      if (valEl) valEl.textContent = clampedScore + '/100';
    } else if (meterEl) {
      meterEl.style.display = 'none';
    }

    // ── Rotation links ─────────────────────────────────────────────────────────
    var rotationLinks = getRotationLinks(findings);
    if (rotationEl) {
      if (rotationLinks.length > 0) {
        rotationEl.innerHTML = '<div class="rotation-header">🔑 Quick Rotation:</div>' +
          rotationLinks.map(function (l) {
            return '<a href="' + l.url + '" target="_blank" rel="noopener">' + l.icon + ' ' + l.label + '</a>';
          }).join('');
        rotationEl.style.display = 'block';
      } else {
        rotationEl.style.display = 'none';
      }
    }

    // Store explanations for later display
    window._sapr_lastExplanations = explanations;
    window._sapr_lastFindings = findings;

    // Make banner and backdrop visible
    var backdropEl = document.getElementById('sapg-modal-backdrop');
    if (backdropEl) {
      backdropEl.style.display = 'block';
      setTimeout(function () { backdropEl.classList.add('visible'); }, 10);
    }
    bannerEl.style.display = 'block';
    bannerEl.style.visibility = 'visible';
    bannerEl.style.pointerEvents = 'auto';
    setTimeout(function () { bannerEl.classList.add('visible'); }, 10);
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.add('sapg-blocking');
    }
  }

  function dismissBanner() {
    if (bannerEl) {
      bannerEl.classList.remove('visible');
      bannerEl.style.display = 'none';
      bannerEl.style.visibility = 'hidden';
      bannerEl.style.pointerEvents = 'none';
    }
    var backdrop = document.getElementById('sapg-modal-backdrop');
    if (backdrop) {
      backdrop.classList.remove('visible');
      backdrop.style.display = 'none';
    }
    if (typeof document !== 'undefined' && document.body) {
      document.body.classList.remove('sapg-blocking');
    }
    clearHighlights();
    // Also hide explanation panel if open
    var panel = document.getElementById('sapr-explanation-panel');
    if (panel) panel.style.display = 'none';
  }

  function autoRedactAndResubmit() {
    var activeEl = lastPromptElement || getActivePromptElement();
    if (!activeEl) { dismissBanner(); return; }

    var currentText = activeEl.value || activeEl.innerText || '';
    if (!currentText || currentText.length < 5) { dismissBanner(); return; }

    var result = detect(currentText);
    if (!result.shouldBlock || result.findings.length === 0) { dismissBanner(); return; }

    var redactResult = autoRedact(currentText, result.findings);
    setActiveValue(activeEl, redactResult.redacted);
    dispatchReactEvents(activeEl);

    dismissBanner();
    showToast('✂️ Auto-redacted ' + redactResult.replacements.length + ' item' + (redactResult.replacements.length > 1 ? 's' : '') + ' with safe placeholders', 'success');
    highlightFindings(result.findings);
    scrollToInput();
  }

  function autoMockAndResubmit() {
    var activeEl = lastPromptElement || getActivePromptElement();
    if (!activeEl) { dismissBanner(); return; }

    var currentText = activeEl.value || activeEl.innerText || '';
    if (!currentText || currentText.length < 5) { dismissBanner(); return; }

    var result = detect(currentText);
    if (!result.shouldBlock || result.findings.length === 0) { dismissBanner(); return; }

    var synthEngine = (typeof SENTINEL_SYNTHETIC !== 'undefined' && SENTINEL_SYNTHETIC) || (typeof window !== 'undefined' && window.SENTINEL_SYNTHETIC);
    var mockResult = synthEngine ? synthEngine.autoRedactSynthetic(currentText, result.findings) : autoRedact(currentText, result.findings);

    if (!tabDevVault && synthEngine && synthEngine.createDevVault) {
      tabDevVault = synthEngine.createDevVault();
    }
    if (tabDevVault && mockResult.replacements) {
      tabDevVault.storeReplacements(mockResult.replacements);
    }

    setActiveValue(activeEl, mockResult.redacted || mockResult.text);
    dispatchReactEvents(activeEl);

    dismissBanner();
    showToast('🎭 DevShield: Replaced ' + mockResult.replacements.length + ' item' + (mockResult.replacements.length > 1 ? 's' : '') + ' with valid synthetic mocks', 'success');
    highlightFindings(result.findings);
    scrollToInput();
  }

  // ─── SENTINEL DevShield: 1-Click Code Restorer ──────────────────────────────
  function attachCodeRestorerButtons() {
    if (!tabDevVault || tabDevVault.size() === 0) return;

    var codeBlocks = document.querySelectorAll('pre code, pre, .code-block, code-block');
    codeBlocks.forEach(function (block) {
      if (block.dataset.sapgRestorerAttached) return;

      var text = block.textContent || '';
      if (!tabDevVault.hasAnyToken(text)) return;

      block.dataset.sapgRestorerAttached = 'true';
      var container = block.tagName === 'CODE' ? (block.closest('pre') || block.parentElement) : block;
      if (!container || container.querySelector('.sapg-code-restore-btn')) return;

      var restoreBtn = document.createElement('button');
      restoreBtn.className = 'sapg-code-restore-btn';
      restoreBtn.innerHTML = '<span class="sapg-restore-icon">🛡️</span> Copy Restored';
      restoreBtn.title = 'Copy code with real secrets & database URLs seamlessly restored from DevShield';

      restoreBtn.addEventListener('click', async function (e) {
        e.preventDefault();
        e.stopPropagation();
        var rawCode = block.textContent || '';
        var restoredCode = tabDevVault.restore(rawCode);
        try {
          if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(restoredCode);
          } else {
            var tempArea = document.createElement('textarea');
            tempArea.value = restoredCode;
            document.body.appendChild(tempArea);
            tempArea.select();
            document.execCommand('copy');
            document.body.removeChild(tempArea);
          }
          restoreBtn.innerHTML = '<span>✅</span> Copied with Secrets!';
          restoreBtn.classList.add('copied');
          setTimeout(function () {
            restoreBtn.innerHTML = '<span class="sapg-restore-icon">🛡️</span> Copy Restored';
            restoreBtn.classList.remove('copied');
          }, 2500);
          showToast('✅ Copied code with secrets restored from DevShield (zero leaks)', 'success');
        } catch (err) {
          showToast('Failed to copy code to clipboard', 'error');
        }
      });

      container.style.position = 'relative';
      container.appendChild(restoreBtn);
    });
  }

  function markAsSafe() {
    var activeEl = lastPromptElement || getActivePromptElement();
    if (!activeEl) { dismissBanner(); return; }

    var text = activeEl.value || activeEl.innerText || '';
    if (text) {
      var normalized = text.toLowerCase().substring(0, 80);
      if (whitelist.indexOf(normalized) === -1) {
        whitelist.push(normalized);
        if (whitelist.length > 50) whitelist.shift();
        saveSettings();
      }
      showToast('✅ Marked as safe — will remember for next time', 'success');
    }
    dismissBanner();
  }

  function getRotationLinks(findings) {
    if (typeof getRotationLinksForFindings !== 'undefined') {
      return getRotationLinksForFindings(findings);
    }
    return [];
  }

  // ─── Text Highlighting ───────────────────────────────────────────────────────
  var highlightSpans = [];

  function highlightFindings(findings) {
    clearHighlights();
    var activeEl = getActivePromptElement();
    if (!activeEl || findings.length === 0) return;

    var isTextarea = activeEl.tagName === 'TEXTAREA' || activeEl.nodeName === 'TEXTAREA';
    var isContentEditable = activeEl.getAttribute('contenteditable') === 'true';

    if (isTextarea) {
      activeEl.classList.add('sapg-input-ring');
      highlightSpans.push({ el: activeEl, type: 'ring' });
      return;
    }

    if (isContentEditable) {
      var sorted = findings.slice().sort(function (a, b) { return b.start - a.start; });
      var highlighted = false;
      for (var i = 0; i < sorted.length; i++) {
        var f = sorted[i];
        var textNode = findTextNodeAtOffset(activeEl, f.start);
        if (textNode && f.start <= textNode.textContent.length) {
          try {
            var range = document.createRange();
            range.setStart(textNode, f.start);
            range.setEnd(textNode, Math.min(f.end, textNode.textContent.length));
            var span = document.createElement('span');
            span.className = 'sapg-highlight ' + f.category;
            span.title = f.name;
            range.surroundContents(span);
            highlightSpans.push({ el: span, type: 'span' });
            highlighted = true;
          } catch (_) {}
        }
      }
      if (!highlighted) {
        activeEl.classList.add('sapg-input-ring');
        highlightSpans.push({ el: activeEl, type: 'ring' });
      }
      return;
    }

    activeEl.classList.add('sapg-input-ring');
    highlightSpans.push({ el: activeEl, type: 'ring' });
  }

  function findTextNodeAtOffset(node, offset) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent.length >= offset ? node : null;
    }
    for (var i = 0; i < node.childNodes.length; i++) {
      var child = node.childNodes[i];
      var len = child.nodeType === Node.TEXT_NODE ? child.textContent.length : getTextLength(child);
      if (offset <= len) {
        var result = findTextNodeAtOffset(child, offset);
        if (result) return result;
      }
      offset -= len;
    }
    return null;
  }

  function getTextLength(node) {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent.length;
    var total = 0;
    for (var i = 0; i < node.childNodes.length; i++) total += getTextLength(node.childNodes[i]);
    return total;
  }

  function clearHighlights() {
    for (var i = 0; i < highlightSpans.length; i++) {
      var h = highlightSpans[i];
      if (h.type === 'span') {
        var parent = h.el.parentNode;
        if (parent) { parent.replaceChild(document.createTextNode(h.el.textContent), h.el); parent.normalize(); }
      } else if (h.type === 'ring') {
        h.el.classList.remove('sapg-input-ring');
      }
    }
    highlightSpans = [];
  }

  function scrollToInput() {
    var el = getActivePromptElement();
    if (!el) return;
    try { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus(); } catch (_) {}
  }

  function getActivePromptElement() {
    var selectors = [
      '#prompt-textarea',
      'textarea[placeholder*="message"]',
      'textarea[placeholder*="ChatGPT"]',
      'textarea[placeholder*="Send a message"]',
      'div[contenteditable="true"][data-placeholder]',
      '[data-testid="conversation-input textarea"]',
      '.ProseMirror',
      'textarea[class*="input"]',
      'textarea[class*="prompt"]',
    ];
    for (var i = 0; i < selectors.length; i++) {
      var el = document.querySelector(selectors[i]);
      if (el) return el;
    }
    return document.activeElement;
  }

  // ─── React-compatible value setter ───────────────────────────────────────────
  function setActiveValue(el, value) {
    if (!el) return;
    var isContentEditable = el.isContentEditable || (el.getAttribute && el.getAttribute('contenteditable') === 'true');
    if (isContentEditable) {
      try {
        el.focus();
        if (typeof document !== 'undefined' && document.execCommand) {
          document.execCommand('selectAll', false, null);
          document.execCommand('insertText', false, value);
        } else {
          el.innerText = value;
          el.textContent = value;
        }
      } catch (_) {
        el.innerText = value;
        el.textContent = value;
      }
      return;
    }

    var nativeSetter = null;
    try {
      if (typeof window !== 'undefined' && window.HTMLInputElement && el instanceof window.HTMLInputElement) {
        nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
      } else if (typeof window !== 'undefined' && window.HTMLTextAreaElement) {
        nativeSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value');
      }
      if (nativeSetter && nativeSetter.set) nativeSetter.set.call(el, value);
      else el.value = value;
    } catch (_) {
      try { el.value = value; } catch (_) {}
    }
  }

  function dispatchReactEvents(el) {
    var events = ['beforeinput', 'input', 'change', 'keydown', 'keyup'];
    events.forEach(function (evt) {
      el.dispatchEvent(new Event(evt, { bubbles: true }));
    });
  }

  // ─── Blocking Log (see main recordBlock at top) ──────────────────────────────


  // ─── Toast Notifications ─────────────────────────────────────────────────────
  var toastEl = null;
  var toastTimer = null;

  function showToast(message, type) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'sapr-toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = message;
    toastEl.className = 'sapr-toast visible toast-' + (type || 'info');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toastEl.classList.remove('visible');
    }, 3500);
  }

  // ─── Live Risk Indicator ─────────────────────────────────────────────────────
  var riskIndicatorEl = null;
  var liveDebounceTimer = null;

  function initLiveRiskIndicator() {
    if (riskIndicatorEl) return;
    riskIndicatorEl = document.createElement('div');
    riskIndicatorEl.id = 'sapr-risk-indicator';
    riskIndicatorEl.innerHTML = '<span class="sapr-risk-icon">🛡️</span> <span class="sapr-risk-text">Safe</span>';
    document.body.appendChild(riskIndicatorEl);
  }

  function updateLiveRisk(text) {
    if (!protectionEnabled || !userHasInteracted || !text || text.length < 3) {
      setRiskLevel(0);
      return;
    }
    var result = detect(text);
    lastRiskScore = result.riskScore;
    setRiskLevel(result.riskScore);
  }

  function setRiskLevel(score) {
    if (!riskIndicatorEl) return;
    if (score === 0) {
      // Hide the indicator when there's nothing risky — don't clutter the UI
      riskIndicatorEl.className = '';
      return;
    }
    var level, label;
    if (score < 30) { level = 'risk-low'; label = 'Low Risk'; }
    else if (score < 50) { level = 'risk-medium'; label = 'Medium Risk'; }
    else if (score < 80) { level = 'risk-high'; label = 'High Risk'; }
    else { level = 'risk-critical'; label = 'Danger!'; }

    riskIndicatorEl.className = 'visible ' + level;
    riskIndicatorEl.querySelector('.sapr-risk-text').textContent = label + ' ' + score;
  }

  // ─── Feature 4: Explainable Detection Panel ──────────────────────────────────
  // Shows which rule matched, category, and a one-line plain-English reason.
  // NEVER displays the raw sensitive value — only pattern type and location.

  function showExplanationPanel(filterCategory, findings, explanations) {
    var panel = document.getElementById('sapr-explanation-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'sapr-explanation-panel';
      panel.style.cssText = [
        'position:fixed;top:0;right:0;z-index:2147483647;',
        'width:340px;max-height:70vh;overflow-y:auto;',
        'background:linear-gradient(160deg,rgba(10,10,30,0.98),rgba(20,10,40,0.98));',
        'border-left:2px solid rgba(123,45,255,0.6);border-bottom:2px solid rgba(123,45,255,0.6);',
        'border-radius:0 0 0 16px;padding:0;',
        'font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;',
        'font-size:13px;color:#e0e6f7;',
        'box-shadow:-4px 4px 30px rgba(0,0,0,0.6);',
        'transition:transform 0.3s cubic-bezier(0.34,1.56,0.64,1);',
      ].join('');
      document.body.appendChild(panel);
    }

    var filtered = explanations
      ? explanations.filter(function(ex) {
          return !filterCategory || ex.category === filterCategory;
        })
      : [];

    var severityColors = { critical: '#f38ba8', warning: '#ffbe0b', info: '#89b4fa' };
    var catIcons = { api_key: '🔑', password: '🔒', pii: '👤', confidential: '📋', company: '🏢' };

    panel.innerHTML = [
      '<div style="padding:14px 16px 10px;background:rgba(123,45,255,0.15);border-bottom:1px solid rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:space-between;">',
      '  <span style="font-weight:700;font-size:14px;">🔍 Detection Details</span>',
      '  <button id="sapr-expl-close" style="background:none;border:none;color:#8892b0;cursor:pointer;font-size:18px;padding:2px 6px;">✕</button>',
      '</div>',
      '<div style="padding:12px 14px;">',
      filtered.length === 0
        ? '<div style="color:#8892b0;font-size:12px;">No findings in this category.</div>'
        : filtered.map(function(ex, i) {
            var f = ex.finding || {};
            var cat = ex.category || 'unknown';
            var sev = f.severity || 'info';
            var sevColor = severityColors[sev] || '#89b4fa';
            var icon = catIcons[cat] || '⚠️';
            var locHint = ex.locationHint || (f.start != null ? 'characters ' + f.start + '–' + f.end : 'throughout');
            // IMPORTANT: Never show the raw matched value — only pattern type and location
            return [
              '<div style="margin-bottom:10px;padding:10px 12px;background:rgba(255,255,255,0.04);',
              'border-radius:8px;border-left:3px solid ' + sevColor + ';">',
              '  <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">',
              '    <span style="font-size:11px;font-weight:700;color:' + sevColor + ';text-transform:uppercase;">' + icon + ' ' + cat + '</span>',
              '    <span style="font-size:10px;background:rgba(255,255,255,0.08);padding:1px 6px;border-radius:8px;color:#8892b0;">' + sev + '</span>',
              '  </div>',
              '  <div style="font-size:12px;margin-bottom:4px;font-weight:500;">' + (ex.reason || ex.explanation || 'Sensitive content detected') + '</div>',
              '  <div style="font-size:10px;color:#6c7086;">',
              '    Pattern: <code style="color:#cba6f7;">' + (f.id || cat) + '</code> &nbsp;|&nbsp; Location: ' + locHint,
              '  </div>',
              '</div>',
            ].join('');
          }).join(''),
      '</div>',
    ].join('');

    panel.style.display = 'block';

    var closeBtn = document.getElementById('sapr-expl-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function() { panel.style.display = 'none'; });
    }
  }

  // ─── Feature 3: Real-Time Inline Highlighting ─────────────────────────────────
  // Highlights risky spans as the user types (300ms debounce).
  // DOES NOT replace submit-time blocking — purely additive.

  var inlineHighlightTimer = null;
  var _inlineHighlightOverlay = null;   // textarea mirror overlay element
  var _inlineHighlightSpans = [];       // for contenteditable cleanup

  /**
   * Build or get the overlay div that mirrors a textarea for inline highlighting.
   * We position a transparent div on top of the textarea with matching text,
   * and insert colored <mark> spans for flagged ranges.
   */
  function getOrCreateOverlay(textarea) {
    var overlayId = 'sapg-overlay-' + (textarea.dataset.saprOverlayId || (textarea.dataset.saprOverlayId = Date.now()));
    var existing = document.getElementById(overlayId);
    if (existing) return existing;

    var overlay = document.createElement('div');
    overlay.id = overlayId;
    overlay.className = 'sapg-inline-overlay';

    // Copy styles that affect text rendering
    var cs = window.getComputedStyle(textarea);
    var stylesToCopy = [
      'font', 'fontFamily', 'fontSize', 'fontWeight', 'fontStyle',
      'lineHeight', 'letterSpacing', 'wordSpacing', 'textTransform',
      'padding', 'paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft',
      'borderWidth', 'borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth',
      'borderStyle', 'boxSizing', 'tabSize', 'whiteSpace', 'wordWrap', 'overflowWrap',
    ];
    stylesToCopy.forEach(function(prop) {
      try { overlay.style[prop] = cs[prop]; } catch(_) {}
    });

    overlay.style.cssText += [
      ';position:absolute;pointer-events:none;overflow:hidden;',
      'color:transparent;white-space:pre-wrap;word-wrap:break-word;',
      'background:transparent;z-index:1;',
    ].join('');

    // Position overlay precisely over textarea
    positionOverlay(overlay, textarea);

    // Insert overlay as a sibling positioned relative to textarea's parent
    var parent = textarea.parentElement;
    if (parent) {
      var parentPos = window.getComputedStyle(parent).position;
      if (parentPos === 'static') parent.style.position = 'relative';
      parent.appendChild(overlay);
    }

    return overlay;
  }

  function positionOverlay(overlay, textarea) {
    var rect = textarea.getBoundingClientRect();
    var parentRect = (textarea.parentElement || document.body).getBoundingClientRect();
    overlay.style.top = (rect.top - parentRect.top + textarea.scrollTop) + 'px';
    overlay.style.left = (rect.left - parentRect.left) + 'px';
    overlay.style.width = rect.width + 'px';
    overlay.style.height = rect.height + 'px';
  }

  /**
   * Render inline highlight marks into the overlay for a textarea.
   * Uses <mark> elements styled by severity/category — never exposes raw text.
   */
  function renderTextareaOverlay(textarea, findings) {
    var overlay = getOrCreateOverlay(textarea);
    var text = textarea.value;

    // Build highlight ranges from non-bulk findings only
    var normalFindings = findings.filter(function(f) { return !f.isBulk; });
    if (normalFindings.length === 0) {
      overlay.innerHTML = escapeHtml(text);
      return;
    }

    // Sort by start position
    var sorted = normalFindings.slice().sort(function(a, b) { return a.start - b.start; });
    var html = '';
    var cursor = 0;

    sorted.forEach(function(f) {
      if (f.start > cursor) {
        html += escapeHtml(text.substring(cursor, f.start));
      }
      var start = Math.max(f.start, cursor);
      var end = Math.min(f.end, text.length);
      if (start < end) {
        var cls = 'sapg-inline-mark sapg-inline-' + (f.severity || 'info') + ' sapg-inline-cat-' + (f.category || 'unknown');
        var title = (f.id || f.category) + ': ' + (f.name || '');
        html += '<mark class="' + cls + '" title="' + escapeAttr(title) + '">' +
          escapeHtml(text.substring(start, end)) + '</mark>';
        cursor = end;
      }
    });

    if (cursor < text.length) {
      html += escapeHtml(text.substring(cursor));
    }

    overlay.innerHTML = html;
    // Sync scroll position
    overlay.scrollTop = textarea.scrollTop;
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\n/g, '<br>')
      .replace(/ {2}/g, ' &nbsp;');
  }

  function escapeAttr(str) {
    return str.replace(/"/g, '&quot;').replace(/</g, '&lt;');
  }

  /**
   * Run real-time detection and update inline highlights.
   * Called 300ms after the user stops typing.
   */
  function runInlineHighlight(el) {
    if (!protectionEnabled) { clearInlineHighlights(el); return; }
    var text = el.value !== undefined ? el.value : (el.innerText || '');
    if (!text || text.length < 3) { clearInlineHighlights(el); return; }

    var t0 = Date.now();
    var result = detect(text);
    var latency = Date.now() - t0;

    // Log latency for performance monitoring (only in development)
    if (latency > 50) {
      console.debug('[SAPG] Inline detection latency:', latency, 'ms for', text.length, 'chars');
    }

    if (result.findings.length === 0) {
      clearInlineHighlights(el);
      return;
    }

    var isTextarea = el.tagName === 'TEXTAREA';
    var isContentEditable = el.getAttribute && el.getAttribute('contenteditable') === 'true';

    if (isTextarea) {
      renderTextareaOverlay(el, result.findings);
    }
    // For contenteditable: apply ring only (span insertion during typing breaks text editing)
    // Full span highlighting happens at submit time when text is not being modified
    if (isContentEditable) {
      el.classList.add('sapg-input-ring');
      _inlineHighlightSpans.push({ el: el, type: 'ring' });
    }

    // Update live risk indicator with severity context
    updateLiveRisk(text);
  }

  function clearInlineHighlights(el) {
    if (!el) return;
    // Remove overlay
    if (el.dataset && el.dataset.saprOverlayId) {
      var overlay = document.getElementById('sapg-overlay-' + el.dataset.saprOverlayId);
      if (overlay) overlay.innerHTML = '';
    }
    // Remove ring
    if (el.classList) el.classList.remove('sapg-input-ring');
  }

  function initLiveRiskListener() {
    var debouncedUpdate = function (el) {
      clearTimeout(liveDebounceTimer);
      liveDebounceTimer = setTimeout(function () {
        var text = el.value || el.innerText || '';
        updateLiveRisk(text);
      }, 400);
    };

    // Feature 3: Separate 300ms debounce for inline highlighting
    function debouncedInlineHighlight(el) {
      clearTimeout(inlineHighlightTimer);
      inlineHighlightTimer = setTimeout(function () {
        try { runInlineHighlight(el); } catch(_) {}
      }, 300);
    }

    function attachToInput(el) {
      if (!el || el.dataset.saprLiveListened) return;
      el.dataset.saprLiveListened = '1';
      el.addEventListener('input', function () {
        userHasInteracted = true;
        debouncedUpdate(el);
        debouncedInlineHighlight(el);
      });
      el.addEventListener('paste', function () {
        userHasInteracted = true;
        setTimeout(function () {
          debouncedUpdate(el);
          debouncedInlineHighlight(el);
        }, 100);
      });
      // Sync overlay scroll on textarea scroll
      if (el.tagName === 'TEXTAREA') {
        el.addEventListener('scroll', function() {
          if (el.dataset.saprOverlayId) {
            var overlay = document.getElementById('sapg-overlay-' + el.dataset.saprOverlayId);
            if (overlay) overlay.scrollTop = el.scrollTop;
          }
        });
      }
    }

    document.querySelectorAll('textarea, [contenteditable="true"], input[type="text"], input[type="search"]').forEach(attachToInput);

    if (!window._sapr_live_observer) {
      window._sapr_live_observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
          mutation.addedNodes.forEach(function (node) {
            if (node.nodeType !== 1) return;
            if (node.tagName === 'TEXTAREA' || node.tagName === 'INPUT' || node.getAttribute('contenteditable') === 'true') {
              attachToInput(node);
            }
            node.querySelectorAll('textarea, [contenteditable="true"], input[type="text"], input[type="search"]').forEach(attachToInput);
          });
        });
      });
      window._sapr_live_observer.observe(document.body, { childList: true, subtree: true });
    }
  }

  // ─── Conversation Scanner ────────────────────────────────────────────────────
  function scanConversation() {
    if (typeof analyzePrompt === 'undefined') return { total: 0, found: 0, results: [] };

    var messageSelectors = [
      '[data-testid="conversation-message"]',
      '.message-user',
      '.message-assistant',
      '.prose',
      '[class*="message"]',
      '[class*="chat-bubble"]',
    ];

    var allMessages = [];
    messageSelectors.forEach(function (sel) {
      document.querySelectorAll(sel).forEach(function (el) {
        var text = (el.innerText || '').trim();
        if (text.length > 10) allMessages.push({ el: el, text: text });
      });
    });

    var seen = {};
    var uniqueMessages = [];
    allMessages.forEach(function (m) {
      var key = m.text.substring(0, 80);
      if (!seen[key]) { seen[key] = true; uniqueMessages.push(m); }
    });

    var results = [];
    var foundCount = 0;

    uniqueMessages.forEach(function (m) {
      var r = detect(m.text);
      if (r.shouldBlock) {
        foundCount++;
        results.push({
          preview: m.text.substring(0, 80) + (m.text.length > 80 ? '…' : ''),
          categories: r.categories,
          riskScore: r.riskScore,
          findingsCount: r.findings.length,
          element: m.el,
        });
      }
    });

    return { total: uniqueMessages.length, found: foundCount, results: results };
  }

  // ─── In-Page Popup ───────────────────────────────────────────────────────────
  var popupEl = null;

  function buildPopup() {
    if (popupEl) return popupEl;
    popupEl = document.createElement('div');
    popupEl.id = 'sapr-popup';
    popupEl.innerHTML = [
      '<div id="sapr-popup-header">',
      '  <h3>🛡️ Prompt Guardian</h3>',
      '  <button id="sapr-popup-close">✕</button>',
      '</div>',
      '<div id="sapr-popup-body">',
      '  <div class="sapr-status-row">',
      '    <span>Protection <strong>Active</strong></span>',
      '    <input type="checkbox" class="sapr-toggle" id="sapr-protection-toggle" checked>',
      '  </div>',
      '  <div class="sapr-log-section">',
      '    <div class="sapr-log-title">Recent Blocks</div>',
      '    <div id="sapr-log-entries">',
      '      <div style="color:#6c7086; font-size:12px; padding:4px 0;">No blocks yet.</div>',
      '    </div>',
      '  </div>',
      '</div>',
    ].join('\n');
    if (typeof document !== 'undefined' && document.body) {
      document.body.appendChild(popupEl);
      var closeBtn = document.getElementById('sapr-popup-close');
      if (closeBtn) {
        closeBtn.addEventListener('click', function () {
          popupEl.classList.remove('visible');
        });
      }
      var toggleInput = document.getElementById('sapr-protection-toggle');
      if (toggleInput) {
        toggleInput.addEventListener('change', function (e) {
          protectionEnabled = e.target.checked;
          saveSettings();
          if (typeof window !== 'undefined') {
            window.postMessage({ type: 'SAPG_SET_PROTECTION', enabled: protectionEnabled }, '*');
          }
          var s = popupEl.querySelector('.sapr-status-row span strong');
          if (s) s.textContent = protectionEnabled ? 'Active' : 'Paused';
        });
      }
    }
    return popupEl;
  }

  function updateInPagePopup() {
    try {
      if (typeof document === 'undefined' || !document.body) return;
      var popup = buildPopup();
      if (!popup) return;
      var logEl = popup.querySelector('#sapr-log-entries');
      if (!logEl) return;
      var severityIcons = { critical: '🔴', warning: '🟡', info: '🔵' };

    if (blockedAttempts.length === 0) {
      logEl.innerHTML = '<div style="color:#6c7086; font-size:12px; padding:4px 0;">No blocks yet.</div>';
    } else {
      logEl.innerHTML = blockedAttempts.slice(0, 5).map(function (entry) {
        var time = new Date(entry.timestamp).toLocaleTimeString();
        var cats = entry.categories.map(function (c) { return 'cat-' + c; }).join(' ');
        var sevIcon = severityIcons[entry.severity] || '🔵';
        var bulkTag = entry.bulkMessages && entry.bulkMessages.length > 0
          ? ' <span style="font-size:10px;background:rgba(255,0,68,0.2);color:#f38ba8;padding:1px 5px;border-radius:4px;">BULK</span>'
          : '';
        return '<div class="sapr-log-entry ' + cats + '">' +
          '<span class="cat">' + sevIcon + ' ' + entry.categories.join(', ') + bulkTag + '</span>' +
          '<span style="font-size:10px;color:#6c7086;">' + entry.riskScore + '</span>' +
          '<span class="time">' + time + '</span>' +
          '</div>';
      }).join('');
    }
  } catch (_) {}
}

  // ─── Floating Toggle Button ──────────────────────────────────────────────────
  function buildFloatingToggle() {
    var btn = document.createElement('button');
    btn.id = 'sapr-floating-toggle';
    btn.innerHTML = '🛡️';
    btn.title = 'Shadow AI Prompt Guardian';
    btn.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:2147483645;width:48px;height:48px;border-radius:50%;border:none;background:#1e1e2e;color:#fff;font-size:24px;cursor:pointer;box-shadow:0 4px 16px rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;';
    btn.addEventListener('click', function () {
      updateInPagePopup();
      buildPopup().classList.toggle('visible');
    });
    document.body.appendChild(btn);
    return btn;
  }

  // ─── Interception: Fetch ─────────────────────────────────────────────────────
  function interceptFetch() {
    var originalFetch = window.fetch;
    if (!originalFetch) return;
    window.fetch = async function (resource, init) {
      if (!protectionEnabled) return originalFetch.apply(this, arguments);
      var url = '';
      try { url = typeof resource === 'string' ? resource : (resource && resource.url ? resource.url : ''); } catch (_) {}
      if (!isAiChatUrl(url)) return originalFetch.apply(this, arguments);
      var body = init && init.body;
      var promptText = null;
      if (body && typeof body === 'string' && body.length > 5) {
        promptText = extractPromptFromBody(body);
      }
      if (!promptText) return originalFetch.apply(this, arguments);
      var blocked = await checkAndBlock(promptText, '[fetch] ' + url.substring(0, 80));
      if (blocked) {
        throw new DOMException('Shadow AI Prompt Guardian: request blocked — sensitive content detected.', 'AbortError');
      }
      return originalFetch.apply(this, arguments);
    };
  }

  // ─── Interception: XHR ──────────────────────────────────────────────────────
  function interceptXHR() {
    var origOpen = XMLHttpRequest.prototype.open;
    var origSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (method, url) {
      this._sapr_url = url;
      return origOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function (body) {
      if (!protectionEnabled) return origSend.apply(this, arguments);
      var url = this._sapr_url || '';
      if (!isAiChatUrl(url)) return origSend.apply(this, arguments);
      var promptText = null;
      if (body && typeof body === 'string' && body.length > 5) promptText = extractPromptFromBody(body);
      if (!promptText) return origSend.apply(this, arguments);
      // Synchronous detection — checkAndBlock is async and can't work in XHR.send()
      var result = detect(promptText);
      if (result.shouldBlock) {
        try { recordBlock(result, promptText); } catch (_) {}
        showBanner(result.findings, result.riskScore, result.severity, result.explanations, result.bulkMessages || [], promptText);
        console.log('[SAPG] Blocked:', result.categories, 'riskScore:', result.riskScore, 'severity:', result.severity, '[XHR] ' + url.substring(0, 80));
        throw new DOMException('Shadow AI Prompt Guardian: XHR blocked.', 'AbortError');
      }
      return origSend.apply(this, arguments);
    };
  }

  // ─── Interception: Send Button Click ─────────────────────────────────────────
  function interceptSendButton() {
    document.addEventListener('click', function (e) {
      if (!protectionEnabled) return;
      var btn = e.target.closest('button');
      if (!btn) return;
      var testId = btn.getAttribute('data-testid') || '';
      var aria = btn.getAttribute('aria-label') || '';
      var isSendBtn = /send/i.test(testId) ||
        /send|submit/i.test(aria) ||
        /send/i.test(btn.textContent || '') ||
        btn.type === 'submit' ||
        (btn.querySelector('svg') && btn.closest('form, [class*="composer"], [class*="input"], main'));
      if (!isSendBtn) return;
      var promptText = extractPromptFromActiveElement();
      if (!promptText || promptText.length < 5) return;
      var blocked = checkAndBlockSync(promptText, '[send-button click]');
      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    }, true);
  }

  // ─── Interception: Enter Key ────────────────────────────────────────────────
  function interceptEnterKey() {
    document.addEventListener('keydown', function (e) {
      if (!protectionEnabled) return;
      if (e.key !== 'Enter' || e.shiftKey || e.ctrlKey || e.metaKey || e.altKey) return;
      var promptText = extractPromptFromActiveElement();
      if (!promptText || promptText.length < 5) return;
      var blocked = checkAndBlockSync(promptText, '[keydown Enter]');
      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    }, true);
  }

  // ─── Interception: Form Submit ──────────────────────────────────────────────
  var formSubmitAttached = false;
  function interceptForms() {
    if (formSubmitAttached || typeof document === 'undefined') return;
    formSubmitAttached = true;
    document.addEventListener('submit', function (e) {
      if (!protectionEnabled) return;
      var form = e.target;
      if (!form) return;
      var textarea = form.querySelector('textarea');
      var input = form.querySelector('input[type="text"], input[type="search"]');
      var editable = form.querySelector('[contenteditable="true"]');
      var promptText = null;
      if (textarea) promptText = textarea.value.trim();
      else if (input) promptText = input.value.trim();
      else if (editable) promptText = (editable.innerText || editable.textContent || '').trim();
      if (!promptText || promptText.length < 5) return;
      var blocked = checkAndBlockSync(promptText, '[form submit]');
      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return false;
      }
    }, true);
  }

  // ─── DOM Observation for SPAs ───────────────────────────────────────────────
  var spaObserverStarted = false;
  function startDOMObservation() {
    if (spaObserverStarted || typeof document === 'undefined' || !document.body) return;
    spaObserverStarted = true;
    var observer = new MutationObserver(function () {
      attachCodeRestorerButtons();
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  // ─── Initialization ──────────────────────────────────────────────────────────
  async function init() {
    console.log('[SAPG] Shadow AI Prompt Guardian v5.0 "SENTINEL" loaded on', window.location.href);
    await loadSettings();
    injectMainWorldScript();
    setupMainWorldBridge();
    // Sync initial protection state to main world
    var targetOrigin = (typeof window !== 'undefined' && window.location && window.location.origin) ? window.location.origin : '*';
    window.postMessage({ type: 'SAPG_SET_PROTECTION', enabled: protectionEnabled }, targetOrigin);
    interceptFetch();
    interceptXHR();
    interceptSendButton();
    interceptEnterKey();
    interceptForms();
    startDOMObservation();
    buildFloatingToggle();
    initLiveRiskIndicator();
    initLiveRiskListener();
    setTimeout(function () {
      interceptForms();
      startDOMObservation();
      initLiveRiskListener();
    }, 3000);
  }

  // ─── Node.js export ──────────────────────────────────────────────────────────
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
      interceptFetch: interceptFetch, interceptXHR: interceptXHR, interceptSendButton: interceptSendButton,
      interceptEnterKey: interceptEnterKey, interceptForms: interceptForms, detect: detect,
      extractPromptFromBody: extractPromptFromBody, extractPromptFromActiveElement: extractPromptFromActiveElement,
      scanConversation: scanConversation, loadSettings: loadSettings, recordBlock: recordBlock,
      checkAndBlockSync: checkAndBlockSync,
    };
    return;
  }

  // ─── Bootstrap ───────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init().catch(function () {});
  }
})();
