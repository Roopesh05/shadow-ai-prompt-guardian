/**
 * Shadow AI Prompt Guardian — Team Setup & Role Management
 * Version: 2.0.0 (Manifest V3 Production Build — TL Edition)
 *
 * Handles:
 *  - First-time setup wizard role selection (Team Leader vs Team Member)
 *  - Random 6-character team code generation
 *  - Firebase RTDB team initialization & member registration
 *  - Persistent storage in chrome.storage.local
 *  - Validation with inline error feedback
 */

import { firebasePut, firebaseGet, firebasePatch, isFirebaseConfigured } from './firebase.js';

/**
 * Generates an uppercase 6-character alphanumeric team code.
 * @returns {string}
 */
export function generateTeamCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Avoid confusing O/0, I/1
  let code = '';
  const array = new Uint8Array(6);
  crypto.getRandomValues(array);
  for (let i = 0; i < 6; i++) {
    code += chars[array[i] % chars.length];
  }
  return code;
}

/**
 * Generates or retrieves unique persistent device ID.
 * @returns {Promise<string>}
 */
export async function getOrCreateDeviceId() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['shadow_guardian_team'], (res) => {
      if (res && res.shadow_guardian_team && res.shadow_guardian_team.deviceId) {
        resolve(res.shadow_guardian_team.deviceId);
        return;
      }
      const newId = 'dev_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 8);
      resolve(newId);
    });
  });
}

/**
 * Registers a new team as Team Leader.
 * @param {string} teamCode 6-character uppercase code
 * @param {string} leaderName Leader's display name
 * @returns {Promise<{ success: boolean, error?: string, data?: any }>}
 */
export async function createTeamAsLeader(teamCode, leaderName) {
  if (!teamCode || teamCode.trim().length !== 6) {
    return { success: false, error: 'Team code must be exactly 6 characters.' };
  }
  if (!leaderName || leaderName.trim().length < 2) {
    return { success: false, error: 'Please enter a valid name (at least 2 characters).' };
  }

  const cleanCode = teamCode.trim().toUpperCase();
  const cleanName = leaderName.trim();
  const deviceId = await getOrCreateDeviceId();

  const now = Date.now();
  const teamPayload = {
    tlDeviceId: deviceId,
    createdAt: now,
    leaderName: cleanName,
    members: {
      [deviceId]: {
        name: cleanName,
        joinedAt: now,
        lastSeen: now,
        status: 'active',
        role: 'TL'
      }
    }
  };

  // If Firebase is configured, write to RTDB
  if (isFirebaseConfigured()) {
    const res = await firebasePut(`teams/${cleanCode}`, teamPayload);
    if (!res.success) {
      return {
        success: false,
        error: `Failed to create team in Firebase: ${res.error || 'Network error'}`
      };
    }
  }

  // Persist locally
  const localData = {
    role: 'TL',
    teamCode: cleanCode,
    deviceId,
    name: cleanName,
    joinedAt: now
  };

  await new Promise((resolve) => {
    chrome.storage.local.set({ shadow_guardian_team: localData }, () => resolve());
  });

  return { success: true, data: localData };
}

/**
 * Validates and connects a device to an existing team as a Member.
 * @param {string} teamCode 6-character code
 * @param {string} memberName Member's display name
 * @returns {Promise<{ success: boolean, error?: string, data?: any }>}
 */
export async function joinTeamAsMember(teamCode, memberName) {
  if (!teamCode || teamCode.trim().length !== 6) {
    return { success: false, error: 'Team code must be exactly 6 characters.' };
  }
  if (!memberName || memberName.trim().length < 2) {
    return { success: false, error: 'Please enter a valid name (at least 2 characters).' };
  }

  const cleanCode = teamCode.trim().toUpperCase();
  const cleanName = memberName.trim();
  const deviceId = await getOrCreateDeviceId();
  const now = Date.now();

  if (isFirebaseConfigured()) {
    // Check if team exists in Firebase
    const checkRes = await firebaseGet(`teams/${cleanCode}`);
    if (!checkRes.success) {
      return { success: false, error: `Connection failed: ${checkRes.error || 'Server error'}` };
    }
    if (!checkRes.data) {
      return { success: false, error: 'Team code not found. Verify code with your Team Leader.' };
    }

    // Register member under teams/{code}/members/{deviceId}
    const memberPayload = {
      name: cleanName,
      joinedAt: now,
      lastSeen: now,
      status: 'active',
      role: 'MEMBER'
    };

    const regRes = await firebasePut(`teams/${cleanCode}/members/${deviceId}`, memberPayload);
    if (!regRes.success) {
      return { success: false, error: `Failed to register member: ${regRes.error}` };
    }
  }

  const localData = {
    role: 'MEMBER',
    teamCode: cleanCode,
    deviceId,
    name: cleanName,
    joinedAt: now
  };

  await new Promise((resolve) => {
    chrome.storage.local.set({ shadow_guardian_team: localData }, () => resolve());
  });

  return { success: true, data: localData };
}

/**
 * Checks existing team status for current user.
 * @returns {Promise<Object|null>}
 */
export async function getCurrentTeamConfig() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['shadow_guardian_team'], (res) => {
      resolve((res && res.shadow_guardian_team) || null);
    });
  });
}

// Global attachment
const GuardianTeam = {
  generateTeamCode,
  getOrCreateDeviceId,
  createTeamAsLeader,
  joinTeamAsMember,
  getCurrentTeamConfig
};

if (typeof globalThis !== 'undefined') {
  globalThis.GuardianTeam = GuardianTeam;
}

export default GuardianTeam;
