/**
 * Engagement Monitoring Service
 * Integrates with GitHub and npm APIs to track real engagement indicators:
 * - GitHub stars
 * - npm downloads (point/last-month)
 * - Outside contributors
 * Gracefully handles rate limits, unauthenticated limits, and unavailable data.
 */

import { EngagementMetrics } from '../../src/types/index.ts';

export interface EngagementCheckOptions {
  mockMetrics?: Partial<EngagementMetrics>;
  useMockOnly?: boolean;
}

export class EngagementMonitor {
  /**
   * Fetches engagement metrics for a project from GitHub and npm APIs.
   * If APIs are unreachable, rate-limited, or mock options provided, handles gracefully without fabricating data.
   */
  static async fetchMetrics(
    owner: string,
    repo: string,
    npmPackageName?: string,
    options?: EngagementCheckOptions
  ): Promise<EngagementMetrics> {
    // If mock metrics explicitly provided (e.g. for testing)
    if (options?.mockMetrics) {
      return {
        githubStars: options.mockMetrics.githubStars ?? null,
        npmDownloads: options.mockMetrics.npmDownloads ?? null,
        outsideContributors: options.mockMetrics.outsideContributors ?? null,
        lastCheckedAt: new Date().toISOString(),
        source: 'mock_fixture',
        statusNotes: options.mockMetrics.statusNotes || 'Mocked metrics for testing environment',
      };
    }

    let stars: number | null = null;
    let outsideContributors: number | null = null;
    let npmDownloads: number | null = null;
    let rateLimitRemaining: number | undefined = undefined;
    const notes: string[] = [];

    // 1. Fetch GitHub Repo details (Stars)
    try {
      const ghController = new AbortController();
      const ghTimeout = setTimeout(() => ghController.abort(), 6000);

      const repoRes = await fetch(`https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`, {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'OpenSource-Security-Transition-Monitor',
        },
        signal: ghController.signal,
      });
      clearTimeout(ghTimeout);

      const rateLimitHeader = repoRes.headers.get('x-ratelimit-remaining');
      if (rateLimitHeader) {
        rateLimitRemaining = parseInt(rateLimitHeader, 10);
      }

      if (repoRes.status === 200) {
        const repoData = await repoRes.json() as { stargazers_count?: number };
        if (typeof repoData.stargazers_count === 'number') {
          stars = repoData.stargazers_count;
        }
      } else if (repoRes.status === 403) {
        notes.push('GitHub API rate limit reached (60/hr unauthenticated limit).');
      } else if (repoRes.status === 404) {
        notes.push('GitHub repository was not found or is private.');
      } else {
        notes.push(`GitHub API returned status ${repoRes.status}.`);
      }
    } catch (err: any) {
      notes.push(`GitHub API network check failed: ${err.message || 'Request timeout'}.`);
    }

    // 2. Fetch Contributors (Outside contributors)
    if (stars !== null) {
      try {
        const contribController = new AbortController();
        const contribTimeout = setTimeout(() => contribController.abort(), 6000);

        const contribRes = await fetch(
          `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contributors?per_page=10`,
          {
            headers: {
              'Accept': 'application/vnd.github.v3+json',
              'User-Agent': 'OpenSource-Security-Transition-Monitor',
            },
            signal: contribController.signal,
          }
        );
        clearTimeout(contribTimeout);

        if (contribRes.status === 200) {
          const contributors = (await contribRes.json()) as Array<{ login: string }>;
          if (Array.isArray(contributors)) {
            // Filter out primary author/owner
            const outsideList = contributors.filter(
              (c) => c.login.toLowerCase() !== owner.toLowerCase() && !c.login.includes('[bot]')
            );
            outsideContributors = outsideList.length;
          }
        }
      } catch {
        // Non-blocking, outside contributors remains null
      }
    }

    // 3. Fetch npm package downloads if npm package name is configured
    if (npmPackageName && npmPackageName.trim()) {
      try {
        const cleanPkg = npmPackageName.trim();
        const npmController = new AbortController();
        const npmTimeout = setTimeout(() => npmController.abort(), 6000);

        const npmRes = await fetch(`https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(cleanPkg)}`, {
          signal: npmController.signal,
        });
        clearTimeout(npmTimeout);

        if (npmRes.status === 200) {
          const npmData = (await npmRes.json()) as { downloads?: number };
          if (typeof npmData.downloads === 'number') {
            npmDownloads = npmData.downloads;
          }
        } else if (npmRes.status === 404) {
          notes.push(`npm package "${cleanPkg}" not found on npm registry.`);
        } else {
          notes.push(`npm API returned status ${npmRes.status}.`);
        }
      } catch (err: any) {
        notes.push(`npm API network check failed: ${err.message || 'Timeout'}.`);
      }
    }

    const hasAnyMetric = stars !== null || npmDownloads !== null || outsideContributors !== null;

    return {
      githubStars: stars,
      npmDownloads,
      outsideContributors,
      lastCheckedAt: new Date().toISOString(),
      source: hasAnyMetric ? 'live_api' : 'unavailable',
      rateLimitRemaining,
      statusNotes: notes.length > 0 ? notes.join(' ') : 'Successfully synchronized with public indicators.',
    };
  }
}
