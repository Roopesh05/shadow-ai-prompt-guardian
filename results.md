# Shadow AI Prompt Guardian — Evaluation Report

**Generated:** 7/10/2026, 12:09:05 pm
**Threshold:** 30 | **Test Set:** 140 prompts

## Overall Metrics

| Metric | Value |
|--------|-------|
| Accuracy | 1 |
| Precision | 1 |
| Recall | 1 |
| F1 Score | 1 |
| False Positive Rate | 0 |

## Confusion Matrix

| | Predicted Block | Predicted Clean |
|---|----------------|----------------|
| Actual Block | 95 | 0 |
| Actual Clean | 0 | 45 |

## Per-Category Metrics

| Category | Total | Accuracy | Precision | Recall | FPR |
|----------|-------|----------|-----------|--------|-----|
| clean | 45 | 1 | 0 | 0 | 0 |
| api_key | 30 | 1 | 1 | 1 | 0 |
| password | 19 | 1 | 1 | 1 | 0 |
| pii | 23 | 1 | 1 | 1 | 0 |
| confidential | 23 | 1 | 1 | 1 | 0 |

## Detailed Results

| ID | Category | Expected | Actual | Correct | Risk Score | Findings | Notes |
|----|----------|----------|--------|---------|------------|----------|-------|
| 1 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Basic programming question, no sensitive data. |
| 2 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Science explanation, safe. |
| 3 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | General best practices question. |
| 4 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Creative writing, no sensitive content. |
| 5 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Generic debugging request. |
| 6 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | General knowledge question. |
| 7 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Educational content about blockchain. |
| 8 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Travel planning, no PII. |
| 9 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Generic SQL example, no real data. |
| 10 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Language learning request. |
| 11 | api_key | BLOCK | BLOCK | ✓ | 60 | 2 | AWS access key pattern (AKIA prefix). |
| 12 | api_key | BLOCK | BLOCK | ✓ | 50 | 1 | GitHub personal access token. |
| 13 | api_key | BLOCK | BLOCK | ✓ | 50 | 1 | OpenAI API key pattern. |
| 14 | api_key | BLOCK | BLOCK | ✓ | 50 | 1 | Stripe test secret key. |
| 15 | api_key | BLOCK | BLOCK | ✓ | 50 | 1 | GitLab personal access token. |
| 16 | api_key | BLOCK | BLOCK | ✓ | 60 | 2 | Slack bot token pattern. |
| 17 | api_key | BLOCK | BLOCK | ✓ | 50 | 1 | Google OAuth access token. |
| 18 | api_key | BLOCK | BLOCK | ✓ | 85 | 2 | High-entropy generic token (entropy-based detection). |
| 19 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Asking about key generation best practices — no actual key present. |
| 20 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Educational question about auth types. |
| 21 | password | BLOCK | BLOCK | ✓ | 50 | 1 | Explicit password assignment. |
| 22 | password | BLOCK | BLOCK | ✓ | 50 | 1 | Password assignment pattern. |
| 23 | password | BLOCK | BLOCK | ✓ | 50 | 1 | Bearer token pattern (JWT-like). |
| 24 | password | BLOCK | BLOCK | ✓ | 50 | 1 | Basic auth header pattern. |
| 25 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Security best practices question — no actual password. |
| 26 | pii | BLOCK | BLOCK | ✓ | 40 | 1 | Email address present. |
| 27 | pii | BLOCK | BLOCK | ✓ | 40 | 1 | US phone number with name context. |
| 28 | pii | BLOCK | BLOCK | ✓ | 70 | 2 | Social Security Number. |
| 29 | pii | BLOCK | BLOCK | ✓ | 80 | 2 | Email + phone (healthcare PII context). |
| 30 | pii | BLOCK | BLOCK | ✓ | 40 | 1 | Corporate email address. |
| 31 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | General knowledge — no PII. |
| 32 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Legal writing help — no actual PII. |
| 33 | confidential | BLOCK | BLOCK | ✓ | 95 | 3 | Contains 'confidential' and 'NDA' terms. |
| 34 | confidential | BLOCK | BLOCK | ✓ | 100 | 3 | Contains 'confidential', 'top secret', project codename. |
| 35 | confidential | BLOCK | BLOCK | ✓ | 60 | 2 | Contains 'proprietary' and merger details. |
| 36 | confidential | BLOCK | BLOCK | ✓ | 60 | 2 | Contains 'internal use only' and salary data. |
| 37 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Generic business writing, no confidential terms. |
| 38 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Educational question about data classification. |
| 39 | api_key | BLOCK | BLOCK | ✓ | 60 | 2 | AWS access key + secret key in same prompt. |
| 40 | password | BLOCK | BLOCK | ✓ | 50 | 1 | Password explicitly stated. |
| 41 | pii | BLOCK | BLOCK | ✓ | 40 | 1 | IP address (classified as PII in this context). |
| 42 | confidential | BLOCK | BLOCK | ✓ | 30 | 1 | Contains 'confidential' term. |
| 43 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Generic writing request. |
| 44 | api_key | BLOCK | BLOCK | ✓ | 50 | 1 | Stripe publishable key. |
| 45 | password | BLOCK | BLOCK | ✓ | 50 | 1 | Credential file path pattern. |
| 46 | pii | BLOCK | BLOCK | ✓ | 65 | 2 | Email + confidential term 'GDPR'. |
| 47 | confidential | BLOCK | BLOCK | ✓ | 30 | 1 | Contains 'GDPR' which is in confidential terms list. |
| 48 | api_key | BLOCK | BLOCK | ✓ | 50 | 1 | Twilio Account SID. |
| 49 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Recipe, completely benign. |
| 50 | api_key | BLOCK | BLOCK | ✓ | 50 | 1 | Heroku API key (UUID-like pattern matched). |
| 51 | pii | BLOCK | BLOCK | ✓ | 40 | 1 | US phone number. |
| 52 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Technical summary request. |
| 53 | confidential | BLOCK | BLOCK | ✓ | 100 | 3 | Contains 'project' pattern + 'restricted' term. |
| 54 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Asking to generate a key, not sharing one. |
| 55 | password | BLOCK | BLOCK | ✓ | 50 | 1 | VPN password explicitly stated. |
| 56 | pii | BLOCK | BLOCK | ✓ | 40 | 1 | International phone number. |
| 57 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Code review request, no sensitive data. |
| 58 | confidential | BLOCK | BLOCK | ✓ | 90 | 3 | Contains 'privileged' and 'attorney-client' terms. |
| 59 | pii | BLOCK | BLOCK | ✓ | 70 | 2 | SSN explicitly provided. |
| 60 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Asking to generate a password, not sharing one. |
| 61 | api_key | BLOCK | BLOCK | ✓ | 60 | 2 | Azure API key (32-char hex pattern). |
| 62 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Educational cryptography question. |
| 63 | confidential | BLOCK | BLOCK | ✓ | 60 | 2 | Contains 'confidential' and 'acquisition'. |
| 64 | confidential | BLOCK | BLOCK | ✓ | 60 | 2 | Contains 'HIPAA' and 'patient records'. |
| 65 | pii | BLOCK | BLOCK | ✓ | 40 | 1 | Corporate email address. |
| 66 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Generic testing question. |
| 67 | api_key | BLOCK | BLOCK | ✓ | 50 | 1 | OpenAI-style key pattern (sk- prefix). |
| 68 | password | BLOCK | BLOCK | ✓ | 50 | 1 | Password assignment. |
| 69 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | General geography question. |
| 70 | confidential | BLOCK | BLOCK | ✓ | 95 | 3 | Contains 'unreleased product', 'proprietary', project codename. |
| 71 | pii | BLOCK | BLOCK | ✓ | 80 | 2 | Email + phone in same prompt. |
| 72 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Translation request. |
| 73 | api_key | BLOCK | BLOCK | ✓ | 60 | 2 | Slack user token pattern. |
| 74 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Technical implementation question. |
| 75 | confidential | BLOCK | BLOCK | ✓ | 30 | 1 | Contains 'compensation' and 'internal use only'. |
| 76 | password | BLOCK | BLOCK | ✓ | 50 | 1 | Bearer token with JWT-like payload. |
| 77 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | General technology question. |
| 78 | confidential | BLOCK | BLOCK | ✓ | 60 | 2 | Contains 'performance review' and 'privileged'. |
| 79 | pii | BLOCK | BLOCK | ✓ | 40 | 1 | US phone number with name. |
| 80 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Generic scripting request. |
| 81 | password | BLOCK | BLOCK | ✓ | 50 | 1 | Paraphrased password (secret word). |
| 82 | password | BLOCK | BLOCK | ✓ | 50 | 1 | Paraphrased password (passcode). |
| 83 | api_key | BLOCK | BLOCK | ✓ | 50 | 1 | Split/obfuscated OpenAI key. |
| 84 | api_key | BLOCK | BLOCK | ✓ | 50 | 1 | Spaced out OpenAI key. |
| 85 | api_key | BLOCK | BLOCK | ✓ | 50 | 1 | Spaced out AWS key. |
| 86 | pii | BLOCK | BLOCK | ✓ | 100 | 7 | Feature 2: 6 emails — bulk data export, must block. |
| 87 | pii | BLOCK | BLOCK | ✓ | 100 | 8 | Feature 2: 7 emails — bulk customer list, must block. |
| 88 | pii | BLOCK | BLOCK | ✓ | 100 | 6 | Feature 2: 5 phone numbers — bulk phone list, must block. |
| 89 | pii | BLOCK | BLOCK | ✓ | 100 | 7 | Feature 2: 5 SSNs — critical bulk PII, must block. |
| 90 | pii | BLOCK | BLOCK | ✓ | 100 | 13 | Feature 2: 11 mixed PII items — bulk mixed, must block. |
| 91 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Feature 2 TN: mentions a count but no actual PII — should not block. |
| 92 | pii | BLOCK | BLOCK | ✓ | 100 | 3 | Feature 2 TN for bulk: only 3 emails — NOT bulk, but IS PII so still blocks via normal scoring. |
| 93 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Feature 2 TN: template placeholders, no real PII. |
| 94 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Feature 2 TN: aggregate stats, no individual PII. |
| 95 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Feature 2 TN: aggregate business metrics, no PII. |
| 96 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Algorithms and data structures question. |
| 97 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Book recommendations on software architecture. |
| 98 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Computer networking fundamentals. |
| 99 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Baking recipe instruction. |
| 100 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Mathematics and signal processing. |
| 101 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Frontend web styling question. |
| 102 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Educational history question. |
| 103 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Software engineering design patterns. |
| 104 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Certification study schedule. |
| 105 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Machine learning theory explanation. |
| 106 | clean | CLEAN | CLEAN | ✓ | 0 | 0 | Literature essay assistance. |
| 107 | api_key | BLOCK | BLOCK | ✓ | 50 | 1 | GitLab personal access token (glpat- prefix). |
| 108 | api_key | BLOCK | BLOCK | ✓ | 60 | 2 | Slack bot token (xoxb- prefix). |
| 109 | api_key | BLOCK | BLOCK | ✓ | 50 | 1 | Google OAuth bearer token. |
| 110 | api_key | BLOCK | BLOCK | ✓ | 50 | 1 | Twilio Account SID (AC prefix). |
| 111 | api_key | BLOCK | BLOCK | ✓ | 60 | 2 | Azure connection string with account key. |
| 112 | api_key | BLOCK | BLOCK | ✓ | 50 | 1 | Heroku API key UUID format. |
| 113 | api_key | BLOCK | BLOCK | ✓ | 50 | 1 | SendGrid API key pattern. |
| 114 | api_key | BLOCK | BLOCK | ✓ | 50 | 1 | HuggingFace user access token. |
| 115 | api_key | BLOCK | BLOCK | ✓ | 85 | 2 | OpenAI project-scoped API key. |
| 116 | api_key | BLOCK | BLOCK | ✓ | 50 | 1 | GitHub fine-grained personal access token. |
| 117 | api_key | BLOCK | BLOCK | ✓ | 50 | 1 | Generic API key assignment format. |
| 118 | api_key | BLOCK | BLOCK | ✓ | 50 | 1 | High Shannon entropy token (entropy >= 4.0 bits). |
| 119 | password | BLOCK | BLOCK | ✓ | 50 | 1 | Database password assignment. |
| 120 | password | BLOCK | BLOCK | ✓ | 50 | 1 | Bearer authorization token header. |
| 121 | password | BLOCK | BLOCK | ✓ | 50 | 1 | Basic authorization header. |
| 122 | password | BLOCK | BLOCK | ✓ | 50 | 1 | Credential file path. |
| 123 | password | BLOCK | BLOCK | ✓ | 50 | 1 | Environment variable password assignment. |
| 124 | password | BLOCK | BLOCK | ✓ | 50 | 1 | CLI password flag parameter. |
| 125 | password | BLOCK | BLOCK | ✓ | 50 | 1 | Database client password flag. |
| 126 | password | BLOCK | BLOCK | ✓ | 50 | 1 | Configuration file password declaration. |
| 127 | pii | BLOCK | BLOCK | ✓ | 40 | 1 | International phone number format. |
| 128 | pii | BLOCK | BLOCK | ✓ | 70 | 2 | Social Security Number. |
| 129 | pii | BLOCK | BLOCK | ✓ | 80 | 2 | Internal IPv4 addresses. |
| 130 | pii | BLOCK | BLOCK | ✓ | 80 | 2 | PII email and network address. |
| 131 | confidential | BLOCK | BLOCK | ✓ | 65 | 2 | Confidential term: unreleased product and project codename. |
| 132 | confidential | BLOCK | BLOCK | ✓ | 60 | 2 | Confidential term: board meeting. |
| 133 | confidential | BLOCK | BLOCK | ✓ | 30 | 1 | Confidential term: salary. |
| 134 | confidential | BLOCK | BLOCK | ✓ | 60 | 2 | Confidential terms: proprietary, trade secret. |
| 135 | confidential | BLOCK | BLOCK | ✓ | 60 | 2 | Confidential terms: merger, acquisition. |
| 136 | confidential | BLOCK | BLOCK | ✓ | 30 | 1 | Confidential term: internal use only. |
| 137 | confidential | BLOCK | BLOCK | ✓ | 60 | 2 | Confidential terms: privileged, attorney-client. |
| 138 | confidential | BLOCK | BLOCK | ✓ | 30 | 1 | Confidential term: performance review. |
| 139 | confidential | BLOCK | BLOCK | ✓ | 30 | 1 | Confidential term: top secret. |
| 140 | confidential | BLOCK | BLOCK | ✓ | 30 | 1 | Confidential term: gdpr. |

---
*Generated by Shadow AI Prompt Guardian Evaluation Harness*