/**
 * Shadow AI Prompt Guardian — SENTINEL v5.0
 * Background Service Worker
 *
 * Responsibilities:
 *  - Cross-tab session state management
 *  - Hash-chained tamper-proof audit log
 *  - Badge icon state (pulse green / throb red)
 *  - Session metrics (sparkline history, AI Exposure Score)
 */

'use strict';

// ─── Badge State ─────────────────────────────────────────────────────────────

let lastBlockTime = 0;

function setBadgeBlocked(tabId) {
  lastBlockTime = Date.now();
  try {
    const textOpts = { text: '🚨' };
    const colorOpts = { color: '#ff0044' };
    if (typeof tabId === 'number') {
      textOpts.tabId = tabId;
      colorOpts.tabId = tabId;
    }
    chrome.action.setBadgeText(textOpts).catch(() => {});
    chrome.action.setBadgeBackgroundColor(colorOpts).catch(() => {});
  } catch (_) {}
  setTimeout(() => {
    try {
      const clearOpts = { text: '' };
      if (typeof tabId === 'number') clearOpts.tabId = tabId;
      chrome.action.setBadgeText(clearOpts).catch(() => {});
    } catch (_) {}
  }, 4000);
}

// ─── Hash Chain (Tamper-Proof Audit Log) ─────────────────────────────────────

async function sha256hex(str) {
  try {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(str));
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('');
  } catch (_) {
    return '0'.repeat(64);
  }
}

let _chainHash = '0'.repeat(64);

// Rehydrate chain hash and session metrics from storage on startup
chrome.storage.local.get(['sapg_audit_chain', 'sapg_session_metrics'], (res) => {
  if (res && res.sapg_audit_chain) _chainHash = res.sapg_audit_chain;
  if (res && res.sapg_session_metrics) {
    Object.assign(sessionMetrics, res.sapg_session_metrics);
  }
});

async function appendAuditEntry(entry) {
  try {
    const result = await new Promise(res => chrome.storage.local.get(['sapg_audit_chain', 'sapg_audit_log'], res));
    _chainHash = result.sapg_audit_chain || _chainHash;
    const log = result.sapg_audit_log || [];
    const payload = JSON.stringify({ prev: _chainHash, ts: entry.timestamp, cats: entry.categories, score: entry.riskScore });
    const newHash = await sha256hex(payload);
    const chainedEntry = { ...entry, prevHash: _chainHash, hash: newHash };
    _chainHash = newHash;
    log.unshift(chainedEntry);
    if (log.length > 200) log.splice(200);
    await new Promise(res => chrome.storage.local.set({ sapg_audit_chain: _chainHash, sapg_audit_log: log }, res));
  } catch (_) {}
}

// ─── Session Metrics ──────────────────────────────────────────────────────────

const sessionMetrics = {
  promptsChecked: 0,
  promptsBlocked: 0,
  riskHistory: [],
  exposureScore: 0,
  startTime: Date.now(),
};

function saveMetrics() {
  try {
    chrome.storage.local.set({ sapg_session_metrics: sessionMetrics });
  } catch (_) {}
}

function updateMetrics(result, blocked) {
  sessionMetrics.promptsChecked++;
  if (blocked) sessionMetrics.promptsBlocked++;
  sessionMetrics.riskHistory.push(result.riskScore || 0);
  if (sessionMetrics.riskHistory.length > 20) sessionMetrics.riskHistory.shift();
  if (!blocked && result.riskScore > 10) {
    sessionMetrics.exposureScore = Math.min(100, sessionMetrics.exposureScore + Math.round(result.riskScore * 0.1));
  }
  saveMetrics();
}

// ─── Message Handler ──────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'SAPG_GET_METRICS') {
    sendResponse({ metrics: sessionMetrics });
    return true;
  }
  if (msg.type === 'SAPG_BLOCK_OCCURRED') {
    const { result } = msg;
    updateMetrics(result, true);
    setBadgeBlocked(sender.tab && sender.tab.id);
    appendAuditEntry({
      timestamp: new Date().toISOString(),
      categories: result.categories || [],
      riskScore: result.riskScore || 0,
      severity: result.severity || 'info',
      hasCritical: result.hasCritical || false,
      findingCount: (result.findings || []).length,
      maskedPreviews: (result.findings || []).slice(0, 3).map(f => f.matchMasked || ''),
      bulkMessages: result.bulkMessages || [],
      platform: msg.platform || 'unknown',
    });
    sendResponse({ ok: true });
    return true;
  }
  if (msg.type === 'SAPG_CLEAN_PROMPT') {
    updateMetrics(msg.result || {}, false);
    sendResponse({ ok: true });
    return true;
  }
  if (msg.type === 'SAPG_EXPORT_AUDIT') {
    chrome.storage.local.get(['sapg_audit_log', 'sapg_audit_chain'], (r) => {
      sendResponse({
        log: r.sapg_audit_log || [],
        chainHead: r.sapg_audit_chain || _chainHash,
        exportedAt: new Date().toISOString(),
        version: '5.0.0',
      });
    });
    return true;
  }
  if (msg.type === 'SAPG_RESET_EXPOSURE') {
    sessionMetrics.exposureScore = 0;
    saveMetrics();
    sendResponse({ ok: true });
    return true;
  }
});

chrome.runtime.onInstalled.addListener(() => {
  try { chrome.action.setBadgeText({ text: '' }).catch(() => {}); } catch (_) {}
  console.log('[SENTINEL] v5.0 background service worker active');
});
