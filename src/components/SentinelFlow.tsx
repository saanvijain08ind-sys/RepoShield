import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  ShieldAlert,
  GitPullRequest,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Layers,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Users,
  Code2,
  Package,
} from 'lucide-react';
import { SentinelSearchBar } from './SentinelSearchBar.tsx';
import { MilestoneTrackerView } from './MilestoneTrackerView.tsx';
import { AuditScannerView } from './AuditScannerView.tsx';
import { RemediationDiffView } from './RemediationDiffView.tsx';
import { MaintainerOutreachView } from './MaintainerOutreachView.tsx';
import { ProjectAnalysis } from '../types/index.ts';

export type SentinelTab = 'milestones' | 'scanner' | 'remediation' | 'outreach';

interface SentinelFlowProps {
  currentRepo?: string;
  onRepoChange?: (repoName: string) => void;
  onOpenTestSuite?: () => void;
}

export const SentinelFlow: React.FC<SentinelFlowProps> = ({
  currentRepo = 'superprompt-cli',
  onRepoChange,
  onOpenTestSuite,
}) => {
  const [activeTab, setActiveTab] = useState<SentinelTab>('milestones');
  const [targetInput, setTargetInput] = useState<string>(currentRepo);
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Perform project analysis via /api/sentinel/analyze
  const handleAnalyze = async (target: string) => {
    try {
      setLoading(true);
      setError(null);
      setTargetInput(target);
      onRepoChange?.(target);

      const res = await fetch('/api/sentinel/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        const resolvedName =
          data.analysis.packageName ||
          data.analysis.packageManifest?.name ||
          target;
        onRepoChange?.(resolvedName);
      } else {
        throw new Error(data.error || 'Failed to analyze target');
      }
    } catch (err: any) {
      setError(err.message || 'Error executing OSV analysis');
    } finally {
      setLoading(false);
    }
  };

  // Initial load on mount
  useEffect(() => {
    handleAnalyze(currentRepo || 'superprompt-cli');
  }, []);

  const tabs: Array<{
    id: SentinelTab;
    step: string;
    label: string;
    icon: React.ElementType;
    badge?: string;
  }> = [
    {
      id: 'milestones',
      step: '01.',
      label: 'Milestone Tracker',
      icon: TrendingUp,
      badge: analysis?.milestones.thresholdExceeded ? 'Exceeded' : undefined,
    },
    {
      id: 'scanner',
      step: '02.',
      label: 'Audit Scanner',
      icon: ShieldAlert,
      badge: analysis
        ? `${analysis.vulnerabilities.length} CVEs${
            analysis.exposedSecrets && analysis.exposedSecrets.length > 0
              ? ` • ${analysis.exposedSecrets.length} Secrets`
              : ''
          }`
        : undefined,
    },
    {
      id: 'remediation',
      step: '03.',
      label: 'Remediation',
      icon: GitPullRequest,
      badge: analysis ? `${analysis.fixedDependenciesCount} Patches` : undefined,
    },
    {
      id: 'outreach',
      step: '04.',
      label: 'Outreach & PR',
      icon: Sparkles,
      badge: 'Drafted',
    },
  ];

  return (
    <main className="w-full max-w-7xl mx-auto border-b-2 border-[#1a1a1c] dark:border-[#f0f6fc] min-h-[calc(100vh-140px)]">
      {/* Content Area */}
      <section className="p-6 sm:p-8 lg:p-10 flex flex-col space-y-8">
        {/* Hero Section with Search Input */}
        <div className="hero-section">
          <SentinelSearchBar
            onAnalyze={handleAnalyze}
            isLoading={loading}
            activeTarget={targetInput}
          />

          {/* Error state if any */}
          {error && (
            <div className="mt-4 p-4 bg-[#fff8f8] border-2 border-[#cf222e] text-[#cf222e] font-mono-code text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => handleAnalyze('superprompt-cli')}
                className="underline font-bold"
              >
                Reset to SuperPrompt CLI Demo
              </button>
            </div>
          )}
        </div>

        {/* Workflow Section */}
        <div className="workflow-section">
          <div className="tabs flex flex-wrap border-b-2 border-[#1a1a1c] dark:border-[#f0f6fc]" aria-label="SentinelOSS Navigation">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`sentinel-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 sm:px-6 py-3.5 font-mono-code text-xs sm:text-sm font-bold uppercase transition-all border-b-4 -mb-[2px] flex items-center gap-2 ${
                    isActive
                      ? 'border-b-[#2ea043] text-[#1a1a1c] dark:text-[#f0f6fc] bg-black/5 dark:bg-white/5'
                      : 'border-b-transparent text-[#1a1a1c]/60 dark:text-[#f0f6fc]/60 hover:text-[#1a1a1c] dark:hover:text-[#f0f6fc]'
                  }`}
                >
                  <span className="text-[#2ea043]">{tab.step}</span>
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[10px] font-mono-code px-1.5 py-0.5 border border-[#1a1a1c]/30 dark:border-[#f0f6fc]/30">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-6">
            {analysis && !loading ? (
              <div className="min-h-[420px]">
                {activeTab === 'milestones' && (
                  <MilestoneTrackerView
                    analysis={analysis}
                    onProceedToScanner={() => setActiveTab('scanner')}
                  />
                )}

                {activeTab === 'scanner' && (
                  <AuditScannerView
                    analysis={analysis}
                    onProceedToRemediation={() => setActiveTab('remediation')}
                    onRescan={() => handleAnalyze(targetInput)}
                  />
                )}

                {activeTab === 'remediation' && (
                  <RemediationDiffView
                    analysis={analysis}
                    onProceedToOutreach={() => setActiveTab('outreach')}
                  />
                )}

                {activeTab === 'outreach' && (
                  <MaintainerOutreachView analysis={analysis} />
                )}
              </div>
            ) : (
              <div className="p-16 text-center bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] shadow-xs flex flex-col items-center justify-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#2ea043] animate-spin" />
                <h3 className="font-syne text-base font-bold text-[#1a1a1c] dark:text-[#f0f6fc]">
                  Evaluating Project Dependencies against Google OSV Database...
                </h3>
                <p className="font-mono-code text-xs text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 max-w-md">
                  Querying real-time vulnerability advisories, evaluating milestone thresholds, and calculating downstream blast radius.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
};
