/**
 * Website Security Scanner Adapter Interface and Implementations
 * Focuses strictly on website-level vulnerabilities and security misconfigurations.
 * Never scans repositories or npm dependencies.
 */

import type { VulnerabilityCategory, VulnerabilitySeverity } from '../../../src/types/index.ts';

export interface RawScannerFinding {
  category: VulnerabilityCategory;
  title: string;
  description: string;
  affectedUrlOrComponent: string;
  severity: VulnerabilitySeverity;
  evidence: string;
  confirmed: boolean;
}

export interface RawScannerResult {
  success: boolean;
  targetUrl: string;
  findings: RawScannerFinding[];
  statusNotes: string[];
  error?: string;
  isPartialOrAmbiguous?: boolean; // Used for "Manual Review Required"
}

export interface ScannerOptions {
  timeoutMs?: number;
  mockScenario?: 'clean' | 'vulnerable_high' | 'vulnerable_critical' | 'ambiguous' | 'incomplete';
}

export interface ScannerAdapter {
  scan(targetUrl: string, options?: ScannerOptions): Promise<RawScannerResult>;
}

export class LiveHttpWebsiteScanner implements ScannerAdapter {
  async scan(targetUrl: string, options?: ScannerOptions): Promise<RawScannerResult> {
    const timeoutMs = options?.timeoutMs || 8000;
    const findings: RawScannerFinding[] = [];
    const statusNotes: string[] = [];

    let parsed: URL;
    try {
      parsed = new URL(targetUrl);
    } catch {
      return {
        success: false,
        targetUrl,
        findings: [],
        statusNotes: ['Failed to parse target URL.'],
        error: 'Invalid URL supplied to scanner.',
      };
    }

    const controller = new AbortController();
    const timeoutTimer = setTimeout(() => controller.abort(), timeoutMs);

    let mainResponse: Response;
    try {
      mainResponse = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'OpenSource-Security-Transition-Monitor/1.0 (+https://github.com/opensource/security-monitor)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        redirect: 'follow',
        signal: controller.signal,
      });
      clearTimeout(timeoutTimer);
    } catch (err: any) {
      clearTimeout(timeoutTimer);
      const isTimeout = err.name === 'AbortError' || (err.message && err.message.includes('abort'));
      return {
        success: false,
        targetUrl,
        findings: [],
        statusNotes: [isTimeout ? `Website scan timed out after ${timeoutMs}ms.` : `Connection error: ${err.message}`],
        error: isTimeout ? 'Target connection timed out' : `HTTP connection failed: ${err.message}`,
      };
    }

    statusNotes.push(`Primary request completed with HTTP ${mainResponse.status} ${mainResponse.statusText}.`);

    // 1. Insecure Transport / Plain HTTP check
    if (parsed.protocol === 'http:' && !mainResponse.url.startsWith('https:')) {
      findings.push({
        category: 'Insecure Transport',
        title: 'Plaintext HTTP Without Automatic HTTPS Redirection',
        description: 'The website is served over insecure HTTP and does not automatically upgrade traffic to HTTPS.',
        affectedUrlOrComponent: targetUrl,
        severity: 'High',
        evidence: `URL requested: ${targetUrl} | Final landing URL: ${mainResponse.url}`,
        confirmed: true,
      });
    }

    const headers = mainResponse.headers;

    // 2. Strict-Transport-Security (HSTS)
    const hsts = headers.get('strict-transport-security');
    if (!hsts) {
      findings.push({
        category: 'Missing Security Header',
        title: 'Missing HTTP Strict Transport Security (HSTS)',
        description:
          'HSTS informs user agents to only communicate over HTTPS, preventing SSL stripping and protocol downgrade attacks.',
        affectedUrlOrComponent: 'HTTP Response Headers',
        severity: 'Medium',
        evidence: 'Header Strict-Transport-Security was absent from the server response.',
        confirmed: true,
      });
    } else if (!hsts.includes('max-age=') || parseInt(hsts.split('max-age=')[1], 10) < 2592000) {
      findings.push({
        category: 'Missing Security Header',
        title: 'Weak HTTP Strict Transport Security (HSTS) Policy',
        description: 'The HSTS policy max-age duration is below the recommended minimum (30+ days).',
        affectedUrlOrComponent: 'Strict-Transport-Security Header',
        severity: 'Low',
        evidence: `Observed header value: ${hsts}`,
        confirmed: true,
      });
    }

    // 3. Content-Security-Policy (CSP)
    const csp = headers.get('content-security-policy');
    if (!csp) {
      findings.push({
        category: 'Content Security Policy',
        title: 'Missing Content Security Policy (CSP)',
        description:
          'A Content Security Policy restricts which scripts, styles, and assets can load, mitigating Cross-Site Scripting (XSS) and data injection.',
        affectedUrlOrComponent: 'HTTP Response Headers',
        severity: 'Medium',
        evidence: 'Header Content-Security-Policy was absent.',
        confirmed: true,
      });
    }

    // 4. X-Frame-Options (Clickjacking defense)
    const xfo = headers.get('x-frame-options');
    const hasFrameAncestors = csp && csp.includes('frame-ancestors');
    if (!xfo && !hasFrameAncestors) {
      findings.push({
        category: 'Missing Security Header',
        title: 'Missing Clickjacking Defense (X-Frame-Options)',
        description:
          'Without X-Frame-Options or CSP frame-ancestors, the site can be embedded inside unauthorized iframes, enabling clickjacking attacks.',
        affectedUrlOrComponent: 'HTTP Response Headers',
        severity: 'Low',
        evidence: 'Header X-Frame-Options is absent and CSP frame-ancestors is not defined.',
        confirmed: true,
      });
    }

    // 5. X-Content-Type-Options (MIME Sniffing)
    const xcto = headers.get('x-content-type-options');
    if (!xcto || !xcto.toLowerCase().includes('nosniff')) {
      findings.push({
        category: 'Missing Security Header',
        title: 'Missing MIME Sniffing Protection (X-Content-Type-Options)',
        description:
          'X-Content-Type-Options: nosniff prevents the browser from interpreting non-script MIME types as executable scripts.',
        affectedUrlOrComponent: 'HTTP Response Headers',
        severity: 'Low',
        evidence: xcto ? `Observed value: ${xcto}` : 'Header X-Content-Type-Options was absent.',
        confirmed: true,
      });
    }

    // 6. Information Disclosure (Server / X-Powered-By banners)
    const serverHeader = headers.get('server');
    if (serverHeader && /[0-9]/.test(serverHeader)) {
      findings.push({
        category: 'Information Disclosure',
        title: 'Detailed Server Banner Version Disclosure',
        description:
          'The Server header discloses specific web server software versions, aiding automated reconnaissance for known CVEs.',
        affectedUrlOrComponent: 'Server Header',
        severity: 'Low',
        evidence: `Observed Server header: "${serverHeader}"`,
        confirmed: true,
      });
    }

    const xPoweredBy = headers.get('x-powered-by');
    if (xPoweredBy) {
      findings.push({
        category: 'Information Disclosure',
        title: 'Runtime Framework Disclosure (X-Powered-By)',
        description:
          'The X-Powered-By header discloses the application framework (e.g. Express, PHP), signaling the underlying technology stack.',
        affectedUrlOrComponent: 'X-Powered-By Header',
        severity: 'Low',
        evidence: `Observed X-Powered-By header: "${xPoweredBy}"`,
        confirmed: true,
      });
    }

    // 7. Cookie Security flags
    const setCookie = headers.get('set-cookie');
    if (setCookie) {
      const lowerCookie = setCookie.toLowerCase();
      if (!lowerCookie.includes('secure') && targetUrl.startsWith('https:')) {
        findings.push({
          category: 'Cookie Security',
          title: 'Cookie Missing Secure Flag',
          description: 'A cookie was issued without the Secure attribute on an HTTPS website, risking plaintext transmission.',
          affectedUrlOrComponent: 'Set-Cookie Header',
          severity: 'Medium',
          evidence: `Set-Cookie: ${setCookie.slice(0, 100)}...`,
          confirmed: true,
        });
      }
      if (!lowerCookie.includes('httponly')) {
        findings.push({
          category: 'Cookie Security',
          title: 'Cookie Missing HttpOnly Flag',
          description: 'A cookie was set without the HttpOnly attribute, making it accessible via client-side JavaScript.',
          affectedUrlOrComponent: 'Set-Cookie Header',
          severity: 'Low',
          evidence: `Set-Cookie: ${setCookie.slice(0, 100)}...`,
          confirmed: true,
        });
      }
    }

    // 8. Non-invasive sensitive file probe (HEAD/GET with short timeout)
    const baseUrl = `${parsed.protocol}//${parsed.host}`;
    await this.probeSensitiveFile(baseUrl, '/.env', findings, statusNotes);
    await this.probeSensitiveFile(baseUrl, '/.git/HEAD', findings, statusNotes);

    return {
      success: true,
      targetUrl,
      findings,
      statusNotes,
    };
  }

  private async probeSensitiveFile(
    origin: string,
    path: string,
    findings: RawScannerFinding[],
    statusNotes: string[]
  ): Promise<void> {
    try {
      const target = `${origin}${path}`;
      const probeController = new AbortController();
      const probeTimeout = setTimeout(() => probeController.abort(), 3500);

      const res = await fetch(target, {
        method: 'GET',
        headers: { 'User-Agent': 'OpenSource-Security-Transition-Monitor' },
        signal: probeController.signal,
      });
      clearTimeout(probeTimeout);

      if (res.status === 200) {
        const text = (await res.text()).slice(0, 200);
        if (path === '/.git/HEAD' && text.includes('ref: refs/')) {
          findings.push({
            category: 'Exposed Sensitive Endpoint',
            title: 'Exposed Git Repository Metadata (/.git/HEAD)',
            description:
              'The .git metadata directory is publicly exposed on the web root, allowing full source code and commit history extraction.',
            affectedUrlOrComponent: target,
            severity: 'Critical',
            evidence: `Status 200 OK with content: "${text.trim()}"`,
            confirmed: true,
          });
          statusNotes.push(`Critical issue detected: ${target} is publicly readable.`);
        } else if (path === '/.env' && (text.includes('=') || text.includes('KEY') || text.includes('SECRET'))) {
          findings.push({
            category: 'Exposed Sensitive Endpoint',
            title: 'Publicly Accessible Environment File (/.env)',
            description:
              'The environment configuration file (/.env) is exposed to the public web, risking credential leak.',
            affectedUrlOrComponent: target,
            severity: 'Critical',
            evidence: `Status 200 OK with sensitive variable assignments.`,
            confirmed: true,
          });
          statusNotes.push(`Critical issue detected: ${target} is publicly readable.`);
        }
      }
    } catch {
      // Non-blocking endpoint probe failure
    }
  }
}

/**
 * Mock Scanner implementation for testing and controlled demonstrations.
 * Explicitly labeled as mock fixtures.
 */
export class MockWebsiteScanner implements ScannerAdapter {
  async scan(targetUrl: string, options?: ScannerOptions): Promise<RawScannerResult> {
    const scenario = options?.mockScenario || 'vulnerable_high';

    if (scenario === 'incomplete') {
      return {
        success: false,
        targetUrl,
        findings: [],
        statusNotes: ['Mocked network timeout during scan execution.'],
        error: 'Connection reset by peer during TLS handshake',
      };
    }

    if (scenario === 'clean') {
      return {
        success: true,
        targetUrl,
        findings: [],
        statusNotes: ['All baseline checks passed. No header or endpoint issues observed.'],
      };
    }

    if (scenario === 'ambiguous') {
      return {
        success: true,
        targetUrl,
        findings: [
          {
            category: 'Missing Security Header',
            title: 'Unverified Custom Header Configuration',
            description: 'Custom security proxy header detected with unverified signature.',
            affectedUrlOrComponent: 'Edge Gateway Header',
            severity: 'Medium',
            evidence: 'X-Custom-Security: pending-verification',
            confirmed: false, // Unverified observation! Requires manual review
          },
        ],
        statusNotes: ['Scanner flagged unverified observations requiring human verification.'],
        isPartialOrAmbiguous: true,
      };
    }

    if (scenario === 'vulnerable_critical') {
      return {
        success: true,
        targetUrl,
        findings: [
          {
            category: 'Exposed Sensitive Endpoint',
            title: 'Exposed Git Repository Metadata (/.git/HEAD)',
            description: 'The .git repository directory is exposed on the public web root.',
            affectedUrlOrComponent: `${targetUrl}/.git/HEAD`,
            severity: 'Critical',
            evidence: 'ref: refs/heads/main returned with HTTP 200 OK',
            confirmed: true,
          },
          {
            category: 'Missing Security Header',
            title: 'Missing HTTP Strict Transport Security (HSTS)',
            description: 'HSTS header missing from server response.',
            affectedUrlOrComponent: 'HTTP Response Headers',
            severity: 'Medium',
            evidence: 'Header Strict-Transport-Security was absent.',
            confirmed: true,
          },
        ],
        statusNotes: ['Mocked critical finding generated for fixture verification.'],
      };
    }

    // Default: vulnerable_high
    return {
      success: true,
      targetUrl,
      findings: [
        {
          category: 'Insecure Transport',
          title: 'Plaintext HTTP Without Automatic HTTPS Redirection',
          description: 'The website is served over insecure HTTP without HTTPS redirection.',
          affectedUrlOrComponent: targetUrl,
          severity: 'High',
          evidence: `HTTP 200 OK on insecure transport. No Location redirect header to https://`,
          confirmed: true,
        },
        {
          category: 'Missing Security Header',
          title: 'Missing HTTP Strict Transport Security (HSTS)',
          description: 'HSTS header is absent from web responses.',
          affectedUrlOrComponent: 'HTTP Response Headers',
          severity: 'Medium',
          evidence: 'Header Strict-Transport-Security was absent.',
          confirmed: true,
        },
        {
          category: 'Content Security Policy',
          title: 'Missing Content Security Policy (CSP)',
          description: 'No Content Security Policy header defined.',
          affectedUrlOrComponent: 'HTTP Response Headers',
          severity: 'Medium',
          evidence: 'Header Content-Security-Policy was absent.',
          confirmed: true,
        },
        {
          category: 'Missing Security Header',
          title: 'Missing MIME Sniffing Protection (X-Content-Type-Options)',
          description: 'X-Content-Type-Options header was absent.',
          affectedUrlOrComponent: 'HTTP Response Headers',
          severity: 'Low',
          evidence: 'Header X-Content-Type-Options was absent.',
          confirmed: true,
        },
      ],
      statusNotes: ['Standard test fixture loaded.'],
    };
  }
}
