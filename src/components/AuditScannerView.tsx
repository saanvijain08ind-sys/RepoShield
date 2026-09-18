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
} from 'lucide-react';
import { ProjectAnalysis, OSVVulnerability, OSVSeverity } from '../types/index.ts';

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
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-red-500/15 text-red-700 dark:text-red-400 border border-red-500/30">
            <AlertOctagon className="w-3 h-3" /> Critical
          </span>
        );
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-orange-500/15 text-orange-700 dark:text-orange-400 border border-orange-500/30">
            <AlertTriangle className="w-3 h-3" /> High
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" /> Medium
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold rounded-full bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
            <Info className="w-3 h-3" /> Low
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* 1. Header & Severity Breakdown Bar */}
      <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#d0d7de] dark:border-[#30363d]">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0969da] dark:text-[#58a6ff] bg-[#0969da]/10 dark:bg-[#1f6feb]/20 px-2 py-0.5 rounded-full border border-[#0969da]/20 dark:border-[#1f6feb]/30">
                Google OSV Database Engine
              </span>
              <span className="text-xs text-[#656d76] dark:text-[#8b949e]">
                Zero-setup client & server audit
              </span>
            </div>
            <h3 className="text-base font-bold text-[#1f2328] dark:text-[#f0f6fc] mt-1">
              Open-Source Vulnerability (OSV) Audit Findings
            </h3>
            <p className="text-xs text-[#656d76] dark:text-[#8b949e] mt-0.5">
              Audited {summary.scannedDependenciesCount} direct & transitive dependencies against public CVE advisories.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onRescan && (
              <button
                onClick={onRescan}
                disabled={isRescanning}
                className="px-3 py-1.5 text-xs font-medium text-[#24292f] dark:text-[#c9d1d9] bg-[#f6f8fa] dark:bg-[#21262d] hover:bg-[#f3f4f6] dark:hover:bg-[#30363d] border border-[#d0d7de] dark:border-[#30363d] rounded-md transition-colors flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRescanning ? 'animate-spin' : ''}`} />
                <span>Rescan</span>
              </button>
            )}

            <button
              id="goto-remediation-btn"
              onClick={onProceedToRemediation}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1f883d] hover:bg-[#1a7f37] dark:bg-[#238636] dark:hover:bg-[#2ea043] rounded-md shadow-xs transition-colors"
            >
              <GitPullRequest className="w-3.5 h-3.5" />
              <span>Generate 1-Click Fix PR</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Severity Badge Breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
          <div
            onClick={() => setSelectedSeverity('ALL')}
            className={`p-3 rounded-md border cursor-pointer transition-all ${
              selectedSeverity === 'ALL'
                ? 'bg-[#f6f8fa] dark:bg-[#21262d] border-[#0969da] dark:border-[#58a6ff] ring-1 ring-[#0969da]'
                : 'bg-white dark:bg-[#161b22] border-[#d0d7de] dark:border-[#30363d] hover:border-[#8c959f]'
            }`}
          >
            <div className="text-[11px] text-[#656d76] dark:text-[#8b949e]">Total Findings</div>
            <div className="text-xl font-bold font-mono text-[#1f2328] dark:text-[#f0f6fc]">
              {summary.totalFindings}
            </div>
          </div>

          <div
            onClick={() => setSelectedSeverity('CRITICAL')}
            className={`p-3 rounded-md border cursor-pointer transition-all ${
              selectedSeverity === 'CRITICAL'
                ? 'bg-red-500/10 border-red-500 ring-1 ring-red-500'
                : 'bg-white dark:bg-[#161b22] border-[#d0d7de] dark:border-[#30363d] hover:border-red-400'
            }`}
          >
            <div className="text-[11px] font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
              <AlertOctagon className="w-3 h-3" /> Critical
            </div>
            <div className="text-xl font-bold font-mono text-red-600 dark:text-red-400">
              {summary.criticalCount}
            </div>
          </div>

          <div
            onClick={() => setSelectedSeverity('HIGH')}
            className={`p-3 rounded-md border cursor-pointer transition-all ${
              selectedSeverity === 'HIGH'
                ? 'bg-orange-500/10 border-orange-500 ring-1 ring-orange-500'
                : 'bg-white dark:bg-[#161b22] border-[#d0d7de] dark:border-[#30363d] hover:border-orange-400'
            }`}
          >
            <div className="text-[11px] font-semibold text-orange-600 dark:text-orange-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> High
            </div>
            <div className="text-xl font-bold font-mono text-orange-600 dark:text-orange-400">
              {summary.highCount}
            </div>
          </div>

          <div
            onClick={() => setSelectedSeverity('MEDIUM')}
            className={`p-3 rounded-md border cursor-pointer transition-all ${
              selectedSeverity === 'MEDIUM'
                ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500'
                : 'bg-white dark:bg-[#161b22] border-[#d0d7de] dark:border-[#30363d] hover:border-amber-400'
            }`}
          >
            <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Medium
            </div>
            <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">
              {summary.mediumCount}
            </div>
          </div>

          <div
            onClick={() => setSelectedSeverity('LOW')}
            className={`p-3 rounded-md border cursor-pointer transition-all ${
              selectedSeverity === 'LOW'
                ? 'bg-blue-500/10 border-blue-500 ring-1 ring-blue-500'
                : 'bg-white dark:bg-[#161b22] border-[#d0d7de] dark:border-[#30363d] hover:border-blue-400'
            }`}
          >
            <div className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              <Info className="w-3 h-3" /> Low
            </div>
            <div className="text-xl font-bold font-mono text-blue-600 dark:text-blue-400">
              {summary.lowCount}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Search & Filtering Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#656d76] dark:text-[#8b949e]" />
          <input
            id="vuln-search-input"
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by package name (e.g. minimist, axios), CVE ID, or keyword..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md text-[#1f2328] dark:text-[#f0f6fc] placeholder-[#656d76] dark:placeholder-[#8b949e] focus:outline-hidden focus:ring-2 focus:ring-[#0969da]"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[#656d76] dark:text-[#8b949e] shrink-0">
          <Filter className="w-3.5 h-3.5" />
          <span>Showing {filteredVulns.length} of {vulnerabilities.length} vulnerabilities</span>
        </div>
      </div>

      {/* 3. Card List of Vulnerabilities */}
      {filteredVulns.length === 0 ? (
        <div className="p-8 text-center bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
            No vulnerabilities found matching filters
          </h4>
          <p className="text-xs text-[#656d76] dark:text-[#8b949e] mt-1">
            {vulnerabilities.length === 0
              ? 'All audited dependencies match healthy security hygiene.'
              : 'Try clearing the search term or switching the severity filter.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredVulns.map((vuln) => (
            <div
              key={`${vuln.id}_${vuln.packageName}`}
              className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-lg p-4 sm:p-5 shadow-xs hover:border-[#8c959f] dark:hover:border-[#8b949e] transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getSeverityBadge(vuln.severity)}

                    <span className="font-mono text-xs font-bold text-[#0969da] dark:text-[#58a6ff] bg-[#0969da]/10 dark:bg-[#1f6feb]/20 px-2 py-0.5 rounded-md">
                      {vuln.cveId}
                    </span>

                    <span className="text-xs font-mono font-semibold text-[#1f2328] dark:text-[#f0f6fc] flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-[#656d76] dark:text-[#8b949e]" />
                      <span>{vuln.packageName}</span>
                    </span>

                    {vuln.cvssScore && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-sm bg-[#afb8c1]/20 dark:bg-[#30363d] text-[#656d76] dark:text-[#8b949e]">
                        CVSS: {vuln.cvssScore}
                      </span>
                    )}
                  </div>

                  <h4 className="text-sm font-semibold text-[#1f2328] dark:text-[#f0f6fc]">
                    {vuln.summary}
                  </h4>

                  {vuln.details && (
                    <p className="text-xs text-[#656d76] dark:text-[#8b949e] leading-relaxed line-clamp-2">
                      {vuln.details}
                    </p>
                  )}
                </div>

                {/* Current vs Recommended Fix Version Card */}
                <div className="p-3 bg-[#f6f8fa] dark:bg-[#0d1117] rounded-md border border-[#d0d7de] dark:border-[#30363d] flex flex-col justify-between shrink-0 min-w-48 text-xs">
                  <div className="flex items-center justify-between gap-3 text-[#656d76] dark:text-[#8b949e]">
                    <span>Current Version:</span>
                    <span className="font-mono font-bold text-red-600 dark:text-red-400">
                      {vuln.currentVersion}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-1.5 pt-1.5 border-t border-[#d0d7de]/60 dark:border-[#30363d]">
                    <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                      Recommended Fix:
                    </span>
                    <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      ^{vuln.fixedVersion}
                    </span>
                  </div>

                  {vuln.references.length > 0 && (
                    <a
                      href={vuln.references[0].url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 text-[11px] text-[#0969da] dark:text-[#58a6ff] hover:underline flex items-center justify-end gap-1"
                    >
                      <span>Advisory Details</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
