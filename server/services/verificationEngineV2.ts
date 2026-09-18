/**
 * PRISM Claim Verification Engine - V2 (Corrected Implementation)
 *
 * Exact Engineering Fixes:
 * 1. Inconclusive Telemetry Fallback (STRING_INCLUSION):
 *    Telemetry that does not mention the target parameter is classified as NEUTRAL
 *    (inconclusive) rather than CONTRADICTS unless it explicitly records an absence,
 *    misconfiguration, or failure. This eliminates false contradictions from neutral logs.
 *
 * 2. Temporal Provenance Resolution (Recency Disambiguation):
 *    Candidate evidence items are ordered by collectedAt timestamp (descending).
 *    When a post-remediation probe is collected after a historical failure probe,
 *    the latest verified observation reflects the active state, marking superseded
 *    findings appropriately while preserving full audit provenance.
 *
 * 3. Deterministic Conflict Resolution:
 *    Equally timed conflicting observations trigger INSUFFICIENT_EVIDENCE with an explicit
 *    conflict trace, rather than blindly defaulting to CONTRADICTED.
 */

import type {
  Claim,
  ClaimEvidenceLink,
  ClaimState,
  EvidenceItem,
  EvidenceRelationship,
  SyntheticReport,
} from '../../src/types/index.ts';

export class ClaimVerificationEngineV2 {
  public static readonly VERSION = 'V2_CORRECTED';

  public static verifyClaim(claim: Claim, availableEvidence: EvidenceItem[]): Claim {
    const targetSource = (claim.targetEvidenceSource || '').toLowerCase();
    const claimIdSuffix = (claim.id || '').replace('claim_', '').toLowerCase();

    // 1. Filter candidate evidence
    const candidateEvidence = availableEvidence.filter((ev) => {
      const evSource = (ev.source || '').toLowerCase();
      const sourceMatch =
        Boolean(targetSource) &&
        (evSource.includes(targetSource) || targetSource.includes(evSource));

      const idMatch = Boolean(claimIdSuffix) && (ev.id || '').toLowerCase().includes(claimIdSuffix);

      return sourceMatch || idMatch;
    });

    if (candidateEvidence.length === 0) {
      return {
        ...claim,
        status: 'INSUFFICIENT_EVIDENCE',
        verificationReason: `No candidate evidence was found matching source criteria: "${claim.targetEvidenceSource || 'unspecified'}". Supporting evidence is absent.`,
        evidenceLinks: [],
        lastVerifiedAt: new Date().toISOString(),
      };
    }

    // 2. Sort candidate evidence by collectedAt descending (newest first)
    const sortedEvidence = [...candidateEvidence].sort((a, b) => {
      const timeA = new Date(a.collectedAt).getTime() || 0;
      const timeB = new Date(b.collectedAt).getTime() || 0;
      return timeB - timeA;
    });

    // 3. Evaluate each evidence item
    const links: ClaimEvidenceLink[] = [];
    for (const ev of sortedEvidence) {
      const evaluation = this.evaluateEvidenceAgainstRule(claim, ev);
      links.push({
        evidenceId: ev.id,
        evidence: ev,
        relationship: evaluation.relationship,
        rationale: evaluation.rationale,
      });
    }

    // 4. Group decisive links
    const decisiveLinks = links.filter(
      (l) => l.relationship === 'SUPPORTS' || l.relationship === 'CONTRADICTS'
    );

    if (decisiveLinks.length === 0) {
      return {
        ...claim,
        status: 'INSUFFICIENT_EVIDENCE',
        verificationReason: `Available candidate evidence items (${links.map((l) => l.evidenceId).join(', ')}) are inconclusive or neutral. Supporting evidence is absent.`,
        evidenceLinks: links,
        lastVerifiedAt: new Date().toISOString(),
      };
    }

    // 5. Engineering Fix: Temporal Provenance & Recency Disambiguation
    const newestDecisiveLink = decisiveLinks[0];
    const newestTimestamp = new Date(newestDecisiveLink.evidence.collectedAt).getTime() || 0;

    // Check if there are contradictory findings
    const supportingLinks = decisiveLinks.filter((l) => l.relationship === 'SUPPORTS');
    const contradictingLinks = decisiveLinks.filter((l) => l.relationship === 'CONTRADICTS');

    let finalStatus: ClaimState;
    let finalReason: string;

    if (supportingLinks.length > 0 && contradictingLinks.length > 0) {
      // Conflict exists between findings across time or sources
      const newestSupportTime = Math.max(
        ...supportingLinks.map((l) => new Date(l.evidence.collectedAt).getTime() || 0)
      );
      const newestContradictTime = Math.max(
        ...contradictingLinks.map((l) => new Date(l.evidence.collectedAt).getTime() || 0)
      );

      if (newestSupportTime > newestContradictTime) {
        // Remediation verified: Recent supporting probe supersedes older contradiction
        finalStatus = 'VERIFIED';
        const activeLink = supportingLinks[0];
        const supersededLink = contradictingLinks[0];
        finalReason = `Claim VERIFIED by active post-remediation evidence [${activeLink.evidenceId}: ${activeLink.rationale}]. Historical contradiction [${supersededLink.evidenceId}] was superseded at ${new Date(activeLink.evidence.collectedAt).toISOString()}.`;

        // Mark older links as superseded in rationale
        contradictingLinks.forEach((l) => {
          l.rationale = `[SUPERSEDED by active remediation evidence ${activeLink.evidenceId}] ${l.rationale}`;
        });
      } else if (newestContradictTime > newestSupportTime) {
        // Regression detected: Recent contradiction supersedes older support
        finalStatus = 'CONTRADICTED';
        const activeLink = contradictingLinks[0];
        finalReason = `Claim CONTRADICTED by recent probe [${activeLink.evidenceId}: ${activeLink.rationale}]. Previous supporting findings were invalidated by recent observation.`;
      } else {
        // Exact concurrent conflict: cannot decide safely -> INSUFFICIENT_EVIDENCE
        finalStatus = 'INSUFFICIENT_EVIDENCE';
        finalReason = `Concurrent conflicting evidence detected with identical timestamps ([${supportingLinks[0].evidenceId}] supports vs [${contradictingLinks[0].evidenceId}] contradicts). Verification inconclusive.`;
      }
    } else if (contradictingLinks.length > 0) {
      finalStatus = 'CONTRADICTED';
      finalReason = `Claim contradicted by ${contradictingLinks.length} explicit evidence item(s): ${contradictingLinks
        .map((l) => `[${l.evidenceId}: ${l.rationale}]`)
        .join('; ')}`;
    } else {
      finalStatus = 'VERIFIED';
      finalReason = `Claim verified by ${supportingLinks.length} explicit supporting evidence item(s): ${supportingLinks
        .map((l) => `[${l.evidenceId}: ${l.rationale}]`)
        .join('; ')}`;
    }

    return {
      ...claim,
      status: finalStatus,
      verificationReason: finalReason,
      evidenceLinks: links,
      lastVerifiedAt: new Date().toISOString(),
    };
  }

  private static evaluateEvidenceAgainstRule(
    claim: Claim,
    evidence: EvidenceItem
  ): { relationship: EvidenceRelationship; rationale: string } {
    const val = evidence.observedValue;
    const excerpt = evidence.excerpt;

    switch (claim.ruleType) {
      case 'NUMERIC_THRESHOLD': {
        if (!claim.numericThreshold) {
          return { relationship: 'NEUTRAL', rationale: 'Claim is missing numericThreshold configuration.' };
        }
        const numVal = typeof val === 'number' ? val : parseFloat(String(val));
        if (isNaN(numVal)) {
          return { relationship: 'NEUTRAL', rationale: `Observed value "${val}" is not a valid number.` };
        }
        const { threshold, operator } = claim.numericThreshold;
        let satisfies = false;
        switch (operator) {
          case '>=': satisfies = numVal >= threshold; break;
          case '<=': satisfies = numVal <= threshold; break;
          case '>': satisfies = numVal > threshold; break;
          case '<': satisfies = numVal < threshold; break;
          case '==': satisfies = numVal === threshold; break;
        }
        if (satisfies) {
          return { relationship: 'SUPPORTS', rationale: `Observed metric ${numVal} satisfies condition "${operator} ${threshold}".` };
        } else {
          return { relationship: 'CONTRADICTS', rationale: `Observed metric ${numVal} fails condition "${operator} ${threshold}".` };
        }
      }

      case 'STRING_INCLUSION': {
        if (!claim.expectedValue) {
          return { relationship: 'NEUTRAL', rationale: 'Claim is missing expectedValue configuration.' };
        }

        const expectedStr = String(claim.expectedValue).toLowerCase();
        const combinedObserved = `${String(val || '')} ${excerpt}`.toLowerCase();

        // 1. Explicit failure or absence markers
        if (
          combinedObserved.includes('absent') ||
          combinedObserved.includes('missing') ||
          combinedObserved.includes('not configured') ||
          combinedObserved.includes('insecure') ||
          combinedObserved.includes('disabled') ||
          combinedObserved.includes('failed')
        ) {
          return {
            relationship: 'CONTRADICTS',
            rationale: `Observed evidence explicitly states required attribute "${claim.expectedValue}" is absent or missing.`,
          };
        }

        // 2. Expected value presence
        if (combinedObserved.includes(expectedStr)) {
          return {
            relationship: 'SUPPORTS',
            rationale: `Observed evidence contains required value: "${claim.expectedValue}".`,
          };
        }

        // 3. Engineering Fix: Inconclusive observations return NEUTRAL instead of false CONTRADICTS
        return {
          relationship: 'NEUTRAL',
          rationale: `Evidence observation did not record required substring "${claim.expectedValue}" nor explicit failure indicators. Observation is inconclusive.`,
        };
      }

      case 'EXACT_MATCH': {
        const expected = String(claim.expectedValue ?? '');
        const actual = String(val ?? '');
        if (actual.trim() === expected.trim()) {
          return { relationship: 'SUPPORTS', rationale: `Observed value "${actual}" exactly matches expected "${expected}".` };
        }
        return { relationship: 'CONTRADICTS', rationale: `Observed value "${actual}" does not match expected "${expected}".` };
      }

      case 'PRESENCE_CHECK': {
        const observedText = `${String(val || '')} ${excerpt}`.toLowerCase();
        const claimAssertsAbsence =
          claim.statement.toLowerCase().includes('does not expose') ||
          claim.statement.toLowerCase().includes('not exposed') ||
          claim.statement.toLowerCase().includes('prohibited');

        const evidenceFoundExposure =
          observedText.includes('http 200') ||
          observedText.includes('status 200') ||
          observedText.includes('ref: refs/heads') ||
          observedText.includes('database_url') ||
          observedText.includes('exposed');

        if (claimAssertsAbsence) {
          if (evidenceFoundExposure) {
            return {
              relationship: 'CONTRADICTS',
              rationale: `Evidence reveals endpoint is actively exposed (${evidence.observedValue}), contradicting non-exposure assertion.`,
            };
          } else {
            return { relationship: 'SUPPORTS', rationale: `Evidence confirms endpoint is protected or unexposed.` };
          }
        }
        return { relationship: 'NEUTRAL', rationale: 'Presence check could not determine assertion direction.' };
      }

      case 'BOOLEAN_STATE': {
        const expectedBool = Boolean(claim.expectedValue);
        const actualBool = Boolean(val);
        if (val === null || val === undefined) {
          return { relationship: 'NEUTRAL', rationale: 'Observed value is null or undefined.' };
        }
        if (actualBool === expectedBool) {
          return { relationship: 'SUPPORTS', rationale: `Observed boolean state "${actualBool}" matches expected "${expectedBool}".` };
        }
        return { relationship: 'CONTRADICTS', rationale: `Observed boolean state "${actualBool}" contradicts expected "${expectedBool}".` };
      }

      default:
        return { relationship: 'NEUTRAL', rationale: `Unknown rule type: ${(claim as any).ruleType}` };
    }
  }

  public static processReport(report: SyntheticReport, evidencePool: EvidenceItem[]): SyntheticReport {
    const verifiedClaims = report.claims.map((claim) => this.verifyClaim(claim, evidencePool));
    const verifiedCount = verifiedClaims.filter((c) => c.status === 'VERIFIED').length;
    const contradictedCount = verifiedClaims.filter((c) => c.status === 'CONTRADICTED').length;
    const insufficientEvidenceCount = verifiedClaims.filter((c) => c.status === 'INSUFFICIENT_EVIDENCE').length;

    return {
      ...report,
      claims: verifiedClaims,
      summary: {
        totalClaims: verifiedClaims.length,
        verifiedCount,
        contradictedCount,
        insufficientEvidenceCount,
      },
      generatedAt: new Date().toISOString(),
    };
  }
}
