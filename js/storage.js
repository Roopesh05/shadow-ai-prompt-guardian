/**
 * Shadow AI Prompt Guardian — Storage Abstraction Module
 * Version: 2.0.0 (Manifest V3 Production Build)
 *
 * Provides a resilient, quota-protected wrapper around chrome.storage.local
 * with full error handling, in-memory fallback, and export utilities.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.GuardianStorage = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // ─── Storage Keys ──────────────────────────────────────────────────────────

  const KEYS = {
    SETTINGS: 'shadow_guardian_settings',
    LOGS: 'shadow_guardian_logs',
    STATS: 'shadow_guardian_stats',
    THEME: 'shadow_guardian_theme'
  };

  // ─── Default Configurations ────────────────────────────────────────────────

  const DEFAULT_SETTINGS = {
    protectionActive: true,
    actionPolicy: 'block', // 'block' | 'warn' | 'redact'
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

  // In-memory fallback if chrome.storage is not available
  const memoryStore = {};

  /**
   * Safe getter with extension context check
   */
  async function rawGet(key) {
    return new Promise((resolve) => {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get([key], (result) => {
            if (chrome.runtime && chrome.runtime.lastError) {
              console.warn('[GuardianStorage] Read error:', chrome.runtime.lastError.message);
              resolve(memoryStore[key] || null);
            } else {
              resolve(result && result[key] !== undefined ? result[key] : null);
            }
          });
        } else {
          resolve(memoryStore[key] || null);
        }
      } catch (err) {
        console.warn('[GuardianStorage] Exception on read:', err);
        resolve(memoryStore[key] || null);
      }
    });
  }

  /**
   * Safe setter with extension context check & quota preservation
   */
  async function rawSet(key, value) {
    return new Promise((resolve, reject) => {
      try {
        memoryStore[key] = value;
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          const payload = {};
          payload[key] = value;
          chrome.storage.local.set(payload, () => {
            if (chrome.runtime && chrome.runtime.lastError) {
              console.error('[GuardianStorage] Write error:', chrome.runtime.lastError.message);
              resolve(false);
            } else {
              resolve(true);
            }
          });
        } else {
          resolve(true);
        }
      } catch (err) {
        console.error('[GuardianStorage] Exception on write:', err);
        resolve(false);
      }
    });
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  /**
   * Retrieves active settings with default fallbacks.
   * @returns {Promise<Object>}
   */
  async function getSettings() {
    try {
      const stored = await rawGet(KEYS.SETTINGS);
      if (!stored) return { ...DEFAULT_SETTINGS };
      return {
        ...DEFAULT_SETTINGS,
        ...stored,
        categories: { ...DEFAULT_SETTINGS.categories, ...(stored.categories || {}) }
      };
    } catch (err) {
      console.error('[GuardianStorage] getSettings failed:', err);
      return { ...DEFAULT_SETTINGS };
    }
  }

  /**
   * Updates partial settings.
   * @param {Object} partialSettings
   * @returns {Promise<Object>} Updated settings
   */
  async function saveSettings(partialSettings) {
    try {
      const current = await getSettings();
      const updated = {
        ...current,
        ...partialSettings,
        categories: {
          ...current.categories,
          ...(partialSettings.categories || {})
        }
      };
      await rawSet(KEYS.SETTINGS, updated);
      return updated;
    } catch (err) {
      console.error('[GuardianStorage] saveSettings failed:', err);
      return null;
    }
  }

  /**
   * Retrieves stored detection audit logs.
   * @returns {Promise<Array<Object>>}
   */
  async function getAuditLogs() {
    try {
      const logs = await rawGet(KEYS.LOGS);
      return Array.isArray(logs) ? logs : [];
    } catch (err) {
      console.error('[GuardianStorage] getAuditLogs failed:', err);
      return [];
    }
  }

  /**
   * Appends an audit log entry. Caps total entries at 300 to prevent quota issues.
   * @param {Object} entry
   * @returns {Promise<boolean>}
   */
  async function addAuditLog(entry) {
    try {
      const logs = await getAuditLogs();
      const newEntry = {
        id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
        timestamp: Date.now(),
        platform: entry.platform || 'Unknown AI',
        riskLevel: entry.riskLevel || 'CLEAN',
        riskScore: entry.riskScore || 0,
        actionTaken: entry.actionTaken || 'BLOCKED', // 'BLOCKED' | 'REDACTED' | 'BYPASSED'
        dataType: entry.dataType || 'Multiple',
        categories: entry.categories || [],
        findingCount: entry.findingCount || 0,
        summary: entry.summary || 'Sensitive prompt intercepted'
      };

      logs.unshift(newEntry);
      if (logs.length > 300) {
        logs.splice(300);
      }
      return await rawSet(KEYS.LOGS, logs);
    } catch (err) {
      console.error('[GuardianStorage] addAuditLog failed:', err);
      return false;
    }
  }

  /**
   * Clears all audit logs.
   * @returns {Promise<boolean>}
   */
  async function clearAuditLogs() {
    try {
      return await rawSet(KEYS.LOGS, []);
    } catch (err) {
      console.error('[GuardianStorage] clearAuditLogs failed:', err);
      return false;
    }
  }

  /**
   * Retrieves current security statistics.
   * @returns {Promise<Object>}
   */
  async function getStats() {
    try {
      const stats = await rawGet(KEYS.STATS);
      if (!stats) return { ...DEFAULT_STATS };
      return {
        ...DEFAULT_STATS,
        ...stats,
        categoryCounts: { ...DEFAULT_STATS.categoryCounts, ...(stats.categoryCounts || {}) }
      };
    } catch (err) {
      console.error('[GuardianStorage] getStats failed:', err);
      return { ...DEFAULT_STATS };
    }
  }

  /**
   * Updates scan and action statistics.
   * @param {Object} params
   * @returns {Promise<Object>}
   */
  async function recordScan({ scanned = 1, blocked = 0, redacted = 0, bypassed = 0, categoryBreakdown = {} }) {
    try {
      const current = await getStats();
      const newCounts = { ...current.categoryCounts };

      for (const cat in categoryBreakdown) {
        if (newCounts[cat] !== undefined) {
          newCounts[cat] += categoryBreakdown[cat];
        }
      }

      // Calculate top risk category
      let topCategory = 'None';
      let maxCount = 0;
      for (const cat in newCounts) {
        if (newCounts[cat] > maxCount) {
          maxCount = newCounts[cat];
          topCategory = cat.toUpperCase();
        }
      }

      const updated = {
        totalScanned: current.totalScanned + scanned,
        totalBlocked: current.totalBlocked + blocked,
        totalRedacted: current.totalRedacted + redacted,
        totalBypassed: current.totalBypassed + bypassed,
        topRiskCategory: topCategory,
        categoryCounts: newCounts,
        lastUpdated: Date.now()
      };

      await rawSet(KEYS.STATS, updated);
      return updated;
    } catch (err) {
      console.error('[GuardianStorage] recordScan failed:', err);
      return null;
    }
  }

  /**
   * Resets all accumulated stats.
   * @returns {Promise<boolean>}
   */
  async function resetStats() {
    try {
      return await rawSet(KEYS.STATS, { ...DEFAULT_STATS, lastUpdated: Date.now() });
    } catch (err) {
      console.error('[GuardianStorage] resetStats failed:', err);
      return false;
    }
  }

  /**
   * Exports audit logs formatted as JSON string.
   * @returns {Promise<string>}
   */
  async function exportLogsAsJSON() {
    const logs = await getAuditLogs();
    const stats = await getStats();
    const dump = {
      exportDate: new Date().toISOString(),
      extension: 'Shadow AI Prompt Guardian',
      version: '2.0.0',
      stats,
      logs
    };
    return JSON.stringify(dump, null, 2);
  }

  /**
   * Exports audit logs formatted as CSV string.
   * @returns {Promise<string>}
   */
  async function exportLogsAsCSV() {
    const logs = await getAuditLogs();
    const headers = ['ID', 'Timestamp', 'Date UTC', 'Platform', 'Risk Level', 'Risk Score', 'Action Taken', 'Data Type', 'Finding Count', 'Summary'];
    const rows = logs.map((log) => [
      `"${log.id}"`,
      log.timestamp,
      `"${new Date(log.timestamp).toISOString()}"`,
      `"${log.platform}"`,
      `"${log.riskLevel}"`,
      log.riskScore,
      `"${log.actionTaken}"`,
      `"${log.dataType}"`,
      log.findingCount,
      `"${(log.summary || '').replace(/"/g, '""')}"`
    ]);
    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  /**
   * Checks storage quota usage.
   * @returns {Promise<Object>}
   */
  async function checkQuota() {
    return new Promise((resolve) => {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local && chrome.storage.local.getBytesInUse) {
          chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
            const quota = chrome.storage.local.QUOTA_BYTES || 5242880; // 5MB standard MV3
            resolve({
              bytesInUse: bytesInUse || 0,
              quotaBytes: quota,
              usagePercentage: Number(((bytesInUse / quota) * 100).toFixed(2))
            });
          });
        } else {
          resolve({ bytesInUse: 1024, quotaBytes: 5242880, usagePercentage: 0.02 });
        }
      } catch (err) {
        resolve({ bytesInUse: 0, quotaBytes: 5242880, usagePercentage: 0 });
      }
    });
  }

  return {
    KEYS,
    DEFAULT_SETTINGS,
    DEFAULT_STATS,
    getSettings,
    saveSettings,
    getAuditLogs,
    addAuditLog,
    clearAuditLogs,
    getStats,
    recordScan,
    resetStats,
    exportLogsAsJSON,
    exportLogsAsCSV,
    checkQuota
  };
});
