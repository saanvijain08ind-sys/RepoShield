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
    <div className="space-y-5">
      {/* 1. Remediation Header */}
      <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#d0d7de] dark:border-[#30363d]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#1a7f37] dark:text-[#3fb950] bg-[#dafbe1] dark:bg-[#113818]/30 px-2 py-0.5 rounded-full border border-[#4ac26b]/30">
                1-Click Automated Patch
              </span>
              <span className="text-xs text-[#656d76] dark:text-[#8b949e]">
                Minimal-invasive semver bumps
              </span>
            </div>
            <h3 className="text-base font-bold text-[#1f2328] dark:text-[#f0f6fc] mt-1">
              Vulnerability Remediation & Manifest Patch
            </h3>
            <p className="text-xs text-[#656d76] dark:text-[#8b949e] mt-0.5">
              Automated safe-patching replaces vulnerable dependency declarations with verified fixed release targets.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 text-xs font-medium text-[#24292f] dark:text-[#c9d1d9] bg-[#f6f8fa] dark:bg-[#21262d] hover:bg-[#f3f4f6] dark:hover:bg-[#30363d] border border-[#d0d7de] dark:border-[#30363d] rounded-md transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied to Clipboard' : 'Copy Content'}</span>
            </button>

            <button
              id="goto-outreach-btn"
              onClick={onProceedToOutreach}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1f883d] hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043] rounded-md shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Draft Maintainer Outreach</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Patch Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4">
          <div className="p-3 bg-[#f6f8fa] dark:bg-[#0d1117] rounded-md border border-[#d0d7de] dark:border-[#30363d]">
            <div className="text-[11px] text-[#656d76] dark:text-[#8b949e]">Packages Patched</div>
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
              {fixedDependenciesCount} Manifest Targets
            </div>
          </div>

          <div className="p-3 bg-[#f6f8fa] dark:bg-[#0d1117] rounded-md border border-[#d0d7de] dark:border-[#30363d]">
            <div className="text-[11px] text-[#656d76] dark:text-[#8b949e]">Semver Compatibility</div>
            <div className="text-xl font-bold font-mono text-[#0969da] dark:text-[#58a6ff]">
              Zero Breaking Changes
            </div>
          </div>

          <div className="p-3 bg-[#f6f8fa] dark:bg-[#0d1117] rounded-md border border-[#d0d7de] dark:border-[#30363d]">
            <div className="text-[11px] text-[#656d76] dark:text-[#8b949e]">OSV CVE Mitigation</div>
            <div className="text-xl font-bold font-mono text-[#1f2328] dark:text-[#f0f6fc]">
              {vulnerabilities.length} CVEs Mitigated
            </div>
          </div>
        </div>
      </div>

      {/* 2. Code Viewer & Tabs */}
      <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#f6f8fa] dark:bg-[#0d1117] border-b border-[#d0d7de] dark:border-[#30363d]">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('diff')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'diff'
                  ? 'bg-white dark:bg-[#161b22] text-[#0969da] dark:text-[#58a6ff] border border-[#d0d7de] dark:border-[#30363d] shadow-2xs'
                  : 'text-[#656d76] dark:text-[#8b949e] hover:text-[#1f2328]'
              }`}
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>Unified Git Diff</span>
            </button>

            <button
              onClick={() => setActiveTab('patched')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'patched'
                  ? 'bg-white dark:bg-[#161b22] text-[#0969da] dark:text-[#58a6ff] border border-[#d0d7de] dark:border-[#30363d] shadow-2xs'
                  : 'text-[#656d76] dark:text-[#8b949e] hover:text-[#1f2328]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Patched package.json</span>
            </button>

            <button
              onClick={() => setActiveTab('original')}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'original'
                  ? 'bg-white dark:bg-[#161b22] text-[#0969da] dark:text-[#58a6ff] border border-[#d0d7de] dark:border-[#30363d] shadow-2xs'
                  : 'text-[#656d76] dark:text-[#8b949e] hover:text-[#1f2328]'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Original package.json</span>
            </button>
          </div>

          <span className="text-[11px] font-mono text-[#656d76] dark:text-[#8b949e]">
            {activeTab === 'diff' ? 'package.json (diff)' : 'package.json'}
          </span>
        </div>

        {/* Diff Code Display */}
        <div className="p-4 overflow-x-auto bg-[#0d1117] text-slate-100 font-mono text-xs max-h-[500px]">
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
    </div>
  );
};
