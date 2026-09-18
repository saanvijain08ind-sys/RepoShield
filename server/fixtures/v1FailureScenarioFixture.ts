/**
 * Deterministic Synthetic Test Suite for V1 Failure Reproduction & V2 Verification
 *
 * Demonstrates:
 * 1. Scenario 1 (Primary V1 Failure - Remediation Blindness):
 *    Historical failure probe (T0) + Post-remediation verified probe (T1).
 *    V1 Result: CONTRADICTED (Failure: stale evidence overrides fix)
 *    V2 Result: VERIFIED (Success: temporal recency resolves fix)
 *
 * 2. Scenario 2 (Secondary V1 Failure - False Contradiction on Neutral Telemetry):
 *    Neutral server log lacking CSP string without explicit failure marker.
 *    V1 Result: CONTRADICTED (Failure: non-decisive log treated as contradiction)
 *    V2 Result: INSUFFICIENT_EVIDENCE (Success: correctly treats as inconclusive)
 *
 * 3. Scenario 3 (Persistent Vulnerability Control):
 *    Consistently unencrypted port 80 probe.
 *    V1 Result: CONTRADICTED (Success)
 *    V2 Result: CONTRADICTED (Success)
 *
 * 4. Scenario 4 (Clean Milestone Verification Control):
 *    Consistent GitHub API metric (1,240 stars >= 1,000 threshold).
 *    V1 Result: VERIFIED (Success)
 *    V2 Result: VERIFIED (Success)
 */

import { Claim, EvidenceItem } from '../../src/types/index.ts';

export interface ReliabilityBenchmarkScenario {
  id: string;
  name: string;
  description: string;
  claim: Claim;
  evidence: EvidenceItem[];
  expectedGroundTruth: 'VERIFIED' | 'CONTRADICTED' | 'INSUFFICIENT_EVIDENCE';
  category: 'REMEDIATION_UPDATE' | 'INCONCLUSIVE_TELEMETRY' | 'PERSISTENT_FINDING' | 'STABLE_METRIC';
}

export const RELIABILITY_SCENARIOS: ReliabilityBenchmarkScenario[] = [
  {
    id: 'scen_01_remediation_hsts',
    name: 'Post-Remediation Verification (HSTS Configuration Update)',
    description:
      'Tests whether a newly deployed security fix (HSTS header enabled) is recognized after a previous scan recorded missing HSTS.',
    expectedGroundTruth: 'VERIFIED',
    category: 'REMEDIATION_UPDATE',
    claim: {
      id: 'claim_hsts_remediated',
      statement:
        'The production documentation website enforces Strict-Transport-Security (HSTS) with a minimum duration of 31,536,000 seconds.',
      category: 'Transport Security',
      ruleType: 'STRING_INCLUSION',
      expectedValue: 'max-age=31536000',
      targetEvidenceSource: 'HTTPS Response Header: Strict-Transport-Security',
      status: 'INSUFFICIENT_EVIDENCE',
      verificationReason: '',
      evidenceLinks: [],
      lastVerifiedAt: '',
    },
    evidence: [
      {
        id: 'ev_hsts_historical_fail',
        source: 'HTTPS Response Header: Strict-Transport-Security',
        referenceUrl: 'https://superprompt-cli.dev',
        observedValue: 'strict-transport-security: absent',
        excerpt: 'HTTP/1.1 200 OK\r\nServer: nginx\r\nStrict-Transport-Security: absent',
        collectedAt: '2026-09-17T09:00:00Z', // OLDER HISTORICAL PROBE
        collector: 'Live Transport Security Scanner v1.0',
        provenanceHash: 'audit-run:001-historical-failure',
      },
      {
        id: 'ev_hsts_post_remediation_fix',
        source: 'HTTPS Response Header: Strict-Transport-Security',
        referenceUrl: 'https://superprompt-cli.dev',
        observedValue: 'max-age=31536000; includeSubDomains; preload',
        excerpt: 'HTTP/1.1 200 OK\r\nServer: nginx\r\nStrict-Transport-Security: max-age=31536000; includeSubDomains; preload',
        collectedAt: '2026-09-18T10:00:00Z', // NEWER POST-REMEDIATION PROBE (+25 hours)
        collector: 'Live Transport Security Scanner v1.2',
        provenanceHash: 'audit-run:002-remediation-verified',
      },
    ],
  },
  {
    id: 'scen_02_inconclusive_telemetry',
    name: 'Inconclusive General Telemetry Handling (Neutral Probe Log)',
    description:
      'Tests whether a general server response log that did not record CSP is correctly treated as inconclusive rather than falsely contradicted.',
    expectedGroundTruth: 'INSUFFICIENT_EVIDENCE',
    category: 'INCONCLUSIVE_TELEMETRY',
    claim: {
      id: 'claim_csp_neutral_probe',
      statement: 'Content Security Policy enforces strict frame-ancestors restrictions.',
      category: 'Browser Protection',
      ruleType: 'STRING_INCLUSION',
      expectedValue: 'frame-ancestors',
      targetEvidenceSource: 'General Server Probe Log',
      status: 'INSUFFICIENT_EVIDENCE',
      verificationReason: '',
      evidenceLinks: [],
      lastVerifiedAt: '',
    },
    evidence: [
      {
        id: 'ev_general_probe_log',
        source: 'General Server Probe Log',
        referenceUrl: 'https://superprompt-cli.dev',
        observedValue: 'HTTP/1.1 200 OK Content-Type: text/html',
        excerpt: 'HTTP/1.1 200 OK\r\nDate: Fri, 18 Sep 2026 04:00:00 GMT\r\nContent-Type: text/html; charset=UTF-8\r\nConnection: keep-alive',
        collectedAt: '2026-09-18T04:00:00Z',
        collector: 'General HTTP Ping Probe v1.0',
        provenanceHash: 'ping-telemetry:001',
      },
    ],
  },
  {
    id: 'scen_03_persistent_unencrypted_http',
    name: 'Persistent Vulnerability Confirmation (Plaintext HTTP)',
    description:
      'Tests that a genuinely unaddressed security flaw (HTTP port 80 returning 200 without redirect) remains consistently contradicted.',
    expectedGroundTruth: 'CONTRADICTED',
    category: 'PERSISTENT_FINDING',
    claim: {
      id: 'claim_http_redirection_active',
      statement: 'All plain HTTP requests to port 80 are strictly redirected with HTTP 301/308 to HTTPS.',
      category: 'Transport Security',
      ruleType: 'STRING_INCLUSION',
      expectedValue: 'redirect to https',
      targetEvidenceSource: 'HTTP Insecure Transport Probe (Port 80)',
      status: 'INSUFFICIENT_EVIDENCE',
      verificationReason: '',
      evidenceLinks: [],
      lastVerifiedAt: '',
    },
    evidence: [
      {
        id: 'ev_plain_http_confirmed',
        source: 'HTTP Insecure Transport Probe (Port 80)',
        referenceUrl: 'http://superprompt-cli.dev',
        observedValue: 'HTTP/1.1 200 OK without Location redirect',
        excerpt: 'HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n<!DOCTYPE html><html>Insecure Documentation Endpoint</html>',
        collectedAt: '2026-09-18T04:32:18Z',
        collector: 'Plain HTTP Transport Auditor v1.0',
        provenanceHash: 'http-status:200-no-redirect',
      },
    ],
  },
  {
    id: 'scen_04_growth_milestone_metric',
    name: 'Deterministic Milestone Verification (GitHub Stars Threshold)',
    description:
      'Tests that valid numeric metrics meeting required criteria continue to be verified accurately.',
    expectedGroundTruth: 'VERIFIED',
    category: 'STABLE_METRIC',
    claim: {
      id: 'claim_github_stars_growth',
      statement: 'The open-source repository has reached or exceeded 1,000 public GitHub stars.',
      category: 'Growth Milestone Verification',
      ruleType: 'NUMERIC_THRESHOLD',
      numericThreshold: { threshold: 1000, operator: '>=' },
      targetEvidenceSource: 'GitHub REST API',
      status: 'INSUFFICIENT_EVIDENCE',
      verificationReason: '',
      evidenceLinks: [],
      lastVerifiedAt: '',
    },
    evidence: [
      {
        id: 'ev_gh_stars_1240_metric',
        source: 'GitHub REST API /repos/alexdev/superprompt-cli',
        referenceUrl: 'https://api.github.com/repos/alexdev/superprompt-cli',
        observedValue: 1240,
        excerpt: '{"stargazers_count": 1240, "watchers_count": 1240, "open_issues": 12}',
        collectedAt: '2026-09-18T04:30:00Z',
        collector: 'GitHub Metrics Collector v2.4',
        provenanceHash: 'sha256:8f43a9b1c2d3e4f5a6b7c8d9e0f1a2b3',
      },
    ],
  },
];
