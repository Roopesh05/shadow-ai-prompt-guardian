/**
 * Shadow AI Prompt Guardian — Storage Abstraction Module
 * Version: 2.0.0 (Manifest V3 Production Build — TL Edition)
 *
 * Provides a resilient, quota-protected wrapper around chrome.storage.local
 * with full error handling, in-memory fallback, and team telemetry utilities.
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
    THEME: 'shadow_guardian_theme',
    TEAM: 'shadow_guardian_team',
    OFFLINE_QUEUE: 'shadow_guardian_offline_queue'
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

  const memoryStore = {};

  // ─── Quota Guard & Pruning (Checklist 7) ────────────────────────────────────

  /**
   * FIFO pruning: removes oldest log entries first.
   * Since entries are unshifted (newest first, oldest last),
   * trimming the end removes the oldest logs.
   */
  async function pruneOldLogs() {
    return new Promise((resolve) => {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get([KEYS.LOGS], (res) => {
            if (chrome.runtime && chrome.runtime.lastError) {
              resolve(false);
              return;
            }
            const logs = (res && Array.isArray(res[KEYS.LOGS])) ? res[KEYS.LOGS] : [];
            if (logs.length > 50) {
              // Retain newest 100 entries, pruning oldest
              const pruned = logs.slice(0, 100);
              chrome.storage.local.set({ [KEYS.LOGS]: pruned }, () => {
                if (chrome.runtime && chrome.runtime.lastError) {}
                resolve(true);
              });
            } else {
              resolve(true);
            }
          });
        } else {
          if (Array.isArray(memoryStore[KEYS.LOGS])) {
            memoryStore[KEYS.LOGS] = memoryStore[KEYS.LOGS].slice(0, 100);
          }
          resolve(true);
        }
      } catch (_) {
        resolve(false);
      }
    });
  }

  function checkQuotaBeforeWrite() {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local && chrome.storage.local.getBytesInUse) {
        chrome.storage.local.getBytesInUse(null, (bytes) => {
          if (chrome.runtime && chrome.runtime.lastError) return;
          if (bytes > 4500000) {
            pruneOldLogs();
          }
        });
      }
    } catch (_) {}
  }

  async function rawGet(key, defaultValue = null) {
    return new Promise((resolve) => {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          chrome.storage.local.get([key], (result) => {
            if (chrome.runtime && chrome.runtime.lastError) {
              resolve(memoryStore[key] !== undefined ? memoryStore[key] : defaultValue);
            } else {
              resolve(result && result[key] !== undefined ? result[key] : (memoryStore[key] !== undefined ? memoryStore[key] : defaultValue));
            }
          });
        } else {
          resolve(memoryStore[key] !== undefined ? memoryStore[key] : defaultValue);
        }
      } catch (_) {
        resolve(memoryStore[key] !== undefined ? memoryStore[key] : defaultValue);
      }
    });
  }

  async function rawSet(key, value) {
    checkQuotaBeforeWrite();
    memoryStore[key] = value;

    return new Promise((resolve) => {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
          const payload = {};
          payload[key] = value;
          chrome.storage.local.set(payload, () => {
            if (chrome.runtime && chrome.runtime.lastError) {
              resolve(false);
            } else {
              resolve(true);
            }
          });
        } else {
          resolve(true);
        }
      } catch (_) {
        resolve(false);
      }
    });
  }

  // ─── Public API ────────────────────────────────────────────────────────────

  async function getSettings() {
    try {
      const stored = await rawGet(KEYS.SETTINGS, null);
      if (!stored) return { ...DEFAULT_SETTINGS };
      return {
        ...DEFAULT_SETTINGS,
        ...stored,
        categories: { ...DEFAULT_SETTINGS.categories, ...(stored.categories || {}) }
      };
    } catch (_) {
      return { ...DEFAULT_SETTINGS };
    }
  }

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
    } catch (_) {
      return null;
    }
  }

  async function getAuditLogs() {
    try {
      const logs = await rawGet(KEYS.LOGS, []);
      return Array.isArray(logs) ? logs : [];
    } catch (_) {
      return [];
    }
  }

  async function addAuditLog(entry) {
    try {
      const logs = await getAuditLogs();
      const newEntry = {
        id: entry.id || ('log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7)),
        timestamp: entry.timestamp || Date.now(),
        platform: entry.platform || 'Unknown AI',
        riskLevel: entry.riskLevel || 'CLEAN',
        riskScore: entry.riskScore || 0,
        actionTaken: entry.actionTaken || 'BLOCKED',
        dataType: entry.dataType || 'Multiple',
        categories: entry.categories || [],
        findingCount: entry.findingCount || 0,
        summary: entry.summary || 'Sensitive prompt intercepted',
        promptExcerpt: entry.promptExcerpt || '[REDACTED for privacy]'
      };

      logs.unshift(newEntry);
      // Capped at 500 entries max (Checklist 7)
      if (logs.length > 500) {
        logs.splice(500);
      }
      await rawSet(KEYS.LOGS, logs);
      return newEntry;
    } catch (_) {
      return null;
    }
  }

  async function clearAuditLogs() {
    try {
      return await rawSet(KEYS.LOGS, []);
    } catch (_) {
      return false;
    }
  }

  async function getStats() {
    try {
      const stats = await rawGet(KEYS.STATS, null);
      if (!stats) return { ...DEFAULT_STATS };
      return {
        ...DEFAULT_STATS,
        ...stats,
        categoryCounts: { ...DEFAULT_STATS.categoryCounts, ...(stats.categoryCounts || {}) }
      };
    } catch (_) {
      return { ...DEFAULT_STATS };
    }
  }

  async function recordScan({ scanned = 1, blocked = 0, redacted = 0, bypassed = 0, categoryBreakdown = {} }) {
    try {
      const current = await getStats();
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

      await rawSet(KEYS.STATS, updated);
      return updated;
    } catch (_) {
      return null;
    }
  }

  async function resetStats() {
    try {
      return await rawSet(KEYS.STATS, { ...DEFAULT_STATS, lastUpdated: Date.now() });
    } catch (_) {
      return false;
    }
  }

  // ─── Team Leader / Member Configuration ─────────────────────────────────────

  /**
   * Retrieves or creates a persistent device ID for this extension instance.
   * @returns {Promise<string>}
   */
  async function getDeviceId() {
    let team = await rawGet(KEYS.TEAM, null);
    if (team && team.deviceId) return team.deviceId;

    const newId = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
    if (!team) team = {};
    team.deviceId = newId;
    await rawSet(KEYS.TEAM, team);
    return newId;
  }

  async function getTeamInfo() {
    try {
      const info = await rawGet(KEYS.TEAM, null);
      return info || null;
    } catch (_) {
      return null;
    }
  }

  async function saveTeamInfo(info) {
    try {
      const current = (await getTeamInfo()) || {};
      const updated = { ...current, ...info };
      await rawSet(KEYS.TEAM, updated);
      return updated;
    } catch (_) {
      return null;
    }
  }

  async function clearTeamInfo() {
    try {
      return await rawSet(KEYS.TEAM, null);
    } catch (_) {
      return false;
    }
  }

  // ─── Offline Queue Management ──────────────────────────────────────────────

  async function getOfflineQueue() {
    try {
      const q = await rawGet(KEYS.OFFLINE_QUEUE, []);
      return Array.isArray(q) ? q : [];
    } catch (_) {
      return [];
    }
  }

  async function enqueueOfflineLog(item) {
    try {
      const q = await getOfflineQueue();
      q.push(item);
      if (q.length > 200) q.shift();
      return await rawSet(KEYS.OFFLINE_QUEUE, q);
    } catch (_) {
      return false;
    }
  }

  async function clearOfflineQueue() {
    try {
      return await rawSet(KEYS.OFFLINE_QUEUE, []);
    } catch (_) {
      return false;
    }
  }

  // ─── Export Utilities ──────────────────────────────────────────────────────

  async function exportLogsAsJSON() {
    try {
      const logs = await getAuditLogs();
      const stats = await getStats();
      const team = await getTeamInfo();
      const dump = {
        exportDate: new Date().toISOString(),
        extension: 'Shadow AI Prompt Guardian',
        version: '2.0.0',
        team: team || { role: 'STANDALONE' },
        stats,
        logs
      };
      return JSON.stringify(dump, null, 2);
    } catch (_) {
      return '{}';
    }
  }

  async function exportLogsAsCSV() {
    try {
      const logs = await getAuditLogs();
      const headers = ['ID', 'Timestamp', 'Date UTC', 'Platform', 'Risk Level', 'Risk Score', 'Action Taken', 'Data Type', 'Finding Count', 'Prompt Excerpt'];
      const rows = logs.map((log) => [
        `"${log.id || ''}"`,
        log.timestamp || 0,
        `"${new Date(log.timestamp || Date.now()).toISOString()}"`,
        `"${log.platform || ''}"`,
        `"${log.riskLevel || ''}"`,
        log.riskScore || 0,
        `"${log.actionTaken || ''}"`,
        `"${log.dataType || ''}"`,
        log.findingCount || 0,
        `"${(log.promptExcerpt || '').replace(/"/g, '""')}"`
      ]);
      return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    } catch (_) {
      return '';
    }
  }

  async function checkQuota() {
    return new Promise((resolve) => {
      try {
        if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local && chrome.storage.local.getBytesInUse) {
          chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
            const quota = chrome.storage.local.QUOTA_BYTES || 5242880;
            resolve({
              bytesInUse: bytesInUse || 0,
              quotaBytes: quota,
              usagePercentage: Number(((bytesInUse / quota) * 100).toFixed(2))
            });
          });
        } else {
          resolve({ bytesInUse: 1024, quotaBytes: 5242880, usagePercentage: 0.02 });
        }
      } catch (_) {
        resolve({ bytesInUse: 0, quotaBytes: 5242880, usagePercentage: 0 });
      }
    });
  }

  return {
    KEYS,
    DEFAULT_SETTINGS,
    DEFAULT_STATS,
    pruneOldLogs,
    checkQuotaBeforeWrite,
    getSettings,
    saveSettings,
    getAuditLogs,
    addAuditLog,
    clearAuditLogs,
    getStats,
    recordScan,
    resetStats,
    getDeviceId,
    getTeamInfo,
    saveTeamInfo,
    clearTeamInfo,
    getOfflineQueue,
    enqueueOfflineLog,
    clearOfflineQueue,
    exportLogsAsJSON,
    exportLogsAsCSV,
    checkQuota
  };
});
