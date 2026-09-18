import React, { useState } from 'react';
import {
  Shield,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Clock,
  Code2,
  Terminal,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  History,
  FileCode,
  Info,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Project, ScanVerdict, VulnerabilityFinding, WebsiteScanResult, BeforeAfterComparison } from '../types/index.ts';
import { BeforeAfterComparisonView } from './BeforeAfterComparisonView.tsx';

interface Props {
  project: Project;
  scans: WebsiteScanResult[];
  onScanInitiated: () => void;
}

export const ScanResultsView: React.FC<Props> = ({ project, scans, onScanInitiated }) => {
  const [scanning, setScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<string>('live');
  const [expandedFindings, setExpandedFindings] = useState<Record<string, boolean>>({});
  const [showComparison, setShowComparison] = useState(false);
  const [comparisonData, setComparisonData] = useState<{
    comparison: BeforeAfterComparison;
    previousScan: WebsiteScanResult;
    currentScan: WebsiteScanResult;
  } | null>(null);
  const [loadingComparison, setLoadingComparison] = useState(false);

  const latestScan: WebsiteScanResult | undefined = scans[0];

  const handleRunScan = async (scenario: string = 'live') => {
    setScanning(true);
    setScanError(null);
    setShowComparison(false);

    try {
      const isMock = scenario !== 'live';
      const body: any = {
        useMockScanner: isMock,
        timeoutMs: 8000,
      };

      if (isMock) {
        body.mockScenario = scenario;
      }

      const res = await fetch(`/api/projects/${project.id}/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Website scan execution failed.');
      }

      onScanInitiated();
    } catch (err: any) {
      setScanError(err.message || 'Scan request failed.');
    } finally {
      setScanning(false);
    }
  };

  const loadComparison = async (scanId: string) => {
    setLoadingComparison(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/scans/${scanId}/compare`);
      const data = await res.json();
      if (data.success && data.hasComparison) {
        setComparisonData({
          comparison: data.comparison,
          previousScan: data.previousScan,
          currentScan: data.currentScan,
        });
        setShowComparison(true);
      } else {
        alert(data.message || 'No earlier completed scan found for comparison.');
      }
    } catch (err: any) {
      alert('Failed to load scan comparison.');
    } finally {
      setLoadingComparison(false);
    }
  };

  const toggleFinding = (id: string) => {
    setExpandedFindings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Verdict style mapper strictly using the 6 allowed verdicts
  const renderVerdictBadge = (verdict: ScanVerdict) => {
    switch (verdict) {
      case 'Critical Issues Found':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ffebe9] dark:bg-[#490202]/40 text-[#cf222e] dark:text-[#ff7b72] border border-[#ff8182]/40 dark:border-[#f85149]/40">
            <AlertCircle className="w-3.5 h-3.5" />
            Critical Issues Found
          </span>
        );
      case 'High-Risk Issues Found':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fff1e5] dark:bg-[#5c2400]/40 text-[#bc4c00] dark:text-[#ffa657] border border-[#ffc299]/40 dark:border-[#d29922]/40">
            <AlertTriangle className="w-3.5 h-3.5" />
            High-Risk Issues Found
          </span>
        );
      case 'Issues Found':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fff8c5] dark:bg-[#633c01]/30 text-[#9a6700] dark:text-[#eac54f] border border-[#d4a72c]/40 dark:border-[#d29922]/40">
            <Info className="w-3.5 h-3.5" />
            Issues Found
          </span>
        );
      case 'No Issues Detected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#dafbe1] dark:bg-[#238636]/20 text-[#1a7f37] dark:text-[#3fb950] border border-[#4ac26b]/40 dark:border-[#2ea043]/40">
            <CheckCircle2 className="w-3.5 h-3.5" />
            No Issues Detected
          </span>
        );
      case 'Manual Review Required':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#fbefff] dark:bg-[#3d1f6d]/30 text-[#8250df] dark:text-[#d2a8ff] border border-[#d2a8ff]/40 dark:border-[#a371f7]/40">
            <HelpCircle className="w-3.5 h-3.5" />
            Manual Review Required
          </span>
        );
      case 'Scan Incomplete':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#f6f8fa] dark:bg-[#21262d] text-[#656d76] dark:text-[#8b949e] border border-[#d0d7de] dark:border-[#30363d]">
            <AlertCircle className="w-3.5 h-3.5" />
            Scan Incomplete
          </span>
        );
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical':
        return 'bg-[#ffebe9] dark:bg-[#490202]/40 text-[#cf222e] dark:text-[#ff7b72] border-[#ff8182]/40 dark:border-[#f85149]/40';
      case 'High':
        return 'bg-[#fff1e5] dark:bg-[#5c2400]/40 text-[#bc4c00] dark:text-[#ffa657] border-[#ffc299]/40 dark:border-[#d29922]/40';
      case 'Medium':
        return 'bg-[#fff8c5] dark:bg-[#633c01]/30 text-[#9a6700] dark:text-[#eac54f] border-[#d4a72c]/40 dark:border-[#d29922]/40';
      case 'Low':
        return 'bg-[#f6f8fa] dark:bg-[#21262d] text-[#656d76] dark:text-[#8b949e] border-[#d0d7de] dark:border-[#30363d]';
      default:
        return 'bg-[#ddf4ff] dark:bg-[#0c2d6b]/30 text-[#0969da] dark:text-[#58a6ff] border-[#54aeff]/40 dark:border-[#1f6feb]/40';
    }
  };

  return (
    <div className="bg-white dark:bg-[#161b22] rounded-md border border-[#d0d7de] dark:border-[#30363d] shadow-2xs p-4 space-y-4 transition-colors">
      {/* Scanner Control Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d0d7de] dark:border-[#30363d] pb-3">
        <div>
          <h3 className="text-sm font-semibold text-[#1f2328] dark:text-[#f0f6fc] flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#0969da] dark:text-[#58a6ff]" />
            <span>Website Security Assessment</span>
          </h3>
          <p className="text-xs text-[#656d76] dark:text-[#8b949e] mt-0.5">
            Non-invasive transport & header scanner evaluating{' '}
            <code className="text-[#0969da] dark:text-[#58a6ff] font-mono font-medium">{project.websiteUrl}</code>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Scenario Selector */}
          <select
            value={selectedScenario}
            onChange={(e) => setSelectedScenario(e.target.value)}
            disabled={scanning}
            className="text-xs border border-[#d0d7de] dark:border-[#30363d] rounded-md px-2.5 py-1.5 bg-[#f6f8fa] dark:bg-[#21262d] text-[#24292f] dark:text-[#c9d1d9]"
          >
            <option value="live">Live HTTP Scan (Real Network)</option>
            <option value="vulnerable_high">Test Fixture: High Risk (Plain HTTP + Headers)</option>
            <option value="vulnerable_critical">Test Fixture: Critical (.git/HEAD Exposed)</option>
            <option value="clean">Test Fixture: Clean (No Issues Detected)</option>
            <option value="ambiguous">Test Fixture: Ambiguous (Manual Review)</option>
            <option value="incomplete">Test Fixture: Incomplete (Timeout)</option>
          </select>

          <button
            id="run-scan-btn"
            onClick={() => handleRunScan(selectedScenario)}
            disabled={scanning}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1f883d] hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043] rounded-md transition-all shadow-xs disabled:opacity-50 border border-[#1b1f24]/15"
          >
            <Zap className={`w-3.5 h-3.5 ${scanning ? 'animate-pulse text-amber-300' : ''}`} />
            <span>{scanning ? 'Scanning Website...' : 'Execute Website Scan'}</span>
          </button>
        </div>
      </div>

      {scanError && (
        <div className="p-3 bg-[#ffebe9] dark:bg-[#490202]/30 border border-[#ff8182]/40 dark:border-[#f85149]/40 rounded-md text-xs text-[#cf222e] dark:text-[#ff7b72] flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{scanError}</span>
        </div>
      )}

      {/* When no scans exist yet */}
      {!latestScan && !scanning && (
        <div className="text-center py-10 px-4 border border-dashed border-[#d0d7de] dark:border-[#30363d] rounded-md bg-[#f6f8fa] dark:bg-[#0d1117]">
          <Shield className="w-8 h-8 text-[#656d76] dark:text-[#8b949e] mx-auto mb-2" />
          <h4 className="text-xs font-semibold text-[#1f2328] dark:text-[#f0f6fc]">No Website Scans Performed Yet</h4>
          <p className="text-xs text-[#656d76] dark:text-[#8b949e] max-w-md mx-auto mt-1 mb-3">
            Click "Execute Website Scan" to assess transport security, defense headers, and exposed files on {project.websiteUrl}.
          </p>
          <button
            onClick={() => handleRunScan('live')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#1f883d] hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043] rounded-md shadow-xs border border-[#1b1f24]/15"
          >
            Initiate Baseline Assessment
          </button>
        </div>
      )}

      {/* Active Latest Scan Result Card */}
      {latestScan && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-md border border-[#d0d7de] dark:border-[#30363d] bg-[#f6f8fa] dark:bg-[#0d1117] space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 flex-wrap">
                {renderVerdictBadge(latestScan.verdict)}
                <span className="text-xs text-[#656d76] dark:text-[#8b949e] font-mono">
                  {new Date(latestScan.startedAt).toLocaleString()}
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-[#afb8c1]/20 dark:bg-[#30363d] text-[#24292f] dark:text-[#c9d1d9]">
                  {latestScan.scannerType === 'live_http' ? 'Live HTTP Request' : 'Labeled Fixture'}
                </span>
              </div>

              {scans.length > 1 && (
                <button
                  onClick={() => {
                    if (showComparison) setShowComparison(false);
                    else loadComparison(latestScan.id);
                  }}
                  disabled={loadingComparison}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#24292f] dark:text-[#c9d1d9] bg-white dark:bg-[#21262d] hover:bg-[#f6f8fa] dark:hover:bg-[#30363d] rounded-md border border-[#d0d7de] dark:border-[#30363d] shadow-2xs transition-colors"
                >
                  <History className="w-3.5 h-3.5 text-[#656d76] dark:text-[#8b949e]" />
                  <span>{showComparison ? 'Hide Differential' : 'Compare with Prior Scan'}</span>
                </button>
              )}
            </div>

            <div className="text-xs text-[#1f2328] dark:text-[#c9d1d9]">
              <span className="text-[#656d76] dark:text-[#8b949e] font-medium">Verdict Rationale: </span>
              {latestScan.verdictReason}
            </div>

            {/* Mandatory Scope & Security Disclaimer */}
            <div className="p-3 bg-[#fff8c5] dark:bg-[#633c01]/25 border border-[#d4a72c]/40 dark:border-[#bb8009]/40 rounded-md text-[11px] text-[#9a6700] dark:text-[#eac54f] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[#bf8700] dark:text-[#d29922]" />
              <div>
                <strong className="font-semibold block mb-0.5">Mandatory Assessment Scope Disclaimer:</strong>
                {latestScan.disclaimer}
              </div>
            </div>

            {/* Findings Summary Stats */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-[#656d76] dark:text-[#8b949e] font-medium">Observed Findings:</span>
              <span className="px-2 py-0.5 rounded-full bg-[#ffebe9] dark:bg-[#490202]/40 text-[#cf222e] dark:text-[#ff7b72] border border-[#ff8182]/40 dark:border-[#f85149]/40 text-[11px] font-semibold">
                {latestScan.summary.criticalCount} Critical
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#fff1e5] dark:bg-[#5c2400]/40 text-[#bc4c00] dark:text-[#ffa657] border border-[#ffc299]/40 dark:border-[#d29922]/40 text-[11px] font-semibold">
                {latestScan.summary.highCount} High
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#fff8c5] dark:bg-[#633c01]/30 text-[#9a6700] dark:text-[#eac54f] border border-[#d4a72c]/40 dark:border-[#d29922]/40 text-[11px] font-semibold">
                {latestScan.summary.mediumCount} Medium
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#f6f8fa] dark:bg-[#21262d] text-[#656d76] dark:text-[#8b949e] border border-[#d0d7de] dark:border-[#30363d] text-[11px] font-semibold">
                {latestScan.summary.lowCount} Low
              </span>
            </div>
          </div>

          {/* Before & After Scan Comparison (if activated) */}
          {showComparison && comparisonData && (
            <BeforeAfterComparisonView
              comparison={comparisonData.comparison}
              previousScan={comparisonData.previousScan}
              currentScan={comparisonData.currentScan}
            />
          )}

          {/* Prioritized Findings List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-[#656d76] dark:text-[#8b949e]">
                Prioritized Findings & Educational Remediation Guidance ({latestScan.findings.length})
              </h4>
              <span className="text-[11px] text-[#656d76] dark:text-[#8b949e]">
                Ranked using deterministic rules outside LLM
              </span>
            </div>

            {latestScan.findings.length === 0 ? (
              <div className="p-4 bg-[#dafbe1] dark:bg-[#238636]/20 border border-[#4ac26b]/40 dark:border-[#2ea043]/40 rounded-md text-xs text-[#1a7f37] dark:text-[#3fb950] flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  No security misconfigurations or exposed endpoints were detected within the configured scan scope.
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                {latestScan.findings.map((finding) => {
                  const isExpanded = expandedFindings[finding.id] ?? false;

                  return (
                    <div
                      key={finding.id}
                      className="border border-[#d0d7de] dark:border-[#30363d] rounded-md overflow-hidden bg-white dark:bg-[#161b22] transition-colors"
                    >
                      {/* Finding Card Header */}
                      <div
                        onClick={() => toggleFinding(finding.id)}
                        className="p-3 flex items-start justify-between gap-3 cursor-pointer bg-[#f6f8fa] dark:bg-[#161b22] hover:bg-[#f3f4f6] dark:hover:bg-[#21262d] transition-colors"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="flex flex-col items-center">
                            <span className="text-[10px] font-bold text-[#656d76] dark:text-[#8b949e] uppercase">
                              Rank
                            </span>
                            <span className="text-xs font-bold font-mono text-[#0969da] dark:text-[#58a6ff] bg-[#afb8c1]/20 dark:bg-[#30363d] px-1.5 py-0.2 rounded">
                              #{finding.priorityRank}
                            </span>
                          </div>

                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${getSeverityBadge(
                                  finding.severity
                                )}`}
                              >
                                {finding.severity}
                              </span>
                              <span className="text-xs font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
                                {finding.title}
                              </span>
                              {finding.confirmed ? (
                                <span className="text-[10px] font-medium text-[#1a7f37] dark:text-[#3fb950] bg-[#dafbe1] dark:bg-[#238636]/20 border border-[#4ac26b]/40 dark:border-[#2ea043]/40 px-1.5 py-0.5 rounded-full">
                                  Confirmed Evidence
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-[#8250df] dark:text-[#d2a8ff] bg-[#fbefff] dark:bg-[#3d1f6d]/30 border border-[#d2a8ff]/40 dark:border-[#a371f7]/40 px-1.5 py-0.5 rounded-full">
                                  Unverified Observation
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-[#656d76] dark:text-[#8b949e] leading-relaxed">
                              {finding.description}
                            </p>

                            <div className="text-[11px] text-[#656d76] dark:text-[#8b949e] flex items-center gap-2">
                              <span>Target: <code className="font-mono text-[#0969da] dark:text-[#58a6ff] bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] px-1 py-0.2 rounded">{finding.affectedUrlOrComponent}</code></span>
                              <span>•</span>
                              <span>Category: <strong className="text-[#1f2328] dark:text-[#f0f6fc]">{finding.category}</strong></span>
                            </div>
                          </div>
                        </div>

                        <button className="text-[#656d76] dark:text-[#8b949e] p-1">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Expanded Details: Evidence, Explainable Rank Rationale, Remediation Guidance */}
                      {isExpanded && (
                        <div className="p-3.5 border-t border-[#d0d7de] dark:border-[#30363d] bg-white dark:bg-[#0d1117] space-y-3 text-xs">
                          {/* Preserved Evidence */}
                          <div>
                            <span className="font-semibold text-[#1f2328] dark:text-[#f0f6fc] block mb-1">
                              Preserved Scanner Evidence:
                            </span>
                            <div className="bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] text-[#24292f] dark:text-[#c9d1d9] font-mono text-[11px] p-2.5 rounded-md overflow-x-auto">
                              {finding.evidence}
                            </div>
                          </div>

                          {/* Explainable Priority Rule */}
                          <div className="p-2.5 bg-[#ddf4ff] dark:bg-[#0c2d6b]/25 border border-[#54aeff]/40 dark:border-[#1f6feb]/40 rounded-md text-[#1f2328] dark:text-[#c9d1d9]">
                            <span className="font-semibold text-[#0969da] dark:text-[#58a6ff] block mb-0.5">
                              Deterministic Prioritization Rationale:
                            </span>
                            <span className="text-[#656d76] dark:text-[#8b949e] text-[11px]">
                              {finding.priorityReason}
                            </span>
                          </div>

                          {/* Remediation Guidance */}
                          <div className="p-3 bg-[#f6f8fa] dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-[#1f2328] dark:text-[#f0f6fc] flex items-center gap-1.5">
                                <Code2 className="w-3.5 h-3.5 text-[#0969da] dark:text-[#58a6ff]" />
                                {finding.remediation.title}
                              </span>
                              <div className="text-right">
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0969da] dark:text-[#58a6ff] bg-[#afb8c1]/20 dark:bg-[#30363d] px-2 py-0.5 rounded-full">
                                  <Clock className="w-3 h-3" />
                                  {finding.remediation.estimatedEffort}
                                </span>
                              </div>
                            </div>

                            <p className="text-[#656d76] dark:text-[#8b949e] text-xs leading-relaxed">
                              {finding.remediation.guidance}
                            </p>

                            {finding.remediation.exampleSnippet && (
                              <div>
                                <span className="text-[10px] uppercase font-semibold text-[#656d76] dark:text-[#8b949e] block mb-1">
                                  Actionable Configuration Snippet:
                                </span>
                                <pre className="bg-white dark:bg-[#0d1117] text-[#1a7f37] dark:text-[#7ee787] border border-[#d0d7de] dark:border-[#30363d] font-mono text-[11px] p-2.5 rounded-md overflow-x-auto whitespace-pre">
                                  {finding.remediation.exampleSnippet}
                                </pre>
                              </div>
                            )}

                            {/* Remediation Effort Disclaimer */}
                            <div className="text-[10px] text-[#656d76] dark:text-[#8b949e] italic pt-1 border-t border-[#d0d7de]/60 dark:border-[#30363d] flex items-center gap-1">
                              <Info className="w-3 h-3 text-[#656d76] dark:text-[#8b949e] shrink-0" />
                              <span>{finding.remediation.effortDisclaimer}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
