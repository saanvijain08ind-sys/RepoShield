/**
 * In-Memory Data Store for Open Source Security Transition Monitor
 * Manages projects, transition events, educational notifications, and scan histories.
 * Pre-seeded with representative open-source transition milestones for demonstration.
 */

import {
  EvidenceItem,
  Project,
  ProjectThresholds,
  SecurityAssessmentNotification,
  SyntheticReport,
  TransitionEvent,
  WebsiteScanResult,
} from '../src/types/index.ts';
import {
  RAW_SYNTHETIC_REPORT,
  SYNTHETIC_EVIDENCE_POOL,
} from './fixtures/syntheticReportFixture.ts';
import { ClaimVerificationEngine } from './services/verificationEngine.ts';

export class AppStore {
  private projects: Map<string, Project> = new Map();
  private transitionEvents: Map<string, TransitionEvent[]> = new Map();
  private notifications: Map<string, SecurityAssessmentNotification[]> = new Map();
  private scanResults: Map<string, WebsiteScanResult[]> = new Map();
  private syntheticReport: SyntheticReport | null = null;
  private evidencePool: EvidenceItem[] = [];

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Project 1: hobby developer CLI reaching 1,240 GitHub stars (exceeded 1,000 threshold)
    const p1: Project = {
      id: 'proj_devcli',
      name: 'SuperPrompt CLI',
      githubRepoUrl: 'https://github.com/alexdev/superprompt-cli',
      githubOwner: 'alexdev',
      githubRepo: 'superprompt-cli',
      websiteUrl: 'https://superprompt-cli.dev',
      npmPackageName: 'superprompt-cli',
      createdAt: '2026-08-01T10:00:00Z',
      thresholds: {
        githubStars: 1000,
        npmDownloads: 10000,
        outsideContributors: 1,
      },
      currentMetrics: {
        githubStars: 1240,
        npmDownloads: 14500,
        outsideContributors: 3,
        lastCheckedAt: new Date().toISOString(),
        source: 'mock_fixture',
        statusNotes: 'Initial milestone reached: 1,240 GitHub stars & 14,500 npm downloads.',
      },
    };

    const evt1: TransitionEvent = {
      id: 'evt_p1_stars',
      projectId: p1.id,
      triggerType: 'github_stars',
      observedValue: 1240,
      threshold: 1000,
      timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      signature: `${p1.id}:github_stars:1000`,
    };

    const evt2: TransitionEvent = {
      id: 'evt_p1_npm',
      projectId: p1.id,
      triggerType: 'npm_downloads',
      observedValue: 14500,
      threshold: 10000,
      timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
      signature: `${p1.id}:npm_downloads:10000`,
    };

    const notif1: SecurityAssessmentNotification = {
      id: 'notif_p1_stars',
      projectId: p1.id,
      transitionEventId: evt1.id,
      title: 'Growth Milestone Reached: Time to Assess Website Security',
      milestoneMessage:
        'Your project reached 1,240 GitHub stars (configured threshold: 1,000). Projects crossing the 1,000 star threshold often experience a sudden influx of community visitors and documentation readers. While hobby tools rarely start with formal security infrastructure, a publicly accessible project website can become an accidental target for misconfiguration exploits.',
      recommendation:
        'We recommend running a non-invasive website security assessment on your project site (https://superprompt-cli.dev). This automated check inspects transport encryption, HTTP defense headers, and exposed endpoints without touching your source code or repository.',
      websiteUrl: p1.websiteUrl,
      createdAt: evt1.timestamp,
      read: false,
      status: 'pending_scan',
    };

    // Project 2: Fresh hobby library near threshold
    const p2: Project = {
      id: 'proj_cachelayer',
      name: 'NanoCache Express',
      githubRepoUrl: 'https://github.com/sarahcodes/nanocache',
      githubOwner: 'sarahcodes',
      githubRepo: 'nanocache',
      websiteUrl: 'https://nanocache.org',
      npmPackageName: 'nanocache-express',
      createdAt: '2026-08-15T12:00:00Z',
      thresholds: {
        githubStars: 1000,
        npmDownloads: 10000,
        outsideContributors: 1,
      },
      currentMetrics: {
        githubStars: 420,
        npmDownloads: 3200,
        outsideContributors: 0,
        lastCheckedAt: new Date().toISOString(),
        source: 'mock_fixture',
        statusNotes: 'Currently in early hobby phase; monitoring for growth transition.',
      },
    };

    this.projects.set(p1.id, p1);
    this.projects.set(p2.id, p2);

    this.transitionEvents.set(p1.id, [evt1, evt2]);
    this.transitionEvents.set(p2.id, []);

    this.notifications.set(p1.id, [notif1]);
    this.notifications.set(p2.id, []);

    this.scanResults.set(p1.id, []);
    this.scanResults.set(p2.id, []);
  }

  // Projects
  getAllProjects(): Project[] {
    return Array.from(this.projects.values());
  }

  getProject(id: string): Project | undefined {
    return this.projects.get(id);
  }

  createProject(project: Project): Project {
    this.projects.set(project.id, project);
    if (!this.transitionEvents.has(project.id)) {
      this.transitionEvents.set(project.id, []);
    }
    if (!this.notifications.has(project.id)) {
      this.notifications.set(project.id, []);
    }
    if (!this.scanResults.has(project.id)) {
      this.scanResults.set(project.id, []);
    }
    return project;
  }

  updateProjectMetrics(projectId: string, metrics: Project['currentMetrics']): void {
    const proj = this.projects.get(projectId);
    if (proj) {
      proj.currentMetrics = metrics;
    }
  }

  updateProjectThresholds(projectId: string, thresholds: ProjectThresholds): Project | undefined {
    const proj = this.projects.get(projectId);
    if (proj) {
      proj.thresholds = thresholds;
    }
    return proj;
  }

  // Transition Events
  getTransitionEvents(projectId: string): TransitionEvent[] {
    return this.transitionEvents.get(projectId) || [];
  }

  addTransitionEvents(projectId: string, events: TransitionEvent[]): void {
    const current = this.getTransitionEvents(projectId);
    this.transitionEvents.set(projectId, [...current, ...events]);
  }

  // Notifications
  getNotifications(projectId: string): SecurityAssessmentNotification[] {
    return this.notifications.get(projectId) || [];
  }

  addNotification(projectId: string, notif: SecurityAssessmentNotification): void {
    const current = this.getNotifications(projectId);
    this.notifications.set(projectId, [notif, ...current]);
  }

  updateNotificationStatus(
    projectId: string,
    notificationId: string,
    status: SecurityAssessmentNotification['status']
  ): void {
    const list = this.getNotifications(projectId);
    const target = list.find((n) => n.id === notificationId);
    if (target) {
      target.status = status;
      target.read = true;
    }
  }

  // Scans
  getScans(projectId: string): WebsiteScanResult[] {
    return this.scanResults.get(projectId) || [];
  }

  addScan(projectId: string, scan: WebsiteScanResult): void {
    const current = this.getScans(projectId);
    // Add newest first
    this.scanResults.set(projectId, [scan, ...current]);
  }

  getScan(projectId: string, scanId: string): WebsiteScanResult | undefined {
    return this.getScans(projectId).find((s) => s.id === scanId);
  }

  // Claim Verification & Synthetic Report
  getSyntheticReport(): SyntheticReport {
    if (!this.syntheticReport) {
      this.evidencePool = [...SYNTHETIC_EVIDENCE_POOL];
      this.syntheticReport = ClaimVerificationEngine.processReport(
        RAW_SYNTHETIC_REPORT,
        this.evidencePool
      );
    }
    return this.syntheticReport;
  }

  getEvidencePool(): EvidenceItem[] {
    if (this.evidencePool.length === 0) {
      this.evidencePool = [...SYNTHETIC_EVIDENCE_POOL];
    }
    return this.evidencePool;
  }

  reverifySyntheticReport(): SyntheticReport {
    this.evidencePool = [...SYNTHETIC_EVIDENCE_POOL];
    this.syntheticReport = ClaimVerificationEngine.processReport(
      RAW_SYNTHETIC_REPORT,
      this.evidencePool
    );
    return this.syntheticReport;
  }

  uploadSyntheticReport(report: SyntheticReport, evidencePool?: EvidenceItem[]): SyntheticReport {
    if (evidencePool && Array.isArray(evidencePool) && evidencePool.length > 0) {
      this.evidencePool = [...evidencePool];
    } else if (this.evidencePool.length === 0) {
      this.evidencePool = [...SYNTHETIC_EVIDENCE_POOL];
    }
    this.syntheticReport = ClaimVerificationEngine.processReport(
      report,
      this.evidencePool
    );
    return this.syntheticReport;
  }
}

export const globalStore = new AppStore();
