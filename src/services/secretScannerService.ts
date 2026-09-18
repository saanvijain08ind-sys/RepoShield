/**
 * Secret & API Key Detection Engine
 * 
 * Scans code files, package manifests, and configurations for exposed credentials,
 * API tokens, database connection URIs, and private cryptographic keys.
 * Usable both server-side and client-side.
 */

import { ExposedSecret, SecretScanSummary, SecretCategory, SecretSeverity } from '../types/secret.ts';

export interface SecretDetectionRule {
  ruleId: string;
  category: SecretCategory;
  severity: SecretSeverity;
  title: string;
  description: string;
  regex: RegExp;
  providerName: string;
  envVarName: string;
  revocationUrl?: string;
  generateRefactor: (envVar: string) => string;
}

export const SECRET_DETECTION_RULES: SecretDetectionRule[] = [
  {
    ruleId: 'SEC-GOOGLE-GEMINI',
    category: 'Google & Gemini API Key',
    severity: 'Critical',
    title: 'Exposed Google Cloud / Gemini AI API Key',
    description:
      'A hardcoded Google Cloud or Gemini API key was detected. Compromised keys permit unauthorized model generation and billing consumption on Google Cloud Platform.',
    regex: /AIza[0-9A-Za-z\-_]{35}/g,
    providerName: 'Google Cloud / Google AI Studio',
    envVarName: 'GEMINI_API_KEY',
    revocationUrl: 'https://aistudio.google.com/apikey',
    generateRefactor: (envVar) => `const apiKey = process.env.${envVar};`,
  },
  {
    ruleId: 'SEC-OPENAI-KEY',
    category: 'OpenAI API Key',
    severity: 'Critical',
    title: 'Exposed OpenAI Secret API Key',
    description:
      'A hardcoded OpenAI API key (`sk-...`) was detected. Anyone with this key can query OpenAI models and incur unexpected billing charges.',
    regex: /sk-[A-Za-z0-9]{32,64}|sk-proj-[A-Za-z0-9\-_]{48,128}/g,
    providerName: 'OpenAI Platform',
    envVarName: 'OPENAI_API_KEY',
    revocationUrl: 'https://platform.openai.com/api-keys',
    generateRefactor: (envVar) => `const apiKey = process.env.${envVar};`,
  },
  {
    ruleId: 'SEC-ANTHROPIC-KEY',
    category: 'Anthropic Claude API Key',
    severity: 'Critical',
    title: 'Exposed Anthropic Claude API Key',
    description:
      'A hardcoded Anthropic Claude API key (`sk-ant-...`) was detected in the repository code.',
    regex: /sk-ant-api[0-9]{2}-[a-zA-Z0-9_\-]{80,110}/g,
    providerName: 'Anthropic Console',
    envVarName: 'ANTHROPIC_API_KEY',
    revocationUrl: 'https://console.anthropic.com/settings/keys',
    generateRefactor: (envVar) => `const client = new Anthropic({ apiKey: process.env.${envVar} });`,
  },
  {
    ruleId: 'SEC-AWS-ACCESS-KEY',
    category: 'AWS Access Key & Secret',
    severity: 'Critical',
    title: 'Exposed AWS Access Key ID',
    description:
      'A standard AWS Access Key ID (`AKIA...` or `ASIA...`) was detected. Leaked AWS credentials can lead to full AWS cloud resource hijacking.',
    regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/g,
    providerName: 'Amazon Web Services (AWS)',
    envVarName: 'AWS_ACCESS_KEY_ID',
    revocationUrl: 'https://console.aws.amazon.com/iam/',
    generateRefactor: (envVar) => `const accessKeyId = process.env.${envVar};`,
  },
  {
    ruleId: 'SEC-GITHUB-PAT',
    category: 'GitHub Personal Access Token',
    severity: 'Critical',
    title: 'Exposed GitHub Personal Access Token',
    description:
      'A GitHub Personal Access Token (classic `ghp_...` or fine-grained `github_pat_...`) was detected. Attackers can read private repos and tamper with releases.',
    regex: /ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{82}/g,
    providerName: 'GitHub Developer Settings',
    envVarName: 'GITHUB_TOKEN',
    revocationUrl: 'https://github.com/settings/tokens',
    generateRefactor: (envVar) => `const octokit = new Octokit({ auth: process.env.${envVar} });`,
  },
  {
    ruleId: 'SEC-STRIPE-SECRET',
    category: 'Stripe Secret Key',
    severity: 'Critical',
    title: 'Exposed Stripe Secret API Key',
    description:
      'A Stripe live or test secret key (`sk_live_...` or `sk_test_...`) was found committed in source code.',
    regex: /sk_(?:live|test)_[0-9a-zA-Z]{24,99}/g,
    providerName: 'Stripe Dashboard',
    envVarName: 'STRIPE_SECRET_KEY',
    revocationUrl: 'https://dashboard.stripe.com/apikeys',
    generateRefactor: (envVar) => `const stripe = new Stripe(process.env.${envVar});`,
  },
  {
    ruleId: 'SEC-DATABASE-URI',
    category: 'Database Connection String',
    severity: 'High',
    title: 'Exposed Database Connection URI with Embedded Credentials',
    description:
      'A connection URI (PostgreSQL, MongoDB, MySQL, or Redis) with plain-text username and password was discovered.',
    regex: /(?:postgres|postgresql|mongodb(?:\+srv)?|mysql|redis):\/\/[a-zA-Z0-9_\-\.%]+:[^\s"'/]+@[a-zA-Z0-9_\-\.]+(?::[0-9]{2,5})?\/[a-zA-Z0-9_\-\.?&=]+/g,
    providerName: 'Database Provider',
    envVarName: 'DATABASE_URL',
    generateRefactor: (envVar) => `const dbUrl = process.env.${envVar};`,
  },
  {
    ruleId: 'SEC-PRIVATE-KEY',
    category: 'Private Cryptographic Key',
    severity: 'Critical',
    title: 'Exposed RSA / EC / OpenSSH Private Key Block',
    description:
      'A private cryptographic key block was found hardcoded in repository text. Private keys must never be committed to source control.',
    regex: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----[a-zA-Z0-9\/\+=\r\n\s]+-----END (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g,
    providerName: 'Cryptographic Secrets / PKI',
    envVarName: 'PRIVATE_KEY',
    generateRefactor: (envVar) => `const privateKey = process.env.${envVar};`,
  },
  {
    ruleId: 'SEC-SLACK-TOKEN',
    category: 'Slack Webhook / Bot Token',
    severity: 'Medium',
    title: 'Exposed Slack Bot Token or Incoming Webhook',
    description:
      'A Slack bot API token (`xoxb-...`) or incoming webhook URL was detected in the source.',
    regex: /xox[baprs]-[0-9]{10,13}-[0-9]{10,13}[a-zA-Z0-9_\-]*|https:\/\/hooks\.slack\.com\/services\/T[A-Z0-9]+\/B[A-Z0-9]+\/[A-Za-z0-9]+/g,
    providerName: 'Slack API Console',
    envVarName: 'SLACK_BOT_TOKEN',
    revocationUrl: 'https://api.slack.com/apps',
    generateRefactor: (envVar) => `const slackToken = process.env.${envVar};`,
  },
];

/**
 * Masks a secret string for safe display in UI
 * e.g., "AIzaSyD...91xP"
 */
export function maskSecret(secret: string): string {
  if (!secret) return '••••••••';
  const len = secret.length;
  if (len <= 8) {
    return '••••••••';
  }
  const prefix = secret.slice(0, 4);
  const suffix = secret.slice(-4);
  return `${prefix}${'•'.repeat(Math.min(14, len - 8))}${suffix}`;
}

export interface FileToScan {
  path: string;
  content: string;
}

export class SecretScannerEngine {
  /**
   * Scans a single text content (or file) for secrets
   */
  public static scanText(content: string, filePath: string = 'snippet'): ExposedSecret[] {
    const findings: ExposedSecret[] = [];
    if (!content || typeof content !== 'string') return findings;

    const lines = content.split('\n');

    for (const rule of SECRET_DETECTION_RULES) {
      // Reset regex state
      rule.regex.lastIndex = 0;
      let match: RegExpExecArray | null;

      // Handle multi-line private keys
      if (rule.ruleId === 'SEC-PRIVATE-KEY') {
        const fullMatches = content.match(rule.regex);
        if (fullMatches) {
          for (const rawMatch of fullMatches) {
            findings.push({
              id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              ruleId: rule.ruleId,
              category: rule.category,
              severity: rule.severity,
              title: rule.title,
              description: rule.description,
              filePath,
              lineNumber: 1,
              snippet: '-----BEGIN PRIVATE KEY-----\n[... encrypted private key content ...]\n-----END PRIVATE KEY-----',
              maskedSecret: '-----BEGIN PRIVATE KEY----- •••••••• -----END PRIVATE KEY-----',
              rawMatchedSecret: rawMatch,
              envVarName: rule.envVarName,
              recommendedRefactor: rule.generateRefactor(rule.envVarName),
              revocationUrl: rule.revocationUrl,
              providerName: rule.providerName,
            });
          }
        }
        continue;
      }

      // Scan line by line for precise line numbers and snippet context
      for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
        const line = lines[lineIdx];
        rule.regex.lastIndex = 0;
        
        while ((match = rule.regex.exec(line)) !== null) {
          const rawMatched = match[0];
          const masked = maskSecret(rawMatched);

          // Get 1-line before and after for context
          const startContext = Math.max(0, lineIdx - 1);
          const endContext = Math.min(lines.length, lineIdx + 2);
          const contextSnippet = lines
            .slice(startContext, endContext)
            .map((l, idx) => {
              const currentLineNum = startContext + idx + 1;
              const isMatchLine = currentLineNum === lineIdx + 1;
              const maskedLine = isMatchLine ? l.replace(rawMatched, masked) : l;
              return `${currentLineNum.toString().padStart(3, ' ')} | ${maskedLine}`;
            })
            .join('\n');

          findings.push({
            id: `sec_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            ruleId: rule.ruleId,
            category: rule.category,
            severity: rule.severity,
            title: rule.title,
            description: rule.description,
            filePath,
            lineNumber: lineIdx + 1,
            snippet: contextSnippet,
            maskedSecret: masked,
            rawMatchedSecret: rawMatched,
            envVarName: rule.envVarName,
            recommendedRefactor: rule.generateRefactor(rule.envVarName),
            revocationUrl: rule.revocationUrl,
            providerName: rule.providerName,
          });
        }
      }
    }

    return findings;
  }

  /**
   * Scans a collection of project files
   */
  public static scanFiles(files: FileToScan[]): {
    secrets: ExposedSecret[];
    summary: SecretScanSummary;
  } {
    const allSecrets: ExposedSecret[] = [];
    const filesWithSecrets = new Set<string>();

    for (const file of files) {
      const findings = this.scanText(file.content, file.path);
      if (findings.length > 0) {
        filesWithSecrets.add(file.path);
        allSecrets.push(...findings);
      }
    }

    const summary: SecretScanSummary = {
      criticalCount: allSecrets.filter((s) => s.severity === 'Critical').length,
      highCount: allSecrets.filter((s) => s.severity === 'High').length,
      mediumCount: allSecrets.filter((s) => s.severity === 'Medium').length,
      totalSecrets: allSecrets.length,
      affectedFiles: filesWithSecrets.size,
    };

    return { secrets: allSecrets, summary };
  }

  /**
   * Generates a sample leak profile for demo projects (e.g. SuperPrompt CLI)
   */
  public static getSuperPromptDemoLeaks(): ExposedSecret[] {
    return [
      {
        id: 'sec_demo_gemini_1',
        ruleId: 'SEC-GOOGLE-GEMINI',
        category: 'Google & Gemini API Key',
        severity: 'Critical',
        title: 'Exposed Google Cloud / Gemini AI API Key',
        description:
          'A hardcoded Gemini API key was found committed in `bin/cli.js`. This allows unrestricted calls to Gemini models billed to the maintainer.',
        filePath: 'bin/cli.js',
        lineNumber: 14,
        snippet: ` 13 | const { GoogleGenAI } = require('@google/genai');
 14 | const ai = new GoogleGenAI({ apiKey: 'AIzaSyD-9xK11049583492817492837492019aB' });
 15 | async function generatePrompt(topic) {`,
        maskedSecret: maskSecret('AIzaSyD-9xK11049583492817492837492019aB'),
        rawMatchedSecret: 'AIzaSyD-9xK11049583492817492837492019aB',
        envVarName: 'GEMINI_API_KEY',
        recommendedRefactor: `const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });`,
        revocationUrl: 'https://aistudio.google.com/apikey',
        providerName: 'Google Cloud / Google AI Studio',
      },
      {
        id: 'sec_demo_openai_2',
        ruleId: 'SEC-OPENAI-KEY',
        category: 'OpenAI API Key',
        severity: 'Critical',
        title: 'Exposed OpenAI Secret API Key in Test Mock',
        description:
          'A live OpenAI API key was left in `test/mockConfig.js`. Automated bots continuously scrape GitHub for `sk-proj-` patterns within seconds of commit.',
        filePath: 'test/mockConfig.js',
        lineNumber: 6,
        snippet: `  5 | module.exports = {
  6 |   fallbackOpenAIKey: 'sk-proj-9A8b7C6d5E4f3G2h1I0jKlMnOpQrStUvWxYz1234567890abcdef',
  7 |   defaultModel: 'gpt-4o',`,
        maskedSecret: maskSecret('sk-proj-9A8b7C6d5E4f3G2h1I0jKlMnOpQrStUvWxYz1234567890abcdef'),
        rawMatchedSecret: 'sk-proj-9A8b7C6d5E4f3G2h1I0jKlMnOpQrStUvWxYz1234567890abcdef',
        envVarName: 'OPENAI_API_KEY',
        recommendedRefactor: `fallbackOpenAIKey: process.env.OPENAI_API_KEY,`,
        revocationUrl: 'https://platform.openai.com/api-keys',
        providerName: 'OpenAI Platform',
      },
      {
        id: 'sec_demo_db_3',
        ruleId: 'SEC-DATABASE-URI',
        category: 'Database Connection String',
        severity: 'High',
        title: 'Exposed Production PostgreSQL Connection String',
        description:
          'A database connection URI with cleartext password was discovered in `config/telemetry.js`.',
        filePath: 'config/telemetry.js',
        lineNumber: 22,
        snippet: ` 21 | // Maintainer metric storage
 22 | const telemetryDb = 'postgres://sentinel_admin:p@ssw0rd9982@telemetry.db.internal.cloud:5432/superprompt_events';
 23 | const pool = new pg.Pool({ connectionString: telemetryDb });`,
        maskedSecret: maskSecret('postgres://sentinel_admin:p@ssw0rd9982@telemetry.db.internal.cloud:5432/superprompt_events'),
        rawMatchedSecret: 'postgres://sentinel_admin:p@ssw0rd9982@telemetry.db.internal.cloud:5432/superprompt_events',
        envVarName: 'DATABASE_URL',
        recommendedRefactor: `const telemetryDb = process.env.DATABASE_URL;`,
        providerName: 'Internal PostgreSQL Cluster',
      },
    ];
  }
}
