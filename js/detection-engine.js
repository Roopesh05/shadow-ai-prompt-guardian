/**
 * Shadow AI Prompt Guardian — Detection Engine (v5.0 "SENTINEL")
 *
 * Client-side detection engine with:
 *   1. Regex-based rules for API keys / secrets
 *   2. Password / credential detection
 *   3. PII detection (emails, phones, SSNs, IPs)
 *   4. Confidential keyword / phrase dictionary
 *   5. Shannon entropy analysis for unknown high-entropy tokens
 *   6. Smart context scoring (educational queries get lower risk)
 *   7. Context-window analysis (tracks last 5 messages for slow-drip leaks)
 *   8. Explainable detection (shows which rule fired and why)
 *   9. Severity levels (Critical / Warning / Info)
 *  10. Bulk data detection (many PII instances = higher risk)
 *  11. Session summary stats (prompts checked, blocked, redacted)
 *
 * All logic runs 100% in-browser; no external API calls.
 */

// ─── Constants ───────────────────────────────────────────────────────────────

const DEFAULT_SENSITIVITY_THRESHOLD = 30;

const DEFAULT_CONFIDENTIAL_TERMS = [
  'confidential',
  'proprietary',
  'trade secret',
  'do not share',
  'internal use only',
  'employee id',
  'employee number',
  'staff id',
  'worker id',
  'social security',
  'ssn',
  'salary',
  'compensation',
  'performance review',
  'board meeting',
  'merger',
  'acquisition',
  'unreleased product',
  'code name',
  'project [a-z]+',
  'codename',
  'top secret',
  'restricted',
  'privileged',
  'attorney-client',
  'patient records',
  'hipaa',
  'gdpr',
  'pii',
  'personally identifiable',
  'internal document',
  'proprietary information',
  'company secret',
  'business confidential',
];

// ─── Placeholder map for auto-redact ─────────────────────────────────────────

const PLACEHOLDERS = {
  api_key: '[API_KEY]',
  password: '[PASSWORD]',
  pii: '[REDACTED]',
  confidential: '[CONFIDENTIAL]',
  high_entropy_token: '[HIGH_ENTROPY_TOKEN]',
};

// ─── API Key / Secret Patterns ───────────────────────────────────────────────

const API_KEY_PATTERNS = [
  // ── AWS ───────────────────────────────────────────────────────────────────
  { id: 'aws_access_key', name: 'AWS Access Key', pattern: /AKIA(?:\s*[0-9A-Z]){16}/g },
  { id: 'aws_secret_env', name: 'AWS Secret (env)', pattern: /AWS_SECRET[_\s]*ACCESS[_\s]*KEY\s*[=:]\s*["']?[A-Za-z0-9/+=]{40}/gi },
  { id: 'aws_session_token', name: 'AWS Session Token', pattern: /AWS_SESSION_TOKEN\s*[=:]\s*["']?[A-Za-z0-9/+=]{16,}/gi },
  // ── GitHub / GitLab ───────────────────────────────────────────────────────
  { id: 'github_pat', name: 'GitHub Personal Access Token', pattern: /ghp_[A-Za-z0-9]{36}/g },
  { id: 'github_fine_pat', name: 'GitHub Fine-grained PAT', pattern: /github_pat_[A-Za-z0-9_]{82}/g },
  { id: 'github_oauth', name: 'GitHub OAuth Token', pattern: /gho_[A-Za-z0-9]{36}/g },
  { id: 'github_app', name: 'GitHub App Token', pattern: /ghu_[A-Za-z0-9]{36}/g },
  { id: 'github_refresh', name: 'GitHub Refresh Token', pattern: /ghr_[A-Za-z0-9]{36}/g },
  { id: 'gitlab_pat', name: 'GitLab Personal Access Token', pattern: /glpat-[A-Za-z0-9\-]{20,}/g },
  { id: 'gitlab_runner', name: 'GitLab Runner Token', pattern: /glrt-[A-Za-z0-9_\-]{20,}/g },
  // ── Slack ─────────────────────────────────────────────────────────────────
  { id: 'slack_bearer', name: 'Slack Bot Token', pattern: /xoxb-[A-Za-z0-9_\-]{20,}/g },
  { id: 'slack_user', name: 'Slack User Token', pattern: /xoxp-[0-9]{10,}-[0-9]{10,}-[A-Za-z0-9]{30,}/g },
  { id: 'slack_legacy', name: 'Slack Legacy Token', pattern: /xoxa-[0-9]{10,}-[A-Za-z0-9]{30,}/g },
  { id: 'slack_workflow', name: 'Slack Workflow Token', pattern: /xoxe\.xoxb-[A-Za-z0-9\-]{100,}/g },
  // ── Google / GCP ──────────────────────────────────────────────────────────
  { id: 'google_oauth', name: 'Google OAuth Token', pattern: /ya29\.[A-Za-z0-9_-]{10,}/g },
  { id: 'google_api_key', name: 'Google API Key', pattern: /AIza[0-9A-Za-z\-_]{35}/g },
  { id: 'gcp_service_account', name: 'GCP Service Account Key', pattern: /"private_key":\s*"-----BEGIN RSA PRIVATE KEY-----/g },
  { id: 'gcp_oauth_client', name: 'GCP OAuth Client Secret', pattern: /GOCSPX-[A-Za-z0-9_\-]{28}/g },
  // ── Stripe ────────────────────────────────────────────────────────────────
  { id: 'stripe_sk', name: 'Stripe Secret Key', pattern: /sk_(?:live|test)_[0-9a-zA-Z]{24,}/g },
  { id: 'stripe_rk', name: 'Stripe Restricted Key', pattern: /rk_(?:live|test)_[0-9a-zA-Z]{24,}/g },
  { id: 'stripe_pk', name: 'Stripe Publishable Key', pattern: /pk_(?:live|test)_[0-9a-zA-Z]{24,}/g },
  { id: 'stripe_webhook', name: 'Stripe Webhook Secret', pattern: /whsec_[A-Za-z0-9]{32,}/g },
  // ── OpenAI / Anthropic / AI providers ────────────────────────────────────
  { id: 'openai_key', name: 'OpenAI API Key', pattern: /sk-[A-Za-z0-9\-]{12,}\b/gi },
  { id: 'openai_project_key', name: 'OpenAI Project Key', pattern: /sk-proj-[A-Za-z0-9_\-]{40,}/g },
  { id: 'anthropic_key', name: 'Anthropic API Key', pattern: /sk-ant-[A-Za-z0-9\-_]{80,}/g },
  { id: 'huggingface_token', name: 'HuggingFace Token', pattern: /hf_[A-Za-z0-9]{32,}/g },
  // ── Azure ─────────────────────────────────────────────────────────────────
  { id: 'azure_key', name: 'Azure API Key (hex)', pattern: /(?<=\b(?:azure|AZURE)[^\n]{0,30}?[=:\s_]+)[0-9a-fA-F]{32}\b/gi },
  { id: 'azure_conn_string', name: 'Azure Connection String', pattern: /DefaultEndpointsProtocol=https?;AccountName=[^;]+;AccountKey=[A-Za-z0-9+\/=]{40,}/g },
  { id: 'azure_sas_token', name: 'Azure SAS Token', pattern: /sv=\d{4}-\d{2}-\d{2}&[a-z]{2}=[^&\s]{1,50}&(?:[a-z]{2}=[^&\s]{1,50}&){1,10}sig=[A-Za-z0-9%+\/=]{30,}/g },
  // ── Heroku / Platform ─────────────────────────────────────────────────────
  { id: 'heroku_key', name: 'Heroku API Key', pattern: /(?<=\b(?:heroku|HEROKU)[^\n]{0,30}?[=:\s_]+)[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi },
  // ── Twilio / Vonage / Comms ───────────────────────────────────────────────
  { id: 'twilio_sid', name: 'Twilio Account SID', pattern: /AC[a-zA-Z0-9]{32}/gi },
  { id: 'twilio_token', name: 'Twilio Auth Token', pattern: /(?:twilio|TWILIO).*?["']([a-f0-9]{32})["']/gi },
  { id: 'vonage_api_secret', name: 'Vonage API Secret', pattern: /(?:vonage|nexmo)_?(?:api_?)?secret[\s:="']+[A-Za-z0-9]{16,}/gi },
  { id: 'sendgrid_key', name: 'SendGrid API Key', pattern: /SG\.[A-Za-z0-9_\-]{22,}\.[A-Za-z0-9_\-]{43,}/g },
  { id: 'mailchimp_key', name: 'Mailchimp API Key', pattern: /[0-9a-f]{32}-us\d{1,2}/g },
  // ── Cloud Infrastructure ──────────────────────────────────────────────────
  { id: 'vercel_token', name: 'Vercel Token', pattern: /(?:vercel|VERCEL).*?["']([A-Za-z0-9]{24,})["']/gi },
  { id: 'railway_token', name: 'Railway Token', pattern: /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(?=.*railway)/gi },
  { id: 'cloudflare_global_key', name: 'Cloudflare Global API Key', pattern: /(?:cloudflare|CLOUDFLARE).*?["']([0-9a-f]{37})["']/gi },
  { id: 'cloudflare_api_token', name: 'Cloudflare API Token', pattern: /(?:cloudflare|CLOUDFLARE).*?["']?([A-Za-z0-9_\-]{40})["']?/gi },
  { id: 'digitalocean_pat', name: 'DigitalOcean PAT', pattern: /dop_v1_[A-Za-z0-9]{64}/g },
  { id: 'linode_token', name: 'Linode API Token', pattern: /(?:linode|LINODE).*?["']([a-f0-9]{64})["']/gi },
  // ── Databases ─────────────────────────────────────────────────────────────
  { id: 'mongodb_conn_str', name: 'MongoDB Connection String', pattern: /mongodb(?:\+srv)?:\/\/[^:\s]+:[^@\s]+@[^\s]+/g },
  { id: 'mongodb_atlas', name: 'MongoDB Atlas API Key', pattern: /(?:atlas|ATLAS).*?apiKey["':\s]+([A-Za-z0-9_\-]{24,})/gi },
  { id: 'postgres_conn_str', name: 'PostgreSQL Connection String', pattern: /postgres(?:ql)?:\/\/[^:\s]+:[^@\s]+@[^\s]+/g },
  { id: 'mysql_conn_str', name: 'MySQL Connection String', pattern: /mysql:\/\/[^:\s]+:[^@\s]+@[^\s]+/g },
  { id: 'redis_url', name: 'Redis URL with credentials', pattern: /redis:\/\/[^:\s]+:[^@\s]+@[^\s]+/g },
  { id: 'snowflake_key', name: 'Snowflake Account/Key', pattern: /(?:snowflake|SNOWFLAKE).*?(?:password|account)\s*[=:]\s*["']?[^\s"']{8,}/gi },
  { id: 'databricks_token', name: 'Databricks PAT', pattern: /dapi[A-Za-z0-9]{32}/g },
  // ── Observability / Monitoring ────────────────────────────────────────────
  { id: 'datadog_api_key', name: 'Datadog API Key', pattern: /(?:datadog|DD).*?(?:api_?key|APP_KEY)\s*[=:]\s*["']?([A-Za-z0-9]{32,40})/gi },
  { id: 'datadog_app_key', name: 'Datadog App Key', pattern: /(?:datadog|DD).*?(?:app_?key)\s*[=:]\s*["']?([A-Za-z0-9]{40,})/gi },
  { id: 'newrelic_license', name: 'New Relic License Key', pattern: /NRAK-[A-Z0-9]{40}/g },
  { id: 'newrelic_ingest', name: 'New Relic Ingest Key', pattern: /(?:eu01|us01)_[a-f0-9]{32}/g },
  { id: 'pagerduty_key', name: 'PagerDuty API Key', pattern: /(?:pagerduty|PD).*?(?:api_?key|token)\s*[=:]\s*["']?([A-Za-z0-9_\-+]{16,})/gi },
  { id: 'sentry_dsn', name: 'Sentry DSN with key', pattern: /https?:\/\/[a-f0-9]{32}@[a-z0-9.]+\.ingest\.sentry\.io\/\d+/g },
  // ── DevTools / Productivity ───────────────────────────────────────────────
  { id: 'figma_token', name: 'Figma Personal Access Token', pattern: /figd_[A-Za-z0-9_\-]{43}/g },
  { id: 'linear_api_key', name: 'Linear API Key', pattern: /lin_api_[A-Za-z0-9]{40}/g },
  { id: 'notion_token', name: 'Notion Integration Token', pattern: /secret_[A-Za-z0-9]{43}/g },
  { id: 'airtable_key', name: 'Airtable API Key', pattern: /\bkey[A-Za-z0-9]{14}\b/g },
  { id: 'postman_api_key', name: 'Postman API Key', pattern: /PMAK-[a-f0-9]{24}-[a-f0-9]{34}/g },
  { id: 'npm_token', name: 'NPM Access Token', pattern: /npm_[A-Za-z0-9]{36}/g },
  // ── Security / Secrets Management ─────────────────────────────────────────
  { id: 'hashicorp_vault', name: 'HashiCorp Vault Token', pattern: /(?:hvs|hvb|hvr)\.[A-Za-z0-9_\-]{90,}/g },
  { id: 'firebase_sa_key', name: 'Firebase Service Account Key', pattern: /"type":\s*"service_account"[\s\S]{0,200}"private_key"/g },
  { id: 'jwt_token', name: 'JWT Token (encoded)', pattern: /eyJ[A-Za-z0-9_\-]+\.eyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+/g },
  { id: 'private_key_pem', name: 'Private Key (PEM)', pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g },
  { id: 'certificate_pem', name: 'Certificate (PEM)', pattern: /-----BEGIN CERTIFICATE-----/g },
  // ── Payments / Crypto ─────────────────────────────────────────────────────
  { id: 'paypal_client_secret', name: 'PayPal Client Secret', pattern: /(?:paypal|PAYPAL).*?(?:client_?secret|secret)\s*[=:]\s*["']?([A-Za-z0-9_\-]{20,})/gi },
  { id: 'square_access_token', name: 'Square Access Token', pattern: /sq0atp-[A-Za-z0-9_\-]{22}/g },
  { id: 'square_secret', name: 'Square App Secret', pattern: /sq0csp-[A-Za-z0-9_\-]{43}/g },
  { id: 'bitcoin_priv_key', name: 'Bitcoin Private Key (WIF)', pattern: /[5KL][1-9A-HJ-NP-Za-km-z]{51}/g },
  { id: 'ethereum_priv_key', name: 'Ethereum Private Key', pattern: /0x[a-fA-F0-9]{64}/g },
  { id: 'generic_api_key_labeled', name: 'API Key (labeled)', pattern: /(?:api_?key|staging_?key|dev_?key|secret_?key|access_?token|auth_?token|app_?key)[\s:=-]+([A-Za-z0-9_\-]{16,})/gi },
  { id: 'generic_xapp_token', name: 'Application Token (xapp)', pattern: /xapp_[a-z0-9_\-]{16,}/gi },
  // ethereum_mnemonic disabled due to extreme false positive rate on English prose
];

// ─── Password / Credential Patterns ──────────────────────────────────────────

const PASSWORD_PATTERNS = [
  { id: 'password_assign', name: 'Password Assignment', pattern: /(?:password|passwd|pwd|pass|passcode|secret word)\b[^:"'\n=]*[=:]\s*["']?[^\s"']{6,}/gi },
  { id: 'password_inline', name: 'Password Inline', pattern: /(?:password|passwd|pwd|pass|passcode|secret word)\b[^:"'\n=]*(?:is|was|set to)\s+[^\s"']{6,}/gi },
  { id: 'password_phrase', name: 'Password Phrase', pattern: /\b(?:password is|password was|my password|the password|our password|passcode is|secret word is)\s+[^\s]{6,}/gi },
  { id: 'credential_phrase', name: 'Credential Phrase', pattern: /\b(?:credentials?|login|access)\s+(?:are?|is)\s+[^\s]{6,}/gi },
  { id: 'basic_auth', name: 'Basic Auth Header', pattern: /Basic\s+[A-Za-z0-9+/=]*[+/=][A-Za-z0-9+/=]*/gi },
  { id: 'bearer_token', name: 'Bearer Token', pattern: /Bearer\s+[A-Za-z0-9\-._~+/]{20,}/gi },
  { id: 'cred_file', name: 'Credential File Path', pattern: /(?:\/etc\/|~\/|\.\/)(?:\.?ssh\/|\.?env|credentials?|\.key|\.pem|\.p12)/gi },
];

// ─── Company / Employee Details Patterns ─────────────────────────────────────

const COMPANY_PATTERNS = [
  { id: 'employee_id', name: 'Employee ID', pattern: /\b(?:employee|staff|worker|agent|id|num|number)[\s_-]*(?:id|number|num|no\.?|#)[\s_-]*[:.]?\s*[A-Z0-9]{3,15}\b/gi },
  { id: 'emp_id_short', name: 'Employee ID Short', pattern: /\b(?:EMP|Employee)[-\s]*\d{4,10}\b/gi },
  { id: 'company_domain', name: 'Company Email Domain', pattern: /\b[A-Za-z0-9._%+\-]+@(?:company|corp|inc|llc|org|net)\.(?:com|org|net|io|co)\b/gi },
  { id: 'internal_tool', name: 'Internal Tool/Service', pattern: /\b(?:slack|jira|confluence|asana|trello|notion|okta|azure|aws|gcp|salesforce|workday|sapsuccessfactors)\b/gi },
  { id: 'internal_endpoint', name: 'Internal Domain/Endpoint', pattern: /https?:\/\/[a-zA-Z0-9.\-_]*(?:internal|intranet|staging|corp|private)[a-zA-Z0-9.\-_]*\.[a-z]{2,}/gi },
  { id: 'project_code', name: 'Project Code Name', pattern: /\b(?:project|codename|initiative|operation)[\s_-]*(?:[a-z]+|[A-Z]{2,})\b/gi },
  { id: 'client_name', name: 'Client/Vendor Name', pattern: /\b(?:client|vendor|partner|customer|supplier|contractor)[\s_-]+(?:name|details|info)[\s:]*[A-Z][a-z]+/gi },
];

// ─── PII Patterns ────────────────────────────────────────────────────────────

const PII_PATTERNS = [
  // ── Core PII ──────────────────────────────────────────────────────────────
  { id: 'email', name: 'Email Address', pattern: /\b[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g },
  { id: 'us_phone', name: 'US Phone Number', pattern: /(?<!\w)(?:\+?1[-.\s]?)?(?:\(\d{3}\)[-.\s]?|\b\d{3}[-.\s])\d{3}[-.\s]?\d{4}(?!\w)/g },
  { id: 'int_phone', name: 'International Phone', pattern: /\+(?:[0-9][-.\s]?){7,15}[0-9]\b/g },
  { id: 'ssn', name: 'US Social Security Number', pattern: /\b\d{3}-\d{2}-\d{4}\b/g },
  { id: 'ip_address', name: 'IP Address', pattern: /\b(?!255\.255\.255\.255|0\.0\.0\.0|127\.\d{1,3}\.\d{1,3}\.\d{1,3})\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g },
  { id: 'ipv6', name: 'IPv6 Address', pattern: /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g },
  { id: 'dob', name: 'Date of Birth', pattern: /\b(?:dob|date of birth|birth ?date)\s*[=:]*\s*\d{1,2}[/\-.]\d{1,2}[/\-.]\d{2,4}\b/gi },
  // ── International ID Numbers ──────────────────────────────────────────────
  { id: 'uk_ni', name: 'UK National Insurance Number', pattern: /\b[A-CEGHJ-PR-TW-Z]{2}\d{6}[ABCD]\b/gi },
  { id: 'canadian_sin', name: 'Canadian Social Insurance Number', pattern: /(?<=\b(?:sin|nas|social\s*insurance)[^\n]{0,30}?[=:\s_#]+)\b[1-79]\d{2}[\s\-]?\d{3}[\s\-]?\d{3}\b/gi },
  { id: 'indian_aadhaar', name: 'Indian Aadhaar Number', pattern: /(?<=\b(?:aadhaar|aadhar|uidai)[^\n]{0,30}?[=:\s_#]+)\b[2-9]\d{3}[\s\-]?\d{4}[\s\-]?\d{4}\b/gi },
  { id: 'eu_vat', name: 'EU VAT Number', pattern: /\b(?:AT|BE|BG|CY|CZ|DE|DK|EE|EL|ES|FI|FR|HR|HU|IE|IT|LT|LU|LV|MT|NL|PL|PT|RO|SE|SI|SK)\d{8,12}\b/g },
  { id: 'iban', name: 'IBAN Bank Account', pattern: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g },
  { id: 'swift_bic', name: 'SWIFT/BIC Code', pattern: /(?<=\b(?:swift|bic|bank)[\s:_\-=]+)[A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/gi },
  { id: 'passport', name: 'Passport Number', pattern: /\b(?:passport(?:\s+no\.?|\s+number)?\s*[=:])\s*([A-Z]{1,2}\d{7}|\d{9})\b/gi },
  { id: 'drivers_license', name: "Driver's License", pattern: /\b(?:driver'?s?\s+licen[cs]e(?:\s+no\.?)?)\s*[=:]\s*[A-Z0-9\-]{6,18}\b/gi },
  // ── Payment Card ──────────────────────────────────────────────────────────
  { id: 'credit_card', name: 'Credit Card PAN', pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\d{3})\d{11})\b/g },
  { id: 'credit_card_spaced', name: 'Credit Card PAN (spaced)', pattern: /\b(?:\d{4}[\s\-]){3}\d{4}\b/g },
  { id: 'cvv', name: 'Card CVV', pattern: /\b(?:cvv|cvc|cvn|security code)\s*[=:]*\s*\d{3,4}\b/gi },
];

// ─── Luhn Validation ─────────────────────────────────────────────────────────

/**
 * Validate a credit card number using Luhn algorithm.
 * Filters false positives from credit card pattern matches.
 */
function luhnCheck(numStr) {
  const digits = numStr.replace(/[\s\-]/g, '');
  if (!/^\d+$/.test(digits)) return false;
  let sum = 0;
  let isOdd = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = parseInt(digits[i], 10);
    if (isOdd) { d *= 2; if (d > 9) d -= 9; }
    sum += d;
    isOdd = !isOdd;
  }
  return sum % 10 === 0;
}

// ─── Risk Scoring ────────────────────────────────────────────────────────────

const CATEGORY_SCORES = {
  api_key: 50,
  password: 50,
  pii: 40,
  company: 35,
  confidential: 30,
};

// ─── Severity Levels ─────────────────────────────────────────────────────────
// Critical: Immediate danger (API keys, passwords)
// Warning: Potential risk (PII, confidential)
// Info: Low risk (educational context, single PII)
const SEVERITY_LEVELS = {
  api_key: 'critical',
  password: 'critical',
  pii: 'warning',
  company: 'warning',
  confidential: 'info',
  high_entropy_token: 'warning',
};

// Context-aware modifiers — lower risk for clearly educational text
const CONTEXT_MODIFIERS = {
  educational: 0.5,  // "What is an API key?" — half risk
  generic: 0.7,      // "Generate a random password" — 70% risk
  codeBlock: 0.3,    // Inside ```code``` blocks — 30% risk
};

// ─── SENTINEL: Obfuscation Normalizer ───────────────────────────────────────

/**
 * Normalize obfuscated text to improve pattern detection while maintaining precise
 * 1-to-1 character index mapping back to the original text.
 * Prevents offset drift and secret leakage during auto-redaction and DOM highlighting.
 * Handles: leet-speak, zero-width chars, Unicode lookalikes,
 * char-spacing ("s k - a b c"), base64 decoding.
 * @param {string} text
 * @returns {{ normalized: string, indexMap: number[] }}
 */
function normalizeObfuscatedWithMap(text) {
  if (!text || typeof text !== 'string') {
    return { normalized: text || '', indexMap: [] };
  }

  // Track original index for each character
  let chars = [];
  for (let i = 0; i < text.length; i++) {
    chars.push({ char: text[i], origIndex: i });
  }

  // 1. Remove zero-width / invisible characters
  // eslint-disable-next-line no-control-regex
  const invisibleRe = /[\u200B-\u200D\uFEFF\u00AD\u2060\u180E]/;
  chars = chars.filter(c => !invisibleRe.test(c.char));

  // 2. Unicode lookalike substitution (1-to-1 mapping)
  const lookalikes = {
    '\u0430': 'a', '\u04D0': 'A', '\u00E0': 'a', '\u00E1': 'a', '\u00E2': 'a',
    '\u0435': 'e', '\u00E9': 'e', '\u00E8': 'e',
    '\u0456': 'i', '\u00ED': 'i',
    '\u043E': 'o', '\u00F3': 'o', '\u00F8': 'o',
    '\u0440': 'p', '\u0441': 'c', '\u0445': 'x',
    '\u2013': '-', '\u2014': '-', '\u2212': '-',
  };
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i].char;
    if (lookalikes[ch]) {
      chars[i].char = lookalikes[ch];
    }
  }

  // 3. Leet-speak normalization (conservative, 1-to-1 character replacement)
  let currentStr = chars.map(c => c.char).join('');
  const leetRules = [
    { re: /(?<![a-zA-Z])0(?=[a-zA-Z])/g, repl: 'o' },
    { re: /(?<=[a-zA-Z])0(?![a-zA-Z])/g, repl: 'o' },
    { re: /(?<=[A-Z])1(?=[A-Z])/g, repl: 'I' },
    { re: /\$(?=[A-Za-z])/g, repl: 's' }
  ];
  for (const rule of leetRules) {
    let m;
    while ((m = rule.re.exec(currentStr)) !== null) {
      chars[m.index].char = rule.repl;
    }
    currentStr = chars.map(c => c.char).join('');
  }

  // 4. Collapse character-spaced tokens ("s k - a b c" → "sk-abc")
  // Only collapse when the token contains letters or hyphens,
  // preventing false-positive phone detection on space-delimited digit sequences.
  const spacedRe = /\b([A-Za-z0-9])(?:\s([A-Za-z0-9\-])){3,}\b/g;
  let spacedMatch;
  const spaceIndicesToRemove = new Set();
  while ((spacedMatch = spacedRe.exec(currentStr)) !== null) {
    const matchedSegment = spacedMatch[0];
    if (/[a-zA-Z\-]/.test(matchedSegment)) {
      const startIdx = spacedMatch.index;
      const endIdx = startIdx + matchedSegment.length;
      for (let i = startIdx; i < endIdx; i++) {
        if (/\s/.test(chars[i].char)) {
          spaceIndicesToRemove.add(i);
        }
      }
    }
  }

  if (spaceIndicesToRemove.size > 0) {
    chars = chars.filter((_, idx) => !spaceIndicesToRemove.has(idx));
  }

  return {
    normalized: chars.map(c => c.char).join(''),
    indexMap: chars.map(c => c.origIndex),
  };
}

/**
 * Normalize obfuscated text (wrapper for backwards compatibility).
 */
function normalizeObfuscated(text) {
  return normalizeObfuscatedWithMap(text).normalized;
}

/**
 * Scan base64-decoded content for secrets.
 * Finds base64 blobs (≥32 chars), decodes, and re-scans.
 */
function scanBase64Content(text, alreadyFoundRanges) {
  const results = [];
  // Match base64 blobs (≥32 chars, not already a known finding)
  const base64Re = /[A-Za-z0-9+/]{32,}={0,2}/g;
  let m;
  while ((m = base64Re.exec(text)) !== null) {
    const overlaps = alreadyFoundRanges.some(r => m.index >= r.start && m.index < r.end);
    if (overlaps) continue;
    try {
      let decoded;
      try { decoded = atob(m[0]); } catch (_) { continue; }
      if (!decoded || decoded.length < 8) continue;
      // Quick check if decoded contains printable text with potential secrets
      if (!/[\x20-\x7E]{8,}/.test(decoded)) continue;
      // Scan decoded string for API key patterns
      for (const rule of API_KEY_PATTERNS.slice(0, 30)) { // Core patterns only
        rule.pattern.lastIndex = 0;
        if (rule.pattern.test(decoded)) {
          results.push({
            id: `base64_${rule.id}`,
            name: `Base64-encoded ${rule.name}`,
            match: m[0],
            start: m.index,
            end: m.index + m[0].length,
            category: 'api_key',
            severity: 'critical',
            matchMasked: `[BASE64:${rule.name}]`,
          });
          break;
        }
      }
    } catch (_) {}
  }
  return results;
}

// ─── SENTINEL: Compliance Presets ────────────────────────────────────────────

/**
 * Compliance mode pattern sets.
 * Each preset adds domain-specific patterns on top of the baseline.
 */
const COMPLIANCE_PRESETS = {
  hipaa: {
    name: 'HIPAA',
    description: 'Protected Health Information (PHI)',
    patterns: [
      { id: 'npi', name: 'NPI (Provider Identifier)', pattern: /\bNPI\s*[=:#:]?\s*\d{10}\b/gi },
      { id: 'dea_number', name: 'DEA Registration Number', pattern: /\b[A-Za-z]{2}\d{7}\b/g },
      { id: 'mrn', name: 'Medical Record Number', pattern: /\b(?:MRN|medical record(?:\s+no\.?)?)\s*[=:#]?\s*[A-Z0-9\-]{6,20}\b/gi },
      { id: 'diagnosis_code', name: 'ICD-10 Diagnosis Code', pattern: /\b[A-Z]\d{2}(?:\.\d{1,4})?\b/g },
      { id: 'phi_keyword', name: 'PHI Keyword', pattern: /\b(?:patient(?:'s)?\s+(?:name|id|record|chart|data|information)|medical record|health record|treatment plan|prescription|diagnosis|lab result|medication|dosage|clinical note|discharge summary)\b/gi },
    ],
    terms: ['hipaa', 'phi', 'protected health information', 'ehr', 'emr', 'patient data', 'medical record', 'clinical trial', 'treatment plan', 'prescription'],
    riskMultiplier: 1.5,
  },
  pci_dss: {
    name: 'PCI-DSS',
    description: 'Payment Card Industry Data',
    patterns: [
      { id: 'pan', name: 'Payment Card PAN', pattern: /\b(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})\b/g },
      { id: 'card_expiry', name: 'Card Expiry Date', pattern: /\b(?:expiry|expiration|exp|valid thru)\s*[=:]*\s*(?:0[1-9]|1[0-2])[/\-]\d{2,4}\b/gi },
      { id: 'track_data', name: 'Track 1/2 Data', pattern: /%B\d{13,19}\^[A-Z /]{2,26}\^\d{4}\d{3}[\d\s]{13}\?/g },
    ],
    terms: ['cardholder data', 'pci', 'pan', 'card number', 'card holder', 'cvv', 'cvc', 'pin', 'track data'],
    riskMultiplier: 1.5,
  },
  gdpr: {
    name: 'GDPR',
    description: 'EU General Data Protection Regulation',
    patterns: [
      { id: 'eu_citizen_id', name: 'EU Citizen ID Reference', pattern: /\b(?:national id|citizen(?:ship)? number|identity card)\s*[=:]*\s*[A-Z0-9\-]{6,20}\b/gi },
      { id: 'data_subject', name: 'GDPR Data Subject Reference', pattern: /\b(?:data subject|DSAR|right to erasure|right to access|data portability|legitimate interest)\b/gi },
    ],
    terms: ['gdpr', 'personal data', 'data subject', 'data controller', 'data processor', 'right to erasure', 'right to access', 'dpa', 'supervisory authority', 'lawful basis'],
    riskMultiplier: 1.2,
  },
  soc2: {
    name: 'SOC 2',
    description: 'Service Organization Control 2',
    patterns: [],
    terms: ['soc 2', 'soc2', 'system and organization controls', 'trust service criteria', 'availability criterion', 'security criterion', 'confidentiality criterion', 'processing integrity', 'pen test', 'vulnerability assessment', 'audit log', 'access control matrix'],
    riskMultiplier: 1.2,
  },
};

/**
 * Apply compliance preset: returns extra findings based on active presets.
 */
function applyCompliancePresets(text, activePresets) {
  if (!activePresets || activePresets.length === 0) return { findings: [], multiplier: 1.0 };
  const results = [];
  let maxMultiplier = 1.0;

  for (const presetId of activePresets) {
    const preset = COMPLIANCE_PRESETS[presetId];
    if (!preset) continue;
    maxMultiplier = Math.max(maxMultiplier, preset.riskMultiplier || 1.0);

    // Scan preset-specific patterns
    for (const rule of preset.patterns) {
      rule.pattern.lastIndex = 0;
      let m;
      while ((m = rule.pattern.exec(text)) !== null) {
        if (rule.id === 'pan' && !luhnCheck(m[0])) continue;
        results.push({
          id: `${presetId}_${rule.id}`,
          name: `[${preset.name}] ${rule.name}`,
          match: m[0],
          start: m.index,
          end: m.index + m[0].length,
          category: 'pii',
          severity: 'critical',
          matchMasked: maskSecret(m[0]),
          complianceMode: presetId,
        });
        if (m[0].length === 0) rule.pattern.lastIndex++;
      }
    }

    // Scan preset-specific terms
    for (const term of preset.terms) {
      try {
        const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        let m2;
        while ((m2 = re.exec(text)) !== null) {
          results.push({
            id: `${presetId}_term`,
            name: `[${preset.name}] Compliance term: ${m2[0]}`,
            match: m2[0],
            start: m2.index,
            end: m2.index + m2[0].length,
            category: 'confidential',
            severity: 'warning',
            matchMasked: `[${preset.name}:${m2[0].substring(0, 6)}…]`,
            complianceMode: presetId,
          });
          if (m2[0].length === 0) re.lastIndex++;
        }
      } catch (_) {}
    }
  }

  return { findings: results, multiplier: maxMultiplier };
}

// ─── API Key Rotation Links ──────────────────────────────────────────────────

/**
 * Map API key types to their rotation/management URLs.
 */
const KEY_ROTATION_LINKS = {
  aws: {
    name: 'AWS IAM Console',
    url: 'https://console.aws.amazon.com/iam/home#/security_credentials',
    icon: '☁️',
  },
  github: {
    name: 'GitHub Tokens',
    url: 'https://github.com/settings/tokens',
    icon: '🐙',
  },
  openai: {
    name: 'OpenAI API Keys',
    url: 'https://platform.openai.com/api-keys',
    icon: '🤖',
  },
  stripe: {
    name: 'Stripe Dashboard',
    url: 'https://dashboard.stripe.com/apikeys',
    icon: '💳',
  },
  gitlab: {
    name: 'GitLab Tokens',
    url: 'https://gitlab.com/-/user_settings/personal_access_tokens',
    icon: '🦊',
  },
  slack: {
    name: 'Slack API Tokens',
    url: 'https://api.slack.com/apps',
    icon: '💬',
  },
  google: {
    name: 'Google Cloud Console',
    url: 'https://console.cloud.google.com/apis/credentials',
    icon: '🔍',
  },
  anthropic: {
    name: 'Anthropic Console',
    url: 'https://console.anthropic.com/settings/keys',
    icon: '🤖',
  },
  huggingface: {
    name: 'HuggingFace Tokens',
    url: 'https://huggingface.co/settings/tokens',
    icon: '🤗',
  },
  vercel: {
    name: 'Vercel Tokens',
    url: 'https://vercel.com/account/tokens',
    icon: '▲',
  },
  cloudflare: {
    name: 'Cloudflare API Tokens',
    url: 'https://dash.cloudflare.com/profile/api-tokens',
    icon: '☁️',
  },
  sendgrid: {
    name: 'SendGrid API Keys',
    url: 'https://app.sendgrid.com/settings/api_keys',
    icon: '📧',
  },
  datadog: {
    name: 'Datadog API Keys',
    url: 'https://app.datadoghq.com/organization-settings/api-keys',
    icon: '🐕',
  },
  hashicorp: {
    name: 'HashiCorp Vault',
    url: 'https://developer.hashicorp.com/vault/docs/concepts/tokens',
    icon: '🔐',
  },
};

/**
 * Get rotation link for a finding based on its ID.
 * @param {string} findingId
 * @returns {{url: string, name: string, icon: string} | null}
 */
function getKeyRotationLink(findingId) {
  const id = findingId.toLowerCase();
  if (id.includes('aws')) return KEY_ROTATION_LINKS.aws;
  if (id.includes('github')) return KEY_ROTATION_LINKS.github;
  if (id.includes('openai') || id.startsWith('sk-')) return KEY_ROTATION_LINKS.openai;
  if (id.includes('anthropic')) return KEY_ROTATION_LINKS.anthropic;
  if (id.includes('huggingface') || id.startsWith('hf_')) return KEY_ROTATION_LINKS.huggingface;
  if (id.includes('stripe')) return KEY_ROTATION_LINKS.stripe;
  if (id.includes('gitlab')) return KEY_ROTATION_LINKS.gitlab;
  if (id.includes('slack')) return KEY_ROTATION_LINKS.slack;
  if (id.includes('google') || id.includes('ya29') || id.includes('gcp')) return KEY_ROTATION_LINKS.google;
  if (id.includes('vercel')) return KEY_ROTATION_LINKS.vercel;
  if (id.includes('cloudflare')) return KEY_ROTATION_LINKS.cloudflare;
  if (id.includes('sendgrid')) return KEY_ROTATION_LINKS.sendgrid;
  if (id.includes('datadog')) return KEY_ROTATION_LINKS.datadog;
  if (id.includes('hashicorp') || id.includes('vault')) return KEY_ROTATION_LINKS.hashicorp;
  return null;
}

/**
 * Get all unique rotation links for a set of findings.
 * @param {Array} findings
 * @returns {Array<{id: string, url: string, name: string, icon: string}>}
 */
function getRotationLinksForFindings(findings) {
  const links = [];
  const seen = new Set();
  for (const f of findings) {
    const link = getKeyRotationLink(f.id);
    if (link && !seen.has(link.url)) {
      seen.add(link.url);
      links.push({ id: f.id, ...link });
    }
  }
  return links;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shannonEntropy(s) {
  if (!s || s.length === 0) return 0;
  const freq = {};
  for (const ch of s) freq[ch] = (freq[ch] || 0) + 1;
  let entropy = 0;
  const len = s.length;
  for (const ch of Object.keys(freq)) {
    const p = freq[ch] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

function isHighEntropyToken(s) {
  if (!s || s.length < 20) return false;
  const cleaned = s.replace(/^[=: \t"']+|[=:"' \t]+$/g, '');
  if (cleaned.length < 20) return false;
  const entropy = shannonEntropy(cleaned);
  // Base-16 hex strings have a theoretical max entropy of log2(16) = 4.0
  if (/^[0-9a-fA-F]+$/.test(cleaned) && cleaned.length >= 30) {
    return entropy >= 3.7;
  }
  return entropy >= 4.0;
}

/**
 * Detect if text is clearly educational / instructional (not a real leak).
 */
function isEducationalContext(text) {
  const lower = text.toLowerCase().trim();
  const educationalPatterns = [
    /^what\s+(is|are|does|how)\b/i,
    /^explain\s+/i,
    /^how\s+(do|i)\b/i,
    /^can\s+you\s+(explain|show|tell)\b/i,
    /^generate\s+(a\s+)?random/i,
    /^what\s+is\s+(an?\s+)?(api|key|password|token|ssn|email)\b/i,
    /^best\s+(practices?|ways)\s+to?\s+/i,
    /^how\s+to\s+(generate|rotate|store|protect)\b/i,
    /^what\s+are\s+(the\s+)?best\s+/i,
    /^what\s+does\s+/i,
    /^example\s+(of|for)\s+/i,
    /^show\s+(me\s+)?an?\s*example\b/i,
    /^write\s+(me\s+)?a?\s+(example|function|script)\b/i,
  ];
  return educationalPatterns.some((p) => p.test(lower));
}

// ─── Code Context Awareness ──────────────────────────────────────────────────

/**
 * Detect if text contains code blocks (Markdown ``` or inline `).
 * @param {string} text
 * @returns {{isCodeBlock: boolean, codeBlockRatio: number, lineCount: number}}
 */
function detectCodeContext(text) {
  if (!text || typeof text !== 'string') return { isCodeBlock: false, codeBlockRatio: 0, lineCount: 0 };

  const lines = text.split('\n');
  const lineCount = lines.length;

  // Count Markdown code fences
  const codeFences = (text.match(/```/g) || []).length;
  const hasCodeBlock = codeFences >= 2; // Paired fences = code block

  // Count inline code (backticks)
  const inlineCode = (text.match(/`[^`]+`/g) || []).length;

  // Calculate ratio of code-like lines
  let codeLineCount = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      trimmed.startsWith('```') ||
      trimmed.startsWith('//') ||
      trimmed.startsWith('#') ||
      trimmed.startsWith('*') ||
      trimmed.includes('const ') ||
      trimmed.includes('let ') ||
      trimmed.includes('var ') ||
      trimmed.includes('function ') ||
      trimmed.includes('import ') ||
      trimmed.includes('export ') ||
      trimmed.includes('{') && trimmed.includes('}')
    ) {
      codeLineCount++;
    }
  }

  const codeBlockRatio = lineCount > 0 ? codeLineCount / lineCount : 0;

  return {
    isCodeBlock: hasCodeBlock || codeBlockRatio > 0.3,
    codeBlockRatio,
    lineCount,
    codeFences,
    inlineCode,
  };
}

/**
 * Check if a specific position in text is inside a code block.
 * @param {string} text
 * @param {number} position
 * @returns {boolean}
 */
function isInsideCodeBlock(text, position) {
  if (!text || position < 0 || position >= text.length) return false;

  const before = text.substring(0, position);
  const codeFences = (before.match(/```/g) || []).length;

  // Odd number of fences = inside code block
  return codeFences % 2 === 1;
}

/**
 * Get findings that are inside code blocks (lower sensitivity).
 * @param {string} text
 * @param {Array} findings
 * @returns {{codeFindings: Array, nonCodeFindings: Array}}
 */
function separateCodeFindings(text, findings) {
  const codeFindings = [];
  const nonCodeFindings = [];

  for (const f of findings) {
    // Check if the finding is inside a code block
    const midPoint = f.start + Math.floor(f.end - f.start) / 2;
    if (isInsideCodeBlock(text, midPoint)) {
      codeFindings.push(f);
    } else {
      nonCodeFindings.push(f);
    }
  }

  return { codeFindings, nonCodeFindings };
}

function findMatches(text, rule) {
  const results = [];
  rule.pattern.lastIndex = 0;
  let m;
  while ((m = rule.pattern.exec(text)) !== null) {
    results.push({
      id: rule.id,
      name: rule.name,
      match: m[0],
      start: m.index,
      end: m.index + m[0].length,
    });
    if (m[0].length === 0) rule.pattern.lastIndex++;
  }
  return results;
}

function findConfidentialTerms(text, terms) {
  const results = [];
  for (const term of terms) {
    if (!term || typeof term !== 'string') continue;
    try {
      let regex;
      const isRegexLiteral = /^\/(.+)\/([a-z]*)$/.test(term);
      if (isRegexLiteral) {
        const parts = term.match(/^\/(.+)\/([a-z]*)$/);
        const flags = parts[2].includes('g') ? parts[2] : parts[2] + 'g';
        regex = new RegExp(parts[1], flags);
      } else if (/[\[\]\(\)\*\+\?\^\|\\]/.test(term)) {
        try {
          regex = new RegExp(term, 'gi');
        } catch (_) {
          regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
        }
      } else {
        regex = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      }
      regex.lastIndex = 0;
      let m;
      while ((m = regex.exec(text)) !== null) {
        results.push({
          id: 'confidential',
          name: `Confidential term: ${m[0]}`,
          match: m[0],
          start: m.index,
          end: m.index + m[0].length,
        });
        if (m[0].length === 0) regex.lastIndex++;
      }
    } catch (_) {}
  }
  return results;
}

function findHighEntropyTokens(text, alreadyFoundRanges) {
  const results = [];
  const tokenRe = /[^\s,;:\n\r\t/"'`()\[\]{}<>|\\]+/g;
  let m;
  while ((m = tokenRe.exec(text)) !== null) {
    const token = m[0];
    if (!isHighEntropyToken(token)) continue;
    const tokenStart = m.index;
    const tokenEnd = tokenStart + token.length;
    const overlaps = alreadyFoundRanges.some(
      (r) => !(tokenEnd <= r.start || tokenStart >= r.end)
    );
    if (overlaps) continue;
    results.push({
      id: 'high_entropy_token',
      name: 'High-entropy token (possible secret)',
      match: token,
      start: tokenStart,
      end: tokenEnd,
    });
  }
  return results;
}

// ─── Main Detection Function (see enhanced version below) ────────────────────

function maskSecret(value) {
  if (!value || value.length <= 6) return '•'.repeat(Math.max(value.length, 4));
  return `${value.substring(0, 4)}${'•'.repeat(Math.max(value.length - 6, 4))}${value.substring(value.length - 2)}`;
}

function deduplicateFindings(findings) {
  if (findings.length <= 1) return findings;
  // Separate bulk findings (they span the whole text)
  const bulkFindings = findings.filter(f => f.id && f.id.startsWith("bulk_"));
  const normalFindings = findings.filter(f => !(f.id && f.id.startsWith("bulk_")));
  const categoryOrder = { api_key: 4, password: 4, company: 3, pii: 3, confidential: 2 };
  const sorted = normalFindings.sort((a, b) => {
    const orderDiff = (categoryOrder[b.category] || 0) - (categoryOrder[a.category] || 0);
    if (orderDiff !== 0) return orderDiff;
    return (b.end - b.start) - (a.end - a.start);
  });
  const kept = [];
  for (const f of sorted) {
    const overlaps = kept.some((k) => !(f.end <= k.start || f.start >= k.end));
    if (!overlaps) kept.push(f);
  }
  return [...bulkFindings, ...kept.sort((a, b) => a.start - b.start)];
}

/**
 * Build highlight ranges suitable for DOM insertion.
 */
function getHighlightRanges(findings) {
  if (!findings || findings.length === 0) return [];
  // Filter out bulk findings since they span the entire text (0..length)
  const nonBulk = findings.filter(f => !f.isBulk && !(f.id && f.id.startsWith('bulk_')));
  const categoryOrder = { api_key: 4, password: 4, pii: 3, company: 3, confidential: 2 };
  const sorted = [...nonBulk].sort(
    (a, b) => (categoryOrder[b.category] || 0) - (categoryOrder[a.category] || 0)
  );
  const ranges = [];
  for (const f of sorted) {
    const overlaps = ranges.some((r) => !(f.end <= r.start || f.start >= r.end));
    if (!overlaps) ranges.push({ start: f.start, end: f.end, category: f.category, name: f.name });
  }
  return ranges.sort((a, b) => a.start - b.start);
}

/**
 * Auto-redact sensitive text in a prompt, replacing matches with safe placeholders.
 * @param {string} text
 * @param {Array} findings
 * @returns {{redacted: string, replacements: Array<{start:number, end:number, category:string, originalMasked:string, placeholder:string}>}}
 */
function autoRedact(text, findings) {
  if (!text || !findings || findings.length === 0) return { redacted: text, replacements: [] };

  // Filter out bulk meta-findings — they describe dataset aggregations, not replace-in-place spans
  const nonBulk = findings.filter(f => !f.isBulk && !(f.id && f.id.startsWith('bulk_')));
  if (nonBulk.length === 0) return { redacted: text, replacements: [] };

  // Sort by start position descending so we can safely splice
  const sorted = [...nonBulk].sort((a, b) => b.start - a.start);
  let redacted = text;
  const replacements = [];

  for (const f of sorted) {
    const placeholder = PLACEHOLDERS[f.category] || `[REDACTED]`;
    const originalMasked = f.matchMasked || (f.match ? f.match.substring(0, 8) + '…' : '[REDACTED]');
    const actualStart = Math.min(f.start, redacted.length);
    const actualEnd = Math.min(f.end, redacted.length);
    if (actualStart >= actualEnd) continue;

    redacted = redacted.substring(0, actualStart) + placeholder + redacted.substring(actualEnd);
    replacements.unshift({
      start: actualStart,
      end: actualStart + placeholder.length,
      category: f.category,
      originalMasked,
      placeholder,
    });
  }

  return { redacted, replacements };
}

function getSeverity(category) {
  return SEVERITY_LEVELS[category] || "info";
}

function getFindingExplanation(finding) {
  const explanations = {
    api_key: {
      aws_access_key: 'Detected AWS Access Key ID (format: AKIA + 16 alphanumeric chars)',
      github_pat: 'Detected GitHub Personal Access Token (ghp_ prefix)',
      openai_key: 'Detected OpenAI API Key (sk- prefix)',
      stripe_sk: 'Detected Stripe Secret Key (sk_live_ prefix)',
      high_entropy_token: 'Detected high-entropy token (possible API key or secret)',
      default: 'Detected API key or secret token',
    },
    password: {
      password_assign: 'Detected password assignment pattern',
      password_inline: 'Detected inline password mention',
      basic_auth: 'Detected Basic Auth header',
      bearer_token: 'Detected Bearer token',
      cred_file: 'Detected credential file path',
      default: 'Detected password or credential',
    },
    pii: {
      email: 'Detected email address',
      us_phone: 'Detected US phone number',
      int_phone: 'Detected international phone number',
      ssn: 'Detected Social Security Number',
      ip_address: 'Detected IP address',
      default: 'Detected PII (personally identifiable information)',
    },
    company: {
      employee_id: 'Detected employee/staff ID number',
      emp_id_short: 'Detected employee ID (e.g., EMP-12345)',
      company_domain: 'Detected company email domain',
      internal_tool: 'Detected internal company tool/service',
      project_code: 'Detected project code name',
      client_name: 'Detected client/vendor name',
      default: 'Detected company or employee information',
    },
    confidential: {
      default: 'Detected confidential term or phrase',
    },
  };
  const catExplanations = explanations[finding.category] || explanations.default;
  return catExplanations[finding.id] || catExplanations.default || 'Sensitive content detected';
}

// ─── Phase 1: Session Stats ───────────────────────────────────────────────────

let sessionStats = {
  promptsChecked: 0,
  promptsBlocked: 0,
  promptsRedacted: 0,
  lastCheckedAt: null,
};

function updateSessionStats(action) {
  sessionStats.promptsChecked++;
  sessionStats.lastCheckedAt = new Date().toISOString();
  if (action === 'blocked') sessionStats.promptsBlocked++;
  if (action === 'redacted') sessionStats.promptsRedacted++;
}

function getSessionStats() {
  return { ...sessionStats };
}

// ─── Phase 1: Context-Window Analysis ─────────────────────────────────────────

const CONTEXT_WINDOW_SIZE = 5;
let conversationHistory = [];

function addMessageToHistory(message, role = 'user') {
  conversationHistory.push({
    text: message,
    role,
    timestamp: Date.now(),
  });
  if (conversationHistory.length > CONTEXT_WINDOW_SIZE) {
    conversationHistory.shift();
  }
}

function analyzeContextWindow() {
  if (conversationHistory.length < 2) return [];
  const combinedText = conversationHistory.map(m => m.text).join(' ');
  const result = analyzePrompt(combinedText, { enableEntropyDetection: false, enableBulkDetection: false, enableContextWindow: false });
  const spanningFindings = result.findings.filter(f => {
    let charCount = 0;
    let crossedMessages = false;
    for (const msg of conversationHistory) {
      charCount += msg.text.length;
      if (charCount > f.start) { crossedMessages = true; break; }
    }
    return crossedMessages;
  });
  return spanningFindings.map(f => ({ ...f, severity: 'warning', isContextWindow: true }));
}

// ─── Phase 1: Bulk Data Detection ─────────────────────────────────────────────

// Per-category bulk threshold (5+ of same PII type = bulk)
const BULK_CATEGORY_THRESHOLD = 5;
// Mixed-type bulk threshold (10+ total sensitive items of any PII type)
const BULK_MIXED_THRESHOLD = 10;

/**
 * Detect bulk data dumps: 5+ of the same PII category, or 10+ total PII items.
 * Returns distinct bulk findings with severity 'critical' and a plain-English reason.
 * Does NOT expose raw values — only counts and categories.
 */
function detectBulkData(text, findings) {
  const bulkFindings = [];
  // Count per PII sub-type (id), not just category, for precision
  const idCounts = {};   // e.g., { email: 7, us_phone: 2 }
  const catCounts = {};  // e.g., { pii: 9 }
  const piiFindings = findings.filter(f => f.category === 'pii');

  piiFindings.forEach(f => {
    idCounts[f.id] = (idCounts[f.id] || 0) + 1;
    catCounts[f.category] = (catCounts[f.category] || 0) + 1;
  });

  // Check per-type threshold (5+ of same type)
  const alreadyFired = new Set();
  for (const [id, count] of Object.entries(idCounts)) {
    if (count >= BULK_CATEGORY_THRESHOLD && !alreadyFired.has(id)) {
      alreadyFired.add(id);
      const typeLabel = id.replace(/_/g, ' ');
      bulkFindings.push({
        id: `bulk_${id}`,
        name: `Bulk data: ${count} ${typeLabel} instances`,
        match: `[${count}x ${typeLabel}]`,
        start: 0,
        end: text.length,
        category: 'pii',
        severity: 'critical',
        matchMasked: `[BULK: ${count} ${typeLabel} instances — not exposed]`,
        bulkMessage: `This looks like a data export, not a single record — ${count} ${typeLabel} addresses detected.`,
        isBulk: true,
        bulkCount: count,
        bulkType: id,
      });
    }
  }

  // Check mixed-type threshold (10+ total PII items, not already covered per-type)
  const totalPii = piiFindings.length;
  if (totalPii >= BULK_MIXED_THRESHOLD && bulkFindings.length === 0) {
    bulkFindings.push({
      id: 'bulk_pii_mixed',
      name: `Bulk data: ${totalPii} total PII items`,
      match: `[${totalPii}x mixed PII]`,
      start: 0,
      end: text.length,
      category: 'pii',
      severity: 'critical',
      matchMasked: `[BULK: ${totalPii} mixed PII instances — not exposed]`,
      bulkMessage: `This looks like a data export, not a single record — ${totalPii} personal data items detected across multiple categories.`,
      isBulk: true,
      bulkCount: totalPii,
      bulkType: 'mixed_pii',
    });
  }

  return bulkFindings;
}

// ─── Phase 1: Enhanced analyzePrompt ─────────────────────────────────────────

function analyzePrompt(text, options = {}) {
  if (typeof text !== 'string' || text.trim().length === 0) {
    return { findings: [], riskScore: 0, shouldBlock: false, categories: [], context: 'clean', severity: 'info', explanations: [] };
  }

  const {
    confidentialTerms = DEFAULT_CONFIDENTIAL_TERMS,
    sensitivityThreshold = DEFAULT_SENSITIVITY_THRESHOLD,
    enableEntropyDetection = true,
    enableContextWindow = true,
    enableBulkDetection = true,
    enableObfuscationDetection = true,
    enableBase64Scan = true,
    compliancePresets = [],
    customRegex = [],
    enableApiKeyDetection = true,
    enablePiiDetection = true,
    enablePasswordDetection = true,
    enableConfidentialDetection = true,
  } = options;

  const allFindings = [];
  const categoriesFound = new Set();

  function rangesOverlap(a, b) {
    return Math.max(a.start, b.start) < Math.min(a.end, b.end);
  }

  function addFinding(candidate) {
    for (let i = 0; i < allFindings.length; i++) {
      const existing = allFindings[i];
      if (existing.category === candidate.category && rangesOverlap(existing, candidate)) {
        if ((candidate.end - candidate.start) > (existing.end - existing.start)) {
          allFindings[i] = candidate;
        }
        return;
      }
    }
    allFindings.push(candidate);
    categoriesFound.add(candidate.category);
  }

  // Compile custom regex rules if provided
  const customRegexList = (Array.isArray(customRegex) ? customRegex : (typeof customRegex === 'string' ? customRegex.split('\n') : []))
    .map(r => typeof r === 'string' ? r.trim() : r)
    .filter(Boolean);

  const compiledCustomRules = [];
  for (const cr of customRegexList) {
    try {
      if (cr instanceof RegExp) {
        compiledCustomRules.push({
          id: 'custom_regex',
          name: 'Custom Pattern Match',
          pattern: new RegExp(cr.source, cr.flags.includes('g') ? cr.flags : cr.flags + 'g')
        });
      } else {
        const slashMatch = cr.match(/^\/(.+)\/([a-z]*)$/);
        if (slashMatch) {
          const flags = slashMatch[2].includes('g') ? slashMatch[2] : slashMatch[2] + 'g';
          compiledCustomRules.push({
            id: 'custom_regex',
            name: `Custom Pattern: ${slashMatch[1]}`,
            pattern: new RegExp(slashMatch[1], flags)
          });
        } else {
          compiledCustomRules.push({
            id: 'custom_regex',
            name: `Custom Pattern: ${cr}`,
            pattern: new RegExp(cr, 'gi')
          });
        }
      }
    } catch (_) {}
  }

  // Pass 1: Scan un-normalized original text
  if (enableApiKeyDetection) {
    for (const rule of API_KEY_PATTERNS) {
      for (const m of findMatches(text, rule)) {
        addFinding({ category: 'api_key', ...m, matchMasked: maskSecret(m.match), severity: 'critical' });
      }
    }
  }

  if (enablePasswordDetection) {
    for (const rule of PASSWORD_PATTERNS) {
      for (const m of findMatches(text, rule)) {
        addFinding({ category: 'password', ...m, matchMasked: maskSecret(m.match), severity: 'critical' });
      }
    }
  }

  // Company/Employee details detection
  for (const rule of COMPANY_PATTERNS) {
    for (const m of findMatches(text, rule)) {
      addFinding({
        category: 'company',
        id: rule.id,
        name: rule.name,
        match: m.match,
        start: m.start,
        end: m.end,
        matchMasked: maskSecret(m.match),
        severity: rule.id === 'internal_tool' ? 'info' : 'warning',
      });
    }
  }

  if (enablePiiDetection) {
    for (const rule of PII_PATTERNS) {
      for (const m of findMatches(text, rule)) {
        if (rule.id === 'credit_card' || rule.id === 'credit_card_spaced') {
          if (!luhnCheck(m.match)) continue;
        }
        addFinding({ category: 'pii', ...m, matchMasked: maskSecret(m.match), severity: 'warning' });
      }
    }
  }

  if (enableConfidentialDetection) {
    const confMatches = findConfidentialTerms(text, confidentialTerms);
    for (const m of confMatches) {
      addFinding({
        category: 'confidential', ...m,
        matchMasked: `[confidential: ${m.match.substring(0, 4)}…]`,
        severity: 'info',
      });
    }
  }

  for (const rule of compiledCustomRules) {
    for (const m of findMatches(text, rule)) {
      addFinding({
        category: 'confidential',
        id: 'custom_regex',
        name: rule.name,
        match: m.match,
        start: m.start,
        end: m.end,
        matchMasked: maskSecret(m.match),
        severity: 'warning',
      });
    }
  }

  // Pass 2: Normalized scan with exact character coordinate mapping
  if (enableObfuscationDetection) {
    const { normalized, indexMap } = normalizeObfuscatedWithMap(text);
    if (normalized !== text && indexMap.length > 0) {
      const mapMatchToOrig = (m, rule, category) => {
        if (m.start >= indexMap.length || m.end - 1 >= indexMap.length) return null;
        const origStart = indexMap[m.start];
        const origEnd = indexMap[m.end - 1] + 1;
        const origMatch = text.substring(origStart, origEnd);

        // Filter false-positive phone matches on space-separated single digits
        if ((rule.id === 'us_phone' || rule.id === 'int_phone') && /^\d(?:\s+\d)+$/.test(origMatch.trim())) {
          return null;
        }
        // Luhn check credit cards
        if ((rule.id === 'credit_card' || rule.id === 'credit_card_spaced') && !luhnCheck(origMatch)) {
          return null;
        }

        return {
          category,
          id: rule.id,
          name: rule.name || (category === 'confidential' ? `Confidential term: ${origMatch}` : rule.id),
          match: origMatch,
          start: origStart,
          end: origEnd,
          matchMasked: category === 'confidential' ? `[confidential: ${origMatch.substring(0, 4)}…]` : maskSecret(origMatch),
          severity: category === 'api_key' || category === 'password' ? 'critical' : (category === 'confidential' ? 'info' : 'warning'),
        };
      };

      if (enableApiKeyDetection) {
        for (const rule of API_KEY_PATTERNS) {
          for (const m of findMatches(normalized, rule)) {
            const mapped = mapMatchToOrig(m, rule, 'api_key');
            if (mapped) addFinding(mapped);
          }
        }
      }

      if (enablePasswordDetection) {
        for (const rule of PASSWORD_PATTERNS) {
          for (const m of findMatches(normalized, rule)) {
            const mapped = mapMatchToOrig(m, rule, 'password');
            if (mapped) addFinding(mapped);
          }
        }
      }

      for (const rule of COMPANY_PATTERNS) {
        for (const m of findMatches(normalized, rule)) {
          const mapped = mapMatchToOrig(m, rule, 'company');
          if (mapped) addFinding(mapped);
        }
      }

      if (enablePiiDetection) {
        for (const rule of PII_PATTERNS) {
          for (const m of findMatches(normalized, rule)) {
            const mapped = mapMatchToOrig(m, rule, 'pii');
            if (mapped) addFinding(mapped);
          }
        }
      }

      if (enableConfidentialDetection) {
        for (const m of findConfidentialTerms(normalized, confidentialTerms)) {
          const mapped = mapMatchToOrig(m, { id: 'confidential', name: `Confidential term: ${m.match}` }, 'confidential');
          if (mapped) addFinding(mapped);
        }
      }

      for (const rule of compiledCustomRules) {
        for (const m of findMatches(normalized, rule)) {
          const mapped = mapMatchToOrig(m, rule, 'confidential');
          if (mapped) addFinding(mapped);
        }
      }
    }
  }

  const textToScan = text;

  if (enableApiKeyDetection && enableEntropyDetection) {
    const knownRanges = allFindings.map(f => ({ start: f.start, end: f.end }));
    const entropyMatches = findHighEntropyTokens(textToScan, knownRanges);
    for (const m of entropyMatches) {
      allFindings.push({
        category: 'api_key', ...m,
        matchMasked: `[high-entropy token: ${m.match.substring(0, 6)}…]`,
        severity: 'warning',
      });
      categoriesFound.add('api_key');
    }
  }

  // ── SENTINEL: Base64 decode-and-scan ──────────────────────────────────────
  if (enableApiKeyDetection && enableBase64Scan) {
    const knownRanges = allFindings.map(f => ({ start: f.start, end: f.end }));
    const b64Findings = scanBase64Content(textToScan, knownRanges);
    for (const f of b64Findings) {
      allFindings.push(f);
      categoriesFound.add('api_key');
    }
  }

  // ── SENTINEL: Compliance presets ──────────────────────────────────────────
  if (compliancePresets && compliancePresets.length > 0) {
    const { findings: cpFindings } = applyCompliancePresets(textToScan, compliancePresets);
    for (const f of cpFindings) {
      allFindings.push(f);
      categoriesFound.add(f.category);
    }
  }

  if (enableBulkDetection) {
    allFindings.push(...detectBulkData(textToScan, allFindings));
  }

  if (enableContextWindow) {
    allFindings.push(...analyzeContextWindow());
  }

  const deduped = deduplicateFindings(allFindings);

  const isEducational = isEducationalContext(text);
  let riskScore = 0;
  let maxSeverity = 'info';
  const severityOrder = { info: 0, warning: 1, critical: 2 };

  for (const f of deduped) {
    let score = (f.id === 'internal_tool') ? 10 : (CATEGORY_SCORES[f.category] || 10);
    if (isEducational && (f.category === 'api_key' || f.category === 'password')) {
      score = Math.round(score * CONTEXT_MODIFIERS.educational);
    }
    riskScore += score;
    if (severityOrder[f.severity] > severityOrder[maxSeverity]) maxSeverity = f.severity;
  }
  riskScore = Math.min(riskScore, 100);

  const explanations = deduped.map(f => ({
    category: f.category,
    finding: f,
    explanation: getFindingExplanation(f),
    // Never expose the raw value — only type and masked location
    patternType: f.id || f.category,
    locationHint: (f.start != null && f.end != null)
      ? `characters ${f.start}–${f.end}`
      : 'throughout document',
    reason: getFindingExplanation(f),
  }));

  // Severity directly gates block decision:
  //  • Critical (API keys, passwords, bulk PII) → ALWAYS block, regardless of threshold
  //  • Warning/Info → use numeric threshold as normal
  const hasCritical = deduped.some(f => f.severity === 'critical');
  const shouldBlock = hasCritical || riskScore >= sensitivityThreshold;

  // Collect bulk messages for UI
  const bulkMessages = deduped
    .filter(f => f.isBulk && f.bulkMessage)
    .map(f => f.bulkMessage);

  return {
    findings: deduped,
    riskScore,
    shouldBlock,
    hasCritical,
    categories: Array.from(new Set(deduped.map(f => f.category))),
    context: isEducational ? 'educational' : 'clean',
    severity: maxSeverity,
    explanations,
    bulkMessages,
  };
}

// ─── Smart Learning Mode ────────────────────────────────────────────────────

/**
 * Load learned patterns from storage (persistent across sessions).
 * @returns {Promise<{falsePositives: Array, customRules: Array}>}
 */
function loadLearnedPatterns() {
  return new Promise((resolve) => {
    if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) {
      resolve({ falsePositives: [], customRules: [] });
      return;
    }
    chrome.storage.local.get(['sapr_learnedFalsePositives', 'sapr_learnedCustomRules'], (result) => {
      resolve({
        falsePositives: result.sapr_learnedFalsePositives || [],
        customRules: result.sapr_learnedCustomRules || [],
      });
    });
  });
}

/**
 * Save a learned false positive pattern.
 * @param {Object} pattern - {text: string, category: string, domain: string, timestamp: string}
 */
function saveFalsePositive(pattern) {
  if (typeof chrome === 'undefined' || !chrome.storage || !chrome.storage.local) return;
  chrome.storage.local.get('sapr_learnedFalsePositives', (result) => {
    const existing = result.sapr_learnedFalsePositives || [];
    // Add to beginning (most recent first)
    existing.unshift({
      ...pattern,
      id: Date.now(),
      count: 1,
    });
    // Keep only last50 entries
    const updated = existing.slice(0, 50);
    chrome.storage.local.set({ sapr_learnedFalsePositives: updated });
  });
}


// ─── Export ──────────────────────────────────────────────────────────────────

// SENTINEL: Public API for external developers
if (typeof window !== 'undefined') {
  window.SentinelAPI = {
    version: '5.0.0',
    scan: (text, opts) => analyzePrompt(text, opts || {}),
    redact: autoRedact,
    entropy: shannonEntropy,
    compliance: COMPLIANCE_PRESETS,
    normalize: normalizeObfuscated,
    normalizeWithMap: normalizeObfuscatedWithMap,
    onBlock: null, // set by content script
  };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    analyzePrompt,
    autoRedact,
    shannonEntropy,
    isHighEntropyToken,
    getHighlightRanges,
    isEducationalContext,
    detectCodeContext,
    isInsideCodeBlock,
    separateCodeFindings,
    getKeyRotationLink,
    getRotationLinksForFindings,
    loadLearnedPatterns,
    saveFalsePositive,
    normalizeObfuscated,
    normalizeObfuscatedWithMap,
    scanBase64Content,
    applyCompliancePresets,
    luhnCheck,
    DEFAULT_SENSITIVITY_THRESHOLD,
    DEFAULT_CONFIDENTIAL_TERMS,
    API_KEY_PATTERNS,
    PASSWORD_PATTERNS,
    PII_PATTERNS,
    COMPLIANCE_PRESETS,
    maskSecret,
    KEY_ROTATION_LINKS,
    getSeverity,
    getFindingExplanation,
    getSessionStats,
    updateSessionStats,
    addMessageToHistory,
    analyzeContextWindow,
    detectBulkData,
    SEVERITY_LEVELS,
  };
}
