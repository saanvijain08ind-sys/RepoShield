/**
 * Transition Event Detection Service
 * Identifies when a project crosses configured engagement thresholds.
 * Strictly separates event detection from notification generation.
 * Enforces duplicate-event prevention via deterministic event signatures.
 */

import type {
  EngagementMetrics,
  Project,
  ProjectThresholds,
  TransitionEvent,
  TriggerType,
} from '../../src/types/index.ts';

export class TransitionDetector {
  /**
   * Generates a deterministic signature for deduplication.
   */
  static buildSignature(projectId: string, triggerType: TriggerType, threshold: number): string {
    return `${projectId}:${triggerType}:${threshold}`;
  }

  /**
   * Evaluates project metrics against configured thresholds.
   * Returns newly triggered transition events (excluding already existing signatures).
   */
  static detectTransitionEvents(
    project: Project,
    metrics: EngagementMetrics,
    existingEvents: TransitionEvent[]
  ): TransitionEvent[] {
    const existingSignatures = new Set(existingEvents.map((e) => e.signature));
    const newEvents: TransitionEvent[] = [];
    const now = new Date().toISOString();
    const thresholds: ProjectThresholds = project.thresholds;

    // 1. Check GitHub Stars threshold
    if (metrics.githubStars !== null && metrics.githubStars >= thresholds.githubStars) {
      const sig = this.buildSignature(project.id, 'github_stars', thresholds.githubStars);
      if (!existingSignatures.has(sig)) {
        newEvents.push({
          id: `evt_stars_${project.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          projectId: project.id,
          triggerType: 'github_stars',
          observedValue: metrics.githubStars,
          threshold: thresholds.githubStars,
          timestamp: now,
          signature: sig,
        });
      }
    }

    // 2. Check npm Downloads threshold
    if (metrics.npmDownloads !== null && metrics.npmDownloads >= thresholds.npmDownloads) {
      const sig = this.buildSignature(project.id, 'npm_downloads', thresholds.npmDownloads);
      if (!existingSignatures.has(sig)) {
        newEvents.push({
          id: `evt_npm_${project.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          projectId: project.id,
          triggerType: 'npm_downloads',
          observedValue: metrics.npmDownloads,
          threshold: thresholds.npmDownloads,
          timestamp: now,
          signature: sig,
        });
      }
    }

    // 3. Check Outside Contributors threshold
    if (
      metrics.outsideContributors !== null &&
      metrics.outsideContributors >= thresholds.outsideContributors
    ) {
      const sig = this.buildSignature(project.id, 'outside_contributors', thresholds.outsideContributors);
      if (!existingSignatures.has(sig)) {
        newEvents.push({
          id: `evt_contrib_${project.id}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          projectId: project.id,
          triggerType: 'outside_contributors',
          observedValue: metrics.outsideContributors,
          threshold: thresholds.outsideContributors,
          timestamp: now,
          signature: sig,
        });
      }
    }

    return newEvents;
  }
}
