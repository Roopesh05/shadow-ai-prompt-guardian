/**
 * Shadow AI Prompt Guardian — SENTINEL DevShield Test Suite
 * Tests for DevVault, Database Mocking, and Bidirectional Code Restoration
 */

const { createDevVault, autoRedactSynthetic, generateMockToken } = require('../js/synthetic-generator.js');

console.log('═══════════════════════════════════════════════════════════════');
console.log('  SENTINEL DevShield — Bidirectional Code De-Masking Test Suite');
console.log('═══════════════════════════════════════════════════════════════\n');

let pass = 0, fail = 0;
function test(label, condition, detail = '') {
  if (condition) { pass++; console.log('  ✅ ' + label); }
  else { fail++; console.log('  ❌ ' + label + (detail ? ' — ' + detail : '')); }
  return condition;
}

// ── Test 1: Database Mock Generators ──
console.log('── SECTION 1: DATABASE MOCK GENERATORS ──');
const pgMock = generateMockToken({ id: 'postgres_conn_str', category: 'api_key' });
test('PostgreSQL mock generated', pgMock.includes('postgresql://mock_user:mock_pass@localhost:5432/mock_db'));

const mongoMock = generateMockToken({ id: 'mongodb_conn_str', category: 'api_key' });
test('MongoDB mock generated', mongoMock.includes('mongodb://mock_user:mock_pass@localhost:27017/mock_db'));

const mysqlMock = generateMockToken({ id: 'mysql_conn_str', category: 'api_key' });
test('MySQL mock generated', mysqlMock.includes('mysql://mock_user:mock_pass@localhost:3306/mock_db'));

const redisMock = generateMockToken({ id: 'redis_url', category: 'api_key' });
test('Redis URL mock generated', redisMock.includes('redis://:mock_pass@localhost:6379/0'));

const sentryMock = generateMockToken({ id: 'sentry_dsn', category: 'api_key' });
test('Sentry DSN mock generated', sentryMock.includes('https://mock_sentry_key@mock_org.ingest.sentry.io/000000'));

// ── Test 2: DevVault Storage & Retrieval ──
console.log('\n── SECTION 2: DEVVAULT STORAGE & LOOKUP ──');
const vault = createDevVault();
test('New vault is empty', vault.size() === 0);

vault.store('my_real_secret_token_123', 'MOCK_SECRET_TOKEN_01', { category: 'api_key', id: 'generic' });
test('Vault size is 1', vault.size() === 1);
test('Vault hasAnyToken identifies mock token', vault.hasAnyToken('Here is code using MOCK_SECRET_TOKEN_01 in config'));
test('Vault hasAnyToken returns false for non-mock', !vault.hasAnyToken('Here is clean code without any mock'));
test('Vault getRealValue returns original', vault.getRealValue('MOCK_SECRET_TOKEN_01') === 'my_real_secret_token_123');

// ── Test 3: Multi-Token AutoRedact & Vault Sync ──
console.log('\n── SECTION 3: MULTI-TOKEN SYNTHETIC MOCKING & VAULT SYNC ──');
const originalPrompt = [
  'const db = connect("postgresql://admin:Prod_Password_999@db-primary.internal.megacorp:5432/finance");',
  'const awsKey = "AKIAIOSFODNN7EXAMPLE";',
  'const adminEmail = "dev-lead@megacorp.internal";',
].join('\n');

const findings = [
  {
    id: 'postgres_conn_str',
    category: 'api_key',
    start: originalPrompt.indexOf('postgresql://admin:Prod_Password_999@db-primary.internal.megacorp:5432/finance'),
    end: originalPrompt.indexOf('postgresql://admin:Prod_Password_999@db-primary.internal.megacorp:5432/finance') + 'postgresql://admin:Prod_Password_999@db-primary.internal.megacorp:5432/finance'.length,
  },
  {
    id: 'aws_access_key',
    category: 'api_key',
    start: originalPrompt.indexOf('AKIAIOSFODNN7EXAMPLE'),
    end: originalPrompt.indexOf('AKIAIOSFODNN7EXAMPLE') + 'AKIAIOSFODNN7EXAMPLE'.length,
  },
  {
    id: 'email',
    category: 'pii',
    start: originalPrompt.indexOf('dev-lead@megacorp.internal'),
    end: originalPrompt.indexOf('dev-lead@megacorp.internal') + 'dev-lead@megacorp.internal'.length,
  },
];

const redacted = autoRedactSynthetic(originalPrompt, findings);
test('All 3 items replaced', redacted.replacements.length === 3);
test('Real DB password not in redacted text', !redacted.redacted.includes('Prod_Password_999'));
test('Real AWS key not in redacted text', !redacted.redacted.includes('AKIAIOSFODNN7EXAMPLE'));
test('Real email not in redacted text', !redacted.redacted.includes('dev-lead@megacorp.internal'));

const sessionVault = createDevVault();
sessionVault.storeReplacements(redacted.replacements);
test('Session vault stored 3 mappings', sessionVault.size() === 3);

// ── Test 4: Bidirectional Round-Trip Restoration ──
console.log('\n── SECTION 4: BIDIRECTIONAL CODE RESTORATION (1-CLICK RESTORE) ──');
// Simulated response from AI assistant incorporating the mock code
const aiSimulatedResponse = [
  'Here is the refactored code with connection pooling and async/await:',
  '```javascript',
  'const { Pool } = require("pg");',
  'const pool = new Pool({ connectionString: "postgresql://mock_user:mock_pass@localhost:5432/mock_db" });',
  'const AWS = require("aws-sdk");',
  'const s3 = new AWS.S3({ accessKeyId: "' + redacted.replacements.find(r => r.id === 'aws_access_key').placeholder + '" });',
  '// Notify admin',
  'const alertRecipient = "' + redacted.replacements.find(r => r.id === 'email').placeholder + '";',
  '```',
].join('\n');

test('AI simulated response contains mock tokens', sessionVault.hasAnyToken(aiSimulatedResponse));

const restoredCode = sessionVault.restore(aiSimulatedResponse);
test('Restored code restores real DB URL with password', restoredCode.includes('postgresql://admin:Prod_Password_999@db-primary.internal.megacorp:5432/finance'));
test('Restored code restores real AWS Key', restoredCode.includes('AKIAIOSFODNN7EXAMPLE'));
test('Restored code restores real admin email', restoredCode.includes('dev-lead@megacorp.internal'));
test('Restored code has zero remaining mock tokens', !sessionVault.hasAnyToken(restoredCode));

// ── Test 5: Vault Clearing ──
console.log('\n── SECTION 5: VAULT CLEARING & SECURITY ──');
sessionVault.clear();
test('Vault is empty after clear', sessionVault.size() === 0);
test('hasAnyToken returns false after clear', !sessionVault.hasAnyToken(aiSimulatedResponse));

// ── Summary ──
console.log('\n═══════════════════════════════════════════════════════════════');
console.log(`  RESULTS: ${pass} passed, ${fail} failed`);
if (fail === 0) {
  console.log('  ✅ ALL DEVSHIELD TESTS PASSED — ZERO REGRESSIONS');
} else {
  console.log(`  ❌ ${fail} TESTS FAILED`);
  process.exit(1);
}
console.log('═══════════════════════════════════════════════════════════════\n');
