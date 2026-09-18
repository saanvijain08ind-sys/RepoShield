import React, { useState } from 'react';
import {
  Key,
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  Info,
  ExternalLink,
  Copy,
  Check,
  Eye,
  EyeOff,
  Terminal,
  FileCode,
  Sparkles,
  Lock,
  Search,
  Filter,
  GitPullRequest,
  ArrowRight,
} from 'lucide-react';
import { ExposedSecret, SecretScanSummary, SecretSeverity } from '../types/index.ts';
import { SecretScannerEngine } from '../services/secretScannerService.ts';

interface SecretScannerDashboardProps {
  secrets: ExposedSecret[];
  summary?: SecretScanSummary;
  repoName: string;
  onProceedToRemediation?: () => void;
}

export const SecretScannerDashboard: React.FC<SecretScannerDashboardProps> = ({
  secrets,
  summary,
  repoName,
  onProceedToRemediation,
}) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [revealedIds, setRevealedIds] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Quick live interactive sniffer state
  const [customSnippet, setCustomSnippet] = useState<string>('');
  const [customScanResults, setCustomScanResults] = useState<ExposedSecret[] | null>(null);
  const [isScanningCustom, setIsScanningCustom] = useState<boolean>(false);

  const toggleReveal = (id: string) => {
    setRevealedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const criticalCount =
    summary?.criticalCount ?? secrets.filter((s) => s.severity === 'Critical').length;
  const highCount =
    summary?.highCount ?? secrets.filter((s) => s.severity === 'High').length;
  const mediumCount =
    summary?.mediumCount ?? secrets.filter((s) => s.severity === 'Medium').length;
  const totalCount = summary?.totalSecrets ?? secrets.length;

  const filteredSecrets = secrets.filter((s) => {
    const matchesSeverity =
      selectedSeverity === 'ALL' || s.severity.toUpperCase() === selectedSeverity.toUpperCase();
    const matchesSearch =
      s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.filePath.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.envVarName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const getSeverityBadge = (severity: SecretSeverity) => {
    switch (severity) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono-code font-bold bg-[#cf222e]/15 text-[#cf222e] dark:text-[#ff7b72] border border-[#cf222e]/40 dark:border-[#cf222e]/60">
            <AlertOctagon className="w-3.5 h-3.5" /> CRITICAL SECRET
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono-code font-bold bg-orange-500/15 text-orange-800 dark:text-orange-300 border border-orange-500/40">
            <AlertTriangle className="w-3.5 h-3.5" /> HIGH RISK
          </span>
        );
      case 'Medium':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-mono-code font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/40">
            <Info className="w-3.5 h-3.5" /> MEDIUM
          </span>
        );
    }
  };

  const handleRunCustomScan = async () => {
    if (!customSnippet.trim()) return;
    setIsScanningCustom(true);
    try {
      const res = await fetch('/api/sentinel/scan-secrets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: customSnippet, filePath: 'live-test.js' }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.secrets) {
          setCustomScanResults(data.secrets);
          return;
        }
      }
      // Client-side fallback if server API is unreachable or returns non-200
      const localFindings = SecretScannerEngine.scanText(customSnippet, 'live-test.js');
      setCustomScanResults(localFindings);
    } catch (e) {
      console.warn('Network error scanning secrets on server; using in-browser engine:', e);
      const localFindings = SecretScannerEngine.scanText(customSnippet, 'live-test.js');
      setCustomScanResults(localFindings);
    } finally {
      setIsScanningCustom(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header & Severity Summary */}
      <div className="bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b-2 border-[#1a1a1c] dark:border-[#f0f6fc]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-mono text-[#cf222e] font-bold flex items-center gap-1">
                <Key className="w-3.5 h-3.5" />
                <span>Credential &amp; Token Guard</span>
              </span>
              <span className="text-xs font-mono-code text-[#57606a] dark:text-[#8b949e]">
                • High-Entropy &amp; Pattern Analysis
              </span>
              {criticalCount > 0 ? (
                <span className="px-2.5 py-0.5 text-xs font-mono-code font-bold uppercase bg-[#cf222e] text-white">
                  Immediate Revocation Required
                </span>
              ) : totalCount > 0 ? (
                <span className="px-2.5 py-0.5 text-xs font-mono-code font-bold uppercase bg-amber-500 text-black">
                  Secrets Found
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-xs font-mono-code font-bold uppercase bg-[#2ea043] text-white">
                  No Leaked Secrets
                </span>
              )}
            </div>
            <h3 className="font-syne text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#1a1a1c] dark:text-[#f0f6fc] mt-1.5">
              Exposed Secret &amp; API Key Scan
            </h3>
            <p className="text-sm font-sans text-[#24292f] dark:text-[#d0d7de] font-medium mt-1">
              Active pattern detection for Google Cloud/Gemini, OpenAI, Anthropic Claude, AWS IAM, GitHub PATs, and Database credentials.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono-code bg-[#f8f7f4] dark:bg-[#0f1117] px-3 py-2 border-2 border-[#1a1a1c] dark:border-[#f0f6fc] font-bold text-[#cf222e] dark:text-[#ff7b72]">
              {totalCount} Leaked {totalCount === 1 ? 'Credential' : 'Credentials'} Flagged
            </span>
            {onProceedToRemediation && (
              <button
                id="secrets-proceed-to-remediation-btn"
                onClick={onProceedToRemediation}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono-code font-bold uppercase tracking-wider text-white bg-[#2ea043] hover:bg-[#2c9740] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] shadow-xs transition-opacity"
              >
                <GitPullRequest className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Proceed to Remediation</span>
                <span className="sm:hidden">Remediation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Severity Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div
            id="secret-filter-all"
            onClick={() => setSelectedSeverity('ALL')}
            className={`p-3.5 border-2 cursor-pointer transition-all ${
              selectedSeverity === 'ALL'
                ? 'bg-white text-[#952424] border-[#1a1a1c] ring-2 ring-[#952424] dark:bg-[#952424] dark:text-white dark:border-[#f0f6fc]'
                : 'bg-[#f8f7f4] dark:bg-[#0f1117] text-[#1a1a1c] dark:text-[#f0f6fc] border-[#1a1a1c] dark:border-[#f0f6fc]'
            }`}
          >
            <span className="text-[11px] font-mono-code font-bold uppercase block opacity-80">
              Total Leaked Secrets
            </span>
            <span className="font-syne text-2xl font-extrabold mt-1 block">
              {totalCount}
            </span>
          </div>

          <div
            id="secret-filter-critical"
            onClick={() => setSelectedSeverity('CRITICAL')}
            className={`p-3.5 border-2 cursor-pointer transition-all ${
              selectedSeverity === 'CRITICAL'
                ? 'bg-[#fff1f2] text-[#cf222e] border-[#cf222e] ring-2 ring-[#cf222e] dark:bg-[#cf222e]/30 dark:text-[#ff7b72] dark:border-[#ff7b72]'
                : 'bg-[#f8f7f4] dark:bg-[#0f1117] text-[#1a1a1c] dark:text-[#f0f6fc] border-[#1a1a1c] dark:border-[#f0f6fc]'
            }`}
          >
            <span className="text-[11px] font-mono-code font-bold uppercase block text-[#cf222e] dark:text-[#ff7b72]">
              Critical (Live API / Cloud Keys)
            </span>
            <span className="font-syne text-2xl font-extrabold mt-1 block text-[#cf222e] dark:text-[#ff7b72]">
              {criticalCount}
            </span>
          </div>

          <div
            id="secret-filter-high"
            onClick={() => setSelectedSeverity('HIGH')}
            className={`p-3.5 border-2 cursor-pointer transition-all ${
              selectedSeverity === 'HIGH'
                ? 'bg-[#fff7ed] text-[#c2410c] border-[#ea580c] ring-2 ring-[#ea580c] dark:bg-orange-500/25 dark:text-orange-300 dark:border-orange-400'
                : 'bg-[#f8f7f4] dark:bg-[#0f1117] text-[#1a1a1c] dark:text-[#f0f6fc] border-[#1a1a1c] dark:border-[#f0f6fc]'
            }`}
          >
            <span className="text-[11px] font-mono-code font-bold uppercase block text-orange-700 dark:text-orange-400">
              High (Databases / Passwords)
            </span>
            <span className="font-syne text-2xl font-extrabold mt-1 block text-orange-700 dark:text-orange-400">
              {highCount}
            </span>
          </div>

          <div
            id="secret-filter-medium"
            onClick={() => setSelectedSeverity('MEDIUM')}
            className={`p-3.5 border-2 cursor-pointer transition-all ${
              selectedSeverity === 'MEDIUM'
                ? 'bg-[#fffbeb] text-[#b45309] border-[#d97706] ring-2 ring-[#d97706] dark:bg-amber-500/25 dark:text-amber-300 dark:border-amber-400'
                : 'bg-[#f8f7f4] dark:bg-[#0f1117] text-[#1a1a1c] dark:text-[#f0f6fc] border-[#1a1a1c] dark:border-[#f0f6fc]'
            }`}
          >
            <span className="text-[11px] font-mono-code font-bold uppercase block text-amber-700 dark:text-amber-400">
              Medium (Webhooks / Tokens)
            </span>
            <span className="font-syne text-2xl font-extrabold mt-1 block text-amber-700 dark:text-amber-400">
              {mediumCount}
            </span>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#57606a] dark:text-[#8b949e]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search secrets by provider, rule, file path (e.g. bin/cli.js), or env var..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] text-[#1a1a1c] dark:text-[#f0f6fc] placeholder-[#57606a] dark:placeholder-[#8b949e] font-sans font-medium focus:outline-hidden focus:ring-2 focus:ring-[#cf222e]"
          />
        </div>
      </div>

      {/* 2. Detected Secret Cards */}
      {filteredSecrets.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] shadow-xs">
          <Check className="w-10 h-10 text-[#2ea043] mx-auto mb-3" />
          <h4 className="font-syne text-base font-bold text-[#1a1a1c] dark:text-[#f0f6fc]">
            No Exposed Secrets Found
          </h4>
          <p className="font-mono-code text-xs text-[#57606a] dark:text-[#8b949e] mt-1.5 max-w-md mx-auto">
            {secrets.length === 0
              ? `No hardcoded API keys or database tokens detected in ${repoName}.`
              : 'No secrets matched the selected severity or search filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSecrets.map((secret) => {
            const isRevealed = Boolean(revealedIds[secret.id]);
            const displaySecret = isRevealed
              ? secret.rawMatchedSecret || secret.maskedSecret
              : secret.maskedSecret;

            return (
              <div
                key={secret.id}
                className="bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] p-5 shadow-xs space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {getSeverityBadge(secret.severity)}

                      <span className="font-mono-code text-xs font-bold bg-[#f0f2f5] dark:bg-[#21262d] px-2.5 py-0.5 border border-[#1a1a1c] dark:border-[#f0f6fc] text-[#1a1a1c] dark:text-[#f0f6fc]">
                        {secret.ruleId}
                      </span>

                      <span className="font-mono-code text-xs font-semibold text-[#57606a] dark:text-[#8b949e]">
                        {secret.category}
                      </span>
                    </div>

                    <h4 className="font-syne text-base sm:text-lg font-bold text-[#1a1a1c] dark:text-[#f0f6fc]">
                      {secret.title}
                    </h4>

                    <div className="flex items-center gap-2 text-xs font-mono-code text-[#57606a] dark:text-[#8b949e]">
                      <FileCode className="w-3.5 h-3.5 text-[#0969da] dark:text-[#58a6ff]" />
                      <span className="font-bold text-[#1a1a1c] dark:text-[#f0f6fc]">
                        {secret.filePath}
                      </span>
                      {secret.lineNumber && (
                        <span>: line {secret.lineNumber}</span>
                      )}
                    </div>
                  </div>

                  {secret.revocationUrl && (
                    <a
                      href={secret.revocationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono-code font-bold uppercase text-white bg-[#cf222e] hover:bg-[#b51d28] border border-[#1a1a1c] shrink-0"
                    >
                      <span>Rotate Key on {secret.providerName}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>

                <p className="text-sm font-sans text-[#24292f] dark:text-[#d0d7de]">
                  {secret.description}
                </p>

                {/* Secret String Inspection Box */}
                <div className="p-3 bg-[#0d1117] border-2 border-[#30363d] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono-code">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Key className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="text-slate-400">Captured Value:</span>
                    <span className="font-bold text-amber-300 tracking-wider truncate">
                      {displaySecret}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleReveal(secret.id)}
                      className="px-2.5 py-1 bg-[#21262d] hover:bg-[#30363d] text-slate-200 border border-[#30363d] flex items-center gap-1 transition-colors"
                      title={isRevealed ? 'Hide secret' : 'Reveal secret'}
                    >
                      {isRevealed ? (
                        <>
                          <EyeOff className="w-3 h-3" /> <span>Hide</span>
                        </>
                      ) : (
                        <>
                          <Eye className="w-3 h-3" /> <span>Reveal</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => copyToClipboard(secret.rawMatchedSecret || secret.maskedSecret, secret.id)}
                      className="px-2.5 py-1 bg-[#21262d] hover:bg-[#30363d] text-slate-200 border border-[#30363d] flex items-center gap-1 transition-colors"
                    >
                      {copiedId === secret.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Source Context Snippet */}
                {secret.snippet && (
                  <div className="space-y-1">
                    <div className="text-[11px] font-mono-code font-bold uppercase text-[#57606a] dark:text-[#8b949e]">
                      Source Code Context:
                    </div>
                    <pre className="p-3 bg-[#161b22] text-slate-200 text-xs font-mono-code border border-[#30363d] overflow-x-auto leading-relaxed">
                      <code>{secret.snippet}</code>
                    </pre>
                  </div>
                )}

                {/* Remediation & Environment Variable Recipe */}
                <div className="p-3.5 bg-[#f8f7f4] dark:bg-[#0f1117] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono-code font-bold uppercase text-[#1a7f37] dark:text-[#3fb950] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Recommended 1-Click Refactor:</span>
                    </span>
                    <span className="text-[11px] font-mono-code text-[#57606a] dark:text-[#8b949e]">
                      Move to process.env.{secret.envVarName}
                    </span>
                  </div>

                  <div className="p-2.5 bg-[#0d1117] text-emerald-400 text-xs font-mono-code border border-[#30363d] flex items-center justify-between gap-3 overflow-x-auto">
                    <code>{secret.recommendedRefactor}</code>
                    <button
                      onClick={() => copyToClipboard(secret.recommendedRefactor, `refactor_${secret.id}`)}
                      className="text-slate-400 hover:text-white px-2 py-0.5 border border-slate-700 bg-slate-800 shrink-0"
                    >
                      {copiedId === `refactor_${secret.id}` ? 'Copied' : 'Copy'}
                    </button>
                  </div>

                  <div className="text-[11px] font-mono-code text-[#57606a] dark:text-[#8b949e]">
                    Add <code className="text-[#0969da] dark:text-[#58a6ff] font-bold">{secret.envVarName}=your_{secret.envVarName.toLowerCase()}_here</code> to your <code className="font-bold">.env.example</code> and add <code className="font-bold">.env</code> to <code className="font-bold">.gitignore</code>.
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 3. Live Interactive Secret Sniffer Tester */}
      <div className="bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b-2 border-[#1a1a1c] dark:border-[#f0f6fc]">
          <Terminal className="w-4 h-4 text-[#0969da]" />
          <h4 className="font-syne text-base font-bold text-[#1a1a1c] dark:text-[#f0f6fc]">
            Live Secret Sniffer (Test Snippet or Custom Key)
          </h4>
        </div>

        <p className="text-xs font-mono-code text-[#57606a] dark:text-[#8b949e]">
          Paste code or configuration blocks below to test our real-time pattern and entropy recognition engine:
        </p>

        <textarea
          rows={4}
          value={customSnippet}
          onChange={(e) => setCustomSnippet(e.target.value)}
          placeholder={`// Paste snippet here to test:\nconst gemini = new GoogleGenAI({ apiKey: 'AIzaSyD-sample...' });\nconst stripe = new Stripe('sk_live_sample...');`}
          className="w-full p-3 font-mono-code text-xs bg-[#0d1117] text-slate-100 border-2 border-[#1a1a1c] dark:border-[#f0f6fc] focus:outline-hidden focus:ring-2 focus:ring-[#0969da]"
        />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                setCustomSnippet(
                  `const geminiKey = 'AIzaSyD-9xK11049583492817492837492019aB';\nconst openai = 'sk-proj-9A8b7C6d5E4f3G2h1I0jKlMnOpQrStUvWxYz1234567890abcdef';\nconst aws = 'AKIAIOSFODNN7EXAMPLE';`
                )
              }
              className="text-xs font-mono-code text-[#0969da] dark:text-[#58a6ff] hover:underline"
            >
              Insert Sample Leaks
            </button>
            <span className="text-xs text-slate-400">•</span>
            <button
              onClick={() => {
                setCustomSnippet('');
                setCustomScanResults(null);
              }}
              className="text-xs font-mono-code text-slate-500 hover:underline"
            >
              Clear
            </button>
          </div>

          <button
            onClick={handleRunCustomScan}
            disabled={isScanningCustom || !customSnippet.trim()}
            className="px-4 py-2 text-xs font-mono-code font-bold uppercase tracking-wider text-white bg-[#1a1a1c] hover:bg-[#30363d] dark:bg-[#f0f6fc] dark:text-[#0f1117] dark:hover:bg-white border-2 border-[#1a1a1c] dark:border-[#f0f6fc] disabled:opacity-50 transition-colors"
          >
            {isScanningCustom ? 'Scanning...' : 'Scan Snippet for Secrets'}
          </button>
        </div>

        {customScanResults && (
          <div className="mt-4 p-4 bg-[#f8f7f4] dark:bg-[#0f1117] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] space-y-2">
            <div className="text-xs font-mono-code font-bold text-[#1a1a1c] dark:text-[#f0f6fc] flex items-center justify-between">
              <span>Scan Results:</span>
              <span className={customScanResults.length > 0 ? 'text-[#cf222e]' : 'text-[#1a7f37]'}>
                {customScanResults.length} {customScanResults.length === 1 ? 'Secret' : 'Secrets'} Detected
              </span>
            </div>

            {customScanResults.length === 0 ? (
              <p className="text-xs font-mono-code text-[#1a7f37] dark:text-[#3fb950]">
                Clean: No recognized API keys, database credentials, or private keys found in snippet.
              </p>
            ) : (
              <div className="space-y-2 mt-2">
                {customScanResults.map((s, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 bg-white dark:bg-[#161b22] border border-[#1a1a1c] dark:border-[#f0f6fc] text-xs font-mono-code flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <span className="font-bold text-[#cf222e]">{s.category}: </span>
                      <span className="text-slate-600 dark:text-slate-300">{s.maskedSecret}</span>
                    </div>
                    <span className="text-[11px] bg-[#0d1117] text-emerald-400 px-2 py-0.5 border border-slate-700">
                      process.env.{s.envVarName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {onProceedToRemediation && (
          <div className="mt-6 pt-5 border-t-2 border-[#1a1a1c] dark:border-[#f0f6fc] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs font-mono-code text-[#57606a] dark:text-[#8b949e]">
              Ready to generate code fixes, revoke credentials, and patch vulnerable dependencies?
            </div>
            <button
              id="bottom-proceed-remediation-btn"
              onClick={onProceedToRemediation}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-mono-code font-bold uppercase tracking-wider text-white bg-[#2ea043] hover:bg-[#2c9740] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] shadow-xs transition-opacity"
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>Proceed to 04. Remediation Diff</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
