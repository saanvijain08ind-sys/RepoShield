import React from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, ShieldCheck, ShieldAlert, History } from 'lucide-react';
import { BeforeAfterComparison, WebsiteScanResult } from '../types/index.ts';

interface Props {
  comparison: BeforeAfterComparison;
  previousScan: WebsiteScanResult;
  currentScan: WebsiteScanResult;
}

export const BeforeAfterComparisonView: React.FC<Props> = ({
  comparison,
  previousScan,
  currentScan,
}) => {
  return (
    <div className="bg-[#f6f8fa] dark:bg-[#0d1117] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-4 space-y-3 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#d0d7de] dark:border-[#30363d] pb-2.5">
        <div>
          <h4 className="text-xs font-semibold text-[#1f2328] dark:text-[#f0f6fc] flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-[#0969da] dark:text-[#58a6ff]" />
            <span>Before & After Scan Differential</span>
          </h4>
          <p className="text-[11px] text-[#656d76] dark:text-[#8b949e]">
            Comparing scan from {new Date(previousScan.startedAt).toLocaleDateString()} with latest scan ({new Date(currentScan.startedAt).toLocaleDateString()})
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <div className="flex items-center gap-1">
            <span className="text-[#656d76] dark:text-[#8b949e] text-[11px]">Previous:</span>
            <span className="font-semibold text-xs text-[#24292f] dark:text-[#c9d1d9] bg-white dark:bg-[#21262d] px-2 py-0.5 rounded border border-[#d0d7de] dark:border-[#30363d]">
              {comparison.previousVerdict}
            </span>
          </div>
          <ArrowRight className="w-3 h-3 text-[#656d76] dark:text-[#8b949e]" />
          <div className="flex items-center gap-1">
            <span className="text-[#656d76] dark:text-[#8b949e] text-[11px]">Current:</span>
            <span className="font-semibold text-xs text-[#0969da] dark:text-[#58a6ff] bg-[#ddf4ff] dark:bg-[#0c2d6b]/30 px-2 py-0.5 rounded border border-[#54aeff]/40 dark:border-[#1f6feb]/40">
              {comparison.currentVerdict}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Resolved Findings */}
        <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#1a7f37] dark:text-[#3fb950] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Resolved Findings
            </span>
            <span className="text-xs font-bold text-[#1a7f37] dark:text-[#3fb950] bg-[#dafbe1] dark:bg-[#238636]/20 px-2 py-0.2 rounded-full border border-[#4ac26b]/40 dark:border-[#2ea043]/40">
              {comparison.resolvedFindings.length}
            </span>
          </div>
          {comparison.resolvedFindings.length === 0 ? (
            <p className="text-[11px] text-[#656d76] dark:text-[#8b949e] italic">No previously detected issues resolved.</p>
          ) : (
            <ul className="space-y-1 text-xs">
              {comparison.resolvedFindings.map((f) => (
                <li key={f.id} className="p-1.5 bg-[#dafbe1]/40 dark:bg-[#238636]/10 rounded border border-[#4ac26b]/30 dark:border-[#2ea043]/30 text-[#1a7f37] dark:text-[#3fb950]">
                  <span className="font-medium">{f.title}</span>
                  <span className="block text-[10px] text-[#57ab5a] dark:text-[#7ee787]">{f.category}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Persisting Findings */}
        <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#9a6700] dark:text-[#eac54f] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Persisting Findings
            </span>
            <span className="text-xs font-bold text-[#9a6700] dark:text-[#eac54f] bg-[#fff8c5] dark:bg-[#633c01]/30 px-2 py-0.2 rounded-full border border-[#d4a72c]/40 dark:border-[#d29922]/40">
              {comparison.persistingFindings.length}
            </span>
          </div>
          {comparison.persistingFindings.length === 0 ? (
            <p className="text-[11px] text-[#656d76] dark:text-[#8b949e] italic">No recurring issues between runs.</p>
          ) : (
            <ul className="space-y-1 text-xs">
              {comparison.persistingFindings.map((f) => (
                <li key={f.id} className="p-1.5 bg-[#fff8c5]/40 dark:bg-[#633c01]/15 rounded border border-[#d4a72c]/30 dark:border-[#d29922]/30 text-[#9a6700] dark:text-[#eac54f]">
                  <span className="font-medium">{f.title}</span>
                  <span className="block text-[10px] text-[#b08800] dark:text-[#e3b341]">{f.category} ({f.severity})</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Newly Detected Findings */}
        <div className="bg-white dark:bg-[#161b22] border border-[#d0d7de] dark:border-[#30363d] rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#cf222e] dark:text-[#ff7b72] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              New Findings
            </span>
            <span className="text-xs font-bold text-[#cf222e] dark:text-[#ff7b72] bg-[#ffebe9] dark:bg-[#490202]/40 px-2 py-0.2 rounded-full border border-[#ff8182]/40 dark:border-[#f85149]/40">
              {comparison.newFindings.length}
            </span>
          </div>
          {comparison.newFindings.length === 0 ? (
            <p className="text-[11px] text-[#656d76] dark:text-[#8b949e] italic">No new findings discovered in this run.</p>
          ) : (
            <ul className="space-y-1 text-xs">
              {comparison.newFindings.map((f) => (
                <li key={f.id} className="p-1.5 bg-[#ffebe9]/40 dark:bg-[#490202]/20 rounded border border-[#ff8182]/30 dark:border-[#f85149]/30 text-[#cf222e] dark:text-[#ff7b72]">
                  <span className="font-medium">{f.title}</span>
                  <span className="block text-[10px] text-[#da3633] dark:text-[#f85149]">{f.category} ({f.severity})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};
