/**
 * Shadow AI Prompt Guardian — Detection Engine & Rules Module
 * Version: 2.0.0 (Manifest V3 Production Build)
 *
 * Capabilities:
 *  - PII Detection (Email, Indian/Intl Phone, Aadhaar with Verhoeff, PAN, Passport, Contextual Names)
 *  - Financial Data (Credit/Debit Card with Luhn validation, IFSC, UPI ID, Bank Accounts)
 *  - Credentials (OpenAI, AWS, GitHub, Google, Plaintext Passwords, JWT, SSH Private Keys)
 *  - Organizational Data (Custom Keyword Watchlist, Confidential/NDA Classification)
 *  - Medical & Legal Identifiers (ICD-10 Diagnostic Codes, Case Numbers)
 *  - Heuristic Engine (Shannon Entropy, Contextual Keyword Boosting, False Positive Dampeners)
 *  - Risk Scoring (0–100 with LOW, MEDIUM, HIGH, CRITICAL classification)
 *  - Automated Redaction Engine
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PromptGuardianRules = factory();
  }
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  // ─── Mathematical Validation Algorithms ────────────────────────────────────

  /**
   * Luhn Algorithm validation for payment card numbers.
   * Eliminates false positives on random 13-19 digit strings.
   * @param {string} numStr Digits only string
   * @returns {boolean}
   */
  function validateLuhn(numStr) {
    const clean = numStr.replace(/\D/g, '');
    if (clean.length < 13 || clean.length > 19) return false;
    let sum = 0;
    let alternate = false;
    for (let i = clean.length - 1; i >= 0; i--) {
      let n = parseInt(clean.charAt(i), 10);
      if (alternate) {
        n *= 2;
        if (n > 9) n = (n % 10) + 1;
      }
      sum += n;
      alternate = !alternate;
    }
    return sum % 10 === 0;
  }

  /**
   * Verhoeff Algorithm multiplication and permutation tables for Aadhaar validation.
   */
  const VERHOEFF_D = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
    [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
    [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
    [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
    [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
    [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
    [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
    [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
    [9, 8, 7, 6, 5, 4, 3, 2, 1, 0]
  ];

  const VERHOEFF_P = [
    [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
    [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
    [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
    [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
    [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
    [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
    [7, 0, 4, 6, 9, 1, 3, 2, 5, 8]
  ];

  const VERHOEFF_INV = [0, 4, 3, 2, 1, 5, 6, 7, 8, 9];

  /**
   * Validates a 12-digit Indian Aadhaar number using the Verhoeff checksum.
   * @param {string} numStr 12-digit string
   * @returns {boolean}
   */
  function validateVerhoeff(numStr) {
    const clean = numStr.replace(/\D/g, '');
    if (clean.length !== 12) return false;
    // Aadhaar does not start with 0 or 1
    if (clean[0] === '0' || clean[0] === '1') return false;

    let c = 0;
    const reversed = clean.split('').reverse().map(Number);
    for (let i = 0; i < reversed.length; i++) {
      c = VERHOEFF_D[c][VERHOEFF_P[i % 8][reversed[i]]];
    }
    return c === 0;
  }

  /**
   * Calculates Shannon Entropy of an input string to identify random high-entropy secrets.
   * H(X) = - SUM( p(x) * log2(p(x)) )
   * @param {string} str
   * @returns {number}
   */
  function calculateShannonEntropy(str) {
    if (!str || str.length === 0) return 0;
    const freq = {};
    for (let i = 0; i < str.length; i++) {
      const ch = str[i];
      freq[ch] = (freq[ch] || 0) + 1;
    }
    let entropy = 0;
    const len = str.length;
    for (const ch in freq) {
      const p = freq[ch] / len;
      entropy -= p * Math.log2(p);
    }
    return entropy;
  }

  // ─── Default Watchlist & Confidential Keywords ─────────────────────────────

  const DEFAULT_KEYWORD_WATCHLIST = [
    'Project Titan',
    'Project Chimera',
    'Apollo-Internal',
    'Project Mercury',
    'AcmeConfidential',
    'SecretSauce',
    'Internal-API-Key'
  ];

  const CONFIDENTIAL_TERMS = [
    'confidential',
    'strictly confidential',
    'nda protected',
    'non-disclosure agreement',
    'internal use only',
    'proprietary and confidential',
    'trade secret',
    'classified',
    'privileged and confidential',
    'attorney-client privileged',
    'restricted distribution',
    'do not distribute',
    'do not share externally'
  ];

  // ─── Regex Patterns Catalog ────────────────────────────────────────────────

  const PATTERNS = {
    // ── 1. PII ───────────────────────────────────────────────────────────────
    email: {
      id: 'pii_email',
      name: 'Email Address',
      category: 'pii',
      confidence: 'MEDIUM',
      regex: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
      mask: (val) => {
        const parts = val.split('@');
        const user = parts[0];
        const domain = parts[1] || '';
        const maskedUser = user.length > 2 ? user[0] + '*'.repeat(user.length - 2) + user[user.length - 1] : user[0] + '*';
        return `${maskedUser}@${domain}`;
      }
    },
    phone_indian: {
      id: 'pii_phone_indian',
      name: 'Indian Phone Number',
      category: 'pii',
      confidence: 'MEDIUM',
      regex: /(?:\+91[\-\s]?)?[6789]\d{9}\b/g,
      mask: (val) => val.slice(0, 3) + '••••' + val.slice(-3)
    },
    phone_intl: {
      id: 'pii_phone_intl',
      name: 'International Phone Number',
      category: 'pii',
      confidence: 'MEDIUM',
      regex: /(?:\+|00)[1-9]\d{0,2}[\s.-]?\(?\d{1,4}\)?[\s.-]?\d{1,4}[\s.-]?\d{2,9}\b/g,
      mask: (val) => val.slice(0, 3) + '••••' + val.slice(-3)
    },
    aadhaar: {
      id: 'pii_aadhaar',
      name: 'Aadhaar Card Number',
      category: 'pii',
      confidence: 'HIGH',
      regex: /\b[2-9]\d{3}[\s\-]?\d{4}[\s\-]?\d{4}\b/g,
      validator: validateVerhoeff,
      mask: (val) => '•••• •••• ' + val.replace(/\D/g, '').slice(-4)
    },
    pan: {
      id: 'pii_pan',
      name: 'PAN Card Number',
      category: 'pii',
      confidence: 'HIGH',
      regex: /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g,
      mask: (val) => val.slice(0, 2) + '•••' + val.slice(-2)
    },
    passport_indian: {
      id: 'pii_passport_indian',
      name: 'Indian Passport Number',
      category: 'pii',
      confidence: 'HIGH',
      regex: /\b[A-PR-WYa-pr-wy][1-9]\d{7}\b/g,
      mask: (val) => val[0] + '••••••' + val.slice(-1)
    },
    passport_context: {
      id: 'pii_passport_context',
      name: 'Passport Number',
      category: 'pii',
      confidence: 'HIGH',
      regex: /\b(?:passport(?:\s*(?:no|number|#))?)\s*[:=]\s*([A-Z0-9]{6,9})\b/gi,
      mask: (val) => 'PASSPORT-••••••'
    },
    full_name_context: {
      id: 'pii_full_name',
      name: 'Full Name Identifier',
      category: 'pii',
      confidence: 'LOW',
      regex: /\b(?:full\s*name|patient\s*name|customer\s*name|employee\s*name|client\s*name)\s*[:=]\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+){1,3})\b/gi,
      mask: (val) => '•••• ••••'
    },

    // ── 2. Financial ─────────────────────────────────────────────────────────
    credit_card: {
      id: 'fin_credit_card',
      name: 'Credit / Debit Card',
      category: 'financial',
      confidence: 'CRITICAL',
      regex: /\b(?:4\d{3}|5[1-5]\d{2}|6011|65\d{2}|3[47]\d{2}|508[5-9]|6521|6522)[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{1,7}\b/g,
      validator: validateLuhn,
      mask: (val) => {
        const clean = val.replace(/\D/g, '');
        return '••••-••••-••••-' + clean.slice(-4);
      }
    },
    ifsc: {
      id: 'fin_ifsc',
      name: 'Indian IFSC Code',
      category: 'financial',
      confidence: 'MEDIUM',
      regex: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
      mask: (val) => val.slice(0, 4) + '0•••••'
    },
    upi_id: {
      id: 'fin_upi_id',
      name: 'UPI ID / VPA',
      category: 'financial',
      confidence: 'MEDIUM',
      regex: /\b[a-zA-Z0-9.\-_]{2,64}@(okhdfcbank|okaxis|oksbi|okicici|paytm|ybl|ibl|axl|upi|apl|barodampay|federal|idfcbank|freecharge|postbank)\b/gi,
      mask: (val) => {
        const parts = val.split('@');
        return parts[0].slice(0, 2) + '••••@' + parts[1];
      }
    },
    bank_account: {
      id: 'fin_bank_account',
      name: 'Bank Account Number',
      category: 'financial',
      confidence: 'MEDIUM',
      regex: /\b(?:account(?:\s*(?:no|number|#))?|a\/c(?:\s*no)?)\s*[:=\s]\s*(\d{9,18})\b/gi,
      mask: (val) => 'A/C-••••' + val.slice(-4)
    },

    // ── 3. Credentials ───────────────────────────────────────────────────────
    openai_key: {
      id: 'cred_openai',
      name: 'OpenAI API Key',
      category: 'credentials',
      confidence: 'CRITICAL',
      regex: /\b(?:sk-[a-zA-Z0-9]{20,T3BlbkFJ[a-zA-Z0-9]{20,}|sk-proj-[a-zA-Z0-9_\-]{48,}|sk-admin-[a-zA-Z0-9_\-]{48,}|sess-[a-zA-Z0-9]{40,})\b/g,
      mask: (val) => val.slice(0, 7) + '••••••••••••••••'
    },
    aws_key: {
      id: 'cred_aws_access_key',
      name: 'AWS Access Key ID',
      category: 'credentials',
      confidence: 'CRITICAL',
      regex: /\b(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}\b/g,
      mask: (val) => val.slice(0, 4) + '••••••••••••••••'
    },
    aws_secret: {
      id: 'cred_aws_secret',
      name: 'AWS Secret Access Key',
      category: 'credentials',
      confidence: 'CRITICAL',
      regex: /\b(?:aws_secret_access_key|aws_secret_key)\s*[:=]\s*["']?([A-Za-z0-9\/+=]{40})["']?\b/gi,
      mask: (val) => 'AWS_SECRET_KEY=••••••••••••••••'
    },
    github_token: {
      id: 'cred_github_token',
      name: 'GitHub Access Token',
      category: 'credentials',
      confidence: 'CRITICAL',
      regex: /\b(?:ghp_[a-zA-Z0-9]{36}|gho_[a-zA-Z0-9]{36}|ghu_[a-zA-Z0-9]{36}|ghs_[a-zA-Z0-9]{36}|ghr_[a-zA-Z0-9]{36}|github_pat_[a-zA-Z0-9_]{82})\b/g,
      mask: (val) => val.slice(0, 4) + '••••••••••••••••'
    },
    google_api_key: {
      id: 'cred_google_key',
      name: 'Google API Key',
      category: 'credentials',
      confidence: 'CRITICAL',
      regex: /\bAIza[0-9A-Za-z\-_]{35}\b/g,
      mask: (val) => 'AIza••••••••••••••••'
    },
    google_oauth: {
      id: 'cred_google_oauth',
      name: 'Google OAuth Token',
      category: 'credentials',
      confidence: 'CRITICAL',
      regex: /\bya29\.[0-9A-Za-z\-_]{20,}\b/g,
      mask: (val) => 'ya29.••••••••••••••••'
    },
    plaintext_password: {
      id: 'cred_plaintext_password',
      name: 'Plaintext Password',
      category: 'credentials',
      confidence: 'CRITICAL',
      regex: /\b(?:password|passwd|pwd|passphrase|db_pass|root_password)\s*[:=]\s*["']?([^\s"']{6,64})["']?\b/gi,
      mask: (val) => 'PASSWORD=••••••••'
    },
    jwt_token: {
      id: 'cred_jwt',
      name: 'JSON Web Token (JWT)',
      category: 'credentials',
      confidence: 'HIGH',
      regex: /\beyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_\-+/=]{10,}\b/g,
      mask: (val) => 'eyJ••••.eyJ••••.••••'
    },
    ssh_private_key: {
      id: 'cred_ssh_key',
      name: 'SSH / RSA Private Key',
      category: 'credentials',
      confidence: 'CRITICAL',
      regex: /-----BEGIN (?:RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY(?: BLOCK)?-----/g,
      mask: (val) => '-----BEGIN PRIVATE KEY [REDACTED]-----'
    },

    // ── 4. Medical & Legal ───────────────────────────────────────────────────
    icd10: {
      id: 'med_icd10',
      name: 'ICD-10 Diagnostic Code',
      category: 'medical_legal',
      confidence: 'MEDIUM',
      regex: /\b(?:diagnosis(?:\s*code)?|icd-?10)\s*[:=]\s*([A-TV-Z][0-9][0-9AB](?:\.[0-9A-TV-Z]{1,4})?)\b/gi,
      mask: (val) => 'ICD10-••••'
    },
    legal_case: {
      id: 'legal_case_num',
      name: 'Legal Case / Docket Number',
      category: 'medical_legal',
      confidence: 'MEDIUM',
      regex: /\b(?:case\s*(?:no|number|#)|docket\s*(?:no|number|#)|suit\s*no|w\.?p\.?\s*\(c\))\s*[:=\s]\s*([A-Za-z0-9\/\-\.]{4,30})\b/gi,
      mask: (val) => 'CASE-••••••••'
    }
  };

  // ─── Heuristic & False Positive Checks ─────────────────────────────────────

  /**
   * Common test dummy tokens that should not trigger alarms.
   */
  const DUMMY_TOKENS = [
    'example.com',
    'test@test.com',
    'foo@bar.com',
    '0000000000',
    '1234567890',
    'john.doe',
    'placeholder',
    'sk-dummy',
    'sk-test'
  ];

  function isDummy(text) {
    const lower = text.toLowerCase().trim();
    if (lower === '1234567890' || lower === '0000000000' || lower === 'placeholder') return true;
    if (lower.includes('example.com') || lower.includes('test@test.com') || lower.includes('foo@bar.com') || lower.includes('john.doe')) return true;
    if (lower.startsWith('sk-dummy') || lower.startsWith('sk-test')) return true;
    return false;
  }

  // ─── Main Analysis Engine ──────────────────────────────────────────────────

  /**
   * Evaluates prompt text against all active security rules.
   *
   * @param {string} prompt The text prompt to scan
   * @param {Array<string>} [customWatchlist] User-defined sensitive keywords
   * @param {Object} [enabledCategories] Map of categories to boolean toggles
   * @returns {Object} Comprehensive analysis result
   */
  function analyzePrompt(prompt, customWatchlist = DEFAULT_KEYWORD_WATCHLIST, enabledCategories = {}) {
    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return {
        riskScore: 0,
        riskLevel: 'CLEAN',
        findings: [],
        redactedText: prompt || '',
        categoryBreakdown: { pii: 0, financial: 0, credentials: 0, organizational: 0, medical_legal: 0 }
      };
    }

    const activeCategories = {
      pii: enabledCategories.pii !== false,
      financial: enabledCategories.financial !== false,
      credentials: enabledCategories.credentials !== false,
      organizational: enabledCategories.organizational !== false,
      medical_legal: enabledCategories.medical_legal !== false
    };

    const findings = [];
    const seenSpans = new Set();

    // 1. Regular Expressions & Validators
    for (const key in PATTERNS) {
      const rule = PATTERNS[key];
      if (!activeCategories[rule.category]) continue;

      const regex = new RegExp(rule.regex.source, rule.regex.flags);
      let match;
      while ((match = regex.exec(prompt)) !== null) {
        const fullMatch = match[0];
        const spanKey = `${match.index}-${match.index + fullMatch.length}`;

        // Check validator if present (e.g. Luhn, Verhoeff)
        if (rule.validator && !rule.validator(fullMatch)) {
          continue;
        }

        // Check dummy strings
        if (isDummy(fullMatch)) {
          continue;
        }

        if (!seenSpans.has(spanKey)) {
          seenSpans.add(spanKey);
          findings.push({
            id: rule.id,
            name: rule.name,
            category: rule.category,
            confidence: rule.confidence,
            value: fullMatch,
            maskedValue: rule.mask ? rule.mask(fullMatch) : '••••••••',
            index: match.index,
            length: fullMatch.length,
            description: `Detected ${rule.name} with ${rule.confidence} confidence.`
          });
        }
      }
    }

    // 2. Organizational Data: Confidential / NDA terms
    if (activeCategories.organizational) {
      const lowerPrompt = prompt.toLowerCase();
      for (const term of CONFIDENTIAL_TERMS) {
        let startIdx = 0;
        while ((startIdx = lowerPrompt.indexOf(term, startIdx)) !== -1) {
          const spanKey = `${startIdx}-${startIdx + term.length}`;
          if (!seenSpans.has(spanKey)) {
            seenSpans.add(spanKey);
            findings.push({
              id: 'org_confidential_term',
              name: 'Confidential / NDA Indicator',
              category: 'organizational',
              confidence: 'HIGH',
              value: prompt.substring(startIdx, startIdx + term.length),
              maskedValue: '[CONFIDENTIAL_TERM]',
              index: startIdx,
              length: term.length,
              description: `Detected protected organizational phrasing: "${term}".`
            });
          }
          startIdx += term.length;
        }
      }

      // 3. Organizational Data: Custom Keyword Watchlist
      const watchlist = Array.isArray(customWatchlist) ? customWatchlist : DEFAULT_KEYWORD_WATCHLIST;
      for (const kw of watchlist) {
        const cleanKw = kw.trim();
        if (cleanKw.length < 2) continue;
        const kwLower = cleanKw.toLowerCase();
        let startIdx = 0;
        while ((startIdx = lowerPrompt.indexOf(kwLower, startIdx)) !== -1) {
          const spanKey = `${startIdx}-${startIdx + cleanKw.length}`;
          if (!seenSpans.has(spanKey)) {
            seenSpans.add(spanKey);
            findings.push({
              id: 'org_watchlist_keyword',
              name: `Watchlist Match: ${cleanKw}`,
              category: 'organizational',
              confidence: 'HIGH',
              value: prompt.substring(startIdx, startIdx + cleanKw.length),
              maskedValue: `[WATCHLIST_${cleanKw.toUpperCase().replace(/\s+/g, '_')}]`,
              index: startIdx,
              length: cleanKw.length,
              description: `Matched user-defined organizational watchlist keyword "${cleanKw}".`
            });
          }
          startIdx += cleanKw.length;
        }
      }
    }

    // 4. Heuristic / NLP: High-Entropy Secrets detection
    if (activeCategories.credentials) {
      const words = prompt.split(/\s+/);
      let currentOffset = 0;
      for (const word of words) {
        const cleanWord = word.replace(/^[("'<{[]+|[)"'>}\],;.]+$/g, '');
        const wordIdx = prompt.indexOf(cleanWord, currentOffset);
        if (wordIdx !== -1) currentOffset = wordIdx + cleanWord.length;

        if (cleanWord.length >= 24 && !cleanWord.includes('http') && !cleanWord.includes('/')) {
          const entropy = calculateShannonEntropy(cleanWord);
          // High Shannon entropy (> 4.2 bits per char) indicates cryptography or tokens
          if (entropy >= 4.2 && !isDummy(cleanWord)) {
            const spanKey = `${wordIdx}-${wordIdx + cleanWord.length}`;
            if (!seenSpans.has(spanKey) && wordIdx !== -1) {
              seenSpans.add(spanKey);
              findings.push({
                id: 'cred_high_entropy_token',
                name: 'High-Entropy Secret / Token',
                category: 'credentials',
                confidence: 'HIGH',
                value: cleanWord,
                maskedValue: cleanWord.slice(0, 4) + '••••••••' + cleanWord.slice(-4),
                index: wordIdx,
                length: cleanWord.length,
                description: `Identified random high-entropy token (entropy: ${entropy.toFixed(2)} bits/char).`
              });
            }
          }
        }
      }
    }

    // ── Calculate Category Breakdown ──────────────────────────────────────────
    const breakdown = { pii: 0, financial: 0, credentials: 0, organizational: 0, medical_legal: 0 };
    for (const f of findings) {
      if (breakdown[f.category] !== undefined) {
        breakdown[f.category]++;
      }
    }

    // ── Calculate Overall Risk Score (0–100) ───────────────────────────────────
    let score = 0;
    const weights = {
      CRITICAL: 40,
      HIGH: 25,
      MEDIUM: 15,
      LOW: 5
    };

    let hasCritical = false;
    let hasHigh = false;

    for (const f of findings) {
      if (f.confidence === 'CRITICAL') hasCritical = true;
      if (f.confidence === 'HIGH') hasHigh = true;
      score += weights[f.confidence] || 10;
    }

    // Compounding multi-factor penalty if multiple distinct categories detected
    const activeCategoryCount = Object.values(breakdown).filter((c) => c > 0).length;
    if (activeCategoryCount >= 3) {
      score += 20;
    } else if (activeCategoryCount === 2) {
      score += 10;
    }

    // Floor guarantee based on highest finding severity
    if (hasCritical) {
      score = Math.max(85, score);
    } else if (hasHigh) {
      score = Math.max(60, score);
    }

    score = Math.min(100, Math.max(0, score));

    // Risk Level Tier
    let riskLevel = 'CLEAN';
    if (score >= 80) {
      riskLevel = 'CRITICAL';
    } else if (score >= 50) {
      riskLevel = 'HIGH';
    } else if (score >= 25) {
      riskLevel = 'MEDIUM';
    } else if (score > 0) {
      riskLevel = 'LOW';
    }

    // Generate Redacted Text
    const redactedText = redactPrompt(prompt, findings);

    return {
      riskScore: score,
      riskLevel,
      findings,
      redactedText,
      categoryBreakdown: breakdown
    };
  }

  /**
   * Automatically replaces sensitive substrings in reverse order to preserve string indices.
   *
   * @param {string} prompt Original text
   * @param {Array<Object>} findings List of detected findings
   * @returns {string} Sanitized text
   */
  function redactPrompt(prompt, findings) {
    if (!prompt || !findings || findings.length === 0) return prompt;

    // Sort findings descending by start index
    const sorted = [...findings].sort((a, b) => b.index - a.index);
    let result = prompt;

    for (const f of sorted) {
      if (typeof f.index !== 'number' || typeof f.length !== 'number') continue;
      const placeholderMap = {
        credentials: '[REDACTED_CREDENTIAL]',
        financial: '[REDACTED_FINANCIAL_DATA]',
        pii: '[REDACTED_PII]',
        organizational: '[REDACTED_CONFIDENTIAL_INFO]',
        medical_legal: '[REDACTED_IDENTIFIER]'
      };
      const placeholder = placeholderMap[f.category] || '[REDACTED]';
      const before = result.slice(0, f.index);
      const after = result.slice(f.index + f.length);
      result = before + placeholder + after;
    }

    return result;
  }

  return {
    analyzePrompt,
    redactPrompt,
    validateLuhn,
    validateVerhoeff,
    calculateShannonEntropy,
    DEFAULT_KEYWORD_WATCHLIST,
    CONFIDENTIAL_TERMS,
    PATTERNS
  };
});
