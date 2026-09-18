/**
 * Remediation Guidance and Effort Estimation Service
 * Provides educational guidance and deterministic heuristic effort estimations.
 * Explicitly distinguishes estimated effort from measured completion time.
 */

import type { RemediationGuidance, VulnerabilityCategory, VulnerabilitySeverity } from '../../src/types/index.ts';

export class RemediationService {
  /**
   * Generates deterministic remediation guidance based on finding category and title.
   */
  static getGuidance(
    category: VulnerabilityCategory,
    title: string,
    severity: VulnerabilitySeverity
  ): RemediationGuidance {
    const DISCLAIMER =
      'Estimated effort is a heuristic baseline for a single-maintainer project and does not represent measured completion time.';

    // 1. Exposed Sensitive Endpoint (Critical)
    if (category === 'Exposed Sensitive Endpoint') {
      return {
        title: 'Block Public Web Access to Sensitive Directories and Dotfiles',
        guidance:
          'Configure your reverse proxy (Nginx, Caddy, Apache, or Cloudflare) to return a 404 or 403 status for any request matching dotfiles (.*), especially /.git and /.env. In production, never place active .git or .env files directly within the public web server root.',
        exampleSnippet: `# Nginx configuration
location ~ /\\.(?!well-known) {
    deny all;
    return 404;
}

# Caddy configuration
@blocked {
    path /.git/* /.env*
}
respond @blocked 404`,
        estimatedEffort: 'Low (~15–30 mins)',
        effortCategory: 'Low',
        effortDisclaimer: DISCLAIMER,
      };
    }

    // 2. Insecure Transport (High)
    if (category === 'Insecure Transport') {
      return {
        title: 'Enforce Automatic HTTP-to-HTTPS Redirection and TLS',
        guidance:
          'Redirect all plain HTTP traffic to HTTPS using a 301 permanent redirect. If using a hosting provider or CDN (Cloudflare, GitHub Pages, Netlify, Vercel), enable "Always Use HTTPS" in dashboard settings.',
        exampleSnippet: `# Nginx HTTP redirect
server {
    listen 80;
    server_name example.org www.example.org;
    return 301 https://$host$request_uri;
}

# Express.js middleware
app.use((req, res, next) => {
    if (!req.secure && req.get('x-forwarded-proto') !== 'https') {
        return res.redirect('https://' + req.get('host') + req.url);
    }
    next();
});`,
        estimatedEffort: 'Low (~15–30 mins)',
        effortCategory: 'Low',
        effortDisclaimer: DISCLAIMER,
      };
    }

    // 3. Missing Security Header: HSTS (Medium)
    if (title.includes('HSTS') || title.includes('Strict Transport Security')) {
      return {
        title: 'Configure HTTP Strict Transport Security (HSTS)',
        guidance:
          'Add the Strict-Transport-Security header with a minimum max-age of 6 months (15768000 seconds), including subdomains once verified. This forces browsers to connect only via HTTPS.',
        exampleSnippet: `# Nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

# Caddy
header Strict-Transport-Security "max-age=31536000; includeSubDomains"

# Express.js (helmet)
app.use(helmet.hsts({ maxAge: 31536000, includeSubDomains: true }));`,
        estimatedEffort: 'Low (~15 mins)',
        effortCategory: 'Low',
        effortDisclaimer: DISCLAIMER,
      };
    }

    // 4. Content Security Policy (Medium)
    if (category === 'Content Security Policy') {
      return {
        title: 'Implement a Baseline Content Security Policy (CSP)',
        guidance:
          'Start with a conservative Content-Security-Policy that restricts script and style sources to self and trusted CDNs. For initial rollout without breaking existing assets, you can use Content-Security-Policy-Report-Only.',
        exampleSnippet: `# Baseline CSP header
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; frame-ancestors 'none';`,
        estimatedEffort: 'Medium (~1–2 hours)',
        effortCategory: 'Medium',
        effortDisclaimer: DISCLAIMER,
      };
    }

    // 5. Clickjacking / X-Frame-Options (Low)
    if (title.includes('X-Frame-Options') || title.includes('Clickjacking')) {
      return {
        title: 'Add Clickjacking Defense Headers',
        guidance:
          'Set X-Frame-Options to DENY or SAMEORIGIN, or specify frame-ancestors in your Content Security Policy to prevent third-party sites from framing your webpage.',
        exampleSnippet: `# Nginx
add_header X-Frame-Options "DENY" always;

# Caddy
header X-Frame-Options "DENY"`,
        estimatedEffort: 'Low (~10–15 mins)',
        effortCategory: 'Low',
        effortDisclaimer: DISCLAIMER,
      };
    }

    // 6. MIME Sniffing / X-Content-Type-Options (Low)
    if (title.includes('X-Content-Type-Options') || title.includes('MIME')) {
      return {
        title: 'Prevent MIME-Type Confusion Attacks',
        guidance:
          'Send X-Content-Type-Options: nosniff on all responses so browsers do not override the Content-Type header to execute uploaded files as scripts.',
        exampleSnippet: `# Nginx
add_header X-Content-Type-Options "nosniff" always;

# Caddy
header X-Content-Type-Options "nosniff"`,
        estimatedEffort: 'Low (~10 mins)',
        effortCategory: 'Low',
        effortDisclaimer: DISCLAIMER,
      };
    }

    // 7. Information Disclosure (Low)
    if (category === 'Information Disclosure') {
      return {
        title: 'Disable Software Version Disclosure Headers',
        guidance:
          'Suppress Server and X-Powered-By response headers to avoid exposing exact runtime and operating system versions to automated port scanners.',
        exampleSnippet: `# Nginx
server_tokens off;

# Express
app.disable('x-powered-by');`,
        estimatedEffort: 'Low (~10–15 mins)',
        effortCategory: 'Low',
        effortDisclaimer: DISCLAIMER,
      };
    }

    // 8. Cookie Security
    if (category === 'Cookie Security') {
      return {
        title: 'Set Secure, HttpOnly, and SameSite Attributes on Cookies',
        guidance:
          'Ensure every Set-Cookie instruction includes the Secure flag (transmitted only over HTTPS), HttpOnly (inaccessible to JavaScript document.cookie), and SameSite=Lax or SameSite=Strict to defend against CSRF.',
        exampleSnippet: `Set-Cookie: session_id=xyz; Secure; HttpOnly; SameSite=Lax; Path=/`,
        estimatedEffort: 'Low (~15–30 mins)',
        effortCategory: 'Low',
        effortDisclaimer: DISCLAIMER,
      };
    }

    // Generic fallback
    return {
      title: 'Review and Harden Web Server Configuration',
      guidance:
        'Review your web hosting and web server configuration against OWASP Secure Headers and Web Security recommendations.',
      estimatedEffort: 'Low (~15–30 mins)',
      effortCategory: 'Low',
      effortDisclaimer: DISCLAIMER,
    };
  }
}
