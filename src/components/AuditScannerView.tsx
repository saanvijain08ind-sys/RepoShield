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
    <div className="space-y-6">
      {/* 1. Header & Severity Breakdown Bar */}
      <div className="bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b-2 border-[#1a1a1c] dark:border-[#f0f6fc]">
          <div>
            <div className="flex items-center gap-2">
              <span className="label-mono text-[#2ea043]">
                Google OSV Database Engine
              </span>
              <span className="text-xs font-mono-code text-[#1a1a1c]/60 dark:text-[#f0f6fc]/60">
                • Zero-setup audit
              </span>
            </div>
            <h3 className="font-syne text-xl font-extrabold uppercase tracking-tight text-[#1a1a1c] dark:text-[#f0f6fc] mt-1">
              Open-Source Vulnerability (OSV) Audit Findings
            </h3>
            <p className="text-xs font-mono-code text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 mt-1">
              Audited {summary.scannedDependenciesCount} direct & transitive dependencies against public CVE advisories.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onRescan && (
              <button
                onClick={onRescan}
                disabled={isRescanning}
                className="px-3.5 py-2 text-xs font-mono-code font-bold uppercase text-[#1a1a1c] dark:text-[#f0f6fc] bg-white dark:bg-[#161b22] hover:bg-[#f0f6fc] dark:hover:bg-[#21262d] border border-[#1a1a1c] dark:border-[#f0f6fc] transition-colors flex items-center gap-1.5 shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRescanning ? 'animate-spin' : ''}`} />
                <span>Rescan</span>
              </button>
            )}

            <button
              id="goto-remediation-btn"
              onClick={onProceedToRemediation}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-mono-code font-bold uppercase tracking-wider text-white bg-[#2ea043] hover:bg-[#2c9740] border border-[#1a1a1c] dark:border-[#f0f6fc] shadow-xs transition-opacity"
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
            className={`p-3.5 border-2 cursor-pointer transition-all ${
              selectedSeverity === 'ALL'
                ? 'bg-[#1a1a1c] text-white dark:bg-[#f0f6fc] dark:text-[#0f1117] border-[#1a1a1c] dark:border-[#f0f6fc]'
                : 'bg-[#f8f7f4] dark:bg-[#0f1117] text-[#1a1a1c] dark:text-[#f0f6fc] border-[#1a1a1c] dark:border-[#f0f6fc]'
            }`}
          >
            <div className="label-mono opacity-80">Total Findings</div>
            <div className="font-syne text-2xl font-extrabold mt-1">
              {summary.totalFindings}
            </div>
          </div>

          <div
            onClick={() => setSelectedSeverity('CRITICAL')}
            className={`p-3.5 border-2 cursor-pointer transition-all ${
              selectedSeverity === 'CRITICAL'
                ? 'bg-[#cf222e] text-white border-[#cf222e]'
                : 'bg-[#fff8f8] dark:bg-[#cf222e]/10 text-[#cf222e] border-[#cf222e]'
            }`}
          >
            <div className="label-mono text-current flex items-center gap-1">
              <AlertOctagon className="w-3 h-3" /> Critical
            </div>
            <div className="font-syne text-2xl font-extrabold mt-1">
              {summary.criticalCount}
            </div>
          </div>

          <div
            onClick={() => setSelectedSeverity('HIGH')}
            className={`p-3.5 border-2 cursor-pointer transition-all ${
              selectedSeverity === 'HIGH'
                ? 'bg-orange-600 text-white border-orange-600'
                : 'bg-orange-50 dark:bg-orange-500/10 text-orange-600 border-orange-500'
            }`}
          >
            <div className="label-mono text-current flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> High
            </div>
            <div className="font-syne text-2xl font-extrabold mt-1">
              {summary.highCount}
            </div>
          </div>

          <div
            onClick={() => setSelectedSeverity('MEDIUM')}
            className={`p-3.5 border-2 cursor-pointer transition-all ${
              selectedSeverity === 'MEDIUM'
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500'
            }`}
          >
            <div className="label-mono text-current flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Medium
            </div>
            <div className="font-syne text-2xl font-extrabold mt-1">
              {summary.mediumCount}
            </div>
          </div>

          <div
            onClick={() => setSelectedSeverity('LOW')}
            className={`p-3.5 border-2 cursor-pointer transition-all ${
              selectedSeverity === 'LOW'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500'
            }`}
          >
            <div className="label-mono text-current flex items-center gap-1">
              <Info className="w-3 h-3" /> Low
            </div>
            <div className="font-syne text-2xl font-extrabold mt-1">
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
              className="bg-white dark:bg-[#161b22] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] p-5 shadow-xs transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getSeverityBadge(vuln.severity)}

                    <span className="font-mono-code text-xs font-bold text-[#1a1a1c] dark:text-[#f0f6fc] bg-[#1a1a1c]/10 dark:bg-[#f0f6fc]/15 px-2 py-0.5 border border-[#1a1a1c]/20 dark:border-[#f0f6fc]/30">
                      {vuln.cveId}
                    </span>

                    <span className="text-xs font-mono-code font-semibold text-[#1a1a1c] dark:text-[#f0f6fc] flex items-center gap-1">
                      <Package className="w-3.5 h-3.5 text-[#2ea043]" />
                      <span>{vuln.packageName}</span>
                    </span>

                    {vuln.cvssScore && (
                      <span className="text-[10px] font-mono-code px-1.5 py-0.5 border border-[#1a1a1c]/30 dark:border-[#f0f6fc]/30 text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70">
                        CVSS: {vuln.cvssScore}
                      </span>
                    )}
                  </div>

                  <h4 className="font-syne text-base font-bold text-[#1a1a1c] dark:text-[#f0f6fc]">
                    {vuln.summary}
                  </h4>

                  {vuln.details && (
                    <p className="text-xs text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70 leading-relaxed line-clamp-2">
                      {vuln.details}
                    </p>
                  )}
                </div>

                {/* Current vs Recommended Fix Version Card */}
                <div className="p-3.5 bg-[#f8f7f4] dark:bg-[#0f1117] border-2 border-[#1a1a1c] dark:border-[#f0f6fc] flex flex-col justify-between shrink-0 min-w-52 text-xs font-mono-code">
                  <div className="flex items-center justify-between gap-3 text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70">
                    <span>Current Version:</span>
                    <span className="font-bold text-[#cf222e]">
                      {vuln.currentVersion}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-1.5 pt-1.5 border-t border-[#1a1a1c]/20 dark:border-[#f0f6fc]/20">
                    <span className="text-[#2ea043] font-bold">
                      Fix Target:
                    </span>
                    <span className="font-bold text-[#2ea043]">
                      ^{vuln.fixedVersion}
                    </span>
                  </div>

                  {vuln.references.length > 0 && (
                    <a
                      href={vuln.references[0].url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-2 text-[11px] text-[#2ea043] hover:underline flex items-center justify-end gap-1 font-bold"
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
