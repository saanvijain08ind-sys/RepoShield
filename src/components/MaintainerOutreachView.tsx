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
        className="bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] p-6 shadow-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-[#1a1a1c] dark:border-[#f0f6fc]">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 shrink-0">
              <Heart className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="label-mono text-purple-600 dark:text-purple-400">
                  Supportive & Educational
                </span>
                <span className="text-xs font-mono-code text-[#1a1a1c]/60 dark:text-[#f0f6fc]/60">
                  • Zero blame, celebratory outreach
                </span>
              </div>
              <h3 className="font-syne text-xl font-extrabold uppercase tracking-tight text-[#1a1a1c] dark:text-[#f0f6fc] mt-1">
                Maintainer Outreach & 1-Click Fix PR Generator
              </h3>
              <p className="text-xs font-mono-code text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 mt-1">
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
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono-code font-bold uppercase tracking-wider text-white bg-[#1a1a1c] hover:bg-black dark:bg-[#f0f6fc] dark:text-[#0f1117] dark:hover:bg-white border border-[#1a1a1c] dark:border-[#f0f6fc] shadow-xs transition-opacity"
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
            <div className="flex flex-wrap items-center gap-1 bg-[#f8f7f4] dark:bg-[#0f1117] p-1 border-2 border-[#1a1a1c] dark:border-[#f0f6fc]">
              <button
                onClick={() => setActiveOutreachTab('issue')}
                className={`px-3 py-1.5 text-xs font-mono-code font-bold uppercase transition-colors flex items-center gap-1.5 ${
                  activeOutreachTab === 'issue'
                    ? 'bg-[#1a1a1c] text-white dark:bg-[#f0f6fc] dark:text-[#0f1117]'
                    : 'text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 hover:text-[#1a1a1c]'
                }`}
              >
                <Github className="w-3.5 h-3.5" />
                <span>GitHub Issue Draft</span>
              </button>

              <button
                onClick={() => setActiveOutreachTab('email')}
                className={`px-3 py-1.5 text-xs font-mono-code font-bold uppercase transition-colors flex items-center gap-1.5 ${
                  activeOutreachTab === 'email'
                    ? 'bg-[#1a1a1c] text-white dark:bg-[#f0f6fc] dark:text-[#0f1117]'
                    : 'text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 hover:text-[#1a1a1c]'
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>Maintainer Email</span>
              </button>

              <button
                onClick={() => setActiveOutreachTab('pr')}
                className={`px-3 py-1.5 text-xs font-mono-code font-bold uppercase transition-colors flex items-center gap-1.5 ${
                  activeOutreachTab === 'pr'
                    ? 'bg-[#1a1a1c] text-white dark:bg-[#f0f6fc] dark:text-[#0f1117]'
                    : 'text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 hover:text-[#1a1a1c]'
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
              className="px-3.5 py-1.5 text-xs font-mono-code font-bold uppercase text-[#1a1a1c] dark:text-[#f0f6fc] bg-white dark:bg-[#161b22] hover:bg-[#f0f6fc] dark:hover:bg-[#21262d] border border-[#1a1a1c] dark:border-[#f0f6fc] transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              {copiedSection === 'outreach' ? (
                <>
                  <Check className="w-3 h-3 text-[#2ea043]" />
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
          <div className="p-4 bg-[#f8f7f4] dark:bg-[#0d1117] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] text-xs font-mono-code text-[#1a1a1c] dark:text-[#e6edf3] whitespace-pre-wrap leading-relaxed max-h-80 overflow-y-auto">
            {activeOutreachTab === 'issue' && (
              <div>
                <div className="font-bold text-[#2ea043] pb-2 mb-2 border-b border-[#1a1a1c]/20 dark:border-[#f0f6fc]/20">
                  Title: {outreachDraft.githubIssueTitle}
                </div>
                {outreachDraft.githubIssueMarkdown}
              </div>
            )}

            {activeOutreachTab === 'email' && (
              <div>
                <div className="font-bold text-[#2ea043] pb-2 mb-2 border-b border-[#1a1a1c]/20 dark:border-[#f0f6fc]/20">
                  Subject: {outreachDraft.subject}
                </div>
                {outreachDraft.body}
              </div>
            )}

            {activeOutreachTab === 'pr' && (
              <div>
                <div className="font-bold text-[#2ea043] pb-2 mb-2 border-b border-[#1a1a1c]/20 dark:border-[#f0f6fc]/20">
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
        className="bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] p-6 shadow-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-[#1a1a1c] dark:border-[#f0f6fc]">
          <div className="flex items-start gap-3">
            <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="label-mono text-[#2ea043]">
                  Zero-Friction Infrastructure
                </span>
                <span className="text-xs font-mono-code text-[#1a1a1c]/60 dark:text-[#f0f6fc]/60">
                  • Instant GitHub repo files
                </span>
              </div>
              <h3 className="font-syne text-xl font-extrabold uppercase tracking-tight text-[#1a1a1c] dark:text-[#f0f6fc] mt-1">
                One-Click Security Blueprint
              </h3>
              <p className="text-xs font-mono-code text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 mt-1">
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
              className="px-4 py-2 text-xs font-mono-code font-bold uppercase tracking-wider text-white bg-[#2ea043] hover:bg-[#2c9740] border border-[#1a1a1c] dark:border-[#f0f6fc] shadow-xs transition-opacity flex items-center gap-2"
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
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <button
              onClick={() => setActiveBlueprintTab('securityMd')}
              className={`px-3 py-1.5 text-xs font-mono-code font-bold uppercase transition-colors flex items-center gap-1.5 ${
                activeBlueprintTab === 'securityMd'
                  ? 'bg-[#1a1a1c] text-white dark:bg-[#f0f6fc] dark:text-[#0f1117]'
                  : 'text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 hover:text-[#1a1a1c]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>SECURITY.md (Responsible Disclosure Policy)</span>
            </button>

            <button
              onClick={() => setActiveBlueprintTab('dependabot')}
              className={`px-3 py-1.5 text-xs font-mono-code font-bold uppercase transition-colors flex items-center gap-1.5 ${
                activeBlueprintTab === 'dependabot'
                  ? 'bg-[#1a1a1c] text-white dark:bg-[#f0f6fc] dark:text-[#0f1117]'
                  : 'text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 hover:text-[#1a1a1c]'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>.github/dependabot.yml (Automated Bot)</span>
            </button>
          </div>

          <div className="p-4 bg-[#0d1117] font-mono-code text-xs text-slate-200 overflow-x-auto max-h-80 border-2 border-[#1a1a1c] dark:border-[#f0f6fc]">
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
