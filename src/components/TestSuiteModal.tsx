import React, { useState, useEffect } from 'react';
import { X, Terminal, CheckCircle2, XCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { TestSuiteSummary } from '../../tests/testRunner.ts';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TestSuiteModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [results, setResults] = useState<TestSuiteSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/test/run');
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to execute test suite.');
      }
      setResults(data.results);
    } catch (err: any) {
      setError(err.message || 'Error executing tests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      runTests();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-slate-900 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-800 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-slate-950 border border-slate-800 text-emerald-400 flex items-center justify-center font-mono">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-100">SentinelOSS Automated Test Suite</h3>
              <p className="text-xs text-slate-400">
                Verifying milestone thresholds, blast radius calculations, OSV CVE scans, and 1-click fix generation
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-400">Test Execution Status:</span>
              {loading && <span className="text-xs text-indigo-400 font-medium animate-pulse">Running assertions...</span>}
              {results && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-800/60">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {results.passed}/{results.total} Passed ({results.durationMs}ms)
                </span>
              )}
            </div>

            <button
              onClick={runTests}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium text-slate-300 bg-slate-800 border border-slate-700 hover:bg-slate-700 rounded-md transition-colors shadow-2xs"
            >
              <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
              <span>Rerun Suite</span>
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-950/60 border border-red-800/80 rounded-lg text-xs text-red-300">
              {error}
            </div>
          )}

          {results && (
            <div className="space-y-2">
              {results.tests.map((test, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border text-xs flex items-start justify-between gap-3 ${
                    test.passed
                      ? 'bg-slate-950/40 border-slate-800'
                      : 'bg-red-950/50 border-red-800 text-red-200'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {test.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-100">{test.name}</span>
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                          {test.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">{test.message}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 shrink-0">
                    {test.durationMs}ms
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <span>Test suite uses clearly labeled, deterministic mock fixtures.</span>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 rounded-md transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
