/**
 * Security Assessment Notification Service
 * Generates low-pressure, educational notifications when transition events occur.
 * Encourages maintainers to assess their public website security as audience scales.
 */

import type {
  Project,
  SecurityAssessmentNotification,
  TransitionEvent,
} from '../../src/types/index.ts';

export class NotificationService {
  /**
   * Translates a TransitionEvent into an educational notification.
   */
  static createNotificationFromEvent(
    project: Project,
    event: TransitionEvent
  ): SecurityAssessmentNotification {
    let milestoneSummary = '';
    let educationalContext = '';

    switch (event.triggerType) {
      case 'github_stars':
        milestoneSummary = `Your project reached ${event.observedValue.toLocaleString()} GitHub stars (configured threshold: ${event.threshold.toLocaleString()}).`;
        educationalContext =
          'Projects crossing the 1,000 star threshold often experience a sudden influx of community visitors, demo site explorers, and documentation readers. While hobby tools rarely start with formal security infrastructure, a publicly accessible project website can become an accidental target for misconfiguration exploits.';
        break;
      case 'npm_downloads':
        milestoneSummary = `Your package logged ${event.observedValue.toLocaleString()} monthly downloads (configured threshold: ${event.threshold.toLocaleString()}).`;
        educationalContext =
          'Reaching 10,000+ monthly installs signals real downstream adoption. Users clicking through README documentation links to your website expect a trustworthy destination with baseline HTTPS, clean headers, and no exposed server artifacts.';
        break;
      case 'outside_contributors':
        milestoneSummary = `Your project welcomed ${event.observedValue} outside contributor(s) (threshold: ${event.threshold}).`;
        educationalContext =
          'Gaining outside contributors marks an exciting shift from a solo hobby to a collaborative project. As more people link to and interact with your site, establishing a clean security baseline ensures safe browsing for your growing community.';
        break;
    }

    return {
      id: `notif_${event.id}_${Date.now().toString(36)}`,
      projectId: project.id,
      transitionEventId: event.id,
      title: `Growth Milestone Reached: Time to Assess Website Security`,
      milestoneMessage: `${milestoneSummary} ${educationalContext}`,
      recommendation:
        'We recommend running a non-invasive website security assessment on your project site. This automated check inspects transport encryption, HTTP defense headers, and exposed endpoints without touching your source code or repository.',
      websiteUrl: project.websiteUrl,
      createdAt: new Date().toISOString(),
      read: false,
      status: 'pending_scan',
    };
  }
}
