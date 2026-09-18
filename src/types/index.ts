/**
 * SentinelOSS - Domain Types
 * Early-Warning Security Transition & Vulnerability Remediation for Open Source Maintainers
 */

export interface ProjectThresholds {
  githubStars: number;
  npmDownloads: number;
  outsideContributors: number;
}

export interface EngagementMetrics {
  githubStars: number | null;
  npmDownloads: number | null;
  outsideContributors: number | null;
  lastCheckedAt: string;
  source: 'live_api' | 'mock_fixture' | 'unavailable';
  rateLimitRemaining?: number;
  statusNotes?: string;
}

export interface Project {
  id: string;
  name: string;
  githubRepoUrl: string;
  githubOwner: string;
  githubRepo: string;
  websiteUrl?: string;
  npmPackageName?: string;
  createdAt: string;
  thresholds: ProjectThresholds;
  currentMetrics?: EngagementMetrics;
}

export type TriggerType = 'github_stars' | 'npm_downloads' | 'outside_contributors';

export interface TransitionEvent {
  id: string;
  projectId: string;
  triggerType: TriggerType;
  observedValue: number;
  threshold: number;
  timestamp: string;
  signature: string;
}

export interface SecurityAssessmentNotification {
  id: string;
  projectId: string;
  transitionEventId: string;
  title: string;
  milestoneMessage: string;
  recommendation: string;
  websiteUrl?: string;
  createdAt: string;
  read: boolean;
  status: 'pending_scan' | 'scan_initiated' | 'dismissed';
}

/**
 * SentinelOSS Milestone Analytics & Blast Radius
 */
export interface BlastRadius {
  dependentsCount: number;
  estimatedDownstreamUsers: number;
  criticalTier: 'CRITICAL_INFRASTRUCTURE' | 'HIGH_IMPACT' | 'GROWING_ECOSYSTEM' | 'HOBBY';
  impactDescription: string;
}

export interface MilestoneMetrics {
  githubStars: number;
  forks: number;
  npmWeeklyDownloads: number;
  openIssues: number;
  thresholdExceeded: boolean;
  exceededReason: string;
  blastRadius: BlastRadius;
  growthVelocity: string;
  starsThreshold: number;
  downloadsThreshold: number;
}

/**
 * Dependency & OSV Vulnerability Engine
 */
export interface DependencyItem {
  name: string;
  version: string;
  isDev?: boolean;
}

export type OSVSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export interface OSVVulnerability {
  id: string; // CVE-XXXX-XXXX or GHSA-XXXX-XXXX
  cveId: string;
  aliases: string[];
  summary: string;
  details?: string;
  severity: OSVSeverity;
  cvssScore?: number;
  packageName: string;
  ecosystem: string;
  currentVersion: string;
  fixedVersion: string;
  references: Array<{ type: string; url: string }>;
  published?: string;
}

export interface VulnerabilitySummary {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  totalFindings: number;
  scannedDependenciesCount: number;
}

/**
 * Security Blueprint & 1-Click Fix PR Artifacts
 */
export interface SecurityBlueprint {
  securityMd: string;
  dependabotYml: string;
}

export interface MaintainerOutreach {
  subject: string;
  body: string;
  githubIssueTitle: string;
  githubIssueMarkdown: string;
  prTitle: string;
  prBody: string;
}

export * from './secret.ts';

export interface ProjectAnalysis {
  id: string;
  name: string;
  repoUrl: string;
  owner: string;
  repo: string;
  npmPackageName?: string;
  milestones: MilestoneMetrics;
  dependencies: DependencyItem[];
  vulnerabilities: OSVVulnerability[];
  summary: VulnerabilitySummary;
  exposedSecrets?: import('./secret.ts').ExposedSecret[];
  secretSummary?: import('./secret.ts').SecretScanSummary;
  rawPackageJson: string;
  updatedPackageJson: string;
  gitDiff: string;
  fixedDependenciesCount: number;
  securityBlueprint: SecurityBlueprint;
  outreachDraft: MaintainerOutreach;
  analyzedAt: string;
}

// Auxiliary types for full linter compatibility
export type VulnerabilityCategory =
  | 'Insecure Transport'
  | 'Missing Security Header'
  | 'Content Security Policy'
  | 'Cookie Security'
  | 'Information Disclosure'
  | 'CORS Misconfiguration'
  | 'Exposed Sensitive Endpoint';

export type VulnerabilitySeverity = 'Critical' | 'High' | 'Medium' | 'Low' | 'Info';

export interface RemediationGuidance {
  title: string;
  guidance: string;
  exampleSnippet?: string;
  estimatedEffort: string;
  effortCategory: 'Low' | 'Medium' | 'High';
  effortDisclaimer: string;
}

export interface VulnerabilityFinding {
  id: string;
  category: VulnerabilityCategory;
  title: string;
  description: string;
  affectedUrlOrComponent: string;
  severity: VulnerabilitySeverity;
  evidence: string;
  detectionTimestamp: string;
  confirmed: boolean;
  priorityRank: number;
  priorityReason: string;
  remediation: RemediationGuidance;
}

export type ScanVerdict =
  | 'Critical Issues Found'
  | 'High-Risk Issues Found'
  | 'Issues Found'
  | 'No Issues Detected'
  | 'Scan Incomplete'
  | 'Manual Review Required';

export type ScanStatus = 'pending' | 'running' | 'completed' | 'failed';

export interface ScanSummary {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  totalFindings: number;
}

export interface WebsiteScanResult {
  id: string;
  projectId: string;
  targetUrl: string;
  status: ScanStatus;
  startedAt: string;
  completedAt?: string;
  verdict: ScanVerdict;
  verdictReason: string;
  findings: VulnerabilityFinding[];
  summary: ScanSummary;
  scannerType: 'live_http' | 'mock_fixture';
  errorMessage?: string;
  scopeNotes: string[];
  disclaimer: string;
}

export interface BeforeAfterComparison {
  previousScanId: string;
  currentScanId: string;
  previousVerdict: ScanVerdict;
  currentVerdict: ScanVerdict;
  resolvedFindings: VulnerabilityFinding[];
  persistingFindings: VulnerabilityFinding[];
  newFindings: VulnerabilityFinding[];
}

export type ClaimState = 'VERIFIED' | 'CONTRADICTED' | 'INSUFFICIENT_EVIDENCE';

export type EvidenceRelationship = 'SUPPORTS' | 'CONTRADICTS' | 'NEUTRAL';

export interface EvidenceItem {
  id: string;
  source: string;
  referenceUrl?: string;
  observedValue: string | number | boolean | null;
  excerpt: string;
  collectedAt: string;
  collector: string;
  provenanceHash?: string;
}

export interface ClaimEvidenceLink {
  evidenceId: string;
  evidence: EvidenceItem;
  relationship: EvidenceRelationship;
  rationale: string;
}

export type ClaimVerificationRuleType =
  | 'NUMERIC_THRESHOLD'
  | 'STRING_INCLUSION'
  | 'EXACT_MATCH'
  | 'BOOLEAN_STATE'
  | 'PRESENCE_CHECK';

export interface Claim {
  id: string;
  statement: string;
  category: string;
  ruleType: ClaimVerificationRuleType;
  expectedValue?: string | number | boolean;
  numericThreshold?: {
    threshold: number;
    operator: '>=' | '<=' | '>' | '<' | '==';
  };
  targetEvidenceSource: string;
  status: ClaimState;
  verificationReason: string;
  evidenceLinks: ClaimEvidenceLink[];
  lastVerifiedAt: string;
}

export interface SyntheticReport {
  id: string;
  title: string;
  projectId: string;
  generatedAt: string;
  description: string;
  claims: Claim[];
  summary: {
    totalClaims: number;
    verifiedCount: number;
    contradictedCount: number;
    insufficientEvidenceCount: number;
  };
}


