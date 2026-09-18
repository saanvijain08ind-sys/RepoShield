import React, { useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';

interface Preset {
  id: string;
  name: string;
  target: string;
}

interface SentinelSearchBarProps {
  onAnalyze: (target: string) => Promise<void> | void;
  isLoading: boolean;
  activeTarget?: string;
}

const DEMO_PRESETS: Preset[] = [
  { id: 'express', name: 'express', target: 'express' },
  { id: 'superprompt-cli', name: 'superprompt-cli', target: 'superprompt-cli' },
  { id: 'chalk', name: 'chalk', target: 'chalk' },
];

export const SentinelSearchBar: React.FC<SentinelSearchBarProps> = ({
  onAnalyze,
  isLoading,
  activeTarget,
}) => {
  const [inputVal, setInputVal] = useState(activeTarget || 'superprompt-cli');

  React.useEffect(() => {
    if (activeTarget && activeTarget !== inputVal) {
      setInputVal(activeTarget);
    }
  }, [activeTarget]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isLoading) return;
    onAnalyze(inputVal.trim());
  };

  const handleSelectPreset = (target: string) => {
    setInputVal(target);
    onAnalyze(target);
  };

  return (
    <div className="space-y-4">
      <div>
        <span className="label-mono">[ Section 01 ] // MISSION CONTROL</span>
        <h1 className="font-syne text-3xl sm:text-5xl font-extrabold uppercase leading-[0.95] tracking-tight mt-3 text-[#1a1a1c] dark:text-[#f0f6fc]">
          Protecting Open-Source <br />
          <span className="text-[#2ea043]">at Viral Moments</span>
        </h1>
        <p className="max-w-[620px] mt-4 text-xs sm:text-sm leading-relaxed text-[#1a1a1c]/70 dark:text-[#f0f6fc]/70">
          When hobby projects suddenly reach viral growth, vulnerabilities become supply chain emergencies.
          RepoShield tracks thresholds, audits OSV advisories, and drafts 1-click fix pull requests.
        </p>
      </div>

      {/* Input Group with 2px Ink Border */}
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row border-2 border-[#1a1a1c] dark:border-[#f0f6fc] bg-white dark:bg-[#161b22] shadow-xs">
        <input
          id="sentinel-target-input"
          type="text"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          placeholder="Repository URL or npm package (e.g. superprompt-cli, express)..."
          className="flex-1 p-3.5 sm:p-4 text-xs sm:text-sm font-mono-code bg-transparent border-none text-[#1a1a1c] dark:text-[#f0f6fc] placeholder-[#1a1a1c]/40 dark:placeholder-[#f0f6fc]/40 focus:outline-hidden"
          disabled={isLoading}
        />
        <button
          id="sentinel-analyze-submit-btn"
          type="submit"
          disabled={isLoading || !inputVal.trim()}
          className="bg-[#1a1a1c] dark:bg-[#f0f6fc] text-white dark:text-[#0f1117] px-5 sm:px-6 py-3.5 font-mono-code font-bold uppercase text-xs sm:text-xs tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>ANALYZING OSV...</span>
            </>
          ) : (
            <>
              <span>ANALYZE PROJECT MILESTONES</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Presets Pill Bar */}
      <div className="flex flex-wrap items-center gap-2 pt-0.5">
        <span className="label-mono text-[10px] text-[#1a1a1c]/60 dark:text-[#f0f6fc]/60">
          Presets:
        </span>
        {DEMO_PRESETS.map((preset) => {
          const isSelected = inputVal.toLowerCase().includes(preset.name.toLowerCase());
          return (
            <button
              key={preset.id}
              id={`preset-btn-${preset.id}`}
              type="button"
              onClick={() => handleSelectPreset(preset.target)}
              disabled={isLoading}
              className={`px-3 py-1 text-[11px] font-mono-code uppercase font-semibold rounded-full border transition-all ${
                isSelected
                  ? 'bg-[#1a1a1c] dark:bg-[#f0f6fc] text-white dark:text-[#0f1117] border-[#1a1a1c] dark:border-[#f0f6fc]'
                  : 'bg-white dark:bg-[#161b22] text-[#1a1a1c] dark:text-[#f0f6fc] border-[#1a1a1c] dark:border-[#f0f6fc] hover:bg-[#f0f6fc] dark:hover:bg-[#21262d]'
              }`}
            >
              {preset.name}
            </button>
          );
        })}
      </div>
    </div>
  );
};

