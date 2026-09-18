import React, { useState } from 'react';
import {
  GitPullRequest,
  CheckCircle2,
  Copy,
  Check,
  Code2,
  FileCode,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Terminal,
  ArrowRight,
  Key,
  Lock,
  ShieldAlert,
} from 'lucide-react';
import { ProjectAnalysis } from '../types/index.ts';

interface RemediationDiffViewProps {
  analysis: ProjectAnalysis;
  onProceedToOutreach: () => void;
}

export const RemediationDiffView: React.FC<RemediationDiffViewProps> = ({
  analysis,
  onProceedToOutreach,
}) => {
  const {
    gitDiff,
    updatedPackageJson,
    rawPackageJson,
    fixedDependenciesCount,
    vulnerabilities,
    owner,
    repo,
    repoUrl,
  } = analysis;

  const [activeTab, setActiveTab] = useState<'diff' | 'patched' | 'original'>('diff');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = activeTab === 'diff' ? gitDiff : activeTab === 'patched' ? updatedPackageJson : rawPackageJson;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Split diff into formatted lines
  const diffLines = (gitDiff || '').split('\n');

  return (
    <div className="space-y-6">
      {/* 1. Remediation Header */}
      <div className="bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-[#1a1a1c] dark:border-[#f0f6fc]">
          <div>
            <div className="flex items-center gap-2">
              <span className="label-mono text-[#2ea043]">
                1-Click Automated Patch
              </span>
              <span className="text-xs font-mono-code text-[#1a1a1c]/60 dark:text-[#f0f6fc]/60">
                • Minimal-invasive bumps
              </span>
            </div>
            <h3 className="font-syne text-xl font-extrabold uppercase tracking-tight text-[#1a1a1c] dark:text-[#f0f6fc] mt-1">
              Vulnerability Remediation & Manifest Patch
            </h3>
            <p className="text-xs font-mono-code text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 mt-1">
              Automated safe-patching replaces vulnerable dependency declarations with verified fixed release targets.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 text-xs font-mono-code font-bold uppercase text-[#1a1a1c] dark:text-[#f0f6fc] bg-white dark:bg-[#161b22] hover:bg-[#f0f6fc] dark:hover:bg-[#21262d] border border-[#1a1a1c] dark:border-[#f0f6fc] transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#2ea043]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              id="goto-outreach-btn"
              onClick={onProceedToOutreach}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono-code font-bold uppercase tracking-wider text-white bg-[#2ea043] hover:bg-[#2c9740] border border-[#1a1a1c] dark:border-[#f0f6fc] shadow-xs transition-opacity"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Draft Maintainer Outreach</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Patch Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div className="p-4 bg-[#f8f7f4] dark:bg-[#0f1117] border-2 border-[#1a1a1c] dark:border-[#f0f6fc]">
            <div className="label-mono">Packages Patched</div>
            <div className="font-syne text-2xl font-extrabold text-[#2ea043] mt-1">
              {fixedDependenciesCount} Targets
            </div>
          </div>

          <div className="p-4 bg-[#f8f7f4] dark:bg-[#0f1117] border-2 border-[#1a1a1c] dark:border-[#f0f6fc]">
            <div className="label-mono">Semver Compatibility</div>
            <div className="font-syne text-2xl font-extrabold text-[#1a1a1c] dark:text-[#f0f6fc] mt-1">
              Zero Breaking
            </div>
          </div>

          <div className="p-4 bg-[#f8f7f4] dark:bg-[#0f1117] border-2 border-[#1a1a1c] dark:border-[#f0f6fc]">
            <div className="label-mono">OSV CVE Mitigation</div>
            <div className="font-syne text-2xl font-extrabold text-[#1a1a1c] dark:text-[#f0f6fc] mt-1">
              {vulnerabilities.length} Mitigated
            </div>
          </div>
        </div>
      </div>

      {/* 2. Code Viewer & Tabs */}
      <div className="bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#f8f7f4] dark:bg-[#0f1117] border-b-2 border-[#1a1a1c] dark:border-[#f0f6fc]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('diff')}
              className={`px-3 py-1.5 text-xs font-mono-code font-bold uppercase transition-colors flex items-center gap-1.5 ${
                activeTab === 'diff'
                  ? 'bg-[#1a1a1c] text-white dark:bg-[#f0f6fc] dark:text-[#0f1117]'
                  : 'text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 hover:text-[#1a1a1c]'
              }`}
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>Unified Git Diff</span>
            </button>

            <button
              onClick={() => setActiveTab('patched')}
              className={`px-3 py-1.5 text-xs font-mono-code font-bold uppercase transition-colors flex items-center gap-1.5 ${
                activeTab === 'patched'
                  ? 'bg-[#1a1a1c] text-white dark:bg-[#f0f6fc] dark:text-[#0f1117]'
                  : 'text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 hover:text-[#1a1a1c]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Patched package.json</span>
            </button>

            <button
              onClick={() => setActiveTab('original')}
              className={`px-3 py-1.5 text-xs font-mono-code font-bold uppercase transition-colors flex items-center gap-1.5 ${
                activeTab === 'original'
                  ? 'bg-[#1a1a1c] text-white dark:bg-[#f0f6fc] dark:text-[#0f1117]'
                  : 'text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 hover:text-[#1a1a1c]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Original package.json</span>
            </button>
          </div>

          <span className="text-[11px] font-mono-code text-[#1a1a1c]/60 dark:text-[#f0f6fc]/60">
            {activeTab === 'diff' ? 'package.json (diff)' : 'package.json'}
          </span>
        </div>

        {/* Diff Code Display */}
        <div className="p-4 overflow-x-auto bg-[#0d1117] text-slate-100 font-mono-code text-xs max-h-[500px]">
          {activeTab === 'diff' && (
            <pre className="space-y-0.5">
              {diffLines.map((line, idx) => {
                let color = 'text-slate-400';
                let bg = '';
                if (line.startsWith('+') && !line.startsWith('+++')) {
                  color = 'text-emerald-400 font-semibold';
                  bg = 'bg-emerald-950/40 -mx-4 px-4 block';
                } else if (line.startsWith('-') && !line.startsWith('---')) {
                  color = 'text-rose-400 font-semibold';
                  bg = 'bg-rose-950/40 -mx-4 px-4 block';
                } else if (line.startsWith('@@')) {
                  color = 'text-blue-400';
                }

                return (
                  <div key={idx} className={`${bg} ${color}`}>
                    {line}
                  </div>
                );
              })}
            </pre>
          )}

          {activeTab === 'patched' && (
            <pre className="text-emerald-400">
              <code>{updatedPackageJson}</code>
            </pre>
          )}

          {activeTab === 'original' && (
            <pre className="text-slate-300">
              <code>{rawPackageJson}</code>
            </pre>
          )}
        </div>
      </div>

      {/* 3. Exposed Secrets & Hardening Guidance (when secrets are detected) */}
      {analysis.exposedSecrets && analysis.exposedSecrets.length > 0 && (
        <div className="bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b-2 border-[#1a1a1c] dark:border-[#f0f6fc]">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-[#cf222e]" />
              <h4 className="font-syne text-base sm:text-lg font-bold text-[#1a1a1c] dark:text-[#f0f6fc]">
                Secret Hardening &amp; Credential Rotation Checklist ({analysis.exposedSecrets.length})
              </h4>
            </div>
            <span className="px-2.5 py-0.5 text-xs font-mono-code font-bold uppercase bg-[#cf222e] text-white">
              Required Before Merge
            </span>
          </div>

          <p className="text-xs font-sans text-[#24292f] dark:text-[#d0d7de]">
            Hardcoded credentials cannot be safeguarded by updating dependency versions alone. Follow this automated hardening checklist to remove credentials from git history:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.exposedSecrets.map((secret) => (
              <div
                key={secret.id}
                className="p-3.5 bg-[#f8f7f4] dark:bg-[#0f1117] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] space-y-2 text-xs font-mono-code"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#cf222e] dark:text-[#ff7b72]">
                    {secret.category}
                  </span>
                  <span className="text-[10px] bg-[#0d1117] text-slate-300 px-2 py-0.5 border border-slate-700">
                    {secret.filePath}
                  </span>
                </div>

                <div className="text-slate-600 dark:text-slate-400">
                  Value: <span className="font-bold text-amber-500">{secret.maskedSecret}</span>
                </div>

                <div className="p-2 bg-[#0d1117] text-emerald-400 border border-slate-700 overflow-x-auto">
                  <code>{secret.recommendedRefactor}</code>
                </div>

                <div className="text-[11px] text-[#57606a] dark:text-[#8b949e]">
                  1. Revoke on <span className="font-semibold">{secret.providerName}</span>.<br />
                  2. Store as <code className="font-bold text-[#0969da] dark:text-[#58a6ff]">{secret.envVarName}</code> in secret store.
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#0d1117] border border-[#30363d] text-xs font-mono-code text-slate-200 flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Git History Scrub: <code className="text-amber-300">git filter-repo --replace-text expressions.txt</code> or use <code className="text-amber-300">BFG Repo-Cleaner</code></span>
          </div>
        </div>
      )}
    </div>
  );
};
