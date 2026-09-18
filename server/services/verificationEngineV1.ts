/**
 * PRISM Claim Verification Engine - V1 (Baseline Implementation)
 *
 * Known V1 Failure Modes:
 * 1. False Contradiction on Inconclusive Substring:
 *    When evidence does not contain the expected substring in STRING_INCLUSION,
 *    V1 returns CONTRADICTS instead of NEUTRAL, causing non-decisive telemetry to falsely contradict claims.
 * 2. Stale Evidence Override (Temporal Blindness):
 *    When multiple evidence items are linked (e.g., historical failure + post-remediation fix),
 *    V1 blindly asserts CONTRADICTED if ANY contradicting link exists, ignoring collectedAt timestamps.
 */

import type {
  Claim,
  ClaimEvidenceLink,
  ClaimState,
  EvidenceItem,
  EvidenceRelationship,
  SyntheticReport,
} from '../../src/types/index.ts';

export class ClaimVerificationEngineV1 {
  public static readonly VERSION = 'V1_BASELINE';

  public static verifyClaim(claim: Claim, availableEvidence: EvidenceItem[]): Claim {
    const targetSource = (claim.targetEvidenceSource || '').toLowerCase();
    const claimIdSuffix = (claim.id || '').replace('claim_', '').toLowerCase();

    // 1. Filter candidate evidence based on source matching or target reference
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

    const links: ClaimEvidenceLink[] = [];

    for (const ev of candidateEvidence) {
      const evaluation = this.evaluateEvidenceAgainstRule(claim, ev);
      links.push({
        evidenceId: ev.id,
        evidence: ev,
        relationship: evaluation.relationship,
        rationale: evaluation.rationale,
      });
    }

    // V1 FLAW: Blindly flags CONTRADICTED if ANY link has CONTRADICTS,
    // ignoring temporal recency (collectedAt) and whether newer evidence resolved it.
    const contradictingLinks = links.filter((l) => l.relationship === 'CONTRADICTS');
    const supportingLinks = links.filter((l) => l.relationship === 'SUPPORTS');

    let finalStatus: ClaimState;
    let finalReason: string;

    if (contradictingLinks.length > 0) {
      finalStatus = 'CONTRADICTED';
      finalReason = `Claim contradicted by ${contradictingLinks.length} explicit evidence item(s): ${contradictingLinks
        .map((l) => `[${l.evidenceId}: ${l.rationale}]`)
        .join('; ')}`;
    } else if (supportingLinks.length > 0) {
      finalStatus = 'VERIFIED';
      finalReason = `Claim verified by ${supportingLinks.length} explicit supporting evidence item(s): ${supportingLinks
        .map((l) => `[${l.evidenceId}: ${l.rationale}]`)
        .join('; ')}`;
    } else {
      finalStatus = 'INSUFFICIENT_EVIDENCE';
      finalReason = `Available candidate evidence items (${links.map((l) => l.evidenceId).join(', ')}) did not provide decisive supporting or contradicting observations for rule "${claim.ruleType}".`;
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

        if (
          combinedObserved.includes('absent') ||
          combinedObserved.includes('missing') ||
          combinedObserved.includes('not configured') ||
          combinedObserved.includes('insecure')
        ) {
          return {
            relationship: 'CONTRADICTS',
            rationale: `Observed evidence states required attribute "${claim.expectedValue}" is absent or missing.`,
          };
        }

        if (combinedObserved.includes(expectedStr)) {
          return {
            relationship: 'SUPPORTS',
            rationale: `Observed evidence contains required value: "${claim.expectedValue}".`,
          };
        }

        // V1 FLAW: Non-matching excerpt is automatically marked CONTRADICTS,
        // even if it was just general telemetry that didn't inspect or disprove the attribute.
        return {
          relationship: 'CONTRADICTS',
          rationale: `Observed evidence "${val}" does not contain expected substring "${claim.expectedValue}".`,
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
