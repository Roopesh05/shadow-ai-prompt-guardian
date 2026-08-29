/**
 * Shadow AI Prompt Guardian — Evaluation Harness
 *
 * Runs the detection engine against a synthetic test dataset and outputs:
 *   - Accuracy, Precision, Recall, False Positive Rate
 *   - Confusion matrix per category
 *   - Per-category breakdown
 *
 * Results are saved to:
 *   - results.json  (machine-readable)
 *   - results.md    (human-readable summary)
 */

// ─── Import Detection Engine ─────────────────────────────────────────────────

const { analyzePrompt, DEFAULT_SENSITIVITY_THRESHOLD } = require('./js/detection-engine.js');
const testDataset = require('./tests/test-prompts.json');

// ─── Configuration ───────────────────────────────────────────────────────────

const SENSITIVITY_THRESHOLD = 30; // matches DEFAULT_SENSITIVITY_THRESHOLD in detection-engine.js
const CONFIDENTIAL_TERMS = [
  'confidential',
  'proprietary',
  'trade secret',
  'do not share',
  'internal use only',
  'employee id',
  'social security',
  'ssn',
  'salary',
  'performance review',
  'board meeting',
  'merger',
  'acquisition',
  'unreleased product',
  'code name',
  'project [a-z]+',
  'top secret',
  'restricted',
  'privileged',
  'attorney-client',
  'patient records',
  'hipaa',
  'gdpr',
  'pii',
  'personally identifiable',
];

// ─── Run Tests ───────────────────────────────────────────────────────────────

function runTests() {
  const prompts = testDataset.prompts;
  const results = [];

  for (const prompt of prompts) {
    const detection = analyzePrompt(prompt.text, {
      sensitivityThreshold: SENSITIVITY_THRESHOLD,
      confidentialTerms: CONFIDENTIAL_TERMS,
      enableEntropyDetection: true,
    });

    const actualBlock = detection.shouldBlock;
    const expectedBlock = prompt.expected_block;
    const correct = actualBlock === expectedBlock;

    results.push({
      id: prompt.id,
      text: prompt.text,
      category: prompt.category,
      expected_block: expectedBlock,
      actual_block: actualBlock,
      risk_score: detection.riskScore,
      findings_count: detection.findings.length,
      detected_categories: detection.categories,
      correct,
      notes: prompt.notes,
    });
  }

  return results;
}

// ─── Compute Metrics ─────────────────────────────────────────────────────────

function computeMetrics(results) {
  const total = results.length;
  let tp = 0, tn = 0, fp = 0, fn = 0;

  for (const r of results) {
    if (r.expected_block && r.actual_block) tp++;
    else if (!r.expected_block && !r.actual_block) tn++;
    else if (!r.expected_block && r.actual_block) fp++;
    else if (r.expected_block && !r.actual_block) fn++;
  }

  const accuracy = total > 0 ? (tp + tn) / total : 0;
  const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
  const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
  const fpr = (fp + tn) > 0 ? fp / (fp + tn) : 0;
  const f1 = (precision + recall) > 0 ? 2 * (precision * recall) / (precision + recall) : 0;

  // Per-category metrics
  const categories = ['clean', 'api_key', 'password', 'pii', 'confidential'];
  const perCategory = {};
  for (const cat of categories) {
    const catResults = results.filter((r) => r.category === cat);
    let c_tp = 0, c_tn = 0, c_fp = 0, c_fn = 0;
    for (const r of catResults) {
      if (r.expected_block && r.actual_block) c_tp++;
      else if (!r.expected_block && !r.actual_block) c_tn++;
      else if (!r.expected_block && r.actual_block) c_fp++;
      else if (r.expected_block && !r.actual_block) c_fn++;
    }
    const c_total = catResults.length;
    perCategory[cat] = {
      total: c_total,
      tp: c_tp,
      tn: c_tn,
      fp: c_fp,
      fn: c_fn,
      accuracy: c_total > 0 ? (c_tp + c_tn) / c_total : 0,
      precision: (c_tp + c_fp) > 0 ? c_tp / (c_tp + c_fp) : 0,
      recall: (c_tp + c_fn) > 0 ? c_tp / (c_tp + c_fn) : 0,
      fpr: (c_fp + c_tn) > 0 ? c_fp / (c_fp + c_tn) : 0,
    };
  }

  return {
    total,
    tp, tn, fp, fn,
    accuracy: Math.round(accuracy * 10000) / 10000,
    precision: Math.round(precision * 10000) / 10000,
    recall: Math.round(recall * 10000) / 10000,
    fpr: Math.round(fpr * 10000) / 10000,
    f1: Math.round(f1 * 10000) / 10000,
    confusionMatrix: { tp, tn, fp, fn },
    perCategory,
  };
}

// ─── Generate Reports ────────────────────────────────────────────────────────

function generateResultsJSON(results, metrics) {
  return {
    generated_at: new Date().toISOString(),
    threshold_used: SENSITIVITY_THRESHOLD,
    total_tests: results.length,
    metrics,
    detailed_results: results.map((r) => ({
      id: r.id,
      category: r.category,
      expected_block: r.expected_block,
      actual_block: r.actual_block,
      correct: r.correct,
      risk_score: r.risk_score,
      findings_count: r.findings_count,
      detected_categories: r.detected_categories,
      notes: r.notes,
    })),
  };
}

function generateResultsMD(results, metrics) {
  const lines = [
    '# Shadow AI Prompt Guardian — Evaluation Report',
    '',
    `**Generated:** ${new Date().toLocaleString()}`,
    `**Threshold:** ${SENSITIVITY_THRESHOLD} | **Test Set:** ${results.length} prompts`,
    '',
    '## Overall Metrics',
    '',
    '| Metric | Value |',
    '|--------|-------|',
    `| Accuracy | ${metrics.accuracy} |`,
    `| Precision | ${metrics.precision} |`,
    `| Recall | ${metrics.recall} |`,
    `| F1 Score | ${metrics.f1} |`,
    `| False Positive Rate | ${metrics.fpr} |`,
    '',
    '## Confusion Matrix',
    '',
    '| | Predicted Block | Predicted Clean |',
    '|---|----------------|----------------|',
    `| Actual Block | ${metrics.confusionMatrix.tp} | ${metrics.confusionMatrix.fn} |`,
    `| Actual Clean | ${metrics.confusionMatrix.fp} | ${metrics.confusionMatrix.tn} |`,
    '',
    '## Per-Category Metrics',
    '',
    '| Category | Total | Accuracy | Precision | Recall | FPR |',
    '|----------|-------|----------|-----------|--------|-----|',
  ];

  for (const [cat, m] of Object.entries(metrics.perCategory)) {
    lines.push(
      `| ${cat} | ${m.total} | ${m.accuracy} | ${m.precision} | ${m.recall} | ${m.fpr} |`
    );
  }

  lines.push('', '## Detailed Results', '');
  lines.push('| ID | Category | Expected | Actual | Correct | Risk Score | Findings | Notes |');
  lines.push('|----|----------|----------|--------|---------|------------|----------|-------|');

  for (const r of results) {
    lines.push(
      `| ${r.id} | ${r.category} | ${r.expected_block ? 'BLOCK' : 'CLEAN'} | ${r.actual_block ? 'BLOCK' : 'CLEAN'} | ${r.correct ? '✓' : '✗'} | ${r.risk_score} | ${r.findings_count} | ${r.notes} |`
    );
  }

  lines.push('', '---', '*Generated by Shadow AI Prompt Guardian Evaluation Harness*');
  return lines.join('\n');
}

// ─── Main ────────────────────────────────────────────────────────────────────

function main() {
  console.log('Running Shadow AI Prompt Guardian evaluation harness...\n');

  const results = runTests();
  const metrics = computeMetrics(results);

  // Print summary
  console.log('═══ Evaluation Summary ═══');
  console.log(`Total prompts:        ${metrics.total}`);
  console.log(`Accuracy:             ${metrics.accuracy}`);
  console.log(`Precision:            ${metrics.precision}`);
  console.log(`Recall:               ${metrics.recall}`);
  console.log(`F1 Score:             ${metrics.f1}`);
  console.log(`False Positive Rate:  ${metrics.fpr}`);
  console.log('');
  console.log('Confusion Matrix:');
  console.log(`  TP=${metrics.confusionMatrix.tp}  TN=${metrics.confusionMatrix.tn}`);
  console.log(`  FP=${metrics.confusionMatrix.fp}  FN=${metrics.confusionMatrix.fn}`);
  console.log('');

  // Per-category
  console.log('── Per-Category ──');
  for (const [cat, m] of Object.entries(metrics.perCategory)) {
    console.log(`  ${cat}: acc=${m.accuracy} prec=${m.precision} rec=${m.recall} fpr=${m.fpr} (n=${m.total})`);
  }

  // Write results.json
  const jsonOutput = generateResultsJSON(results, metrics);
  const fs = require('fs');
  const path = require('path');

  const outDir = path.dirname(__filename);
  const jsonPath = path.join(outDir, 'results.json');
  const mdPath = path.join(outDir, 'results.md');

  fs.writeFileSync(jsonPath, JSON.stringify(jsonOutput, null, 2), 'utf8');
  console.log(`\n✓ Saved results to ${jsonPath}`);

  // Write results.md
  const mdOutput = generateResultsMD(results, metrics);
  fs.writeFileSync(mdPath, mdOutput, 'utf8');
  console.log(`✓ Saved results to ${mdPath}`);

  // Exit with error if accuracy < 0.7 (sanity check)
  if (metrics.accuracy < 0.7) {
    console.warn('\n⚠  Accuracy below 70% — review detection engine rules.');
    process.exit(1);
  } else {
    console.log('\n✓ Evaluation passed — accuracy ≥ 70%');
  }
}

// Run
if (require.main === module) {
  main();
}

// Export for programmatic use
module.exports = { runTests, computeMetrics, generateResultsJSON, generateResultsMD };
