import FIREBASE_CONFIG from './config.js';

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1000;
const FETCH_TIMEOUT_MS = 10000;

export function isFirebaseConfigured() {
  const cfg = (typeof FIREBASE_CONFIG !== 'undefined' && FIREBASE_CONFIG) || (typeof globalThis !== 'undefined' && globalThis.FIREBASE_CONFIG);
  if (!cfg || !cfg.databaseURL) {
    return false;
  }
  if (cfg.databaseURL.includes('YOUR_PROJECT_ID')) {
    return false;
  }
  return true;
}

function getDatabaseUrl() {
  const cfg = (typeof FIREBASE_CONFIG !== 'undefined' && FIREBASE_CONFIG) || (typeof globalThis !== 'undefined' && globalThis.FIREBASE_CONFIG);
  if (!cfg || !cfg.databaseURL) {
    return 'https://YOUR_PROJECT_ID-default-rtdb.firebaseio.com';
  }
  return cfg.databaseURL.replace(/\/+$/, '');
}

function sleep(ms) {
  const jitter = Math.floor(Math.random() * 200);
  return new Promise((resolve) => setTimeout(resolve, ms + jitter));
}

function buildRestUrl(path, params = {}) {
  const cleanPath = (path || '').replace(/^\/+/, '').replace(/\/+$/, '');
  let url = `${getDatabaseUrl()}/${cleanPath}.json`;

  const queryParts = [];
  const cfg = (typeof FIREBASE_CONFIG !== 'undefined' && FIREBASE_CONFIG) || (typeof globalThis !== 'undefined' && globalThis.FIREBASE_CONFIG);
  if (cfg && cfg.apiKey && !cfg.apiKey.includes('YOUR_API_KEY')) {
    queryParts.push(`auth=${encodeURIComponent(cfg.apiKey)}`);
  }

  if (params && typeof params === 'object') {
    for (const [k, v] of Object.entries(params)) {
      if (v !== undefined && v !== null) {
        queryParts.push(`${encodeURIComponent(k)}=${encodeURIComponent(v)}`);
      }
    }
  }

  if (queryParts.length > 0) {
    url += `?${queryParts.join('&')}`;
  }

  return url;
}

async function fetchWithRetry(url, options = {}) {
  if (!isFirebaseConfigured()) {
    return {
      success: false,
      data: null,
      error: 'Firebase is not configured. Update config.js with valid project credentials.'
    };
  }

  let attempt = 0;
  let lastError = null;

  while (attempt < MAX_RETRIES) {
    attempt++;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`HTTP ${response.status} ${response.statusText}: ${errText}`);
      }

      const json = await response.json();
      return {
        success: true,
        data: json,
        error: null
      };
    } catch (err) {
      lastError = err;
      if (attempt < MAX_RETRIES) {
        const backoff = BASE_BACKOFF_MS * Math.pow(2, attempt - 1);
        await sleep(backoff);
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  return {
    success: false,
    data: null,
    error: lastError ? (lastError.message || String(lastError)) : 'Network request failed after retries'
  };
}

export async function firebasePut(path, data) {
  try {
    const url = buildRestUrl(path);
    return await fetchWithRetry(url, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  } catch (err) {
    return { success: false, data: null, error: err.message || String(err) };
  }
}

export async function firebaseGet(path, queryParams = {}) {
  try {
    const url = buildRestUrl(path, queryParams);
    return await fetchWithRetry(url, {
      method: 'GET'
    });
  } catch (err) {
    return { success: false, data: null, error: err.message || String(err) };
  }
}

export async function firebasePatch(path, data) {
  try {
    const url = buildRestUrl(path);
    return await fetchWithRetry(url, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  } catch (err) {
    return { success: false, data: null, error: err.message || String(err) };
  }
}

export async function firebaseDelete(path) {
  try {
    const url = buildRestUrl(path);
    return await fetchWithRetry(url, {
      method: 'DELETE'
    });
  } catch (err) {
    return { success: false, data: null, error: err.message || String(err) };
  }
}

const GuardianFirebase = {
  isFirebaseConfigured,
  firebasePut,
  firebaseGet,
  firebasePatch,
  firebaseDelete
};

if (typeof globalThis !== 'undefined') {
  globalThis.GuardianFirebase = GuardianFirebase;
}

export default GuardianFirebase;
