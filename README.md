# Open Source Security Transition Monitor

A specialized web-based security monitoring platform that identifies when personal or hobby open-source projects reach important growth milestones and encourages maintainers to assess their public website's security.

## The Problem

Personal and hobby projects often start without formal security infrastructure. When a project suddenly gains users (e.g., reaching 1,000 GitHub stars or 10,000 npm downloads), its website experiences a surge in traffic and becomes an attractive target for automated scans and exploits.

Traditional vulnerability scanners focus on existing enterprise infrastructure or source code repos. This system focuses specifically on the **growth-transition moment**, delivering low-pressure, educational guidance and a non-invasive assessment of the project's **website itself** (HTTP response headers, transport encryption, cookie attributes, exposed dotfiles), strictly avoiding unrelated repository or dependency scans.

---

## Core Pipeline

1. **Project Registration**
   - Validates and normalizes public GitHub repository URLs and website URLs.
   - Enforces SSRF defense: forbids targeting localhost or internal RFC 1918 private network ranges.
   - Configures milestone thresholds (default: 1,000 GitHub stars, 10,000 npm downloads, 1 outside contributor).
   - Operates without user authentication.

2. **Engagement Monitoring**
   - Integrates with public GitHub (`/repos/{owner}/{repo}`, `/contributors`) and npm registry/download APIs.
   - Gracefully handles unauthenticated GitHub rate limits (60/hr limit) and network failures without fabricating metrics.
   - Supports deterministic test fixtures for evaluation.

3. **Transition Event Detection**
   - Evaluates current metrics against configured thresholds.
   - Enforces duplicate-event prevention using deterministic event signatures (`${projectId}:${triggerType}:${threshold}`).
   - Strictly separates event detection from notification generation.

4. **Security Assessment Notification**
   - Generates low-pressure, educational notifications explaining the growth milestone in plain terms.
   - Provides a one-click action to initiate a website security assessment.

5. **Website Security Scanning**
   - Scans **only** the registered website and explicitly authorized targets.
   - Inspects:
     - Plain HTTP vs HTTPS enforcement and automatic redirection
     - HTTP Strict Transport Security (`Strict-Transport-Security` / HSTS)
     - Content Security Policy (`Content-Security-Policy` / CSP)
     - Clickjacking defense (`X-Frame-Options`)
     - MIME Sniffing protection (`X-Content-Type-Options`)
     - Information disclosure banners (`Server`, `X-Powered-By`)
     - Cookie flags (`Secure`, `HttpOnly`, `SameSite`)
     - Sensitive exposed files (`/.git/HEAD`, `/.env`)
   - Does NOT scan source code repos, npm packages, or unrelated infrastructure.
   - Clear disclaimer: **A verdict of "No Issues Detected" does not imply the website is completely secure.**

6. **Vulnerability Processing**
   - Normalizes scanner findings into the standardized vulnerability schema.
   - Deduplicates repeated findings.
   - Preserves raw scanner evidence (exact header strings, HTTP status codes).
   - Distinguishes confirmed scanner findings from unverified observations.

7. **Deterministic Prioritization**
   - Prioritizes findings using explicit, explainable rules outside any LLM:
     - **Rank 1 (Critical)**: Exposed sensitive endpoints (`/.git`, `/.env`).
     - **Rank 2 (High)**: Plaintext HTTP without HTTPS redirection.
     - **Rank 3 (Medium)**: Missing HSTS or Content Security Policy.
     - **Rank 4 (Low)**: Missing MIME sniffing protection, banner disclosures.
     - **Rank 5 (Info)**: Unverified observations pending manual review.

8. **Educational Remediation Guidance**
   - Actionable code configuration snippets (Nginx, Caddy, Express, Cloudflare).
   - Deterministic heuristic effort estimates (e.g. `Low: ~15-30 mins`).
   - Explicit disclaimer distinguishing heuristic estimates from measured completion time.

9. **Results Dashboard & Before-and-After Comparisons**
   - Interactive web interface displaying project details, transition milestones, notifications, and scan history.
   - Before-and-after scan comparison showing resolved, persisting, and new findings across actual runs.

10. **Automated Verification Suite**
    - 11 unit and behavioral assertions covering all pipeline stages using mock fixtures.
    - Executable via CLI (`npm test`) or in-app via the "Verify Pipeline Tests" modal.

---

## Allowed Verdicts

The system strictly evaluates one of six allowed verdicts using deterministic application logic:

| Verdict | Deterministic Criteria |
| :--- | :--- |
| **Critical Issues Found** | At least one verified finding classified as `Critical` (e.g. exposed `.git` or `.env`). |
| **High-Risk Issues Found** | No critical findings exist, but at least one verified finding is classified as `High` (e.g. plaintext HTTP without TLS redirection). |
| **Issues Found** | Verified findings exist, but none meet critical or high severity criteria (e.g. missing HSTS, CSP, or MIME sniffing protection). |
| **No Issues Detected** | The completed scan returned zero findings within its configured scope. |
| **Scan Incomplete** | The scan could not complete successfully due to network timeout or connection reset. |
| **Manual Review Required** | Findings or scan conditions require human verification before a reliable conclusion can be made. |

---

## Quickstart & Commands

### Prerequisites
- Node.js v18+ (tested on Node v22)
- npm

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Automated Test Suite
```bash
npm test
```
*Executes the 11 pipeline assertions with 100% pass rate.*

### 3. Start Development Server
```bash
npm run dev
```
*Starts the Express server with Vite middleware on `http://0.0.0.0:3000`.*

### 4. Build for Production
```bash
npm run build
npm start
```

---

## Vercel Deployment

This project is configured out-of-the-box for seamless Vercel deployment:

### Architecture on Vercel
- **Frontend**: Built using Vite (`vite build`) and statically deployed to Vercel's global Edge CDN via `outputDirectory: "dist"`.
- **Backend API**: The Express API routes (`/api/*`) run as a native Vercel Serverless Function entry point via `/api/index.ts`.
- **Rewrites**: `vercel.json` maps incoming `/api/*` traffic to the serverless function, and routes client SPA requests to `index.html`.

### 1-Click / Git Deployment via Vercel Dashboard
1. Push this repository to GitHub or GitLab.
2. In the [Vercel Dashboard](https://vercel.com/new), select **Import Project** and select your repository.
3. Vercel automatically detects the Vite framework and reads `vercel.json`:
   - **Framework Preset**: Vite
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`
4. (Optional) Set environment variables in the Vercel project settings:
   - `GEMINI_API_KEY`: (Optional) If enabling Gemini-powered features.
5. Click **Deploy**.

### Deploy via Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy preview
vercel

# Deploy to production
vercel --prod
```

