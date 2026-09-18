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
  onOpenTestSuite?: () => void;
}

export const SentinelFlow: React.FC<SentinelFlowProps> = ({ onOpenTestSuite }) => {
  const [activeTab, setActiveTab] = useState<SentinelTab>('milestones');
  const [targetInput, setTargetInput] = useState<string>('superprompt-cli');
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Perform project analysis via /api/sentinel/analyze
  const handleAnalyze = async (target: string) => {
    try {
      setLoading(true);
      setError(null);
      setTargetInput(target);

      const res = await fetch('/api/sentinel/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target }),
      });

      const data = await res.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
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
    handleAnalyze('superprompt-cli');
  }, []);

  const tabs: Array<{
    id: SentinelTab;
    label: string;
    stepNumber: string;
    icon: React.ElementType;
    badge?: string;
  }> = [
    {
      id: 'milestones',
      label: '1. Milestone Tracker',
      stepNumber: 'Step 1',
      icon: TrendingUp,
      badge: analysis?.milestones.thresholdExceeded ? 'Exceeded' : undefined,
    },
    {
      id: 'scanner',
      label: '2. 1-Click Audit Scanner',
      stepNumber: 'Step 2',
      icon: ShieldAlert,
      badge: analysis ? `${analysis.vulnerabilities.length} CVEs` : undefined,
    },
    {
      id: 'remediation',
      label: '3. Vulnerability Remediation',
      stepNumber: 'Step 3',
      icon: GitPullRequest,
      badge: analysis ? `${analysis.fixedDependenciesCount} Patches` : undefined,
    },
    {
      id: 'outreach',
      label: '4. Maintainer Outreach & PR',
      stepNumber: 'Step 4',
      icon: Sparkles,
      badge: 'Low-Pressure',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Sleek Search & Ingestion Bar */}
      <SentinelSearchBar
        onAnalyze={handleAnalyze}
        isLoading={loading}
        activeTarget={targetInput}
      />

      {/* Error state if any */}
      {error && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => handleAnalyze('superprompt-cli')}
            className="underline font-semibold"
          >
            Reset to SuperPrompt CLI Demo
          </button>
        </div>
      )}

      {/* 2. Navigation Tabs (The 4 Explicitly Required Modules) */}
      <div className="border-b border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#161b22] rounded-t-lg p-1.5 shadow-2xs">
        <nav className="flex flex-wrap gap-1" aria-label="SentinelOSS Navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`sentinel-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-xs font-semibold rounded-md transition-all ${
                  isActive
                    ? 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#0969da] dark:text-[#58a6ff] border border-[#d0d7de] dark:border-[#30363d] shadow-xs'
                    : 'text-[#656d76] dark:text-[#8b949e] hover:text-[#1f2328] dark:hover:text-[#f0f6fc] hover:bg-[#f6f8fa] dark:hover:bg-[#21262d]/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#0969da] dark:text-[#58a6ff]' : ''}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full border ${
                      tab.id === 'milestones'
                        ? 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30'
                        : tab.id === 'scanner'
                        ? 'bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/30'
                        : 'bg-[#0969da]/15 text-[#0969da] dark:text-[#58a6ff] border-[#0969da]/30'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* 3. Main Tab Views */}
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
        <div className="p-16 text-center bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg shadow-xs flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#0969da] dark:text-[#58a6ff] animate-spin" />
          <h3 className="text-sm font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
            Evaluating Project Dependencies against Google OSV Database...
          </h3>
          <p className="text-xs text-[#656d76] dark:text-[#8b949e] max-w-md">
            Querying real-time vulnerability advisories, evaluating milestone thresholds, and calculating downstream blast radius.
          </p>
        </div>
      )}
    </div>
  );
};
