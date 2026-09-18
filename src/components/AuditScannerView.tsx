import React, { useState } from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  ExternalLink,
  Search,
  Filter,
  ArrowRight,
  Package,
  Sparkles,
  GitPullRequest,
  RefreshCw,
  Key,
  ShieldCheck,
} from 'lucide-react';
import { ProjectAnalysis, OSVVulnerability, OSVSeverity } from '../types/index.ts';
import { SecretScannerDashboard } from './SecretScannerDashboard.tsx';

interface AuditScannerViewProps {
  analysis: ProjectAnalysis;
  onProceedToRemediation: () => void;
  onRescan?: () => void;
  isRescanning?: boolean;
}

export const AuditScannerView: React.FC<AuditScannerViewProps> = ({
  analysis,
  onProceedToRemediation,
  onRescan,
  isRescanning,
}) => {
  const { summary, vulnerabilities, dependencies } = analysis;
  const [activeAuditTab, setActiveAuditTab] = useState<'VULNERABILITIES' | 'SECRETS'>('VULNERABILITIES');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const secretsCount = analysis.exposedSecrets?.length ?? 0;

  const affectedPackages = new Set(vulnerabilities.map((v) => v.packageName)).size;
  const fixableCount =
    analysis.fixedDependenciesCount || vulnerabilities.filter((v) => Boolean(v.fixedVersion)).length;

  const total = summary.totalFindings;
  const critPct = total > 0 ? (summary.criticalCount / total) * 100 : 0;
  const highPct = total > 0 ? (summary.highCount / total) * 100 : 0;
  const medPct = total > 0 ? (summary.mediumCount / total) * 100 : 0;
  const lowPct = total > 0 ? (summary.lowCount / total) * 100 : 0;

  const filteredVulns = vulnerabilities.filter((v) => {
    const matchesSeverity =
      selectedSeverity === 'ALL' || v.severity.toUpperCase() === selectedSeverity.toUpperCase();
    const matchesSearch =
      v.packageName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.cveId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.summary.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const getSeverityBadge = (severity: OSVSeverity) => {
    switch (severity) {
      case 'Critical':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-[#cf222e]/15 text-[#cf222e] dark:text-[#ff7b72] border border-[#cf222e]/40 dark:border-[#cf222e]/60">
            <AlertOctagon className="w-3.5 h-3.5" /> Critical
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-orange-500/15 text-orange-800 dark:text-orange-300 border border-orange-500/40">
            <AlertTriangle className="w-3.5 h-3.5" /> High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500/40">
            <AlertTriangle className="w-3.5 h-3.5" /> Medium
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-xs font-bold bg-blue-500/15 text-blue-800 dark:text-blue-300 border border-blue-500/40">
            <Info className="w-3.5 h-3.5" /> Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Audit Mode Switcher (OSV Vulnerabilities vs Exposed Secrets & API Keys) */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#f8f7f4] dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc]">
        <button
          id="tab-osv-vulns"
          onClick={() => setActiveAuditTab('VULNERABILITIES')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-mono-code font-bold uppercase transition-all ${
            activeAuditTab === 'VULNERABILITIES'
              ? 'bg-[#1a1a1c] text-white dark:bg-[#f0f6fc] dark:text-[#0f1117] shadow-xs'
              : 'text-[#1a1a1c] dark:text-[#f0f6fc] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-[#cf222e]" />
          <span>OSV Dependencies Audit ({summary.totalFindings})</span>
        </button>

        <button
          id="tab-secret-scanner"
          onClick={() => setActiveAuditTab('SECRETS')}
          className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-mono-code font-bold uppercase transition-all ${
            activeAuditTab === 'SECRETS'
              ? 'bg-[#1a1a1c] text-white dark:bg-[#f0f6fc] dark:text-[#0f1117] shadow-xs'
              : 'text-[#1a1a1c] dark:text-[#f0f6fc] hover:bg-black/5 dark:hover:bg-white/5'
          }`}
        >
          <Key className="w-4 h-4 text-amber-500" />
          <span>Exposed Secrets &amp; API Keys ({secretsCount})</span>
          {secretsCount > 0 && (
            <span className="px-1.5 py-0.2 bg-[#cf222e] text-white text-[10px] font-mono-code">
              ACTION
            </span>
          )}
        </button>
      </div>

      {activeAuditTab === 'SECRETS' ? (
        <SecretScannerDashboard
          secrets={analysis.exposedSecrets || []}
          summary={analysis.secretSummary}
          repoName={analysis.name}
        />
      ) : (
        <>
          {/* 1. Header & Severity Breakdown Bar */}
          <div className="bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] p-6 shadow-xs space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b-2 border-[#1a1a1c] dark:border-[#f0f6fc]">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="label-mono text-[#2ea043] font-bold">
                Google OSV Database Engine
              </span>
              <span className="text-xs font-mono-code text-[#57606a] dark:text-[#8b949e]">
                • Real-time CVE Sync
              </span>
              {summary.criticalCount > 0 ? (
                <span className="px-2.5 py-0.5 text-xs font-mono-code font-bold uppercase bg-[#cf222e]/15 text-[#cf222e] dark:text-[#ff7b72] border border-[#cf222e]">
                  Critical Action Required
                </span>
              ) : summary.totalFindings > 0 ? (
                <span className="px-2.5 py-0.5 text-xs font-mono-code font-bold uppercase bg-amber-500/15 text-amber-800 dark:text-amber-300 border border-amber-500">
                  Advisories Detected
                </span>
              ) : (
                <span className="px-2.5 py-0.5 text-xs font-mono-code font-bold uppercase bg-[#2ea043]/15 text-[#2ea043] border border-[#2ea043]">
                  All Dependencies Clean
                </span>
              )}
            </div>
            <h3 className="font-syne text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-[#1a1a1c] dark:text-[#f0f6fc] mt-1.5">
              Open-Source Vulnerability (OSV) Audit Findings
            </h3>
            <p className="text-sm font-sans text-[#24292f] dark:text-[#d0d7de] font-medium mt-1">
              Audited <span className="font-bold text-[#1a1a1c] dark:text-[#f0f6fc]">{summary.scannedDependenciesCount}</span> direct &amp; transitive packages against known security advisories.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {onRescan && (
              <button
                onClick={onRescan}
                disabled={isRescanning}
                className="px-3.5 py-2.5 text-xs font-mono-code font-bold uppercase text-[#1a1a1c] dark:text-[#f0f6fc] bg-white dark:bg-[#161b22] hover:bg-[#f0f6fc] dark:hover:bg-[#21262d] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRescanning ? 'animate-spin' : ''}`} />
                <span>Rescan</span>
              </button>
            )}

            <button
              id="goto-remediation-btn"
              onClick={onProceedToRemediation}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs font-mono-code font-bold uppercase tracking-wider text-white bg-[#2ea043] hover:bg-[#2c9740] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] shadow-xs transition-opacity"
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>Generate 1-Click Fix PR</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Audit Metrics Overview Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 py-1">
          <div className="p-3 bg-[#f8f7f4] dark:bg-[#0f1117] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] flex flex-col">
            <span className="text-[11px] font-mono-code font-bold text-[#57606a] dark:text-[#8b949e] uppercase">
              Dependencies Audited
            </span>
            <span className="font-syne text-xl font-extrabold text-[#1a1a1c] dark:text-[#f0f6fc] mt-0.5">
              {summary.scannedDependenciesCount}
            </span>
          </div>

          <div className="p-3 bg-[#f8f7f4] dark:bg-[#0f1117] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] flex flex-col">
            <span className="text-[11px] font-mono-code font-bold text-[#57606a] dark:text-[#8b949e] uppercase">
              Affected Packages
            </span>
            <span className="font-syne text-xl font-extrabold text-[#cf222e] dark:text-[#ff7b72] mt-0.5">
              {affectedPackages}
            </span>
          </div>

          <div className="p-3 bg-[#f8f7f4] dark:bg-[#0f1117] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] flex flex-col">
            <span className="text-[11px] font-mono-code font-bold text-[#57606a] dark:text-[#8b949e] uppercase">
              1-Click Fixable
            </span>
            <span className="font-syne text-xl font-extrabold text-[#1a7f37] dark:text-[#3fb950] mt-0.5">
              {fixableCount} PR Patches
            </span>
          </div>

          <div className="p-3 bg-[#f8f7f4] dark:bg-[#0f1117] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] flex flex-col">
            <span className="text-[11px] font-mono-code font-bold text-[#57606a] dark:text-[#8b949e] uppercase">
              Threat Level
            </span>
            <span
              className={`font-syne text-xl font-extrabold mt-0.5 ${
                summary.criticalCount > 0
                  ? 'text-[#cf222e] dark:text-[#ff7b72]'
                  : summary.totalFindings > 0
                  ? 'text-[#ea580c] dark:text-orange-400'
                  : 'text-[#1a7f37] dark:text-[#3fb950]'
              }`}
            >
              {summary.criticalCount > 0 ? 'CRITICAL' : summary.totalFindings > 0 ? 'ATTENTION' : 'HEALTHY'}
            </span>
          </div>
        </div>

        {/* Severity Distribution Bar */}
        {total > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="flex items-center justify-between text-xs font-mono-code font-bold">
              <span className="text-[#57606a] dark:text-[#8b949e]">
                CVE Threat Distribution
              </span>
              <span className="text-[#1a1a1c] dark:text-[#f0f6fc]">
                {summary.criticalCount} Critical • {summary.highCount} High • {summary.mediumCount} Medium • {summary.lowCount} Low
              </span>
            </div>
            <div className="h-3 w-full flex overflow-hidden border-2 border-[#1a1a1c] dark:border-[#f0f6fc] bg-[#f0f2f5] dark:bg-[#21262d]">
              {critPct > 0 && (
                <div
                  style={{ width: `${critPct}%` }}
                  title={`Critical: ${summary.criticalCount}`}
                  className="bg-[#cf222e] h-full transition-all duration-300"
                />
              )}
              {highPct > 0 && (
                <div
                  style={{ width: `${highPct}%` }}
                  title={`High: ${summary.highCount}`}
                  className="bg-[#ea580c] h-full transition-all duration-300"
                />
              )}
              {medPct > 0 && (
                <div
                  style={{ width: `${medPct}%` }}
                  title={`Medium: ${summary.mediumCount}`}
                  className="bg-[#d97706] h-full transition-all duration-300"
                />
              )}
              {lowPct > 0 && (
                <div
                  style={{ width: `${lowPct}%` }}
                  title={`Low: ${summary.lowCount}`}
                  className="bg-[#2563eb] h-full transition-all duration-300"
                />
              )}
            </div>
          </div>
        )}

        {/* Severity Filter Cards Grid */}
        <div>
          <div className="text-xs font-mono-code font-bold uppercase tracking-wider text-[#57606a] dark:text-[#8b949e] mb-2.5">
            Filter Findings by Severity:
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Total Findings (ALL) */}
            <div
              id="audit-filter-all"
              onClick={() => setSelectedSeverity('ALL')}
              className={`p-4 border-2 cursor-pointer transition-all ${
                selectedSeverity === 'ALL'
                  ? 'bg-white text-[#952424] border-[#1a1a1c] ring-2 ring-[#952424] dark:bg-[#952424] dark:text-white dark:border-[#f0f6fc] dark:ring-[#f0f6fc]'
                  : 'bg-[#f8f7f4] dark:bg-[#0f1117] text-[#1a1a1c] dark:text-[#f0f6fc] border-[#1a1a1c] dark:border-[#f0f6fc] hover:border-[#952424]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="label-mono font-bold flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Total</span>
                </span>
                <span className="text-[10px] font-mono-code font-bold uppercase opacity-80">
                  ALL
                </span>
              </div>
              <div className="font-syne text-3xl font-extrabold mt-2">
                {summary.totalFindings}
              </div>
              <div className="text-[11px] font-mono-code font-semibold opacity-80 mt-1">
                All Advisories
              </div>
            </div>

            {/* Critical */}
            <div
              onClick={() => setSelectedSeverity('CRITICAL')}
              className={`p-4 border-2 cursor-pointer transition-all ${
                selectedSeverity === 'CRITICAL'
                  ? 'bg-[#fff1f2] text-[#cf222e] border-[#cf222e] ring-2 ring-[#cf222e] dark:bg-[#cf222e]/25 dark:text-[#ff7b72] dark:border-[#ff7b72] dark:ring-[#ff7b72]'
                  : 'bg-[#f8f7f4] dark:bg-[#0f1117] text-[#1a1a1c] dark:text-[#f0f6fc] border-[#1a1a1c] dark:border-[#f0f6fc] hover:border-[#cf222e]'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="label-mono font-bold flex items-center gap-1.5 text-[#cf222e] dark:text-[#ff7b72]">
                  <AlertOctagon className="w-3.5 h-3.5" />
                  <span>Critical</span>
                </span>
                <span className="text-[10px] font-mono-code font-bold uppercase text-[#cf222e] dark:text-[#ff7b72]">
                  CVSS 9+
                </span>
              </div>
              <div className="font-syne text-3xl font-extrabold mt-2 text-[#cf222e] dark:text-[#ff7b72]">
                {summary.criticalCount}
              </div>
              <div className="text-[11px] font-mono-code font-semibold opacity-80 mt-1">
                Urgent Priority
              </div>
            </div>

            {/* High */}
            <div
              onClick={() => setSelectedSeverity('HIGH')}
              className={`p-4 border-2 cursor-pointer transition-all ${
                selectedSeverity === 'HIGH'
                  ? 'bg-[#fff7ed] text-[#c2410c] border-[#ea580c] ring-2 ring-[#ea580c] dark:bg-orange-500/20 dark:text-orange-300 dark:border-orange-400 dark:ring-orange-400'
                  : 'bg-[#f8f7f4] dark:bg-[#0f1117] text-[#1a1a1c] dark:text-[#f0f6fc] border-[#1a1a1c] dark:border-[#f0f6fc] hover:border-orange-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="label-mono font-bold flex items-center gap-1.5 text-orange-700 dark:text-orange-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>High</span>
                </span>
                <span className="text-[10px] font-mono-code font-bold uppercase text-orange-700 dark:text-orange-400">
                  CVSS 7–8.9
                </span>
              </div>
              <div className="font-syne text-3xl font-extrabold mt-2 text-orange-700 dark:text-orange-400">
                {summary.highCount}
              </div>
              <div className="text-[11px] font-mono-code font-semibold opacity-80 mt-1">
                Elevated Risk
              </div>
            </div>

            {/* Medium */}
            <div
              onClick={() => setSelectedSeverity('MEDIUM')}
              className={`p-4 border-2 cursor-pointer transition-all ${
                selectedSeverity === 'MEDIUM'
                  ? 'bg-[#fffbeb] text-[#b45309] border-[#d97706] ring-2 ring-[#d97706] dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-400 dark:ring-amber-400'
                  : 'bg-[#f8f7f4] dark:bg-[#0f1117] text-[#1a1a1c] dark:text-[#f0f6fc] border-[#1a1a1c] dark:border-[#f0f6fc] hover:border-amber-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="label-mono font-bold flex items-center gap-1.5 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Medium</span>
                </span>
                <span className="text-[10px] font-mono-code font-bold uppercase text-amber-700 dark:text-amber-400">
                  CVSS 4–6.9
                </span>
              </div>
              <div className="font-syne text-3xl font-extrabold mt-2 text-amber-700 dark:text-amber-400">
                {summary.mediumCount}
              </div>
              <div className="text-[11px] font-mono-code font-semibold opacity-80 mt-1">
                Moderate Risk
              </div>
            </div>

            {/* Low */}
            <div
              onClick={() => setSelectedSeverity('LOW')}
              className={`p-4 border-2 cursor-pointer transition-all col-span-2 sm:col-span-1 ${
                selectedSeverity === 'LOW'
                  ? 'bg-[#eff6ff] text-[#1d4ed8] border-[#2563eb] ring-2 ring-[#2563eb] dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-400 dark:ring-blue-400'
                  : 'bg-[#f8f7f4] dark:bg-[#0f1117] text-[#1a1a1c] dark:text-[#f0f6fc] border-[#1a1a1c] dark:border-[#f0f6fc] hover:border-blue-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="label-mono font-bold flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
                  <Info className="w-3.5 h-3.5" />
                  <span>Low</span>
                </span>
                <span className="text-[10px] font-mono-code font-bold uppercase text-blue-700 dark:text-blue-400">
                  CVSS &lt;4
                </span>
              </div>
              <div className="font-syne text-3xl font-extrabold mt-2 text-blue-700 dark:text-blue-400">
                {summary.lowCount}
              </div>
              <div className="text-[11px] font-mono-code font-semibold opacity-80 mt-1">
                Low Priority
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search & Filtering Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#57606a] dark:text-[#8b949e]" />
          <input
            id="vuln-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by package name (e.g. minimist, axios), CVE ID, or keyword..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] text-[#1a1a1c] dark:text-[#f0f6fc] placeholder-[#57606a] dark:placeholder-[#8b949e] font-sans font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0969da]"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono-code text-[#24292f] dark:text-[#d0d7de] font-bold shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span>Showing {filteredVulns.length} of {vulnerabilities.length} vulnerabilities</span>
        </div>
      </div>

      {/* 3. Card List of Vulnerabilities */}
      {filteredVulns.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] shadow-xs">
          <CheckCircle2 className="w-10 h-10 text-[#2ea043] mx-auto mb-3" />
          <h4 className="font-syne text-base font-bold text-[#1a1a1c] dark:text-[#f0f6fc]">
            No vulnerabilities found matching current filter
          </h4>
          <p className="font-mono-code text-xs text-[#57606a] dark:text-[#8b949e] mt-1.5 max-w-md mx-auto">
            {vulnerabilities.length === 0
              ? 'All audited dependencies match healthy security hygiene.'
              : 'Try clearing the search query or selecting a different severity filter above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVulns.map((vuln) => (
            <div
              key={`${vuln.id}_${vuln.packageName}`}
              className="bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] p-5 shadow-xs transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    {getSeverityBadge(vuln.severity)}

                    <span className="font-mono-code text-xs font-bold text-[#1a1a1c] dark:text-[#f0f6fc] bg-[#f0f2f5] dark:bg-[#21262d] px-2.5 py-1 border border-[#1a1a1c] dark:border-[#f0f6fc]">
                      {vuln.cveId}
                    </span>

                    <span className="text-xs font-mono-code font-bold text-[#1a1a1c] dark:text-[#f0f6fc] flex items-center gap-1.5 bg-[#f8f7f4] dark:bg-[#0f1117] px-2.5 py-1 border border-[#1a1a1c] dark:border-[#f0f6fc]">
                      <Package className="w-3.5 h-3.5 text-[#2ea043]" />
                      <span>{vuln.packageName}</span>
                    </span>

                    {vuln.cvssScore && (
                      <span className="text-xs font-mono-code font-bold px-2 py-1 border border-[#1a1a1c] dark:border-[#f0f6fc] text-[#1a1a1c] dark:text-[#f0f6fc] bg-[#f0f2f5] dark:bg-[#21262d]">
                        CVSS: {vuln.cvssScore}
                      </span>
                    )}
                  </div>

                  <h4 className="font-syne text-base sm:text-lg font-bold text-[#1a1a1c] dark:text-[#f0f6fc] leading-snug">
                    {vuln.summary}
                  </h4>

                  {vuln.details && (
                    <p className="text-sm font-sans text-[#24292f] dark:text-[#d0d7de] leading-relaxed font-normal">
                      {vuln.details}
                    </p>
                  )}
                </div>

                {/* Current vs Recommended Fix Version Card */}
                <div className="p-4 bg-[#f8f7f4] dark:bg-[#0f1117] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] flex flex-col justify-between shrink-0 min-w-56 text-xs font-mono-code shadow-2xs">
                  <div className="flex items-center justify-between gap-4 text-[#1a1a1c] dark:text-[#f0f6fc]">
                    <span className="font-semibold text-xs">Current Version:</span>
                    <span className="font-extrabold text-[#cf222e] dark:text-[#ff7b72] text-sm">
                      {vuln.currentVersion}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-4 mt-2.5 pt-2.5 border-t-2 border-[#1a1a1c] dark:border-[#30363d]">
                    <span className="text-[#1a7f37] dark:text-[#3fb950] font-bold text-xs">
                      Fix Target:
                    </span>
                    <span className="font-extrabold text-[#1a7f37] dark:text-[#3fb950] text-sm">
                      ^{vuln.fixedVersion}
                    </span>
                  </div>

                  {vuln.references.length > 0 && (
                    <a
                      href={vuln.references[0].url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 text-xs text-[#0969da] dark:text-[#58a6ff] hover:underline flex items-center justify-end gap-1.5 font-bold"
                    >
                      <span>Advisory Details</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  );
};
