/**
 * Shadow AI Prompt Guardian — SENTINEL v5.0
 * Synthetic Mock Token Generator & Format-Preserving Masking Engine
 *
 * Replaces real secrets, databases, and PII with syntactically valid mock placeholders.
 * Features:
 *   - Format-preserving mock token generation for APIs, credentials, databases, and PII
 *   - Ephemeral in-memory DevVault for bidirectional round-trip code restoration
 *   - Zero data exfiltration: all mappings remain strictly in local RAM
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.SENTINEL_SYNTHETIC = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var MOCK_COUNTERS = {
    aws: 1,
    github: 1,
    openai: 1,
    stripe: 1,
    slack: 1,
    email: 1,
    phone: 1,
    ssn: 1,
    postgres: 1,
    mongo: 1,
    mysql: 1,
    redis: 1,
    generic: 1,
  };

  /**
   * Generate a syntactically valid mock credential matching the pattern type
   */
  function generateMockToken(finding) {
    var type = (finding && (finding.id || finding.ruleId || finding.name || finding.category)) || 'generic';
    var lowerType = String(type).toLowerCase();

    // ── Databases & Connection Strings ─────────────────────────────────────────
    if (lowerType.includes('postgres')) {
      return 'postgresql://mock_user:mock_pass@localhost:5432/mock_db';
    }
    if (lowerType.includes('mongo')) {
      return 'mongodb://mock_user:mock_pass@localhost:27017/mock_db';
    }
    if (lowerType.includes('mysql')) {
      return 'mysql://mock_user:mock_pass@localhost:3306/mock_db';
    }
    if (lowerType.includes('redis')) {
      return 'redis://:mock_pass@localhost:6379/0';
    }
    if (lowerType.includes('sentry')) {
      return 'https://mock_sentry_key@mock_org.ingest.sentry.io/000000';
    }
    if (lowerType.includes('datadog')) {
      return 'mock_datadog_api_key_sample_32chars';
    }

    // ── Cloud & API Keys ──────────────────────────────────────────────────────
    if (lowerType.includes('aws')) {
      var num = String(MOCK_COUNTERS.aws++).padStart(2, '0');
      return 'MOCK_AWS_AKIA_' + num;
    }

    if (lowerType.includes('github') || lowerType.includes('ghp')) {
      return 'mock_ghp_token_sample';
    }

    if (lowerType.includes('openai') || lowerType.includes('sk-')) {
      return 'mock_sk_proj_token_sample';
    }

    if (lowerType.includes('stripe') || lowerType.includes('sk_live') || lowerType.includes('sk_test')) {
      return 'mock_sk_test_stripe_sample';
    }

    if (lowerType.includes('slack') || lowerType.includes('xox')) {
      return 'mock_slack_xoxb_sample';
    }

    if (lowerType.includes('google') || lowerType.includes('ya29')) {
      return 'mock_google_oauth_ya29_sample';
    }

    // ── Passwords & Auth ──────────────────────────────────────────────────────
    if (lowerType.includes('password') || lowerType.includes('cred') || lowerType.includes('bearer')) {
      return 'mock_p@ssw0rd_demo';
    }

    // ── PII ───────────────────────────────────────────────────────────────────
    if (lowerType.includes('email') || lowerType === 'pii_email') {
      var emailId = MOCK_COUNTERS.email++;
      return 'mock.user' + emailId + '@sandbox-example.internal';
    }

    if (lowerType.includes('phone')) {
      return '555-010-0199';
    }

    if (lowerType.includes('ssn')) {
      return '000-12-3456';
    }

    if (lowerType.includes('ip_address') || lowerType.includes('ip address')) {
      return '127.0.0.1';
    }

    // High entropy / generic secret
    if (lowerType.includes('entropy') || lowerType.includes('secret') || lowerType.includes('key')) {
      return 'MOCK_TEST_SECRET_TOKEN_123456789';
    }

    // Confidential term fallback
    return '[MOCK_INTERNAL_DATA]';
  }

  /**
   * Replaces all findings in text with synthetic mock tokens.
   * Sorts findings in reverse order of index to preserve character offsets.
   */
  function autoRedactSynthetic(text, findings) {
    if (!text || typeof text !== 'string') return { text: text, redacted: text, replacements: [] };
    if (!findings || !Array.isArray(findings) || findings.length === 0) {
      return { text: text, redacted: text, replacements: [] };
    }

    var sorted = findings.filter(function (f) {
      if (f.isBulk || (f.id && String(f.id).startsWith('bulk_'))) return false;
      var s = typeof f.start === 'number' ? f.start : f.startIndex;
      var e = typeof f.end === 'number' ? f.end : f.endIndex;
      return typeof s === 'number' && typeof e === 'number' && e > s;
    }).slice().sort(function (a, b) {
      var aStart = typeof a.start === 'number' ? a.start : a.startIndex;
      var bStart = typeof b.start === 'number' ? b.start : b.startIndex;
      return bStart - aStart;
    });

    var result = text;
    var replacements = [];

    sorted.forEach(function (f) {
      var s = typeof f.start === 'number' ? f.start : f.startIndex;
      var e = typeof f.end === 'number' ? f.end : f.endIndex;
      var raw = result.substring(s, e);
      var mock = generateMockToken(f);
      result = result.substring(0, s) + mock + result.substring(e);
      replacements.push({
        category: f.category,
        id: f.id || f.ruleId || f.type,
        original: raw,
        placeholder: mock,
        start: s,
        end: s + mock.length,
      });
    });

    return {
      text: result,
      redacted: result,
      replacements: replacements,
    };
  }

  /**
   * Ephemeral In-Memory Developer Vault
   * Maintains bidirectional mapping (mock <-> real) scoped to tab memory.
   * Never written to persistent storage, never sent over the network.
   */
  function DevVault() {
    this._mockToReal = new Map();
    this._realToMock = new Map();
    this._metadata = new Map();
  }

  DevVault.prototype.store = function (original, mock, meta) {
    if (!original || !mock) return;
    this._mockToReal.set(mock, original);
    this._realToMock.set(original, mock);
    if (meta) this._metadata.set(mock, meta);
  };

  DevVault.prototype.storeReplacements = function (replacements) {
    if (!Array.isArray(replacements)) return;
    var self = this;
    replacements.forEach(function (r) {
      if (r.original && r.placeholder) {
        self.store(r.original, r.placeholder, { category: r.category, id: r.id });
      }
    });
  };

  DevVault.prototype.restore = function (text) {
    if (!text || typeof text !== 'string') return text;
    var restored = text;
    // Sort mock tokens by length descending so longer tokens are replaced first
    var mocks = Array.from(this._mockToReal.keys()).sort(function (a, b) {
      return b.length - a.length;
    });
    for (var i = 0; i < mocks.length; i++) {
      var mock = mocks[i];
      var real = this._mockToReal.get(mock);
      if (real) {
        restored = restored.split(mock).join(real);
      }
    }
    return restored;
  };

  DevVault.prototype.hasAnyToken = function (text) {
    if (!text || typeof text !== 'string') return false;
    var mocks = Array.from(this._mockToReal.keys());
    for (var i = 0; i < mocks.length; i++) {
      if (text.indexOf(mocks[i]) !== -1) return true;
    }
    return false;
  };

  DevVault.prototype.getRealValue = function (mock) {
    return this._mockToReal.get(mock) || null;
  };

  DevVault.prototype.size = function () {
    return this._mockToReal.size;
  };

  DevVault.prototype.clear = function () {
    this._mockToReal.clear();
    this._realToMock.clear();
    this._metadata.clear();
  };

  DevVault.prototype.list = function () {
    var items = [];
    var self = this;
    this._mockToReal.forEach(function (real, mock) {
      var meta = self._metadata.get(mock) || {};
      items.push({
        mock: mock,
        real: real,
        category: meta.category || 'secret',
        id: meta.id || 'custom',
      });
    });
    return items;
  };

  function createDevVault() {
    return new DevVault();
  }

  return {
    generateMockToken: generateMockToken,
    autoRedactSynthetic: autoRedactSynthetic,
    DevVault: DevVault,
    createDevVault: createDevVault,
  };
});
