import React, { useState } from 'react';
import {
  Sparkles,
  GitPullRequest,
  ShieldCheck,
  Mail,
  Copy,
  Check,
  ExternalLink,
  Github,
  FileText,
  FileCode,
  Heart,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { ProjectAnalysis } from '../types/index.ts';

interface MaintainerOutreachViewProps {
  analysis: ProjectAnalysis;
}

export const MaintainerOutreachView: React.FC<MaintainerOutreachViewProps> = ({ analysis }) => {
  const { outreachDraft, securityBlueprint, owner, repo, repoUrl, milestones } = analysis;

  const [activeOutreachTab, setActiveOutreachTab] = useState<'issue' | 'email' | 'pr'>('issue');
  const [activeBlueprintTab, setActiveBlueprintTab] = useState<'securityMd' | 'dependabot'>('securityMd');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  // Generate GitHub New Issue URL with pre-filled title & body
  const githubNewIssueUrl = `https://github.com/${owner}/${repo}/issues/new?title=${encodeURIComponent(
    outreachDraft.githubIssueTitle
  )}&body=${encodeURIComponent(outreachDraft.githubIssueMarkdown)}`;

  return (
    <div className="space-y-6">
      {/* 1. Low-Pressure, Celebratory Outreach Card */}
      <div
        id="maintainer-outreach-card"
        className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-5 shadow-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#d0d7de] dark:border-[#30363d]">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-500/20">
                  Supportive & Educational
                </span>
                <span className="text-xs text-[#656d76] dark:text-[#8b949e]">
                  Zero blame, 100% celebratory outreach
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1f2328] dark:text-[#f0f6fc] mt-1">
                Maintainer Outreach & 1-Click Fix PR Generator
              </h3>
              <p className="text-xs text-[#656d76] dark:text-[#8b949e] mt-0.5">
                Maintainers build hobby projects for fun. When an ecosystem goes viral, low-pressure outreach with turn-key fixes protects developers without triggering maintainer burnout.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              id="open-github-issue-btn"
              href={githubNewIssueUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#0969da] hover:bg-[#0860ca] dark:bg-[#1f6feb] dark:hover:bg-[#388bfd] rounded-md shadow-xs transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              <span>Open Issue on GitHub</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Tab Selection: GitHub Issue vs Email vs PR Body */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1 bg-[#f6f8fa] dark:bg-[#0d1117] p-1 rounded-md border border-[#d0d7de] dark:border-[#30363d]">
              <button
                onClick={() => setActiveOutreachTab('issue')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeOutreachTab === 'issue'
                    ? 'bg-white dark:bg-[#21262d] text-[#1f2328] dark:text-[#f0f6fc] shadow-2xs font-semibold'
                    : 'text-[#656d76] dark:text-[#8b949e]'
                }`}
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub Issue Draft</span>
              </button>

              <button
                onClick={() => setActiveOutreachTab('email')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeOutreachTab === 'email'
                    ? 'bg-white dark:bg-[#21262d] text-[#1f2328] dark:text-[#f0f6fc] shadow-2xs font-semibold'
                    : 'text-[#656d76] dark:text-[#8b949e]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Maintainer Email</span>
              </button>

              <button
                onClick={() => setActiveOutreachTab('pr')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                  activeOutreachTab === 'pr'
                    ? 'bg-white dark:bg-[#21262d] text-[#1f2328] dark:text-[#f0f6fc] shadow-2xs font-semibold'
                    : 'text-[#656d76] dark:text-[#8b949e]'
                }`}
              >
                <GitPullRequest className="w-3.5 h-3.5" />
                <span>Pull Request Description</span>
              </button>
            </div>

            <button
              onClick={() => {
                const text =
                  activeOutreachTab === 'issue'
                    ? outreachDraft.githubIssueMarkdown
                    : activeOutreachTab === 'email'
                    ? outreachDraft.body
                    : `${outreachDraft.prTitle}\n\n${outreachDraft.prBody}`;
                copyToClipboard(text, 'outreach');
              }}
              className="px-2.5 py-1 text-xs font-medium text-[#24292f] dark:text-[#c9d1d9] bg-[#f6f8fa] dark:bg-[#21262d] hover:bg-[#f3f4f6] dark:hover:bg-[#30363d] border border-[#d0d7de] dark:border-[#30363d] rounded-md transition-colors flex items-center gap-1.5"
            >
              {copiedSection === 'outreach' ? (
                <>
                  <Check className="w-3 h-3 text-emerald-500" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Text</span>
                </>
              )}
            </button>
          </div>

          {/* Draft Preview Box */}
          <div className="p-4 bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-xs font-mono text-[#1f2328] dark:text-[#e6edf3] whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
            {activeOutreachTab === 'issue' && (
              <div>
                <div className="font-bold text-[#0969da] dark:text-[#58a6ff] pb-2 mb-2 border-b border-[#d0d7de] dark:border-[#30363d]">
                  Title: {outreachDraft.githubIssueTitle}
                </div>
                {outreachDraft.githubIssueMarkdown}
              </div>
            )}

            {activeOutreachTab === 'email' && (
              <div>
                <div className="font-bold text-[#0969da] dark:text-[#58a6ff] pb-2 mb-2 border-b border-[#d0d7de] dark:border-[#30363d]">
                  Subject: {outreachDraft.subject}
                </div>
                {outreachDraft.body}
              </div>
            )}

            {activeOutreachTab === 'pr' && (
              <div>
                <div className="font-bold text-[#0969da] dark:text-[#58a6ff] pb-2 mb-2 border-b border-[#d0d7de] dark:border-[#30363d]">
                  PR Title: {outreachDraft.prTitle}
                </div>
                {outreachDraft.prBody}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. One-Click Security Blueprint Card */}
      <div
        id="security-blueprint-card"
        className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-5 shadow-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#d0d7de] dark:border-[#30363d]">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Zero-Friction Infrastructure
                </span>
                <span className="text-xs text-[#656d76] dark:text-[#8b949e]">
                  Instant GitHub configuration files
                </span>
              </div>
              <h3 className="text-base font-bold text-[#1f2328] dark:text-[#f0f6fc] mt-1">
                One-Click Security Blueprint
              </h3>
              <p className="text-xs text-[#656d76] dark:text-[#8b949e] mt-0.5">
                Drop these pre-configured files directly into your repository root to establish a responsible security disclosure channel and automated vulnerability monitoring.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                const text =
                  activeBlueprintTab === 'securityMd'
                    ? securityBlueprint.securityMd
                    : securityBlueprint.dependabotYml;
                copyToClipboard(text, 'blueprint');
              }}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-[#1f883d] hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043] rounded-md shadow-xs transition-colors flex items-center gap-1.5"
            >
              {copiedSection === 'blueprint' ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>
                    Copy {activeBlueprintTab === 'securityMd' ? 'SECURITY.md' : '.github/dependabot.yml'}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Blueprint Tabs & Code */}
        <div className="pt-4">
          <div className="flex items-center gap-2 mb-3">
            <button
              onClick={() => setActiveBlueprintTab('securityMd')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeBlueprintTab === 'securityMd'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/30'
                  : 'text-[#656d76] dark:text-[#8b949e] hover:text-[#1f2328]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>SECURITY.md (Responsible Disclosure Policy)</span>
            </button>

            <button
              onClick={() => setActiveBlueprintTab('dependabot')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
                activeBlueprintTab === 'dependabot'
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/30'
                  : 'text-[#656d76] dark:text-[#8b949e] hover:text-[#1f2328]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>.github/dependabot.yml (Automated Bot)</span>
            </button>
          </div>

          <div className="p-4 bg-[#0d1117] rounded-md font-mono text-xs text-slate-200 overflow-x-auto max-h-80 border border-[#30363d]">
            <pre className="whitespace-pre-wrap leading-relaxed">
              <code>
                {activeBlueprintTab === 'securityMd'
                  ? securityBlueprint.securityMd
                  : securityBlueprint.dependabotYml}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
