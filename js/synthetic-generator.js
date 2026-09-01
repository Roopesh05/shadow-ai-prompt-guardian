/**
 * Shadow AI Prompt Guardian — SENTINEL v5.0
 * Synthetic Mock Token Generator & Format-Preserving Masking Engine
 *
 * Replaces real secrets and PII with syntactically valid mock placeholders.
 * Enables developers to debug code snippets with LLMs without breaking syntax
 * or leaking real credentials.
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
    generic: 1,
  };

  /**
   * Generate a syntactically valid mock credential matching the pattern type
   */
  function generateMockToken(finding) {
    var type = (finding && (finding.id || finding.ruleId || finding.name || finding.category)) || 'generic';
    var lowerType = String(type).toLowerCase();

    // AWS Access Key mock
    if (lowerType.includes('aws')) {
      var num = String(MOCK_COUNTERS.aws++).padStart(2, '0');
      return 'MOCK_AWS_AKIA_' + num;
    }

    // GitHub PAT mock
    if (lowerType.includes('github') || lowerType.includes('ghp')) {
      return 'mock_ghp_token_sample';
    }

    // OpenAI Key mock
    if (lowerType.includes('openai') || lowerType.includes('sk-')) {
      return 'mock_sk_proj_token_sample';
    }

    // Stripe Key mock
    if (lowerType.includes('stripe') || lowerType.includes('sk_live') || lowerType.includes('sk_test')) {
      return 'mock_sk_test_stripe_sample';
    }

    // Slack Token mock
    if (lowerType.includes('slack') || lowerType.includes('xox')) {
      return 'mock_slack_xoxb_sample';
    }

    // Google OAuth mock
    if (lowerType.includes('google') || lowerType.includes('ya29')) {
      return 'mock_google_oauth_ya29_sample';
    }

    // Password / Credential assignment
    if (lowerType.includes('password') || lowerType.includes('cred') || lowerType.includes('bearer')) {
      return 'mock_p@ssw0rd_demo';
    }

    // Email
    if (lowerType.includes('email') || lowerType === 'pii_email') {
      var emailId = MOCK_COUNTERS.email++;
      return 'mock.user' + emailId + '@sandbox-example.internal';
    }

    // US / Int Phone
    if (lowerType.includes('phone')) {
      return '555-010-0199';
    }

    // Social Security Number (000 is invalid / unissued area number)
    if (lowerType.includes('ssn')) {
      return '000-12-3456';
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

    // Clone and sort findings by start descending (highest index first)
    var sorted = findings.filter(function (f) {
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

  return {
    generateMockToken: generateMockToken,
    autoRedactSynthetic: autoRedactSynthetic,
  };
});
