/**
 * Shadow AI Prompt Guardian — Popup Dashboard Controller
 * Version: 2.0.0 (Manifest V3 Production Build)
 *
 * Handles:
 *  - Tab navigation
 *  - Animated circular SVG risk score gauge
 *  - Real-time statistics & active target tab monitoring
 *  - Filterable & searchable audit log view
 *  - Configuration toggles & watchlist/whitelist management
 *  - JSON & CSV export downloads
 *  - Light/Dark theme switching
 */

(function () {
  'use strict';

  // ─── DOM Element References ────────────────────────────────────────────────
  const elements = {
    // Tabs
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),

    // Theme & Header
    themeToggle: document.getElementById('theme-toggle'),
    themeIconMoon: document.querySelector('.theme-icon-moon'),
    themeIconSun: document.querySelector('.theme-icon-sun'),
    headerStatusPill: document.getElementById('header-status-pill'),
    headerStatusText: document.getElementById('header-status-text'),

    // Dashboard: Gauge & Stats
    gaugeCircle: document.getElementById('gauge-circle'),
    riskScoreDisplay: document.getElementById('risk-score-display'),
    riskStatusText: document.getElementById('risk-status-text'),
    riskStatusDesc: document.getElementById('risk-status-desc'),
    statScanned: document.getElementById('stat-scanned'),
    statBlocked: document.getElementById('stat-blocked'),
    statTopCat: document.getElementById('stat-top-cat'),
    currentPlatformBadge: document.getElementById('current-platform-badge'),
    liveTabStatus: document.getElementById('live-tab-status'),
    alertsCountBadge: document.getElementById('alerts-count-badge'),
    recentAlertsList: document.getElementById('recent-alerts-list'),
    footerTicker: document.getElementById('footer-ticker'),

    // Scan Log Tab
    filterPills: document.querySelectorAll('#log-filter-pills .pill-btn'),
    logSearchInput: document.getElementById('log-search-input'),
    fullAuditLogList: document.getElementById('full-audit-log-list'),
    btnClearAuditLogs: document.getElementById('btn-clear-audit-logs'),

    // Settings Tab
    toggleMasterProtection: document.getElementById('toggle-master-protection'),
    toggleCatPii: document.getElementById('toggle-cat-pii'),
    toggleCatFinancial: document.getElementById('toggle-cat-financial'),
    toggleCatCredentials: document.getElementById('toggle-cat-credentials'),
    toggleCatOrganizational: document.getElementById('toggle-cat-organizational'),
    toggleCatMedical: document.getElementById('toggle-cat-medical'),
    inputNewKeyword: document.getElementById('input-new-keyword'),
    btnAddKeyword: document.getElementById('btn-add-keyword'),
    watchlistTagsContainer: document.getElementById('watchlist-tags-container'),
    inputNewDomain: document.getElementById('input-new-domain'),
    btnAddDomain: document.getElementById('btn-add-domain'),
    whitelistTagsContainer: document.getElementById('whitelist-tags-container'),
    btnExportJson: document.getElementById('btn-export-json'),
    btnExportCsv: document.getElementById('btn-export-csv'),
    btnResetStats: document.getElementById('btn-reset-stats')
  };

  // ─── Local State ───────────────────────────────────────────────────────────
  let currentSettings = null;
  let currentLogs = [];
  let currentFilter = 'ALL';
  let searchQuery = '';

  // ─── Initialization ────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', async () => {
    try {
      setupTabNavigation();
      setupTheme();
      await loadSettings();
      await loadStatsAndActiveTarget();
      await loadLogs();
      setupEventListeners();
    } catch (err) {
      console.error('[Popup] Initialization error:', err);
    }
  });

  // ─── Tab Navigation ────────────────────────────────────────────────────────
  function setupTabNavigation() {
    elements.tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');
        elements.tabButtons.forEach((b) => b.classList.remove('active'));
        elements.tabPanes.forEach((p) => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add('active');

        if (targetId === 'tab-logs') {
          renderLogs();
        }
      });
    });
  }

  // ─── Theme Management ──────────────────────────────────────────────────────
  function setupTheme() {
    const isDark = localStorage.getItem('shadow_theme') !== 'light';
    applyTheme(isDark);

    elements.themeToggle.addEventListener('click', () => {
      const currentlyDark = document.body.classList.contains('dark-theme');
      applyTheme(!currentlyDark);
      localStorage.setItem('shadow_theme', !currentlyDark ? 'dark' : 'light');
    });
  }

  function applyTheme(isDark) {
    if (isDark) {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      elements.themeIconMoon.style.display = 'block';
      elements.themeIconSun.style.display = 'none';
    } else {
      document.body.classList.remove('dark-theme');
      document.body.classList.add('light-theme');
      elements.themeIconMoon.style.display = 'none';
      elements.themeIconSun.style.display = 'block';
    }
  }

  // ─── Circular SVG Gauge Meter ──────────────────────────────────────────────
  const GAUGE_CIRCUMFERENCE = 2 * Math.PI * 50; // 314.16

  function setRiskGauge(score) {
    const clamped = Math.min(100, Math.max(0, score));
    const offset = GAUGE_CIRCUMFERENCE - (clamped / 100) * GAUGE_CIRCUMFERENCE;

    if (elements.gaugeCircle) {
      elements.gaugeCircle.style.strokeDashoffset = offset;

      // Color tier assignment
      let strokeColor = '#00F5FF'; // Clean cyan
      let statusTitle = 'SYSTEM SECURE';
      let statusDesc = 'All prompt vectors actively protected.';

      if (clamped >= 80) {
        strokeColor = '#EF4444'; // Neon red
        statusTitle = 'CRITICAL THREAT';
        statusDesc = 'High-risk confidential leak intercepted.';
      } else if (clamped >= 50) {
        strokeColor = '#F97316'; // Orange
        statusTitle = 'ELEVATED RISK';
        statusDesc = 'Potentially sensitive secrets in prompt.';
      } else if (clamped >= 25) {
        strokeColor = '#F59E0B'; // Amber
        statusTitle = 'MEDIUM CONCERN';
        statusDesc = 'PII or organizational keywords present.';
      } else if (clamped > 0) {
        strokeColor = '#06B6D4'; // Light cyan
        statusTitle = 'LOW RISK';
        statusDesc = 'Minor identifiers detected.';
      }

      elements.gaugeCircle.style.stroke = strokeColor;
      elements.gaugeCircle.style.filter = `drop-shadow(0 0 8px ${strokeColor})`;
      elements.riskScoreDisplay.textContent = clamped;
      elements.riskScoreDisplay.style.color = strokeColor;
      elements.riskStatusText.textContent = statusTitle;
      elements.riskStatusText.style.color = strokeColor;
      elements.riskStatusDesc.textContent = statusDesc;
    }
  }

  // ─── Settings Controller ───────────────────────────────────────────────────
  async function loadSettings() {
    if (typeof GuardianStorage === 'undefined') return;
    currentSettings = await GuardianStorage.getSettings();

    // Master toggle
    elements.toggleMasterProtection.checked = currentSettings.protectionActive !== false;
    updateHeaderStatus(elements.toggleMasterProtection.checked);

    // Categories
    const cats = currentSettings.categories || {};
    elements.toggleCatPii.checked = cats.pii !== false;
    elements.toggleCatFinancial.checked = cats.financial !== false;
    elements.toggleCatCredentials.checked = cats.credentials !== false;
    elements.toggleCatOrganizational.checked = cats.organizational !== false;
    elements.toggleCatMedical.checked = cats.medical_legal !== false;

    // Watchlist & Whitelist
    renderWatchlistTags();
    renderWhitelistTags();
  }

  function updateHeaderStatus(isActive) {
    if (isActive) {
      elements.headerStatusPill.className = 'status-pill active';
      elements.headerStatusText.textContent = 'SHIELD ON';
    } else {
      elements.headerStatusPill.className = 'status-pill paused';
      elements.headerStatusText.textContent = 'PAUSED';
    }
  }

  function renderWatchlistTags() {
    elements.watchlistTagsContainer.innerHTML = '';
    const list = (currentSettings && currentSettings.keywordWatchlist) || [];
    list.forEach((kw, idx) => {
      const chip = document.createElement('div');
      chip.className = 'tag-chip';
      chip.innerHTML = `
        <span>${escapeHtml(kw)}</span>
        <button class="tag-chip-remove" data-idx="${idx}" title="Remove">&times;</button>
      `;
      chip.querySelector('.tag-chip-remove').addEventListener('click', async () => {
        list.splice(idx, 1);
        await GuardianStorage.saveSettings({ keywordWatchlist: list });
        renderWatchlistTags();
      });
      elements.watchlistTagsContainer.appendChild(chip);
    });
  }

  function renderWhitelistTags() {
    elements.whitelistTagsContainer.innerHTML = '';
    const list = (currentSettings && currentSettings.whitelistedDomains) || [];
    list.forEach((dom, idx) => {
      const chip = document.createElement('div');
      chip.className = 'tag-chip';
      chip.innerHTML = `
        <span>${escapeHtml(dom)}</span>
        <button class="tag-chip-remove" data-idx="${idx}" title="Remove">&times;</button>
      `;
      chip.querySelector('.tag-chip-remove').addEventListener('click', async () => {
        list.splice(idx, 1);
        await GuardianStorage.saveSettings({ whitelistedDomains: list });
        renderWhitelistTags();
      });
      elements.whitelistTagsContainer.appendChild(chip);
    });
  }

  // ─── Stats & Active Tab State ──────────────────────────────────────────────
  async function loadStatsAndActiveTarget() {
    if (typeof GuardianStorage === 'undefined') return;

    const stats = await GuardianStorage.getStats();
    elements.statScanned.textContent = stats.totalScanned || 0;
    elements.statBlocked.textContent = stats.totalBlocked || 0;
    elements.statTopCat.textContent = stats.topRiskCategory || 'NONE';
    elements.footerTicker.textContent = `⚡ ${stats.totalScanned || 0} Prompts Guarded`;

    // Fetch active tab state from background
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.query) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime && chrome.runtime.lastError) return;
        if (tabs && tabs[0]) {
          const tab = tabs[0];
          chrome.runtime.sendMessage({ action: 'GET_ACTIVE_TAB_STATE', tabId: tab.id }, (response) => {
            if (chrome.runtime && chrome.runtime.lastError) {
              setRiskGauge(0);
              return;
            }
            if (response) {
              elements.currentPlatformBadge.textContent = response.platform || 'Active Tab';
              setRiskGauge(response.riskScore || 0);

              if (response.riskLevel === 'CLEAN') {
                elements.liveTabStatus.textContent = `Clean session on ${response.platform || 'Target'}. No leakage detected.`;
              } else {
                elements.liveTabStatus.innerHTML = `<span style="color: #FF4D6D; font-weight: 700;">⚠️ ${response.riskLevel} (${response.riskScore}/100)</span>: ${response.findingsCount} flagged sensitive item(s).`;
              }
            } else {
              setRiskGauge(0);
            }
          });
        }
      });
    }
  }

  // ─── Audit Log Loader & Renderer ───────────────────────────────────────────
  async function loadLogs() {
    if (typeof GuardianStorage === 'undefined') return;
    currentLogs = await GuardianStorage.getAuditLogs();
    renderRecentAlerts();
    renderLogs();
  }

  function renderRecentAlerts() {
    const recent = currentLogs.slice(0, 3);
    elements.alertsCountBadge.textContent = `${currentLogs.length} events`;

    if (recent.length === 0) {
      elements.recentAlertsList.innerHTML = `
        <div class="empty-state">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="m9 12 2 2 4-4"/>
          </svg>
          <span>No blocked attempts yet. Your AI prompts are safe.</span>
        </div>
      `;
      return;
    }

    elements.recentAlertsList.innerHTML = '';
    recent.forEach((log) => {
      const item = document.createElement('div');
      item.className = 'alert-item-mini';
      const levelClass = (log.riskLevel || 'LOW').toLowerCase();

      item.innerHTML = `
        <div class="alert-item-left">
          <span class="badge-risk-chip ${levelClass}">${log.riskLevel}</span>
          <div>
            <div style="font-weight: 600; color: #FFFFFF;">${escapeHtml(log.platform)}</div>
            <div style="font-size: 9px; color: #94A3B8;">${escapeHtml(log.dataType)}</div>
          </div>
        </div>
        <div style="text-align: right;">
          <span class="log-action-badge ${log.actionTaken}">${log.actionTaken}</span>
          <div style="font-size: 8px; color: #64748B; font-family: monospace; margin-top: 2px;">
            ${formatRelativeTime(log.timestamp)}
          </div>
        </div>
      `;
      elements.recentAlertsList.appendChild(item);
    });
  }

  function renderLogs() {
    if (!elements.fullAuditLogList) return;

    const filtered = currentLogs.filter((log) => {
      // Risk level filter
      if (currentFilter !== 'ALL' && log.riskLevel !== currentFilter) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const pMatch = (log.platform || '').toLowerCase().includes(q);
        const dMatch = (log.dataType || '').toLowerCase().includes(q);
        const aMatch = (log.actionTaken || '').toLowerCase().includes(q);
        return pMatch || dMatch || aMatch;
      }
      return true;
    });

    if (filtered.length === 0) {
      elements.fullAuditLogList.innerHTML = `
        <div class="empty-state">
          <span>No logs match the current filter.</span>
        </div>
      `;
      return;
    }

    elements.fullAuditLogList.innerHTML = '';
    filtered.forEach((log) => {
      const card = document.createElement('div');
      card.className = 'log-entry-card';
      const levelClass = (log.riskLevel || 'LOW').toLowerCase();

      card.innerHTML = `
        <div class="log-entry-top">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="badge-risk-chip ${levelClass}">${log.riskLevel}</span>
            <span class="log-platform-tag">${escapeHtml(log.platform)}</span>
          </div>
          <span class="log-time">${new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div class="log-entry-details">
          ${escapeHtml(log.summary || log.dataType)}
        </div>
        <div class="log-entry-actions">
          <span style="font-size: 9px; color: #64748B;">Score: ${log.riskScore}/100</span>
          <span class="log-action-badge ${log.actionTaken}">${log.actionTaken}</span>
        </div>
      `;
      elements.fullAuditLogList.appendChild(card);
    });
  }

  // ─── Event Listeners Setup ─────────────────────────────────────────────────
  function setupEventListeners() {
    // Master Protection Toggle
    elements.toggleMasterProtection.addEventListener('change', async (e) => {
      const active = e.target.checked;
      await GuardianStorage.saveSettings({ protectionActive: active });
      updateHeaderStatus(active);
    });

    // Category Toggles
    const catToggles = [
      { el: elements.toggleCatPii, key: 'pii' },
      { el: elements.toggleCatFinancial, key: 'financial' },
      { el: elements.toggleCatCredentials, key: 'credentials' },
      { el: elements.toggleCatOrganizational, key: 'organizational' },
      { el: elements.toggleCatMedical, key: 'medical_legal' }
    ];

    catToggles.forEach(({ el, key }) => {
      el.addEventListener('change', async () => {
        const cats = { ...(currentSettings.categories || {}) };
        cats[key] = el.checked;
        await GuardianStorage.saveSettings({ categories: cats });
      });
    });

    // Add Watchlist Keyword
    elements.btnAddKeyword.addEventListener('click', async () => {
      const val = elements.inputNewKeyword.value.trim();
      if (!val) return;
      const list = [...((currentSettings && currentSettings.keywordWatchlist) || [])];
      if (!list.includes(val)) {
        list.push(val);
        await GuardianStorage.saveSettings({ keywordWatchlist: list });
        elements.inputNewKeyword.value = '';
        renderWatchlistTags();
      }
    });

    elements.inputNewKeyword.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') elements.btnAddKeyword.click();
    });

    // Add Whitelisted Domain
    elements.btnAddDomain.addEventListener('click', async () => {
      const val = elements.inputNewDomain.value.trim().toLowerCase();
      if (!val) return;
      const list = [...((currentSettings && currentSettings.whitelistedDomains) || [])];
      if (!list.includes(val)) {
        list.push(val);
        await GuardianStorage.saveSettings({ whitelistedDomains: list });
        elements.inputNewDomain.value = '';
        renderWhitelistTags();
      }
    });

    elements.inputNewDomain.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') elements.btnAddDomain.click();
    });

    // Filter Pills
    elements.filterPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        elements.filterPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        currentFilter = pill.getAttribute('data-filter');
        renderLogs();
      });
    });

    // Search Filter
    elements.logSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderLogs();
    });

    // Clear Logs
    elements.btnClearAuditLogs.addEventListener('click', async () => {
      if (confirm('Clear all stored prompt security logs?')) {
        await GuardianStorage.clearAuditLogs();
        await loadLogs();
      }
    });

    // Reset Stats
    elements.btnResetStats.addEventListener('click', async () => {
      if (confirm('Reset all security counters back to zero?')) {
        await GuardianStorage.resetStats();
        await loadStatsAndActiveTarget();
      }
    });

    // Export JSON
    elements.btnExportJson.addEventListener('click', async () => {
      const jsonStr = await GuardianStorage.exportLogsAsJSON();
      downloadFile(jsonStr, `shadow_ai_audit_${Date.now()}.json`, 'application/json');
    });

    // Export CSV
    elements.btnExportCsv.addEventListener('click', async () => {
      const csvStr = await GuardianStorage.exportLogsAsCSV();
      downloadFile(csvStr, `shadow_ai_audit_${Date.now()}.csv`, 'text/csv');
    });
  }

  // ─── Utilities ─────────────────────────────────────────────────────────────
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatRelativeTime(ts) {
    const diff = Math.floor((Date.now() - ts) / 1000);
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  }

  function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
})();
