/**
 * Domain types for the Exposed Secret & API Key Scanner
 */

export type SecretSeverity = 'Critical' | 'High' | 'Medium' | 'Low';

export type SecretCategory =
  | 'Google & Gemini API Key'
  | 'OpenAI API Key'
  | 'Anthropic Claude API Key'
  | 'AWS Access Key & Secret'
  | 'GitHub Personal Access Token'
  | 'Stripe Secret Key'
  | 'Database Connection String'
  | 'Private Cryptographic Key'
  | 'Slack Webhook / Bot Token'
  | 'Generic High-Entropy Secret';

export interface ExposedSecret {
  id: string;
  ruleId: string;
  category: SecretCategory;
  severity: SecretSeverity;
  title: string;
  description: string;
  filePath: string;
  lineNumber?: number;
  snippet: string;
  maskedSecret: string;
  rawMatchedSecret?: string;
  envVarName: string;
  recommendedRefactor: string;
  revocationUrl?: string;
  providerName: string;
}

export interface SecretScanSummary {
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  totalSecrets: number;
  affectedFiles: number;
}
