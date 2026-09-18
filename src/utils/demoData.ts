/**
 * Client-side default preset for SuperPrompt CLI demo
 * Ensures instant, reliable rendering on Vercel or when network is offline.
 */

import { ProjectAnalysis } from '../types/index.ts';
import { SecretScannerEngine } from '../services/secretScannerService.ts';

export function getClientSuperPromptDemoAnalysis(): ProjectAnalysis {
  const leaks = SecretScannerEngine.getSuperPromptDemoLeaks();
  const rawPackageJson = JSON.stringify(
    {
      name: 'superprompt-cli',
      version: '1.0.4',
      description: 'Interactive AI command-line companion for developers',
      bin: {
        superprompt: './bin/cli.js',
      },
      dependencies: {
        axios: '0.21.1',
        chalk: '^4.1.2',
        commander: '^7.2.0',
        minimist: '1.2.0',
        tar: '4.4.10',
      },
    },
    null,
    2
  );

  const updatedPackageJson = JSON.stringify(
    {
      name: 'superprompt-cli',
      version: '1.0.4',
      description: 'Interactive AI command-line companion for developers',
      bin: {
        superprompt: './bin/cli.js',
      },
      dependencies: {
        axios: '^0.21.4',
        chalk: '^4.1.2',
        commander: '^7.2.0',
        minimist: '^1.2.6',
        tar: '^4.4.18',
      },
    },
    null,
    2
  );

  const gitDiff = `--- a/package.json
+++ b/package.json
@@ -9,7 +9,7 @@
   "dependencies": {
-    "axios": "0.21.1",
+    "axios": "^0.21.4",
     "chalk": "^4.1.2",
     "commander": "^7.2.0",
-    "minimist": "1.2.0",
-    "tar": "4.4.10"
+    "minimist": "^1.2.6",
+    "tar": "^4.4.18"
   }`;

  return {
    id: 'analysis_superprompt_fallback',
    name: 'SuperPrompt CLI',
    owner: 'alexdev',
    repo: 'superprompt-cli',
    repoUrl: 'https://github.com/alexdev/superprompt-cli',
    npmPackageName: 'superprompt-cli',
    rawPackageJson,
    updatedPackageJson,
    gitDiff,
    fixedDependenciesCount: 3,
    milestones: {
      githubStars: 1240,
      forks: 142,
      npmWeeklyDownloads: 14800,
      openIssues: 12,
      thresholdExceeded: true,
      exceededReason: 'Exceeded 1,000 GitHub Stars (1,240) and 10,000 weekly npm downloads (14,800)',
      growthVelocity: '+412% over the last 30 days',
      starsThreshold: 1000,
      downloadsThreshold: 10000,
      blastRadius: {
        dependentsCount: 320,
        estimatedDownstreamUsers: 45000,
        criticalTier: 'HIGH_IMPACT',
        impactDescription: 'Direct dependency in 320 public repositories, affecting ~45,000 estimated developers.',
      },
    },
    dependencies: [
      { name: 'minimist', version: '1.2.0' },
      { name: 'axios', version: '0.21.1' },
      { name: 'tar', version: '4.4.10' },
      { name: 'chalk', version: '4.1.2' },
      { name: 'commander', version: '7.2.0' },
    ],
    vulnerabilities: [
      {
        id: 'CVE-2020-7598',
        cveId: 'CVE-2020-7598',
        aliases: ['GHSA-vh95-rmgr-6w4m'],
        summary: 'minimist Prototype Pollution allows arbitrary property injection',
        details:
          'Parsing arguments containing __proto__ or constructor.prototype allows remote input to pollute the global Object prototype.',
        severity: 'Critical',
        cvssScore: 9.8,
        packageName: 'minimist',
        ecosystem: 'npm',
        currentVersion: '1.2.0',
        fixedVersion: '1.2.6',
        references: [{ type: 'ADVISORY', url: 'https://nvd.nist.gov/vuln/detail/CVE-2020-7598' }],
        published: '2020-03-11T23:15:00Z',
      },
      {
        id: 'CVE-2021-3749',
        cveId: 'CVE-2021-3749',
        aliases: ['GHSA-cph5-m8f7-6c5x'],
        summary: 'axios Regular Expression Denial of Service (ReDoS) in trim method',
        details: 'Vulnerability in trim function of axios allows attackers to cause Denial of Service.',
        severity: 'High',
        cvssScore: 7.5,
        packageName: 'axios',
        ecosystem: 'npm',
        currentVersion: '0.21.1',
        fixedVersion: '0.21.4',
        references: [{ type: 'ADVISORY', url: 'https://nvd.nist.gov/vuln/detail/CVE-2021-3749' }],
        published: '2021-08-31T11:15:00Z',
      },
      {
        id: 'CVE-2021-32803',
        cveId: 'CVE-2021-32803',
        aliases: ['GHSA-r628-82hm-mfhg'],
        summary: 'tar Arbitrary File Overwrite via Hardlink Path Traversal',
        details: 'The node-tar module does not properly strip path prefixes on untrusted tar extractions.',
        severity: 'High',
        cvssScore: 8.1,
        packageName: 'tar',
        ecosystem: 'npm',
        currentVersion: '4.4.10',
        fixedVersion: '4.4.18',
        references: [{ type: 'ADVISORY', url: 'https://nvd.nist.gov/vuln/detail/CVE-2021-32803' }],
        published: '2021-08-03T19:15:00Z',
      },
    ],
    summary: {
      criticalCount: 1,
      highCount: 2,
      mediumCount: 0,
      lowCount: 0,
      totalFindings: 3,
      scannedDependenciesCount: 5,
    },
    exposedSecrets: leaks,
    secretSummary: {
      criticalCount: leaks.filter((s) => s.severity === 'Critical').length,
      highCount: leaks.filter((s) => s.severity === 'High').length,
      mediumCount: leaks.filter((s) => s.severity === 'Medium').length,
      totalSecrets: leaks.length,
      affectedFiles: 3,
    },
    securityBlueprint: {
      securityMd: `# Security Policy for superprompt-cli\n\n## Reporting a Vulnerability\nPlease contact the maintainers confidentially via security@superprompt-cli.dev before public disclosure.`,
      dependabotYml: `version: 2\nupdates:\n  - package-ecosystem: "npm"\n    directory: "/"\n    schedule:\n      interval: "daily"`,
    },
    outreachDraft: {
      subject: 'Responsible Security Notification: superprompt-cli Vulnerability Advisory & Auto-Patches',
      body: 'Hi alexdev,\n\nYour project superprompt-cli recently surpassed 1,000 GitHub Stars. We prepared 1-click pull requests updating vulnerable dependencies.',
      githubIssueTitle: 'Security Transition: High-Priority Dependency Patches for superprompt-cli',
      githubIssueMarkdown: '### Security Advisory Notice\n\nAutomated audit identified 3 known CVE vulnerabilities in dependencies.',
      prTitle: 'security: upgrade minimist, axios, and tar dependencies to patched versions',
      prBody: 'Automated patch generated by RepoShield:\n- minimist: 1.2.0 -> 1.2.6\n- axios: 0.21.1 -> 0.21.4\n- tar: 4.4.10 -> 4.4.18',
    },
    analyzedAt: new Date().toISOString(),
  };
}
