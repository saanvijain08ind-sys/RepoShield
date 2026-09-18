/**
 * Full Pipeline Integration Test Suite
 * Open Source Security Transition Monitor - Demo Reliability & QA
 *
 * Tests the entire end-to-end verification pipeline over HTTP:
 * 1. Server Health & Connectivity
 * 2. Deterministic Synthetic Demo Report Ingestion (Upload Flow)
 * 3. Claim Extraction & Classification
 * 4. Tri-State Verification (VERIFIED, CONTRADICTED, INSUFFICIENT_EVIDENCE)
 * 5. Full Evidence Provenance Linkage (relationship, excerpt, hash, collector)
 * 6. V1 PRISM Failure Reproduction (Remediation Blindness)
 * 7. Exact Engineering Fix Verification (Temporal Recency Resolution)
 * 8. V2 Corrected Result on Identical Scenario
 * 9. Measured Before/After Benchmark Metrics (+50% accuracy, -50% false contradictions)
 * 10. Repeat Run Deterministic Consistency (Zero Jitter / Idempotent)
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

const BASE_URL = 'http://127.0.0.1:3000';

interface TestResult {
  name: string;
  category: string;
  passed: boolean;
  message?: string;
  durationMs: number;
}

const results: TestResult[] = [];

async function test(name: string, category: string, fn: () => Promise<void>) {
  const start = Date.now();
  try {
    await fn();
    results.push({
      name,
      category,
      passed: true,
      durationMs: Date.now() - start,
    });
  } catch (err: any) {
    results.push({
      name,
      category,
      passed: false,
      message: err.message || String(err),
      durationMs: Date.now() - start,
    });
  }
}

async function runIntegrationSuite() {
  console.log('====================================================');
  console.log('PRISM VERIFICATION PIPELINE - INTEGRATION TEST SUITE');
  console.log('End-to-End Live HTTP Protocol Validation');
  console.log('====================================================\n');

  // 1. Health check
  await test('Server is reachable and reports healthy state', 'Infrastructure', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Server unreachable`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error(`Expected status 'ok', got '${data.status}'`);
  });

  // 2. Synthetic Demo Report Ingestion & Claim Extraction
  let uploadedReport: any = null;
  let evidencePool: any[] = [];

  await test('Ingests deterministic synthetic demo report via POST /api/verification/upload-report', 'Ingestion & Extraction', async () => {
    const fixturePath = resolve(process.cwd(), 'public/fixtures/demo_synthetic_security_report.json');
    const rawFixture = JSON.parse(readFileSync(fixturePath, 'utf-8'));

    const res = await fetch(`${BASE_URL}/api/verification/upload-report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        report: rawFixture.report,
        evidencePool: rawFixture.evidencePool,
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}: Upload failed`);
    const data = await res.json();
    if (!data.success || !data.report) throw new Error(data.error || 'Missing report in response');

    uploadedReport = data.report;
    evidencePool = data.evidencePool;

    if (!Array.isArray(uploadedReport.claims) || uploadedReport.claims.length !== 6) {
      throw new Error(`Expected 6 extracted claims, found ${uploadedReport.claims?.length}`);
    }
  });

  // 3. Tri-State Verification: VERIFIED State
  await test('Evaluates VERIFIED claim with explicit supporting evidence', 'Claim Verification', async () => {
    if (!uploadedReport) throw new Error('Report not initialized');
    const starClaim = uploadedReport.claims.find((c: any) => c.id === 'claim_github_stars');
    if (!starClaim) throw new Error('claim_github_stars not found');

    if (starClaim.status !== 'VERIFIED') {
      throw new Error(`Expected VERIFIED status, got ${starClaim.status}`);
    }
  });

  // 4. Tri-State Verification: CONTRADICTED State
  await test('Evaluates CONTRADICTED claim with explicit contradicting probe evidence', 'Claim Verification', async () => {
    if (!uploadedReport) throw new Error('Report not initialized');
    const gitClaim = uploadedReport.claims.find((c: any) => c.id === 'claim_no_git_exposure');
    if (!gitClaim) throw new Error('claim_no_git_exposure not found');

    if (gitClaim.status !== 'CONTRADICTED') {
      throw new Error(`Expected CONTRADICTED status, got ${gitClaim.status}`);
    }
  });

  // 5. Tri-State Verification: INSUFFICIENT_EVIDENCE State
  await test('Evaluates INSUFFICIENT_EVIDENCE claim when supporting observations are absent', 'Claim Verification', async () => {
    if (!uploadedReport) throw new Error('Report not initialized');
    const caaClaim = uploadedReport.claims.find((c: any) => c.id === 'claim_dns_caa_authorization');
    if (!caaClaim) throw new Error('claim_dns_caa_authorization not found');

    if (caaClaim.status !== 'INSUFFICIENT_EVIDENCE') {
      throw new Error(`Expected INSUFFICIENT_EVIDENCE status, got ${caaClaim.status}`);
    }
    if (!caaClaim.verificationReason || !caaClaim.verificationReason.includes('absent')) {
      throw new Error('Expected explanation of missing candidate evidence');
    }
  });

  // 6. Evidence Linkage & Provenance Integrity
  await test('Preserves complete evidence provenance linkage on verified & contradicted claims', 'Evidence Provenance', async () => {
    if (!uploadedReport) throw new Error('Report not initialized');

    // Check VERIFIED claim link
    const starClaim = uploadedReport.claims.find((c: any) => c.id === 'claim_github_stars');
    if (!starClaim.evidenceLinks || starClaim.evidenceLinks.length === 0) {
      throw new Error('No evidence links on star claim');
    }
    const starLink = starClaim.evidenceLinks[0];
    if (starLink.relationship !== 'SUPPORTS') {
      throw new Error(`Expected SUPPORTS relationship, got ${starLink.relationship}`);
    }
    if (!starLink.evidence.provenanceHash || !starLink.evidence.collector) {
      throw new Error('Missing provenance metadata (hash or collector) on star evidence link');
    }

    // Check CONTRADICTED claim link
    const gitClaim = uploadedReport.claims.find((c: any) => c.id === 'claim_no_git_exposure');
    if (!gitClaim.evidenceLinks || gitClaim.evidenceLinks.length === 0) {
      throw new Error('No evidence links on git claim');
    }
    const gitLink = gitClaim.evidenceLinks[0];
    if (gitLink.relationship !== 'CONTRADICTS') {
      throw new Error(`Expected CONTRADICTS relationship, got ${gitLink.relationship}`);
    }
    if (!gitLink.evidence.excerpt || !gitLink.evidence.excerpt.includes('ref: refs/heads/main')) {
      throw new Error('Missing raw excerpt on git exposure contradiction link');
    }
  });

  // 7. V1 PRISM Failure Reproduction
  let benchmarkData: any = null;
  await test('Reproduces V1 PRISM failure (Remediation Blindness: stale evidence overrides fix)', 'Reliability Comparison', async () => {
    const res = await fetch(`${BASE_URL}/api/verification/v1-v2-comparison`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch comparison`);
    const data = await res.json();
    if (!data.success || !data.benchmark) throw new Error('Missing benchmark in response');

    benchmarkData = data.benchmark;
    const scen1 = benchmarkData.scenarios.find((s: any) => s.scenarioId === 'scen_01_remediation_hsts');
    if (!scen1) throw new Error('scen_01_remediation_hsts not found');

    if (scen1.v1.producedStatus !== 'CONTRADICTED') {
      throw new Error(`Expected V1 to produce CONTRADICTED (failure), got ${scen1.v1.producedStatus}`);
    }
    if (scen1.v1.isCorrect !== false) {
      throw new Error('Expected V1 isCorrect to be false');
    }
    if (scen1.v1.isFalseContradiction !== true) {
      throw new Error('Expected V1 isFalseContradiction to be true');
    }
  });

  // 8. Engineering Fix & V2 Resolution under Identical Scenario
  await test('Verifies V2 engineering fix correctly resolves post-remediation scenario to VERIFIED', 'Reliability Comparison', async () => {
    if (!benchmarkData) throw new Error('Benchmark data not initialized');
    const scen1 = benchmarkData.scenarios.find((s: any) => s.scenarioId === 'scen_01_remediation_hsts');

    if (scen1.v2.producedStatus !== 'VERIFIED') {
      throw new Error(`Expected V2 to produce VERIFIED, got ${scen1.v2.producedStatus}`);
    }
    if (scen1.v2.isCorrect !== true) {
      throw new Error('Expected V2 isCorrect to be true');
    }
    if (scen1.remediedInV2 !== true) {
      throw new Error('Expected remediedInV2 to be true');
    }
  });

  // 9. Measured Before/After Metric Validation
  await test('Validates measured benchmark improvements (+50.0% accuracy, -50.0% false contradictions)', 'Metrics Measurement', async () => {
    if (!benchmarkData) throw new Error('Benchmark data not initialized');
    const { before, after, delta } = benchmarkData.metrics;

    if (before.accuracyPct !== 50.0) {
      throw new Error(`Expected V1 before accuracy 50.0%, got ${before.accuracyPct}%`);
    }
    if (after.accuracyPct !== 100.0) {
      throw new Error(`Expected V2 after accuracy 100.0%, got ${after.accuracyPct}%`);
    }
    if (delta.accuracyGainPct !== 50.0) {
      throw new Error(`Expected accuracy gain of +50.0%, got +${delta.accuracyGainPct}%`);
    }
    if (before.falseContradictionRatePct !== 50.0) {
      throw new Error(`Expected V1 false contradiction rate 50.0%, got ${before.falseContradictionRatePct}%`);
    }
    if (after.falseContradictionRatePct !== 0.0) {
      throw new Error(`Expected V2 false contradiction rate 0.0%, got ${after.falseContradictionRatePct}%`);
    }
    if (delta.falseContradictionReductionPct !== 50.0) {
      throw new Error(`Expected false contradiction reduction of 50.0%, got ${delta.falseContradictionReductionPct}%`);
    }
  });

  // 10. Repeat Run Deterministic Idempotency Check
  await test('Confirms repeat executions produce identical deterministic outcomes (5 consecutive runs)', 'Reliability & QA', async () => {
    for (let run = 1; run <= 5; run++) {
      const res = await fetch(`${BASE_URL}/api/verification/v1-v2-comparison/run`, { method: 'POST' });
      if (!res.ok) throw new Error(`HTTP ${res.status} on rerun iteration ${run}`);
      const data = await res.json();
      if (!data.success || !data.benchmark) throw new Error(`Iteration ${run} failed to return benchmark`);

      const { before, after } = data.benchmark.metrics;
      if (before.accuracyPct !== 50.0 || after.accuracyPct !== 100.0) {
        throw new Error(`Non-deterministic variance detected on iteration ${run}`);
      }
    }
  });

  // 11. Backup Artifacts & Runbook Verification
  await test('Validates all 6 backup demo state screenshots and runbook exist', 'Backup Materials & Documentation', async () => {
    const requiredScreenshots = [
      'step1_report_ingest.svg',
      'step2_tri_state_claims_evidence.svg',
      'step3_v1_remediation_blindness_failure.svg',
      'step4_engineering_fix_temporal_provenance.svg',
      'step5_v2_resolution_superseded.svg',
      'step6_measured_benchmark_metrics.svg',
    ];

    for (const name of requiredScreenshots) {
      const docPath = resolve(process.cwd(), 'docs/demo/screenshots', name);
      const pubPath = resolve(process.cwd(), 'public/screenshots', name);
      if (!existsSync(docPath)) throw new Error(`Missing docs screenshot: ${name}`);
      if (!existsSync(pubPath)) throw new Error(`Missing public screenshot: ${name}`);

      const content = readFileSync(docPath, 'utf-8');
      if (!content.includes('<svg') || !content.includes('</svg>')) {
        throw new Error(`Invalid SVG content in ${name}`);
      }
    }

    const runbookPath = resolve(process.cwd(), 'docs/demo/DEMO_RUNBOOK.md');
    if (!existsSync(runbookPath)) throw new Error('Missing DEMO_RUNBOOK.md');
    const runbookContent = readFileSync(runbookPath, 'utf-8');
    if (!runbookContent.includes('3-Minute Demo Runbook')) {
      throw new Error('DEMO_RUNBOOK.md is incomplete');
    }

    const checklistPath = resolve(process.cwd(), 'docs/demo/VIDEO_RECORDING_CHECKLIST.md');
    if (!existsSync(checklistPath)) throw new Error('Missing VIDEO_RECORDING_CHECKLIST.md');
  });

  // 12. Vercel Deployment Readiness Check
  await test('Validates Vercel deployment setup (vercel.json, api/index.ts, .vercelignore)', 'Vercel Deployment Readiness', async () => {
    // 1. Verify vercel.json exists and has valid configuration
    const vercelConfigPath = resolve(process.cwd(), 'vercel.json');
    if (!existsSync(vercelConfigPath)) throw new Error('Missing vercel.json configuration');
    const vercelConfig = JSON.parse(readFileSync(vercelConfigPath, 'utf-8'));

    if (vercelConfig.framework !== 'vite') {
      throw new Error(`Expected framework to be "vite", got "${vercelConfig.framework}"`);
    }
    if (vercelConfig.buildCommand !== 'vite build') {
      throw new Error(`Expected buildCommand to be "vite build", got "${vercelConfig.buildCommand}"`);
    }
    if (vercelConfig.outputDirectory !== 'dist') {
      throw new Error(`Expected outputDirectory to be "dist", got "${vercelConfig.outputDirectory}"`);
    }
    if (!Array.isArray(vercelConfig.rewrites) || vercelConfig.rewrites.length === 0) {
      throw new Error('Expected vercel.json to define rewrites for /api');
    }

    // 2. Verify api/index.ts exists and exports default Express app
    const apiIndexPath = resolve(process.cwd(), 'api/index.ts');
    if (!existsSync(apiIndexPath)) throw new Error('Missing api/index.ts serverless entry point');
    const apiIndexContent = readFileSync(apiIndexPath, 'utf-8');
    if (!apiIndexContent.includes('export default app') && !apiIndexContent.includes('export default')) {
      throw new Error('api/index.ts must export default app for Vercel serverless function');
    }

    // 3. Verify .vercelignore exists
    const vercelIgnorePath = resolve(process.cwd(), '.vercelignore');
    if (!existsSync(vercelIgnorePath)) throw new Error('Missing .vercelignore');

    // 4. Verify .npmrc exists for legacy-peer-deps
    const npmrcPath = resolve(process.cwd(), '.npmrc');
    if (!existsSync(npmrcPath)) throw new Error('Missing .npmrc');
    const npmrcContent = readFileSync(npmrcPath, 'utf-8');
    if (!npmrcContent.includes('legacy-peer-deps=true')) {
      throw new Error('.npmrc must include legacy-peer-deps=true');
    }
  });

  // Output test results
  results.forEach((t, idx) => {
    const icon = t.passed ? '✓ PASS' : '✗ FAIL';
    console.log(`[${icon}] #${idx + 1} [${t.category}] ${t.name} (${t.durationMs}ms)`);
    if (!t.passed) {
      console.error(`       Error: ${t.message}`);
    }
  });

  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  const totalDuration = results.reduce((acc, r) => acc + r.durationMs, 0);

  console.log('\n----------------------------------------------------');
  console.log(`Integration Summary: ${passed}/${results.length} tests passed (${totalDuration}ms)`);
  console.log('----------------------------------------------------');

  if (failed > 0) {
    process.exit(1);
  } else {
    console.log('All end-to-end integration test assertions passed successfully.\n');
  }
}

runIntegrationSuite().catch((err) => {
  console.error('Fatal failure running integration tests:', err);
  process.exit(1);
});
