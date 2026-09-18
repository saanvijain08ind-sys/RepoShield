/**
 * Express API Routes for Open Source Security Transition Monitor
 */

import { Router } from 'express';
import { globalStore } from './store.ts';
import { UrlValidator } from './services/urlValidator.ts';
import { EngagementMonitor } from './services/engagementMonitor.ts';
import { TransitionDetector } from './services/transitionDetector.ts';
import { NotificationService } from './services/notificationService.ts';
import { LiveHttpWebsiteScanner, MockWebsiteScanner } from './services/scanner/scannerAdapter.ts';
import type { ScannerAdapter } from './services/scanner/scannerAdapter.ts';
import { VulnerabilityProcessor } from './services/vulnerabilityProcessor.ts';
import { ReliabilityBenchmarkService } from './services/reliabilityBenchmark.ts';
import { SentinelService } from './services/sentinelService.ts';
import { SecretScannerEngine } from './services/secretScannerService.ts';
import {
  RAW_SYNTHETIC_REPORT,
  SYNTHETIC_EVIDENCE_POOL,
} from './fixtures/syntheticReportFixture.ts';
import type { Project, WebsiteScanResult } from '../src/types/index.ts';

export const apiRouter = Router();

// ==========================================
// SentinelOSS API Routes
// ==========================================

// 1. Analyze Project Milestones & Vulnerabilities (Repo URL or npm Package)
apiRouter.post('/sentinel/analyze', async (req, res) => {
  try {
    const { target } = req.body;
    if (!target || typeof target !== 'string' || !target.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Target is required (provide a GitHub Repo URL or npm package name).',
      });
    }

    const analysis = await SentinelService.analyzeTarget(target.trim());
    res.json({ success: true, analysis });
  } catch (err: any) {
    console.error('Sentinel analysis error:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to analyze target' });
  }
});

// 2. Pre-configured demo preset targets for instant 1-click loading
apiRouter.get('/sentinel/presets', (req, res) => {
  const presets = [
    {
      id: 'express',
      name: 'Express',
      repoUrl: 'https://github.com/expressjs/express',
      target: 'express',
      description: 'Critical Node.js framework: 32.4M weekly downloads, 64k stars, 4 active CVEs',
      stars: 64850,
      downloads: 32400000,
      badge: 'Critical Infrastructure',
    },
    {
      id: 'superprompt-cli',
      name: 'SuperPrompt CLI',
      repoUrl: 'https://github.com/alexdev/superprompt-cli',
      target: 'superprompt-cli',
      description: 'Viral hobby tool hitting transition milestone: 1,240 stars, 14.8k downloads',
      stars: 1240,
      downloads: 14800,
      badge: 'Viral Milestone Crossing',
    },
    {
      id: 'chalk',
      name: 'Chalk',
      repoUrl: 'https://github.com/chalk/chalk',
      target: 'chalk',
      description: 'High-growth terminal utility: 118M weekly downloads, 21.5k stars',
      stars: 21500,
      downloads: 118000000,
      badge: 'High Impact',
    },
    {
      id: 'react',
      name: 'React',
      repoUrl: 'https://github.com/facebook/react',
      target: 'https://github.com/facebook/react',
      description: 'Popular UI framework: 231k stars, 28M weekly downloads',
      stars: 231000,
      downloads: 28500000,
      badge: 'Tier-1 Framework',
    },
  ];

  res.json({ success: true, presets });
});

// 3. Batch OSV API Query Proxy (CORS-friendly)
apiRouter.post('/sentinel/query-osv', async (req, res) => {
  try {
    const { dependencies } = req.body;
    if (!Array.isArray(dependencies)) {
      return res.status(400).json({ success: false, error: 'dependencies array is required.' });
    }

    const vulnerabilities = await SentinelService.queryOSVBatch(dependencies);
    res.json({ success: true, vulnerabilities });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 4. Dedicated Secret & API Key Scanner API (Scan arbitrary snippet or custom file)
apiRouter.post('/sentinel/scan-secrets', (req, res) => {
  try {
    const { content, filePath = 'snippet' } = req.body;
    if (!content || typeof content !== 'string') {
      return res.status(400).json({ success: false, error: 'Text content is required for secret scan.' });
    }

    const secrets = SecretScannerEngine.scanText(content, filePath);
    const summary = {
      criticalCount: secrets.filter((s) => s.severity === 'Critical').length,
      highCount: secrets.filter((s) => s.severity === 'High').length,
      mediumCount: secrets.filter((s) => s.severity === 'Medium').length,
      totalSecrets: secrets.length,
      affectedFiles: secrets.length > 0 ? 1 : 0,
    };

    res.json({ success: true, secrets, summary });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 5. Secret Scanner Detection Rules Catalog
apiRouter.get('/sentinel/secret-rules', (req, res) => {
  const rules = [
    {
      id: 'SEC-GOOGLE-GEMINI',
      name: 'Google Cloud / Gemini API Key',
      category: 'Google & Gemini API Key',
      severity: 'Critical',
      pattern: 'AIza[0-9A-Za-z\\-_]{35}',
      provider: 'Google Cloud / Google AI Studio',
    },
    {
      id: 'SEC-OPENAI-KEY',
      name: 'OpenAI Secret API Key',
      category: 'OpenAI API Key',
      severity: 'Critical',
      pattern: 'sk-... / sk-proj-...',
      provider: 'OpenAI Platform',
    },
    {
      id: 'SEC-ANTHROPIC-KEY',
      name: 'Anthropic Claude API Key',
      category: 'Anthropic Claude API Key',
      severity: 'Critical',
      pattern: 'sk-ant-api...',
      provider: 'Anthropic Console',
    },
    {
      id: 'SEC-AWS-ACCESS-KEY',
      name: 'AWS Access Key ID',
      category: 'AWS Access Key & Secret',
      severity: 'Critical',
      pattern: 'AKIA... / ASIA...',
      provider: 'Amazon Web Services',
    },
    {
      id: 'SEC-GITHUB-PAT',
      name: 'GitHub Personal Access Token',
      category: 'GitHub Personal Access Token',
      severity: 'Critical',
      pattern: 'ghp_... / github_pat_...',
      provider: 'GitHub Developer Settings',
    },
    {
      id: 'SEC-STRIPE-SECRET',
      name: 'Stripe Secret Key',
      category: 'Stripe Secret Key',
      severity: 'Critical',
      pattern: 'sk_live_... / sk_test_...',
      provider: 'Stripe Dashboard',
    },
    {
      id: 'SEC-DATABASE-URI',
      name: 'Database URI with Credentials',
      category: 'Database Connection String',
      severity: 'High',
      pattern: 'postgres:// / mongodb:// / mysql://',
      provider: 'Database Provider',
    },
    {
      id: 'SEC-PRIVATE-KEY',
      name: 'Cryptographic Private Key Block',
      category: 'Private Cryptographic Key',
      severity: 'Critical',
      pattern: '-----BEGIN PRIVATE KEY-----',
      provider: 'Cryptographic Secrets / PKI',
    },
    {
      id: 'SEC-SLACK-TOKEN',
      name: 'Slack Webhook / Bot Token',
      category: 'Slack Webhook / Bot Token',
      severity: 'Medium',
      pattern: 'xoxb-... / hooks.slack.com',
      provider: 'Slack API Console',
    },
  ];
  res.json({ success: true, rules });
});


// 1. List all registered projects
apiRouter.get('/projects', (req, res) => {
  const projects = globalStore.getAllProjects().map((p) => {
    const events = globalStore.getTransitionEvents(p.id);
    const notifs = globalStore.getNotifications(p.id);
    const scans = globalStore.getScans(p.id);
    const latestScan = scans[0] || null;

    return {
      ...p,
      transitionEventsCount: events.length,
      unreadNotificationsCount: notifs.filter((n) => !n.read).length,
      latestScanVerdict: latestScan ? latestScan.verdict : null,
      latestScanTimestamp: latestScan ? latestScan.completedAt || latestScan.startedAt : null,
    };
  });

  res.json({ success: true, projects });
});

// 2. Register a new project
apiRouter.post('/projects', (req, res) => {
  const { name, githubRepoUrl, websiteUrl, npmPackageName, thresholds } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ success: false, error: 'Project display name is required.' });
  }

  // Validate GitHub URL
  const ghValidation = UrlValidator.validateGitHubUrl(githubRepoUrl);
  if (!ghValidation.isValid || !ghValidation.value) {
    return res.status(400).json({ success: false, error: ghValidation.error || 'Invalid GitHub repository URL.' });
  }

  // Validate Website URL (only scanning registered website, SSRF protected)
  const websiteValidation = UrlValidator.validateWebsiteUrl(websiteUrl);
  if (!websiteValidation.isValid || !websiteValidation.value) {
    return res.status(400).json({ success: false, error: websiteValidation.error || 'Invalid website URL.' });
  }

  const projectId = `proj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
  const newProject: Project = {
    id: projectId,
    name: name.trim(),
    githubRepoUrl: ghValidation.value.normalizedUrl,
    githubOwner: ghValidation.value.owner,
    githubRepo: ghValidation.value.repo,
    websiteUrl: websiteValidation.value,
    npmPackageName: npmPackageName ? npmPackageName.trim() : undefined,
    createdAt: new Date().toISOString(),
    thresholds: {
      githubStars: Number(thresholds?.githubStars) || 1000,
      npmDownloads: Number(thresholds?.npmDownloads) || 10000,
      outsideContributors: Number(thresholds?.outsideContributors) || 1,
    },
    currentMetrics: {
      githubStars: null,
      npmDownloads: null,
      outsideContributors: null,
      lastCheckedAt: new Date().toISOString(),
      source: 'unavailable',
      statusNotes: 'Project registered. Run engagement check to sync indicators.',
    },
  };

  globalStore.createProject(newProject);
  res.status(201).json({ success: true, project: newProject });
});

// 3. Get specific project details
apiRouter.get('/projects/:id', (req, res) => {
  const project = globalStore.getProject(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found.' });
  }

  const events = globalStore.getTransitionEvents(project.id);
  const notifications = globalStore.getNotifications(project.id);
  const scans = globalStore.getScans(project.id);

  res.json({
    success: true,
    project,
    transitionEvents: events,
    notifications,
    scans,
  });
});

// 4. Update thresholds for a project
apiRouter.patch('/projects/:id/thresholds', (req, res) => {
  const project = globalStore.getProject(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found.' });
  }

  const { githubStars, npmDownloads, outsideContributors } = req.body;
  const updatedThresholds = {
    githubStars: typeof githubStars === 'number' && githubStars > 0 ? githubStars : project.thresholds.githubStars,
    npmDownloads: typeof npmDownloads === 'number' && npmDownloads > 0 ? npmDownloads : project.thresholds.npmDownloads,
    outsideContributors: typeof outsideContributors === 'number' && outsideContributors > 0 ? outsideContributors : project.thresholds.outsideContributors,
  };

  const updated = globalStore.updateProjectThresholds(project.id, updatedThresholds);
  res.json({ success: true, thresholds: updated?.thresholds });
});

// 5. Engagement check & Transition Event Detection
apiRouter.post('/projects/:id/check-engagement', async (req, res) => {
  const project = globalStore.getProject(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found.' });
  }

  const { mockMetrics, useMockOnly } = req.body || {};

  // Step 2: Engagement Monitoring
  const metrics = await EngagementMonitor.fetchMetrics(
    project.githubOwner,
    project.githubRepo,
    project.npmPackageName,
    { mockMetrics, useMockOnly }
  );

  globalStore.updateProjectMetrics(project.id, metrics);

  // Step 3: Transition Event Detection (Separate from notification generation!)
  const existingEvents = globalStore.getTransitionEvents(project.id);
  const newEvents = TransitionDetector.detectTransitionEvents(project, metrics, existingEvents);

  if (newEvents.length > 0) {
    globalStore.addTransitionEvents(project.id, newEvents);

    // Step 4: Security Assessment Notification Generation
    for (const evt of newEvents) {
      const notification = NotificationService.createNotificationFromEvent(project, evt);
      globalStore.addNotification(project.id, notification);
    }
  }

  res.json({
    success: true,
    metrics,
    newTransitionEvents: newEvents,
    totalTransitionEvents: globalStore.getTransitionEvents(project.id),
    notifications: globalStore.getNotifications(project.id),
  });
});

// 6. Website Security Scanning
apiRouter.post('/projects/:id/scan', async (req, res) => {
  const project = globalStore.getProject(req.params.id);
  if (!project) {
    return res.status(404).json({ success: false, error: 'Project not found.' });
  }

  const { useMockScanner, mockScenario, timeoutMs, notificationId } = req.body || {};

  // Step 5: Scan only the registered website!
  const targetUrl = project.websiteUrl || 'https://example.org';
  const scanId = `scan_${project.id}_${Date.now()}`;
  const startedAt = new Date().toISOString();

  let scanner: ScannerAdapter;
  let scannerType: 'live_http' | 'mock_fixture';

  if (useMockScanner) {
    scanner = new MockWebsiteScanner();
    scannerType = 'mock_fixture';
  } else {
    scanner = new LiveHttpWebsiteScanner();
    scannerType = 'live_http';
  }

  try {
    const rawResult = await scanner.scan(targetUrl, {
      timeoutMs: timeoutMs || 8000,
      mockScenario,
    });

    // Step 6: Vulnerability Processing
    const processedFindings = VulnerabilityProcessor.processFindings(rawResult.findings);

    // Step 7: Deterministic Prioritization and Verdict Generation
    const { verdict, reason } = VulnerabilityProcessor.determineVerdict(
      rawResult.success,
      processedFindings,
      rawResult.isPartialOrAmbiguous
    );

    const summary = VulnerabilityProcessor.generateSummary(processedFindings);

    const scanRecord: WebsiteScanResult = {
      id: scanId,
      projectId: project.id,
      targetUrl,
      status: rawResult.success ? 'completed' : 'failed',
      startedAt,
      completedAt: new Date().toISOString(),
      verdict,
      verdictReason: reason,
      findings: processedFindings,
      summary,
      scannerType,
      errorMessage: rawResult.error,
      scopeNotes: [
        'Scope: Baseline website inspection covering transport security, security headers (HSTS, CSP, XFO, XCTO), cookie flags, information disclosure banners, and dotfile exposures.',
        'Non-scope: Source code repositories, npm dependencies, network port vulnerability scans, and denial-of-service tests.',
      ],
      disclaimer:
        'DISCLAIMER: A verdict of "No Issues Detected" or absence of findings within this automated test suite does NOT imply that the website is completely secure. Security requires continuous assessment, application-level auditing, and defensive development practices.',
    };

    globalStore.addScan(project.id, scanRecord);

    if (notificationId) {
      globalStore.updateNotificationStatus(project.id, notificationId, 'scan_initiated');
    }

    res.json({
      success: true,
      scan: scanRecord,
    });
  } catch (err: any) {
    const failedScan: WebsiteScanResult = {
      id: scanId,
      projectId: project.id,
      targetUrl,
      status: 'failed',
      startedAt,
      completedAt: new Date().toISOString(),
      verdict: 'Scan Incomplete',
      verdictReason: `Scan aborted due to an internal execution error: ${err.message}`,
      findings: [],
      summary: {
        criticalCount: 0,
        highCount: 0,
        mediumCount: 0,
        lowCount: 0,
        infoCount: 0,
        totalFindings: 0,
      },
      scannerType,
      errorMessage: err.message,
      scopeNotes: ['Scan halted before completion.'],
      disclaimer:
        'DISCLAIMER: Incomplete scans do not evaluate website security posture.',
    };

    globalStore.addScan(project.id, failedScan);
    res.status(500).json({ success: false, error: err.message, scan: failedScan });
  }
});

// 7. Compare scan with prior scan
apiRouter.get('/projects/:id/scans/:scanId/compare', (req, res) => {
  const { id: projectId, scanId } = req.params;
  const scans = globalStore.getScans(projectId);
  const currentIndex = scans.findIndex((s) => s.id === scanId);

  if (currentIndex === -1) {
    return res.status(404).json({ success: false, error: 'Scan not found.' });
  }

  // Find previous completed scan (older scan has higher index in our descending list)
  const currentScan = scans[currentIndex];
  const previousScan = scans.slice(currentIndex + 1).find((s) => s.status === 'completed');

  if (!previousScan) {
    return res.json({
      success: true,
      hasComparison: false,
      message: 'No previous completed scan available for comparison.',
    });
  }

  const comparison = VulnerabilityProcessor.compareScans(previousScan, currentScan);

  res.json({
    success: true,
    hasComparison: true,
    comparison,
    previousScan,
    currentScan,
  });
});

// 8. Update notification status (read / dismissed)
apiRouter.patch('/projects/:id/notifications/:notifId', (req, res) => {
  const { id: projectId, notifId } = req.params;
  const { status } = req.body;

  globalStore.updateNotificationStatus(projectId, notifId, status || 'dismissed');
  res.json({ success: true });
});

// 9. Trust, Safety & Digital Security: Synthetic Claim Verification
apiRouter.get('/verification/synthetic-report', (req, res) => {
  const report = globalStore.getSyntheticReport();
  const evidencePool = globalStore.getEvidencePool();
  res.json({
    success: true,
    report,
    evidencePool,
  });
});

apiRouter.post('/verification/verify', (req, res) => {
  const verifiedReport = globalStore.reverifySyntheticReport();
  const evidencePool = globalStore.getEvidencePool();
  res.json({
    success: true,
    report: verifiedReport,
    evidencePool,
  });
});

// Upload and process a synthetic report
apiRouter.post('/verification/upload-report', (req, res) => {
  try {
    let { report, evidencePool } = req.body || {};

    // Defensively unwrap if nested under a report wrapper
    if (report && report.report && Array.isArray(report.report.claims)) {
      if (!evidencePool && Array.isArray(report.evidencePool)) {
        evidencePool = report.evidencePool;
      }
      report = report.report;
    }

    if (!report || typeof report !== 'object' || !Array.isArray(report.claims)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid synthetic report format. Expected a JSON object with a "claims" array.',
      });
    }

    if (report.claims.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Synthetic report must contain at least one claim to evaluate.',
      });
    }

    // Validate claims structure
    for (let i = 0; i < report.claims.length; i++) {
      const c = report.claims[i];
      if (!c.id || !c.statement || !c.ruleType) {
        return res.status(400).json({
          success: false,
          error: `Claim at index ${i} is missing required fields (id, statement, or ruleType).`,
        });
      }
    }

    const processedReport = globalStore.uploadSyntheticReport(report, evidencePool);
    res.json({
      success: true,
      report: processedReport,
      evidencePool: globalStore.getEvidencePool(),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to process uploaded report' });
  }
});

// Fetch standard sample synthetic report template
apiRouter.get('/verification/sample-report', (req, res) => {
  res.json({
    success: true,
    sampleReport: RAW_SYNTHETIC_REPORT,
    evidencePool: SYNTHETIC_EVIDENCE_POOL,
  });
});

// 10. Verification Reliability: PRISM V1 vs V2 Comparison Benchmark
apiRouter.get('/verification/v1-v2-comparison', (req, res) => {
  const benchmarkResult = ReliabilityBenchmarkService.runBenchmark();
  res.json({
    success: true,
    benchmark: benchmarkResult,
  });
});

apiRouter.post('/verification/v1-v2-comparison/run', (req, res) => {
  const benchmarkResult = ReliabilityBenchmarkService.runBenchmark();
  res.json({
    success: true,
    benchmark: benchmarkResult,
  });
});

