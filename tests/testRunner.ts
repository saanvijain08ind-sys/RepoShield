/**
 * Automated Test Suite for SentinelOSS
 * 
 * Verifies the core SentinelOSS engine:
 * 1. Target input parsing (GitHub URLs, shorthand owner/repo, npm packages)
 * 2. Milestone threshold detection (>10,000 downloads, >1,000 stars)
 * 3. Blast radius calculations & critical infrastructure tiering
 * 4. Zero-setup OSV vulnerability audit and severity classification
 * 5. 1-Click Fix PR package.json patch & unified git diff generation
 * 6. One-Click Security Blueprint (.github/dependabot.yml & SECURITY.md)
 * 7. Low-pressure celebratory maintainer outreach drafting
 * 8. High-growth repository demo presets (Express, SuperPrompt CLI, Chalk)
 */

import { SentinelService } from '../server/services/sentinelService.ts';
import { SecretScannerEngine } from '../server/services/secretScannerService.ts';
import { DependencyItem, OSVVulnerability } from '../src/types/index.ts';

export interface TestCaseResult {
  name: string;
  category: string;
  passed: boolean;
  message: string;
  durationMs: number;
}

export interface TestSuiteSummary {
  total: number;
  passed: number;
  failed: number;
  durationMs: number;
  tests: TestCaseResult[];
}

export async function runSuite(): Promise<TestSuiteSummary> {
  const start = performance.now();
  const tests: TestCaseResult[] = [];

  const runTest = async (category: string, name: string, fn: () => Promise<void> | void) => {
    const tStart = performance.now();
    try {
      await fn();
      tests.push({
        category,
        name,
        passed: true,
        message: 'Assertion passed successfully.',
        durationMs: Number((performance.now() - tStart).toFixed(2)),
      });
    } catch (err: any) {
      tests.push({
        category,
        name,
        passed: false,
        message: err.message || String(err),
        durationMs: Number((performance.now() - tStart).toFixed(2)),
      });
    }
  };

  // =========================================================================
  // 1. Target URL and Package Parsing
  // =========================================================================
  await runTest('Target Ingestion', 'Parses full GitHub repository URL correctly', () => {
    const target = SentinelService.parseTarget('https://github.com/facebook/react.git');
    if (target.owner !== 'facebook' || target.repo !== 'react') {
      throw new Error(`Expected facebook/react, got ${target.owner}/${target.repo}`);
    }
  });

  await runTest('Target Ingestion', 'Parses shorthand owner/repo format correctly', () => {
    const target = SentinelService.parseTarget('expressjs/express');
    if (target.owner !== 'expressjs' || target.repo !== 'express') {
      throw new Error(`Expected expressjs/express, got ${target.owner}/${target.repo}`);
    }
  });

  await runTest('Target Ingestion', 'Resolves known npm packages to upstream repository', () => {
    const target = SentinelService.parseTarget('chalk');
    if (target.owner !== 'chalk' || target.repo !== 'chalk') {
      throw new Error(`Expected chalk/chalk, got ${target.owner}/${target.repo}`);
    }
  });

  // =========================================================================
  // 2. High-Growth Presets & Milestone Detection
  // =========================================================================
  await runTest('Milestones', 'SuperPrompt CLI preset hits viral transition milestone', () => {
    const preset = SentinelService.getDemoPreset('superprompt-cli');
    if (!preset) throw new Error('Preset superprompt-cli not found');
    if (!preset.milestones.thresholdExceeded) {
      throw new Error('Expected thresholdExceeded to be true for viral project');
    }
    if (preset.milestones.githubStars < 1000 || preset.milestones.npmWeeklyDownloads < 10000) {
      throw new Error('Expected stars >= 1000 and downloads >= 10000');
    }
  });

  await runTest('Milestones', 'Express preset categorized as CRITICAL_INFRASTRUCTURE', () => {
    const preset = SentinelService.getDemoPreset('express');
    if (!preset) throw new Error('Preset express not found');
    if (preset.milestones.blastRadius.criticalTier !== 'CRITICAL_INFRASTRUCTURE') {
      throw new Error(`Expected CRITICAL_INFRASTRUCTURE, got ${preset.milestones.blastRadius.criticalTier}`);
    }
  });

  // =========================================================================
  // 3. Blast Radius Calculation
  // =========================================================================
  await runTest('Blast Radius', 'Calculates downstream users and dependents count', () => {
    const preset = SentinelService.getDemoPreset('superprompt-cli');
    if (!preset) throw new Error('Preset not found');
    if (preset.milestones.blastRadius.dependentsCount <= 0) {
      throw new Error('Expected positive dependents count');
    }
    if (preset.milestones.blastRadius.estimatedDownstreamUsers <= 0) {
      throw new Error('Expected positive downstream users count');
    }
    if (!preset.milestones.blastRadius.impactDescription.includes('Used by')) {
      throw new Error('Impact description should mention downstream projects');
    }
  });

  // =========================================================================
  // 4. Vulnerability Audit & Severity Categorization
  // =========================================================================
  await runTest('Vulnerability Engine', 'Correctly identifies Known CVEs and severities in Express', () => {
    const preset = SentinelService.getDemoPreset('express');
    if (!preset) throw new Error('Preset express not found');
    const cves = preset.vulnerabilities.map((v) => v.cveId);
    if (!cves.some((id) => id.includes('CVE-2022-24999') || id.includes('CVE-2024-45590'))) {
      throw new Error('Expected known CVEs in Express dependencies');
    }
    if (preset.summary.criticalCount < 1) {
      throw new Error('Expected at least 1 critical severity finding');
    }
  });

  await runTest('Vulnerability Engine', 'Detects prototype pollution in minimist (CVE-2020-7598)', () => {
    const preset = SentinelService.getDemoPreset('superprompt-cli');
    if (!preset) throw new Error('Preset superprompt-cli not found');
    const minimistVuln = preset.vulnerabilities.find((v) => v.packageName === 'minimist');
    if (!minimistVuln) throw new Error('Minimist vulnerability missing');
    if (minimistVuln.severity !== 'Critical') {
      throw new Error(`Expected Critical severity, got ${minimistVuln.severity}`);
    }
    if (!minimistVuln.fixedVersion) {
      throw new Error('Expected recommended fix version');
    }
  });

  // =========================================================================
  // 5. 1-Click Fix PR & Git Diff Generation
  // =========================================================================
  await runTest('Remediation Engine', 'Generates valid unified git diff patch for package.json', () => {
    const preset = SentinelService.getDemoPreset('superprompt-cli');
    if (!preset) throw new Error('Preset not found');
    if (!preset.gitDiff.includes('--- a/package.json') || !preset.gitDiff.includes('+++ b/package.json')) {
      throw new Error('Git diff must contain unified diff headers');
    }
    if (!preset.gitDiff.includes('+') || !preset.gitDiff.includes('-')) {
      throw new Error('Git diff must contain added (+) and removed (-) lines');
    }
  });

  await runTest('Remediation Engine', 'Bumps vulnerable version to fixed semver in updated package.json', () => {
    const preset = SentinelService.getDemoPreset('superprompt-cli');
    if (!preset) throw new Error('Preset not found');
    const updated = JSON.parse(preset.updatedPackageJson);
    if (!updated.dependencies.minimist.includes('1.2.6')) {
      throw new Error(`Expected minimist bumped to 1.2.6, got ${updated.dependencies.minimist}`);
    }
  });

  // =========================================================================
  // 6. Security Blueprint Generation
  // =========================================================================
  await runTest('Security Blueprint', 'Generates valid SECURITY.md with responsible disclosure policy', () => {
    const preset = SentinelService.getDemoPreset('superprompt-cli');
    if (!preset) throw new Error('Preset not found');
    const { securityMd } = preset.securityBlueprint;
    if (!securityMd.includes('Reporting a Vulnerability') || !securityMd.includes('Private GitHub Security Advisory')) {
      throw new Error('SECURITY.md must include private disclosure instructions');
    }
  });

  await runTest('Security Blueprint', 'Generates valid .github/dependabot.yml configuration', () => {
    const preset = SentinelService.getDemoPreset('superprompt-cli');
    if (!preset) throw new Error('Preset not found');
    const { dependabotYml } = preset.securityBlueprint;
    if (!dependabotYml.includes('package-ecosystem: "npm"') || !dependabotYml.includes('version: 2')) {
      throw new Error('dependabot.yml must include version 2 and npm package-ecosystem');
    }
  });

  // =========================================================================
  // 7. Maintainer Outreach & Tone
  // =========================================================================
  await runTest('Maintainer Outreach', 'Drafts educational, celebratory outreach message without blame', () => {
    const preset = SentinelService.getDemoPreset('superprompt-cli');
    if (!preset) throw new Error('Preset not found');
    const { body, subject } = preset.outreachDraft;
    if (!subject.includes('🎉 Congrats on hitting')) {
      throw new Error('Subject should have celebratory tone');
    }
    if (!body.includes('critical community infrastructure')) {
      throw new Error('Body should acknowledge project transition to critical infrastructure');
    }
    if (!body.includes('1-Click Pull Request')) {
      throw new Error('Body should reference 1-Click Pull Request');
    }
  });

  await runTest('Maintainer Outreach', 'Generates GitHub issue draft with CVE list and PR proposal', () => {
    const preset = SentinelService.getDemoPreset('superprompt-cli');
    if (!preset) throw new Error('Preset not found');
    const { githubIssueTitle, githubIssueMarkdown } = preset.outreachDraft;
    if (!githubIssueTitle.includes('Growth Milestone')) {
      throw new Error('Issue title should mention growth milestone');
    }
    if (!githubIssueMarkdown.includes('1-Click Security Audit Summary')) {
      throw new Error('Issue markdown should include audit summary');
    }
  });

  // =========================================================================
  // 8. Exposed Secret & API Key Scanner Engine
  // =========================================================================
  await runTest('Secret Scanner', 'Detects exposed Google Cloud and Gemini API key', () => {
    const snippet = `const apiKey = 'AIzaSyD-9xK11049583492817492837492019aB';`;
    const findings = SecretScannerEngine.scanText(snippet, 'src/ai.ts');
    if (findings.length === 0) {
      throw new Error('Failed to detect exposed Gemini API key');
    }
    const geminiSecret = findings.find((f) => f.ruleId === 'SEC-GOOGLE-GEMINI');
    if (!geminiSecret) throw new Error('SEC-GOOGLE-GEMINI rule not triggered');
    if (geminiSecret.severity !== 'Critical') throw new Error('Expected Critical severity');
    if (geminiSecret.envVarName !== 'GEMINI_API_KEY') throw new Error('Expected GEMINI_API_KEY envVarName');
    if (!geminiSecret.maskedSecret.includes('••••')) throw new Error('Secret must be masked');
  });

  await runTest('Secret Scanner', 'Detects exposed OpenAI secret key with refactor guidance', () => {
    const snippet = `export const OPENAI_KEY = "sk-proj-1234567890abcdef1234567890abcdef1234567890abcdef12";`;
    const findings = SecretScannerEngine.scanText(snippet, 'config.js');
    if (findings.length === 0) throw new Error('Failed to detect OpenAI secret key');
    const secret = findings.find((f) => f.ruleId === 'SEC-OPENAI-KEY');
    if (!secret) throw new Error('SEC-OPENAI-KEY not found');
    if (!secret.revocationUrl) throw new Error('Expected provider revocation URL for OpenAI');
  });

  await runTest('Secret Scanner', 'Detects AWS access keys and database URIs in multi-file scan', () => {
    const files = [
      { path: 'deploy/aws.env', content: 'AWS_KEY=AKIAIOSFODNN7EXAMPLE' },
      { path: 'server.js', content: 'const uri = "postgres://root:dbpassword123@db.prod.internal:5432/app";' },
    ];
    const { secrets, summary } = SecretScannerEngine.scanFiles(files);
    if (secrets.length < 2) throw new Error(`Expected at least 2 secrets, found ${secrets.length}`);
    if (summary.affectedFiles !== 2) throw new Error('Expected 2 affected files');
  });

  await runTest('Secret Scanner', 'SuperPrompt CLI demo preset includes detected secret leaks', () => {
    const preset = SentinelService.getDemoPreset('superprompt-cli');
    if (!preset) throw new Error('Preset not found');
    if (!preset.exposedSecrets || preset.exposedSecrets.length === 0) {
      throw new Error('Expected exposedSecrets array in SuperPrompt CLI preset');
    }
    if (!preset.secretSummary || preset.secretSummary.totalSecrets === 0) {
      throw new Error('Expected secretSummary in SuperPrompt CLI preset');
    }
  });

  const durationMs = Number((performance.now() - start).toFixed(2));
  const passed = tests.filter((t) => t.passed).length;
  const failed = tests.filter((t) => !t.passed).length;

  return {
    total: tests.length,
    passed,
    failed,
    durationMs,
    tests,
  };
}
