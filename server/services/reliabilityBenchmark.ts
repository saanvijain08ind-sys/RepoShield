/**
 * Verification Reliability Benchmark Service
 *
 * Runs the exact same synthetic test scenarios through ClaimVerificationEngineV1 (Baseline)
 * and ClaimVerificationEngineV2 (Corrected) to measure real before/after metrics.
 */

import type { Claim } from '../../src/types/index.ts';
import { RELIABILITY_SCENARIOS } from '../fixtures/v1FailureScenarioFixture.ts';
import type { ReliabilityBenchmarkScenario } from '../fixtures/v1FailureScenarioFixture.ts';
import { ClaimVerificationEngineV1 } from './verificationEngineV1.ts';
import { ClaimVerificationEngineV2 } from './verificationEngineV2.ts';

export interface ScenarioExecutionResult {
  scenarioId: string;
  scenarioName: string;
  category: string;
  expectedGroundTruth: string;
  v1: {
    producedStatus: string;
    isCorrect: boolean;
    isFalseContradiction: boolean;
    reason: string;
    linksCount: number;
  };
  v2: {
    producedStatus: string;
    isCorrect: boolean;
    isFalseContradiction: boolean;
    reason: string;
    linksCount: number;
  };
  remediedInV2: boolean;
}

export interface ReliabilityBenchmarkReport {
  timestamp: string;
  benchmarkName: string;
  totalScenarios: number;
  labels: {
    v1: string;
    failure: string;
    engineeringFix: string;
    v2: string;
    beforeMetric: string;
    afterMetric: string;
  };
  metrics: {
    before: {
      engine: 'V1_BASELINE';
      accuracyPct: number;
      correctCount: number;
      failedCount: number;
      falseContradictionCount: number;
      falseContradictionRatePct: number;
    };
    after: {
      engine: 'V2_CORRECTED';
      accuracyPct: number;
      correctCount: number;
      failedCount: number;
      falseContradictionCount: number;
      falseContradictionRatePct: number;
    };
    delta: {
      accuracyGainPct: number;
      falseContradictionReductionPct: number;
    };
  };
  scenarios: ScenarioExecutionResult[];
}

export class ReliabilityBenchmarkService {
  public static runBenchmark(): ReliabilityBenchmarkReport {
    const scenarios = RELIABILITY_SCENARIOS;
    const results: ScenarioExecutionResult[] = [];

    let v1Correct = 0;
    let v1FalseContradictions = 0;

    let v2Correct = 0;
    let v2FalseContradictions = 0;

    for (const item of scenarios) {
      // Execute V1
      const claimCopyV1: Claim = JSON.parse(JSON.stringify(item.claim));
      const v1Result = ClaimVerificationEngineV1.verifyClaim(claimCopyV1, item.evidence);
      const v1IsCorrect = v1Result.status === item.expectedGroundTruth;
      const v1IsFalseContradiction =
        v1Result.status === 'CONTRADICTED' && item.expectedGroundTruth !== 'CONTRADICTED';

      if (v1IsCorrect) v1Correct++;
      if (v1IsFalseContradiction) v1FalseContradictions++;

      // Execute V2 on exact same scenario and evidence
      const claimCopyV2: Claim = JSON.parse(JSON.stringify(item.claim));
      const v2Result = ClaimVerificationEngineV2.verifyClaim(claimCopyV2, item.evidence);
      const v2IsCorrect = v2Result.status === item.expectedGroundTruth;
      const v2IsFalseContradiction =
        v2Result.status === 'CONTRADICTED' && item.expectedGroundTruth !== 'CONTRADICTED';

      if (v2IsCorrect) v2Correct++;
      if (v2IsFalseContradiction) v2FalseContradictions++;

      results.push({
        scenarioId: item.id,
        scenarioName: item.name,
        category: item.category,
        expectedGroundTruth: item.expectedGroundTruth,
        v1: {
          producedStatus: v1Result.status,
          isCorrect: v1IsCorrect,
          isFalseContradiction: v1IsFalseContradiction,
          reason: v1Result.verificationReason,
          linksCount: v1Result.evidenceLinks.length,
        },
        v2: {
          producedStatus: v2Result.status,
          isCorrect: v2IsCorrect,
          isFalseContradiction: v2IsFalseContradiction,
          reason: v2Result.verificationReason,
          linksCount: v2Result.evidenceLinks.length,
        },
        remediedInV2: !v1IsCorrect && v2IsCorrect,
      });
    }

    const total = scenarios.length;
    const v1Accuracy = (v1Correct / total) * 100;
    const v1FalseContradictionRate = (v1FalseContradictions / total) * 100;

    const v2Accuracy = (v2Correct / total) * 100;
    const v2FalseContradictionRate = (v2FalseContradictions / total) * 100;

    return {
      timestamp: new Date().toISOString(),
      benchmarkName: 'PRISM V1 vs V2 Verification Reliability Benchmark',
      totalScenarios: total,
      labels: {
        v1: 'V1 (Baseline PRISM Engine)',
        failure:
          'Stale Evidence Override & Inconclusive Substring Contradiction (Temporal & Decision Incoherence)',
        engineeringFix:
          'Temporal Provenance Disambiguation & Neutral Inconclusive Fallback',
        v2: 'V2 (Corrected PRISM Engine)',
        beforeMetric: `V1 Accuracy: ${v1Accuracy.toFixed(1)}% | False Contradiction Rate: ${v1FalseContradictionRate.toFixed(1)}%`,
        afterMetric: `V2 Accuracy: ${v2Accuracy.toFixed(1)}% | False Contradiction Rate: ${v2FalseContradictionRate.toFixed(1)}%`,
      },
      metrics: {
        before: {
          engine: 'V1_BASELINE',
          accuracyPct: v1Accuracy,
          correctCount: v1Correct,
          failedCount: total - v1Correct,
          falseContradictionCount: v1FalseContradictions,
          falseContradictionRatePct: v1FalseContradictionRate,
        },
        after: {
          engine: 'V2_CORRECTED',
          accuracyPct: v2Accuracy,
          correctCount: v2Correct,
          failedCount: total - v2Correct,
          falseContradictionCount: v2FalseContradictions,
          falseContradictionRatePct: v2FalseContradictionRate,
        },
        delta: {
          accuracyGainPct: v2Accuracy - v1Accuracy,
          falseContradictionReductionPct: v1FalseContradictionRate - v2FalseContradictionRate,
        },
      },
      scenarios: results,
    };
  }
}
