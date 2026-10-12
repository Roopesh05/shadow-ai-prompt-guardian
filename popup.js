/**
 * Shadow AI Prompt Guardian — Popup Dashboard Controller
 * Version: 2.0.0 (Manifest V3 Production Build — TL Edition)
 *
 * Handles:
 *  - Arc gauge animation with dynamic stroke color shifts (Green -> Orange -> Red)
 *  - Animated number count-up on stats cards
 *  - Active tab platform sniffing & live status chip
 *  - Tab switching including dynamic TL Team Dashboard initialization
 *  - Tag-input watchlist & whitelist chips
 *  - Searchable, filterable audit log accordion view
 *  - JSON & CSV export generation
 *  - Ambient particle generation
 */

import { TeamDashboard } from './team-dashboard.js';

(function () {
  'use strict';

  // ─── Utilities ─────────────────────────────────────────────────────────────

  function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Just now';
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  function animateCountUp(el, targetNumber, duration = 800) {
    if (!el) return;
    const target = parseInt(targetNumber, 10);
    if (isNaN(target)) {
      el.textContent = targetNumber;
      return;
    }
    const start = 0;
    const startTime = performance.now();

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * ease);
      el.textContent = current.toLocaleString();
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString();
      }
    }
    requestAnimationFrame(update);
  }

  // ─── SVG Platform Icons ────────────────────────────────────────────────────

  const PLATFORM_ICONS = {
    chatgpt: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm1 14.93V17h-2v-.07a3.89 3.89 0 0 1-1.89-.92l1.41-1.41a2.12 2.12 0 0 0 1.48.5 2.08 2.08 0 0 0 2-2.08 2 2 0 0 0-1.07-1.78l-1.55-.78A3.94 3.94 0 0 1 8.9 7a4 4 0 0 1 3.1-3.93V3h2v.07a3.89 3.89 0 0 1 1.89.92l-1.41 1.41a2.12 2.12 0 0 0-1.48-.5 2.08 2.08 0 0 0-2 2.08 2 2 0 0 0 1.07 1.78l1.55.78A3.94 3.94 0 0 1 15.1 13a4 4 0 0 1-2.1 3.93z"/></svg>`,
    claude: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>`,
    gemini: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.5 8.5 22 12 15.5 15.5 12 22 8.5 15.5 2 12 8.5 8.5 12 2"/></svg>`,
    copilot: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 16v1a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1"/><polyline points="15 10 20 15 15 20"/></svg>`,
    perplexity: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/><line x1="12" y1="2" x2="12" y2="22"/></svg>`,
    idle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polygon points="12 6 12 12 16 14"/></svg>`
  };

  // ─── DOM Element References ────────────────────────────────────────────────

  const dom = {
    // Header & Theme
    themeToggle: document.getElementById('theme-toggle'),
    themeIconMoon: document.querySelector('.theme-icon-moon'),
    themeIconSun: document.querySelector('.theme-icon-sun'),
    headerStatusPill: document.getElementById('header-status-pill'),
    headerStatusText: document.getElementById('header-status-text'),

    // Tabs
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabPanes: document.querySelectorAll('.tab-pane'),
    tabBtnTeam: document.getElementById('tab-btn-team'),

    // Dashboard
    arcProgress: document.getElementById('arc-gauge-progress'),
    riskScoreDisplay: document.getElementById('risk-score-display'),
    riskStatusText: document.getElementById('risk-status-text'),
    riskStatusDesc: document.getElementById('risk-status-desc'),
    statScanned: document.getElementById('stat-scanned'),
    statBlocked: document.getElementById('stat-blocked'),
    statTopCat: document.getElementById('stat-top-cat'),
    targetIconContainer: document.getElementById('target-icon-container'),
    currentPlatformName: document.getElementById('current-platform-name'),
    currentTargetChip: document.getElementById('current-target-chip'),
    currentTargetStatus: document.getElementById('current-target-status'),
    recentAlertsList: document.getElementById('recent-alerts-list'),
    recentCountBadge: document.getElementById('recent-count-badge'),

    // Logs
    logFilterPills: document.querySelectorAll('#log-filter-pills .pill-btn'),
    logSearchInput: document.getElementById('log-search-input'),
    fullAuditLogList: document.getElementById('full-audit-log-list'),
    btnExportJson: document.getElementById('btn-export-json'),
    btnExportCsv: document.getElementById('btn-export-csv'),

    // Settings
    toggleMasterProtection: document.getElementById('toggle-master-protection'),
    toggleCatPii: document.getElementById('toggle-cat-pii'),
    toggleCatFinancial: document.getElementById('toggle-cat-financial'),
    toggleCatCredentials: document.getElementById('toggle-cat-credentials'),
    toggleCatOrganizational: document.getElementById('toggle-cat-organizational'),
    toggleCatMedical: document.getElementById('toggle-cat-medical'),
    toggleNotifications: document.getElementById('toggle-notifications'),
    inputNewKeyword: document.getElementById('input-new-keyword'),
    btnAddKeyword: document.getElementById('btn-add-keyword'),
    watchlistContainer: document.getElementById('watchlist-tags-container'),
    inputNewDomain: document.getElementById('input-new-domain'),
    btnAddDomain: document.getElementById('btn-add-domain'),
    whitelistContainer: document.getElementById('whitelist-tags-container'),
    btnClearAuditLogs: document.getElementById('btn-clear-audit-logs')
  };

  // State
  let currentSettings = null;
  let currentLogs = [];
  let currentFilter = 'ALL';
  let searchQuery = '';
  let teamDashboardInstance = null;

  // ─── Initialization ────────────────────────────────────────────────────────

  async function initPopup() {
    initParticles();
    setupTheme();
    setupTabs();
    await loadSettings();
    await checkTeamRole();
    await loadStatsAndGauge();
    await loadRecentAndFullLogs();
    detectActiveTargetPlatform();
    setupEventListeners();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPopup);
  } else {
    initPopup();
  }

  // ─── 12 Particle Generator ─────────────────────────────────────────────────

  function initParticles() {
    const container = document.getElementById('popup-particles');
    if (!container) return;
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.className = 'particle';
      p.style.left = Math.random() * 100 + '%';
      p.style.animationDuration = (8 + Math.random() * 12) + 's';
      p.style.animationDelay = (Math.random() * 6) + 's';
      container.appendChild(p);
    }
  }

  // ─── Theme Management ──────────────────────────────────────────────────────

  function setupTheme() {
    const isLight = localStorage.getItem('shadow_theme') === 'light';
    applyTheme(isLight);

    if (dom.themeToggle) {
      dom.themeToggle.addEventListener('click', () => {
        const isCurrentlyLight = document.body.classList.contains('light-theme');
        applyTheme(!isCurrentlyLight);
        localStorage.setItem('shadow_theme', !isCurrentlyLight ? 'light' : 'dark');
      });
    }
  }

  function applyTheme(isLight) {
    if (isLight) {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      if (dom.themeIconMoon) dom.themeIconMoon.style.display = 'none';
      if (dom.themeIconSun) dom.themeIconSun.style.display = 'block';
    } else {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
      if (dom.themeIconMoon) dom.themeIconMoon.style.display = 'block';
      if (dom.themeIconSun) dom.themeIconSun.style.display = 'none';
    }
  }

  // ─── Tab Navigation ────────────────────────────────────────────────────────

  function setupTabs() {
    dom.tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-tab');
        dom.tabButtons.forEach((b) => b.classList.remove('active'));
        dom.tabPanes.forEach((p) => p.classList.remove('active'));

        btn.classList.add('active');
        const targetPane = document.getElementById(targetId);
        if (targetPane) targetPane.classList.add('active');

        if (targetId === 'tab-logs') {
          renderFullLogs();
        } else if (targetId === 'tab-team' && teamDashboardInstance) {
          teamDashboardInstance.fetchData();
        }
      });
    });
  }

  // ─── Check Team Role & TL Mode ─────────────────────────────────────────────

  async function checkTeamRole() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['shadow_guardian_team'], (res) => {
        const team = res && res.shadow_guardian_team;
        if (team && team.role === 'TL') {
          if (dom.tabBtnTeam) {
            dom.tabBtnTeam.style.display = 'flex';
          }
          teamDashboardInstance = new TeamDashboard(team.teamCode, team.deviceId);
          teamDashboardInstance.init();
        }
        resolve();
      });
    });
  }

  // ─── Settings Synchronization ──────────────────────────────────────────────

  async function loadSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['shadow_guardian_settings'], (res) => {
        currentSettings = (res && res.shadow_guardian_settings) || {
          protectionActive: true,
          categories: { pii: true, financial: true, credentials: true, organizational: true, medical_legal: true },
          notificationsEnabled: true,
          keywordWatchlist: ['Project Titan', 'Project Chimera', 'Apollo-Internal'],
          whitelistedDomains: ['localhost:3000']
        };

        syncSettingsToUi();
        resolve();
      });
    });
  }

  function syncSettingsToUi() {
    if (!currentSettings) return;

    // Header master toggle
    updateMasterShieldUi(currentSettings.protectionActive);

    if (dom.toggleMasterProtection) dom.toggleMasterProtection.checked = !!currentSettings.protectionActive;
    if (dom.toggleCatPii) dom.toggleCatPii.checked = !!(currentSettings.categories && currentSettings.categories.pii);
    if (dom.toggleCatFinancial) dom.toggleCatFinancial.checked = !!(currentSettings.categories && currentSettings.categories.financial);
    if (dom.toggleCatCredentials) dom.toggleCatCredentials.checked = !!(currentSettings.categories && currentSettings.categories.credentials);
    if (dom.toggleCatOrganizational) dom.toggleCatOrganizational.checked = !!(currentSettings.categories && currentSettings.categories.organizational);
    if (dom.toggleCatMedical) dom.toggleCatMedical.checked = !!(currentSettings.categories && currentSettings.categories.medical_legal);
    if (dom.toggleNotifications) dom.toggleNotifications.checked = !!currentSettings.notificationsEnabled;

    renderWatchlistChips();
    renderWhitelistChips();
  }

  function updateMasterShieldUi(isActive) {
    if (!dom.headerStatusPill || !dom.headerStatusText) return;
    if (isActive) {
      dom.headerStatusPill.className = 'shield-toggle-pill active';
      dom.headerStatusText.textContent = 'SHIELD ON';
    } else {
      dom.headerStatusPill.className = 'shield-toggle-pill';
      dom.headerStatusText.textContent = 'SHIELD OFF';
    }
  }

  async function persistSettings() {
    return new Promise((resolve) => {
      chrome.storage.local.set({ shadow_guardian_settings: currentSettings }, () => resolve());
    });
  }

  // ─── Arc Gauge & Statistics ────────────────────────────────────────────────

  async function loadStatsAndGauge() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['shadow_guardian_stats', 'shadow_guardian_logs'], (res) => {
        const stats = res && res.shadow_guardian_stats ? res.shadow_guardian_stats : { totalScanned: 0, totalBlocked: 0, topRiskCategory: 'NONE' };
        const logs = Array.isArray(res && res.shadow_guardian_logs) ? res.shadow_guardian_logs : [];

        // Count-up animations
        animateCountUp(dom.statScanned, stats.totalScanned || 0);
        animateCountUp(dom.statBlocked, stats.totalBlocked || 0);
        if (dom.statTopCat) dom.statTopCat.textContent = stats.topRiskCategory || 'NONE';

        // Calculate latest threat score for gauge (or highest score today)
        let displayScore = 0;
        if (logs.length > 0) {
          const recentLog = logs[0];
          displayScore = recentLog.riskScore || 0;
        }

        updateArcGauge(displayScore);
        resolve();
      });
    });
  }

  /**
   * Animates SVG arc gauge (0 to 100) according to Checklist 5:
   * circumference = 2 * Math.PI * radius
   * offset = circumference - (score/100) * circumference
   */
  function updateArcGauge(score) {
    if (!dom.arcProgress || !dom.riskScoreDisplay) return;

    animateCountUp(dom.riskScoreDisplay, score);

    const radius = 85;
    const circumference = 2 * Math.PI * radius;
    const clampedScore = Math.max(0, Math.min(100, score));
    const offset = circumference - (clampedScore / 100) * circumference;

    dom.arcProgress.style.strokeDasharray = `${circumference}`;
    dom.arcProgress.style.strokeDashoffset = `${offset}`;

    // Dynamic color transition & labels
    if (clampedScore <= 30) {
      dom.arcProgress.style.stroke = 'var(--accent-green)';
      if (dom.riskStatusText) {
        dom.riskStatusText.textContent = 'SECURE';
        dom.riskStatusText.style.color = 'var(--accent-green)';
      }
      if (dom.riskStatusDesc) dom.riskStatusDesc.textContent = 'System secure. Outbound prompts actively verified.';
    } else if (clampedScore <= 60) {
      dom.arcProgress.style.stroke = 'var(--accent-orange)';
      if (dom.riskStatusText) {
        dom.riskStatusText.textContent = 'WARNING';
        dom.riskStatusText.style.color = 'var(--accent-orange)';
      }
      if (dom.riskStatusDesc) dom.riskStatusDesc.textContent = 'Elevated sensitivity detected in prompt stream.';
    } else {
      dom.arcProgress.style.stroke = 'var(--accent-red)';
      if (dom.riskStatusText) {
        dom.riskStatusText.textContent = 'CRITICAL';
        dom.riskStatusText.style.color = 'var(--accent-red)';
      }
      if (dom.riskStatusDesc) dom.riskStatusDesc.textContent = 'High-risk confidential egress held or blocked.';
    }
  }

  // ─── Active Target Platform Detection ──────────────────────────────────────

  async function detectActiveTargetPlatform() {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (!tabs || tabs.length === 0) return;
        const url = (tabs[0].url || '').toLowerCase();

        let platformKey = 'idle';
        let platformName = 'Idle / Non-AI Tab';
        let statusClass = 'chip-idle';
        let statusText = 'IDLE';

        if (url.includes('chatgpt.com') || url.includes('openai.com')) {
          platformKey = 'chatgpt';
          platformName = 'ChatGPT (OpenAI)';
          statusClass = 'chip-active';
          statusText = 'ACTIVE';
        } else if (url.includes('claude.ai')) {
          platformKey = 'claude';
          platformName = 'Claude (Anthropic)';
          statusClass = 'chip-active';
          statusText = 'ACTIVE';
        } else if (url.includes('gemini.google.com') || url.includes('google.com/gemini')) {
          platformKey = 'gemini';
          platformName = 'Google Gemini';
          statusClass = 'chip-active';
          statusText = 'ACTIVE';
        } else if (url.includes('copilot.microsoft.com') || url.includes('bing.com')) {
          platformKey = 'copilot';
          platformName = 'Microsoft Copilot';
          statusClass = 'chip-active';
          statusText = 'ACTIVE';
        } else if (url.includes('perplexity.ai')) {
          platformKey = 'perplexity';
          platformName = 'Perplexity AI';
          statusClass = 'chip-active';
          statusText = 'ACTIVE';
        }

        if (dom.targetIconContainer) {
          dom.targetIconContainer.innerHTML = PLATFORM_ICONS[platformKey] || PLATFORM_ICONS.idle;
        }
        if (dom.currentPlatformName) {
          dom.currentPlatformName.textContent = platformName;
        }
        if (dom.currentTargetChip && dom.currentTargetStatus) {
          dom.currentTargetChip.className = `status-chip ${statusClass}`;
          dom.currentTargetStatus.textContent = statusText;
        }
      });
    } catch (_) {}
  }

  // ─── Recent Interceptions & Scan Log ───────────────────────────────────────

  async function loadRecentAndFullLogs() {
    return new Promise((resolve) => {
      chrome.storage.local.get(['shadow_guardian_logs'], (res) => {
        currentLogs = Array.isArray(res && res.shadow_guardian_logs) ? res.shadow_guardian_logs : [];
        renderRecentInterceptions();
        renderFullLogs();
        resolve();
      });
    });
  }

  function renderRecentInterceptions() {
    if (!dom.recentAlertsList) return;
    const recents = currentLogs.slice(0, 3);

    if (dom.recentCountBadge) {
      dom.recentCountBadge.textContent = `${currentLogs.length} events`;
    }

    if (recents.length === 0) {
      dom.recentAlertsList.innerHTML = '<div class="empty-state">No sensitive prompt interceptions logged yet.</div>';
      return;
    }

    const html = recents.map((item, idx) => {
      const types = Array.isArray(item.categories) && item.categories.length > 0
        ? item.categories
        : (item.dataType ? item.dataType.split(', ') : ['General']);

      const tagsHtml = types.slice(0, 3).map((t) => `<span class="tag-pill">${escapeHtml(t)}</span>`).join('');
      const actionClass = item.actionTaken === 'BLOCKED' ? 'badge-blocked' : (item.actionTaken === 'REDACTED' ? 'badge-redacted' : 'badge-allowed');
      const timeStr = formatTimeAgo(item.timestamp);

      return `
        <div class="card recent-card" style="animation-delay: ${idx * 0.4}s;">
          <div class="recent-card-top">
            <span class="recent-platform">${escapeHtml(item.platform || 'AI Platform')}</span>
            <span class="recent-time">${escapeHtml(timeStr)}</span>
          </div>
          <div class="recent-card-bottom">
            <div class="recent-tags">${tagsHtml}</div>
            <span class="action-badge ${actionClass}">${escapeHtml(item.actionTaken || 'BLOCKED')}</span>
          </div>
        </div>
      `;
    }).join('');

    dom.recentAlertsList.innerHTML = html;
  }

  function renderFullLogs() {
    if (!dom.fullAuditLogList) return;

    let filtered = currentLogs;
    if (currentFilter !== 'ALL') {
      filtered = filtered.filter((l) => (l.riskLevel === currentFilter));
    }
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((l) => {
        return (l.platform && l.platform.toLowerCase().includes(q)) ||
               (l.summary && l.summary.toLowerCase().includes(q)) ||
               (l.dataType && l.dataType.toLowerCase().includes(q)) ||
               (l.promptExcerpt && l.promptExcerpt.toLowerCase().includes(q));
      });
    }

    if (filtered.length === 0) {
      dom.fullAuditLogList.innerHTML = '<div class="empty-state">No matching log records found.</div>';
      return;
    }

    const html = filtered.map((item) => {
      const dotClass = (item.riskLevel || 'clean').toLowerCase();
      const actionClass = item.actionTaken === 'BLOCKED' ? 'badge-blocked' : (item.actionTaken === 'REDACTED' ? 'badge-redacted' : 'badge-allowed');
      const timeStr = new Date(item.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return `
        <div class="card log-card" data-log-id="${escapeHtml(item.id || '')}">
          <div class="log-card-header">
            <div class="log-card-left">
              <span class="risk-dot ${dotClass}"></span>
              <span class="log-platform">${escapeHtml(item.platform || 'AI Platform')}</span>
              <span class="log-time">${escapeHtml(timeStr)}</span>
            </div>
            <span class="action-badge ${actionClass}">${escapeHtml(item.actionTaken || 'BLOCKED')}</span>
          </div>
          <div class="log-types-str">Threats: ${escapeHtml(item.dataType || 'Sensitive Data')}</div>
          ${item.promptExcerpt ? `<div class="log-expanded-view" style="display:none;">${escapeHtml(item.promptExcerpt)}</div>` : ''}
        </div>
      `;
    }).join('');

    dom.fullAuditLogList.innerHTML = html;

    // Expand accordion on card click
    dom.fullAuditLogList.querySelectorAll('.log-card').forEach((card) => {
      card.addEventListener('click', () => {
        const exp = card.querySelector('.log-expanded-view');
        if (exp) {
          exp.style.display = exp.style.display === 'none' ? 'block' : 'none';
        }
      });
    });
  }

  // ─── Watchlist & Whitelist Chips ───────────────────────────────────────────

  function renderWatchlistChips() {
    if (!dom.watchlistContainer || !currentSettings) return;
    const list = currentSettings.keywordWatchlist || [];
    dom.watchlistContainer.innerHTML = list.map((kw, idx) => `
      <div class="chip-tag">
        <span>${escapeHtml(kw)}</span>
        <span class="chip-remove" data-idx="${idx}">&times;</span>
      </div>
    `).join('');

    dom.watchlistContainer.querySelectorAll('.chip-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        currentSettings.keywordWatchlist.splice(idx, 1);
        persistSettings();
        renderWatchlistChips();
      });
    });
  }

  function renderWhitelistChips() {
    if (!dom.whitelistContainer || !currentSettings) return;
    const list = currentSettings.whitelistedDomains || [];
    dom.whitelistContainer.innerHTML = list.map((d, idx) => `
      <div class="chip-tag">
        <span>${escapeHtml(d)}</span>
        <span class="chip-remove" data-idx="${idx}">&times;</span>
      </div>
    `).join('');

    dom.whitelistContainer.querySelectorAll('.chip-remove').forEach((btn) => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        currentSettings.whitelistedDomains.splice(idx, 1);
        persistSettings();
        renderWhitelistChips();
      });
    });
  }

  // ─── Event Listeners Setup ─────────────────────────────────────────────────

  function setupEventListeners() {
    // Master Protection Toggle Header Button
    if (dom.headerStatusPill) {
      dom.headerStatusPill.addEventListener('click', () => {
        currentSettings.protectionActive = !currentSettings.protectionActive;
        updateMasterShieldUi(currentSettings.protectionActive);
        if (dom.toggleMasterProtection) dom.toggleMasterProtection.checked = currentSettings.protectionActive;
        persistSettings();
      });
    }

    if (dom.toggleMasterProtection) {
      dom.toggleMasterProtection.addEventListener('change', (e) => {
        currentSettings.protectionActive = e.target.checked;
        updateMasterShieldUi(currentSettings.protectionActive);
        persistSettings();
      });
    }

    // Category Toggles
    const bindCategory = (inputEl, key) => {
      if (inputEl) {
        inputEl.addEventListener('change', (e) => {
          if (!currentSettings.categories) currentSettings.categories = {};
          currentSettings.categories[key] = e.target.checked;
          persistSettings();
        });
      }
    };
    bindCategory(dom.toggleCatPii, 'pii');
    bindCategory(dom.toggleCatFinancial, 'financial');
    bindCategory(dom.toggleCatCredentials, 'credentials');
    bindCategory(dom.toggleCatOrganizational, 'organizational');
    bindCategory(dom.toggleCatMedical, 'medical_legal');

    if (dom.toggleNotifications) {
      dom.toggleNotifications.addEventListener('change', (e) => {
        currentSettings.notificationsEnabled = e.target.checked;
        persistSettings();
      });
    }

    // Add Watchlist Keyword
    const handleAddKeyword = () => {
      const val = (dom.inputNewKeyword.value || '').trim();
      if (!val) return;
      if (!currentSettings.keywordWatchlist) currentSettings.keywordWatchlist = [];
      if (!currentSettings.keywordWatchlist.includes(val)) {
        currentSettings.keywordWatchlist.push(val);
        persistSettings();
        renderWatchlistChips();
      }
      dom.inputNewKeyword.value = '';
    };

    if (dom.btnAddKeyword) dom.btnAddKeyword.addEventListener('click', handleAddKeyword);
    if (dom.inputNewKeyword) {
      dom.inputNewKeyword.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAddKeyword();
      });
    }

    // Add Whitelist Domain
    const handleAddDomain = () => {
      const val = (dom.inputNewDomain.value || '').trim();
      if (!val) return;
      if (!currentSettings.whitelistedDomains) currentSettings.whitelistedDomains = [];
      if (!currentSettings.whitelistedDomains.includes(val)) {
        currentSettings.whitelistedDomains.push(val);
        persistSettings();
        renderWhitelistChips();
      }
      dom.inputNewDomain.value = '';
    };

    if (dom.btnAddDomain) dom.btnAddDomain.addEventListener('click', handleAddDomain);
    if (dom.inputNewDomain) {
      dom.inputNewDomain.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') handleAddDomain();
      });
    }

    // Log Filter Pills
    dom.logFilterPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        dom.logFilterPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        currentFilter = pill.getAttribute('data-filter') || 'ALL';
        renderFullLogs();
      });
    });

    // Log Search Input
    if (dom.logSearchInput) {
      dom.logSearchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value || '';
        renderFullLogs();
      });
    }

    // Clear All Logs
    if (dom.btnClearAuditLogs) {
      dom.btnClearAuditLogs.addEventListener('click', () => {
        if (confirm('Clear all stored audit logs and reset stats?')) {
          chrome.storage.local.set({ shadow_guardian_logs: [], shadow_guardian_stats: { totalScanned: 0, totalBlocked: 0, topRiskCategory: 'NONE' } }, () => {
            currentLogs = [];
            loadStatsAndGauge();
            renderRecentInterceptions();
            renderFullLogs();
          });
        }
      });
    }

    // Export Logs JSON & CSV (Checklist 5: Blob + createObjectURL + revokeObjectURL)
    if (dom.btnExportJson) {
      dom.btnExportJson.addEventListener('click', () => {
        try {
          const jsonStr = JSON.stringify(currentLogs, null, 2);
          const blob = new Blob([jsonStr], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `shadow_guardian_logs_${Date.now()}.json`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (_) {}
      });
    }

    if (dom.btnExportCsv) {
      dom.btnExportCsv.addEventListener('click', () => {
        try {
          const headers = ['ID', 'Timestamp', 'Platform', 'RiskLevel', 'RiskScore', 'ActionTaken', 'DataTypes', 'PromptExcerpt'];
          const rows = currentLogs.map((l) => [
            `"${l.id || ''}"`,
            l.timestamp || 0,
            `"${l.platform || ''}"`,
            `"${l.riskLevel || ''}"`,
            l.riskScore || 0,
            `"${l.actionTaken || ''}"`,
            `"${l.dataType || ''}"`,
            `"${(l.promptExcerpt || '').replace(/"/g, '""')}"`
          ]);
          const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `shadow_guardian_logs_${Date.now()}.csv`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (_) {}
      });
    }

    // Cleanup on popup unload (Checklist 5)
    window.addEventListener('unload', () => {
      if (teamDashboardInstance && typeof teamDashboardInstance.destroy === 'function') {
        teamDashboardInstance.destroy();
      }
    });
  }
})();
