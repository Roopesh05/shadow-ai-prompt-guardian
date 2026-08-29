/**
 * Shadow AI Prompt Guardian — Detection Engine Unit Tests
 *
 * Run with: node tests/test-detection-engine.js
 */

const {
  analyzePrompt,
  shannonEntropy,
  isHighEntropyToken,
  getHighlightRanges,
  DEFAULT_SENSITIVITY_THRESHOLD,
  maskSecret,
  getSeverity,
  getFindingExplanation,
  detectBulkData,
  SEVERITY_LEVELS,
} = require('../js/detection-engine.js');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.log(`  ✗ FAIL: ${message}`);
  }
}

function assertEqual(actual, expected, message) {
  if (actual === expected) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.log(`  ✗ FAIL: ${message} (expected ${expected}, got ${actual})`);
  }
}

function assertContains(actual, expected, message) {
  if (actual.includes(expected)) {
    passed++;
    console.log(`  ✓ ${message}`);
  } else {
    failed++;
    console.log(`  ✗ FAIL: ${message} (expected to contain "${expected}")`);
  }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

console.log('\n═══ Detection Engine Unit Tests ═══\n');

// 1. Shannon Entropy
console.log('── Shannon Entropy ──');
assertEqual(shannonEntropy(''), 0, 'Empty string has 0 entropy');
assertEqual(shannonEntropy('aaaa'), 0, 'Single-char string has 0 entropy');
assertEqual(shannonEntropy('ab'), 1, '"ab" has entropy of 1');
const abcEntropy = shannonEntropy('abc');
assert(abcEntropy > 1.58 && abcEntropy < 1.59, `"abc" has entropy between 1.58 and 1.59 (got ${abcEntropy.toFixed(4)})`);
const highEnt = shannonEntropy('aB3$xK9@mN2&pQ5!tU8*wZ1');
assert(highEnt > 3.5, `High-entropy string has entropy > 3.5 (got ${highEnt.toFixed(2)})`);

// 2. High Entropy Token Detection
console.log('\n── High Entropy Token ──');
assert(isHighEntropyToken('aB3$xK9@mN2&pQ5!tU8*wZ1') === true, 'Long high-entropy string detected');
assert(isHighEntropyToken('hello') === false, 'Short string not detected as high-entropy');
assert(isHighEntropyToken('abc') === false, 'Very short string not detected');
assert(isHighEntropyToken('password123') === false, 'Low-entropy string not detected');
assert(isHighEntropyToken('') === false, 'Empty string not detected');

// 3. Clean Prompts
console.log('\n── Clean Prompts ──');
const cleanResult = analyzePrompt('Write a function that sorts an array in Python.');
assert(cleanResult.shouldBlock === false, 'Clean prompt does not block');
assert(cleanResult.riskScore === 0, 'Clean prompt has risk score 0');
assert(cleanResult.findings.length === 0, 'Clean prompt has no findings');

const cleanResult2 = analyzePrompt('What is the capital of France?');
assert(cleanResult2.shouldBlock === false, 'General knowledge prompt does not block');

const cleanResult3 = analyzePrompt('');
assert(cleanResult3.shouldBlock === false, 'Empty string does not block');
assert(cleanResult3.riskScore === 0, 'Empty string has risk score 0');

const cleanResult4 = analyzePrompt('   ');
assert(cleanResult4.shouldBlock === false, 'Whitespace-only string does not block');

// 4. AWS Key Detection
console.log('\n── API Key Detection ──');
const awsResult = analyzePrompt('My AWS key is AKIAIOSFODNN7EXAMPLE');
assert(awsResult.shouldBlock === true, 'AWS key triggers block');
assertContains(awsResult.categories, 'api_key', 'AWS key categorized as api_key');
assert(awsResult.riskScore >= 30, 'AWS key gives risk score >= 30');

// 5. GitHub Token
console.log('\n── GitHub Token ──');
const ghResult = analyzePrompt('Token: ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefgh');
assert(ghResult.shouldBlock === true, 'GitHub token triggers block');
assertContains(ghResult.categories, 'api_key', 'GitHub token categorized as api_key');

// 6. Password Detection
console.log('\n── Password Detection ──');
const pwdResult = analyzePrompt('My password is: S3cretP@ssw0rd!');
assert(pwdResult.shouldBlock === true, 'Password triggers block');
assertContains(pwdResult.categories, 'password', 'Password categorized as password');

const pwdResult2 = analyzePrompt('password = MyP@ss123');
assert(pwdResult2.shouldBlock === true, 'Password assignment triggers block');

// 7. PII Detection
console.log('\n── PII Detection ──');
const emailResult = analyzePrompt('Contact me at john.doe@example.com');
assert(emailResult.shouldBlock === true, 'Email triggers block');
assertContains(emailResult.categories, 'pii', 'Email categorized as pii');

const phoneResult = analyzePrompt('Call me at 555-123-4567');
assert(phoneResult.shouldBlock === true, 'Phone number triggers block');
assertContains(phoneResult.categories, 'pii', 'Phone categorized as pii');

const ssnResult = analyzePrompt('My SSN is 123-45-6789');
assert(ssnResult.shouldBlock === true, 'SSN triggers block');
assertContains(ssnResult.categories, 'pii', 'SSN categorized as pii');

// 8. Confidential Terms
console.log('\n── Confidential Terms ──');
const confResult = analyzePrompt('This is CONFIDENTIAL internal data');
assert(confResult.shouldBlock === true, 'Confidential term triggers block');
assertContains(confResult.categories, 'confidential', 'Confidential term categorized correctly');

const confResult2 = analyzePrompt('Project Phoenix is top secret');
assert(confResult2.shouldBlock === true, 'Project codename triggers block');
assertContains(confResult2.categories, 'confidential', 'Project codename categorized correctly');

// 9. Multiple Findings
console.log('\n── Multiple Findings ──');
const multiResult = analyzePrompt('My email is john@example.com and my password is S3cret!');
assert(multiResult.shouldBlock === true, 'Multiple findings trigger block');
assert(multiResult.categories.length >= 2, 'Multiple categories detected');
assert(multiResult.riskScore >= 50, 'Multiple findings give high risk score');

// 10. Threshold Behavior
console.log('\n── Threshold Behavior ──');
const lowThresh = analyzePrompt('My email is john@example.com', { sensitivityThreshold: 90 });
assert(lowThresh.shouldBlock === false, 'High threshold allows email-only prompt');

const highThresh = analyzePrompt('My email is john@example.com', { sensitivityThreshold: 10 });
assert(highThresh.shouldBlock === true, 'Low threshold blocks email-only prompt');

// 11. Masking
console.log('\n── Secret Masking ──');
assert(maskSecret('AKIAIOSFODNN7EXAMPLE').length > 0, 'Masked AWS key is non-empty');
assert(maskSecret('AKIAIOSFODNN7EXAMPLE').includes('•'), 'Masked key contains bullets');
assert(maskSecret('short').length <= 6, 'Short secrets are fully masked');
assert(maskSecret('').length > 0, 'Empty string masks to placeholder (safe default)');

// 12. Highlight Ranges
console.log('\n── Highlight Ranges ──');
const highlightResult = analyzePrompt('My email is john@example.com and password is S3cret!');
const ranges = getHighlightRanges(highlightResult.findings);
assert(ranges.length >= 1, 'Highlight ranges returned for multi-finding prompt');
if (ranges.length >= 2) {
  assert(ranges[0].start <= ranges[ranges.length - 1].start, 'Ranges are sorted by position');
}

// 13. Edge Cases
console.log('\n── Edge Cases ──');
const nullCheck = analyzePrompt(null);
assert(nullCheck.findings.length === 0, 'null input returns empty findings');

const longPrompt = analyzePrompt('A'.repeat(10000) + ' AKIAIOSFODNN7EXAMPLE ' + 'B'.repeat(10000));
assert(longPrompt.shouldBlock === true, 'Long prompt with embedded key is detected');

// 14. No False Positives on Benign Patterns
console.log('\n── False Positive Prevention ──');
const decadeResult = analyzePrompt('The 1990s was a great decade for music.');
assert(decadeResult.shouldBlock === false, 'Decade reference does not falsely trigger');

const versionResult = analyzePrompt('Version 2.1.3 of the library has a bug.');
assert(versionResult.shouldBlock === false, 'Version number does not falsely trigger');

const ipExampleResult = analyzePrompt('The example IP 192.0.2.1 is reserved for documentation.');
// This WILL trigger because IP pattern matches — that's by design
assert(ipExampleResult.shouldBlock === true, 'IP address is detected (by design for PII)');
// Note: 192.0.2.1 is a documentation-range IP but the regex matches any valid IPv4

// 15. OpenAI Key Pattern
console.log('\n── OpenAI Key Detection ──');
const openaiResult = analyzePrompt('Use key sk-abcdefghijklmnop1234567890');
assert(openaiResult.shouldBlock === true, 'OpenAI key triggers block');

// 16. Stripe Key
console.log('\n── Stripe Key Detection ──');
const stripeResult = analyzePrompt('Stripe key: sk_test_51abcdefghijklmnopqrstuvwxyza');
assert(stripeResult.shouldBlock === true, 'Stripe key triggers block');

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 1: Severity Level Tests
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n═══ Feature 1: Severity Level Tests ═══\n');

// 17. getSeverity helper
console.log('── getSeverity helper ──');
assertEqual(getSeverity('api_key'), 'critical', 'api_key severity is critical');
assertEqual(getSeverity('password'), 'critical', 'password severity is critical');
assertEqual(getSeverity('pii'), 'warning', 'pii severity is warning');
assertEqual(getSeverity('confidential'), 'info', 'confidential severity is info');
assertEqual(getSeverity('company'), 'warning', 'company severity is warning');
assertEqual(getSeverity('unknown_type'), 'info', 'unknown type defaults to info');

// 18. Result includes severity field
console.log('\n── Result severity field ──');
const criticalResult = analyzePrompt('My AWS key is AKIAIOSFODNN7EXAMPLE');
assertEqual(criticalResult.severity, 'critical', 'API key result has critical severity');
assert(criticalResult.hasCritical === true, 'API key result has hasCritical=true');

const warningResult = analyzePrompt('My email is test@example.com');
assertEqual(warningResult.severity, 'warning', 'PII-only result has warning severity');
assert(warningResult.hasCritical === false, 'PII-only result has hasCritical=false');

const infoResult = analyzePrompt('This document is confidential');
assertEqual(infoResult.severity, 'info', 'Confidential-only result has info severity');

// 19. Critical always blocks regardless of threshold
console.log('\n── Critical always blocks ──');
const highThreshCritical = analyzePrompt('My AWS key is AKIAIOSFODNN7EXAMPLE', { sensitivityThreshold: 100 });
assert(highThreshCritical.shouldBlock === true, 'Critical finding blocks even at threshold=100');
assert(highThreshCritical.hasCritical === true, 'hasCritical is true for API key');

const passwordCritical = analyzePrompt('password = MyP@ssword123!', { sensitivityThreshold: 100 });
assert(passwordCritical.shouldBlock === true, 'Password finding blocks even at threshold=100');

// 20. Warning/Info respects threshold
console.log('\n── Warning/Info respects threshold ──');
const emailHighThresh = analyzePrompt('Contact me at john.doe@example.com', { sensitivityThreshold: 100 });
assert(emailHighThresh.shouldBlock === false, 'PII (warning) does NOT block at threshold=100');

// 21. Result includes explanations with pattern type and location
console.log('\n── Explanations (no raw values) ──');
const explResult = analyzePrompt('My AWS key is AKIAIOSFODNN7EXAMPLE');
assert(explResult.explanations.length > 0, 'Explanations array is non-empty');
const expl = explResult.explanations[0];
assert(typeof expl.patternType === 'string', 'Explanation has patternType field');
assert(typeof expl.locationHint === 'string', 'Explanation has locationHint field');
assert(typeof expl.reason === 'string', 'Explanation has reason field');
assert(expl.reason.length > 0, 'Reason is non-empty');
// Verify raw secret is NOT in any explanation field (only patternType and masked location)
const rawKey = 'AKIAIOSFODNN7EXAMPLE';
assert(!expl.reason.includes(rawKey), 'Reason does NOT contain raw secret value');
assert(!expl.locationHint.includes(rawKey), 'locationHint does NOT contain raw secret value');

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 2: Bulk Data Detection Tests
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n═══ Feature 2: Bulk Data Detection Tests ═══\n');

// 22. Single email: NOT bulk
console.log('── Single PII: Not bulk ──');
const singleEmail = analyzePrompt('Contact me at john.doe@example.com');
assert(!singleEmail.findings.some(f => f.isBulk), 'Single email is NOT flagged as bulk');
assert(singleEmail.bulkMessages.length === 0, 'No bulk message for single email');

// 23. Normal conversation with a few emails: NOT bulk (< 5 of same type)
console.log('\n── Few emails in conversation: Not bulk ──');
const fewEmails = analyzePrompt(
  'You can reach Alice at alice@example.com, Bob at bob@example.com, ' +
  'or Carol at carol@example.com. The team uses standard@company.com for support.'
);
assert(!fewEmails.findings.some(f => f.isBulk), '4 emails in normal conversation are NOT bulk');

// 24. 5+ of same type: IS bulk (true positive)
console.log('\n── 5+ emails: Bulk detected (TP) ──');
const bulkEmails = analyzePrompt(
  'Export: user1@example.com, user2@example.com, user3@example.com, ' +
  'user4@example.com, user5@example.com, user6@example.com'
);
assert(bulkEmails.findings.some(f => f.isBulk), '6 emails ARE flagged as bulk');
assert(bulkEmails.bulkMessages.length > 0, 'Bulk message is generated for 6 emails');
const bulkMsg = bulkEmails.bulkMessages[0];
assert(bulkMsg.includes('data export') || bulkMsg.includes('not a single'), 'Bulk message mentions data export');
assert(!bulkMsg.includes('@'), 'Bulk message does NOT expose email addresses');
assert(bulkEmails.severity === 'critical', 'Bulk PII results in critical severity');
assert(bulkEmails.hasCritical === true, 'Bulk PII sets hasCritical=true');

// 25. Phone bulk (5+ phones)
console.log('\n── 5+ phones: Bulk detected (TP) ──');
const bulkPhones = analyzePrompt(
  'Contacts: 555-100-0001, 555-200-0002, 555-300-0003, 555-400-0004, 555-500-0005'
);
assert(bulkPhones.findings.some(f => f.isBulk), '5 phones ARE flagged as bulk');
assert(bulkPhones.bulkMessages.length > 0, 'Bulk message generated for 5 phones');

// 26. Mixed PII (10+ total): Bulk
console.log('\n── 10+ mixed PII: Bulk detected (TP) ──');
const mixedBulk = analyzePrompt(
  'john@a.com, jane@b.com, 555-111-1111, 555-222-2222, 555-333-3333, ' +
  'admin@c.com, 555-444-4444, bob@d.com, 555-555-5555, 555-666-6666, sue@e.com'
);
assert(mixedBulk.findings.some(f => f.isBulk), '11 mixed PII items ARE flagged as bulk');

// 27. Normal paragraph mentioning a few emails/phones: NOT bulk (true negative)
console.log('\n── Normal conversation with emails: Not bulk (TN) ──');
const normalConv = analyzePrompt(
  'Our customer support team can be reached at support@company.com. ' +
  'For billing questions, contact billing@company.com. ' +
  'Urgent issues: call our hotline at 555-911-0000. ' +
  'Our CTO email is cto@company.com. We are happy to help!'
);
assert(!normalConv.findings.some(f => f.isBulk), 'Normal conversation with 3 emails + 1 phone is NOT bulk');

// 28. Bulk message does not expose raw values
console.log('\n── Bulk messages do not expose raw values ──');
const bulkCheck = analyzePrompt(
  'user1@corp.com, user2@corp.com, user3@corp.com, user4@corp.com, user5@corp.com, user6@corp.com'
);
const bulkFinding = bulkCheck.findings.find(f => f.isBulk);
assert(bulkFinding !== undefined, 'Bulk finding exists');
if (bulkFinding) {
  // The matchMasked should not expose individual emails
  assert(bulkFinding.matchMasked.includes('not exposed') || bulkFinding.matchMasked.includes('BULK'), 
    'matchMasked marks bulk as not exposed');
  assert(!bulkFinding.matchMasked.includes('@'), 'matchMasked does NOT contain email addresses');
}

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 3: Performance / Latency Check
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n═══ Feature 3: Detection Latency Tests ═══\n');

// 29. Short text latency
console.log('── Latency: short text (<1KB) ──');
const t0 = Date.now();
analyzePrompt('My email is test@example.com and password is S3cret!');
const latencyShort = Date.now() - t0;
assert(latencyShort < 50, `Short text detection < 50ms (got ${latencyShort}ms)`);

// 30. Medium text latency
console.log('\n── Latency: medium text (~5KB) ──');
const medText = 'A'.repeat(2500) + ' test@example.com ' + 'B'.repeat(2500);
const t1 = Date.now();
analyzePrompt(medText);
const latencyMed = Date.now() - t1;
assert(latencyMed < 100, `Medium text detection < 100ms (got ${latencyMed}ms)`);

// 31. Large text latency
console.log('\n── Latency: large text (~20KB) ──');
const largeText = 'A'.repeat(9990) + ' AKIAIOSFODNN7EXAMPLE ' + 'B'.repeat(9990);
const t2 = Date.now();
analyzePrompt(largeText);
const latencyLarge = Date.now() - t2;
assert(latencyLarge < 1000, `Large text detection < 1000ms (got ${latencyLarge}ms)`);
console.log(`  ℹ Measured latencies: short=${latencyShort}ms, medium=${latencyMed}ms, large=${latencyLarge}ms`);

// ─────────────────────────────────────────────────────────────────────────────
// FEATURE 4: Explainable Detection Tests
// ─────────────────────────────────────────────────────────────────────────────

console.log('\n═══ Feature 4: Explainable Detection Tests ═══\n');

// 32. getFindingExplanation returns non-empty for all categories
console.log('── getFindingExplanation coverage ──');
const testFindings = [
  { id: 'aws_access_key', category: 'api_key', name: 'AWS Access Key', match: 'AKIATEST', start: 0, end: 8, severity: 'critical' },
  { id: 'password_assign', category: 'password', name: 'Password Assignment', match: 'pass=x', start: 0, end: 6, severity: 'critical' },
  { id: 'email', category: 'pii', name: 'Email Address', match: 'a@b.com', start: 0, end: 7, severity: 'warning' },
  { id: 'confidential', category: 'confidential', name: 'Confidential term', match: 'confidential', start: 0, end: 12, severity: 'info' },
  { id: 'employee_id', category: 'company', name: 'Employee ID', match: 'EMP-1234', start: 0, end: 8, severity: 'warning' },
];
testFindings.forEach(function(f) {
  var expl = getFindingExplanation(f);
  assert(typeof expl === 'string' && expl.length > 0, `getFindingExplanation returns text for ${f.id}`);
});

// 33. Explanations in analyzePrompt result contain required fields
console.log('\n── analyzePrompt explanations structure ──');
const explResult2 = analyzePrompt('My AWS key is AKIAIOSFODNN7EXAMPLE and email is test@test.com');
assert(explResult2.explanations.length >= 1, 'Explanations array has entries');
explResult2.explanations.forEach(function(ex, i) {
  assert(typeof ex.category === 'string', `Explanation[${i}] has category`);
  assert(typeof ex.patternType === 'string', `Explanation[${i}] has patternType`);
  assert(typeof ex.locationHint === 'string', `Explanation[${i}] has locationHint`);
  assert(typeof ex.reason === 'string', `Explanation[${i}] has reason`);
  // Critical check: no raw secret value in explanation
  assert(!ex.reason.includes('AKIAIOSFODNN7EXAMPLE'), `Explanation[${i}] reason does not contain raw secret`);
  assert(ex.finding !== undefined, `Explanation[${i}] has finding reference`);
});

// 34. Location hint is properly formatted
console.log('\n── Location hints are informative ──');
const locResult = analyzePrompt('password = MyP@ssword123!');
const pwdExpl = locResult.explanations.find(e => e.category === 'password');
assert(pwdExpl !== undefined, 'Password explanation found');
if (pwdExpl) {
  assert(pwdExpl.locationHint.includes('characters'), 'Location hint mentions character positions');
  // Verify it does NOT contain the actual password
  assert(!pwdExpl.locationHint.includes('MyP@ssword'), 'Location hint does NOT contain raw password');
}

// ─── Summary ─────────────────────────────────────────────────────────────────

console.log('\n═══ Test Summary ═══');
console.log(`Passed: ${passed}`);
console.log(`Failed: ${failed}`);
console.log(`Total:  ${passed + failed}`);

if (failed > 0) {
  console.log('\n⚠  Some tests failed. Review detection engine.');
  process.exit(1);
} else {
  console.log('\n✓ All unit tests passed!');
}

