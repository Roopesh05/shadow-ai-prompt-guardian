/**
 * Shadow AI Prompt Guardian — Team Leader Live Dashboard Controller
 * Version: 2.0.0 (Manifest V3 Production Build — TL Edition)
 *
 * Capabilities:
 *  - Real-time telemetry polling every 10 seconds from Firebase RTDB
 *  - Unique member color generation (Hashed deterministic palette)
 *  - Online status tracking (active within last 5 minutes)
 *  - Filtering by member, risk level, and platform
 *  - Summary metrics computation (Daily logs, top threat, top risk user, total blocks)
 *  - Team JSON telemetry export
 *  - Resilient error handling with retry states
 */

import { firebaseGet, isFirebaseConfigured } from './firebase.js';

const MEMBER_PALETTE = [
  '#00F5FF', // Cyan
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#3B82F6', // Blue
  '#06B6D4', // Sky
  '#A855F7'  // Violet
];

function getMemberColor(name = '') {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const idx = Math.abs(hash) % MEMBER_PALETTE.length;
  return MEMBER_PALETTE[idx];
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export class TeamDashboard {
  constructor(teamCode, deviceId) {
    this.teamCode = teamCode;
    this.deviceId = deviceId;
    this.pollInterval = null;
    this.members = {};
    this.logs = [];
    this.lastSyncTime = null;

    this.filters = {
      member: 'ALL',
      risk: 'ALL',
      platform: 'ALL'
    };

    this.dom = {
      codeDisplay: document.getElementById('tl-team-code-display'),
      onlineCount: document.getElementById('tl-members-online-count'),
      syncStatus: document.getElementById('tl-sync-status'),
      btnSyncNow: document.getElementById('tl-btn-sync-now'),
      membersList: document.getElementById('tl-members-list'),
      statTeamToday: document.getElementById('tl-stat-team-today'),
      statActiveMember: document.getElementById('tl-stat-active-member'),
      statCommonThreat: document.getElementById('tl-stat-common-threat'),
      statTeamBlocks: document.getElementById('tl-stat-team-blocks'),
      filterMember: document.getElementById('tl-filter-member'),
      filterRisk: document.getElementById('tl-filter-risk'),
      filterPlatform: document.getElementById('tl-filter-platform'),
      liveFeed: document.getElementById('tl-live-feed-list'),
      btnExportTeam: document.getElementById('tl-btn-export-team-json')
    };
  }

  async init() {
    if (this.dom.codeDisplay) {
      this.dom.codeDisplay.textContent = this.teamCode;
    }

    this.setupListeners();
    await this.fetchData();
    this.startPolling();
  }

  setupListeners() {
    if (this.dom.btnSyncNow) {
      this.dom.btnSyncNow.addEventListener('click', () => {
        this.fetchData();
      });
    }

    if (this.dom.filterMember) {
      this.dom.filterMember.addEventListener('change', (e) => {
        this.filters.member = e.target.value;
        this.renderFeed();
      });
    }

    if (this.dom.filterRisk) {
      this.dom.filterRisk.addEventListener('change', (e) => {
        this.filters.risk = e.target.value;
        this.renderFeed();
      });
    }

    if (this.dom.filterPlatform) {
      this.dom.filterPlatform.addEventListener('change', (e) => {
        this.filters.platform = e.target.value;
        this.renderFeed();
      });
    }

    if (this.dom.btnExportTeam) {
      this.dom.btnExportTeam.addEventListener('click', () => {
        this.exportTeamLogs();
      });
    }
  }

  startPolling() {
    this.stopPolling();
    // Poll every 10 seconds
    this.pollInterval = setInterval(() => {
      this.fetchData();
    }, 10000);
  }

  stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }

  async fetchData() {
    if (!isFirebaseConfigured()) {
      if (this.dom.syncStatus) {
        this.dom.syncStatus.textContent = 'Firebase unconfigured (using local mock)';
      }
      return;
    }

    try {
      if (this.dom.syncStatus) {
        this.dom.syncStatus.textContent = 'Syncing...';
      }

      // Fetch team members
      const membersRes = await firebaseGet(`teams/${this.teamCode}/members`);
      if (membersRes.success && membersRes.data) {
        this.members = membersRes.data;
        this.renderMembers();
      }

      // Fetch team logs
      const logsRes = await firebaseGet(`teams/${this.teamCode}/logs`);
      if (logsRes.success && logsRes.data) {
        const raw = logsRes.data;
        this.logs = Object.keys(raw).map((k) => ({ id: k, ...raw[k] }));
        // Sort descending by timestamp
        this.logs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        this.updateMetrics();
        this.renderFeed();
      }

      this.lastSyncTime = Date.now();
      if (this.dom.syncStatus) {
        this.dom.syncStatus.textContent = 'Synced just now';
      }
    } catch (err) {
      if (this.dom.syncStatus) {
        this.dom.syncStatus.textContent = this.lastSyncTime
          ? `Synced ${Math.floor((Date.now() - this.lastSyncTime) / 60000)}m ago (Retry)`
          : 'Sync failed (Retry)';
      }
    }
  }

  renderMembers() {
    if (!this.dom.membersList) return;
    this.dom.membersList.innerHTML = '';

    const now = Date.now();
    let onlineCount = 0;
    const memberOptions = ['<option value="ALL">All Members</option>'];

    Object.entries(this.members).forEach(([id, m]) => {
      // Considered active if seen within last 5 minutes (300,000ms)
      const isOnline = m.lastSeen && (now - m.lastSeen < 300000);
      if (isOnline) onlineCount++;

      const col = getMemberColor(m.name || 'Member');
      const chip = document.createElement('div');
      chip.className = 'member-chip card';
      chip.innerHTML = `
        <span class="member-dot ${isOnline ? 'active' : 'idle'}"></span>
        <span style="color:${col}; font-weight:700;">${escapeHtml(m.name || 'Member')}</span>
      `;
      this.dom.membersList.appendChild(chip);

      memberOptions.push(`<option value="${escapeHtml(m.name || id)}">${escapeHtml(m.name || 'Member')}</option>`);
    });

    if (this.dom.onlineCount) {
      this.dom.onlineCount.textContent = `${onlineCount} Online`;
    }

    if (this.dom.filterMember) {
      const currentVal = this.filters.member;
      this.dom.filterMember.innerHTML = memberOptions.join('');
      this.dom.filterMember.value = currentVal;
    }
  }

  updateMetrics() {
    const now = Date.now();
    const startOfDay = new Date().setHours(0, 0, 0, 0);

    let logsToday = 0;
    let totalBlocks = 0;
    const memberThreatCounts = {};
    const threatTypeCounts = {};

    this.logs.forEach((log) => {
      if (log.timestamp >= startOfDay) logsToday++;
      if (log.actionTaken === 'BLOCKED') totalBlocks++;

      const mName = log.memberName || 'Anonymous';
      memberThreatCounts[mName] = (memberThreatCounts[mName] || 0) + (log.riskScore > 40 ? 1 : 0);

      const types = Array.isArray(log.detectedTypes) ? log.detectedTypes : [log.dataType || 'General'];
      types.forEach((t) => {
        if (t) threatTypeCounts[t] = (threatTypeCounts[t] || 0) + 1;
      });
    });

    // Top risk user
    let topUser = '—';
    let maxUserThreats = 0;
    Object.entries(memberThreatCounts).forEach(([u, count]) => {
      if (count > maxUserThreats) {
        maxUserThreats = count;
        topUser = u;
      }
    });

    // Most common threat type
    let topThreat = '—';
    let maxThreatCount = 0;
    Object.entries(threatTypeCounts).forEach(([t, count]) => {
      if (count > maxThreatCount) {
        maxThreatCount = count;
        topThreat = t;
      }
    });

    if (this.dom.statTeamToday) this.dom.statTeamToday.textContent = logsToday;
    if (this.dom.statTeamBlocks) this.dom.statTeamBlocks.textContent = totalBlocks;
    if (this.dom.statActiveMember) this.dom.statActiveMember.textContent = topUser;
    if (this.dom.statCommonThreat) this.dom.statCommonThreat.textContent = topThreat;
  }

  renderFeed() {
    if (!this.dom.liveFeed) return;

    let filtered = this.logs;

    if (this.filters.member !== 'ALL') {
      filtered = filtered.filter((l) => (l.memberName === this.filters.member));
    }

    if (this.filters.risk !== 'ALL') {
      filtered = filtered.filter((l) => (l.riskLevel === this.filters.risk));
    }

    if (this.filters.platform !== 'ALL') {
      filtered = filtered.filter((l) => (l.platform && l.platform.toLowerCase() === this.filters.platform.toLowerCase()));
    }

    if (filtered.length === 0) {
      this.dom.liveFeed.innerHTML = '<div class="empty-state">No telemetry matching current filters.</div>';
      return;
    }

    const cardsHtml = filtered.map((log) => {
      const col = getMemberColor(log.memberName || '');
      const isCrit = log.riskLevel === 'CRITICAL';
      const types = Array.isArray(log.detectedTypes) ? log.detectedTypes.join(', ') : (log.dataType || 'Sensitive');
      const actionClass = log.actionTaken === 'BLOCKED' ? 'badge-blocked' : (log.actionTaken === 'REDACTED' ? 'badge-redacted' : 'badge-allowed');
      const timeStr = new Date(log.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      return `
        <div class="card feed-card ${isCrit ? 'critical-border' : ''}">
          <div class="feed-card-header">
            <span class="feed-member-badge" style="background:${col}25; border:1px solid ${col}; color:${col};">
              ${escapeHtml(log.memberName || 'Member')}
            </span>
            <span style="font-size:11px; font-weight:700; color:#FFFFFF;">${escapeHtml(log.platform || 'AI')}</span>
            <span class="action-badge ${actionClass}">${escapeHtml(log.actionTaken || 'LOG')}</span>
            <span style="font-family:'JetBrains Mono',monospace; font-size:10px; color:var(--text-muted);">${timeStr}</span>
          </div>
          <div style="font-size:11px; color:var(--text-secondary); display:flex; justify-content:space-between;">
            <span>Detected: <strong style="color:var(--text-primary);">${escapeHtml(types)}</strong></span>
            <span style="color:${isCrit ? 'var(--accent-red)' : 'var(--accent-cyan)'}; font-weight:700;">Score: ${escapeHtml(log.riskScore || 0)}</span>
          </div>
          ${log.promptExcerpt ? `<div class="feed-excerpt">${escapeHtml(log.promptExcerpt)}</div>` : ''}
        </div>
      `;
    }).join('');

    this.dom.liveFeed.innerHTML = cardsHtml;
  }

  exportTeamLogs() {
    try {
      const jsonStr = JSON.stringify({
        teamCode: this.teamCode,
        exportTimestamp: new Date().toISOString(),
        memberCount: Object.keys(this.members).length,
        logs: this.logs
      }, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shadow_team_${this.teamCode}_logs_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (_) {}
  }

  destroy() {
    this.stopPolling();
  }
}

export default TeamDashboard;
