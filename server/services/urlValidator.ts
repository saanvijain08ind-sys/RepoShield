/**
 * URL Validation and Normalization Service
 * Handles GitHub repository URLs and website URLs with security defenses (e.g., SSRF prevention).
 */

export interface GitHubRepoDetails {
  owner: string;
  repo: string;
  normalizedUrl: string;
}

export interface ValidationResult<T> {
  isValid: boolean;
  error?: string;
  value?: T;
}

// Regex to detect private/internal IPv4 and localhost
const LOCALHOST_REGEX = /^(localhost|127\.\d+\.\d+\.\d+|0\.0\.0\.0|::1)$/i;
const PRIVATE_IP_REGEX = /^(10\.\d+\.\d+\.\d+|172\.(1[6-9]|2\d|3[01])\.\d+\.\d+|192\.168\.\d+\.\d+)$/;

export class UrlValidator {
  /**
   * Validates and normalizes a GitHub repository URL.
   * Accepts formats like:
   * - https://github.com/owner/repo
   * - http://github.com/owner/repo
   * - github.com/owner/repo
   * - owner/repo
   */
  static validateGitHubUrl(rawUrl: string): ValidationResult<GitHubRepoDetails> {
    if (!rawUrl || typeof rawUrl !== 'string') {
      return { isValid: false, error: 'GitHub repository URL or identifier is required.' };
    }

    const trimmed = rawUrl.trim().replace(/\/+$/, '');

    // Check simple "owner/repo" shorthand
    const shorthandMatch = trimmed.match(/^([a-zA-Z0-9_\-\.]+)\/([a-zA-Z0-9_\-\.]+)$/);
    if (shorthandMatch && !trimmed.includes('.')) {
      const owner = shorthandMatch[1];
      const repo = shorthandMatch[2].replace(/\.git$/, '');
      return {
        isValid: true,
        value: {
          owner,
          repo,
          normalizedUrl: `https://github.com/${owner}/${repo}`,
        },
      };
    }

    let urlToParse = trimmed;
    if (!/^https?:\/\//i.test(urlToParse)) {
      urlToParse = `https://${urlToParse}`;
    }

    try {
      const parsed = new URL(urlToParse);
      const host = parsed.hostname.toLowerCase();

      if (host !== 'github.com' && host !== 'www.github.com') {
        return { isValid: false, error: 'Repository URL must point to github.com.' };
      }

      const segments = parsed.pathname.split('/').filter(Boolean);
      if (segments.length < 2) {
        return { isValid: false, error: 'GitHub URL must include both owner and repository name.' };
      }

      const owner = segments[0];
      const repo = segments[1].replace(/\.git$/, '');

      if (!/^[a-zA-Z0-9_\-\.]+$/.test(owner) || !/^[a-zA-Z0-9_\-\.]+$/.test(repo)) {
        return { isValid: false, error: 'Owner or repository contains invalid characters.' };
      }

      return {
        isValid: true,
        value: {
          owner,
          repo,
          normalizedUrl: `https://github.com/${owner}/${repo}`,
        },
      };
    } catch {
      return { isValid: false, error: 'Invalid URL format provided for GitHub repository.' };
    }
  }

  /**
   * Validates and normalizes a project website URL.
   * Enforces http/https, valid domain name, and blocks internal SSRF targets.
   */
  static validateWebsiteUrl(rawUrl: string, allowLocalForTesting = false): ValidationResult<string> {
    if (!rawUrl || typeof rawUrl !== 'string') {
      return { isValid: false, error: 'Website URL is required.' };
    }

    let trimmed = rawUrl.trim();
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = `https://${trimmed}`;
    }

    try {
      const parsed = new URL(trimmed);

      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { isValid: false, error: 'Website URL must use HTTP or HTTPS protocol.' };
      }

      const hostname = parsed.hostname.toLowerCase();

      if (!hostname) {
        return { isValid: false, error: 'Website URL has an invalid or missing hostname.' };
      }

      // Check SSRF protection against private networks unless specifically running in controlled test mode
      if (!allowLocalForTesting) {
        if (LOCALHOST_REGEX.test(hostname) || PRIVATE_IP_REGEX.test(hostname)) {
          return {
            isValid: false,
            error: 'Targeting localhost or private network IP ranges is forbidden for website scanning.',
          };
        }
      }

      // Strip query parameters and fragments for baseline website root scanning, keep standard origin/path
      const normalizedPath = parsed.pathname.replace(/\/+$/, '') || '/';
      const normalized = `${parsed.protocol}//${parsed.host}${normalizedPath === '/' ? '' : normalizedPath}`;

      return {
        isValid: true,
        value: normalized,
      };
    } catch {
      return { isValid: false, error: 'Invalid website URL format.' };
    }
  }
}
