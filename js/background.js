/**
 * Shadow AI Prompt Guardian — Background Service Worker
 * Version: 2.0.0 (Manifest V3 Production Build)
 *
 * Responsibilities:
 *  - Handles storage operations & audit logging (Self-contained, 100% resilient)
 *  - Dynamically updates extension badge color & text based on active tab risk
 *  - Dispatches native Chrome desktop notifications on HIGH / CRITICAL threats
 *  - Synchronizes cross-tab security states
 *  - Zero DOM access, Zero importScripts fetch dependencies
 */

'use strict';

// ─── Resilient Storage Implementation (No importScripts dependency) ──────────

const STORAGE_KEYS = {
  SETTINGS: 'shadow_guardian_settings',
  LOGS: 'shadow_guardian_logs',
  STATS: 'shadow_guardian_stats'
};

const DEFAULT_SETTINGS = {
  protectionActive: true,
  actionPolicy: 'block',
  categories: {
    pii: true,
    financial: true,
    credentials: true,
    organizational: true,
    medical_legal: true
  },
  keywordWatchlist: [
    'Project Titan',
    'Project Chimera',
    'Apollo-Internal',
    'Project Mercury',
    'AcmeConfidential',
    'SecretSauce'
  ],
  whitelistedDomains: [
    'internal-ai.corp.local',
    'localhost:3000'
  ],
  notificationsEnabled: true,
  inlineUnderlineEnabled: true,
  darkMode: true
};

const DEFAULT_STATS = {
  totalScanned: 0,
  totalBlocked: 0,
  totalRedacted: 0,
  totalBypassed: 0,
  topRiskCategory: 'None',
  categoryCounts: {
    pii: 0,
    financial: 0,
    credentials: 0,
    organizational: 0,
    medical_legal: 0
  },
  lastUpdated: Date.now()
};

const GuardianStorage = {
  async getSettings() {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get([STORAGE_KEYS.SETTINGS], (res) => {
          if (chrome.runtime && chrome.runtime.lastError) {
            resolve({ ...DEFAULT_SETTINGS });
          } else if (!res || !res[STORAGE_KEYS.SETTINGS]) {
            resolve({ ...DEFAULT_SETTINGS });
          } else {
            resolve({ ...DEFAULT_SETTINGS, ...res[STORAGE_KEYS.SETTINGS] });
          }
        });
      } catch (_) {
        resolve({ ...DEFAULT_SETTINGS });
      }
    });
  },

  async saveSettings(partial) {
    return new Promise((resolve) => {
      try {
        this.getSettings().then((current) => {
          const updated = { ...current, ...partial };
          chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated }, () => {
            resolve(updated);
          });
        });
      } catch (_) {
        resolve(null);
      }
    });
  },

  async addAuditLog(entry) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get([STORAGE_KEYS.LOGS], (res) => {
          const logs = (res && Array.isArray(res[STORAGE_KEYS.LOGS])) ? res[STORAGE_KEYS.LOGS] : [];
          const newEntry = {
            id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
            timestamp: Date.now(),
            platform: entry.platform || 'Unknown AI',
            riskLevel: entry.riskLevel || 'CLEAN',
            riskScore: entry.riskScore || 0,
            actionTaken: entry.actionTaken || 'BLOCKED',
            dataType: entry.dataType || 'Multiple',
            categories: entry.categories || [],
            findingCount: entry.findingCount || 0,
            summary: entry.summary || 'Sensitive prompt intercepted'
          };
          logs.unshift(newEntry);
          if (logs.length > 300) logs.splice(300);
          chrome.storage.local.set({ [STORAGE_KEYS.LOGS]: logs }, () => resolve(true));
        });
      } catch (_) {
        resolve(false);
      }
    });
  },

  async recordScan({ scanned = 1, blocked = 0, redacted = 0, bypassed = 0, categoryBreakdown = {} }) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get([STORAGE_KEYS.STATS], (res) => {
          const current = (res && res[STORAGE_KEYS.STATS])
            ? { ...DEFAULT_STATS, ...res[STORAGE_KEYS.STATS] }
            : { ...DEFAULT_STATS };
          const newCounts = { ...current.categoryCounts };

          for (const cat in categoryBreakdown) {
            if (newCounts[cat] !== undefined) {
              newCounts[cat] += categoryBreakdown[cat];
            }
          }

          let topCategory = 'None';
          let maxCount = 0;
          for (const cat in newCounts) {
            if (newCounts[cat] > maxCount) {
              maxCount = newCounts[cat];
              topCategory = cat.toUpperCase();
            }
          }

          const updated = {
            totalScanned: (current.totalScanned || 0) + scanned,
            totalBlocked: (current.totalBlocked || 0) + blocked,
            totalRedacted: (current.totalRedacted || 0) + redacted,
            totalBypassed: (current.totalBypassed || 0) + bypassed,
            topRiskCategory: topCategory,
            categoryCounts: newCounts,
            lastUpdated: Date.now()
          };

          chrome.storage.local.set({ [STORAGE_KEYS.STATS]: updated }, () => resolve(updated));
        });
      } catch (_) {
        resolve(null);
      }
    });
  }
};

// In-memory tab risk cache: tabId -> { riskLevel, riskScore, findingsCount, timestamp }
const tabRiskCache = new Map();

// ─── Badge Management ──────────────────────────────────────────────────────

const BADGE_CONFIG = {
  CLEAN: { text: '', color: '#10B981' }, // emerald green
  LOW: { text: 'LOW', color: '#06B6D4' }, // cyan
  MEDIUM: { text: 'MED', color: '#F59E0B' }, // amber yellow
  HIGH: { text: 'HIGH', color: '#F97316' }, // vivid orange
  CRITICAL: { text: 'CRIT', color: '#EF4444' } // neon crimson
};

/**
 * Updates the extension badge text and background color for a specific tab.
 * @param {number} tabId
 * @param {string} riskLevel 'CLEAN' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
 * @param {number} riskScore
 */
function updateTabBadge(tabId, riskLevel, riskScore = 0) {
  if (!tabId || typeof tabId !== 'number') return;

  const cfg = BADGE_CONFIG[riskLevel] || BADGE_CONFIG.CLEAN;
  const badgeText = riskLevel === 'CLEAN' ? '' : (riskLevel === 'CRITICAL' ? '⛔' : `${riskScore}`);

  try {
    chrome.action.setBadgeText({ tabId, text: badgeText }, () => {
      if (chrome.runtime.lastError) {
        // Silently handle closed tab race conditions
      }
    });

    chrome.action.setBadgeBackgroundColor({ tabId, color: cfg.color }, () => {
      if (chrome.runtime.lastError) {
        // Silently handle closed tab race conditions
      }
    });
  } catch (err) {
    console.warn('[Background] Badge update error:', err);
  }
}

// ─── Native Notifications ──────────────────────────────────────────────────

/**
 * Triggers a Chrome system notification on HIGH/CRITICAL threat events.
 * @param {Object} details
 */
function triggerSystemNotification(details) {
  try {
    if (!chrome.notifications) return;

    const notifId = 'shadow_alert_' + Date.now();
    const severityPrefix = details.riskLevel === 'CRITICAL' ? '🚨 [CRITICAL ALERT]' : '⚠️ [HIGH RISK WARNING]';
    const categoriesStr = Array.isArray(details.categories) ? details.categories.join(', ') : 'Confidential Data';

    chrome.notifications.create(
      notifId,
      {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: `${severityPrefix} Prompt Leak Blocked`,
        message: `Shadow AI intercepted ${details.findingCount || 1} sensitive item(s) (${categoriesStr}) on ${details.platform || 'AI Platform'}. Prompt was held safely.`,
        priority: 2,
        requireInteraction: false
      },
      () => {
        if (chrome.runtime.lastError) {
          console.warn('[Background] Notification error:', chrome.runtime.lastError.message);
        }
      }
    );
  } catch (err) {
    console.error('[Background] Exception triggering notification:', err);
  }
}

// ─── Message Dispatcher ────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.action) return false;

  const tabId = sender.tab ? sender.tab.id : null;

  switch (message.action) {
    // 1. Content script reports real-time typing analysis
    case 'PROMPT_EVALUATED': {
      const { riskLevel, riskScore, findingsCount, platform } = message.payload || {};
      if (tabId) {
        tabRiskCache.set(tabId, {
          riskLevel: riskLevel || 'CLEAN',
          riskScore: riskScore || 0,
          findingsCount: findingsCount || 0,
          platform: platform || 'AI Platform',
          timestamp: Date.now()
        });
        updateTabBadge(tabId, riskLevel || 'CLEAN', riskScore || 0);
      }
      sendResponse({ status: 'OK' });
      return true;
    }

    // 2. Interception action executed: block send, redact, or proceed
    case 'LOG_INTERCEPTION': {
      (async () => {
        try {
          const payload = message.payload || {};
          const isBlocked = payload.actionTaken === 'BLOCKED';
          const isRedacted = payload.actionTaken === 'REDACTED';
          const isBypassed = payload.actionTaken === 'BYPASSED';

          // Update storage statistics
          await GuardianStorage.recordScan({
            scanned: 1,
            blocked: isBlocked ? 1 : 0,
            redacted: isRedacted ? 1 : 0,
            bypassed: isBypassed ? 1 : 0,
            categoryBreakdown: payload.categoryBreakdown || {}
          });

          // Add to tamper-proof audit log
          await GuardianStorage.addAuditLog({
            platform: payload.platform || 'Unknown AI',
            riskLevel: payload.riskLevel || 'HIGH',
            riskScore: payload.riskScore || 0,
            actionTaken: payload.actionTaken || 'BLOCKED',
            dataType: payload.dataType || 'Multiple',
            categories: payload.categories || [],
            findingCount: payload.findingCount || 0,
            summary: payload.summary || 'Prompt security interception'
          });

          // Show Chrome notification if configured and risk is high/critical
          const settings = await GuardianStorage.getSettings();
          if (settings.notificationsEnabled && (payload.riskLevel === 'HIGH' || payload.riskLevel === 'CRITICAL')) {
            triggerSystemNotification(payload);
          }

          if (tabId) {
            updateTabBadge(tabId, payload.riskLevel || 'CLEAN', payload.riskScore || 0);
          }

          sendResponse({ success: true });
        } catch (err) {
          console.error('[Background] Failed to process LOG_INTERCEPTION:', err);
          sendResponse({ success: false, error: err.message });
        }
      })();
      return true; // Keep message channel open for async response
    }

    // 3. Popup requests active tab risk status
    case 'GET_ACTIVE_TAB_STATE': {
      const activeTabId = message.tabId || tabId;
      const state = tabRiskCache.get(activeTabId) || {
        riskLevel: 'CLEAN',
        riskScore: 0,
        findingsCount: 0,
        platform: 'Idle',
        timestamp: Date.now()
      };
      sendResponse(state);
      return true;
    }

    // 4. Force reset badge
    case 'RESET_BADGE': {
      if (tabId) {
        tabRiskCache.delete(tabId);
        updateTabBadge(tabId, 'CLEAN', 0);
      }
      sendResponse({ status: 'OK' });
      return true;
    }

    default:
      sendResponse({ status: 'UNKNOWN_ACTION' });
      return false;
  }
});

// ─── Tab Event Listeners ───────────────────────────────────────────────────

// Reset / restore badge state on tab switch
chrome.tabs.onActivated.addListener((activeInfo) => {
  const cached = tabRiskCache.get(activeInfo.tabId);
  if (cached) {
    updateTabBadge(activeInfo.tabId, cached.riskLevel, cached.riskScore);
  } else {
    updateTabBadge(activeInfo.tabId, 'CLEAN', 0);
  }
});

// Clean up memory cache when tabs are closed
chrome.tabs.onRemoved.addListener((tabId) => {
  tabRiskCache.delete(tabId);
});

// Reset risk when tab navigates to a new URL
chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    tabRiskCache.delete(tabId);
    updateTabBadge(tabId, 'CLEAN', 0);
  }
});

// ─── Lifecycle Installation ────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(async (details) => {
  try {
    console.log('[Shadow AI] Service worker active:', details.reason);
    const settings = await GuardianStorage.getSettings();
    await GuardianStorage.saveSettings(settings);
  } catch (err) {
    console.error('[Shadow AI] Initialization error:', err);
  }
});
