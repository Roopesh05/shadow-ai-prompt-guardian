import { firebasePut, firebasePatch } from './firebase.js';

const STORAGE_KEYS = {
  SETTINGS: 'shadow_guardian_settings',
  LOGS: 'shadow_guardian_logs',
  STATS: 'shadow_guardian_stats',
  TEAM: 'shadow_guardian_team',
  OFFLINE_QUEUE: 'shadow_guardian_offline_queue'
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

const GuardianStorageWorker = {
  async ensureQuotaAvailable() {
    return new Promise((resolve) => {
      try {
        if (chrome.storage && chrome.storage.local && chrome.storage.local.getBytesInUse) {
          chrome.storage.local.getBytesInUse(null, (bytesInUse) => {
            if (chrome.runtime && chrome.runtime.lastError) {
              resolve(true);
              return;
            }
            if (bytesInUse > 4500000) {
              chrome.storage.local.get([STORAGE_KEYS.LOGS], (res) => {
                if (!chrome.runtime.lastError && res && Array.isArray(res[STORAGE_KEYS.LOGS])) {
                  const trimmed = res[STORAGE_KEYS.LOGS].slice(0, 100);
                  chrome.storage.local.set({ [STORAGE_KEYS.LOGS]: trimmed }, () => {
                    if (chrome.runtime && chrome.runtime.lastError) {}
                    resolve(true);
                  });
                } else {
                  resolve(true);
                }
              });
            } else {
              resolve(true);
            }
          });
        } else {
          resolve(true);
        }
      } catch (_) {
        resolve(true);
      }
    });
  },

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
    try {
      await this.ensureQuotaAvailable();
      const current = await this.getSettings();
      const updated = { ...current, ...partial };
      return new Promise((resolve) => {
        chrome.storage.local.set({ [STORAGE_KEYS.SETTINGS]: updated }, () => {
          if (chrome.runtime && chrome.runtime.lastError) {
            resolve(null);
            return;
          }
          resolve(updated);
        });
      });
    } catch (_) {
      return null;
    }
  },

  async getTeamInfo() {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get([STORAGE_KEYS.TEAM], (res) => {
          if (chrome.runtime && chrome.runtime.lastError) {
            resolve(null);
          } else {
            resolve((res && res[STORAGE_KEYS.TEAM]) || null);
          }
        });
      } catch (_) {
        resolve(null);
      }
    });
  },

  async addAuditLog(entry) {
    try {
      await this.ensureQuotaAvailable();
      return new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEYS.LOGS], (res) => {
          if (chrome.runtime && chrome.runtime.lastError) {
            resolve(null);
            return;
          }
          const logs = (res && Array.isArray(res[STORAGE_KEYS.LOGS])) ? res[STORAGE_KEYS.LOGS] : [];
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
          if (logs.length > 500) logs.splice(500);
          chrome.storage.local.set({ [STORAGE_KEYS.LOGS]: logs }, () => {
            if (chrome.runtime && chrome.runtime.lastError) {
              resolve(null);
              return;
            }
            resolve(newEntry);
          });
        });
      });
    } catch (_) {
      return null;
    }
  },

  async recordScan({ scanned = 1, blocked = 0, redacted = 0, bypassed = 0, categoryBreakdown = {} }) {
    try {
      await this.ensureQuotaAvailable();
      return new Promise((resolve) => {
        chrome.storage.local.get([STORAGE_KEYS.STATS], (res) => {
          if (chrome.runtime && chrome.runtime.lastError) {
            resolve(null);
            return;
          }
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

          chrome.storage.local.set({ [STORAGE_KEYS.STATS]: updated }, () => {
            if (chrome.runtime && chrome.runtime.lastError) {
              resolve(null);
              return;
            }
            resolve(updated);
          });
        });
      });
    } catch (_) {
      return null;
    }
  },

  async enqueueOfflineLog(logItem) {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get([STORAGE_KEYS.OFFLINE_QUEUE], (res) => {
          if (chrome.runtime && chrome.runtime.lastError) {
            resolve(false);
            return;
          }
          const queue = (res && Array.isArray(res[STORAGE_KEYS.OFFLINE_QUEUE])) ? res[STORAGE_KEYS.OFFLINE_QUEUE] : [];
          queue.push(logItem);
          if (queue.length > 200) queue.shift();
          chrome.storage.local.set({ [STORAGE_KEYS.OFFLINE_QUEUE]: queue }, () => {
            if (chrome.runtime && chrome.runtime.lastError) {
              resolve(false);
              return;
            }
            resolve(true);
          });
        });
      } catch (_) {
        resolve(false);
      }
    });
  },

  async getOfflineQueue() {
    return new Promise((resolve) => {
      try {
        chrome.storage.local.get([STORAGE_KEYS.OFFLINE_QUEUE], (res) => {
          if (chrome.runtime && chrome.runtime.lastError) {
            resolve([]);
            return;
          }
          resolve((res && Array.isArray(res[STORAGE_KEYS.OFFLINE_QUEUE])) ? res[STORAGE_KEYS.OFFLINE_QUEUE] : []);
        });
      } catch (_) {
        resolve([]);
      }
    });
  }
};

const tabRiskCache = new Map();

const BADGE_CONFIG = {
  CLEAN: { text: '', color: '#00FF88' },
  LOW: { text: 'LOW', color: '#00F5FF' },
  MEDIUM: { text: 'MED', color: '#FF9500' },
  HIGH: { text: 'HIGH', color: '#FF3B5C' },
  CRITICAL: { text: '!', color: '#FF3B5C' }
};

function updateTabBadge(tabId, riskLevel, riskScore = 0) {
  if (!tabId || typeof tabId !== 'number') return;
  const cfg = BADGE_CONFIG[riskLevel] || BADGE_CONFIG.CLEAN;
  const badgeText = riskLevel === 'CLEAN' ? '' : (riskLevel === 'CRITICAL' ? '!' : `${riskScore}`);

  try {
    if (chrome.action && chrome.action.setBadgeText) {
      chrome.action.setBadgeText({ tabId, text: badgeText }, () => {
        if (chrome.runtime && chrome.runtime.lastError) {}
      });
    }
    if (chrome.action && chrome.action.setBadgeBackgroundColor) {
      chrome.action.setBadgeBackgroundColor({ tabId, color: cfg.color }, () => {
        if (chrome.runtime && chrome.runtime.lastError) {}
      });
    }
  } catch (_) {}
}

function triggerSystemNotification(details) {
  try {
    if (!chrome.notifications || !chrome.notifications.create) return;
    const notifId = 'shadow_alert_' + Date.now();
    const severityPrefix = details.riskLevel === 'CRITICAL' ? '[CRITICAL ALERT]' : '[HIGH RISK WARNING]';
    const categoriesStr = Array.isArray(details.categories) ? details.categories.join(', ') : 'Confidential Data';

    chrome.notifications.create(
      notifId,
      {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: `${severityPrefix} Prompt Leak Blocked`,
        message: `Shadow AI intercepted ${details.findingCount || 1} sensitive item(s) (${categoriesStr}) on ${details.platform || 'AI Platform'}. Outbound prompt was protected.`,
        priority: 2,
        requireInteraction: false
      },
      () => {
        if (chrome.runtime && chrome.runtime.lastError) {}
      }
    );
  } catch (_) {}
}

async function syncLogToFirebase(logData) {
  try {
    const teamInfo = await GuardianStorageWorker.getTeamInfo();
    if (!teamInfo || !teamInfo.teamCode) return { success: false, error: 'No team configured' };

    const logId = 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);
    const payload = {
      deviceId: teamInfo.deviceId || 'unknown_device',
      memberName: teamInfo.name || 'Anonymous Member',
      timestamp: Date.now(),
      platform: logData.platform || 'Unknown AI',
      riskScore: logData.riskScore || 0,
      riskLevel: logData.riskLevel || 'CLEAN',
      actionTaken: logData.actionTaken || 'BLOCKED',
      detectedTypes: Array.isArray(logData.categories) ? logData.categories : (logData.dataType ? [logData.dataType] : []),
      promptExcerpt: logData.promptExcerpt || '[REDACTED for privacy]',
      sessionId: logData.sessionId || ('sess_' + Date.now())
    };

    const path = `teams/${teamInfo.teamCode}/logs/${logId}`;
    const res = await firebasePut(path, payload);

    if (!res.success) {
      await GuardianStorageWorker.enqueueOfflineLog({ path, payload });
    }

    return res;
  } catch (err) {
    return { success: false, error: err.message };
  }
}

async function flushOfflineQueue() {
  try {
    const queue = await GuardianStorageWorker.getOfflineQueue();
    if (!queue || queue.length === 0) return;

    const remaining = [];
    for (const item of queue) {
      const res = await firebasePut(item.path, item.payload);
      if (!res.success) {
        remaining.push(item);
      }
    }

    chrome.storage.local.set({ [STORAGE_KEYS.OFFLINE_QUEUE]: remaining }, () => {
      if (chrome.runtime && chrome.runtime.lastError) {}
    });
  } catch (_) {}
}

async function sendMemberHeartbeat() {
  try {
    const teamInfo = await GuardianStorageWorker.getTeamInfo();
    if (!teamInfo || !teamInfo.teamCode || !teamInfo.deviceId) return;

    const path = `teams/${teamInfo.teamCode}/members/${teamInfo.deviceId}`;
    await firebasePatch(path, {
      name: teamInfo.name || 'Team Member',
      lastSeen: Date.now(),
      status: 'active'
    });

    await flushOfflineQueue();
  } catch (_) {}
}

try {
  chrome.alarms.create('SHADOW_HEARTBEAT_ALARM', { periodInMinutes: 1 });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'SHADOW_HEARTBEAT_ALARM') {
      sendMemberHeartbeat();
    }
  });
} catch (_) {}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.action) return false;
  const tabId = sender.tab ? sender.tab.id : null;

  switch (message.action) {
    case 'PROMPT_EVALUATED': {
      try {
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
      } catch (err) {
        sendResponse({ status: 'ERROR', error: err.message });
      }
      return true;
    }

    case 'LOG_INTERCEPTION': {
      (async () => {
        try {
          const payload = message.payload || {};
          const isBlocked = payload.actionTaken === 'BLOCKED';
          const isRedacted = payload.actionTaken === 'REDACTED';
          const isBypassed = payload.actionTaken === 'ALLOWED' || payload.actionTaken === 'BYPASSED';

          await GuardianStorageWorker.recordScan({
            scanned: 1,
            blocked: isBlocked ? 1 : 0,
            redacted: isRedacted ? 1 : 0,
            bypassed: isBypassed ? 1 : 0,
            categoryBreakdown: payload.categoryBreakdown || {}
          });

          await GuardianStorageWorker.addAuditLog({
            platform: payload.platform || 'Unknown AI',
            riskLevel: payload.riskLevel || 'HIGH',
            riskScore: payload.riskScore || 0,
            actionTaken: payload.actionTaken || 'BLOCKED',
            dataType: payload.dataType || 'Multiple',
            categories: payload.categories || [],
            findingCount: payload.findingCount || 0,
            summary: payload.summary || 'Sensitive prompt intercepted',
            promptExcerpt: payload.promptExcerpt || '[REDACTED for privacy]'
          });

          syncLogToFirebase(payload);

          const settings = await GuardianStorageWorker.getSettings();
          if (settings.notificationsEnabled && (payload.riskLevel === 'HIGH' || payload.riskLevel === 'CRITICAL')) {
            triggerSystemNotification(payload);
          }

          if (tabId) {
            updateTabBadge(tabId, payload.riskLevel || 'CLEAN', payload.riskScore || 0);
          }

          sendResponse({ success: true });
        } catch (err) {
          sendResponse({ success: false, error: err.message });
        }
      })();
      return true;
    }

    case 'GET_ACTIVE_TAB_STATE': {
      try {
        const activeTabId = message.tabId || tabId;
        const state = tabRiskCache.get(activeTabId) || {
          riskLevel: 'CLEAN',
          riskScore: 0,
          findingsCount: 0,
          platform: 'Idle',
          timestamp: Date.now()
        };
        sendResponse(state);
      } catch (err) {
        sendResponse({ riskLevel: 'CLEAN', riskScore: 0 });
      }
      return true;
    }

    case 'RESET_BADGE': {
      try {
        if (tabId) {
          tabRiskCache.delete(tabId);
          updateTabBadge(tabId, 'CLEAN', 0);
        }
        sendResponse({ status: 'OK' });
      } catch (err) {
        sendResponse({ status: 'ERROR', error: err.message });
      }
      return true;
    }

    case 'MANUAL_HEARTBEAT': {
      sendMemberHeartbeat().then(() => sendResponse({ status: 'OK' }));
      return true;
    }

    default:
      sendResponse({ status: 'UNKNOWN_ACTION' });
      return false;
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  try {
    const cached = tabRiskCache.get(activeInfo.tabId);
    if (cached) {
      updateTabBadge(activeInfo.tabId, cached.riskLevel, cached.riskScore);
    } else {
      updateTabBadge(activeInfo.tabId, 'CLEAN', 0);
    }
  } catch (_) {}
});

chrome.tabs.onRemoved.addListener((tabId) => {
  try {
    tabRiskCache.delete(tabId);
  } catch (_) {}
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  try {
    if (changeInfo.status === 'loading') {
      tabRiskCache.delete(tabId);
      updateTabBadge(tabId, 'CLEAN', 0);
    }
  } catch (_) {}
});

chrome.runtime.onInstalled.addListener(async () => {
  try {
    const settings = await GuardianStorageWorker.getSettings();
    await GuardianStorageWorker.saveSettings(settings);

    const teamInfo = await GuardianStorageWorker.getTeamInfo();
    if (!teamInfo || !teamInfo.teamCode) {
      const setupUrl = chrome.runtime.getURL('setup.html');
      chrome.tabs.query({}, (tabs) => {
        if (chrome.runtime && chrome.runtime.lastError) {
          chrome.tabs.create({ url: setupUrl }, () => {
            if (chrome.runtime && chrome.runtime.lastError) {}
          });
          return;
        }
        const existingTab = Array.isArray(tabs) ? tabs.find(t => t.url && t.url.includes('setup.html')) : null;
        if (existingTab && existingTab.id) {
          chrome.tabs.update(existingTab.id, { active: true }, () => {
            if (chrome.runtime && chrome.runtime.lastError) {}
          });
        } else {
          chrome.tabs.create({ url: setupUrl }, () => {
            if (chrome.runtime && chrome.runtime.lastError) {}
          });
        }
      });
    }
  } catch (_) {}
});
